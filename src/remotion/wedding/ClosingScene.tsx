import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { display, displayItalic, sans, script } from "../fonts";
import { CREAM, Divider, GOLD, GOLD_LIGHT, MAROON_DEEP, OrnateFrame, Petals, Reveal, clamp, ease } from "./theme";

export type ClosingProps = {
  readonly groomName: string;
  readonly brideName: string;
  readonly dateRange: string;
};

const PHOTO = staticFile("wedding/couple-walk-color.jpg");

// The colour photo framed in gold over a blurred copy of itself, then the sign-off.
export function ClosingScene({ groomName, brideName, dateRange }: ClosingProps) {
  const frame = useCurrentFrame();
  const open = interpolate(frame, [0, 34], [0, 1], { ...clamp, easing: ease });
  const zoom = interpolate(frame, [0, 200], [1.08, 1], clamp);

  return (
    <AbsoluteFill style={{ background: MAROON_DEEP }}>
      <Img
        src={PHOTO}
        style={{ width: "100%", height: "100%", objectFit: "cover", filter: "blur(36px) brightness(0.45)", transform: "scale(1.2)" }}
      />
      <AbsoluteFill style={{ background: "linear-gradient(to bottom, rgba(44,5,13,0.55), rgba(44,5,13,0.15) 40%, rgba(44,5,13,0.85))" }} />
      <OrnateFrame />

      <AbsoluteFill style={{ alignItems: "center", textAlign: "center", paddingTop: 170 }}>
        <Reveal at={6}>
          <div style={{ fontFamily: display, fontWeight: 300, fontSize: 92, lineHeight: 1.1, color: CREAM }}>
            Your presence is
            <br />
            our blessing
          </div>
        </Reveal>

        <div
          style={{
            marginTop: 70,
            width: 940,
            height: 627,
            padding: 10,
            border: `3px solid ${GOLD}`,
            borderRadius: 18,
            opacity: open,
            transform: `scale(${0.94 + open * 0.06})`,
            boxShadow: "0 40px 90px rgba(0,0,0,0.55)",
          }}
        >
          <div style={{ width: "100%", height: "100%", overflow: "hidden", borderRadius: 10 }}>
            <Img src={PHOTO} style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${zoom})` }} />
          </div>
        </div>

        <Reveal at={44} style={{ marginTop: 80 }}>
          <div style={{ fontFamily: script, fontSize: 130, lineHeight: 1, color: GOLD_LIGHT }}>
            {groomName}
            <span style={{ fontFamily: displayItalic, fontSize: 80, color: GOLD, margin: "0 26px" }}>&amp;</span>
            {brideName}
          </div>
        </Reveal>
        <Reveal at={62} style={{ marginTop: 40, width: "100%" }}>
          <Divider />
        </Reveal>
        <Reveal at={72} style={{ marginTop: 40 }}>
          <div style={{ fontFamily: sans, fontWeight: 500, fontSize: 40, letterSpacing: 12, color: GOLD }}>{dateRange}</div>
        </Reveal>
        <Reveal at={86} style={{ marginTop: 22 }}>
          <div style={{ fontFamily: displayItalic, fontSize: 46, color: CREAM }}>Kindly save the dates</div>
        </Reveal>
      </AbsoluteFill>
      <Petals count={30} seed="closing" />
    </AbsoluteFill>
  );
}
