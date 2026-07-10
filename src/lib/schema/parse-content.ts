import * as cheerio from "cheerio";
import type { Element } from "domhandler";
import { FAQ_HEADING_PATTERN, STEP_HEADING_PATTERN } from "./constants";

export interface ParsedHowToStep {
  name: string;
  text: string;
  image?: string;
}

export interface ParsedFaqItem {
  question: string;
  answer: string;
}

function cleanText(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

/** Remove the first H1 from HTML when title is shown separately in the post hero. */
export function stripLeadingH1(html: string): string {
  const $ = cheerio.load(html, null, false);
  const firstH1 = $("h1").first();
  if (firstH1.length) firstH1.remove();
  return $.html();
}

function normalizeIntroText(text: string): string {
  return cleanText(
    text
      .replace(/&#8230;|&hellip;|…|\.{2,}$/g, "")
      .replace(/&nbsp;/g, " ")
      .toLowerCase()
  );
}

/**
 * Remove the first paragraph when it duplicates the hero excerpt
 * (WordPress auto-excerpts are usually the truncated first paragraph).
 */
export function stripLeadingExcerptDuplicate(
  html: string,
  excerpt: string
): string {
  const normalizedExcerpt = normalizeIntroText(excerpt);
  if (normalizedExcerpt.length < 40) return html;

  const $ = cheerio.load(html, null, false);
  const firstP = $("p").first();
  if (!firstP.length) return html;

  const paraText = normalizeIntroText(firstP.text());
  if (!paraText) return html;

  const excerptPrefix = normalizedExcerpt.slice(0, 80);
  const paraPrefix = paraText.slice(0, 80);

  if (
    paraText.startsWith(excerptPrefix) ||
    normalizedExcerpt.startsWith(paraPrefix)
  ) {
    firstP.remove();
  }

  return $.html();
}

function extractImageFromNodes(
  $: cheerio.CheerioAPI,
  nodes: Element[]
): string | undefined {
  for (const node of nodes) {
    const img = $(node).find("img").first();
    const src = img.attr("src");
    if (src) return src;
  }
  return undefined;
}

function collectNodesUntilNextStep(
  $: cheerio.CheerioAPI,
  startEl: Element
): Element[] {
  const collected: Element[] = [];
  let sibling = $(startEl).next().get(0);

  while (sibling) {
    const tagName = sibling.tagName?.toLowerCase();
    if (tagName === "h2" || tagName === "h3") {
      const headingText = $(sibling).text().trim();
      if (STEP_HEADING_PATTERN.test(headingText)) break;
      if (FAQ_HEADING_PATTERN.test(headingText)) break;
    }
    collected.push(sibling);
    sibling = $(sibling).next().get(0);
  }

  return collected;
}

/** Extract HowTo steps from Kadence/WordPress HTML (H2/H3 step headings or ordered lists). */
export function extractHowToSteps(html: string): ParsedHowToStep[] {
  const $ = cheerio.load(html);
  const steps: ParsedHowToStep[] = [];

  $("h2, h3").each((_, el) => {
    const name = cleanText($(el).text());
    if (!STEP_HEADING_PATTERN.test(name)) return;

    const contentNodes = collectNodesUntilNextStep($, el);
    const text = cleanText(
      contentNodes
        .map((node) => $(node).text())
        .join(" ")
        .slice(0, 500)
    );

    if (!text) return;

    steps.push({
      name,
      text,
      image: extractImageFromNodes($, contentNodes),
    });
  });

  if (steps.length >= 2) return steps;

  $("ol").each((_, ol) => {
    const listSteps: ParsedHowToStep[] = [];

    $(ol)
      .find("> li")
      .each((__, li) => {
        const text = cleanText($(li).text());
        if (text.length < 20) return;

        const firstStrong = $(li).find("strong, b").first().text().trim();
        const name = firstStrong || `Step ${listSteps.length + 1}`;
        const image = $(li).find("img").first().attr("src");

        listSteps.push({
          name: cleanText(name),
          text,
          ...(image && { image }),
        });
      });

    if (listSteps.length >= 2) {
      steps.push(...listSteps);
      return false;
    }
  });

  return steps.length >= 2 ? steps : [];
}

/** Extract FAQ items from Kadence accordion, Rank Math FAQ blocks, or FAQ heading sections. */
export function extractFaqItems(html: string): ParsedFaqItem[] {
  const $ = cheerio.load(html);
  const items: ParsedFaqItem[] = [];

  $(
    ".wp-block-kadence-accordion .kt-blocks-accordion-header, .wp-block-kadence-accordion .kt-accordion-title, .kb-accordion-header"
  ).each((_, header) => {
    const question = cleanText($(header).text());
    const panel =
      $(header).closest(".kt-accordion-inner-wrap").find(".kt-accordion-panel-inner").first() ||
      $(header).next(".kt-accordion-panel, .accordion-panel");

    const answer = cleanText(panel.text());
    if (question && answer.length > 10) {
      items.push({ question, answer });
    }
  });

  if (items.length > 0) return items;

  $(".rank-math-faq-item, .wp-block-rank-math-faq-block .rank-math-faq-item").each(
    (_, item) => {
      const question = cleanText(
        $(item).find(".rank-math-question, .rank-math-faq-question").text()
      );
      const answer = cleanText(
        $(item).find(".rank-math-answer, .rank-math-faq-answer").text()
      );
      if (question && answer) items.push({ question, answer });
    }
  );

  if (items.length > 0) return items;

  $("h2, h3").each((_, el) => {
    const heading = cleanText($(el).text());
    if (!FAQ_HEADING_PATTERN.test(heading)) return;

    let sibling = $(el).next().get(0);
    while (sibling) {
      const tag = sibling.tagName?.toLowerCase();
      if (tag === "h2") break;

      if (tag === "h3" || tag === "h4") {
        const question = cleanText($(sibling).text());
        const answerParts: string[] = [];
        let answerNode = $(sibling).next().get(0);

        while (answerNode) {
          const answerTag = answerNode.tagName?.toLowerCase();
          if (answerTag === "h2" || answerTag === "h3" || answerTag === "h4") break;
          answerParts.push($(answerNode).text());
          answerNode = $(answerNode).next().get(0);
        }

        const answer = cleanText(answerParts.join(" "));
        if (question && answer.length > 10) {
          items.push({ question, answer });
        }
      }

      sibling = $(sibling).next().get(0);
    }
  });

  return items;
}

/** Estimate total time from content mentions like "5 minutes" or "1 hour". */
export function extractTotalTime(html: string): string | undefined {
  const match = html.match(
    /\b(\d+)\s*(minute|minutes|min|hour|hours|hr)\b/i
  );
  if (!match) return undefined;

  const value = parseInt(match[1], 10);
  const unit = match[2].toLowerCase();

  if (unit.startsWith("hour") || unit === "hr") {
    return `PT${value}H`;
  }
  return `PT${value}M`;
}
