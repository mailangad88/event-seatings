import Link from "@/components/Link";
import { LightingTool } from "@/components/tools/LightingTool";
import { ToolShell, toolMetadata } from "@/components/tools/ToolShell";
import { toolPrices } from "@/lib/tools/prices";

const slug = "lighting";
const title = "String Light Calculator for Any Space";
const description = "Enter your space and pick a pattern to get feet of bistro lights, bulb count and how many uplights, with rough Chicago prices.";

export const metadata = toolMetadata(slug, title, description);

const faqs = [
  { q: "How many feet of string lights do I need for a 20 x 40 tent?", a: "With straight runs across the 20' width every 6', a 20' x 40' tent takes 7 runs, or 140 ft. Add about 10% for sag and the drop to power and you need about 154 ft. A zigzag or starburst uses a different amount; the calculator shows each." },
  { q: "How far apart should string light runs be?", a: "There's no single rule. Runs 4' to 6' apart feel like a glowing ceiling, and 8' to 10' apart feel open and airy. Pick a gap and the calculator does the rest." },
  { q: "Why add extra length?", a: "Lights sag between poles and need to drop down to an outlet or generator. The calculator adds 10% by default, and you can change it." },
  { q: "How many uplights do I need?", a: "A common approach is one uplight every 6' to 10' of wall you want to wash with colour. The calculator starts at one every 8' around the whole space; lower it for a fuller look." },
  { q: "Do string lights need a power source nearby?", a: "Yes. Each run needs to reach an outlet or generator, and long runs may need more than one circuit. Tell your rental company where power is so they can plan cords." },
  { q: "When do I need lights at an evening event?", a: "Once the sun goes down. Sunset in Chicago is early in winter and late in June, so check your date's sunset time when you plan." },
];

export default function Page() {
  const prices = toolPrices(["string-lights", "uplight"]);
  return (
    <ToolShell
      slug={slug}
      description={description}
      title={<>How many <em className="text-gold">string lights</em> do you need?</>}
      intro="Enter the space and pick a hanging pattern. You get feet of lights, bulbs, uplights and a picture of the layout."
      answer="For straight runs, count the runs (length divided by spacing, plus one) and multiply by the width, then add about 10% for sag and the drop to power. A 20 by 40 foot tent with runs every 6 feet needs about 154 feet of string lights. Uplights: roughly one every 8 feet of wall."
      steps={[
        { title: "Measure the space", text: "Length and width in feet.", icon: "ruler" },
        { title: "Pick a pattern", text: "Straight, zigzag, starburst or edge.", icon: "light" },
        { title: "Set spacing and slack", text: "How dense, and extra for sag.", icon: "plus" },
        { title: "Price the lights", text: "Strands and uplights, then a quote.", icon: "quote" },
      ]}
      method={
        <>
          <p>Straight runs: (length ÷ spacing, rounded down, plus one) runs, each as long as the width. Zigzag: one diagonal leg for every spacing step along the length, each leg √(width² + spacing²). Starburst: eight runs from the centre to the four corners and four wall midpoints. Perimeter: twice length plus width.</p>
          <p>We then add your slack percentage. Bulbs are total feet × 12 ÷ bulb spacing in inches. Uplights are the perimeter divided by your spacing. Our catalog prices string lights per 100 ft strand, so the rough price rounds up to whole strands.</p>
          <p>Sizing a tent first? Use the <Link href="/tools/tent-size">tent size calculator</Link>. Planning the whole night? The <Link href="/tools/timeline">timeline builder</Link> reminds you when to book lighting.</p>
        </>
      }
      faqs={faqs}
    >
      <LightingTool prices={prices} />
    </ToolShell>
  );
}
