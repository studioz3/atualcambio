-- Cockpit Social: contas, publicações, métricas e importações
CREATE TABLE public.social_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform text NOT NULL UNIQUE,
  display_name text,
  handle text,
  profile_url text,
  external_id text,
  status text NOT NULL DEFAULT 'nao_conectado',
  last_sync_at timestamptz,
  last_error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.social_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform text NOT NULL,
  editorial_line text NOT NULL DEFAULT 'nao_classificada',
  content_type text NOT NULL DEFAULT 'nao_classificada',
  external_id text,
  url text,
  title text,
  thumbnail_url text,
  published_at timestamptz NOT NULL DEFAULT now(),
  campaign text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  cms_content_id uuid REFERENCES public.editorial_content(id) ON DELETE SET NULL,
  origin text NOT NULL DEFAULT 'manual',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX social_posts_platform_external_id_key
  ON public.social_posts (platform, external_id) WHERE external_id IS NOT NULL;
CREATE INDEX social_posts_published_at_idx ON public.social_posts (published_at DESC);

CREATE TABLE public.social_post_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.social_posts(id) ON DELETE CASCADE,
  metric_date date NOT NULL,
  reach integer,
  impressions integer,
  views integer,
  engagements integer,
  shares integer,
  saves integer,
  clicks integer,
  plays integer,
  listeners integer,
  watch_time_seconds integer,
  avg_view_seconds integer,
  retention_rate numeric,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (post_id, metric_date)
);

CREATE TABLE public.social_platform_daily (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform text NOT NULL,
  metric_date date NOT NULL,
  followers integer,
  followers_gained integer,
  followers_lost integer,
  reach integer,
  impressions integer,
  engagements integer,
  views integer,
  clicks integer,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (platform, metric_date)
);

CREATE TABLE public.social_imports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform text NOT NULL,
  kind text NOT NULL DEFAULT 'csv',
  file_name text,
  rows_imported integer NOT NULL DEFAULT 0,
  rows_skipped integer NOT NULL DEFAULT 0,
  period_from date,
  period_to date,
  imported_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.social_accounts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.social_posts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.social_post_metrics TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.social_platform_daily TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.social_imports TO authenticated;
GRANT ALL ON public.social_accounts TO service_role;
GRANT ALL ON public.social_posts TO service_role;
GRANT ALL ON public.social_post_metrics TO service_role;
GRANT ALL ON public.social_platform_daily TO service_role;
GRANT ALL ON public.social_imports TO service_role;

ALTER TABLE public.social_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_post_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_platform_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_imports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "staff manage social_accounts" ON public.social_accounts FOR ALL TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "staff manage social_posts" ON public.social_posts FOR ALL TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "staff manage social_post_metrics" ON public.social_post_metrics FOR ALL TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "staff manage social_platform_daily" ON public.social_platform_daily FOR ALL TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "staff manage social_imports" ON public.social_imports FOR ALL TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

CREATE TRIGGER social_accounts_updated_at BEFORE UPDATE ON public.social_accounts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER social_posts_updated_at BEFORE UPDATE ON public.social_posts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.social_accounts (platform, display_name) VALUES
  ('instagram','Instagram'),
  ('facebook','Facebook'),
  ('linkedin','LinkedIn'),
  ('tiktok','TikTok'),
  ('youtube','YouTube'),
  ('spotify','Spotify')
ON CONFLICT (platform) DO NOTHING;