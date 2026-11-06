import { Body, Container, Head, Html, Img, Link, Preview, Section, Text } from "@react-email/components";
import { rentalImage } from "@/data/rental-images";
import { site } from "@/lib/site";
import { brand } from "./Layout";

// Sent once, 20 hours to 7 days after someone builds a rental list on /quote and doesn't send it
// (src/lib/reminders.ts, "unfinished_quote"). Same visual language as the quote confirmation email
// (src/emails/QuoteConfirmationEmail.tsx): hero image, itemized thumbnails, a single CTA. No vendor
// names or pricing breakdown here, since we don't yet know the exact quantities they left with.

const dark = {
  bg: "#15130f",
  surface: "#201c16",
  ink: "#f3ede1",
  muted: "#b4a996",
  line: "#3a3327",
};

const heroImage = {
  src: `${site.url}/images/scenes/three-looks-wide.webp`,
  alt: `Three Beyond Chiavari event looks: a gilded ivory chair, a midnight gold reception table and a blush garden wedding table, all set and empty`,
  width: 1200,
  height: 712,
};

function ItemTile({ id, name }: { id: string; name: string }) {
  const img = rentalImage(id)?.src;
  return (
    <td width={64} style={{ paddingRight: 10, paddingBottom: 10 }}>
      {img ? (
        <Img
          src={`${site.url}${img}`}
          width={56}
          height={56}
          alt=""
          title={name}
          style={{ width: 56, height: 56, borderRadius: 10, objectFit: "cover", border: `1px solid ${brand.line}`, display: "block" }}
        />
      ) : (
        <div
          title={name}
          style={{ width: 56, height: 56, borderRadius: 10, backgroundColor: brand.paper, border: `1px solid ${brand.line}` }}
        />
      )}
    </td>
  );
}

export function UnfinishedQuoteEmail({
  name,
  items,
  link,
  offerLine,
  unsubscribe,
}: {
  name?: string;
  items: { id: string; name: string }[];
  link: string;
  offerLine?: string;
  unsubscribe?: string;
}) {
  const greetName = name?.trim().split(/\s+/)[0];
  const hi = greetName ? `Hi ${greetName},` : "Hi there,";
  const shown = items.slice(0, 12);
  const extra = items.length - shown.length;
  const rows: { id: string; name: string }[][] = [];
  for (let i = 0; i < shown.length; i += 6) rows.push(shown.slice(i, i + 6));

  return (
    <Html lang="en">
      <Head>
        <meta name="color-scheme" content="light dark" />
        <meta name="supported-color-schemes" content="light dark" />
        <style>{`
          @media (prefers-color-scheme: dark) {
            .uq-bg { background-color: ${dark.bg} !important; }
            .uq-surface { background-color: ${dark.surface} !important; border-color: ${dark.line} !important; }
            .uq-ink { color: ${dark.ink} !important; }
            .uq-muted { color: ${dark.muted} !important; }
          }
          @media (max-width: 480px) {
            .uq-container { width: 100% !important; }
            .uq-pad { padding-left: 16px !important; padding-right: 16px !important; }
          }
        `}</style>
      </Head>
      <Preview>{`Your rental list is still saved${items.length ? `: ${items[0].name}${items.length > 1 ? " and more" : ""}` : ""}. Pick up where you left off.`}</Preview>
      <Body className="uq-bg" style={{ backgroundColor: brand.paper, margin: 0, padding: "24px 0", fontFamily: brand.sans, color: brand.ink }}>
        <Container className="uq-container" style={{ maxWidth: 580, margin: "0 auto", padding: "0 16px" }}>
          <Section style={{ padding: "8px 0 18px", textAlign: "center" }}>
            <Link href={site.url} style={{ fontFamily: brand.serif, fontSize: 26, color: brand.ink, textDecoration: "none", letterSpacing: 0.5 }}>
              Beyond <span style={{ color: brand.brass, fontStyle: "italic" }}>Chiavari</span>
            </Link>
            <Text className="uq-muted" style={{ margin: "4px 0 0", fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: brand.muted }}>
              {site.tagline}
            </Text>
          </Section>

          <Section className="uq-surface" style={{ backgroundColor: brand.surface, border: `1px solid ${brand.line}`, borderRadius: 16, overflow: "hidden" }}>
            <Img src={heroImage.src} alt={heroImage.alt} width={580} height={344} style={{ width: "100%", height: "auto", display: "block" }} />
            <div className="uq-pad" style={{ padding: "24px 24px 20px" }}>
              <Text className="uq-ink" style={{ fontFamily: brand.serif, fontSize: 24, lineHeight: "30px", margin: "0 0 10px", color: brand.ink }}>
                Your rental list is saved
              </Text>
              <Text className="uq-ink" style={{ fontSize: 15, lineHeight: "24px", margin: "0 0 18px", color: brand.ink }}>
                {hi} you started a list on our site and it&apos;s still right where you left it.
              </Text>

              {shown.length > 0 && (
                <>
                  <Text className="uq-muted" style={{ fontSize: 11, letterSpacing: 1.6, textTransform: "uppercase", color: brand.muted, fontWeight: 700, margin: "0 0 10px" }}>
                    What&apos;s on it
                  </Text>
                  <table role="presentation" cellPadding={0} cellSpacing={0} style={{ marginBottom: 6 }}>
                    <tbody>
                      {rows.map((row, i) => (
                        <tr key={i}>
                          {row.map((item) => (
                            <ItemTile key={item.id} id={item.id} name={item.name} />
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {extra > 0 && (
                    <Text className="uq-muted" style={{ fontSize: 12, color: brand.muted, margin: "0 0 16px" }}>
                      + {extra} more item{extra === 1 ? "" : "s"} on your list
                    </Text>
                  )}
                </>
              )}

              <Text className="uq-ink" style={{ fontSize: 14, lineHeight: "22px", margin: "0 0 4px", color: brand.ink }}>
                Add your date and guest count and send it. We&apos;ll check your date and send one itemized quote, usually within one business day. Nothing is charged until you approve it.
              </Text>
              {offerLine && (
                <Text className="uq-ink" style={{ fontSize: 14, lineHeight: "22px", margin: "10px 0 0", color: brand.ink, fontWeight: 700 }}>
                  {offerLine}
                </Text>
              )}

              <table role="presentation" cellPadding={0} cellSpacing={0} style={{ margin: "18px 0 4px" }}>
                <tbody>
                  <tr>
                    <td style={{ borderRadius: 999, backgroundColor: brand.ink }}>
                      <Link
                        href={link}
                        style={{ display: "inline-block", padding: "13px 26px", fontSize: 14, fontWeight: 700, color: brand.paper, textDecoration: "none", fontFamily: brand.sans }}
                      >
                        Finish your quote
                      </Link>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Section>

          <Text className="uq-muted" style={{ fontSize: 12, lineHeight: "18px", color: brand.muted, textAlign: "center", margin: "20px 0 0" }}>
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
