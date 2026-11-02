import { bookingUrl } from "@/lib/booking";
import { site } from "@/lib/site";

// "Book a consult" button shown after someone sends a form. Renders nothing until NEXT_PUBLIC_BOOKING_URL is set.
export function BookingCta({ name, email, content, note }: { name?: string; email?: string; content: string; note?: string }) {
  const href = bookingUrl({ name, email }, content);
  if (!href) return null;
  return (
    <div className="mt-10">
      {note && <p className="mx-auto mb-5 max-w-md text-sm leading-7 text-muted">{note}</p>}
      <a href={href} target="_blank" rel="noopener" className="btn-primary">
        {site.booking.label}
      </a>
    </div>
  );
}
