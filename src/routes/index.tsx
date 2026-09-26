import { createFileRoute, Link } from "@tanstack/react-router";
import { Gift, Sparkles, Tag } from "lucide-react";

import { BUSINESS, type WhatsAppIntent } from "@/config/site";
import {
  DEFAULT_HOME_GALLERY,
  resolveImage,
  type GalleryItem,
  type SlotKey,
} from "@/config/site-images";
import { getRequestOrigin } from "@/lib/origin.functions";
import { getSiteContent } from "@/lib/content.functions";
import { jsonLdScript, salonJsonLd, seoHead } from "@/lib/seo";
import { Reveal } from "@/components/site/Reveal";
import { SectionHeading } from "@/components/site/SectionHeading";
import { ServiceCard } from "@/components/site/ServiceCard";
import { GallerySection } from "@/components/site/Gallery";
import { PriceList } from "@/components/site/PriceList";
import { LinkButton, WhatsAppCta } from "@/components/site/WhatsAppButton";
import { ReviewsSection } from "@/components/site/ReviewsSection";

const TITLE =
  "Kaara's Beauty Saloon & Makeover | Bridal Makeup & Salon in Tiruppur";
const DESCRIPTION =
  "Kaara's Beauty Saloon & Makeover in Tiruppur — bridal makeup, hair artistry, skin care, nails and jewellery. Celebrating 15 years. Book on WhatsApp.";

export const Route = createFileRoute("/")({
  loader: async () => ({
    origin: await getRequestOrigin(),
    content: await getSiteContent(),
  }),
  head: ({ loaderData }) => {
    const origin = loaderData?.origin;
    const hero = loaderData
      ? resolveImage(loaderData.content.images, "home.hero")
      : undefined;
    const seo = seoHead({
      origin,
      path: "/",
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
            jsonLdScript(
              salonJsonLd(origin, hero?.src, loaderData?.content.prices),
            ),
          ]
        : [],
    };
  },
  component: Home,
});

const OFFER_ICONS = [Sparkles, Tag, Gift];

const SERVICE_SLOTS: Record<string, SlotKey> = {
  hair: "service.hair",
  skin: "service.skin",
  nails: "service.nails",
  makeover: "service.makeover",
};

const INTENTS: WhatsAppIntent[] = [
  "general",
  "services",
  "bridal",
  "freeTrial",
  "offer500",
  "offerRupee1",
  "jewellery",
];

function asIntent(value: string): WhatsAppIntent {
  return (INTENTS as string[]).includes(value)
    ? (value as WhatsAppIntent)
    : "general";
}

const TERMS = [
  "Valid on services only, not on products.",
  "One voucher per person.",
  "Discount applies only upon presentation of the coupon.",
  "Valid Monday to Friday only.",
  `Valid only during the Kaaras ${BUSINESS.anniversaryYears}th Anniversary Celebration period.`,
  "Cannot be combined with any other discount or offer.",
  "Management reserves the right to change or withdraw the offer without prior notice.",
];

function Home() {
  const { content } = Route.useLoaderData();
  const offers = content.offers;
  const services = content.services.filter((s) => s.page === "home");
  const img = (key: SlotKey) => resolveImage(content.images, key);

  const hero = img("home.hero");
  const story = img("home.story");
  const contactBg = img("home.contact");

  const gallery: GalleryItem[] =
    content.gallery.home.length > 0
      ? content.gallery.home.map((g) => ({
          id: g.id,
          src: g.url,
          alt: g.alt,
          caption: g.caption || undefined,
        }))
      : DEFAULT_HOME_GALLERY;

  return (
    <main>
      {/* Hero */}
      <section className="relative flex min-h-[92svh] items-end overflow-hidden">
        <img
          src={hero.src}
          alt={hero.alt}
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover object-[62%_center]"
        />
        <div
          className="absolute inset-0 bg-linear-to-t from-background via-background/70 to-background/45"
          aria-hidden="true"
        />
        <div className="relative mx-auto w-full max-w-6xl px-5 pb-20 pt-32 md:px-8 md:pb-28">
          <Reveal className="max-w-2xl">
            <p className="eyebrow">
              Tiruppur · {BUSINESS.anniversaryYears} years of Kaaras
            </p>
            <h1 className="mt-5 text-[3.1rem] leading-[0.95] text-ivory md:text-[5.5rem]">
              Beauty,
              <span className="block gold-text italic">redefined.</span>
            </h1>
            <p className="mt-6 max-w-lg text-sm leading-relaxed text-ivory/75 md:text-base">
              Kaara's Beauty Saloon &amp; Makeover brings bridal artistry,
              considered salon care and jewellery together in Tiruppur — where
              tradition is treated with a modern, unhurried hand.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <LinkButton href="/book" variant="gold">Book an Appointment</LinkButton>
              <LinkButton href="/bridal" variant="outline">
                Explore Bridal
              </LinkButton>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Anniversary campaign */}
      <section
        id="anniversary"
        className="relative border-y border-border bg-surface/40 py-20 md:py-28"
      >
        <div className="mx-auto max-w-6xl px-5 md:px-8">
          <Reveal className="text-center">
            <p className="eyebrow">Celebration</p>
            <h2 className="mt-4 font-display text-[2.6rem] leading-none text-ivory md:text-[4.5rem]">
              <span className="gold-text">15 YEARS</span> OF KAARAS
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base">
              15 years of beauty. 15 years of trust. 15 years with Tiruppur.
            </p>
          </Reveal>

          {offers.length > 0 ? (
            <ul className="mt-14 grid gap-6 md:grid-cols-3">
              {offers.map((offer, i) => {
                const Icon = OFFER_ICONS[i % OFFER_ICONS.length]!;
                return (
                  <Reveal
                    as="li"
                    key={offer.id}
                    delay={i * 120}
                    className="surface-panel flex flex-col rounded-sm p-7 md:p-8"
                  >
                    <Icon className="h-7 w-7 text-gold" aria-hidden="true" />
                    <p className="mt-6 text-[0.62rem] uppercase tracking-[0.3em] text-muted-foreground">
                      {offer.tag}
                    </p>
                    <h3 className="mt-2 text-3xl text-ivory">{offer.title}</h3>
                    <p className="mt-4 grow text-sm leading-relaxed text-muted-foreground">
                      {offer.body}
                    </p>
                    <WhatsAppCta
                      intent={asIntent(offer.intent)}
                      label={offer.cta_label}
                      className="mt-8 w-full"
                    />
                  </Reveal>
                );
              })}
            </ul>
          ) : null}

          <Reveal className="mx-auto mt-12 max-w-3xl rounded-sm border border-border/70 p-6 md:p-8">
            <p className="eyebrow">Coupon terms</p>
            <p className="mt-3 text-sm text-ivory/85">
              Get ₹500 OFF on salon services worth ₹1500 and above.
            </p>
            <ul className="mt-4 space-y-2 text-[0.8rem] leading-relaxed text-muted-foreground">
              {TERMS.map((t) => (
                <li key={t} className="flex gap-2.5">
                  <span className="mt-2 h-px w-3 shrink-0 bg-gold/70" aria-hidden="true" />
                  {t}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-5 md:px-8">
          <SectionHeading
            eyebrow="What we do"
            title="Salon services, considered in every detail"
            intro="From a threading appointment to a full wedding-morning makeover, book any service with us on WhatsApp."
          />
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {services.map((service, i) => {
              const image = img(SERVICE_SLOTS[service.image_key ?? ""] ?? "service.makeover");
              return (
                <ServiceCard
                  key={service.id}
                  image={image.src}
                  alt={image.alt}
                  title={service.title}
                  description={service.description}
                  items={service.items}
                  price={service.price}
                  intent={service.image_key === "makeover" ? "bridal" : "services"}
                  extra={`Interested in: ${service.title}`}
                  delay={i * 120}
                />
              );
            })}
          </div>
          <Reveal className="mt-12 flex flex-col items-center justify-center gap-2 text-center sm:flex-row sm:gap-8">
            <LinkButton href="/#prices" variant="ghost">
              See the full price list →
            </LinkButton>
            <LinkButton href="/bridal" variant="ghost">
              See the full bridal experience →
            </LinkButton>
          </Reveal>
        </div>
      </section>

      {/* Price list (managed from Admin → Price list) */}
      <PriceList categories={content.prices} />

      <ReviewsSection />

      {/* Story */}
      <section className="border-y border-border bg-surface/40 py-20 md:py-28">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 md:grid-cols-2 md:gap-16 md:px-8">
          <Reveal className="relative aspect-4/3 overflow-hidden rounded-sm md:aspect-5/4">
            <img
              src={story.src}
              alt={story.alt}
              loading="lazy"
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover"
            />
          </Reveal>
          <div>
            <SectionHeading
              align="left"
              eyebrow="Our story"
              title="Fifteen years in Tiruppur"
              intro="For fifteen years Kaaras has been part of Tiruppur's everyday routines and its most important celebrations."
            />
            <Reveal className="mt-8 space-y-5 text-sm leading-relaxed text-muted-foreground md:text-base">
              <p>
                This anniversary is our way of saying thank you to everyone who
                has trusted us — for a quick threading appointment, a party
                look, or the morning of a wedding.
              </p>
              <p>
                Our approach stays simple: understand the look you want,
                respect the occasion, and never rush the finish.
              </p>
              <WhatsAppCta intent="general" label="Talk to us" variant="outline" />
            </Reveal>
          </div>
        </div>
      </section>

      {/* Gallery (managed from Admin → Gallery) */}
      <GallerySection
        id="gallery"
        title="Looks and details"
        intro="Bridal looks, salon details and jewellery."
        items={gallery}
      />

      {/* Contact + final CTA */}
      <section id="contact" className="relative overflow-hidden border-t border-border">
        <img
          src={contactBg.src}
          alt=""
          aria-hidden="true"
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover opacity-25"
        />
        <div className="absolute inset-0 bg-background/75" aria-hidden="true" />
        <div className="relative mx-auto max-w-3xl px-5 py-24 text-center md:px-8 md:py-32">
          <Reveal>
            <p className="eyebrow">Visit us</p>
            <h2 className="mt-4 text-4xl leading-tight text-ivory md:text-[3.4rem]">
              Let's plan your <span className="gold-text italic">look</span>
            </h2>
            <p className="mx-auto mt-6 max-w-lg text-sm leading-relaxed text-muted-foreground md:text-base">
              Send us a message on WhatsApp and we'll confirm your appointment,
              share availability and answer any question.
            </p>
            <dl className="mx-auto mt-8 grid max-w-lg gap-4 text-sm text-muted-foreground">
              <div>
                <dt className="eyebrow">Address</dt>
                <dd className="mt-1.5">
                  <a
                    href={BUSINESS.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-ivory/85 underline-offset-4 transition-colors hover:text-gold hover:underline"
                  >
                    {BUSINESS.addressLine}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="eyebrow">Hours</dt>
                <dd className="mt-1.5 text-ivory/85">{BUSINESS.hours}</dd>
              </div>
              <div>
                <dt className="eyebrow">Phone</dt>
                <dd className="mt-1.5">
                  <a
                    href={BUSINESS.phoneHref}
                    className="text-ivory/85 underline-offset-4 transition-colors hover:text-gold hover:underline"
                  >
                    {BUSINESS.phone}
                  </a>
                </dd>
              </div>
            </dl>

            <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
              <WhatsAppCta intent="general" label="Book on WhatsApp" />
              <Link
                to="/jewellery"
                className="inline-flex items-center justify-center rounded-sm border border-gold/45 px-6 py-3.5 text-[0.78rem] uppercase tracking-[0.2em] text-ivory transition-colors hover:bg-gold/10"
              >
                View Jewellery
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
