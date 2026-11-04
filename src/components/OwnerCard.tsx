import Image from "next/image";
import Link from "@/components/Link";
import { site } from "@/lib/site";
import { Icon, type IconName } from "./ui/Icon";

// "Who you'll talk to": the owner's name, what he does on every booking, and how to reach him.
// A new business with no reviews yet earns trust with a real person, so this sits on the home page,
// /book, /pricing, /about and the thank-you screens. No server-only imports: it also renders inside client forms.

const points: [IconName, string][] = [
  ["quote", "Reads every quote request himself"],
  ["phone", "Calls each rental company to check your date"],
  ["users", "Stays your one contact from the first call to pickup"],
];

function Portrait({ size }: { size: number }) {
  const { owner } = site;
  const initials = owner.name
    .split(" ")
    .map((w) => w[0])
    .join("");
  return owner.photo ? (
    <Image src={owner.photo} alt={`${owner.name}, ${owner.role.toLowerCase()} of ${site.name}`} width={size} height={size} className="shrink-0 rounded-full object-cover" />
  ) : (
    <span
      aria-hidden
      style={{ width: size, height: size, fontSize: size * 0.36 }}
      className="grid shrink-0 place-items-center rounded-full bg-wine font-heading font-semibold text-white"
    >
      {initials}
    </span>
  );
}

export function OwnerCard({ source, compact = false, className = "" }: { source: string; compact?: boolean; className?: string }) {
  const { owner } = site;
  if (compact) {
    return (
      <div className={`flex items-center gap-4 rounded-2xl border border-line bg-surface p-4 text-left ${className}`}>
        <Portrait size={56} />
        <p className="text-sm leading-6">
          <strong className="font-medium">{owner.name}</strong>, {owner.role.toLowerCase()}, reads every request himself and will be your one
          contact. Questions before then? Email{" "}
          <a href={`mailto:${site.email}`} className="link">{site.email}</a>
          {site.phone && (
            <>
              {" "}or call <a href={`tel:${site.phone}`} className="link whitespace-nowrap">{site.phone}</a>
            </>
          )}
          .
        </p>
      </div>
    );
  }
  return (
    <div className={`card grid gap-8 p-6 sm:p-10 md:grid-cols-[auto_1fr] md:items-center ${className}`}>
      <Portrait size={128} />
      <div>
        <p className="eyebrow">Who you&apos;ll talk to</p>
        <h2 className="display-2 mt-3">
          {owner.name}, {owner.role.toLowerCase()}
        </h2>
        <p className="lede mt-4 max-w-2xl">
          {site.name} is a small, locally owned business in {site.locality}. When you send a list or book a call, you
          deal with {owner.first} from start to finish.
        </p>
        <ul className="mt-6 grid gap-3 sm:grid-cols-3">
          {points.map(([icon, text]) => (
            <li key={text} className="flex gap-2 text-sm">
              <Icon name={icon} size={18} className="mt-0.5 shrink-0 text-gold" />
              {text}
            </li>
          ))}
        </ul>
        <div className="cta-row mt-8 items-center">
          <Link href={`/book?from=${source}`} className="btn-primary">
            Book a free {site.callLength} call <Icon name="arrow" size={16} />
          </Link>
          {site.phone ? (
            <a href={`tel:${site.phone}`} className="link-line">Call {site.phone}</a>
          ) : (
            <a href={`mailto:${site.email}`} className="link-line">Email {site.email}</a>
          )}
        </div>
      </div>
    </div>
  );
}
