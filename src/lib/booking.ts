// Where "schedule a call" buttons go. Set NEXT_PUBLIC_BOOKING_URL to a Calendly/Cal.com link
// to send visitors straight to a calendar; until then they land on the quote form.
export const bookingUrl = process.env.NEXT_PUBLIC_BOOKING_URL || "/quote";
export const bookingIsExternal = /^https?:\/\//.test(bookingUrl);
