import { Body, Container, Head, Html, Link, Preview, Section, Text } from "@react-email/components";
import { usd } from "@/lib/catalog-types";
import type { LeadAlert, Row } from "@/lib/lead-alert";
import { site } from "@/lib/site";
import { brand } from "./Layout";

// The owner's alert for a new enquiry, laid out as cards: outreach, what they sent, consent, qualifying answers,
// quote and who to call, where they came from, and the pages they visited. Built from lib/lead-alert.ts.

const night = "#1d1a16";
const gold = "#e2b65b";
const tone = { good: "#2f6b3a", bad: "#a3341c", note: brand.muted };

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Section style={{ backgroundColor: brand.surface, border: `1px solid ${brand.line}`, borderRadius: 14, padding: "18px 20px", margin: "0 0 16px" }}>
      <Text style={{ fontSize: 11, letterSpacing: 1.6, textTransform: "uppercase", color: brand.muted, fontWeight: 700, margin: "0 0 10px" }}>{title}</Text>
      {children}
    </Section>
  );
}

function Rows({ rows }: { rows: Row[] }) {
  if (!rows.length) return null;
  return (
    <table width="100%" cellPadding={0} cellSpacing={0} role="presentation" style={{ borderCollapse: "collapse" }}>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i}>
            <td style={{ width: "34%", verticalAlign: "top", padding: "8px 10px 8px 0", fontSize: 13, color: brand.muted, borderTop: i ? `1px solid ${brand.line}` : undefined }}>
              {r.label}
            </td>
            <td
              style={{
                verticalAlign: "top",
                padding: "8px 0",
                fontSize: 14,
                lineHeight: "20px",
                color: r.tone ? tone[r.tone] : brand.ink,
                fontWeight: r.tone === "bad" ? 700 : 400,
                borderTop: i ? `1px solid ${brand.line}` : undefined,
                whiteSpace: "pre-line",
              }}
            >
              {r.href ? <Link href={r.href} style={{ color: brand.ink, textDecoration: "underline" }}>{r.value}</Link> : r.value}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function Tile({ label, value }: { label: string; value: string }) {
  return (
    <td style={{ verticalAlign: "top", padding: 4, width: "25%" }}>
      <div style={{ border: `1px solid ${brand.line}`, borderRadius: 10, padding: "8px 10px", backgroundColor: brand.paper }}>
        <div style={{ fontSize: 10, letterSpacing: 1.2, textTransform: "uppercase", color: brand.muted }}>{label}</div>
        <div style={{ fontSize: 13, lineHeight: "18px", color: brand.ink, marginTop: 4 }}>{value}</div>
      </div>
    </td>
  );
}

const pill = (bg: string, fg: string) => ({ display: "inline-block", backgroundColor: bg, color: fg, borderRadius: 999, padding: "1px 8px", fontSize: 11, marginLeft: 6 });

export function LeadAlertEmail({ alert: a, siteUrl = site.url }: { alert: LeadAlert; siteUrl?: string }) {
  const reply = `mailto:${a.email}?subject=${encodeURIComponent(`Your ${a.summary.split(" · ")[0] || "event"} rentals`)}&body=${encodeURIComponent(a.outreach.opener)}`;
  return (
    <Html lang="en">
      <Head />
      <Preview>{`${a.grade} · ${a.badge}: ${a.name}${a.summary ? ` · ${a.summary}` : ""}`}</Preview>
      <Body style={{ backgroundColor: "#f1ece4", margin: 0, padding: "20px 0", fontFamily: brand.sans, color: brand.ink }}>
        <Container style={{ maxWidth: 620, margin: "0 auto", padding: "0 12px" }}>
          <Section style={{ backgroundColor: night, borderRadius: "16px 16px 0 0", padding: "22px 24px" }}>
            <Text style={{ margin: 0 }}>
              <span style={{ display: "inline-block", backgroundColor: gold, color: night, borderRadius: 999, padding: "3px 10px", fontSize: 12, fontWeight: 700 }}>{a.badge}</span>
              <span style={{ display: "inline-block", border: `1px solid ${gold}`, color: gold, borderRadius: 999, padding: "2px 10px", fontSize: 12, fontWeight: 700, marginLeft: 6 }}>{a.grade} lead</span>
            </Text>
            <Text style={{ fontFamily: brand.serif, fontSize: 28, lineHeight: "34px", color: "#fff", margin: "12px 0 4px" }}>{a.name}</Text>
            <Text style={{ margin: 0, fontSize: 14 }}>
              <Link href={`mailto:${a.email}`} style={{ color: "#fff", textDecoration: "underline" }}>{a.email}</Link>
              {a.phone && (
                <>
                  <span style={{ color: "#bfb5a8" }}> · </span>
                  <Link href={`tel:${a.phone.replace(/[^\d+]/g, "")}`} style={{ color: "#fff", textDecoration: "underline" }}>{a.phone}</Link>
                </>
              )}
            </Text>
            {a.summary && <Text style={{ margin: "8px 0 0", fontSize: 15, color: gold, fontWeight: 600 }}>{a.summary}</Text>}
          </Section>
          <Section style={{ backgroundColor: "#f8f5f0", borderRadius: "0 0 16px 16px", padding: "18px 14px 6px" }}>
            <Card title="Outreach">
              <Text style={{ fontSize: 15, lineHeight: "22px", margin: "0 0 10px" }}>
                <strong>Next step:</strong> {a.outreach.nextStep}
              </Text>
              {a.outreach.warning && (
                <Text style={{ backgroundColor: "#fdf0d6", borderRadius: 8, padding: "8px 12px", fontSize: 13, margin: "0 0 10px" }}>{a.outreach.warning}</Text>
              )}
              <Text style={{ borderLeft: `3px solid ${gold}`, backgroundColor: brand.paper, padding: "8px 12px", fontSize: 14, lineHeight: "21px", margin: "0 0 12px" }}>
                <span style={{ color: brand.muted }}>Opener to adapt: </span>
                {a.outreach.opener}
              </Text>
              <Rows rows={a.outreach.rows} />
              <Text style={{ fontSize: 14, margin: "12px 0 0" }}>
                <Link href={a.adminUrl} style={{ color: brand.ink, textDecoration: "underline" }}>Open the full record</Link>
                <span style={{ color: brand.muted }}> · </span>
                <Link href={`${a.adminUrl}/script`} style={{ color: brand.ink, textDecoration: "underline" }}>Open the call script</Link>
                <span style={{ color: brand.muted }}> · </span>
                <Link href={reply} style={{ color: brand.ink, textDecoration: "underline" }}>Reply with the opener</Link>
              </Text>
            </Card>

            {a.sent.length > 0 && (
              <Card title="What they sent">
                <Rows rows={a.sent} />
              </Card>
            )}

            <Card title="Consent">
              <Rows rows={a.consent} />
            </Card>

            <Card title="Qualifying answers">
              <Rows rows={a.qualifying} />
            </Card>

            {a.quote && (
              <Card title={`Quote · ${usd(a.quote.subtotal, 0)}`}>
                <table width="100%" cellPadding={0} cellSpacing={0} role="presentation">
                  <tbody>
                    {a.quote.lines.map((l, i) => (
                      <tr key={i}>
                        <td style={{ fontSize: 13, padding: "4px 0", borderTop: i ? `1px solid ${brand.line}` : undefined }}>
                          {l.qty.toLocaleString()} × {l.name}
                        </td>
                        <td style={{ fontSize: 13, padding: "4px 0", textAlign: "right", color: brand.muted, borderTop: i ? `1px solid ${brand.line}` : undefined }}>{usd(l.line_total, 0)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <Text style={{ fontSize: 13, color: brand.muted, margin: "8px 0 0" }}>
                  Vendor cost {usd(a.quote.cost, 0)} · margin {usd(a.quote.subtotal - a.quote.cost, 0)}
                  {a.quote.perGuest ? ` · ${usd(a.quote.perGuest, 0)} per guest` : ""}
                </Text>
              </Card>
            )}

            {a.vendors.length > 0 && (
              <Card title="Who to call to fill it">
                <Rows
                  rows={a.vendors.map((v) => ({
                    label: v.name.split(" (")[0],
                    value: `${v.items ? `${v.items} item${v.items === 1 ? "" : "s"}, ${v.share}% of the cost` : "Assigned"}${v.phone ? ` · ${v.phone}` : ""}${v.status ? ` · ${v.status}` : ""}`,
                  }))}
                />
              </Card>
            )}

            <Card title="Where they came from">
              <Rows rows={a.source} />
            </Card>

            {a.journey && (
              <Card title="Pages they visited">
                <table width="100%" cellPadding={0} cellSpacing={0} role="presentation">
                  <tbody>
                    <tr>
                      <Tile label="First visit" value={a.journey.firstVisit} />
                      <Tile label="Came from" value={a.journey.cameFrom} />
                      <Tile label="Visits" value={a.journey.visits} />
                      <Tile label="Campaign" value={a.journey.campaign} />
                    </tr>
                  </tbody>
                </table>
                <Text style={{ fontSize: 12, color: brand.muted, margin: "8px 0 6px" }}>Oldest first · US Central time · click a page to open it</Text>
                <table width="100%" cellPadding={0} cellSpacing={0} role="presentation">
                  <tbody>
                    {a.journey.steps.map((s) => (
                      <tr key={s.n}>
                        <td style={{ width: 30, verticalAlign: "top", padding: "8px 0" }}>
                          <div style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: s.submitted ? gold : night, color: s.submitted ? night : "#fff", fontSize: 11, fontWeight: 700, textAlign: "center", lineHeight: "22px" }}>{s.n}</div>
                        </td>
                        <td style={{ verticalAlign: "top", padding: "8px 8px 8px 0", borderBottom: `1px solid ${brand.line}` }}>
                          <Link href={`${siteUrl}${s.path}`} style={{ color: night, fontWeight: 700, fontSize: 14, textDecoration: "underline" }}>{s.title}</Link>
                          {s.landed && <span style={pill("#e6e3f7", "#3b3470")}>Landed here</span>}
                          {s.submitted && <span style={pill("#fdf0d6", "#7a5410")}>Sent the form here</span>}
                          <div style={{ fontSize: 12, color: brand.muted }}>{s.path}{s.visit > 1 ? ` · visit ${s.visit}` : ""}</div>
                        </td>
                        <td style={{ verticalAlign: "top", padding: "8px 0", fontSize: 12, color: brand.muted, textAlign: "right", whiteSpace: "nowrap", borderBottom: `1px solid ${brand.line}` }}>{s.at}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {a.journey.clicks.length > 0 && (
                  <>
                    <Text style={{ fontSize: 12, color: brand.muted, margin: "12px 0 4px" }}>What they clicked</Text>
                    {a.journey.clicks.slice(-15).map((c, i) => (
                      <Text key={i} style={{ fontSize: 13, lineHeight: "19px", margin: "0 0 4px" }}>
                        <span style={{ color: brand.muted }}>{c.when} · </span>
                        &ldquo;{c.label}&rdquo;
                        {c.href ? <span style={{ color: brand.muted }}> → {c.href}</span> : null}
                        <span style={{ color: brand.muted }}> on {c.path}</span>
                      </Text>
                    ))}
                  </>
                )}
              </Card>
            )}

            {a.earlier.length > 0 && (
              <Card title="Earlier enquiries from this email">
                <Rows rows={a.earlier.map((e) => ({ label: e.when, value: e.what, href: `${siteUrl}/admin/leads/${e.id}` }))} />
              </Card>
            )}

            <Text style={{ fontSize: 12, color: brand.muted, margin: "4px 6px 14px" }}>
              Sent automatically by the {site.domain} forms. Page history is kept in the visitor&apos;s browser and only sent with a form; visitors can turn it off.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
