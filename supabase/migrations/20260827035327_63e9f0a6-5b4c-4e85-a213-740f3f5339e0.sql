CREATE TABLE IF NOT EXISTS public.app_config (
  key text PRIMARY KEY,
  value text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.app_config TO service_role;
ALTER TABLE public.app_config ENABLE ROW LEVEL SECURITY;

CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

CREATE OR REPLACE FUNCTION public.run_social_sync_cron()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE v_secret text;
BEGIN
  SELECT value INTO v_secret FROM public.app_config WHERE key = 'CRON_SECRET';
  IF v_secret IS NULL THEN RAISE NOTICE 'CRON_SECRET ausente em app_config'; RETURN; END IF;
  PERFORM net.http_post(
    url := 'https://atualcambio.lovable.app/api/cron/social-sync',
    headers := jsonb_build_object('Content-Type','application/json','x-cron-secret', v_secret),
    body := '{}'::jsonb,
    timeout_milliseconds := 60000
  );
END;
$$;

REVOKE ALL ON FUNCTION public.run_social_sync_cron() FROM public, anon, authenticated;

SELECT cron.unschedule('social-sync-daily') WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'social-sync-daily');

SELECT cron.schedule('social-sync-daily', '0 9 * * *', $$SELECT public.run_social_sync_cron();$$);