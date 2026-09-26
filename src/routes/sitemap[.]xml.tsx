import { createFileRoute } from "@tanstack/react-router";

const PATHS = ["/", "/bridal", "/jewellery", "/book", "/returns"];

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: ({ request }) => {
        const configured = process.env["SITE_URL"]?.trim().replace(/\/+$/, "");
        const origin = configured || new URL(request.url).origin;

        const urls = PATHS.map(
          (p) =>
            `  <url><loc>${origin}${p}</loc><changefreq>weekly</changefreq><priority>${p === "/" ? "1.0" : "0.8"}</priority></url>`,
        ).join("\n");

        return new Response(
          `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
          { headers: { "content-type": "application/xml; charset=utf-8" } },
        );
      },
    },
  },
});
