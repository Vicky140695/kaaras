/**
 * Single source of truth for Kaaras business + WhatsApp configuration.
 * Change the number here once and every CTA across the site updates.
 */

/** WhatsApp number in international format, digits only (country code + number). */
export const WHATSAPP_NUMBER = "918754700091";

export const BUSINESS = {
  name: "Kaara's Beauty Saloon & Makeover",
  shortName: "Kaaras",
  phone: "+91 87547 00091",
  phoneHref: "tel:+918754700091",
  street: "79, Gandhi Rd, Periyar Colony",
  area: "Anupparpalayam Pudur, Thirumuruganpoondi",
  city: "Tiruppur",
  region: "Tamil Nadu",
  postalCode: "641652",
  country: "IN",
  addressLine:
    "79, Gandhi Rd, Periyar Colony, Anupparpalayam Pudur, Thirumuruganpoondi, Tiruppur, Tamil Nadu 641652",
  hours: "Open daily · 10:00 AM – 9:00 PM",
  opensAt: "10:00",
  closesAt: "21:00",
  mapsUrl:
    "https://www.google.com/maps/search/?api=1&query=" +
    encodeURIComponent(
      "Kaara's Beauty Saloon & Makeover, 79 Gandhi Rd, Periyar Colony, Anupparpalayam Pudur, Thirumuruganpoondi, Tiruppur, Tamil Nadu 641652",
    ),
  tagline: "Beauty, redefined.",
  anniversaryYears: 15,
  instagram: "https://www.instagram.com/kaaras_kayal_makeover_artistry/",
  instagramHandle: "@kaaras_kayal_makeover_artistry",
} as const;


export type WhatsAppIntent =
  | "general"
  | "bridal"
  | "freeTrial"
  | "offer500"
  | "offerRupee1"
  | "jewellery"
  | "services";

const CAMPAIGN = "Kaaras 15th Anniversary";

const MESSAGES: Record<WhatsAppIntent, string> = {
  general: `Hello ${BUSINESS.shortName}, I'd like to book an appointment. Could you share available slots?`,
  services: `Hello ${BUSINESS.shortName}, I'd like to know more about your salon services and book an appointment.`,
  bridal: `Hello ${BUSINESS.shortName}, I'm enquiring about bridal makeup and styling. Could you share the details?`,
  freeTrial: `Hello ${BUSINESS.shortName}, I'd like to book the FREE Trial Makeup (${CAMPAIGN} – Free Trial). Please share available appointment slots.`,
  offer500: `Hello ${BUSINESS.shortName}, I'd like to use the ₹500 OFF offer on salon services worth ₹1500 and above (${CAMPAIGN} – ₹500 OFF).`,
  offerRupee1: `Hello ${BUSINESS.shortName}, I'd like to know about the ₹1 Anniversary Special and check slot availability (${CAMPAIGN} – ₹1 Special).`,
  jewellery: `Hello ${BUSINESS.shortName}, I'd like to enquire about a jewellery piece from your collection.`,
};

/** Build a WhatsApp deep link with a prefilled, campaign-tagged message. */
export function whatsappLink(intent: WhatsAppIntent = "general", extra?: string) {
  const text = extra ? `${MESSAGES[intent]}\n\n${extra}` : MESSAGES[intent];
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}

export function jewelleryEnquiryLink(product: {
  name: string;
  category: string;
}) {
  return whatsappLink(
    "jewellery",
    `Item: ${product.name} (${product.category})`,
  );
}

export const JEWELLERY_CATEGORIES = [
  "Bridal Sets",
  "Earrings",
  "Necklaces",
  "Temple Jewellery",
  "Statement Earrings",
] as const;
