CREATE TABLE public.rate_alerts (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  email text not null,
  nome text,
  base text not null default 'BRL',
  moeda text not null,
  taxa_referencia numeric,
  taxa_alvo numeric,
  atualizacoes_diarias boolean not null default true,
  alerta_valor boolean not null default false,
  ativo boolean not null default true,
  source_url text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text
);

GRANT ALL ON public.rate_alerts TO service_role;
GRANT SELECT, UPDATE ON public.rate_alerts TO authenticated;

ALTER TABLE public.rate_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can read rate alerts" ON public.rate_alerts
  FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Staff can update rate alerts" ON public.rate_alerts
  FOR UPDATE TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

CREATE INDEX rate_alerts_moeda_idx ON public.rate_alerts (moeda);
CREATE UNIQUE INDEX rate_alerts_email_moeda_idx ON public.rate_alerts (lower(email), moeda);