DROP TABLE IF EXISTS private.job_secrets;
DROP SCHEMA IF EXISTS private;
CREATE TABLE public.job_secrets (
  name text PRIMARY KEY,
  value text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
REVOKE ALL ON public.job_secrets FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.job_secrets TO service_role;
ALTER TABLE public.job_secrets ENABLE ROW LEVEL SECURITY;