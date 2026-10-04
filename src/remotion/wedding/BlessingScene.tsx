import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { display, displayItalic, gurmukhi, sans } from "../fonts";
import { Backdrop, CREAM, Divider, GOLD, GOLD_LIGHT, OrnateFrame, Petals, Reveal, clamp, ease } from "./theme";

// Opens with Ik Onkar and the Anand Karaj couplet from Guru Amar Das Ji (Ang 788).
export function BlessingScene() {
  const frame = useCurrentFrame();
  const glow = interpolate(frame, [0, 40], [0, 1], { ...clamp, easing: ease });
  const scale = interpolate(frame, [0, 60], [0.86, 1], { ...clamp, easing: ease });

  return (
    <AbsoluteFill>
      <Backdrop />
      <Petals count={18} seed="blessing" />
      <OrnateFrame />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", textAlign: "center", padding: "0 120px" }}>
        <div
          style={{
            fontFamily: gurmukhi,
            fontWeight: 600,
            fontSize: 260,
            lineHeight: 1,
            color: GOLD_LIGHT,
            opacity: glow,
            transform: `scale(${scale})`,
            textShadow: `0 0 ${60 * glow}px rgba(243, 220, 164, 0.55)`,
          }}
        >
          ੴ
        </div>
        <Reveal at={24} style={{ marginTop: 40 }}>
          <div style={{ fontFamily: sans, fontSize: 30, letterSpacing: 12, textTransform: "uppercase", color: GOLD }}>
            With the blessings of Waheguru
          </div>
        </Reveal>
        <Reveal at={40} style={{ marginTop: 56, width: "100%" }}>
          <Divider />
        </Reveal>
        <Reveal at={52} style={{ marginTop: 56 }}>
          <div style={{ fontFamily: gurmukhi, fontSize: 54, lineHeight: 1.6, color: CREAM }}>
            ਧਨ ਪਿਰੁ ਏਹਿ ਨ ਆਖੀਅਨਿ
            <br />
            ਬਹਨਿ ਇਕਠੇ ਹੋਇ ॥
            <br />
            ਏਕ ਜੋਤਿ ਦੁਇ ਮੂਰਤੀ
            <br />
            ਧਨ ਪਿਰੁ ਕਹੀਐ ਸੋਇ ॥
          </div>
        </Reveal>
        <Reveal at={78} style={{ marginTop: 50 }}>
          <div style={{ fontFamily: displayItalic, fontSize: 46, lineHeight: 1.35, color: GOLD_LIGHT }}>
            “They are not husband and wife who merely sit together.
            <br />
            They alone are husband and wife who have
            <br />
            one light in two bodies.”
          </div>
        </Reveal>
        <Reveal at={96} style={{ marginTop: 30 }}>
          <div style={{ fontFamily: display, fontWeight: 300, fontSize: 30, letterSpacing: 6, color: GOLD }}>
            SRI GURU GRANTH SAHIB JI · ANG 788
          </div>
        </Reveal>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}
