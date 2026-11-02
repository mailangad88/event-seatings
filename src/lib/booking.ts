import { site } from "./site";

// The consult booking link, pre-filled with what the visitor already told us so they don't type it twice.
// Sets the name/email params HubSpot Meetings, Calendly and Cal.com each understand; unknown ones are ignored.
export function bookingUrl(person: { name?: string; email?: string } = {}, content = "site") {
  if (!site.booking.url) return "";
  let url: URL;
  try {
    url = new URL(site.booking.url);
  } catch {
    return "";
  }
  const [first, ...rest] = (person.name ?? "").trim().split(/\s+/);
  const set = (k: string, v?: string) => v && !url.searchParams.has(k) && url.searchParams.set(k, v);
  set("name", person.name?.trim());
  set("firstName", first);
  set("lastName", rest.join(" "));
  set("email", person.email?.trim());
  set("utm_source", "website");
  set("utm_medium", "booking-cta");
  set("utm_content", content);
  return url.toString();
}
