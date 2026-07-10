import { fixContentUrls } from "@/lib/wordpress";
import {
  stripLeadingExcerptDuplicate,
  stripLeadingH1,
} from "@/lib/schema/parse-content";

interface WordPressContentProps {
  html: string;
  className?: string;
  /** Skip first H1 when title is rendered in the post hero banner */
  skipLeadingH1?: boolean;
  /** Hero excerpt — strips the matching first body paragraph to avoid duplicates */
  excerpt?: string;
}

/**
 * Renders WordPress/Kadence block HTML exactly as stored in the CMS.
 * Headings (H1–H6), images, lists, and block structure are never modified.
 */
export default function WordPressContent({
  html,
  className = "",
  skipLeadingH1: shouldSkipH1 = false,
  excerpt,
}: WordPressContentProps) {
  let content = fixContentUrls(html);
  if (shouldSkipH1) content = stripLeadingH1(content);
  if (excerpt) content = stripLeadingExcerptDuplicate(content, excerpt);

  return (
    <div
      className={`wp-content entry-content ${className}`}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
