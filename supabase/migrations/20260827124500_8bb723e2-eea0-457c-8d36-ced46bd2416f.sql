CREATE TABLE IF NOT EXISTS public.clarity_snapshots (
  key text PRIMARY KEY,
  payload jsonb NOT NULL,
  fetched_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.clarity_snapshots TO service_role;
ALTER TABLE public.clarity_snapshots ENABLE ROW LEVEL SECURITY;