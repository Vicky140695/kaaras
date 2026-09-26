import { BUSINESS } from "@/config/site";

/** Make a possibly-relative asset path absolute (needed for og:image). */
export function absoluteUrl(origin: string, src: string): string {
  if (/^https?:\/\//i.test(src)) return src;
  return `${origin}${src.startsWith("/") ? "" : "/"}${src}`;
}

type MetaTag =
  | { title: string }
  | { name: string; content: string }
  | { property: string; content: string };

/**
 * Per-page <head> data: title, description, canonical, Open Graph and Twitter
 * tags. `origin` should come from getRequestOrigin (honours SITE_URL).
 */
export function seoHead(opts: {
  origin: string | undefined;
  path: string;
  title: string;
  description: string;
  image?: string | undefined;
  imageAlt?: string | undefined;
}) {
  const origin = opts.origin ?? "";
  const url = `${origin}${opts.path}`;
  const image = opts.image && origin ? absoluteUrl(origin, opts.image) : undefined;

  const meta: MetaTag[] = [
    { title: opts.title },
    { name: "description", content: opts.description },
    { property: "og:type", content: "website" },
    { property: "og:title", content: opts.title },
    { property: "og:description", content: opts.description },
    { property: "og:url", content: url },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: opts.title },
    { name: "twitter:description", content: opts.description },
  ];
  if (image) {
    meta.push(
      { property: "og:image", content: image },
      { property: "og:image:alt", content: opts.imageAlt ?? BUSINESS.name },
      { name: "twitter:image", content: image },
    );
  }

  const links: { rel: string; href: string }[] = origin
    ? [{ rel: "canonical", href: url }]
    : [];

  return { meta, links };
}

/** Stable identifier for the salon entity, so other pages can reference it. */
export function salonId(origin: string) {
  return `${origin}/#salon`;
}

/** BeautySalon structured data. Uses only facts held in config/site.ts. */
export function salonJsonLd(
  origin: string,
  image?: string,
  prices: { title: string; items: { name: string; price: number | null }[] }[] = [],
) {
  return {
    "@context": "https://schema.org",
    "@type": "BeautySalon",
    "@id": salonId(origin),
    name: BUSINESS.name,
    alternateName: BUSINESS.shortName,
    url: `${origin}/`,
    ...(image ? { image: absoluteUrl(origin, image) } : {}),
    telephone: BUSINESS.phone,
    address: {
      "@type": "PostalAddress",
      streetAddress: `${BUSINESS.street}, ${BUSINESS.area}`,
      addressLocality: BUSINESS.city,
      addressRegion: BUSINESS.region,
      postalCode: BUSINESS.postalCode,
      addressCountry: BUSINESS.country,
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ],
        opens: BUSINESS.opensAt,
        closes: BUSINESS.closesAt,
      },
    ],
    hasMap: BUSINESS.mapsUrl,
    sameAs: [BUSINESS.instagram],
    areaServed: `${BUSINESS.city}, ${BUSINESS.region}`,
    ...(prices.length > 0
      ? {
          hasOfferCatalog: {
            "@type": "OfferCatalog",
            name: "Salon services and prices",
            itemListElement: prices.map((category) => ({
              "@type": "OfferCatalog",
              name: category.title,
              itemListElement: category.items
                .filter((item) => item.price !== null)
                .map((item) => ({
                  "@type": "Offer",
                  price: item.price,
                  priceCurrency: "INR",
                  itemOffered: {
                    "@type": "Service",
                    name: `${category.title} — ${item.name}`,
                  },
                })),
            })),
          },
        }
      : {}),
    makesOffer: [
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Bridal Makeup" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Hair Artistry" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Skin & Threading" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Nails" } },
    ],
  };
}

export function jsonLdScript(data: unknown) {
  return { type: "application/ld+json", children: JSON.stringify(data) };
}
