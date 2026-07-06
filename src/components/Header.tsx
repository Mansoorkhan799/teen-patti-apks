import Link from "next/link";
import Image from "next/image";
import MobileNav from "@/components/MobileNav";
import { getSiteName } from "@/lib/seo";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/blog", label: "Guides" },
  { href: "/about-us", label: "About" },
  { href: "/contact-us", label: "Contact" },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800/80 bg-zinc-900/95 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-5 sm:h-16 sm:px-6">
        <Link href="/" className="flex min-w-0 items-center gap-2.5">
          <Image
            src="/favicon/favicon-96x96.png"
            alt={getSiteName()}
            width={36}
            height={36}
            className="h-9 w-9 shrink-0 rounded-lg sm:h-9 sm:w-9"
          />
          <span className="truncate text-base font-bold tracking-tight text-white sm:text-lg md:text-xl">
            {getSiteName()}
          </span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-zinc-400 lg:flex lg:gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-emerald-400"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <MobileNav />
      </div>
    </header>
  );
}
