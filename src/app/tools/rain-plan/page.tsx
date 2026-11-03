import Link from "next/link";
import { RainPlanTool, type RainSection } from "@/components/tools/RainPlanTool";
import { ToolShell, toolMetadata } from "@/components/tools/ToolShell";
import { firstRoute } from "@/lib/routes";

const slug = "rain-plan";
const title = "Rain Plan Checklist for Outdoor Events and Weddings";
const description = "Free rain plan checklist for outdoor weddings, graduation parties and backyard events in Chicago. Set your weather-call date, then tick off tent, sidewall, flooring, power, guest and vendor decisions. Saves in your browser and prints.";

export const metadata = toolMetadata(slug, title, description);

const sections: RainSection[] = [
  {
    id: "decide",
    title: "Decide the plan",
    items: [
      { id: "trigger", text: "Agree what forecast triggers plan B (for example, a high chance of rain, strong wind or a cold night)." },
      { id: "caller", text: "Name one person who makes the call, and when." },
      { id: "backup", text: "Pick the backup: a tent, an indoor room at the venue, a garage or covered patio, or a second date." },
      { id: "cutoff", text: "Ask your rental company their cut-off for adding a tent, sidewalls or heaters." },
    ],
  },
  {
    id: "cover",
    title: "Cover and shelter",
    items: [
      { id: "tent", text: "Size a tent for everyone seated, plus bar and buffet.", href: "/tools/tent-size" },
      { id: "walls", text: "Reserve sidewalls, even if they stay rolled up." },
      { id: "path", text: "Plan a covered or firm path from parking and the house to the tent." },
      { id: "ceremony", text: "Decide where the ceremony or speeches move if it rains." },
    ],
  },
  {
    id: "ground",
    title: "Ground and comfort",
    items: [
      { id: "floor", text: "Ask about flooring or a dance floor if the grass could be soft." },
      { id: "heat", text: "Plan heaters for cold nights or fans for hot afternoons." },
      { id: "lights", text: "Light the tent and paths: storms make it dark early.", href: "/tools/lighting" },
      { id: "power", text: "Check power for lights, heaters, music and catering, and keep cords out of puddles." },
    ],
  },
  {
    id: "people",
    title: "Guests and vendors",
    items: [
      { id: "tell", text: "Write the message you'll send guests if the plan changes (where to go, what to wear)." },
      { id: "vendors", text: "Share the backup layout and timings with caterer, DJ, photographer and rental company." },
      { id: "kit", text: "Pack towels, umbrellas for the entrance and a few floor mats." },
      { id: "layout", text: "Sketch the plan B layout so the crew can set it fast.", href: "/tools/floor-plan" },
    ],
  },
];

const faqs = [
  { q: "What is a rain plan for an outdoor event?", a: "A written backup that says what triggers it, who decides, where everything moves and who needs to know. A good one is decided weeks ahead, so on the day it's a single phone call instead of a scramble." },
  { q: "When should I make the weather call?", a: "Close enough to trust the forecast, but early enough for the rental company to add sidewalls or heaters and for guests to hear about changes. Many hosts decide two to three days out, but ask your rental company for their cut-off and set the tool to match." },
  { q: "Should I book a tent just in case?", a: "If there's no indoor backup, yes. Tents are reserved in advance and popular summer weekends can sell out. Some rental companies offer weather-dependent options, so ask about their terms." },
  { q: "Do I need sidewalls?", a: "Sidewalls block wind-driven rain and keep heat in on cool nights. In Chicago's spring and fall, having them on site is cheap insurance against a surprise front." },
  { q: "Where are my ticks saved?", a: "In this browser only. Nothing is sent to us. Print the page to share it with your planner or family." },
];

export default function Page() {
  const exists = (href: string) => firstRoute(href, "") === href;
  const items = sections.map((sec) => ({ ...sec, items: sec.items.map((i) => (i.href && !exists(i.href) ? { ...i, href: undefined } : i)) }));
  const eventDate = firstRoute("/tools/event-date", "");
  return (
    <ToolShell
      slug={slug}
      description={description}
      title={<>Your <em className="text-gold">rain plan</em>, decided early</>}
      intro="Set your event date and when you'll make the weather call. Then work through every backup decision, from sidewalls to the guest text."
      answer="A rain plan says what forecast triggers the backup, who makes the call, where guests go, and who needs to know. Reserve a tent or indoor space weeks ahead, keep sidewalls on hand, ask your rental company their cut-off for changes, and make the final call two to three days before."
      steps={[
        { title: "Set your dates", text: "Event day and your weather-call day.", icon: "calendar" },
        { title: "Work the checklist", text: "Cover, ground, power, guests.", icon: "check" },
        { title: "Use the linked tools", text: "Tent size, lighting and layout.", icon: "tent" },
        { title: "Print and share", text: "Give it to everyone who helps.", icon: "quote" },
      ]}
      method={
        <>
          <p>The key dates count back from your event date: the tent reservation date uses your rental company&apos;s cut-off, the weather call uses the days you choose, and guests hear a day after the call. Change both numbers to match your vendors.</p>
          <p>The checklist covers the decisions that most often get missed: who calls it, the path from parking, power for heaters and the message to guests. Pair it with the <Link href="/tools/tent-size">tent size calculator</Link> and the <Link href="/tools/timeline">timeline builder</Link>, which puts the weather call on your calendar.</p>
        </>
      }
      faqs={faqs}
    >
      <RainPlanTool sections={items} eventDateHref={eventDate || undefined} />
    </ToolShell>
  );
}
