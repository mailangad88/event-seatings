import { site } from "@/lib/site";
import { Icon, type IconName } from "./Icon";

const items: { icon: IconName; title: string; text: string }[] = [
  { icon: "quote", title: "One quote for everything", text: "Chairs, tables, linens and dishes on one list with prices" },
  { icon: "truck", title: "Delivery and setup", text: `Across ${site.market} and the suburbs` },
  { icon: "shield", title: "Prices locked in", text: "Your approved price won't change, and we find a backup if a rental company cancels" },
  { icon: "chat", title: "Talk to us", text: `Free ${site.callLength} call to plan your rentals` },
];

const wells = ["bg-wine-soft text-wine", "bg-blue-soft text-blue", "bg-green-soft text-green", "bg-gold-soft text-gold"];

// Value props strip, used under heroes.
export function TrustBar({ className = "" }: { className?: string }) {
  return (
    <ul className={`grid gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-4 ${className}`}>
      {items.map((i, n) => (
        <li key={i.title} className="flex items-start gap-3">
          <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${wells[n % wells.length]}`}>
            <Icon name={i.icon} size={20} />
          </span>
          <span>
            <span className="block text-sm font-semibold">{i.title}</span>
            <span className="block text-sm leading-6 text-muted">{i.text}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}
