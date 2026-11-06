import { Body, Container, Head, Html, Img, Link, Preview, Section, Text } from "@react-email/components";
import { site } from "@/lib/site";
import { brand } from "./Layout";

// Visual version of the request and nurture follow-ups (src/lib/followups.ts), sent by the daily
// /api/cron/followups job while FOLLOWUPS_ENABLED=true. Same look as the quote confirmation and
// unfinished-quote emails (src/emails/QuoteConfirmationEmail.tsx, UnfinishedQuoteEmail.tsx): hero
// image, one card, one CTA button. The wording itself still lives in followups.ts; this component
// only lays out the same lines that go in the plain-text email, plus the step's heading and CTA.

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

const urlPattern = /(https?:\/\/\S+)/g;

// Turns one line of plain text into text with any bare URL rendered as a link.
function Linkified({ text }: { text: string }) {
  const parts = text.split(urlPattern);
  return (
    <>
      {parts.map((part, i) =>
        urlPattern.test(part) ? (
          <Link key={i} href={part} style={{ color: brand.brass }}>
            {part.replace(/^https?:\/\//, "")}
          </Link>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

// Groups the plain-text body (already written for followups.ts) into paragraphs and lists, so the
// same wording used in the text email reads well as an HTML card too, with no content duplicated.
function Blocks({ lines }: { lines: string[] }) {
  const groups: string[][] = [];
  for (const line of lines) {
    if (line === "") {
      groups.push([]);
    } else {
      if (groups.length === 0) groups.push([]);
      groups.at(-1)!.push(line);
    }
  }
  const nonEmpty = groups.filter((g) => g.length > 0);
  return (
    <>
      {nonEmpty.map((group, i) => {
        const isList = group.every((l) => /^[-\d]/.test(l));
        if (isList) {
          return (
            <table key={i} role="presentation" cellPadding={0} cellSpacing={0} style={{ marginBottom: 14, width: "100%" }}>
              <tbody>
                {group.map((item, j) => (
                  <tr key={j}>
                    <td style={{ fontSize: 14, lineHeight: "22px", color: brand.ink, paddingBottom: 4 }}>
                      <Linkified text={item.replace(/^- /, "• ").replace(/^(\d+)\.\s*/, "$1. ")} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          );
        }
        return (
          <Text key={i} style={{ fontSize: 15, lineHeight: "24px", margin: "0 0 14px", color: brand.ink }}>
            <Linkified text={group.join(" ")} />
          </Text>
        );
      })}
    </>
  );
}

export function FollowupEmail({
  heading,
  preview,
  lines,
  cta,
  unsubscribe,
}: {
  heading: string;
  preview: string;
  /** The body as written for the plain-text email, with the greeting line already removed. */
  lines: string[];
  cta: { label: string; href: string };
  unsubscribe?: string;
}) {
  return (
    <Html lang="en">
      <Head>
        <meta name="color-scheme" content="light dark" />
        <meta name="supported-color-schemes" content="light dark" />
        <style>{`
          @media (prefers-color-scheme: dark) {
            .fu-bg { background-color: ${dark.bg} !important; }
            .fu-surface { background-color: ${dark.surface} !important; border-color: ${dark.line} !important; }
            .fu-ink { color: ${dark.ink} !important; }
            .fu-muted { color: ${dark.muted} !important; }
          }
          @media (max-width: 480px) {
            .fu-container { width: 100% !important; }
            .fu-pad { padding-left: 16px !important; padding-right: 16px !important; }
          }
        `}</style>
      </Head>
      <Preview>{preview}</Preview>
      <Body className="fu-bg" style={{ backgroundColor: brand.paper, margin: 0, padding: "24px 0", fontFamily: brand.sans, color: brand.ink }}>
        <Container className="fu-container" style={{ maxWidth: 580, margin: "0 auto", padding: "0 16px" }}>
          <Section style={{ padding: "8px 0 18px", textAlign: "center" }}>
            <Link href={site.url} style={{ fontFamily: brand.serif, fontSize: 26, color: brand.ink, textDecoration: "none", letterSpacing: 0.5 }}>
              Beyond <span style={{ color: brand.brass, fontStyle: "italic" }}>Chiavari</span>
            </Link>
            <Text className="fu-muted" style={{ margin: "4px 0 0", fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: brand.muted }}>
              {site.tagline}
            </Text>
          </Section>

          <Section className="fu-surface" style={{ backgroundColor: brand.surface, border: `1px solid ${brand.line}`, borderRadius: 16, overflow: "hidden" }}>
            <Img src={heroImage.src} alt={heroImage.alt} width={580} height={344} style={{ width: "100%", height: "auto", display: "block" }} />
            <div className="fu-pad" style={{ padding: "24px 24px 20px" }}>
              <Text className="fu-ink" style={{ fontFamily: brand.serif, fontSize: 24, lineHeight: "30px", margin: "0 0 14px", color: brand.ink }}>
                {heading}
              </Text>

              <Blocks lines={lines} />

              <table role="presentation" cellPadding={0} cellSpacing={0} style={{ margin: "6px 0 4px" }}>
                <tbody>
                  <tr>
                    <td style={{ borderRadius: 999, backgroundColor: brand.ink }}>
                      <Link
                        href={cta.href}
                        style={{ display: "inline-block", padding: "13px 26px", fontSize: 14, fontWeight: 700, color: brand.paper, textDecoration: "none", fontFamily: brand.sans }}
                      >
                        {cta.label}
                      </Link>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Section>

          <Text className="fu-muted" style={{ fontSize: 12, lineHeight: "18px", color: brand.muted, textAlign: "center", margin: "20px 0 0" }}>
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
