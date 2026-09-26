-- =====================================================================
-- Kaaras salon price list (editable from Admin -> Price list)
--   price_categories : Pedicure, Waxing, Manicure, Threading, De-Tan ...
--   price_items      : individual services with their price in rupees
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.price_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  -- "Starting from" figure shown on the category header (rupees). NULL = hidden.
  starting_from integer CHECK (starting_from IS NULL OR starting_from >= 0),
  display_order integer NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.price_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL REFERENCES public.price_categories(id) ON DELETE CASCADE,
  name text NOT NULL,
  -- Price in whole rupees. NULL = shown as "Enquire".
  price integer CHECK (price IS NULL OR price >= 0),
  display_order integer NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS price_items_category_idx
  ON public.price_items (category_id, display_order);

-- Permissions + row level security -------------------------------------
GRANT SELECT ON public.price_categories, public.price_items TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.price_categories, public.price_items TO authenticated;
GRANT ALL ON public.price_categories, public.price_items TO service_role;

ALTER TABLE public.price_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Published price categories are public" ON public.price_categories;
CREATE POLICY "Published price categories are public" ON public.price_categories
  FOR SELECT TO anon, authenticated USING (is_published = true);
DROP POLICY IF EXISTS "Admins can view all price categories" ON public.price_categories;
CREATE POLICY "Admins can view all price categories" ON public.price_categories
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));
DROP POLICY IF EXISTS "Admins can insert price categories" ON public.price_categories;
CREATE POLICY "Admins can insert price categories" ON public.price_categories
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
DROP POLICY IF EXISTS "Admins can update price categories" ON public.price_categories;
CREATE POLICY "Admins can update price categories" ON public.price_categories
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
DROP POLICY IF EXISTS "Admins can delete price categories" ON public.price_categories;
CREATE POLICY "Admins can delete price categories" ON public.price_categories
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Published price items are public" ON public.price_items;
CREATE POLICY "Published price items are public" ON public.price_items
  FOR SELECT TO anon, authenticated USING (is_published = true);
DROP POLICY IF EXISTS "Admins can view all price items" ON public.price_items;
CREATE POLICY "Admins can view all price items" ON public.price_items
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));
DROP POLICY IF EXISTS "Admins can insert price items" ON public.price_items;
CREATE POLICY "Admins can insert price items" ON public.price_items
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
DROP POLICY IF EXISTS "Admins can update price items" ON public.price_items;
CREATE POLICY "Admins can update price items" ON public.price_items
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
DROP POLICY IF EXISTS "Admins can delete price items" ON public.price_items;
CREATE POLICY "Admins can delete price items" ON public.price_items
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));

DROP TRIGGER IF EXISTS price_categories_updated_at ON public.price_categories;
CREATE TRIGGER price_categories_updated_at BEFORE UPDATE ON public.price_categories
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
DROP TRIGGER IF EXISTS price_items_updated_at ON public.price_items;
CREATE TRIGGER price_items_updated_at BEFORE UPDATE ON public.price_items
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Starter price list (only when the table is empty; never overwrites edits)
DO $$
DECLARE
  cid uuid;
BEGIN
  IF EXISTS (SELECT 1 FROM public.price_categories) THEN
    RETURN;
  END IF;

  INSERT INTO public.price_categories (title, starting_from, display_order)
  VALUES ('Pedicure', 799, 1) RETURNING id INTO cid;
  INSERT INTO public.price_items (category_id, name, price, display_order) VALUES
    (cid, 'Deluxe Pedicure', 799, 1),
    (cid, 'Premium Pedicure', 999, 2),
    (cid, 'Luxury Pedicure', 1499, 3),
    (cid, 'Tan Removal Pedicure', 1799, 4),
    (cid, 'Leg Nail Cut, File & Nail Paint', 299, 5);

  INSERT INTO public.price_categories (title, starting_from, display_order)
  VALUES ('Waxing', 119, 2) RETURNING id INTO cid;
  INSERT INTO public.price_items (category_id, name, price, display_order) VALUES
    (cid, 'Upper Lip', 119, 1),
    (cid, 'Chin', 119, 2),
    (cid, 'Sides', 149, 3),
    (cid, 'Full Face', 349, 4),
    (cid, 'Half Hands', 499, 5),
    (cid, 'Full Hands', 799, 6),
    (cid, 'Underarms', 299, 7),
    (cid, 'Half Legs', 649, 8),
    (cid, 'Full Legs', 949, 9),
    (cid, 'Upper Back', 499, 10),
    (cid, 'Full Back', 799, 11),
    (cid, 'Midriff', 499, 12),
    (cid, 'Full Front', 799, 13),
    (cid, 'Full Body', 2999, 14);

  INSERT INTO public.price_categories (title, starting_from, display_order)
  VALUES ('Manicure', 599, 3) RETURNING id INTO cid;
  INSERT INTO public.price_items (category_id, name, price, display_order) VALUES
    (cid, 'Deluxe Manicure', 599, 1),
    (cid, 'Premium Manicure', 849, 2),
    (cid, 'Luxury Manicure', 1099, 3),
    (cid, 'Tan Removal Manicure', 1499, 4),
    (cid, 'Hand Nail Cut, File & Nail Paint', 299, 5);

  INSERT INTO public.price_categories (title, starting_from, display_order)
  VALUES ('Threading', 59, 4) RETURNING id INTO cid;
  INSERT INTO public.price_items (category_id, name, price, display_order) VALUES
    (cid, 'Eyebrows', 69, 1),
    (cid, 'Forehead', 59, 2),
    (cid, 'Upper Lip', 59, 3),
    (cid, 'Chin', 59, 4),
    (cid, 'Sides', 79, 5),
    (cid, 'Full Face', 249, 6);

  INSERT INTO public.price_categories (title, starting_from, display_order)
  VALUES ('De-Tan', 199, 5) RETURNING id INTO cid;
  INSERT INTO public.price_items (category_id, name, price, display_order) VALUES
    (cid, 'Face', 399, 1),
    (cid, 'Full Arms', 499, 2),
    (cid, 'Full Legs', 699, 3),
    (cid, 'Half Legs', 499, 4),
    (cid, 'Feet', 199, 5),
    (cid, 'Back Neck', 299, 6),
    (cid, 'Full Body', 1499, 7);
END
$$;
