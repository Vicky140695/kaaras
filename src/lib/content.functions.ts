import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { SITE_MEDIA_BUCKET } from "@/config/storage";
import { DEFAULT_OFFERS, DEFAULT_PRICES, DEFAULT_SERVICES } from "@/config/content-defaults";
import type { SiteImageOverride } from "@/config/site-images";

export type SiteService = {
  id: string;
  page: string;
  title: string;
  description: string;
  items: string[];
  price: string | null;
  image_key: string | null;
  display_order: number;
};

export type SiteOffer = {
  id: string;
  tag: string;
  title: string;
  body: string;
  cta_label: string;
  intent: string;
  display_order: number;
};

export type PriceItem = {
  id: string;
  name: string;
  /** Whole rupees; null means "Enquire". */
  price: number | null;
};

export type PriceCategory = {
  id: string;
  title: string;
  /** "Starting from" figure shown on the category header; null hides it. */
  starting_from: number | null;
  items: PriceItem[];
};

export type GalleryEntry = {
  id: string;
  url: string;
  alt: string;
  caption: string;
};

export type SiteContent = {
  services: SiteService[];
  offers: SiteOffer[];
  /** Salon price list, grouped by category (Admin → Price list). */
  prices: PriceCategory[];
  /** Photos the owner has replaced, keyed by slot key (see config/site-images). */
  images: Record<string, SiteImageOverride>;
  gallery: { home: GalleryEntry[]; bridal: GalleryEntry[] };
};

function serverClient() {
  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !key) return null;

  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) {
          h.delete("Authorization");
        }
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

const EMPTY_CONTENT: SiteContent = {
  services: DEFAULT_SERVICES,
  offers: DEFAULT_OFFERS,
  prices: DEFAULT_PRICES,
  images: {},
  gallery: { home: [], bridal: [] },
};

/**
 * Public, read-only fetch of everything the owner can edit from Admin:
 * services, offers, replaced site photos and gallery photos.
 *
 * If the database is unreachable the built-in copy is returned, so the
 * public pages never render empty sections.
 */
export const getSiteContent = createServerFn({ method: "GET" }).handler(
  async (): Promise<SiteContent> => {
    const db = serverClient();
    if (!db) return EMPTY_CONTENT;

    const mediaUrl = (path: string) =>
      path.startsWith("http")
        ? path
        : db.storage.from(SITE_MEDIA_BUCKET).getPublicUrl(path).data.publicUrl;

    const [servicesRes, offersRes, imagesRes, galleryRes, categoriesRes, itemsRes] =
      await Promise.all([
      db
        .from("site_services")
        .select("id, page, title, description, items, price, image_key, display_order")
        .eq("is_published", true)
        .order("display_order", { ascending: true }),
      db
        .from("site_offers")
        .select("id, tag, title, body, cta_label, intent, display_order")
        .eq("is_published", true)
        .order("display_order", { ascending: true }),
      db.from("site_images").select("key, image_url, image_alt"),
      db
        .from("gallery_images")
        .select("id, page, image_url, image_alt, caption, display_order")
        .eq("is_published", true)
        .order("display_order", { ascending: true })
        .order("created_at", { ascending: true }),
      db
        .from("price_categories")
        .select("id, title, starting_from, display_order")
        .eq("is_published", true)
        .order("display_order", { ascending: true }),
      db
        .from("price_items")
        .select("id, category_id, name, price, display_order")
        .eq("is_published", true)
        .order("display_order", { ascending: true }),
    ]);

    if (servicesRes.error) console.error("services read failed", servicesRes.error.message);
    if (offersRes.error) console.error("offers read failed", offersRes.error.message);
    if (imagesRes.error) console.error("site images read failed", imagesRes.error.message);
    if (galleryRes.error) console.error("gallery read failed", galleryRes.error.message);
    if (categoriesRes.error || itemsRes.error) {
      console.error(
        "price list read failed",
        categoriesRes.error?.message ?? itemsRes.error?.message,
      );
    }

    // Fall back to built-in copy only when the read FAILED, so an owner who
    // deliberately hides every offer after the campaign is not overridden.
    const services = servicesRes.error
      ? DEFAULT_SERVICES
      : ((servicesRes.data ?? []) as SiteService[]);
    const offers = offersRes.error
      ? DEFAULT_OFFERS
      : ((offersRes.data ?? []) as SiteOffer[]);

    const images: Record<string, SiteImageOverride> = {};
    for (const row of imagesRes.data ?? []) {
      if (row.image_url) {
        images[row.key] = { url: mediaUrl(row.image_url), alt: row.image_alt };
      }
    }

    const gallery: SiteContent["gallery"] = { home: [], bridal: [] };
    for (const row of galleryRes.data ?? []) {
      const entry: GalleryEntry = {
        id: row.id,
        url: mediaUrl(row.image_url),
        alt: row.image_alt || row.caption || "Kaara's Beauty Saloon & Makeover, Tiruppur",
        caption: row.caption,
      };
      if (row.page === "bridal") gallery.bridal.push(entry);
      else gallery.home.push(entry);
    }

    // Price list: keep only published categories; drop categories with no items.
    const prices: PriceCategory[] =
      categoriesRes.error || itemsRes.error
        ? DEFAULT_PRICES
        : (categoriesRes.data ?? [])
            .map((cat) => ({
              id: cat.id,
              title: cat.title,
              starting_from: cat.starting_from,
              items: (itemsRes.data ?? [])
                .filter((item) => item.category_id === cat.id)
                .map((item) => ({ id: item.id, name: item.name, price: item.price })),
            }))
            .filter((cat) => cat.items.length > 0);

    return { services, offers, prices, images, gallery };
  },
);
