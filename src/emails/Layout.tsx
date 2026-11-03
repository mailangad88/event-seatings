import { Body, Button, Container, Head, Hr, Html, Link, Preview, Section, Text } from "@react-email/components";
import { site } from "@/lib/site";

// Shared frame for every Beyond Chiavari email (React Email, MIT). Colours mirror the site's tokens:
// ivory paper, ink text, brass accents. Email clients ignore CSS variables, so the hex values live here.
export const brand = {
  paper: "#faf7f2",
  surface: "#ffffff",
  ink: "#1d1a16",
  muted: "#6b6258",
  line: "#e7dfd3",
  brass: "#8a6628",
  serif: "Georgia, 'Times New Roman', serif",
  sans: "'Helvetica Neue', Helvetica, Arial, sans-serif",
};

export function EmailLayout({ preview, children, footerNote }: { preview: string; children: React.ReactNode; footerNote?: string }) {
  return (
    <Html lang="en">
      <Head />
      <Preview>{preview}</Preview>
      <Body style={{ backgroundColor: brand.paper, margin: 0, padding: "24px 0", fontFamily: brand.sans, color: brand.ink }}>
        <Container style={{ maxWidth: 560, margin: "0 auto", padding: "0 16px" }}>
          <Section style={{ padding: "8px 0 20px", textAlign: "center" }}>
            <Link href={site.url} style={{ fontFamily: brand.serif, fontSize: 26, color: brand.ink, textDecoration: "none", letterSpacing: 0.5 }}>
              Beyond <span style={{ color: brand.brass, fontStyle: "italic" }}>Chiavari</span>
            </Link>
            <Text style={{ margin: "4px 0 0", fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: brand.muted }}>
              {site.tagline}
            </Text>
          </Section>
          <Section style={{ backgroundColor: brand.surface, border: `1px solid ${brand.line}`, borderRadius: 16, padding: "28px 28px 20px" }}>
            {children}
          </Section>
          <Text style={{ fontSize: 12, lineHeight: "18px", color: brand.muted, textAlign: "center", margin: "20px 0 0" }}>
            {site.name} · Chicago &amp; suburbs · <Link href={site.url} style={{ color: brand.muted }}>{site.domain}</Link>
            {footerNote ? <><br />{footerNote}</> : null}
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export function Heading({ children }: { children: React.ReactNode }) {
  return <Text style={{ fontFamily: brand.serif, fontSize: 26, lineHeight: "32px", margin: "0 0 12px", color: brand.ink }}>{children}</Text>;
}

export function P({ children, muted }: { children: React.ReactNode; muted?: boolean }) {
  return <Text style={{ fontSize: 15, lineHeight: "24px", margin: "0 0 14px", color: muted ? brand.muted : brand.ink }}>{children}</Text>;
}

export function CtaButton({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Button
      href={href}
      style={{ backgroundColor: brand.ink, color: brand.paper, borderRadius: 999, padding: "12px 22px", fontSize: 14, fontWeight: 600, textDecoration: "none" }}
    >
      {children}
    </Button>
  );
}

export function Divider() {
  return <Hr style={{ borderColor: brand.line, margin: "20px 0" }} />;
}
