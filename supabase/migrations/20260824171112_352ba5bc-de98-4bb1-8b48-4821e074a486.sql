CREATE TABLE public.analytics_health_checks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source text NOT NULL,
  ok boolean NOT NULL,
  status_code integer,
  duration_ms integer NOT NULL DEFAULT 0,
  error text,
  alerted boolean NOT NULL DEFAULT false,
  checked_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX analytics_health_checks_source_idx ON public.analytics_health_checks (source, checked_at DESC);

GRANT SELECT ON public.analytics_health_checks TO authenticated;
GRANT ALL ON public.analytics_health_checks TO service_role;

ALTER TABLE public.analytics_health_checks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Time interno le saude analytics" ON public.analytics_health_checks
  FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));