import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { display, displayItalic, sans, script } from "../fonts";
import { Backdrop, CREAM, GOLD, GOLD_LIGHT, OrnateFrame, Petals, Reveal, clamp, ease } from "./theme";

export type CoupleProps = {
  readonly groomName: string;
  readonly brideName: string;
  readonly groomFullName: string;
  readonly brideFullName: string;
};

const ARCH_W = 760;
const ARCH_H = 1000;

// The black-and-white portrait inside a mehrab (arch), with the couple's names below.
export function CoupleScene({ groomName, brideName, groomFullName, brideFullName }: CoupleProps) {
  const frame = useCurrentFrame();
  const open = interpolate(frame, [0, 36], [0, 1], { ...clamp, easing: ease });
  const zoom = interpolate(frame, [0, 180], [1.14, 1.02], clamp);

  return (
    <AbsoluteFill>
      <Backdrop />
      <OrnateFrame />
      <AbsoluteFill style={{ alignItems: "center", textAlign: "center", paddingTop: 150 }}>
        <Reveal at={4}>
          <div style={{ fontFamily: sans, fontSize: 30, letterSpacing: 12, textTransform: "uppercase", color: GOLD }}>
            Together with their families
          </div>
        </Reveal>

        <div
          style={{
            marginTop: 50,
            width: ARCH_W,
            height: ARCH_H,
            padding: 12,
            borderRadius: `${ARCH_W / 2}px ${ARCH_W / 2}px 24px 24px`,
            border: `3px solid ${GOLD}`,
            opacity: open,
            transform: `translateY(${(1 - open) * 50}px)`,
            boxShadow: "0 40px 80px rgba(0,0,0,0.45)",
          }}
        >
          <div
            style={{
              width: "100%",
              height: "100%",
              overflow: "hidden",
              borderRadius: `${ARCH_W / 2 - 12}px ${ARCH_W / 2 - 12}px 14px 14px`,
            }}
          >
            <Img
              src={staticFile("wedding/couple-walk-bw.jpg")}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: "50% 40%",
                transform: `scale(${zoom})`,
              }}
            />
          </div>
        </div>

        <Reveal at={40} style={{ marginTop: 56 }}>
          <div style={{ fontFamily: script, fontSize: 150, lineHeight: 1, color: GOLD_LIGHT }}>
            {groomName}
            <span style={{ fontFamily: displayItalic, fontSize: 90, color: GOLD, margin: "0 30px" }}>&amp;</span>
            {brideName}
          </div>
        </Reveal>
        <Reveal at={52} style={{ marginTop: 26 }}>
          <div style={{ fontFamily: sans, fontSize: 30, letterSpacing: 8, textTransform: "uppercase", color: GOLD }}>
            {groomFullName} · {brideFullName}
          </div>
        </Reveal>
        <Reveal at={64} style={{ marginTop: 30 }}>
          <div style={{ fontFamily: display, fontWeight: 300, fontSize: 48, lineHeight: 1.3, color: CREAM }}>
            request the pleasure of your company
            <br />
            as they begin their journey together
          </div>
        </Reveal>
      </AbsoluteFill>
      <Petals count={14} seed="couple" />
    </AbsoluteFill>
  );
}
