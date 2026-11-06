import Link from "@/components/Link";
import { LinensTool } from "@/components/tools/LinensTool";
import { ToolShell, toolMetadata } from "@/components/tools/ToolShell";
import { toolPrices } from "@/lib/tools/prices";

const slug = "linens";
const title = "Tablecloth Size Calculator for Any Table";
const description = "Pick your table size and drop length to get the right standard linen size, plus napkin and runner counts and rough rental prices.";

export const metadata = toolMetadata(slug, title, description);

const faqs = [
  { q: "What size tablecloth for a 60 inch round table?", a: "A 120\" round tablecloth reaches the floor on a standard 30\"-high 60\" round. A 90\" round gives a 15\" half drop." },
  { q: "What size tablecloth for an 8 foot banquet table?", a: "A 90\" x 156\" cloth reaches the floor on an 8' x 30\" banquet table. For lap length, a 60\" x 120\" cloth is the usual choice." },
  { q: "What size tablecloth for a 6 foot banquet table?", a: "A 90\" x 132\" cloth reaches the floor on a 6' x 30\" banquet table. A 60\" x 102\" gives lap length." },
  { q: "What is the drop on a tablecloth?", a: "The drop is how far the cloth hangs down from the table edge. Lap length is about 12\", a half drop about 15\" and floor length about 30\" on a standard table." },
  { q: "What should go on cocktail highboys?", a: "A fitted spandex cover is the usual choice because it hugs the table and the base. A floor-length round cloth tied at the waist with a sash is the other common look." },
  { q: "How many napkins do I need?", a: "One per guest plus spares for spills and the buffet. The calculator starts at 10% extra." },
];

export default function Page() {
  const prices = toolPrices(["round-floor-length", "round-lap-length", "banquet-floor-length", "banquet-lap-length", "spandex-highboy", "cloth-napkins", "table-runner"]);
  return (
    <ToolShell
      slug={slug}
      description={description}
      title={<>What size <em className="text-gold">tablecloth</em> do you need?</>}
      intro="Choose the table and how far you want the cloth to hang. We work out the size and match it to standard rental linens."
      answer="Tablecloth size is the table size plus twice the drop. A 60-inch round with a 30-inch floor-length drop needs a 120-inch round cloth. An 8-foot by 30-inch banquet table needs 90 by 156 inches to reach the floor, or 60 by 120 inches for lap length."
      steps={[
        { title: "Pick the table", text: "Round, banquet or highboy.", icon: "table" },
        { title: "Choose the drop", text: "Lap, half or floor length.", icon: "linen" },
        { title: "Count the tables", text: "Add napkins and runners if you want them.", icon: "plus" },
        { title: "Price the linens", text: "Rough cost, then a real quote.", icon: "quote" },
      ]}
      method={
        <>
          <p>Size needed is the table diameter (or width and length) plus two drops. We then pick the nearest standard size: 70, 84, 90, 96, 108, 120 or 132 inches round, or 52 x 52, 60 x 102, 60 x 120, 90 x 132 or 90 x 156 inches rectangular. Sizes within 2 inches count as a fit, because rental cloths are cut to these sizes on purpose.</p>
          <p>The drops are about 12&quot; for lap, 15&quot; for half and 30&quot; for floor length on a 30&quot;-high table. Highboys are 42&quot; tall, so floor length there means a 42&quot; drop or a spandex cover. Count your tables first with the <Link href="/tools/tables-and-chairs">tables and chairs calculator</Link>.</p>
        </>
      }
      faqs={faqs}
    >
      <LinensTool prices={prices} />
    </ToolShell>
  );
}
