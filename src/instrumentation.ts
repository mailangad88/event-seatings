import type { Instrumentation } from "next";
import { log, redactText, requestIdFrom, serializeError, stripQuery } from "@/lib/log";

// Server error alerts: every error Next.js captures (pages, route handlers, server actions, proxy) is
// written to the logs as one JSON line and reported through src/lib/alerts.ts. See docs/monitoring.md.
// The query string is dropped and the message is scrubbed, so no email or phone number is sent.
export const onRequestError: Instrumentation.onRequestError = async (err, request, context) => {
  const e = serializeError(err);
  const path = stripQuery(request.path);
  const reqId = requestIdFrom(request.headers);
  log.error("request_error", {
    path,
    method: request.method,
    route: context.routePath,
    routeType: context.routeType,
    renderSource: context.renderSource,
    reqId,
    err,
  });
  try {
    const { sendAlert } = await import("@/lib/alerts");
    await sendAlert("Server error", {
      message: typeof e.message === "string" ? redactText(e.message).slice(0, 300) : undefined,
      digest: e.digest,
      path,
      method: request.method,
      route: context.routePath,
      type: context.routeType,
      reqId,
    });
  } catch (alertErr) {
    log.warn("alert_failed", { err: alertErr });
  }
};
