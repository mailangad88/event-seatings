import { site } from "./site";

// "We'll be back soon" page shown on beyondchiavari.com while SITE_PAUSED is on (see src/proxy.ts).
// Turn it on:  Vercel > Project > Settings > Environment Variables > SITE_PAUSED = 1 (Production), then redeploy.
// Turn it off: delete SITE_PAUSED (or set it to 0), then redeploy.
// While it's on, the full site still works on *.vercel.app addresses so we can keep previewing.

export function sitePaused() {
  const v = process.env.SITE_PAUSED?.trim().toLowerCase();
  return v === "1" || v === "true" || v === "yes" || v === "on";
}

// Hosts that always show the full site, even while paused: Vercel preview/production addresses and local dev.
export function hostShowsFullSite(host: string | null) {
  const h = (host ?? "").toLowerCase().split(":")[0];
  return !h || h.endsWith(".vercel.app") || h === "localhost" || h === "127.0.0.1";
}

// Paths that keep working while paused: admin, the lead API and other APIs, renter accounts and proposals people
// are already paying on, search engine files, and every static file (images, fonts, scripts).
const OPEN_SECTIONS = ["/admin", "/api", "/_next", "/account", "/proposal"];

export function pathStaysOpen(pathname: string) {
  if (OPEN_SECTIONS.some((p) => pathname === p || pathname.startsWith(`${p}/`))) return true;
  // Any file with an extension (logo, favicon, images, manifest).
  return /\.[a-z0-9]{2,12}$/i.test(pathname);
}

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

// Google Search Console and Bing Webmaster Tools check the home page for these tags, so the holding page carries them too.
function verificationTags() {
  const tags: string[] = [];
  const google = process.env.NEXT_PUBLIC_GSC_VERIFICATION?.trim();
  const bing = process.env.NEXT_PUBLIC_BING_VERIFICATION?.trim();
  if (google) tags.push(`<meta name="google-site-verification" content="${esc(google)}">`);
  if (bing) tags.push(`<meta name="msvalidate.01" content="${esc(bing)}">`);
  return tags.join("\n");
}

export function holdingPageHtml() {
  const phone = esc(site.phone);
  const tel = site.phone.replace(/[^\d+]/g, "");
  const email = esc(site.email);
  const callOrText = phone ? `Call or text ${phone}` : "Email us";
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>We'll be back soon | ${esc(site.name)}</title>
<meta name="description" content="${esc(site.name)} is updating its prices and will be back soon. ${callOrText} for help with your event rentals.">
<link rel="icon" href="/brand/favicon.svg" type="image/svg+xml">
${verificationTags()}
<style>
:root{--bg:#f6efe4;--surface:#fff;--ink:#1f1916;--muted:#5c5247;--line:#dccfbb;--wine:#7a1f2e;--wine-deep:#5c1521;--gold:#835a12;--green:#2d6a3e;--rose:#a3302b;color-scheme:light}
*{box-sizing:border-box}
body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:32px 16px;background:var(--bg);color:var(--ink);font:16px/1.6 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}
main{width:100%;max-width:520px;background:var(--surface);border:1px solid var(--line);border-radius:20px;padding:36px 28px;box-shadow:0 2px 4px rgb(42 21 25/.05),0 24px 48px -20px rgb(42 21 25/.32);text-align:center}
.logo{display:block;margin:0 auto 24px;width:220px;max-width:80%;height:auto}
h1{font-family:"Cormorant Garamond",Georgia,serif;font-size:40px;line-height:1.1;margin:0 0 12px;color:var(--wine)}
p{margin:0 0 16px;color:var(--muted)}
.call{display:inline-block;margin:4px 0 8px;padding:12px 22px;border-radius:999px;background:var(--wine);color:#fff;font-weight:600;text-decoration:none}
.call:hover{background:var(--wine-deep)}
.small{font-size:14px}
a{color:var(--wine)}
hr{border:0;border-top:1px solid var(--line);margin:24px 0}
form{text-align:left;display:grid;gap:10px}
label{font-size:14px;font-weight:600;color:var(--ink)}
input{width:100%;padding:11px 14px;border:1px solid var(--line);border-radius:12px;font:inherit;background:#fff;color:var(--ink)}
input:focus{outline:2px solid var(--wine);outline-offset:1px}
button{margin-top:6px;padding:12px;border:0;border-radius:999px;background:var(--ink);color:#fff;font:inherit;font-weight:600;cursor:pointer}
button:disabled{opacity:.6}
.hp{position:absolute;left:-9999px}
#msg{margin:4px 0 0;font-size:14px}
</style>
</head>
<body>
<main>
<img class="logo" src="/brand/logo-horizontal-light.svg" alt="${esc(site.name)} logo: a chair inside an arch" width="440" height="120">
<h1>We'll be back soon</h1>
<p>We're updating our prices and will have the site open again shortly. If you're planning an event, we can still help.</p>
${phone ? `<a class="call" href="tel:${tel}">Call or text ${phone}</a>
<p class="small">Or email <a href="mailto:${email}">${email}</a></p>` : `<a class="call" href="mailto:${email}">Email ${email}</a>`}
<hr>
<form id="f" novalidate>
<p style="margin:0;color:var(--ink);font-weight:600">Want a heads-up when we're back?</p>
<p class="small" style="margin:0 0 4px">Leave your email. Add your phone and event date if you'd like us to call you about your rentals.</p>
<input class="hp" type="text" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">
<label for="email">Email</label>
<input id="email" name="email" type="email" required autocomplete="email" placeholder="you@example.com">
<label for="phone">Phone (optional)</label>
<input id="phone" name="phone" type="tel" autocomplete="tel" placeholder="312-555-0123">
<label for="event_date">Event date (optional)</label>
<input id="event_date" name="event_date" type="date">
<button type="submit">Let me know</button>
<p id="msg" role="status" aria-live="polite"></p>
</form>
</main>
<script>
(function(){
  var f=document.getElementById("f"),m=document.getElementById("msg"),b=f.querySelector("button"),t0=Date.now();
  f.addEventListener("submit",function(e){
    e.preventDefault();
    var d=Object.fromEntries(new FormData(f));
    if(!d.email||!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(d.email)){m.style.color="var(--rose)";m.textContent="Please enter a valid email address.";return;}
    var body={kind:d.phone?"call":"waitlist",source:"holding-page",email:d.email,phone:d.phone||undefined,event_date:d.event_date||undefined,website:d.website||undefined,
      email_consent:"yes",form_ms:Date.now()-t0,landing_page:location.pathname,referrer:document.referrer||undefined,
      message:"Left details on the we'll be back soon page ("+location.pathname+")",visitor_tz:(Intl.DateTimeFormat().resolvedOptions()||{}).timeZone};
    b.disabled=true;b.textContent="Sending...";m.textContent="";
    fetch("/api/leads",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)})
      .then(function(r){return r.json().catch(function(){return{}}).then(function(j){return{ok:r.ok,j:j}})})
      .then(function(x){
        if(x.ok){f.innerHTML='<p style="margin:0;text-align:center;color:var(--green);font-weight:600">Thanks. We\\'ll be in touch soon.</p>';return;}
        throw new Error((x.j&&x.j.error)||"Something went wrong. Please ${phone ? `call or text ${phone}` : `email ${email}`}.");
      })
      .catch(function(err){b.disabled=false;b.textContent="Let me know";m.style.color="var(--rose)";m.textContent=err.message||"Something went wrong. Please ${phone ? `call or text ${phone}` : `email ${email}`}.";});
  });
})();
</script>
</body>
</html>`;
}

// 503 + Retry-After tells search engines the site is down for a short while, so they keep the pages indexed.
export function holdingPageResponse() {
  return new Response(holdingPageHtml(), {
    status: 503,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Retry-After": "3600",
      "Cache-Control": "no-store",
    },
  });
}
