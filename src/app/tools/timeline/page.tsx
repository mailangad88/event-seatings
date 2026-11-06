import Link from "@/components/Link";
import { TimelineTool } from "@/components/tools/TimelineTool";
import { ToolShell, toolMetadata } from "@/components/tools/ToolShell";
import { routeExists } from "@/lib/routes";
import { tasks } from "@/lib/tools/timeline";

const slug = "timeline";
const title = "Event Planning Timeline Builder";
const description = "Enter your event date and get every task with a real deadline, from booking the venue to final rental counts and the weather call.";

export const metadata = toolMetadata(slug, title, description);

const faqs = [
  { q: "How far ahead should I start planning?", a: "The builder starts about a year out for a wedding, six months for a big milestone party, four months for a corporate event and six to eight weeks for a birthday, shower or backyard party. If your date is closer, it squeezes the tasks into the time you have and flags anything to do now." },
  { q: "When should I book event rentals?", a: "Once you have a date, a venue and a rough guest count. Popular styles and tents can be reserved early for peak weekends, so the builder places the rental quote about two-thirds of the way back from your date." },
  { q: "When are final rental counts due?", a: "It depends on the rental company. Many ask for final numbers one to two weeks before. The builder puts it two weeks out, but check your contract for the exact deadline." },
  { q: "Can I add the timeline to Google Calendar or Apple Calendar?", a: "Yes. 'Add all to my calendar' downloads an .ics file with one all-day reminder per task. Open it and your calendar app imports every date." },
  { q: "Are these deadlines rules?", a: "No. They are planning guidance to keep you ahead of the usual crunch points. Your venue and vendors' contracts set the real deadlines." },
];

export default function Page() {
  const available = [...new Set(tasks.map((t) => t.href).filter((h): h is string => !!h && routeExists(h)))];
  return (
    <ToolShell
      slug={slug}
      description={description}
      title={<>Your event timeline, <em className="text-gold">worked back</em> from the date</>}
      intro="Pick your event and date. Every planning task gets a real deadline, from the first budget talk to stacking rentals for pickup."
      answer="Start with your event date and work backward: set the budget and book the venue first, then catering, rentals and invitations. The RSVP deadline is about three weeks out, final counts to caterers and rental companies about two weeks out, and delivery details one week before. Download it all to your calendar."
      steps={[
        { title: "Pick your event", text: "Wedding, party, corporate and more.", icon: "spark" },
        { title: "Enter the date", text: "We count back from it.", icon: "calendar" },
        { title: "Work the list", text: "Each task links to the tool that does it.", icon: "check" },
        { title: "Add to calendar", text: "One file, every deadline.", icon: "arrow" },
      ]}
      method={
        <>
          <p>Each event type has a planning runway: 365 days for a wedding, 180 for a milestone party, 120 for corporate, 60 for a graduation party and 42 to 56 for birthdays, showers and backyard parties. Early tasks sit at a fixed share of that runway. The last three weeks use fixed days: RSVPs at 21 days, final counts at 14, seating at 10, delivery details at 7, the weather call at 3 and the walk-through the day before.</p>
          <p>If your date is sooner than the runway, every early task is squeezed in proportion, and anything already past is marked &quot;Do now&quot;. Outdoor events add the tent, permit and weather-call tasks. Want a live countdown to share? Try the <Link href="/countdown">event countdown</Link>.</p>
        </>
      }
      faqs={faqs}
    >
      <TimelineTool available={available} />
    </ToolShell>
  );
}
