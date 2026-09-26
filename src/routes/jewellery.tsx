import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";

import { BUSINESS, JEWELLERY_CATEGORIES, jewelleryEnquiryLink } from "@/config/site";
import { getRequestOrigin } from "@/lib/origin.functions";
import { getSiteContent } from "@/lib/content.functions";
import { resolveImage } from "@/config/site-images";
import { jsonLdScript, salonId, seoHead } from "@/lib/seo";
import {
  listPublishedJewellery,
  type JewelleryProduct,
} from "@/lib/jewellery.functions";
import { Reveal } from "@/components/site/Reveal";
import { SectionHeading } from "@/components/site/SectionHeading";
import { LinkButton, WhatsAppCta } from "@/components/site/WhatsAppButton";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";


const TITLE = "Bridal Jewellery Collection in Tiruppur | Kaara's Beauty Saloon";
const DESCRIPTION =
  "Browse bridal sets, earrings, necklaces, temple jewellery and statement pieces at Kaara's Beauty Saloon & Makeover, Tiruppur. Enquire about any piece on WhatsApp.";

export const Route = createFileRoute("/jewellery")({
  loader: async () => {
    const [origin, products, content] = await Promise.all([
      getRequestOrigin(),
      listPublishedJewellery(),
      getSiteContent(),
    ]);
    return { origin, products, images: content.images };
  },
  head: ({ loaderData }) => {
    const origin = loaderData?.origin;
    const hero = loaderData
      ? resolveImage(loaderData.images, "jewellery.hero")
      : undefined;
    const seo = seoHead({
      origin,
      path: "/jewellery",
      title: TITLE,
      description: DESCRIPTION,
      image: hero?.src,
      imageAlt: hero?.alt,
    });
    return {
      meta: seo.meta,
      links: seo.links,
      scripts: origin
        ? [
            jsonLdScript({
              "@context": "https://schema.org",
              "@type": "CollectionPage",
              name: "Jewellery Collection",
              url: `${origin}/jewellery`,
              isPartOf: { "@type": "BeautySalon", "@id": salonId(origin), name: BUSINESS.name },
              about: JEWELLERY_CATEGORIES,
            }),
          ]
        : [],
    };
  },
  component: Jewellery,
});

const ALL = "All";

function Jewellery() {
  const { products, images } = Route.useLoaderData();
  const hero = resolveImage(images, "jewellery.hero");
  const [filter, setFilter] = useState<string>(ALL);
  const [active, setActive] = useState<JewelleryProduct | null>(null);

  const categories = useMemo(() => {
    const present = JEWELLERY_CATEGORIES.filter((c) =>
      products.some((p) => p.category === c),
    );
    const extras = Array.from(
      new Set(
        products
          .map((p) => p.category)
          .filter((c) => !JEWELLERY_CATEGORIES.includes(c as never)),
      ),
    );
    return [ALL, ...present, ...extras];
  }, [products]);

  const visible = useMemo(
    () => (filter === ALL ? products : products.filter((p) => p.category === filter)),
    [products, filter],
  );

  return (
    <main>
      <section className="relative flex min-h-[62vh] items-end overflow-hidden md:min-h-[70vh]">
        <img
          src={hero.src}
          alt={hero.alt}
          className="absolute inset-0 h-full w-full object-cover"
          fetchPriority="high"
          decoding="async"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/30" />
        <div className="relative mx-auto w-full max-w-6xl px-5 pb-16 pt-28 md:px-8 md:pb-24">
          <Reveal>
            <p className="eyebrow">The Collection</p>
            <h1 className="mt-5 max-w-3xl font-display text-4xl leading-[1.08] text-ivory md:text-6xl">
              Jewellery for the <span className="gold-text">whole occasion</span>
            </h1>
            <p className="mt-6 max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base">
              Bridal sets, temple jewellery, necklaces and earrings from the{" "}
              {BUSINESS.shortName} collection in {BUSINESS.city}. Message us about
              any piece and we'll share availability and details on WhatsApp.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24">
        <SectionHeading
          eyebrow="Browse"
          title={<>Curated pieces</>}
          intro="Every piece is enquiry-based — no online checkout. Tap a piece for details, then message us on WhatsApp."
        />

        {products.length > 0 ? (
          <>
            <div
              className="mt-10 flex flex-wrap justify-center gap-2.5"
              role="group"
              aria-label="Filter jewellery by category"
            >
              {categories.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setFilter(c)}
                  aria-pressed={filter === c}
                  className={cn(
                    "rounded-sm border px-4 py-2 text-[0.68rem] uppercase tracking-[0.18em] transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                    filter === c
                      ? "border-gold bg-gold text-primary-foreground"
                      : "border-gold/35 text-ivory/80 hover:border-gold hover:text-gold",
                  )}
                >
                  {c}
                </button>
              ))}
            </div>

            <ul className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {visible.map((product, i) => (
                <Reveal as="li" key={product.id} delay={(i % 3) * 90}>
                  <article className="group flex h-full flex-col overflow-hidden rounded-sm border border-border bg-surface">
                    <button
                      type="button"
                      onClick={() => setActive(product)}
                      className="relative block aspect-[4/5] w-full overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
                      aria-label={`View details for ${product.name}`}
                    >
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.image_alt || `${product.name} — ${product.category}`}
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center bg-surface-raised font-display text-2xl text-gold/60">
                          {BUSINESS.shortName}
                        </span>
                      )}
                      {!product.in_stock ? (
                        <span className="absolute left-4 top-4 rounded-sm bg-background/85 px-3 py-1 text-[0.6rem] uppercase tracking-[0.2em] text-ivory">
                          Enquire for availability
                        </span>
                      ) : null}
                    </button>

                    <div className="flex flex-1 flex-col p-6">
                      <p className="eyebrow">{product.category}</p>
                      <h3 className="mt-3 font-display text-2xl text-ivory">
                        {product.name}
                      </h3>
                      {product.description ? (
                        <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                          {product.description}
                        </p>
                      ) : null}
                      <p className="mt-5 text-sm text-gold">
                        {product.price != null
                          ? `₹${Number(product.price).toLocaleString("en-IN")}`
                          : "Price on enquiry"}
                      </p>
                      <div className="mt-6 flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={() => setActive(product)}
                          className="rounded-sm border border-gold/45 px-5 py-2.5 text-[0.68rem] uppercase tracking-[0.2em] text-ivory transition-colors duration-300 hover:border-gold hover:bg-gold/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                        >
                          Details
                        </button>
                        <LinkButton
                          href={jewelleryEnquiryLink(product)}
                          external
                          variant="whatsapp"
                          className="px-5 py-2.5 text-[0.68rem]"
                          ariaLabel={`Enquire about ${product.name} on WhatsApp`}
                        >
                          Enquire
                        </LinkButton>
                      </div>
                    </div>
                  </article>
                </Reveal>
              ))}
            </ul>
          </>
        ) : (
          <Reveal className="mx-auto mt-12 max-w-xl rounded-sm border border-border bg-surface p-10 text-center">
            <h3 className="font-display text-2xl text-ivory">
              The collection is being updated
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Message us on WhatsApp and we'll share what's currently
              available.
            </p>
            <div className="mt-8 flex justify-center">
              <WhatsAppCta intent="jewellery" label="Enquire on WhatsApp" />
            </div>
          </Reveal>
        )}
      </section>

      <section className="border-t border-border bg-surface">
        <div className="mx-auto max-w-3xl px-5 py-16 text-center md:px-8 md:py-24">
          <SectionHeading
            eyebrow="Enquire"
            title={<>Found a piece you like?</>}
            intro="Message us on WhatsApp with the piece you're interested in and we'll share availability and details."
          />
          <div className="mt-9 flex flex-wrap justify-center gap-4">
            <WhatsAppCta intent="jewellery" label="Enquire on WhatsApp" />
            <LinkButton href="/bridal" variant="outline">
              Explore Bridal
            </LinkButton>
          </div>
        </div>
      </section>

      <Dialog open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent className="max-w-3xl overflow-y-auto border-border bg-surface p-0 sm:max-h-[90vh]">
          {active ? (
            <div className="grid gap-0 md:grid-cols-2">
              <div className="aspect-[4/5] w-full overflow-hidden bg-surface-raised">
                {active.image_url ? (
                  <img
                    src={active.image_url}
                    alt={active.image_alt || `${active.name} — ${active.category}`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="flex h-full w-full items-center justify-center font-display text-3xl text-gold/60">
                    {BUSINESS.shortName}
                  </span>
                )}
              </div>
              <div className="p-7 md:p-9">
                <p className="eyebrow">{active.category}</p>
                <DialogTitle className="mt-3 font-display text-3xl font-normal text-ivory">
                  {active.name}
                </DialogTitle>
                <DialogDescription className="mt-4 text-sm leading-relaxed text-muted-foreground">
                  {active.description || "Message us on WhatsApp for full details of this piece."}
                </DialogDescription>
                <p className="mt-6 text-base text-gold">
                  {active.price != null
                    ? `₹${Number(active.price).toLocaleString("en-IN")}`
                    : "Price on enquiry"}
                </p>
                <p className="mt-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  {active.in_stock ? "Available now" : "Enquire for availability"}
                </p>
                <div className="mt-8">
                  <LinkButton
                    href={jewelleryEnquiryLink(active)}
                    external
                    variant="whatsapp"
                    ariaLabel={`Enquire about ${active.name} on WhatsApp`}
                  >
                    Enquire on WhatsApp
                  </LinkButton>
                </div>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </main>
  );
}
