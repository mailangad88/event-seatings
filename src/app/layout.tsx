import type { Metadata } from "next";
import Script from "next/script";
import localFont from "next/font/local";
import { AttributionTracker } from "@/components/AttributionTracker";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ContactDock } from "@/components/ContactDock";
import { MobileCtaBar } from "@/components/MobileCtaBar";
import { VoteProvider } from "@/components/VoteProvider";
import { Analytics } from "@/components/Analytics";
import { site } from "@/lib/site";
import "./globals.css";

// Self-hosted fonts (next/font/local): no build-time fetch from Google, so builds work anywhere.
const display = localFont({
  variable: "--font-display",
  display: "swap",
  src: [
    { path: "./fonts/cormorant-garamond-latin-300-normal.woff2", weight: "300", style: "normal" },
    { path: "./fonts/cormorant-garamond-latin-300-italic.woff2", weight: "300", style: "italic" },
    { path: "./fonts/cormorant-garamond-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "./fonts/cormorant-garamond-latin-400-italic.woff2", weight: "400", style: "italic" },
    { path: "./fonts/cormorant-garamond-latin-500-normal.woff2", weight: "500", style: "normal" },
    { path: "./fonts/cormorant-garamond-latin-500-italic.woff2", weight: "500", style: "italic" },
  ],
});

const body = localFont({
  variable: "--font-body",
  display: "swap",
  src: [
    { path: "./fonts/jost-latin-300-normal.woff2", weight: "300", style: "normal" },
    { path: "./fonts/jost-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "./fonts/jost-latin-500-normal.woff2", weight: "500", style: "normal" },
  ],
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `Event Rentals ${site.market}: Chairs, Tables, Linens & Tents | ${site.name}`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  alternates: { canonical: "/" },
  keywords: [
    "event rentals Chicago",
    "party rentals Chicago",
    "chair and table rental Chicago",
    "chair rental Chicago",
    "event chair rentals Chicago",
    "wedding chair rental Chicago",
    "Chiavari chair alternatives",
    "cross-back chair rental",
    "ghost chair rental",
    "corporate event seating Chicago",
  ],
  openGraph: {
    siteName: site.name,
    type: "website",
    locale: "en_US",
  },
  // Search Console / Bing Webmaster ownership tags. Set the codes in Vercel env vars.
  verification: {
    google: process.env.NEXT_PUBLIC_GSC_VERIFICATION || undefined,
    other: process.env.NEXT_PUBLIC_BING_VERIFICATION
      ? { "msvalidate.01": process.env.NEXT_PUBLIC_BING_VERIFICATION }
      : undefined,
  },
};

const localBusiness = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "LocalBusiness",
      "@id": `${site.url}/#business`,
      name: site.name,
      alternateName: site.domain,
      slogan: site.tagline,
      description: site.description,
      url: site.url,
      email: site.email,
      ...(site.phone && { telephone: site.phone }),
      logo: `${site.url}/icon`,
      image: `${site.url}/opengraph-image`,
      priceRange: "$$",
      address: { "@type": "PostalAddress", addressLocality: site.locality, addressRegion: site.region, addressCountry: "US" },
      areaServed: [
        { "@type": "City", name: "Chicago", sameAs: "https://en.wikipedia.org/wiki/Chicago" },
        { "@type": "AdministrativeArea", name: "Chicago metropolitan area" },
        ...site.serviceArea.filter((c) => c !== "Chicago").map((name) => ({ "@type": "City", name: `${name}, IL` })),
      ],
      knowsAbout: [
        "Event chair rental",
        "Wedding chair rental",
        "Chiavari chair alternatives",
        "Corporate event seating",
        "Ceremony and reception seating layouts",
      ],
      sameAs: [site.instagram, site.pinterest],
      potentialAction: {
        "@type": "ReserveAction",
        name: `Book a free ${site.callLength} seating call`,
        target: `${site.url}/book`,
      },
    },
    {
      "@type": "WebSite",
      "@id": `${site.url}/#website`,
      name: site.name,
      url: site.url,
      publisher: { "@id": `${site.url}/#business` },
      inLanguage: "en-US",
    },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" suppressHydrationWarning className={`${display.variable} ${body.variable} h-full antialiased`}>
      <Script id="js-flag" strategy="beforeInteractive">
        {"document.documentElement.classList.add('js')"}
      </Script>
      <body className="flex min-h-full flex-col font-sans">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusiness).replace(/</g, "\\u003c") }}
        />
        <AttributionTracker />
        <VoteProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <MobileCtaBar />
          <ContactDock />
        </VoteProvider>
        <Analytics />
      </body>
    </html>
  );
}
