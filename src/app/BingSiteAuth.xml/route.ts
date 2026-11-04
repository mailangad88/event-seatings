// Bing Webmaster Tools ownership file. Bing's "XML file" option asks for /BingSiteAuth.xml; the code inside it is the
// same one as the meta tag, so set NEXT_PUBLIC_BING_VERIFICATION in Vercel and both options work.
// It has a file extension, so it stays reachable while the "we'll be back" page is on (src/lib/holding-page.ts).
export function GET() {
  const code = process.env.NEXT_PUBLIC_BING_VERIFICATION?.trim();
  if (!code) return new Response("Not found", { status: 404 });
  const xml = `<?xml version="1.0"?>\n<users>\n\t<user>${code.replace(/[^A-Za-z0-9]/g, "")}</user>\n</users>\n`;
  return new Response(xml, { headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=3600" } });
}
