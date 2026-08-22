CREATE TYPE public.app_role AS ENUM ('admin','marketing','consultor');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.is_staff(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id)
$$;

CREATE POLICY "Usuário vê os próprios papéis" ON public.user_roles
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE TABLE public.leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  nome text NOT NULL,
  email text NOT NULL,
  whatsapp text NOT NULL,
  tipo_cliente text NOT NULL DEFAULT 'pf',
  empresa text,
  produto text NOT NULL,
  operacao text,
  moeda text,
  faixa_valor text,
  finalidade text,
  prazo text,
  mensagem text,
  origem text,
  referrer text,
  source_page text,
  source_url text,
  entry_page text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,
  dispositivo text,
  status text NOT NULL DEFAULT 'Novo',
  consultor text,
  motivo_perda text,
  perda_observacao text,
  cliente_em timestamptz,
  cliente_consultor text,
  negocio_fechado_em date,
  negocio_produto text,
  negocio_valor numeric,
  negocio_moeda text,
  negocio_observacao text,
  negocio_consultor text,
  is_teste boolean NOT NULL DEFAULT false
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.leads TO authenticated;
GRANT ALL ON public.leads TO service_role;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Time interno lê leads" ON public.leads
  FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Time interno atualiza leads" ON public.leads
  FOR UPDATE TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "Admin remove leads" ON public.leads
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));

CREATE INDEX leads_created_at_idx ON public.leads (created_at DESC);
CREATE INDEX leads_status_idx ON public.leads (status);

CREATE TABLE public.lead_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  texto text NOT NULL,
  autor text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.lead_notes TO authenticated;
GRANT ALL ON public.lead_notes TO service_role;
ALTER TABLE public.lead_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Time interno lê notas" ON public.lead_notes
  FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Time interno cria notas" ON public.lead_notes
  FOR INSERT TO authenticated WITH CHECK (public.is_staff(auth.uid()));
CREATE INDEX lead_notes_lead_idx ON public.lead_notes (lead_id, created_at DESC);

CREATE TABLE public.lead_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  tipo text NOT NULL,
  status_anterior text,
  status_novo text,
  descricao text,
  autor text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.lead_events TO authenticated;
GRANT ALL ON public.lead_events TO service_role;
ALTER TABLE public.lead_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Time interno lê histórico" ON public.lead_events
  FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Time interno cria histórico" ON public.lead_events
  FOR INSERT TO authenticated WITH CHECK (public.is_staff(auth.uid()));
CREATE INDEX lead_events_lead_idx ON public.lead_events (lead_id, created_at);

CREATE TABLE public.newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  nome text NOT NULL,
  email text NOT NULL UNIQUE,
  momento_atual boolean NOT NULL DEFAULT false,
  cripto_wine boolean NOT NULL DEFAULT false,
  vida_atual boolean NOT NULL DEFAULT false,
  origem text,
  source_url text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,
  is_teste boolean NOT NULL DEFAULT false
);
GRANT SELECT ON public.newsletter_subscribers TO authenticated;
GRANT ALL ON public.newsletter_subscribers TO service_role;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Time interno lê assinantes" ON public.newsletter_subscribers
  FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER leads_set_updated_at BEFORE UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER newsletter_set_updated_at BEFORE UPDATE ON public.newsletter_subscribers
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();