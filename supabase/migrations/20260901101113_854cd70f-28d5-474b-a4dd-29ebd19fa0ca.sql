CREATE TABLE public.bundles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  bundle_price integer NOT NULL CHECK (bundle_price > 0),
  category text NOT NULL,
  best_seller boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.bundles TO anon, authenticated;
GRANT ALL ON public.bundles TO service_role;

ALTER TABLE public.bundles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active bundles are publicly listable"
  ON public.bundles FOR SELECT
  TO anon, authenticated
  USING (active = true);

CREATE TRIGGER bundles_set_updated_at
  BEFORE UPDATE ON public.bundles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.bundle_products (
  bundle_id uuid NOT NULL REFERENCES public.bundles(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  sort_order integer NOT NULL DEFAULT 0,
  PRIMARY KEY (bundle_id, product_id)
);

GRANT SELECT ON public.bundle_products TO anon, authenticated;
GRANT ALL ON public.bundle_products TO service_role;

ALTER TABLE public.bundle_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Bundle contents of active bundles are publicly listable"
  ON public.bundle_products FOR SELECT
  TO anon, authenticated
  USING (EXISTS (SELECT 1 FROM public.bundles b WHERE b.id = bundle_id AND b.active = true));

-- Orders: support bundle purchases without breaking individual product orders
ALTER TABLE public.orders
  ADD COLUMN order_type text NOT NULL DEFAULT 'product',
  ADD COLUMN bundle_id uuid REFERENCES public.bundles(id) ON DELETE RESTRICT;

UPDATE public.orders SET order_type = 'product';

ALTER TABLE public.orders ALTER COLUMN product_id DROP NOT NULL;

ALTER TABLE public.orders
  ADD CONSTRAINT orders_order_type_check CHECK (order_type IN ('product', 'bundle')),
  ADD CONSTRAINT orders_target_check CHECK (
    (order_type = 'product' AND product_id IS NOT NULL AND bundle_id IS NULL)
    OR (order_type = 'bundle' AND bundle_id IS NOT NULL AND product_id IS NULL)
  );

-- 12 bundles
INSERT INTO public.bundles (name, slug, bundle_price, category, best_seller, sort_order) VALUES
  ('Paket Nanas', 'paket-nanas', 697000, 'kombidagang', true, 1),
  ('Paket Strawberry', 'paket-strawberry', 547000, 'kombidagang', false, 2),
  ('Paket Jeruk', 'paket-jeruk', 477000, 'kombidagang', false, 3),
  ('Paket Kiwi', 'paket-kiwi', 347000, 'kombidagang', false, 4),
  ('Paket Jambu', 'paket-jambu', 697000, 'kombimanufaktur', false, 1),
  ('Paket Melon', 'paket-melon', 547000, 'kombimanufaktur', false, 2),
  ('Paket Mangga', 'paket-mangga', 477000, 'kombimanufaktur', false, 3),
  ('Paket Semangka', 'paket-semangka', 347000, 'kombimanufaktur', false, 4),
  ('Paket Apel', 'paket-apel', 347000, 'kombikasstok', false, 1),
  ('Paket Alpukat', 'paket-alpukat', 197000, 'kombikasstok', false, 2),
  ('Paket Anggur', 'paket-anggur', 1247000, 'mega', true, 1),
  ('Paket Cherry', 'paket-cherry', 627000, 'mega', false, 2);

INSERT INTO public.bundle_products (bundle_id, product_id, sort_order)
SELECT b.id, p.product_id, p.sort_order
FROM (VALUES
  ('paket-nanas', '7b2142d1-aa58-4485-9e37-1ee0324ed4af'::uuid, 1),
  ('paket-nanas', 'a2dd8819-b981-4d43-a4ac-ed889bcc93cc'::uuid, 2),
  ('paket-strawberry', '7b2142d1-aa58-4485-9e37-1ee0324ed4af'::uuid, 1),
  ('paket-strawberry', '26166423-a329-4e59-804b-5551d74fe940'::uuid, 2),
  ('paket-jeruk', 'e2724fd5-ef19-43e3-b92c-8f12e71b0418'::uuid, 1),
  ('paket-jeruk', 'a2dd8819-b981-4d43-a4ac-ed889bcc93cc'::uuid, 2),
  ('paket-kiwi', 'e2724fd5-ef19-43e3-b92c-8f12e71b0418'::uuid, 1),
  ('paket-kiwi', '26166423-a329-4e59-804b-5551d74fe940'::uuid, 2),
  ('paket-jambu', 'e8403aaf-4981-48be-99b6-357ac39e4cb9'::uuid, 1),
  ('paket-jambu', 'a2dd8819-b981-4d43-a4ac-ed889bcc93cc'::uuid, 2),
  ('paket-melon', 'e8403aaf-4981-48be-99b6-357ac39e4cb9'::uuid, 1),
  ('paket-melon', '26166423-a329-4e59-804b-5551d74fe940'::uuid, 2),
  ('paket-mangga', 'd3ea15b5-c326-49e4-a5d8-1da4da1f96f3'::uuid, 1),
  ('paket-mangga', 'a2dd8819-b981-4d43-a4ac-ed889bcc93cc'::uuid, 2),
  ('paket-semangka', 'd3ea15b5-c326-49e4-a5d8-1da4da1f96f3'::uuid, 1),
  ('paket-semangka', '26166423-a329-4e59-804b-5551d74fe940'::uuid, 2),
  ('paket-apel', 'a2dd8819-b981-4d43-a4ac-ed889bcc93cc'::uuid, 1),
  ('paket-apel', 'ad4f69b9-e26e-4f69-88e3-8fb67c46190b'::uuid, 2),
  ('paket-alpukat', '26166423-a329-4e59-804b-5551d74fe940'::uuid, 1),
  ('paket-alpukat', 'ad4f69b9-e26e-4f69-88e3-8fb67c46190b'::uuid, 2),
  ('paket-anggur', '3073f6d1-9f30-4a32-8097-00a0a4fa92d8'::uuid, 1),
  ('paket-anggur', '7b2142d1-aa58-4485-9e37-1ee0324ed4af'::uuid, 2),
  ('paket-anggur', 'e8403aaf-4981-48be-99b6-357ac39e4cb9'::uuid, 3),
  ('paket-cherry', '03aca12f-8be0-4f9c-b44c-2bbde01c95e2'::uuid, 1),
  ('paket-cherry', 'e2724fd5-ef19-43e3-b92c-8f12e71b0418'::uuid, 2),
  ('paket-cherry', 'd3ea15b5-c326-49e4-a5d8-1da4da1f96f3'::uuid, 3)
) AS p(slug, product_id, sort_order)
JOIN public.bundles b ON b.slug = p.slug;