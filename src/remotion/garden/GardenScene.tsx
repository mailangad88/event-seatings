import { AbsoluteFill, Sequence, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { display, gurmukhi, script } from "../fonts";
import { Bougainvillea, Palm } from "./art/Botanicals";
import { GardenDefs, JaaliWall, Lamp, Lawn, Parasol, Parrot, Peacock, Planters, Settee } from "./art/Garden";
import { C, clamp, ease } from "./palette";

export type GardenEvent = {
  readonly name: string;
  readonly date: string;
  readonly time: string;
};

export type GardenProps = {
  readonly groomFullName: string;
  readonly brideFullName: string;
  readonly signOff: string;
  readonly dateRange: string;
  readonly events: readonly GardenEvent[];
};

export const INTRO_FRAMES = 150;
export const EVENT_FRAMES = 120;
export const OUTRO_FRAMES = 150;
const TEXT_START = 60;

export function gardenFrames(eventCount: number) {
  return TEXT_START + INTRO_FRAMES + eventCount * EVENT_FRAMES + OUTRO_FRAMES;
}

const serif: React.CSSProperties = { fontFamily: display, fontWeight: 400, color: C.textGold, textTransform: "uppercase", letterSpacing: 4 };
const scriptStyle: React.CSSProperties = { fontFamily: script, color: C.textGreen, lineHeight: 1.1 };

// Lines fade up one after another, and the whole card fades out at the end of its sequence.
function Card({ lines }: { lines: { node: React.ReactNode; gap?: number }[] }) {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const out = interpolate(frame, [durationInFrames - 16, durationInFrames - 2], [1, 0], clamp);
  return (
    <AbsoluteFill style={{ alignItems: "center", paddingTop: 290, textAlign: "center", opacity: out }}>
      {lines.map((l, i) => {
        const t = interpolate(frame, [i * 7, i * 7 + 22], [0, 1], { ...clamp, easing: ease });
        return (
          <div key={i} style={{ marginTop: l.gap ?? 0, opacity: t, transform: `translateY(${(1 - t) * 24}px)` }}>
            {l.node}
          </div>
        );
      })}
    </AbsoluteFill>
  );
}

// Cream striped wall, a painted garden rising from below, and invitation cards that change in place.
export function GardenScene({ groomFullName, brideFullName, signOff, dateRange, events }: GardenProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const rise = interpolate(frame, [0, 55], [760, 0], { ...clamp, easing: ease });
  const drop = interpolate(frame, [25, 60], [-320, 0], { ...clamp, easing: ease });
  const vines = interpolate(frame, [35, 70], [0, 1], clamp);
  const swing = Math.sin(frame / 28) * 2.2;
  const breeze = Math.sin(frame / 40) * 2.5;
  const flightT = ((frame - 70) % 260) / 260;
  const flying = frame > 70 && flightT < 0.55;
  const onkar = interpolate(frame, [50, 75], [0, 1], clamp) * interpolate(frame, [gardenFrames(events.length) - OUTRO_FRAMES - 16, gardenFrames(events.length) - OUTRO_FRAMES], [1, 0], clamp);
  const eventsStart = TEXT_START + INTRO_FRAMES;

  return (
    <AbsoluteFill style={{ background: `repeating-linear-gradient(90deg, ${C.cream} 0 46px, ${C.stripe} 46px 92px)` }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute" }}>
        <GardenDefs />
        <g transform={`translate(0 ${rise})`}>
          <Palm x={95} y={1260} h={340} lean={-70} sway={breeze} seed="palmL" />
          <Palm x={990} y={1260} h={370} lean={70} sway={-breeze} seed="palmR" />
          <JaaliWall />
          <Lawn />
          <Settee />
          <Parasol x={905} y={1560} />
          <Peacock x={250} sway={Math.sin(frame / 30) * 6} />
          <Planters />
        </g>
        {flying ? <Parrot x={-120 + flightT * 2600} y={1120 - Math.sin(flightT * Math.PI * 2) * 30} flap={(frame % 12) / 12} scale={0.9} /> : null}
        <g opacity={vines}>
          <Bougainvillea x={-30} y={-20} seed="bougL" />
          <Bougainvillea x={1110} y={-20} flip seed="bougR" />
        </g>
        <g transform={`translate(0 ${drop})`}>
          <Lamp x={190} cord={70} swing={swing} />
          <Lamp x={890} cord={70} swing={-swing} />
        </g>
      </svg>

      <div style={{ position: "absolute", top: 175, width: "100%", textAlign: "center", opacity: onkar, fontFamily: gurmukhi, fontSize: 84, color: C.textGold, lineHeight: 1 }}>
        ੴ
      </div>

      <Sequence from={TEXT_START} durationInFrames={INTRO_FRAMES} name="Intro card" premountFor={fps}>
        <Card
          lines={[
            { node: <div style={{ ...serif, fontSize: 42 }}>With the blessings of Waheguru</div> },
            { node: <div style={{ ...serif, fontSize: 42 }}>and the love of our families</div>, gap: 6 },
            { node: <div style={{ ...serif, fontSize: 54 }}>{groomFullName}</div>, gap: 36 },
            { node: <div style={{ ...scriptStyle, fontSize: 80 }}>&amp;</div>, gap: 0 },
            { node: <div style={{ ...serif, fontSize: 54 }}>{brideFullName}</div> },
            { node: <div style={{ ...serif, fontSize: 40 }}>invite you to celebrate their</div>, gap: 30 },
            { node: <div style={{ ...scriptStyle, fontSize: 165 }}>Wedding</div>, gap: 4 },
            { node: <div style={{ ...serif, fontSize: 50 }}>{dateRange}</div>, gap: 20 },
          ]}
        />
      </Sequence>

      {events.map((ev, i) => (
        <Sequence key={ev.name} from={eventsStart + i * EVENT_FRAMES} durationInFrames={EVENT_FRAMES} name={`${ev.name} card`} premountFor={fps}>
          <Card
            lines={[
              { node: <div style={{ ...serif, fontSize: 44 }}>Join us for the</div>, gap: 90 },
              { node: <div style={{ ...scriptStyle, fontSize: 210 }}>{ev.name}</div>, gap: 10 },
              { node: <div style={{ ...serif, fontSize: 54 }}>{ev.date}</div>, gap: 40 },
              { node: <div style={{ ...serif, fontSize: 54 }}>{ev.time}</div>, gap: 10 },
            ]}
          />
        </Sequence>
      ))}

      <Sequence from={eventsStart + events.length * EVENT_FRAMES} durationInFrames={OUTRO_FRAMES} name="Sign-off card" premountFor={fps}>
        <Card
          lines={[
            { node: <div style={{ ...scriptStyle, fontSize: 190 }}>With Love</div>, gap: 180 },
            { node: <div style={{ ...serif, fontSize: 60 }}>{signOff}</div>, gap: 16 },
          ]}
        />
      </Sequence>
    </AbsoluteFill>
  );
}
