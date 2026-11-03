import { Link, Text } from "@react-email/components";
import { site } from "@/lib/site";
import { brand, CtaButton, Divider, EmailLayout, Heading, P } from "./Layout";

// Branded emails built with React Email. Sending happens in src/lib/notify.ts, only when RESEND_API_KEY is set.
// Previews: /admin/emails.

const unsubscribeNote = "You're getting this because you contacted us on our website.";

// Turns URLs in a line of plain text into links.
function Linked({ line }: { line: string }) {
  const parts = line.split(/(https?:\/\/[^\s)]+)/g);
  return (
    <>
      {parts.map((p, i) =>
        /^https?:\/\//.test(p) ? (
          <Link key={i} href={p} style={{ color: brand.brass }}>{p.replace(/^https?:\/\//, "")}</Link>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </>
  );
}

/**
 * The branded wrapper every plain-text email gets (see sendEmail in src/lib/notify.ts): the subject as a heading,
 * the text's paragraphs with clickable links, and an unsubscribe link when one applies. Wording stays the text's own.
 */
export function TextEmail({ subject, text, unsubscribe }: { subject: string; text: string; unsubscribe?: string }) {
  const paragraphs = text.split(/\n\s*\n/).map((p) => p.split("\n"));
  return (
    <EmailLayout preview={paragraphs[1]?.join(" ").slice(0, 120) ?? subject} footerNote={unsubscribe ? unsubscribeNote : undefined}>
      <Heading>{subject}</Heading>
      {paragraphs.map((lines, i) => (
        <Text key={i} style={{ fontSize: 15, lineHeight: "24px", margin: "0 0 14px", color: brand.ink }}>
          {lines.map((l, j) => (
            <span key={j}>
              {j > 0 && <br />}
              <Linked line={l} />
            </span>
          ))}
        </Text>
      ))}
      {unsubscribe && (
        <Text style={{ fontSize: 12, color: brand.muted, margin: "8px 0 0" }}>
          <Link href={unsubscribe} style={{ color: brand.muted }}>Unsubscribe from automated emails</Link>
        </Text>
      )}
    </EmailLayout>
  );
}

/** To a past customer, sent by hand from /admin/reviews: asks for an honest review. */
export function ReviewRequestEmail({ name, link }: { name?: string; link: string }) {
  return (
    <EmailLayout preview="How did your event rentals go?" footerNote={unsubscribeNote}>
      <Heading>How did everything go?</Heading>
      <P>{name ? `Hi ${name},` : "Hi,"} thank you for booking your event rentals through {site.name}.</P>
      <P>
        Would you share an honest review? It takes two minutes, helps other Chicago planners, and tells us what to fix. Good
        or bad, we publish real reviews only, and we reply to every one.
      </P>
      <CtaButton href={link}>Write a review</CtaButton>
    </EmailLayout>
  );
}

/** To the owner: a review is waiting for approval. */
export function NewReviewEmail({ rating, name, body, verified }: { rating: number; name: string; body: string; verified?: boolean }) {
  return (
    <EmailLayout preview={`New ${rating}-star review from ${name}`}>
      <Heading>New {rating}-star review</Heading>
      <P>
        <strong>{name}</strong>
        {verified ? " · verified booking" : ""}
      </P>
      <P muted>{"★".repeat(rating)}{"☆".repeat(5 - rating)}</P>
      <P>{body}</P>
      <Divider />
      <CtaButton href={`${site.url}/admin/reviews`}>Approve or hide</CtaButton>
    </EmailLayout>
  );
}
