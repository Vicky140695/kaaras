import { createFileRoute } from "@tanstack/react-router";

import { BUSINESS } from "@/config/site";
import {
  DEFAULT_BRIDAL_GALLERY,
  resolveImage,
  type GalleryItem,
  type SlotKey,
} from "@/config/site-images";
import { getRequestOrigin } from "@/lib/origin.functions";
import { getSiteContent } from "@/lib/content.functions";
import { jsonLdScript, salonId, seoHead } from "@/lib/seo";
import { Reveal } from "@/components/site/Reveal";
import { SectionHeading } from "@/components/site/SectionHeading";
import { GallerySection } from "@/components/site/Gallery";
import { WhatsAppCta } from "@/components/site/WhatsAppButton";

const TITLE = "Bridal Makeup & Makeover in Tiruppur | Kaara's Beauty Saloon";
const DESCRIPTION =
  "Bridal makeup, hair styling, saree draping and complete bridal makeovers in Tiruppur by Kaara's Beauty Saloon & Makeover. Book your free trial makeup on WhatsApp.";

export const Route = createFileRoute("/bridal")({
  loader: async () => ({
    origin: await getRequestOrigin(),
    content: await getSiteContent(),
  }),
  head: ({ loaderData }) => {
    const origin = loaderData?.origin;
    const hero = loaderData
      ? resolveImage(loaderData.content.images, "bridal.hero")
      : undefined;
    const seo = seoHead({
      origin,
      path: "/bridal",
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
              "@type": "Service",
              name: "Bridal makeup and makeover",
              serviceType: "Bridal makeup, bridal hair styling, saree draping and bridal makeover",
              url: `${origin}/bridal`,
              areaServed: `${BUSINESS.city}, ${BUSINESS.region}`,
              provider: { "@type": "BeautySalon", "@id": salonId(origin), name: BUSINESS.name },
            }),
          ]
        : [],
    };
  },
  component: Bridal,
});

const SERVICES: {
  title: string;
  body: string;
  slot: SlotKey;
}[] = [
  {
    title: "Bridal Makeup",
    body: "A long-wearing, photograph-ready bridal look, planned around your outfit, jewellery and the lighting of your ceremony.",
    slot: "bridal.makeup",
  },
  {
    title: "Bridal Hair Styling",
    body: "Classic braids with flowers, modern soft updos, or a style designed around your jewellery and your saree.",
    slot: "bridal.hair",
  },
  {
    title: "Draping & Finishing",
    body: "Saree draping with pleats set to hold, plus final checks on jewellery and the small finishing details.",
    slot: "bridal.draping",
  },
  {
    title: "Complete Bridal Makeover",
    body: "The full bridal look — makeup, hair, draping and finishing — planned together so everything works as one.",
    slot: "bridal.complete",
  },
];

const JOURNEY = [
  {
    step: "01",
    title: "Consultation",
    body: "Tell us your date, outfits, jewellery and the look you have in mind — over WhatsApp or in the salon.",
  },
  {
    step: "02",
    title: "Free trial makeup",
    body: "A complimentary trial, by appointment, so you can see the look before the day and ask for any changes.",
  },
  {
    step: "03",
    title: "Finalise your look",
    body: "Confirm your makeup, hair style and draping so the plan for your wedding day is clear.",
  },
  {
    step: "04",
    title: "The wedding day",
    body: "Your bridal makeup, hair, draping and finishing, delivered as agreed.",
  },
];

function Bridal() {
  const { content } = Route.useLoaderData();
  const img = (key: SlotKey) => resolveImage(content.images, key);

  const hero = img("bridal.hero");
  const trial = img("bridal.trial");
  const cta = img("bridal.cta");

  const gallery: GalleryItem[] =
    content.gallery.bridal.length > 0
      ? content.gallery.bridal.map((g) => ({
          id: g.id,
          src: g.url,
          alt: g.alt,
          caption: g.caption || undefined,
        }))
      : DEFAULT_BRIDAL_GALLERY;

  return (
    <main>
      <section className="relative flex min-h-[86svh] items-end overflow-hidden">
        <img
          src={hero.src}
          alt={hero.alt}
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div
          className="absolute inset-0 bg-linear-to-t from-background via-background/70 to-background/40"
          aria-hidden="true"
        />
        <div className="relative mx-auto w-full max-w-6xl px-5 pb-20 pt-32 md:px-8 md:pb-28">
          <Reveal className="max-w-2xl">
            <p className="eyebrow">Bridal at Kaaras</p>
            <h1 className="mt-5 text-[3rem] leading-[0.95] text-ivory md:text-[5rem]">
              The morning
              <span className="block gold-text italic">you'll remember</span>
            </h1>
            <p className="mt-6 max-w-lg text-sm leading-relaxed text-ivory/75 md:text-base">
              Bridal makeup, hair, draping and finishing — planned with you
              before the day, so the morning itself feels calm.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <WhatsAppCta intent="freeTrial" label="Book Your Free Trial Makeup" />
              <WhatsAppCta intent="bridal" label="Bridal Enquiry" variant="outline" />
            </div>
          </Reveal>
        </div>
      </section>

      {/* Free trial — primary conversion */}
      <section className="border-y border-border bg-surface/50 py-20 md:py-28">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 md:grid-cols-[1.1fr_1fr] md:gap-16 md:px-8">
          <div>
            <p className="eyebrow">Complimentary</p>
            <h2 className="mt-4 text-4xl leading-tight text-ivory md:text-[3.6rem]">
              Free <span className="gold-text italic">Trial Makeup</span>
            </h2>
            <p className="mt-6 max-w-lg text-sm leading-relaxed text-muted-foreground md:text-base">
              See your bridal look before the wedding morning. As part of our
              15th Anniversary, the bridal trial makeup is complimentary at
              Kaaras — message us on WhatsApp to request an appointment.
            </p>
            <ul className="mt-7 space-y-3 text-sm text-ivory/80">
              {[
                "Complimentary bridal trial makeup",
                "See the look before your wedding day",
                "Discuss any changes with our team",
                "By appointment only, subject to availability",
              ].map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-2.5 h-px w-4 shrink-0 bg-gold" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
            <WhatsAppCta
              intent="freeTrial"
              label="Book Your Free Trial Makeup"
              className="mt-9"
            />
          </div>
          <Reveal className="relative aspect-4/5 overflow-hidden rounded-sm border border-border">
            <img
              src={trial.src}
              alt={trial.alt}
              loading="lazy"
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover"
            />
          </Reveal>
        </div>
      </section>

      {/* Services */}
      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-5 md:px-8">
          <SectionHeading
            eyebrow="Bridal services"
            title="Everything the day asks for"
            intro="Share your dates and outfits on WhatsApp and we'll put together a plan and a quote for your specific ceremonies."
          />
          <div className="mt-14 grid gap-6 sm:grid-cols-2">
            {SERVICES.map((service, i) => {
              const image = img(service.slot);
              return (
                <Reveal
                  as="article"
                  key={service.title}
                  delay={(i % 2) * 120}
                  className="group surface-panel overflow-hidden rounded-sm"
                >
                  <div className="relative aspect-16/10 overflow-hidden">
                    <img
                      src={image.src}
                      alt={image.alt}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
                    />
                  </div>
                  <div className="p-7 md:p-8">
                    <h3 className="text-2xl text-ivory">{service.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                      {service.body}
                    </p>
                    <WhatsAppCta
                      intent="bridal"
                      extra={`Interested in: ${service.title}`}
                      label="Enquire"
                      variant="outline"
                      className="mt-6 w-full sm:w-auto"
                    />
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Gallery (managed from Admin → Gallery → Bridal gallery) */}
      <div className="border-t border-border bg-surface/30">
        <GallerySection
          eyebrow="Bridal gallery"
          title="Bridal looks and details"
          intro="Makeup, hair, draping and finishing."
          items={gallery}
        />
      </div>

      {/* Journey */}
      <section className="border-y border-border bg-surface/40 py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-5 md:px-8">
          <SectionHeading
            eyebrow="The experience"
            title="How it works"
            intro="A calm, staged process — so nothing is decided in a hurry."
          />
          <ol className="mt-14 grid gap-6 md:grid-cols-4">
            {JOURNEY.map((stage, i) => (
              <Reveal
                as="li"
                key={stage.step}
                delay={i * 110}
                className="border-t border-gold/30 pt-6"
              >
                <p className="font-display text-4xl gold-text">{stage.step}</p>
                <h3 className="mt-3 text-xl text-ivory">{stage.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {stage.body}
                </p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative overflow-hidden">
        <img
          src={cta.src}
          alt=""
          aria-hidden="true"
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover object-top opacity-30"
        />
        <div className="absolute inset-0 bg-background/80" aria-hidden="true" />
        <div className="relative mx-auto max-w-3xl px-5 py-24 text-center md:px-8 md:py-32">
          <Reveal>
            <p className="eyebrow">Plan your bridal look</p>
            <h2 className="mt-4 text-4xl leading-tight text-ivory md:text-[3.4rem]">
              Tell us your <span className="gold-text italic">wedding date</span>
            </h2>
            <p className="mx-auto mt-6 max-w-lg text-sm leading-relaxed text-muted-foreground md:text-base">
              Send your ceremony dates and we'll confirm availability, plan the
              trial and share a quote for your bridal package.
            </p>
            <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
              <WhatsAppCta intent="bridal" label="Bridal Enquiry" />
              <WhatsAppCta
                intent="freeTrial"
                label="Book Free Trial"
                variant="outline"
              />
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
