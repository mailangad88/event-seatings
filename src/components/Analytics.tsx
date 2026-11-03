"use client";

import Script from "next/script";
import { useEffect, useState } from "react";
import { useReportWebVitals } from "next/web-vitals";
import { GA_ID, track } from "@/lib/analytics";
import { consentEvent, trackingAllowed } from "@/lib/consent";

// Booking-tool hosts. Any link to these counts as a "book a call" click.
const BOOKING_HOSTS = /(calendly\.com|cal\.com|tidycal\.com|savvycal\.com|hubspot\.com\/meetings|zcal\.co)/i;

export function Analytics() {
  // Google Analytics loads only while the visitor hasn't said no in the privacy notice (components/ConsentNotice.tsx).
  const [allowed, setAllowed] = useState(false);
  useEffect(() => {
    const update = () => setAllowed(trackingAllowed());
    update();
    window.addEventListener(consentEvent, update);
    return () => window.removeEventListener(consentEvent, update);
  }, []);

  useEffect(() => {
    if (!GA_ID) return;

    // One delegated listener tracks every contact/booking click site-wide,
    // including links added later by other pages, without touching each link.
    function onClick(e: MouseEvent) {
      const el = (e.target as Element | null)?.closest<HTMLElement>("a[href], [data-track]");
      if (!el) return;
      const href = el.getAttribute("href") ?? "";
      const label = (el.dataset.trackLabel ?? el.textContent ?? "").trim().slice(0, 80);
      const page = window.location.pathname;
      if (el.dataset.track === "book_call" || BOOKING_HOSTS.test(href)) {
        track("book_call_click", { link_url: href, link_text: label, page });
      } else if (href.startsWith("tel:")) {
        track("phone_click", { link_text: label, page });
      } else if (href.startsWith("mailto:")) {
        track("email_click", { link_text: label, page });
      } else if (href.startsWith("/quote")) {
        track("quote_cta_click", { link_text: label, page });
      } else if (el.dataset.track) {
        track(el.dataset.track, { link_text: label, page });
      }
    }
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);

  // Core Web Vitals per page, so ranking-relevant speed issues show up next to traffic.
  useReportWebVitals((m) => {
    track(m.name, {
      value: Math.round(m.name === "CLS" ? m.value * 1000 : m.value),
      metric_id: m.id,
      metric_rating: (m as { rating?: string }).rating,
      non_interaction: true,
    });
  });

  if (!GA_ID || !allowed) return null;
  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
      <Script id="ga4-init" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;gtag('js',new Date());gtag('config','${GA_ID}');`}
      </Script>
    </>
  );
}
