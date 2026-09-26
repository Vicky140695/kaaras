/**
 * Built-in copy used ONLY if the database cannot be reached, so the public
 * pages never render blank sections. Normal edits are made in Admin.
 */
import type { PriceCategory, SiteOffer, SiteService } from "@/lib/content.functions";

export const DEFAULT_SERVICES: SiteService[] = [
  {
    id: "default-hair",
    page: "home",
    title: "Hair Artistry",
    description:
      "Cuts, styling, smoothening and colour, shaped to your hair type and the occasion.",
    items: ["Cutting & styling", "Colour & highlights", "Smoothening & care"],
    price: null,
    image_key: "hair",
    display_order: 1,
  },
  {
    id: "default-skin",
    page: "home",
    title: "Skin & Threading",
    description:
      "Facials, clean-ups and precise threading for skin that looks cared for, not made over.",
    items: ["Facials & clean-ups", "Threading & shaping", "De-tan & brightening"],
    price: null,
    image_key: "skin",
    display_order: 2,
  },
  {
    id: "default-nails",
    page: "home",
    title: "Nails",
    description:
      "Manicures, pedicures and nail art finished with an unhurried, detailed hand.",
    items: ["Manicure & pedicure", "Gel & extensions", "Nail art"],
    price: null,
    image_key: "nails",
    display_order: 3,
  },
  {
    id: "default-makeover",
    page: "home",
    title: "Makeover & Bridal",
    description:
      "Party, reception and full bridal makeovers, built around your outfit and features.",
    items: ["Party & event makeup", "Reception makeover", "Complete bridal looks"],
    price: null,
    image_key: "makeover",
    display_order: 4,
  },
];

export const DEFAULT_OFFERS: SiteOffer[] = [
  {
    id: "default-free-trial",
    tag: "Offer 01",
    title: "Free Trial Makeup",
    body: "A complimentary bridal trial so you can see, feel and finalise your look long before the wedding morning. By appointment only, subject to availability.",
    cta_label: "Book Free Trial",
    intent: "freeTrial",
    display_order: 1,
  },
  {
    id: "default-500-off",
    tag: "Offer 02",
    title: "₹500 OFF",
    body: "Get ₹500 OFF on salon services worth ₹1500 and above.",
    cta_label: "Claim ₹500 OFF",
    intent: "offer500",
    display_order: 2,
  },
  {
    id: "default-rupee-1",
    tag: "Offer 03",
    title: "₹1 Anniversary Special",
    body: "One selected eligible service for just ₹1 during the celebration. Slots are limited — message us to check the current eligible service and availability.",
    cta_label: "Ask About ₹1 Special",
    intent: "offerRupee1",
    display_order: 3,
  },
];

function category(
  id: string,
  title: string,
  startingFrom: number,
  items: [string, number][],
): PriceCategory {
  return {
    id: `default-${id}`,
    title,
    starting_from: startingFrom,
    items: items.map(([name, price], i) => ({
      id: `default-${id}-${i}`,
      name,
      price,
    })),
  };
}

export const DEFAULT_PRICES: PriceCategory[] = [
  category("pedicure", "Pedicure", 799, [
    ["Deluxe Pedicure", 799],
    ["Premium Pedicure", 999],
    ["Luxury Pedicure", 1499],
    ["Tan Removal Pedicure", 1799],
    ["Leg Nail Cut, File & Nail Paint", 299],
  ]),
  category("waxing", "Waxing", 119, [
    ["Upper Lip", 119],
    ["Chin", 119],
    ["Sides", 149],
    ["Full Face", 349],
    ["Half Hands", 499],
    ["Full Hands", 799],
    ["Underarms", 299],
    ["Half Legs", 649],
    ["Full Legs", 949],
    ["Upper Back", 499],
    ["Full Back", 799],
    ["Midriff", 499],
    ["Full Front", 799],
    ["Full Body", 2999],
  ]),
  category("manicure", "Manicure", 599, [
    ["Deluxe Manicure", 599],
    ["Premium Manicure", 849],
    ["Luxury Manicure", 1099],
    ["Tan Removal Manicure", 1499],
    ["Hand Nail Cut, File & Nail Paint", 299],
  ]),
  category("threading", "Threading", 59, [
    ["Eyebrows", 69],
    ["Forehead", 59],
    ["Upper Lip", 59],
    ["Chin", 59],
    ["Sides", 79],
    ["Full Face", 249],
  ]),
  category("de-tan", "De-Tan", 199, [
    ["Face", 399],
    ["Full Arms", 499],
    ["Full Legs", 699],
    ["Half Legs", 499],
    ["Feet", 199],
    ["Back Neck", 299],
    ["Full Body", 1499],
  ]),
];
