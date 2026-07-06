import type { Metadata } from "next";
import Link from "next/link";
import SiteLayout from "@/components/SiteLayout";
import Breadcrumbs from "@/components/Breadcrumbs";
import { buildSiteMetadata, getSiteName } from "@/lib/seo";

export const metadata: Metadata = buildSiteMetadata(
  "Contact Us",
  "Get in touch with Teen Patti APKs. Send us feedback, corrections, or app review requests.",
  "/contact-us"
);

const contactEmail = "teenpattiapks.site@gmail.com";

export default function ContactUsPage() {
  return (
    <SiteLayout>
      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-6 sm:py-12">
        <Breadcrumbs
          items={[
            { label: getSiteName(), href: "/" },
            { label: "Contact Us" },
          ]}
        />

        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Contact Us
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-zinc-400">
              We read every message. Whether you have a correction, a new app
              suggestion, or a partnership inquiry — we&apos;d love to hear from you.
            </p>

            <div className="mt-10 space-y-6">
              <div className="rounded-2xl border border-zinc-800 bg-zinc-800/30 p-6">
                <p className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
                  Email
                </p>
                <a
                  href={`mailto:${contactEmail}`}
                  className="mt-2 block text-lg font-medium text-emerald-400 hover:text-emerald-300"
                >
                  {contactEmail}
                </a>
              </div>

              <div className="rounded-2xl border border-zinc-800 bg-zinc-800/20 p-6">
                <p className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
                  Response Time
                </p>
                <p className="mt-2 text-zinc-400">
                  We typically respond within 2–3 business days.
                </p>
              </div>

              <div className="rounded-2xl border border-zinc-800 bg-zinc-800/20 p-6">
                <p className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
                  What to Include
                </p>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-zinc-400">
                  <li>App name and issue you encountered</li>
                  <li>Link to the guide (if applicable)</li>
                  <li>Screenshots if reporting outdated info</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-800/30 p-8">
            <h2 className="text-lg font-semibold text-white">Send a Message</h2>
            <p className="mt-2 text-sm text-zinc-400">
              Click below to open your email client with a pre-filled subject line.
            </p>
            <a
              href={`mailto:${contactEmail}?subject=Teen%20Patti%20APKs%20-%20Website%20Inquiry`}
              className="mt-6 flex w-full items-center justify-center rounded-xl bg-emerald-500 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-emerald-400"
            >
              Email Us
            </a>
            <p className="mt-6 text-xs leading-relaxed text-zinc-400">
              We do not provide app support, account recovery, or withdrawal
              assistance for third-party games. For app-specific issues, contact
              the developer directly.
            </p>
            <div className="mt-8 border-t border-zinc-800 pt-6">
              <p className="text-sm text-zinc-500">Before contacting us, you may find answers in:</p>
              <ul className="mt-3 space-y-2 text-sm">
                <li>
                  <Link href="/disclaimer" className="text-emerald-400 hover:underline">
                    Disclaimer
                  </Link>
                </li>
                <li>
                  <Link href="/responsible-gaming" className="text-emerald-400 hover:underline">
                    Responsible Gaming
                  </Link>
                </li>
                <li>
                  <Link href="/privacy-policy" className="text-emerald-400 hover:underline">
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
