-- =====================================================================
-- Kaaras: editable site photos + gallery, idempotent content tables,
-- storage buckets, placeholder clean-up, and admin hardening.
-- Safe to run on a project that already has the earlier migrations.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Storage buckets (public read; only admins can write via policies)
-- ---------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('jewellery', 'jewellery', true)
ON CONFLICT (id) DO UPDATE SET public = true;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'site-media', 'site-media', true, 8388608,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE
  SET public = true,
      file_size_limit = 8388608,
      allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

DROP POLICY IF EXISTS "Anyone can read site media" ON storage.objects;
CREATE POLICY "Anyone can read site media"
ON storage.objects FOR SELECT TO anon, authenticated
USING (bucket_id = 'site-media');

DROP POLICY IF EXISTS "Admins can upload site media" ON storage.objects;
CREATE POLICY "Admins can upload site media"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'site-media' AND public.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Admins can update site media" ON storage.objects;
CREATE POLICY "Admins can update site media"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'site-media' AND public.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Admins can delete site media" ON storage.objects;
CREATE POLICY "Admins can delete site media"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'site-media' AND public.has_role(auth.uid(), 'admin'::public.app_role));

-- ---------------------------------------------------------------------
-- 2. site_services / site_offers (previously only in drizzle/, so a fresh
--    Supabase project never got them). Idempotent.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.site_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page text NOT NULL DEFAULT 'home',
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  items text[] NOT NULL DEFAULT '{}',
  price text,
  image_key text,
  display_order integer NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.site_services TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_services TO authenticated;
GRANT ALL ON public.site_services TO service_role;
ALTER TABLE public.site_services ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Published services are publicly viewable" ON public.site_services;
CREATE POLICY "Published services are publicly viewable" ON public.site_services
  FOR SELECT TO anon, authenticated USING (is_published = true);
DROP POLICY IF EXISTS "Admins can view all services" ON public.site_services;
CREATE POLICY "Admins can view all services" ON public.site_services
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));
DROP POLICY IF EXISTS "Admins can insert services" ON public.site_services;
CREATE POLICY "Admins can insert services" ON public.site_services
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
DROP POLICY IF EXISTS "Admins can update services" ON public.site_services;
CREATE POLICY "Admins can update services" ON public.site_services
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
DROP POLICY IF EXISTS "Admins can delete services" ON public.site_services;
CREATE POLICY "Admins can delete services" ON public.site_services
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));

DROP TRIGGER IF EXISTS site_services_updated_at ON public.site_services;
CREATE TRIGGER site_services_updated_at BEFORE UPDATE ON public.site_services
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE IF NOT EXISTS public.site_offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tag text NOT NULL DEFAULT '',
  title text NOT NULL,
  body text NOT NULL DEFAULT '',
  cta_label text NOT NULL DEFAULT 'Enquire on WhatsApp',
  intent text NOT NULL DEFAULT 'general',
  display_order integer NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.site_offers TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_offers TO authenticated;
GRANT ALL ON public.site_offers TO service_role;
ALTER TABLE public.site_offers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Published offers are publicly viewable" ON public.site_offers;
CREATE POLICY "Published offers are publicly viewable" ON public.site_offers
  FOR SELECT TO anon, authenticated USING (is_published = true);
DROP POLICY IF EXISTS "Admins can view all offers" ON public.site_offers;
CREATE POLICY "Admins can view all offers" ON public.site_offers
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));
DROP POLICY IF EXISTS "Admins can insert offers" ON public.site_offers;
CREATE POLICY "Admins can insert offers" ON public.site_offers
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
DROP POLICY IF EXISTS "Admins can update offers" ON public.site_offers;
CREATE POLICY "Admins can update offers" ON public.site_offers
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
DROP POLICY IF EXISTS "Admins can delete offers" ON public.site_offers;
CREATE POLICY "Admins can delete offers" ON public.site_offers
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));

DROP TRIGGER IF EXISTS site_offers_updated_at ON public.site_offers;
CREATE TRIGGER site_offers_updated_at BEFORE UPDATE ON public.site_offers
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Seed starter copy only when the tables are empty (never overwrites edits).
INSERT INTO public.site_services (page, title, description, items, price, image_key, display_order)
SELECT * FROM (VALUES
  ('home', 'Hair Artistry', 'Cuts, styling, smoothening and colour, shaped to your hair type and the occasion.', ARRAY['Cutting & styling','Colour & highlights','Smoothening & care'], NULL::text, 'hair', 1),
  ('home', 'Skin & Threading', 'Facials, clean-ups and precise threading for skin that looks cared for, not made over.', ARRAY['Facials & clean-ups','Threading & shaping','De-tan & brightening'], NULL::text, 'skin', 2),
  ('home', 'Nails', 'Manicures, pedicures and nail art finished with an unhurried, detailed hand.', ARRAY['Manicure & pedicure','Gel & extensions','Nail art'], NULL::text, 'nails', 3),
  ('home', 'Makeover & Bridal', 'Party, reception and full bridal makeovers, built around your outfit and features.', ARRAY['Party & event makeup','Reception makeover','Complete bridal looks'], NULL::text, 'makeover', 4)
) AS v(page, title, description, items, price, image_key, display_order)
WHERE NOT EXISTS (SELECT 1 FROM public.site_services);

INSERT INTO public.site_offers (tag, title, body, cta_label, intent, display_order)
SELECT * FROM (VALUES
  ('Offer 01', 'Free Trial Makeup', 'A complimentary bridal trial so you can see, feel and finalise your look long before the wedding morning. By appointment only, subject to availability.', 'Book Free Trial', 'freeTrial', 1),
  ('Offer 02', '₹500 OFF', 'Get ₹500 OFF on salon services worth ₹1500 and above.', 'Claim ₹500 OFF', 'offer500', 2),
  ('Offer 03', '₹1 Anniversary Special', 'One selected eligible service for just ₹1 during the celebration. Slots are limited — message us to check the current eligible service and availability.', 'Ask About ₹1 Special', 'offerRupee1', 3)
) AS v(tag, title, body, cta_label, intent, display_order)
WHERE NOT EXISTS (SELECT 1 FROM public.site_offers);

-- ---------------------------------------------------------------------
-- 3. Remove the sample jewellery rows that shipped with no photos and
--    "replace this placeholder" text. Real products are never touched:
--    only rows with NO image and one of the original sample names.
-- ---------------------------------------------------------------------
DELETE FROM public.jewellery_products
WHERE image_url IS NULL
  AND name IN (
    'Antique Temple Bridal Set',
    'Lakshmi Kasu Haaram',
    'Ruby Jhumka Earrings',
    'Emerald Layered Necklace',
    'Chandbali Statement Earrings',
    'Pearl & Gold Reception Set'
  );

-- ---------------------------------------------------------------------
-- 4. Editable site photos: one row per replaced photo slot.
--    No row = the website uses its built-in sample photo for that slot.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.site_images (
  key text PRIMARY KEY,
  image_url text NOT NULL,
  image_alt text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.site_images TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_images TO authenticated;
GRANT ALL ON public.site_images TO service_role;
ALTER TABLE public.site_images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Site images are publicly viewable" ON public.site_images;
CREATE POLICY "Site images are publicly viewable" ON public.site_images
  FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Admins can insert site images" ON public.site_images;
CREATE POLICY "Admins can insert site images" ON public.site_images
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
DROP POLICY IF EXISTS "Admins can update site images" ON public.site_images;
CREATE POLICY "Admins can update site images" ON public.site_images
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
DROP POLICY IF EXISTS "Admins can delete site images" ON public.site_images;
CREATE POLICY "Admins can delete site images" ON public.site_images
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));

DROP TRIGGER IF EXISTS site_images_updated_at ON public.site_images;
CREATE TRIGGER site_images_updated_at BEFORE UPDATE ON public.site_images
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------
-- 5. Editable galleries (Home and Bridal)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.gallery_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page text NOT NULL DEFAULT 'home' CHECK (page IN ('home', 'bridal')),
  image_url text NOT NULL,
  image_alt text NOT NULL DEFAULT '',
  caption text NOT NULL DEFAULT '',
  display_order integer NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS gallery_images_page_idx
  ON public.gallery_images (page, is_published, display_order);

GRANT SELECT ON public.gallery_images TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.gallery_images TO authenticated;
GRANT ALL ON public.gallery_images TO service_role;
ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Published gallery images are publicly viewable" ON public.gallery_images;
CREATE POLICY "Published gallery images are publicly viewable" ON public.gallery_images
  FOR SELECT TO anon, authenticated USING (is_published = true);
DROP POLICY IF EXISTS "Admins can view all gallery images" ON public.gallery_images;
CREATE POLICY "Admins can view all gallery images" ON public.gallery_images
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));
DROP POLICY IF EXISTS "Admins can insert gallery images" ON public.gallery_images;
CREATE POLICY "Admins can insert gallery images" ON public.gallery_images
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
DROP POLICY IF EXISTS "Admins can update gallery images" ON public.gallery_images;
CREATE POLICY "Admins can update gallery images" ON public.gallery_images
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
DROP POLICY IF EXISTS "Admins can delete gallery images" ON public.gallery_images;
CREATE POLICY "Admins can delete gallery images" ON public.gallery_images
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));

DROP TRIGGER IF EXISTS gallery_images_updated_at ON public.gallery_images;
CREATE TRIGGER gallery_images_updated_at BEFORE UPDATE ON public.gallery_images
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------
-- 6. Admin hardening.
--    claim_admin() let the FIRST person to sign up become admin, and the
--    sign-up endpoint is public. Remove it. Admins are now granted only
--    from the Supabase SQL editor via make_admin('owner@email').
-- ---------------------------------------------------------------------
DROP FUNCTION IF EXISTS public.claim_admin();

CREATE OR REPLACE FUNCTION public.make_admin(_email text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  uid uuid;
BEGIN
  SELECT id INTO uid FROM auth.users WHERE lower(email) = lower(_email) LIMIT 1;
  IF uid IS NULL THEN
    RETURN 'No user with that email. Create the user first in Authentication > Users.';
  END IF;
  INSERT INTO public.user_roles (user_id, role) VALUES (uid, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN 'Admin access granted to ' || _email;
END;
$$;

REVOKE ALL ON FUNCTION public.make_admin(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.make_admin(text) TO service_role;
