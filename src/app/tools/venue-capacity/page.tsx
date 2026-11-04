import Link from "@/components/Link";
import { VenueCapacityTool } from "@/components/tools/VenueCapacityTool";
import { ToolShell, toolMetadata } from "@/components/tools/ToolShell";
import { firstRoute } from "@/lib/routes";

const slug = "venue-capacity";
const title = "Venue Capacity Calculator: How Many Guests Fit in a Room?";
const description = "Free venue capacity calculator. Enter room length and width to see how many guests fit for a seated dinner, banquet tables, ceremony rows, a cocktail party or a classroom layout, after space for a dance floor, bar and buffet.";

export const metadata = toolMetadata(slug, title, description);

const faqs = [
  { q: "How do I work out how many people fit in a room?", a: "Multiply length by width for the square feet, take off space you can't use and space for the dance floor, bar, buffet or stage. Then divide by the square feet each guest needs for your layout." },
  { q: "How many square feet per person for a seated dinner?", a: "About 10 to 12 sq ft per guest is a common planning figure for dinner at tables, including aisles. This tool uses 12 for round tables and 10 for long banquet tables." },
  { q: "Is this the legal capacity of my venue?", a: "No. The legal limit is the occupancy posted by the fire marshal or listed in your venue contract, and it always wins. Enter it in the tool and results are capped at that number." },
  { q: "What is usable floor?", a: "The part of the room you can actually put tables on. Columns, doorways, fireplaces, built-in bars and odd corners all take floor away. Start around 85% and lower it for awkward rooms." },
  { q: "How do I see the layout?", a: "Use the floor plan builder to drag tables into a room of your size. Or book a free call and we'll sketch it with you." },
];

export default function Page() {
  const floorPlan = firstRoute("/tools/floor-plan", "");
  return (
    <ToolShell
      slug={slug}
      description={description}
      title={<>How many guests will <em className="text-gold">this room</em> hold?</>}
      intro="Enter the room size and what else needs floor space. See the capacity for every common layout, and whether your guest list fits."
      answer="Room capacity is usable square feet divided by the space each guest needs: about 12 sq ft for round-table dinners, 10 for banquet tables, 8 for a standing cocktail party, 7 for ceremony rows and 18 for classroom tables. Take out space for the dance floor, bar and buffet first, and never exceed the posted occupancy limit."
      steps={[
        { title: "Measure the room", text: "Length and width in feet.", icon: "ruler" },
        { title: "Take off what you can't use", text: "Columns, doors and odd corners.", icon: "minus" },
        { title: "Reserve space", text: "Dance floor, bar, buffet and stage.", icon: "floor" },
        { title: "See every layout", text: "Dinner, ceremony, cocktail, classroom.", icon: "users" },
      ]}
      method={
        <>
          <p>Usable floor is length times width times your usable percentage, minus the space you reserve. Capacity for each layout is that number divided by the square feet per guest, rounded down: 12 for rounds, 10 for banquet tables, 7 for ceremony rows, 8 for a cocktail party and 18 for classroom tables.</p>
          <p>These are planning figures, not a building code. The posted occupancy limit from the fire marshal is the legal maximum. To work out the space for extras, use the <Link href="/tools/tent-size">tent size calculator</Link>, which breaks it down line by line.</p>
        </>
      }
      faqs={faqs}
    >
      <VenueCapacityTool floorPlanHref={floorPlan || undefined} />
    </ToolShell>
  );
}
