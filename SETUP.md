# Kaaras website — setup & owner guide

## 1. One-time database setup (Supabase)

1. Open your Supabase project → **SQL Editor**.
2. Run the migrations in `supabase/migrations/` in date order (`20260919000000_site_media_gallery_and_admin_hardening.sql` adds editable
   photos, the gallery, storage buckets and locks down admin access;
   `20260919010000_price_list.sql` adds the editable price list and loads the
   starter prices).
3. **Create the owner login** — Supabase → **Authentication → Users → Add user**
   (enter the owner's email + a strong password, tick *Auto confirm user*).
4. **Make that user the admin** — in the SQL Editor run:

   ```sql
   select public.make_admin('owner@example.com');
   ```

   (use the same email as step 3). The owner can now sign in at `/auth`.
5. **Close public sign-ups** — Supabase → **Authentication → Sign In / Providers
   → Email** → turn **off** “Allow new users to sign up”. (The site no longer
   shows a sign-up button, but this stops anyone using the API directly.)

> The old `claim_admin()` function (first person to sign up became admin) has
> been removed. Admin access can now only be granted from the SQL Editor.

## 2. Environment variables (hosting)

| Variable | Purpose |
| --- | --- |
| `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY` | Server-side database access (already in `.env`) |
| `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` | Browser access (already in `.env`) |
| `SITE_URL` | **Set this to the final address, e.g. `https://www.kaaras.in`.** Used for canonical URLs, social previews, `robots.txt` and the sitemap. |

## 3. What the owner can edit (Admin → `/auth` sign-in)

| Tab | What it controls |
| --- | --- |
| **Jewellery** | Add / edit / hide / delete products, upload photos, price, availability, order |
| **Site photos** | *Every* photo on Home, Bridal and Jewellery pages (banners, service cards, trial photo, backgrounds). “Change photo” goes live instantly; “Use sample” restores the built-in picture |
| **Gallery** | Home gallery and Bridal gallery: add many photos at once, describe, caption, reorder, hide, delete |
| **Price list** | The Home-page price list (Pedicure, Waxing, Manicure, Threading, De-Tan…): edit names and prices, “starting from”, add/remove/reorder/hide |
| **Service cards** | The four Home service cards (Hair, Skin, Nails, Makeover) |
| **Offers & discounts** | 15th Anniversary offer cards |

Photos are resized/compressed in the browser before upload (max 1800px), so
phone photos can be uploaded as they are.

## 4. Before going live — checklist

- [ ] Replace the built-in **sample photos** (they are AI-generated stock, not photos of Kaaras). Admin → *Site photos* shows how many are still samples.
- [ ] Add real photos in Admin → *Gallery* (Home and Bridal). Until at least one is published, sample photos show.
- [ ] Add real jewellery in Admin → *Jewellery*.
- [ ] Confirm the opening hours and address in `src/config/site.ts` (`BUSINESS.hours`, `addressLine`). They appear on the site and in Google structured data.
- [ ] Read the story, bridal and trial wording once and edit anything that is not accurate for Kaaras (`src/routes/index.tsx`, `src/routes/bridal.tsx`).
- [ ] Set `SITE_URL`, then submit `/sitemap.xml` in Google Search Console.
- [ ] Test on a real Android phone and iPhone (menu, WhatsApp buttons, gallery, admin upload).

## 5. Where things live

- WhatsApp number + all prefilled messages: `src/config/site.ts` (single place)
- Replaceable photo slots + sample photos: `src/config/site-images.ts`
- Page SEO helpers / structured data: `src/lib/seo.ts`
- Admin panels: `src/routes/_authenticated/admin.tsx`, `src/components/admin/`
