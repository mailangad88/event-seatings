import { Composition } from "remotion";
import { ChairShowcase, SHOWCASE_FRAMES } from "./ChairShowcase";
import { LaunchStory, STORY_FRAMES } from "./LaunchStory";

export function RemotionRoot() {
  return (
    <>
      <Composition id="ChairShowcase" component={ChairShowcase} durationInFrames={SHOWCASE_FRAMES} fps={30} width={1080} height={1350} />
      <Composition id="LaunchStory" component={LaunchStory} durationInFrames={STORY_FRAMES} fps={30} width={1080} height={1920} />
    </>
  );
}
