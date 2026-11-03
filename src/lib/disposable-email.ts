// Throwaway inbox services. A lead from one of these can't be followed up, so the form asks for a real address.
// Kept short on purpose: the domains people actually use to dodge a form. Add more as they show up in /admin.
const disposable = new Set([
  "10minutemail.com", "10minutemail.net", "20minutemail.com", "33mail.com", "anonaddy.me", "burnermail.io",
  "byom.de", "discard.email", "dispostable.com", "dropmail.me", "emailondeck.com", "fakeinbox.com", "fakemail.net",
  "getairmail.com", "getnada.com", "guerrillamail.biz", "guerrillamail.com", "guerrillamail.de", "guerrillamail.info",
  "guerrillamail.net", "guerrillamail.org", "guerrillamailblock.com", "harakirimail.com", "inboxbear.com",
  "inboxkitten.com", "jetable.org", "mailcatch.com", "maildrop.cc", "mailinator.com", "mailinator.net",
  "mailinator2.com", "mailnesia.com", "mailpoof.com", "mailsac.com", "mailtemp.net", "mintemail.com", "mohmal.com",
  "moakt.com", "mytemp.email", "nada.email", "sharklasers.com", "spam4.me", "spambox.us", "spamgourmet.com",
  "temp-mail.io", "temp-mail.org", "tempail.com", "tempinbox.com", "tempmail.com", "tempmail.dev", "tempmail.net",
  "tempmailo.com", "tempr.email", "throwawaymail.com", "trashmail.com", "trashmail.de", "trashmail.net",
  "yopmail.com", "yopmail.fr", "yopmail.net", "emailfake.com", "fakemailgenerator.com", "minuteinbox.com",
  "mail.tm", "tmail.ws", "tmpmail.org", "tmpmail.net", "1secmail.com", "1secmail.net", "1secmail.org", "linshiyouxiang.net",
  "grr.la", "pokemail.net", "spamdecoy.net", "trbvm.com", "wegwerfmail.de", "einrot.com", "armyspy.com", "cuvox.de",
  "dayrep.com", "fleckens.hu", "gustr.com", "jourrapide.com", "rhyta.com", "superrito.com", "teleworm.us",
]);

export function isDisposableEmail(email: string) {
  const domain = email.split("@")[1]?.trim().toLowerCase();
  if (!domain) return false;
  // Catch subdomains too (for example abc.mailinator.com).
  return [...disposable].some((d) => domain === d || domain.endsWith(`.${d}`));
}
