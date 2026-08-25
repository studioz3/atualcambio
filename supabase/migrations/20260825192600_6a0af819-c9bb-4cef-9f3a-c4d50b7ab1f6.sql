CREATE TABLE public.translation_cache (
  hash TEXT NOT NULL,
  lang TEXT NOT NULL,
  source TEXT NOT NULL,
  target TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (hash, lang)
);
GRANT ALL ON public.translation_cache TO service_role;
ALTER TABLE public.translation_cache ENABLE ROW LEVEL SECURITY;
CREATE POLICY "translation_cache_no_public_access" ON public.translation_cache FOR SELECT TO authenticated USING (false);