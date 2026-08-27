-- shared updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- =========================
-- products
-- =========================
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  price INTEGER NOT NULL CHECK (price >= 0),
  master_file_path TEXT NOT NULL,
  target_sheet TEXT NOT NULL DEFAULT 'Home',
  target_cell TEXT NOT NULL DEFAULT 'B2',
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Public catalog may read ONLY these columns. master_file_path / target_sheet /
-- target_cell are never granted to anon or authenticated.
GRANT SELECT (id, name, price, active) ON public.products TO anon, authenticated;
GRANT ALL ON public.products TO service_role;

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active products are publicly listable"
  ON public.products FOR SELECT
  TO anon, authenticated
  USING (active = true);

CREATE TRIGGER products_set_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Convenience view for the public catalog (safe columns only).
CREATE VIEW public.products_public
WITH (security_invoker = true)
AS SELECT id, name, price, active FROM public.products WHERE active = true;

GRANT SELECT ON public.products_public TO anon, authenticated, service_role;

-- =========================
-- orders
-- =========================
CREATE SEQUENCE public.order_number_seq;

CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TEXT
LANGUAGE sql
VOLATILE
SET search_path = public
AS $$
  SELECT 'AAE-' || to_char(now() AT TIME ZONE 'Asia/Jakarta', 'YYYYMMDD') || '-'
         || lpad(nextval('public.order_number_seq')::text, 5, '0');
$$;

CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number TEXT NOT NULL UNIQUE DEFAULT public.generate_order_number(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  email TEXT NOT NULL,
  company_name TEXT NOT NULL,
  amount INTEGER NOT NULL CHECK (amount >= 0),
  payment_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (payment_status IN ('pending','paid','failed','refunded')),
  generation_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (generation_status IN ('pending','processing','done','failed')),
  generated_file_path TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX orders_product_id_idx ON public.orders(product_id);
CREATE INDEX orders_email_idx ON public.orders(lower(email));

-- Trusted server code only. No anon / authenticated grants at all.
GRANT ALL ON public.orders TO service_role;

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER orders_set_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================
-- generated_files
-- =========================
CREATE TABLE public.generated_files (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX generated_files_order_id_idx ON public.generated_files(order_id);

-- Trusted server code only. No anon / authenticated grants at all.
GRANT ALL ON public.generated_files TO service_role;

ALTER TABLE public.generated_files ENABLE ROW LEVEL SECURITY;

-- =========================
-- seed products
-- =========================
INSERT INTO public.products (name, price, master_file_path) VALUES
  ('Akuntansi Jasa — Versi Standar', 385000, 'masters/LISENSI_Program_Excel_Jasa_Standar.xlsx'),
  ('Akuntansi Jasa — Versi Lengkap', 585000, 'masters/LISENSI_Program_Excel_Jasa_Lengkap.xlsx'),
  ('Akuntansi Dagang — Versi Standar', 385000, 'masters/LISENSI_Program_Excel_Dagang_Standar.xlsx'),
  ('Akuntansi Dagang — Versi Lengkap', 585000, 'masters/LISENSI_Program_Excel_Dagang_Lengkap.xlsx'),
  ('Akuntansi Manufaktur — Versi Standar', 385000, 'masters/LISENSI_Program_Excel_Manufaktur_Standar.xlsx'),
  ('Akuntansi Manufaktur — Versi Lengkap', 585000, 'masters/LISENSI_Program_Excel_Manufaktur_Lengkap.xlsx'),
  ('Akuntansi Kontraktor — Versi Lengkap', 585000, 'masters/LISENSI_Program_Excel_Kontraktor.xlsx'),
  ('Stok Barang — Versi Standar', 185000, 'masters/LISENSI_Program_Excel_Stok_Barang_Standar_BARU.xlsx'),
  ('Stok Barang — Versi Lengkap', 385000, 'masters/LISENSI_Program_Excel_Stok_Barang_Lengkap.xlsx'),
  ('Buku Kas — Versi Lengkap', 185000, 'masters/LICENSI_Program_Excel_Buku_Kas.xlsx');