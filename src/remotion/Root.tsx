import { Composition, Folder } from "remotion";
import { ChairShowcase, SHOWCASE_FRAMES } from "./ChairShowcase";
import { LaunchStory, STORY_FRAMES } from "./LaunchStory";
import { BlessingScene } from "./wedding/BlessingScene";
import { ClosingScene } from "./wedding/ClosingScene";
import { CoupleScene } from "./wedding/CoupleScene";
import { EventsScene } from "./wedding/EventsScene";
import { INVITE_FRAMES, SikhWeddingInvite } from "./wedding/SikhWeddingInvite";

export function RemotionRoot() {
  return (
    <>
      <Composition id="ChairShowcase" component={ChairShowcase} durationInFrames={SHOWCASE_FRAMES} fps={30} width={1080} height={1350} />
      <Composition id="LaunchStory" component={LaunchStory} durationInFrames={STORY_FRAMES} fps={30} width={1080} height={1920} />
      <Folder name="Wedding">
        <Composition
          id="SikhWeddingInvite"
          component={SikhWeddingInvite}
          durationInFrames={INVITE_FRAMES}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{
            groomName: "Ramneet",
            brideName: "Nehal",
            groomFullName: "Ramneet Singh Sawhney",
            brideFullName: "Nehal Kaur",
            year: 2027,
            dateRange: "21 – 24 OCTOBER 2027",
            events: [
              { name: "Haldi", note: "Turmeric, blessings and laughter", weekday: "Thursday", day: 21, month: "October", time: "4:00 PM" },
              { name: "Jaggo", note: "Bhangra, boliyan and lanterns", weekday: "Friday", day: 22, month: "October", time: "6:00 PM" },
              { name: "Anand Karaj", note: "The wedding ceremony", weekday: "Saturday", day: 23, month: "October", time: "10:00 AM" },
              { name: "Reception", note: "Dinner, dancing and celebration", weekday: "Sunday", day: 24, month: "October", time: "6:00 PM" },
            ],
          }}
        />
        <Folder name="Wedding-Scenes">
          <Composition id="WeddingBlessing" component={BlessingScene} durationInFrames={165} fps={30} width={1080} height={1920} />
          <Composition
            id="WeddingCouple"
            component={CoupleScene}
            durationInFrames={180}
            fps={30}
            width={1080}
            height={1920}
            defaultProps={{ groomName: "Ramneet", brideName: "Nehal", groomFullName: "Ramneet Singh Sawhney", brideFullName: "Nehal Kaur" }}
          />
          <Composition
            id="WeddingEvents"
            component={EventsScene}
            durationInFrames={300}
            fps={30}
            width={1080}
            height={1920}
            defaultProps={{
              year: 2027,
              events: [
                { name: "Haldi", note: "Turmeric, blessings and laughter", weekday: "Thursday", day: 21, month: "October", time: "4:00 PM" },
                { name: "Jaggo", note: "Bhangra, boliyan and lanterns", weekday: "Friday", day: 22, month: "October", time: "6:00 PM" },
                { name: "Anand Karaj", note: "The wedding ceremony", weekday: "Saturday", day: 23, month: "October", time: "10:00 AM" },
                { name: "Reception", note: "Dinner, dancing and celebration", weekday: "Sunday", day: 24, month: "October", time: "6:00 PM" },
              ],
            }}
          />
          <Composition
            id="WeddingClosing"
            component={ClosingScene}
            durationInFrames={195}
            fps={30}
            width={1080}
            height={1920}
            defaultProps={{ groomName: "Ramneet", brideName: "Nehal", dateRange: "21 – 24 OCTOBER 2027" }}
          />
        </Folder>
      </Folder>
    </>
  );
}
