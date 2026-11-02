import { site } from "@/lib/site";
import { Icon, type IconName } from "./Icon";

const items: { icon: IconName; title: string; text: string }[] = [
  { icon: "quote", title: "One quote, every rental", text: "Chairs to chafers on a single itemized quote" },
  { icon: "truck", title: "Delivered & set up", text: `Across ${site.market} and the suburbs` },
  { icon: "shield", title: "Booking Promise", text: "Insured vendors, price lock and a backup guarantee" },
  { icon: "chat", title: "Real humans", text: `Free ${site.callLength} planning call` },
];

// Value props strip, used under heroes.
export function TrustBar({ className = "" }: { className?: string }) {
  return (
    <ul className={`grid grid-cols-2 gap-x-6 gap-y-6 lg:grid-cols-4 ${className}`}>
      {items.map((i) => (
        <li key={i.title} className="flex items-start gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gold-soft text-gold">
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
