/**
 * Registry of every replaceable photo on the website.
 *
 * - Each slot has a built-in SAMPLE photo (bundled with the site).
 * - The owner replaces any slot from Admin → Site photos. The uploaded photo
 *   is stored in Supabase and wins over the sample automatically.
 * - Gallery photos are managed separately (Admin → Gallery).
 *
 * To add a new replaceable photo: add a key to SLOT_KEYS, add its entry to
 * IMAGE_SLOTS, then call resolveImage(images, "<key>") where it is displayed.
 */
import heroBride from "@/assets/hero-bride.jpg";
import salonInterior from "@/assets/salon-interior.jpg";
import serviceHair from "@/assets/service-hair.jpg";
import serviceSkin from "@/assets/service-skin.jpg";
import serviceNails from "@/assets/service-nails.jpg";
import serviceMakeover from "@/assets/service-makeover.jpg";
import galleryDrape from "@/assets/gallery-drape.jpg";
import galleryDetail from "@/assets/gallery-detail.jpg";
import jewelleryHero from "@/assets/jewellery-hero.jpg";
import bridalHero from "@/assets/bridal-hero.jpg";

export const SLOT_KEYS = [
  "home.hero",
  "home.story",
  "home.contact",
  "service.hair",
  "service.skin",
  "service.nails",
  "service.makeover",
  "bridal.hero",
  "bridal.trial",
  "bridal.makeup",
  "bridal.hair",
  "bridal.draping",
  "bridal.complete",
  "bridal.cta",
  "jewellery.hero",
] as const;

export type SlotKey = (typeof SLOT_KEYS)[number];

export type ImageSlot = {
  group: string;
  label: string;
  /** Plain-language hint shown to the owner in the dashboard. */
  hint: string;
  /** Built-in sample photo. */
  src: string;
  /** Alt text for the sample photo. */
  alt: string;
};

export const SLOT_GROUPS = [
  "Home page",
  "Home page · service cards",
  "Bridal page",
  "Jewellery page",
] as const;

export const IMAGE_SLOTS: Record<SlotKey, ImageSlot> = {
  "home.hero": {
    group: "Home page",
    label: "Main banner (top of Home)",
    hint: "Large wide photo behind “Beauty, redefined.” Best: landscape, subject on the right.",
    src: heroBride,
    alt: "Bride in a red and gold silk saree with traditional gold jewellery",
  },
  "home.story": {
    group: "Home page",
    label: "Our story photo",
    hint: "Shown beside the “Fifteen years” story. Best: your salon or team.",
    src: salonInterior,
    alt: "Salon interior with gold-lit mirrors and marble styling counters",
  },
  "home.contact": {
    group: "Home page",
    label: "Contact section background",
    hint: "Faded background behind the address and final WhatsApp button.",
    src: jewelleryHero,
    alt: "Antique gold temple jewellery on black velvet",
  },
  "service.hair": {
    group: "Home page · service cards",
    label: "Hair Artistry card",
    hint: "Portrait photo (taller than wide).",
    src: serviceHair,
    alt: "Glossy dark hair styled into a soft bridal updo with a gold hair pin",
  },
  "service.skin": {
    group: "Home page · service cards",
    label: "Skin & Threading card",
    hint: "Portrait photo (taller than wide).",
    src: serviceSkin,
    alt: "Facial treatment products with rose petals and warm towels on dark stone",
  },
  "service.nails": {
    group: "Home page · service cards",
    label: "Nails card",
    hint: "Portrait photo (taller than wide).",
    src: serviceNails,
    alt: "Manicured hands with nude and gold nail art resting on cream silk",
  },
  "service.makeover": {
    group: "Home page · service cards",
    label: "Makeover & Bridal card",
    hint: "Portrait photo (taller than wide).",
    src: serviceMakeover,
    alt: "Woman in a cream and gold silk saree with a polished makeover look",
  },
  "bridal.hero": {
    group: "Bridal page",
    label: "Main banner (top of Bridal)",
    hint: "Large wide photo behind the Bridal headline. Best: landscape.",
    src: bridalHero,
    alt: "Bridal makeup being applied to a bride wearing gold jewellery and jasmine flowers",
  },
  "bridal.trial": {
    group: "Bridal page",
    label: "Free Trial Makeup photo",
    hint: "Portrait photo shown beside the Free Trial Makeup offer.",
    src: galleryDetail,
    alt: "Makeup products and gold earrings arranged on cream silk",
  },
  "bridal.makeup": {
    group: "Bridal page",
    label: "Bridal Makeup card",
    hint: "Wide photo (about 16:10).",
    src: heroBride,
    alt: "Bride with traditional bridal makeup and gold temple jewellery",
  },
  "bridal.hair": {
    group: "Bridal page",
    label: "Bridal Hair Styling card",
    hint: "Wide photo (about 16:10).",
    src: serviceHair,
    alt: "Soft bridal updo hairstyle finished with a gold hair accessory",
  },
  "bridal.draping": {
    group: "Bridal page",
    label: "Draping & Finishing card",
    hint: "Wide photo (about 16:10).",
    src: galleryDrape,
    alt: "Bridal saree draped with a jasmine flower braid, seen from behind",
  },
  "bridal.complete": {
    group: "Bridal page",
    label: "Complete Bridal Makeover card",
    hint: "Wide photo (about 16:10).",
    src: serviceMakeover,
    alt: "Woman in a cream and gold silk saree with a complete makeover look",
  },
  "bridal.cta": {
    group: "Bridal page",
    label: "Final call-to-action background",
    hint: "Faded background behind “Tell us your wedding date”.",
    src: galleryDrape,
    alt: "Bride with a jasmine braid in a cream and gold silk saree",
  },
  "jewellery.hero": {
    group: "Jewellery page",
    label: "Main banner (top of Jewellery)",
    hint: "Large wide photo behind the Jewellery headline. Best: landscape.",
    src: jewelleryHero,
    alt: "Gold bridal jewellery set with temple motifs on dark silk",
  },
};

/** A replaced photo, as returned by the public content loader. */
export type SiteImageOverride = { url: string; alt: string | null };

export type ResolvedImage = { src: string; alt: string; custom: boolean };

/** The photo to display for a slot: the owner's upload if present, else the sample. */
export function resolveImage(
  overrides: Record<string, SiteImageOverride>,
  key: SlotKey,
): ResolvedImage {
  const slot = IMAGE_SLOTS[key];
  const custom = overrides[key];
  if (custom?.url) {
    return {
      src: custom.url,
      alt: custom.alt?.trim() || `Kaara's Beauty Saloon & Makeover, Tiruppur — ${slot.label}`,
      custom: true,
    };
  }
  return { src: slot.src, alt: slot.alt, custom: false };
}

/* ---------- Gallery ---------- */

export type GalleryItem = {
  id: string;
  src: string;
  alt: string;
  caption?: string | undefined;
};

/** Shown on Home until the owner publishes at least one gallery photo. */
export const DEFAULT_HOME_GALLERY: GalleryItem[] = [
  { id: "d-hero", src: heroBride, alt: IMAGE_SLOTS["home.hero"].alt },
  { id: "d-drape", src: galleryDrape, alt: IMAGE_SLOTS["bridal.draping"].alt },
  { id: "d-hair", src: serviceHair, alt: IMAGE_SLOTS["service.hair"].alt },
  { id: "d-detail", src: galleryDetail, alt: IMAGE_SLOTS["bridal.trial"].alt },
  { id: "d-jewel", src: jewelleryHero, alt: IMAGE_SLOTS["home.contact"].alt },
  { id: "d-salon", src: salonInterior, alt: IMAGE_SLOTS["home.story"].alt },
];

/** Shown on Bridal until the owner publishes at least one Bridal gallery photo. */
export const DEFAULT_BRIDAL_GALLERY: GalleryItem[] = [
  { id: "b-hero", src: bridalHero, alt: IMAGE_SLOTS["bridal.hero"].alt },
  { id: "b-bride", src: heroBride, alt: IMAGE_SLOTS["bridal.makeup"].alt },
  { id: "b-drape", src: galleryDrape, alt: IMAGE_SLOTS["bridal.draping"].alt },
  { id: "b-hair", src: serviceHair, alt: IMAGE_SLOTS["bridal.hair"].alt },
];

export const GALLERY_PAGES = [
  { id: "home", label: "Home gallery" },
  { id: "bridal", label: "Bridal gallery" },
] as const;
export type GalleryPage = (typeof GALLERY_PAGES)[number]["id"];
