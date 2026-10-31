import { Composition } from "remotion";
import { ChairShowcase, SHOWCASE_FRAMES } from "./ChairShowcase";
import { LaunchStory, STORY_FRAMES } from "./LaunchStory";
import { DECOR_THEMES, DecorReel, REEL_FPS, REEL_FRAMES } from "./DecorReel";

export function RemotionRoot() {
  return (
    <>
      <Composition id="ChairShowcase" component={ChairShowcase} durationInFrames={SHOWCASE_FRAMES} fps={30} width={1080} height={1350} />
      <Composition id="LaunchStory" component={LaunchStory} durationInFrames={STORY_FRAMES} fps={30} width={1080} height={1920} />
      {DECOR_THEMES.map((t) => (
        <Composition
          key={t.id}
          id={`DecorReel-${t.id}`}
          component={DecorReel}
          defaultProps={{ theme: t.id }}
          durationInFrames={REEL_FRAMES}
          fps={REEL_FPS}
          width={1080}
          height={1920}
        />
      ))}
    </>
  );
}
