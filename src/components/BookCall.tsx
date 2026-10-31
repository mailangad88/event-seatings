import Link from "next/link";
import { site } from "@/lib/site";

// The primary next step after any lead form: a 15-minute styling call.
// Falls back to the quote form until NEXT_PUBLIC_BOOKING_URL is set.
export function BookCall({ chairs = [], className = "btn-primary", label }: { chairs?: string[]; className?: string; label?: string }) {
  if (site.bookingUrl) {
    return (
      <a href={site.bookingUrl} target="_blank" rel="noopener" className={className}>
        {label ?? "Book a 15-min styling call"}
      </a>
    );
  }
  const href = chairs.length ? `/quote?chairs=${chairs.join(",")}` : "/quote";
  return (
    <Link href={href} className={className}>
      {label ?? "Get my personal quote"}
    </Link>
  );
}
