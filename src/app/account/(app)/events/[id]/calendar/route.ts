import { currentAccount } from "@/lib/account";
import { site } from "@/lib/site";

// Calendar file (.ics) for one event: the event day plus each rental company's delivery and pickup.
// All-day entries, with the delivery or pickup window in the title, since windows are free text ("8 to 10am").
export async function GET(_req: Request, ctx: RouteContext<"/account/events/[id]/calendar">) {
  const { id } = await ctx.params;
  const data = await currentAccount();
  const e = data?.events.find((x) => x.id === id);
  if (!e) return new Response("Not found", { status: 404 });

  const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/;/g, "\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
  const ymd = (d: string) => d.slice(0, 10).replace(/-/g, "");
  const next = (d: string) => {
    const t = new Date(`${d.slice(0, 10)}T12:00:00Z`);
    t.setUTCDate(t.getUTCDate() + 1);
    return t.toISOString().slice(0, 10);
  };
  const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const url = `${site.url}/account/events/${e.id}`;
  const items: { uid: string; date: string; title: string; text?: string }[] = [];
  if (e.date) items.push({ uid: `${e.id}-event`, date: e.date, title: `${e.title}${e.guests ? ` (${e.guests} guests)` : ""}` });
  e.parts.forEach((p, i) => {
    const what = p.lines.map((l) => `${l.qty} ${l.name}`).join(", ");
    if (p.delivery?.date) items.push({ uid: `${e.id}-d${i}`, date: p.delivery.date, title: `Rental delivery${p.delivery.window ? `, ${p.delivery.window}` : ""}: ${p.name}`, text: what });
    if (p.pickup?.date) items.push({ uid: `${e.id}-p${i}`, date: p.pickup.date, title: `Rental pickup${p.pickup.window ? `, ${p.pickup.window}` : ""}: ${p.name}`, text: what });
  });

  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Beyond Chiavari//Your event//EN", "CALSCALE:GREGORIAN"];
  for (const it of items)
    lines.push(
      "BEGIN:VEVENT",
      `UID:${it.uid}@${site.domain}`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${ymd(it.date)}`,
      `DTEND;VALUE=DATE:${ymd(next(it.date))}`,
      `SUMMARY:${esc(it.title)}`,
      `DESCRIPTION:${esc([it.text, `Details: ${url}`].filter(Boolean).join("\n"))}`,
      ...(e.place ? [`LOCATION:${esc(e.place)}`] : []),
      `URL:${url}`,
      "END:VEVENT",
    );
  lines.push("END:VCALENDAR");
  return new Response(lines.join("\r\n"), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${(e.type ?? "event").toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${e.date ?? "dates"}.ics"`,
      "Cache-Control": "private, no-store",
    },
  });
}
