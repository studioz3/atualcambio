-- ============ social_accounts ============
ALTER TABLE public.social_accounts
  ADD COLUMN IF NOT EXISTS account_name text,
  ADD COLUMN IF NOT EXISTS username text,
  ADD COLUMN IF NOT EXISTS profile_picture_url text,
  ADD COLUMN IF NOT EXISTS access_token text,
  ADD COLUMN IF NOT EXISTS refresh_token text,
  ADD COLUMN IF NOT EXISTS token_expires_at timestamptz,
  ADD COLUMN IF NOT EXISTS data_access_expires_at timestamptz,
  ADD COLUMN IF NOT EXISTS scopes text[],
  ADD COLUMN IF NOT EXISTS last_error_at timestamptz;

UPDATE public.social_accounts
  SET external_id = 'pending:' || platform
  WHERE external_id IS NULL OR btrim(external_id) = '';

ALTER TABLE public.social_accounts ALTER COLUMN external_id SET NOT NULL;
ALTER TABLE public.social_accounts ALTER COLUMN status SET DEFAULT 'nao_conectado';

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'social_accounts_platform_external_id_key') THEN
    ALTER TABLE public.social_accounts ADD CONSTRAINT social_accounts_platform_external_id_key UNIQUE (platform, external_id);
  END IF;
END $$;

-- ============ social_posts ============
ALTER TABLE public.social_posts
  ADD COLUMN IF NOT EXISTS content_id text,
  ADD COLUMN IF NOT EXISTS permalink text,
  ADD COLUMN IF NOT EXISTS caption text,
  ADD COLUMN IF NOT EXISTS media_type text,
  ADD COLUMN IF NOT EXISTS media_product_type text,
  ADD COLUMN IF NOT EXISTS reach numeric,
  ADD COLUMN IF NOT EXISTS views numeric,
  ADD COLUMN IF NOT EXISTS engagements numeric,
  ADD COLUMN IF NOT EXISTS likes numeric,
  ADD COLUMN IF NOT EXISTS comments numeric,
  ADD COLUMN IF NOT EXISTS shares numeric,
  ADD COLUMN IF NOT EXISTS saves numeric,
  ADD COLUMN IF NOT EXISTS clicks numeric,
  ADD COLUMN IF NOT EXISTS avg_watch_time numeric,
  ADD COLUMN IF NOT EXISTS skip_rate numeric,
  ADD COLUMN IF NOT EXISTS metrics_available boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS metrics_unavailable_reason text,
  ADD COLUMN IF NOT EXISTS last_synced_at timestamptz;

UPDATE public.social_posts SET content_id = COALESCE(content_id, external_id, id::text) WHERE content_id IS NULL;
UPDATE public.social_posts SET permalink = COALESCE(permalink, url) WHERE permalink IS NULL;

ALTER TABLE public.social_posts ALTER COLUMN content_id SET NOT NULL;
ALTER TABLE public.social_posts ALTER COLUMN editorial_line SET DEFAULT 'nao_classificada';
ALTER TABLE public.social_posts ALTER COLUMN content_type DROP NOT NULL;
ALTER TABLE public.social_posts ALTER COLUMN published_at DROP NOT NULL;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'social_posts_platform_content_id_key') THEN
    ALTER TABLE public.social_posts ADD CONSTRAINT social_posts_platform_content_id_key UNIQUE (platform, content_id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS social_posts_platform_published_at_idx
  ON public.social_posts (platform, published_at DESC);

-- ============ social_metrics_daily ============
CREATE TABLE IF NOT EXISTS public.social_metrics_daily (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform text NOT NULL,
  metric text NOT NULL,
  value numeric NOT NULL,
  date date NOT NULL,
  editorial_line text DEFAULT 'nao_classificada',
  content_type text,
  source text NOT NULL DEFAULT 'api',
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT social_metrics_daily_unique UNIQUE (platform, metric, date)
);

GRANT ALL ON public.social_metrics_daily TO service_role;
ALTER TABLE public.social_metrics_daily ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS social_metrics_daily_platform_date_idx
  ON public.social_metrics_daily (platform, date);

-- ============ social_sync_runs ============
CREATE TABLE IF NOT EXISTS public.social_sync_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform text NOT NULL,
  started_at timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz,
  status text,
  items_synced int NOT NULL DEFAULT 0,
  rate_limit_pct numeric,
  error_message text
);

GRANT ALL ON public.social_sync_runs TO service_role;
ALTER TABLE public.social_sync_runs ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS social_sync_runs_platform_started_at_idx
  ON public.social_sync_runs (platform, started_at DESC);

-- ============ sem acesso anônimo em nenhuma tabela social ============
REVOKE ALL ON public.social_accounts FROM anon;
REVOKE ALL ON public.social_posts FROM anon;
REVOKE ALL ON public.social_metrics_daily FROM anon;
REVOKE ALL ON public.social_sync_runs FROM anon;
GRANT ALL ON public.social_accounts TO service_role;
GRANT ALL ON public.social_posts TO service_role;