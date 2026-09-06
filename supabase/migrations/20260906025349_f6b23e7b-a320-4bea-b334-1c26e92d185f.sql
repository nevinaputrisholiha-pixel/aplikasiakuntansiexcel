CREATE TABLE public.trial_access (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  first_download_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  generated_file_path text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.trial_access TO service_role;

ALTER TABLE public.trial_access ENABLE ROW LEVEL SECURITY;

-- No policies: browser clients (anon/authenticated) have no access at all.
-- Every read/write goes through server-side code using the service role.

-- One live trial per (email, product) at a time. Expired rows are removed by
-- the cleanup routine / claim flow, which frees the slot for a brand new trial.
CREATE UNIQUE INDEX trial_access_email_product_key
  ON public.trial_access (lower(email), product_id);

CREATE INDEX trial_access_expires_at_idx ON public.trial_access (expires_at);

CREATE TRIGGER trial_access_set_updated_at
  BEFORE UPDATE ON public.trial_access
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.products
  ADD COLUMN trial_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN trial_master_file_path text;