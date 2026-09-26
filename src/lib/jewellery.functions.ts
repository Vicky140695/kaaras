import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export type JewelleryProduct = {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number | null;
  image_url: string | null;
  image_alt: string | null;
  in_stock: boolean;
  display_order: number;
};

/** Storage bucket holding owner-uploaded product photography. */
export const JEWELLERY_BUCKET = "jewellery";

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

/** Public, read-only catalogue read used for SSR of the Jewellery page. */
export const listPublishedJewellery = createServerFn({ method: "GET" }).handler(
  async (): Promise<JewelleryProduct[]> => {
    const supabasePublic = serverClient();
    if (!supabasePublic) return [];

    const { data, error } = await supabasePublic
      .from("jewellery_products")
      .select(
        "id, name, category, description, price, image_url, image_alt, in_stock, display_order",
      )
      .eq("is_published", true)
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("listPublishedJewellery failed", error.message);
      return [];
    }

    const rows = (data ?? []) as JewelleryProduct[];

    // Product photos live in a public bucket; turn stored paths into stable
    // public URLs (no expiry, so cached pages never end up with dead images).
    for (const row of rows) {
      if (row.image_url && !row.image_url.startsWith("http")) {
        row.image_url = supabasePublic.storage
          .from(JEWELLERY_BUCKET)
          .getPublicUrl(row.image_url).data.publicUrl;
      }
    }

    return rows;
  },
);
