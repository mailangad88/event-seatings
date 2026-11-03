import Link from "next/link";
import { ParkingTool } from "@/components/tools/ParkingTool";
import { ToolShell, toolMetadata } from "@/components/tools/ToolShell";

const slug = "parking";
const title = "Event Parking and Shuttle Calculator";
const description = "Free event parking calculator for weddings, graduation parties and backyard events. Estimate cars to park, how many spaces you're short, the size of an overflow lot and how many shuttles to book for your arrival window.";

export const metadata = toolMetadata(slug, title, description);

const faqs = [
  { q: "How many parking spaces do I need for 150 guests?", a: "If guests come two to a car and 10% arrive by rideshare, 150 guests bring about 68 cars. Fewer per car or no rideshare means more. Enter your own numbers to see your count." },
  { q: "How much space does an overflow parking field need?", a: "Planners often allow about 300 sq ft per car once you include driving lanes. Attended, tight parking can use less. The calculator lets you set it." },
  { q: "How many shuttles do I need?", a: "Divide shuttle riders by seats per vehicle times the loops each vehicle can make in your arrival window. A 30-minute round trip in a 60-minute window gives two loops per shuttle." },
  { q: "Where are the starting numbers from?", a: "They are placeholders to show a result. Guests per car, rideshare share and space per car all depend on your crowd and site, so change them." },
  { q: "Do I need permission for overflow parking?", a: "Parking on a lawn, a neighbour's lot or a closed street can need permission from your town or the property owner. Check early." },
];

export default function Page() {
  return (
    <ToolShell
      slug={slug}
      description={description}
      title={<>Where will everyone <em className="text-gold">park?</em></>}
      intro="Enter guests, how they'll arrive and the spaces at your venue. See how many cars to plan for and whether you need overflow parking or shuttles."
      answer="Take out guests arriving by shuttle, rideshare or transit, then divide the rest by guests per car. 150 guests at two per car with 10% by rideshare is about 68 cars. Subtract venue spaces to see the shortfall, and allow roughly 300 square feet per car, lanes included, for an overflow field."
      steps={[
        { title: "Guests and cars", text: "How many come per car.", icon: "users" },
        { title: "Other ways in", text: "Rideshare, transit and shuttles.", icon: "truck" },
        { title: "Venue spaces", text: "See how many you're short.", icon: "pin" },
        { title: "Plan shuttles", text: "Vehicles for your arrival window.", icon: "calendar" },
      ]}
      method={
        <>
          <p>Drivers are guests minus shuttle riders minus rideshare and transit guests. Cars are drivers ÷ guests per car, rounded up. The shortfall is cars minus venue spaces, and the overflow area is the shortfall × space per car.</p>
          <p>Each shuttle makes (arrival window ÷ round trip) loops, rounded down, with at least one. Shuttles needed = riders ÷ (seats × loops), rounded up. Planning the rest of the day? The <Link href="/tools/timeline">timeline builder</Link> and <Link href="/tools/rain-plan">rain plan checklist</Link> cover arrivals in bad weather.</p>
        </>
      }
      faqs={faqs}
    >
      <ParkingTool />
    </ToolShell>
  );
}
