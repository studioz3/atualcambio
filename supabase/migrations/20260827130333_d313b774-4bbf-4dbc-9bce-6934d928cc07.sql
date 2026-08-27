CREATE OR REPLACE FUNCTION public.run_clarity_snapshot_cron()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'extensions'
AS $function$
DECLARE v_secret text;
BEGIN
  SELECT value INTO v_secret FROM public.app_config WHERE key = 'CRON_SECRET';
  IF v_secret IS NULL THEN RAISE NOTICE 'CRON_SECRET ausente em app_config'; RETURN; END IF;
  PERFORM net.http_post(
    url := 'https://atualcambio.lovable.app/api/cron/clarity-snapshot',
    headers := jsonb_build_object('Content-Type','application/json','x-cron-secret', v_secret),
    body := '{}'::jsonb,
    timeout_milliseconds := 60000
  );
END;
$function$;

SELECT cron.unschedule(jobid) FROM cron.job WHERE jobname = 'clarity-snapshot';

SELECT cron.schedule('clarity-snapshot', '0 0,6,12,18 * * *', $$SELECT public.run_clarity_snapshot_cron();$$);