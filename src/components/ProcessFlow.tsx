import { site } from "@/lib/site";
import { StepFlow } from "./ui/StepFlow";

// How booking works, as a crawlable flowchart. Kept as a named component because many pages use it.
export function ProcessFlow({ className = "" }: { className?: string; compact?: boolean }) {
  return (
    <StepFlow
      className={className}
      caption={`How renting event items through ${site.name} works: choose your rentals, get an itemized quote, we coordinate vendors, everything is delivered and set up, then collected after the event.`}
      steps={[
        { icon: "search", title: "Choose", text: "Browse rentals or start from a styled look" },
        { icon: "quote", title: "Quote", text: "Live prices and one itemized quote" },
        { icon: "users", title: "Coordinate", text: "We confirm vendors, dates and delivery" },
        { icon: "truck", title: "Deliver & set", text: "Dropped off and set at your venue" },
        { icon: "check", title: "Collect", text: "Picked up after the last dance" },
      ]}
    />
  );
}
