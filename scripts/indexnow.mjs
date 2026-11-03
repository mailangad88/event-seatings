// Tells Bing, Yandex, Seznam and other IndexNow engines that pages changed, so they recrawl them sooner.
// Run after a deploy, once beyondchiavari.com serves this site:  npm run indexnow            (all sitemap URLs)
//                                                              npm run indexnow -- /quote /glossary   (just these)
// The key file public/828031dd25f8c09a964b03bc54b05dcc.txt must be live at https://beyondchiavari.com/828031dd25f8c09a964b03bc54b05dcc.txt first.
// Google does not use IndexNow; resubmit the sitemap in Search Console for Google.
const KEY = "828031dd25f8c09a964b03bc54b05dcc";
const host = process.env.INDEXNOW_HOST ?? "beyondchiavari.com";
const base = `https://${host}`;

const args = process.argv.slice(2);
let urls = args.map((p) => (p.startsWith("http") ? p : base + p));
if (!urls.length) {
  const xml = await (await fetch(`${base}/sitemap.xml`)).text();
  urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
}
const keyCheck = await fetch(`${base}/${KEY}.txt`).then((r) => r.text()).catch(() => "");
if (keyCheck.trim() !== KEY) {
  console.error(`Key file not live at ${base}/${KEY}.txt yet. Deploy first (and point the domain).`);
  process.exit(1);
}
for (let i = 0; i < urls.length; i += 10000) {
  const res = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "content-type": "application/json; charset=utf-8" },
    body: JSON.stringify({ host, key: KEY, keyLocation: `${base}/${KEY}.txt`, urlList: urls.slice(i, i + 10000) }),
  });
  console.log(`IndexNow: ${Math.min(i + 10000, urls.length)}/${urls.length} URLs, HTTP ${res.status}`);
}
