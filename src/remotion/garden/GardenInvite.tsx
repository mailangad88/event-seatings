import { Audio } from "@remotion/media";
import { AbsoluteFill, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { CollageScene } from "./CollageScene";
import { GardenScene, gardenFrames, type GardenEvent } from "./GardenScene";
import { clamp, ease } from "./palette";

export type GardenInviteProps = {
  readonly monogram: string;
  readonly groomFullName: string;
  readonly brideFullName: string;
  readonly signOff: string;
  readonly dateRange: string;
  readonly events: readonly GardenEvent[];
  // File in public/, e.g. "wedding/song.mp3". Leave empty to export without music.
  readonly music: string;
  readonly musicStartSeconds: number;
};

const COLLAGE_FRAMES = 240;
const SLIDE = 45;

export function gardenInviteFrames(eventCount: number) {
  return COLLAGE_FRAMES - SLIDE + gardenFrames(eventCount);
}

// 9:16 Mughal-garden invitation: a painted collage with the monogram slides away to a garden scene.
export function GardenInvite({ monogram, groomFullName, brideFullName, signOff, dateRange, events, music, musicStartSeconds }: GardenInviteProps) {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const lift = interpolate(frame, [COLLAGE_FRAMES - SLIDE, COLLAGE_FRAMES], [0, -1920], { ...clamp, easing: ease });

  return (
    <AbsoluteFill>
      {music ? (
        <Audio
          src={staticFile(music)}
          trimBefore={Math.round(musicStartSeconds * fps)}
          volume={(f) => interpolate(f, [0, fps, durationInFrames - 2 * fps, durationInFrames], [0, 0.9, 0.9, 0], clamp)}
        />
      ) : null}
      <Sequence from={COLLAGE_FRAMES - SLIDE} name="Garden" premountFor={fps}>
        <GardenScene groomFullName={groomFullName} brideFullName={brideFullName} signOff={signOff} dateRange={dateRange} events={events} />
      </Sequence>
      <Sequence durationInFrames={COLLAGE_FRAMES} name="Collage" style={{ transform: `translateY(${lift}px)` }}>
        <CollageScene monogram={monogram} />
      </Sequence>
    </AbsoluteFill>
  );
}
