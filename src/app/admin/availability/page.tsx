import { redirect } from "next/navigation";

// Blocking dates now lives on the calendar (Block a day, or click a day). Old links land there.
export default async function AvailabilityPage(props: PageProps<"/admin/availability">) {
  const sp = await props.searchParams;
  const month = typeof sp.month === "string" && /^\d{4}-\d{2}$/.test(sp.month) ? sp.month : "";
  redirect(month ? `/admin/calendar?month=${month}` : "/admin/calendar");
}
