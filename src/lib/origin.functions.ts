import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";

/**
 * Absolute site origin used for canonical URLs, social previews and the sitemap.
 *
 * Set SITE_URL (e.g. https://www.kaaras.in) in the hosting environment so
 * canonical URLs stay correct even when the site is opened from a preview or
 * staging address. Without it the origin is derived from the request.
 */
export const getRequestOrigin = createServerFn({ method: "GET" }).handler(() => {
  const configured = process.env["SITE_URL"]?.trim().replace(/\/+$/, "");
  if (configured) return configured;

  const req = getRequest();
  const url = new URL(req.url);
  const sandboxHost =
    url.hostname === "localhost" ? req.headers.get("x-forwarded-host") : null;
  return sandboxHost ? `https://${sandboxHost}` : url.origin;
});
