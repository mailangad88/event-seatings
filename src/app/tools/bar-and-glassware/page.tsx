import Link from "next/link";
import { BarTool } from "@/components/tools/BarTool";
import { ToolShell, toolMetadata } from "@/components/tools/ToolShell";
import { toolPrices } from "@/lib/tools/prices";

const slug = "bar-and-glassware";
const title = "Bar and Glassware Calculator: Drinks, Bottles and Glasses";
const description = "Free bar calculator for weddings and parties. Work out total drinks, bottles of wine and spirits, beer, ice and bartenders for your guests and hours, plus every wine, beer, rocks and champagne glass to rent, with Chicago rental prices.";

export const metadata = toolMetadata(slug, title, description);

const faqs = [
  { q: "How many drinks per guest should I plan for?", a: "A common planning rule is two drinks per guest in the first hour and one per hour after that. It's a rule of thumb, not a measurement, so the calculator lets you change both numbers for your crowd." },
  { q: "How many glasses of wine are in a bottle?", a: "A 750 ml bottle holds about 25 oz, which pours five 5 oz glasses." },
  { q: "How many drinks are in a bottle of liquor?", a: "A 750 ml bottle pours about sixteen 1.5 oz drinks." },
  { q: "How many glasses should I rent?", a: "If the bar washes and reuses glasses, about one of each type per guest. If not, plan more, because guests put glasses down and take a fresh one. Ask your caterer whether they wash glasses during the event." },
  { q: "How much ice do I need?", a: "The calculator starts at 1.5 lb per guest. Go higher in summer or if ice also chills bottles and drinks in tubs." },
  { q: "How many bartenders do I need?", a: "That's a staffing choice that trades cost for shorter lines. The calculator starts at one bartender per 75 guests; lower it for a busier bar or a cocktail-heavy menu." },
];

export default function Page() {
  const prices = toolPrices(["wine-glass", "pilsner-glass", "rocks-glass", "highball-glass", "champagne-flute", "water-goblet", "portable-bar"]);
  return (
    <ToolShell
      slug={slug}
      description={description}
      title={<>How much will your <em className="text-gold">bar</em> need?</>}
      intro="Set your guests, hours and what people drink. Get drinks, bottles, ice, bartenders and every glass to rent."
      answer="Plan about two drinks per guest in the first hour and one per hour after. 120 guests over five hours is about 720 drinks. A bottle of wine pours five glasses and a 750 ml bottle of spirits about sixteen drinks. Rent one glass of each type per guest if the bar washes glasses, more if it doesn't."
      steps={[
        { title: "Guests and hours", text: "Only guests of drinking age.", icon: "users" },
        { title: "Drink mix", text: "Wine, beer, cocktails, soft drinks.", icon: "glass" },
        { title: "Glasses and ice", text: "How many per guest, and the toast.", icon: "plus" },
        { title: "Price the glassware", text: "Rough cost, then a quote.", icon: "quote" },
      ]}
      method={
        <>
          <p>Drinks per guest = first-hour drinks + later drinks × (hours − 1). Total drinks are split by your mix. Wine bottles = wine drinks ÷ 5; spirit bottles = cocktail drinks ÷ 16; beer and soft drinks count one per serving. All are rounded up.</p>
          <p>Glassware is guests × glasses per guest for each drink type you serve, plus one flute per guest for a toast and one water goblet per seat if chosen. Bartenders are guests ÷ your guests-per-bartender, and bars assume two bartenders each. Count your tables with the <Link href="/tools/tables-and-chairs">tables and chairs calculator</Link> and cocktail highboys there too.</p>
        </>
      }
      faqs={faqs}
    >
      <BarTool prices={prices} />
    </ToolShell>
  );
}
