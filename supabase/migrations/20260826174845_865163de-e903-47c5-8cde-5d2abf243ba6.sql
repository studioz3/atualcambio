DROP INDEX IF EXISTS public.rate_alerts_email_moeda_idx;
CREATE UNIQUE INDEX rate_alerts_email_moeda_idx ON public.rate_alerts (email, moeda);