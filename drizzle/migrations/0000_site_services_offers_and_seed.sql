-- Editable salon services (Home + Bridal pages)
CREATE TABLE public.site_services (
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

CREATE POLICY "Published services are publicly viewable" ON public.site_services
  FOR SELECT TO anon, authenticated USING (is_published = true);
CREATE POLICY "Admins can view all services" ON public.site_services
  FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can insert services" ON public.site_services
  FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update services" ON public.site_services
  FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete services" ON public.site_services
  FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER site_services_updated_at BEFORE UPDATE ON public.site_services
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Editable anniversary offers / discounts
CREATE TABLE public.site_offers (
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

CREATE POLICY "Published offers are publicly viewable" ON public.site_offers
  FOR SELECT TO anon, authenticated USING (is_published = true);
CREATE POLICY "Admins can view all offers" ON public.site_offers
  FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can insert offers" ON public.site_offers
  FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update offers" ON public.site_offers
  FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete offers" ON public.site_offers
  FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER site_offers_updated_at BEFORE UPDATE ON public.site_offers
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Seed current site copy so the owner edits instead of starting from nothing
INSERT INTO public.site_services (page, title, description, items, price, image_key, display_order) VALUES
('home', 'Hair Artistry', 'Cuts, styling, smoothening and colour, shaped to your hair type and the occasion.', ARRAY['Cutting & styling','Colour & highlights','Smoothening & care'], NULL, 'hair', 1),
('home', 'Skin & Threading', 'Facials, clean-ups and precise threading for skin that looks cared for, not made over.', ARRAY['Facials & clean-ups','Threading & shaping','De-tan & brightening'], NULL, 'skin', 2),
('home', 'Nails', 'Manicures, pedicures and nail art finished with an unhurried, detailed hand.', ARRAY['Manicure & pedicure','Gel & extensions','Nail art'], NULL, 'nails', 3),
('home', 'Makeover & Bridal', 'Party, reception and full bridal makeovers, built around your outfit and features.', ARRAY['Party & event makeup','Reception makeover','Complete bridal looks'], NULL, 'makeover', 4);

INSERT INTO public.site_offers (tag, title, body, cta_label, intent, display_order) VALUES
('Offer 01', 'Free Trial Makeup', 'A complimentary bridal trial so you can see, feel and finalise your look long before the wedding morning. By appointment only, subject to availability.', 'Book Free Trial', 'freeTrial', 1),
('Offer 02', '₹500 OFF', 'Get ₹500 OFF on salon services worth ₹1500 and above.', 'Claim ₹500 OFF', 'offer500', 2),
('Offer 03', '₹1 Anniversary Special', 'One selected eligible service for just ₹1 during the celebration. Slots are limited — message us to check the current eligible service and availability.', 'Ask About ₹1 Special', 'offerRupee1', 3);

-- (Sample jewellery rows removed: the owner adds real pieces from the dashboard.)
