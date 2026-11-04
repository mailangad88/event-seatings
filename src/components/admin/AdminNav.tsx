import type { OfficeNavGroup } from "@/components/office/OfficeNav";

// The admin sidebar, grouped by the job: daily work, customers, rental partners, money, growth, setup.
// Add a new admin page here and it shows in the sidebar and the phone menu.
export const adminNav: OfficeNavGroup[] = [
  {
    group: "Daily",
    items: [
      { href: "/admin", label: "Today", icon: "home" },
      { href: "/admin/alerts", label: "Notifications", icon: "bell" },
      { href: "/admin/calls", label: "Call list", icon: "phone" },
      { href: "/admin/deliveries", label: "Deliveries", icon: "truck" },
      { href: "/admin/week", label: "This week", icon: "clock" },
      { href: "/admin/calendar", label: "Calendar", icon: "calendar" },
    ],
  },
  {
    group: "Customers",
    items: [
      { href: "/admin/pipeline", label: "Pipeline", icon: "list" },
      { href: "/admin/leads", label: "Leads", icon: "inbox" },
      { href: "/admin/proposals", label: "Proposals", icon: "quote" },
      { href: "/admin/customers", label: "Customers", icon: "users" },
      { href: "/admin/messages", label: "Messages", icon: "chat" },
    ],
  },
  {
    group: "Rental partners",
    items: [
      { href: "/admin/orders", label: "Orders by vendor", icon: "route" },
      { href: "/admin/vendors", label: "Vendors", icon: "truck" },
      { href: "/admin/applications", label: "Applications", icon: "plus" },
      { href: "/admin/pricing", label: "Pricing", icon: "chart" },
    ],
  },
  {
    group: "Money",
    items: [
      { href: "/admin/payments", label: "Payments", icon: "wallet" },
      { href: "/admin/invoices", label: "Invoices", icon: "quote" },
    ],
  },
  {
    group: "Grow",
    items: [
      { href: "/admin/reports", label: "Reports", icon: "chart" },
      { href: "/admin/scheduled", label: "Email schedule", icon: "mail" },
      { href: "/admin/followups", label: "Follow-up emails", icon: "mail" },
      { href: "/admin/reminders", label: "Reminder emails", icon: "clock" },
      { href: "/admin/emails", label: "Email previews", icon: "quote" },
      { href: "/admin/reviews", label: "Reviews", icon: "star" },
      { href: "/admin/referrals", label: "Referrals", icon: "heart" },
    ],
  },
  {
    group: "Setup",
    items: [{ href: "/admin/settings", label: "Site settings", icon: "sliders" }],
  },
];
