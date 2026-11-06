import type { Metadata } from "next";
import Script from "next/script";
import localFont from "next/font/local";
import { AttributionTracker } from "@/components/AttributionTracker";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ConsentNotice } from "@/components/ConsentNotice";
import { ContactDock } from "@/components/ContactDock";
import { ExitIntentOffer } from "@/components/ExitIntentOffer";
import { MobileCtaBar } from "@/components/MobileCtaBar";
import { VoteProvider } from "@/components/VoteProvider";
import { Analytics } from "@/components/Analytics";
import { site } from "@/lib/site";
import "./globals.css";

// Self-hosted fonts (next/font/local): no build-time fetch from Google, so builds work anywhere.
// Readability first (Nov 3): Inter for everything people read, headings, prices and numbers included.
// It has clear, even digits ("$21,175" can't be misread) and tabular figures for price columns.
// One variable file covers every weight, so it is a single preload.
const sans = localFont({
  variable: "--font-body",
  display: "swap",
  fallback: ["system-ui", "Segoe UI", "Arial", "sans-serif"],
  adjustFontFallback: "Arial",
  src: [{ path: "./fonts/inter-latin-wght-normal.woff2", weight: "100 900", style: "normal" }],
});

// The serif is kept only for the logo wordmark, as a small brand touch. Never use it for body copy or numbers.
const brand = localFont({
  variable: "--font-logo",
  display: "swap",
  fallback: ["Georgia", "Times New Roman", "serif"],
  adjustFontFallback: "Times New Roman",
  src: [{ path: "./fonts/cormorant-garamond-latin-500-normal.woff2", weight: "500", style: "normal" }],
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
  twitter: { card: "summary_large_image" },
  // Search Console / Bing Webmaster / Pinterest Business ownership tags. Set the codes in Vercel env vars.
  verification: {
    google: process.env.NEXT_PUBLIC_GSC_VERIFICATION || undefined,
    other: {
      ...(process.env.NEXT_PUBLIC_BING_VERIFICATION && {
        "msvalidate.01": process.env.NEXT_PUBLIC_BING_VERIFICATION,
      }),
      ...(process.env.NEXT_PUBLIC_PINTEREST_VERIFICATION && {
        "p:domain_verify": process.env.NEXT_PUBLIC_PINTEREST_VERIFICATION,
      }),
    },
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
      logo: `${site.url}/brand/logo-512.png`,
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
    <html lang="en" suppressHydrationWarning className={`${sans.variable} ${brand.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <Script id="js-flag" strategy="beforeInteractive">
          {"document.documentElement.classList.add('js')"}
        </Script>
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
          <ExitIntentOffer />
          <ConsentNotice />
        </VoteProvider>
        <Analytics />
      </body>
    </html>
  );
}
