import Link from "@/components/Link";
import { DanceFloorTool } from "@/components/tools/DanceFloorTool";
import { ToolShell, toolMetadata } from "@/components/tools/ToolShell";
import { toolPrices } from "@/lib/tools/prices";

const slug = "dance-floor";
const title = "Dance Floor Size Calculator for Your Party";
const description = "Enter your guest count and how many will dance at once to get the floor size in feet and the panel count.";

export const metadata = toolMetadata(slug, title, description);

const faqs = [
  { q: "What size dance floor do I need for 150 guests?", a: "If about a quarter of guests dance at once, that's 38 dancers at 9 sq ft each. Laid out as close to square as whole panels allow, that's a 6 x 7 panel floor: 18' x 21' (42 panels). A crowd that loves to dance needs more." },
  { q: "How much space does each dancer need?", a: "This calculator uses about 9 sq ft per dancer, which is one 3' x 3' dance floor panel. Packed floors use less and swing or salsa crowds use more." },
  { q: "How many guests dance at once?", a: "It depends on the crowd, the music and the time of night, so the tool lets you choose. It starts at 25%. Move it up for a younger or dance-loving crowd, and down for a dinner-focused one." },
  { q: "What size are dance floor panels?", a: "Rental dance floors are usually built from 3' x 3' panels, plus edging around the outside. Floors are sized in multiples of 3 feet." },
  { q: "Can a dance floor go on grass?", a: "Many rental floors can go on flat, firm ground, and some need a subfloor on uneven grass. Tell your rental company your surface." },
];

export default function Page() {
  const prices = toolPrices(["dance-floor"]);
  return (
    <ToolShell
      slug={slug}
      description={description}
      title={<>How big should your <em className="text-gold">dance floor</em> be?</>}
      intro="Set your guest count and how many will dance at once. See the floor size, the panel count and a picture of the floor."
      answer="Work out how many guests will dance at once and give each one about 9 square feet, one 3 by 3 foot panel. 150 guests with a quarter dancing means 38 dancers, so an 18 by 21 foot floor of 42 panels. Round up to whole panels and add edging around the outside."
      steps={[
        { title: "Enter guests", text: "Everyone at the party.", icon: "users" },
        { title: "Pick the share dancing", text: "Your call for your crowd.", icon: "spark" },
        { title: "See the floor", text: "Size in feet and in 3' panels.", icon: "floor" },
        { title: "See your list", text: "Panel count, then a free quote.", icon: "quote" },
      ]}
      method={
        <>
          <p>Dancers are guests × your share, rounded up, with a minimum 9-panel (9&apos; x 9&apos;) floor. Each dancer gets one 3&apos; x 3&apos; panel (9 sq ft). We lay the panels out as close to square as possible, which is the shape DJs and bands usually prefer.</p>
          <p>The same figure sizes the dance floor in our <Link href="/tools/tent-size">tent size calculator</Link> and <Link href="/tools/venue-capacity">venue capacity calculator</Link>, so all three tools agree.</p>
        </>
      }
      faqs={faqs}
    >
      <DanceFloorTool prices={prices} />
    </ToolShell>
  );
}
