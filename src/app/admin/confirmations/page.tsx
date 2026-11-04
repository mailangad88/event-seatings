import { redirect } from "next/navigation";

// Rental partner confirmations live on a tab of the orders page.
export default function ConfirmationsPage() {
  redirect("/admin/orders?tab=confirmations");
}
