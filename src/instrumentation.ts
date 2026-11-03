import type { Instrumentation } from "next";

// Server error alerts: every error Next.js captures (pages, route handlers, server actions) is
// reported through src/lib/alerts.ts. See SITE_LOG.md "Uptime and error alerts".
export const onRequestError: Instrumentation.onRequestError = async (err, request, context) => {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const { sendAlert } = await import("@/lib/alerts");
  const e = err as { message?: string; digest?: string };
  await sendAlert("Server error", {
    message: e?.message ?? String(err),
    digest: e?.digest,
    path: request.path,
    method: request.method,
    route: context.routePath,
    type: context.routeType,
  });
};
