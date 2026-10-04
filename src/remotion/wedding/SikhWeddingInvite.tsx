import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { useVideoConfig } from "remotion";
import { BlessingScene } from "./BlessingScene";
import { ClosingScene } from "./ClosingScene";
import { CoupleScene } from "./CoupleScene";
import { EventsScene, type WeddingEvent } from "./EventsScene";

export type InviteProps = {
  readonly groomName: string;
  readonly brideName: string;
  readonly groomFullName: string;
  readonly brideFullName: string;
  readonly year: number;
  readonly dateRange: string;
  readonly events: readonly WeddingEvent[];
};

const CROSSFADE = 20;
// Blessing 165 + Couple 180 + Events 300 + Closing 195, minus three crossfades.
export const INVITE_FRAMES = 165 + 180 + 300 + 195 - 3 * CROSSFADE;

// 9:16 animated Anand Karaj invitation, sized for WhatsApp and Instagram stories.
export function SikhWeddingInvite({ groomName, brideName, groomFullName, brideFullName, year, dateRange, events }: InviteProps) {
  const { fps } = useVideoConfig();
  const crossfade = <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: CROSSFADE })} />;

  return (
    <TransitionSeries>
      <TransitionSeries.Sequence name="Blessing" durationInFrames={165} premountFor={fps}>
        <BlessingScene />
      </TransitionSeries.Sequence>
      {crossfade}
      <TransitionSeries.Sequence name="Couple" durationInFrames={180} premountFor={fps}>
        <CoupleScene groomName={groomName} brideName={brideName} groomFullName={groomFullName} brideFullName={brideFullName} />
      </TransitionSeries.Sequence>
      {crossfade}
      <TransitionSeries.Sequence name="Events" durationInFrames={300} premountFor={fps}>
        <EventsScene year={year} events={events} />
      </TransitionSeries.Sequence>
      {crossfade}
      <TransitionSeries.Sequence name="Closing" durationInFrames={195} premountFor={fps}>
        <ClosingScene groomName={groomName} brideName={brideName} dateRange={dateRange} />
      </TransitionSeries.Sequence>
    </TransitionSeries>
  );
}
