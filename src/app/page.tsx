import Link from "next/link";
import SiteLayout from "@/components/SiteLayout";
import PostColumn from "@/components/PostColumn";
import SiteInfoTable from "@/components/SiteInfoTable";
import { getCategoryBySlug, getPostsByCategory } from "@/lib/wordpress";

export const revalidate = 3600;

const features = [
  {
    title: "Verified APK Guides",
    description:
      "Every guide is tested and updated with the latest app versions, download links, and install steps for Android devices in Pakistan.",
    icon: "🛡️",
  },
  {
    title: "Step-by-Step Tutorials",
    description:
      "Clear H1-to-conclusion articles with screenshots, FAQs, and structured steps so you never get stuck during setup.",
    icon: "📋",
  },
  {
    title: "Pakistan Payment Methods",
    description:
      "We cover JazzCash, Easypaisa, and local withdrawal options so you know exactly how payouts work before you play.",
    icon: "💳",
  },
  {
    title: "SEO-Optimised & Honest",
    description:
      "No fake promises. We explain risks, earning limits, and app policies so you can make informed decisions.",
    icon: "✓",
  },
];

const stats = [
  { value: "100%", label: "Free guides" },
  { value: "PK", label: "Pakistan focused" },
  { value: "24/7", label: "Updated content" },
];

export default async function HomePage() {
  let teenPattiPosts: Awaited<ReturnType<typeof getPostsByCategory>> = [];
  let earningGamesPosts: Awaited<ReturnType<typeof getPostsByCategory>> = [];
  let wpConnected = true;

  try {
    const [teenPattiCategory, earningGamesCategory] = await Promise.all([
      getCategoryBySlug("teen-patti-apks"),
      getCategoryBySlug("new-earning-games"),
    ]);

    const [teenPatti, earningGames] = await Promise.all([
      teenPattiCategory
        ? getPostsByCategory(teenPattiCategory.id)
        : Promise.resolve([]),
      earningGamesCategory
        ? getPostsByCategory(earningGamesCategory.id)
        : Promise.resolve([]),
    ]);

    teenPattiPosts = teenPatti.slice(0, 6);
    earningGamesPosts = earningGames.slice(0, 6);
  } catch {
    wpConnected = false;
  }

  return (
    <SiteLayout>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-zinc-800/80 py-10 sm:py-14 md:py-20">
        <div className="relative mx-auto max-w-6xl px-5 sm:px-6">
          <div className="grid items-start gap-8 md:gap-10 lg:grid-cols-2 lg:gap-12">
            <div className="min-w-0">
              <h1 className="text-[1.625rem] font-bold leading-[1.25] tracking-tight text-white sm:text-3xl md:text-4xl lg:text-[2.75rem] lg:leading-tight">
                Download and Play New{" "}
                <span className="text-emerald-400">Pakistani Earning Games 2026</span>
              </h1>
              <p className="mt-4 text-base leading-relaxed text-zinc-400 sm:mt-5 sm:text-lg">
                Trusted APK downloads, in-depth earning guides, and honest reviews
                for Teen Patti apps — built for players in Pakistan.
              </p>
              <p className="mt-4 text-sm leading-relaxed text-zinc-500 sm:mt-5 sm:text-base">
                Teen Patti has become one of Pakistan&apos;s most popular mobile card games,
                with millions of players downloading APKs to play and earn through JazzCash
                and Easypaisa. As the market grows, players need trusted guides to find
                safe apps, understand withdrawal rules, and unlock real earning potential
                — without falling for scams or outdated downloads.
              </p>
              <div className="mt-6 grid grid-cols-3 gap-3 sm:mt-8 sm:flex sm:flex-wrap sm:gap-8">
                {stats.map((stat) => (
                  <div key={stat.label} className="text-center sm:text-left">
                    <p className="text-xl font-bold text-white sm:text-2xl">{stat.value}</p>
                    <p className="mt-0.5 text-xs text-zinc-500 sm:text-sm">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:pt-1">
              <SiteInfoTable />
            </div>
          </div>
        </div>
      </section>

      {/* Posts — two columns */}
      <section className="border-b border-zinc-800/80 py-10 sm:py-14 md:py-20">
        <div className="mx-auto max-w-6xl px-5 sm:px-6">
          {!wpConnected ? (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-6 text-amber-200">
              <p className="font-semibold">Guides loading soon</p>
              <p className="mt-2 text-sm text-amber-200/80">
                New articles are published regularly. Check back shortly.
              </p>
            </div>
          ) : (
            <div className="grid gap-10 md:grid-cols-2 md:gap-8 lg:gap-10">
              <PostColumn
                title="Teen Patti APKs"
                description="Fresh APK downloads, earning tips, and game reviews"
                categorySlug="teen-patti-apks"
                posts={teenPattiPosts}
              />
              <PostColumn
                title="New Earning Games"
                description="Latest Pakistani earning apps and play-to-earn guides"
                categorySlug="new-earning-games"
                posts={earningGamesPosts}
              />
            </div>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="border-b border-zinc-800/80 py-10 sm:py-14 md:py-20">
        <div className="mx-auto max-w-6xl px-5 sm:px-6">
          <div className="text-center">
            <h2 className="text-xl font-bold text-white sm:text-2xl md:text-3xl">
              Why Players Trust Us
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-zinc-400">
              We publish detailed, searchable guides — not spam. Every article is
              structured for clarity from download to withdrawal.
            </p>
          </div>
          <div className="mt-8 grid gap-4 sm:mt-12 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-2xl border border-zinc-800 bg-zinc-800/30 p-5 sm:p-6 transition hover:border-emerald-500/30 hover:bg-zinc-800/50"
              >
                <span className="text-2xl" role="img" aria-hidden="true">
                  {feature.icon}
                </span>
                <h3 className="mt-4 font-semibold text-white">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who We Are */}
      <section className="border-b border-zinc-800/80 py-10 sm:py-14 md:py-20">
        <div className="mx-auto max-w-6xl px-5 sm:px-6">
          <div className="grid items-start gap-8 md:grid-cols-2 md:gap-10">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-emerald-400">
                Who We Are
              </p>
              <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">
                An Independent Guide for Pakistani Players
              </h2>
              <p className="mt-4 leading-relaxed text-zinc-400">
                Teen Patti APKs is an editorial website dedicated to helping
                players in Pakistan find safe APK downloads, understand earning
                mechanics, and avoid scams. We research apps, test withdrawal
                methods, and publish transparent guides — free of charge.
              </p>
              <p className="mt-4 leading-relaxed text-zinc-400">
                We are not a gambling operator. We do not host games or process
                payments. Our role is to inform and educate so you can play
                responsibly on your own terms.
              </p>
              <Link
                href="/who-we-are"
                className="mt-6 inline-flex items-center text-sm font-semibold text-emerald-400 hover:text-emerald-300"
              >
                Learn more about us →
              </Link>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-800/30 p-5 sm:p-8">
              <h3 className="font-semibold text-white">Our Commitment</h3>
              <ul className="mt-4 space-y-3 text-sm text-zinc-400">
                <li className="flex gap-3">
                  <span className="text-emerald-400">✓</span>
                  Honest reviews — pros and cons included
                </li>
                <li className="flex gap-3">
                  <span className="text-emerald-400">✓</span>
                  Regular updates when apps change policies
                </li>
                <li className="flex gap-3">
                  <span className="text-emerald-400">✓</span>
                  Responsible gaming resources for all readers
                </li>
                <li className="flex gap-3">
                  <span className="text-emerald-400">✓</span>
                  Clear disclaimers on every guide
                </li>
              </ul>
              <Link
                href="/responsible-gaming"
                className="mt-6 block rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-center text-sm font-medium text-emerald-400 hover:bg-emerald-500/20"
              >
                Read our Responsible Gaming policy
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-zinc-800/80 py-10 sm:py-14 md:py-16">
        <div className="mx-auto max-w-6xl px-5 text-center sm:px-6">
          <h2 className="text-xl font-bold text-white sm:text-2xl md:text-3xl">
            Have a Question or Suggestion?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-zinc-400">
            We welcome feedback, correction requests, and app review suggestions
            from our readers in Pakistan.
          </p>
          <Link
            href="/contact-us"
            className="mt-8 inline-flex rounded-xl bg-emerald-500 px-8 py-3 text-sm font-semibold text-white transition hover:bg-emerald-400"
          >
            Contact Us
          </Link>
        </div>
      </section>
    </SiteLayout>
  );
}
