import type { Metadata } from "next";
import { Geist } from "next/font/google";
import JsonLd from "@/components/JsonLd";
import { buildSiteMetadata, getSiteDescription, getSiteTitle } from "@/lib/seo";
import { buildSiteGraph } from "@/lib/schema/builders";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = buildSiteMetadata(
  getSiteTitle(),
  getSiteDescription()
);

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} h-full antialiased`}>
      <body
        className={`${geistSans.className} min-h-full overflow-x-hidden flex flex-col bg-zinc-900 text-zinc-100`}
      >
        <JsonLd data={buildSiteGraph()} />
        {children}
      </body>
    </html>
  );
}
