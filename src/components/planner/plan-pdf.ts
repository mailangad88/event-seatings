// Builds the downloadable event plan PDF in the browser (jsPDF is loaded only when someone clicks Download).
import { assessment, extras, getPlannerEvent, settings, spaceNeeded, styleName, timeline, type PlanInput } from "@/lib/event-plan";
import { site } from "@/lib/site";

type Line = { name: string; qty: number; unit: string; price: number; group: string };

const money = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: n < 100 ? 2 : 0 });

export async function downloadPlanPdf({ input, lines, name }: { input: PlanInput; lines: Line[]; name?: string }) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 54;
  const gold: [number, number, number] = [138, 102, 40];
  const ink: [number, number, number] = [29, 26, 22];
  const muted: [number, number, number] = [101, 93, 82];
  let y = M;

  const ensure = (h: number) => {
    if (y + h > H - M) {
      doc.addPage();
      y = M;
    }
  };
  const text = (t: string, size = 10, color = ink, style: "normal" | "bold" = "normal", indent = 0) => {
    doc.setFont("helvetica", style);
    doc.setFontSize(size);
    doc.setTextColor(...color);
    const wrapped = doc.splitTextToSize(t, W - 2 * M - indent) as string[];
    for (const row of wrapped) {
      ensure(size * 1.4);
      doc.text(row, M + indent, y);
      y += size * 1.4;
    }
  };
  const heading = (t: string) => {
    y += 14;
    ensure(40);
    doc.setDrawColor(...gold);
    doc.setLineWidth(0.8);
    doc.line(M, y, W - M, y);
    y += 20;
    text(t, 15, ink, "bold");
    y += 2;
  };

  const ev = getPlannerEvent(input.event);
  const total = lines.reduce((s, l) => s + l.price * l.qty, 0);
  const space = spaceNeeded(input);
  const when = input.date ? new Date(`${input.date}T12:00:00`).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "Date to be decided";

  // Cover block
  text(site.name.toUpperCase(), 9, gold, "bold");
  y += 6;
  text(`${name ? `${name.split(" ")[0]}'s ` : ""}${ev?.name ?? "event"} plan`, 24, ink, "bold");
  text(
    `${input.guests} guests · ${styleName(input.style)} package · ${settings.find((s) => s.id === input.setting)?.name} · ${when}`,
    11,
    muted,
  );
  if (input.extras.length) text(`Add-ons: ${input.extras.map((x) => extras.find((e) => e.id === x)?.name).join(", ")}`, 10, muted);
  y += 6;
  text(`Estimated rentals: ${money(total)} (${money(input.guests ? total / input.guests : 0)} per guest), before delivery, setup and tax.`, 11, ink, "bold");

  heading("Assessment");
  for (const n of assessment(input, total)) text(`${n.tone === "good" ? "+" : "!"}  ${n.text}`, 10, ink, "normal", 4);

  heading("Your rental list");
  const groups = [...new Set(lines.map((l) => l.group))];
  for (const g of groups) {
    ensure(30);
    text(g, 10, gold, "bold");
    for (const l of lines.filter((x) => x.group === g)) {
      ensure(14);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(...ink);
      doc.text(`${l.qty.toLocaleString()} × ${l.name}`, M + 8, y);
      doc.setTextColor(...muted);
      doc.text(`${money(l.price)} ${l.unit === "each" ? "ea" : l.unit}`, W - M - 90, y, { align: "right" });
      doc.setTextColor(...ink);
      doc.text(money(l.price * l.qty), W - M, y, { align: "right" });
      y += 14;
    }
    y += 4;
  }
  ensure(20);
  doc.setFont("helvetica", "bold");
  doc.text("Estimated total", M + 8, y);
  doc.text(money(total), W - M, y, { align: "right" });
  y += 16;
  text("Prices are current rental rates. Your proposal confirms availability, delivery, setup, damage waiver and tax for your venue.", 8.5, muted);

  heading("Space and layout");
  text(`Plan for about ${space.total.toLocaleString()} sq ft of usable floor:`, 10);
  const parts: [string, number][] = [
    ["Guest seating", space.seating],
    ["Dance floor", space.dance],
    ["Bar", space.bar],
    ["Buffet", space.buffet],
    ["Lounge", space.lounge],
    ["Stage", space.stage],
  ];
  for (const [k, v] of parts) if (v) text(`• ${k}: ~${Math.round(v).toLocaleString()} sq ft`, 10, ink, "normal", 8);
  text("Keep 5 ft aisles for serving and wheelchairs, and the dance floor near the DJ or band.", 10, muted);

  heading("Checklist and timeline");
  for (const s of timeline(input)) {
    ensure(30);
    text(`${s.when}${s.date ? `  ·  ${s.date}` : ""}`, 11, ink, "bold");
    for (const t of s.tasks) text(`[  ]  ${t}`, 10, ink, "normal", 8);
    y += 4;
  }

  heading("Next steps");
  text("1. We confirm availability and delivery for your date within one business day.", 10);
  text("2. Approve your proposal to reserve your rentals.", 10);
  text("3. Send your final guest count about a week before; we deliver, set up and pick up.", 10);
  y += 6;
  text(`Questions? ${site.email}${site.phone ? ` · ${site.phone}` : ""} · ${site.url.replace(/^https?:\/\//, "")}/book`, 10, gold, "bold");

  // Footer on every page
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...muted);
    doc.text(`${site.name} · Event rentals across Chicago & suburbs · ${site.url.replace(/^https?:\/\//, "")}`, M, H - 28);
    doc.text(`${i} / ${pages}`, W - M, H - 28, { align: "right" });
  }

  const slug = `${ev?.id ?? "event"}-plan${input.date ? `-${input.date}` : ""}`;
  doc.save(`${slug}.pdf`);
}
