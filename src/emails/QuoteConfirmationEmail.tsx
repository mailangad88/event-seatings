import { Body, Container, Head, Html, Img, Link, Preview, Section, Text } from "@react-email/components";
import { usd, type QuoteLine } from "@/lib/catalog-types";
import { rentalImage } from "@/data/rental-images";
import { site } from "@/lib/site";
import { brand } from "./Layout";

// The visual quote confirmation sent right after someone submits the quote form (src/lib/notify.ts,
// sendConfirmation). Table-based and inline-styled on purpose, so it renders consistently in Gmail,
// Outlook and Apple Mail, with a light dark-mode pass. Preview this at /admin/emails.

const dark = {
  bg: "#15130f",
  surface: "#201c16",
  ink: "#f3ede1",
  muted: "#b4a996",
  line: "#3a3327",
};

// One wide, people-free render (src/app/page.tsx uses the portrait version of the same set for the
// home hero) so the banner always shows an empty, just-set-up table, never a stock photo of guests.
const heroImage = {
  src: `${site.url}/images/scenes/three-looks-wide.webp`,
  alt: `Three Beyond Chiavari event looks: a gilded ivory chair, a midnight gold reception table and a blush garden wedding table, all set and empty`,
  width: 1200,
  height: 712,
};

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <table role="presentation" width="100%" cellPadding={0} cellSpacing={0} style={{ marginBottom: 12 }}>
      <tbody>
        <tr>
          <td width={32} valign="top" style={{ paddingTop: 1 }}>
            <table role="presentation" cellPadding={0} cellSpacing={0}>
              <tbody>
                <tr>
                  <td
                    width={26}
                    height={26}
                    align="center"
                    valign="middle"
                    style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: brand.brass, color: "#fff", fontSize: 12, fontWeight: 700, fontFamily: brand.sans }}
                  >
                    {n}
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
          <td valign="top" style={{ paddingLeft: 10, fontSize: 14, lineHeight: "20px", color: brand.ink, fontFamily: brand.sans }}>
            {children}
          </td>
        </tr>
      </tbody>
    </table>
  );
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <td style={{ verticalAlign: "top", padding: 4, width: "33.33%" }}>
      <div style={{ border: `1px solid ${brand.line}`, borderRadius: 10, padding: "10px 10px", backgroundColor: brand.paper, textAlign: "center" }}>
        <div style={{ fontSize: 10, letterSpacing: 1.2, textTransform: "uppercase", color: brand.muted }}>{label}</div>
        <div style={{ fontSize: 14, lineHeight: "18px", color: brand.ink, marginTop: 4, fontWeight: 700 }}>{value}</div>
      </div>
    </td>
  );
}

function ItemRow({ line, last }: { line: QuoteLine; last: boolean }) {
  const img = rentalImage(line.id)?.src;
  return (
    <tr>
      <td style={{ padding: "10px 0", borderTop: last ? undefined : undefined, borderBottom: `1px solid ${brand.line}` }}>
        <table role="presentation" width="100%" cellPadding={0} cellSpacing={0}>
          <tbody>
            <tr>
              <td width={52} valign="top">
                {img ? (
                  <Img
                    src={`${site.url}${img}`}
                    width={48}
                    height={48}
                    alt=""
                    style={{ width: 48, height: 48, borderRadius: 8, objectFit: "cover", border: `1px solid ${brand.line}`, display: "block" }}
                  />
                ) : (
                  <div style={{ width: 48, height: 48, borderRadius: 8, backgroundColor: brand.paper, border: `1px solid ${brand.line}` }} />
                )}
              </td>
              <td valign="top" style={{ paddingLeft: 12, fontSize: 13, lineHeight: "18px", color: brand.ink, fontFamily: brand.sans }}>
                <strong>{line.name}</strong>
                {line.variant ? ` (${line.variant})` : ""}
                <br />
                <span style={{ color: brand.muted }}>
                  {line.qty.toLocaleString()} × {usd(line.unit_price, 0)} {line.unit}
                </span>
              </td>
              <td valign="top" align="right" style={{ paddingLeft: 10, fontSize: 13, fontWeight: 700, color: brand.ink, fontFamily: brand.sans, whiteSpace: "nowrap" }}>
                {usd(line.line_total, 0)}
              </td>
            </tr>
          </tbody>
        </table>
      </td>
    </tr>
  );
}

export function QuoteConfirmationEmail({
  name,
  items,
  subtotal,
  eventDateLabel,
  guestCount,
  viewUrl,
  unsubscribe,
}: {
  name?: string;
  items: QuoteLine[];
  subtotal?: number;
  eventDateLabel?: string;
  guestCount?: number;
  viewUrl: string;
  unsubscribe?: string;
}) {
  const greetName = name?.trim().split(/\s+/)[0];
  const hi = greetName ? `Hi ${greetName},` : "Hi there,";
  const shown = items.slice(0, 12);
  const extra = items.length - shown.length;

  return (
    <Html lang="en">
      <Head>
        <meta name="color-scheme" content="light dark" />
        <meta name="supported-color-schemes" content="light dark" />
        <style>{`
          @media (prefers-color-scheme: dark) {
            .eq-bg { background-color: ${dark.bg} !important; }
            .eq-surface { background-color: ${dark.surface} !important; border-color: ${dark.line} !important; }
            .eq-ink { color: ${dark.ink} !important; }
            .eq-muted { color: ${dark.muted} !important; }
            .eq-border { border-color: ${dark.line} !important; }
            .eq-tile { background-color: ${dark.bg} !important; border-color: ${dark.line} !important; }
          }
          @media (max-width: 480px) {
            .eq-container { width: 100% !important; }
            .eq-pad { padding-left: 16px !important; padding-right: 16px !important; }
          }
        `}</style>
      </Head>
      <Preview>
        {`Thanks${greetName ? ` ${greetName}` : ""}, we have your quote request${eventDateLabel ? ` for ${eventDateLabel}` : ""}. Here's what happens next.`}
      </Preview>
      <Body className="eq-bg" style={{ backgroundColor: brand.paper, margin: 0, padding: "24px 0", fontFamily: brand.sans, color: brand.ink }}>
        <Container className="eq-container" style={{ maxWidth: 580, margin: "0 auto", padding: "0 16px" }}>
          <Section style={{ padding: "8px 0 18px", textAlign: "center" }}>
            <Link href={site.url} style={{ fontFamily: brand.serif, fontSize: 26, color: brand.ink, textDecoration: "none", letterSpacing: 0.5 }}>
              Beyond <span style={{ color: brand.brass, fontStyle: "italic" }}>Chiavari</span>
            </Link>
            <Text className="eq-muted" style={{ margin: "4px 0 0", fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: brand.muted }}>
              {site.tagline}
            </Text>
          </Section>

          <Section className="eq-surface" style={{ backgroundColor: brand.surface, border: `1px solid ${brand.line}`, borderRadius: 16, overflow: "hidden" }}>
            <Img
              src={heroImage.src}
              alt={heroImage.alt}
              width={580}
              height={344}
              style={{ width: "100%", height: "auto", display: "block" }}
            />
            <div className="eq-pad" style={{ padding: "24px 24px 20px" }}>
              <Text className="eq-ink" style={{ fontFamily: brand.serif, fontSize: 24, lineHeight: "30px", margin: "0 0 10px", color: brand.ink }}>
                We&apos;ve got your quote request
              </Text>
              <Text className="eq-ink" style={{ fontSize: 15, lineHeight: "24px", margin: "0 0 16px", color: brand.ink }}>
                {hi} thanks for sending over your event rental list. We&apos;re checking your date and every item now.
              </Text>

              <table role="presentation" width="100%" cellPadding={0} cellSpacing={0} style={{ marginBottom: 20 }}>
                <tbody>
                  <tr>
                    <StatTile label="Event date" value={eventDateLabel ?? "TBD"} />
                    <StatTile label="Guests" value={guestCount ? guestCount.toLocaleString() : "TBD"} />
                    <StatTile label="Estimate" value={subtotal ? usd(subtotal, 0) : "—"} />
                  </tr>
                </tbody>
              </table>

              {shown.length > 0 && (
                <>
                  <Text className="eq-muted" style={{ fontSize: 11, letterSpacing: 1.6, textTransform: "uppercase", color: brand.muted, fontWeight: 700, margin: "0 0 8px" }}>
                    Your list
                  </Text>
                  <table role="presentation" width="100%" cellPadding={0} cellSpacing={0} style={{ marginBottom: 8 }}>
                    <tbody>
                      {shown.map((line, i) => (
                        <ItemRow key={`${line.id}-${i}`} line={line} last={i === shown.length - 1} />
                      ))}
                    </tbody>
                  </table>
                  {extra > 0 && (
                    <Text className="eq-muted" style={{ fontSize: 12, color: brand.muted, margin: "0 0 10px" }}>
                      + {extra} more item{extra === 1 ? "" : "s"} on your list
                    </Text>
                  )}
                  {subtotal != null && (
                    <Text className="eq-muted" style={{ fontSize: 12, color: brand.muted, margin: "0 0 20px" }}>
                      Rentals: {usd(subtotal, 0)}, before delivery, setup, damage waiver and tax. Nothing is charged yet.
                    </Text>
                  )}
                </>
              )}

              <Text className="eq-muted" style={{ fontSize: 11, letterSpacing: 1.6, textTransform: "uppercase", color: brand.muted, fontWeight: 700, margin: "0 0 10px" }}>
                What happens next
              </Text>
              <Step n={1}>We check your date and every item on your list.</Step>
              <Step n={2}>You get one itemized proposal by email, usually within one business day.</Step>
              <Step n={3}>Nothing is charged or held until you approve it.</Step>

              <table role="presentation" cellPadding={0} cellSpacing={0} style={{ margin: "16px 0" }}>
                <tbody>
                  <tr>
                    <td style={{ borderRadius: 999, backgroundColor: brand.ink }}>
                      <Link
                        href={viewUrl}
                        style={{ display: "inline-block", padding: "13px 26px", fontSize: 14, fontWeight: 700, color: brand.paper, textDecoration: "none", fontFamily: brand.sans }}
                      >
                        View your quote
                      </Link>
                    </td>
                  </tr>
                </tbody>
              </table>

              <Text className="eq-ink" style={{ fontSize: 14, lineHeight: "22px", margin: "4px 0 0", color: brand.ink }}>
                Want to talk it through sooner? Just reply to this email, or call/text{" "}
                <Link href={`tel:${site.phone.replace(/[^\d+]/g, "")}`} style={{ color: brand.brass }}>
                  {site.phone}
                </Link>
                .
              </Text>
            </div>
          </Section>

          <Text className="eq-muted" style={{ fontSize: 12, lineHeight: "18px", color: brand.muted, textAlign: "center", margin: "20px 0 0" }}>
            {site.name} · Chicago &amp; suburbs ·{" "}
            <Link href={site.url} style={{ color: brand.muted }}>
              {site.domain}
            </Link>
            {unsubscribe ? (
              <>
                <br />
                You&apos;re getting this because you contacted {site.name}.{" "}
                <Link href={unsubscribe} style={{ color: brand.muted }}>
                  Unsubscribe
                </Link>
              </>
            ) : null}
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
