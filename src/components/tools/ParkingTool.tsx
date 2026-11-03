"use client";

import { parkingPlan } from "@/lib/tools/calc";
import { Choice, NumberField, ShareBar, Stat, ToolFrame, useUrlState } from "./controls";

const vehicles = [
  { id: "14", label: "Van (14 seats)" },
  { id: "28", label: "Mini-bus (28 seats)" },
  { id: "55", label: "Coach (55 seats)" },
];

export function ParkingTool() {
  const [s, set] = useUrlState({ guests: 150, perCar: 2, ride: 10, shuttle: 0, onSite: 40, sqft: 300, seats: "28", trip: 30, window: 60 });
  const r = parkingPlan({ guests: s.guests, perCar: s.perCar, rideSharePct: s.ride, shuttlePct: s.shuttle, onSite: s.onSite, sqftPerSpace: s.sqft, shuttleSeats: Number(s.seats), roundTripMin: s.trip, windowMin: s.window });
  const acre = r.lotSqft / 43_560;

  return (
    <ToolFrame
      inputs={
        <>
          <NumberField id="pk-guests" label="Guests" value={s.guests} onChange={(n) => set({ guests: n })} max={5000} step={5} />
          <NumberField id="pk-car" label="Guests per car" value={s.perCar} onChange={(n) => set({ perCar: n })} step={0.5} min={1} max={6} hint="Couples and families share cars. Your guess for your crowd." />
          <div className="grid gap-4 sm:grid-cols-2">
            <NumberField id="pk-ride" label="Arrive by rideshare, taxi or transit" suffix="%" step={5} max={100} value={s.ride} onChange={(n) => set({ ride: n })} />
            <NumberField id="pk-shuttle" label="Ride a shuttle you provide" suffix="%" step={5} max={100} value={s.shuttle} onChange={(n) => set({ shuttle: n })} hint="For hotel blocks or remote parking." />
          </div>
          <NumberField id="pk-onsite" label="Parking spaces at the venue" value={s.onSite} onChange={(n) => set({ onSite: n })} max={5000} step={5} hint="Include street parking you can count on." />
          <NumberField id="pk-sqft" label="Space per parked car, including lanes" suffix="sq ft" step={10} min={150} max={500} value={s.sqft} onChange={(n) => set({ sqft: n })} hint="For sizing an overflow field. Tight, attended parking uses less." />
          {s.shuttle > 0 && (
            <>
              <Choice label="Shuttle vehicle" value={s.seats} options={vehicles} onChange={(k) => set({ seats: k })} />
              <div className="grid gap-4 sm:grid-cols-2">
                <NumberField id="pk-trip" label="Round trip" suffix="min" step={5} min={5} max={180} value={s.trip} onChange={(n) => set({ trip: n })} hint="Load, drive, unload and back." />
                <NumberField id="pk-window" label="Arrival window" suffix="min" step={15} min={15} max={240} value={s.window} onChange={(n) => set({ window: n })} hint="How long guests have to arrive." />
              </div>
            </>
          )}
        </>
      }
      results={
        <div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Stat big value={r.cars} label="Cars to park" note={`${r.drivers} guests driving, ${s.perCar} per car`} />
            <Stat big value={r.overflow} label="Spaces short" note={r.overflow ? "Plan overflow parking or a shuttle" : "The venue's parking is enough"} />
          </div>
          {r.overflow > 0 && (
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Stat value={`${r.lotSqft.toLocaleString()} sq ft`} label="Overflow area needed" note={`About ${acre.toFixed(2)} acres at ${s.sqft} sq ft per car`} />
              <Stat value={r.rideShare} label="Guests by rideshare or transit" note="Mark a drop-off point near the entrance" />
            </div>
          )}
          {s.shuttle > 0 && (
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Stat big value={r.shuttles} label={`${vehicles.find((v) => v.id === s.seats)?.label} shuttles`} note={`${r.shuttleRiders} riders, ${r.tripsPerVehicle} trip${r.tripsPerVehicle === 1 ? "" : "s"} each in ${s.window} min`} />
              <Stat value={r.tripsPerVehicle} label="Loops per shuttle before start time" />
            </div>
          )}
          <figure className="mt-6 rounded-2xl border border-line bg-surface p-5">
            <svg viewBox="0 0 300 40" className="w-full" role="img" aria-labelledby="pk-t">
              <title id="pk-t">{`How ${s.guests} guests arrive: ${r.drivers} drive, ${r.rideShare} by rideshare or transit, ${r.shuttleRiders} by shuttle`}</title>
              {(() => {
                const t = Math.max(1, s.guests);
                const a = (r.drivers / t) * 300;
                const b = (r.rideShare / t) * 300;
                return (
                  <>
                    <rect x="0" y="8" width={a} height="24" fill="var(--gold)" />
                    <rect x={a} y="8" width={b} height="24" fill="var(--sage)" />
                    <rect x={a + b} y="8" width={300 - a - b} height="24" fill="var(--rose)" />
                  </>
                );
              })()}
            </svg>
            <figcaption className="mt-2 flex flex-wrap gap-4 text-xs text-muted">
              <span><span className="mr-1 inline-block h-2 w-2 rounded-full bg-gold" />Drive ({r.drivers})</span>
              <span><span className="mr-1 inline-block h-2 w-2 rounded-full bg-sage" />Rideshare or transit ({r.rideShare})</span>
              <span><span className="mr-1 inline-block h-2 w-2 rounded-full bg-rose" />Shuttle ({r.shuttleRiders})</span>
            </figcaption>
          </figure>
          <p className="mt-4 text-sm leading-6 text-muted">Parking on a lawn or a street closure may need permission from your town. Fencing, lighting and signs for an overflow lot can be rented.</p>
          <ShareBar tool="parking" quoteHref="/quote?items=barricade&from=tool-parking" />
        </div>
      }
    />
  );
}
