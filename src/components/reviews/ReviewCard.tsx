import type { Review } from "@/lib/reviews";
import { displayName } from "@/lib/reviews";
import { Stars } from "./Stars";

const monthLabel = (m?: string) =>
  m ? new Date(`${m}-15T12:00:00`).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : undefined;

export function ReviewCard({ review }: { review: Review }) {
  const meta = [review.event_type, review.city, monthLabel(review.event_month)].filter(Boolean).join(" · ");
  return (
    <article className="card flex h-full flex-col p-6" itemScope itemType="https://schema.org/Review">
      <div className="flex items-center justify-between gap-3">
        <Stars rating={review.rating} />
        {review.verified && <span className="badge">Verified booking</span>}
      </div>
      {review.title && <h3 className="display-3 mt-4" itemProp="name">{review.title}</h3>}
      <p className="mt-3 flex-1 leading-7 whitespace-pre-line" itemProp="reviewBody">{review.body}</p>
      <p className="mt-5 text-sm">
        <span className="font-medium" itemProp="author">{displayName(review.name)}</span>
        {meta && <span className="text-muted"> · {meta}</span>}
      </p>
      {review.owner_reply && (
        <div className="well mt-4 p-4 text-sm leading-6">
          <p className="eyebrow">Our reply</p>
          <p className="mt-2 text-muted">{review.owner_reply}</p>
        </div>
      )}
    </article>
  );
}
