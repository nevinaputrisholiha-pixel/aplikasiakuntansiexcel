-- Supabase default privileges grant table-level SELECT to anon/authenticated,
-- which defeated the column-level grants. Revoke, then re-grant narrowly.
REVOKE ALL ON public.products FROM anon, authenticated;
REVOKE ALL ON public.orders FROM anon, authenticated;
REVOKE ALL ON public.generated_files FROM anon, authenticated;
REVOKE ALL ON public.products_public FROM anon, authenticated;

-- Public catalog: safe columns only.
GRANT SELECT (id, name, price, active) ON public.products TO anon, authenticated;
GRANT SELECT ON public.products_public TO anon, authenticated;