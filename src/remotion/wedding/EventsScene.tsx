import { AbsoluteFill } from "remotion";
import { display, displayItalic, sans, script } from "../fonts";
import { Backdrop, CREAM, Divider, GOLD, GOLD_LIGHT, OrnateFrame, Petals, Reveal } from "./theme";

export type WeddingEvent = {
  readonly name: string;
  readonly note: string;
  readonly weekday: string;
  readonly day: number;
  readonly month: string;
  readonly time: string;
};

export type EventsProps = {
  readonly year: number;
  readonly events: readonly WeddingEvent[];
};

const FIRST = 40;
const STAGGER = 34;

function EventRow({ event, at }: { event: WeddingEvent; at: number }) {
  return (
    <Reveal at={at} style={{ width: "100%" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 44,
          padding: "30px 44px",
          border: `1.5px solid rgba(217, 178, 106, 0.55)`,
          borderRadius: 20,
          background: "rgba(20, 3, 7, 0.35)",
        }}
      >
        <div style={{ width: 170, flexShrink: 0, textAlign: "center", borderRight: `1.5px solid rgba(217, 178, 106, 0.45)`, paddingRight: 40 }}>
          <div style={{ fontFamily: sans, fontSize: 26, letterSpacing: 6, textTransform: "uppercase", color: GOLD }}>
            {event.weekday.slice(0, 3)}
          </div>
          <div style={{ fontFamily: display, fontWeight: 300, fontSize: 110, lineHeight: 1, color: GOLD_LIGHT }}>{event.day}</div>
          <div style={{ fontFamily: sans, fontSize: 26, letterSpacing: 6, textTransform: "uppercase", color: GOLD }}>
            {event.month.slice(0, 3)}
          </div>
        </div>
        <div style={{ textAlign: "left" }}>
          <div style={{ fontFamily: script, fontSize: 96, lineHeight: 1.05, color: GOLD_LIGHT }}>{event.name}</div>
          <div style={{ fontFamily: displayItalic, fontSize: 44, color: CREAM, marginTop: 4 }}>{event.note}</div>
          <div style={{ fontFamily: sans, fontWeight: 500, fontSize: 36, letterSpacing: 5, color: GOLD, marginTop: 10 }}>
            {event.weekday} · {event.time}
          </div>
        </div>
      </div>
    </Reveal>
  );
}

// The four celebrations, one card each, revealed in order.
export function EventsScene({ year, events }: EventsProps) {
  return (
    <AbsoluteFill>
      <Backdrop />
      <Petals count={16} seed="events" />
      <OrnateFrame />
      <AbsoluteFill style={{ alignItems: "center", textAlign: "center", padding: "150px 120px 0" }}>
        <Reveal at={4}>
          <div style={{ fontFamily: sans, fontSize: 30, letterSpacing: 12, textTransform: "uppercase", color: GOLD }}>
            Join us for
          </div>
        </Reveal>
        <Reveal at={14} style={{ marginTop: 10 }}>
          <div style={{ fontFamily: display, fontWeight: 300, fontSize: 110, lineHeight: 1.05, color: CREAM }}>The Celebrations</div>
        </Reveal>
        <Reveal at={24} style={{ marginTop: 26, width: "100%" }}>
          <Divider />
        </Reveal>
        <div style={{ display: "flex", flexDirection: "column", gap: 34, marginTop: 56, width: "100%" }}>
          {events.map((event, i) => (
            <EventRow key={event.name} event={event} at={FIRST + i * STAGGER} />
          ))}
        </div>
        <Reveal at={FIRST + events.length * STAGGER} style={{ marginTop: 50 }}>
          <div style={{ fontFamily: sans, fontSize: 32, letterSpacing: 14, color: GOLD }}>OCTOBER {year}</div>
        </Reveal>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}
