"use client";

import { guestEstimate } from "@/lib/tools/calc";
import { NumberField, ShareBar, Stat, ToolFrame, useUrlState } from "./controls";

const groups = [
  { id: "local", label: "Local guests", hint: "Live within an easy drive." },
  { id: "travel", label: "Out-of-town guests", hint: "Need a flight or a hotel." },
  { id: "plusone", label: "Plus-ones and kids", hint: "Only those you invited by name or as a guest." },
  { id: "maybe", label: "Long shots", hint: "Courtesy invites you don't expect to see." },
];

export function GuestCountTool() {
  const [s, set] = useUrlState({ local: 100, travel: 30, plusone: 20, maybe: 10, rlocal: 85, rtravel: 60, rplusone: 80, rmaybe: 25, vendors: 6, buffer: 3 });
  const rows = groups.map((g) => ({ id: g.id, label: g.label, invited: Number(s[g.id as keyof typeof s]), rate: Number(s[`r${g.id}` as keyof typeof s]) }));
  const r = guestEstimate(rows, { vendors: s.vendors, bufferPct: s.buffer });

  return (
    <ToolFrame
      inputs={
        <>
          <p className="text-sm text-muted">
            Enter how many people you will invite in each group, then how many of them you think will say yes. The
            starting percentages are placeholders, not survey data: change them to fit your crowd.
          </p>
          {groups.map((g) => (
            <div key={g.id} className="grid gap-4 border-t border-line pt-6 sm:grid-cols-2">
              <NumberField id={`gc-${g.id}`} label={`${g.label} invited`} hint={g.hint} value={Number(s[g.id as keyof typeof s])} onChange={(n) => set({ [g.id]: n } as Partial<typeof s>)} max={5000} />
              <NumberField id={`gc-r${g.id}`} label="Expected yes" suffix="%" step={5} max={100} value={Number(s[`r${g.id}` as keyof typeof s])} onChange={(n) => set({ [`r${g.id}`]: n } as Partial<typeof s>)} />
            </div>
          ))}
          <div className="grid gap-4 border-t border-line pt-6 sm:grid-cols-2">
            <NumberField id="gc-vendors" label="Vendor meals and seats" hint="Photographer, DJ, planner who sit down." value={s.vendors} onChange={(n) => set({ vendors: n })} max={100} />
            <NumberField id="gc-buffer" label="Spare chairs" suffix="%" hint="For late RSVPs and broken chairs." value={s.buffer} onChange={(n) => set({ buffer: n })} max={20} />
          </div>
        </>
      }
      results={
        <div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Stat big value={r.expected} label="Guests expected" note={`${r.rate}% of ${r.invited} invited`} />
            <Stat big value={r.chairs} label="Chairs to order" note="High estimate, vendors and spares" />
            <Stat value={`${r.low}–${r.high}`} label="Likely range" note="Each group's yes rate 10 points lower or higher" />
            <Stat value={r.invited} label="Total invited" />
          </div>
          <div className="mt-6 rounded-2xl border border-line bg-surface p-5">
            <p className="text-sm font-medium">By group</p>
            <ul className="mt-3 space-y-3">
              {r.lines.map((l) => (
                <li key={l.id}>
                  <div className="flex justify-between text-sm">
                    <span>{l.label}</span>
                    <span className="tabular-nums">{Math.round(l.expected)} of {l.invited}</span>
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-surface-2" role="presentation">
                    <div className="h-full rounded-full bg-gold" style={{ width: `${r.invited ? (l.invited / r.invited) * 100 : 0}%`, opacity: 0.35 + l.rate / 160 }} />
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <p className="mt-4 text-sm leading-6 text-muted">
            Order chairs for the high number, and give the caterer and rental company your real RSVP count when it is due.
          </p>
          <ShareBar tool="guest-count" quoteHref={`/quote?guests=${r.chairs}&from=tool-guest-count`} />
        </div>
      }
    />
  );
}
