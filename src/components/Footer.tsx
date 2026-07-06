import Link from "next/link";
import Image from "next/image";
import { getSiteName } from "@/lib/seo";

const footerLinks = {
  guides: [
    { href: "/blog", label: "All Guides" },
    { href: "/category/teen-patti-apks", label: "Teen Patti APKs" },
    { href: "/category/new-earning-games", label: "New Earning Games" },
  ],
  company: [
    { href: "/about-us", label: "About Us" },
    { href: "/who-we-are", label: "Who We Are" },
    { href: "/contact-us", label: "Contact Us" },
  ],
  legal: [
    { href: "/privacy-policy", label: "Privacy Policy" },
    { href: "/disclaimer", label: "Disclaimer" },
    { href: "/responsible-gaming", label: "Responsible Gaming" },
  ],
};

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-zinc-800/80 bg-zinc-900/50 text-zinc-300">
      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-6 sm:py-14">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2.5">
              <Image
                src="/favicon/favicon-96x96.png"
                alt={getSiteName()}
                width={40}
                height={40}
                className="rounded-lg"
              />
              <span className="text-lg font-bold text-white">{getSiteName()}</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-zinc-400">
              Pakistan&apos;s trusted source for Teen Patti APK downloads, earning guides,
              and verified game reviews.
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Guides
            </p>
            <ul className="mt-4 space-y-2.5 text-sm">
              {footerLinks.guides.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-emerald-400 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Company
            </p>
            <ul className="mt-4 space-y-2.5 text-sm">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-emerald-400 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Legal
            </p>
            <ul className="mt-4 space-y-2.5 text-sm">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-emerald-400 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-zinc-800 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-zinc-500">
            © {year} {getSiteName()}. All rights reserved.
          </p>
          <p className="text-xs text-zinc-600">
            18+ only · Play responsibly · Not affiliated with game developers
          </p>
        </div>
      </div>
    </footer>
  );
}
