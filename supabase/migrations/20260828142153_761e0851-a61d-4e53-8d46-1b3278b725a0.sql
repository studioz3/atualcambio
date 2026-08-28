
CREATE OR REPLACE FUNCTION public.can_leads(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SET search_path TO 'public' AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role IN ('admin','consultor'))
$$;

CREATE OR REPLACE FUNCTION public.can_content(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SET search_path TO 'public' AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role IN ('admin','marketing'))
$$;

-- Leads: admin + comercial
DROP POLICY IF EXISTS "Time interno lê leads" ON public.leads;
CREATE POLICY "Time comercial lê leads" ON public.leads FOR SELECT TO authenticated USING (public.can_leads(auth.uid()));
DROP POLICY IF EXISTS "Time interno atualiza leads" ON public.leads;
CREATE POLICY "Time comercial atualiza leads" ON public.leads FOR UPDATE TO authenticated USING (public.can_leads(auth.uid())) WITH CHECK (public.can_leads(auth.uid()));

DROP POLICY IF EXISTS "Time interno lê notas" ON public.lead_notes;
CREATE POLICY "Time comercial lê notas" ON public.lead_notes FOR SELECT TO authenticated USING (public.can_leads(auth.uid()));
DROP POLICY IF EXISTS "Time interno cria notas" ON public.lead_notes;
CREATE POLICY "Time comercial cria notas" ON public.lead_notes FOR INSERT TO authenticated WITH CHECK (public.can_leads(auth.uid()));

DROP POLICY IF EXISTS "Time interno lê histórico" ON public.lead_events;
CREATE POLICY "Time comercial lê histórico" ON public.lead_events FOR SELECT TO authenticated USING (public.can_leads(auth.uid()));
DROP POLICY IF EXISTS "Time interno cria histórico" ON public.lead_events;
CREATE POLICY "Time comercial cria histórico" ON public.lead_events FOR INSERT TO authenticated WITH CHECK (public.can_leads(auth.uid()));

-- Conteúdo / marketing: admin + marketing
DROP POLICY IF EXISTS "Time interno gerencia autores" ON public.editorial_authors;
CREATE POLICY "Marketing gerencia autores" ON public.editorial_authors FOR ALL TO authenticated USING (public.can_content(auth.uid())) WITH CHECK (public.can_content(auth.uid()));

DROP POLICY IF EXISTS "Time interno gerencia categorias" ON public.editorial_categories;
CREATE POLICY "Marketing gerencia categorias" ON public.editorial_categories FOR ALL TO authenticated USING (public.can_content(auth.uid())) WITH CHECK (public.can_content(auth.uid()));

DROP POLICY IF EXISTS "Time interno cria conteudo" ON public.editorial_content;
CREATE POLICY "Marketing cria conteudo" ON public.editorial_content FOR INSERT TO authenticated WITH CHECK (public.can_content(auth.uid()));
DROP POLICY IF EXISTS "Time interno edita conteudo" ON public.editorial_content;
CREATE POLICY "Marketing edita conteudo" ON public.editorial_content FOR UPDATE TO authenticated USING (public.can_content(auth.uid())) WITH CHECK (public.can_content(auth.uid()));
DROP POLICY IF EXISTS "Time interno le tudo" ON public.editorial_content;
CREATE POLICY "Marketing le tudo" ON public.editorial_content FOR SELECT TO authenticated USING (public.can_content(auth.uid()));

DROP POLICY IF EXISTS "Time interno gerencia fontes" ON public.editorial_sources;
CREATE POLICY "Marketing gerencia fontes" ON public.editorial_sources FOR ALL TO authenticated USING (public.can_content(auth.uid())) WITH CHECK (public.can_content(auth.uid()));

DROP POLICY IF EXISTS "Time interno gerencia editorias" ON public.editorials;
CREATE POLICY "Marketing gerencia editorias" ON public.editorials FOR ALL TO authenticated USING (public.can_content(auth.uid())) WITH CHECK (public.can_content(auth.uid()));
DROP POLICY IF EXISTS "Time interno le todas as editorias" ON public.editorials;
CREATE POLICY "Marketing le todas as editorias" ON public.editorials FOR SELECT TO authenticated USING (public.can_content(auth.uid()));

DROP POLICY IF EXISTS "Time interno gerencia episodios" ON public.podcast_episodes;
CREATE POLICY "Marketing gerencia episodios" ON public.podcast_episodes FOR ALL TO authenticated USING (public.can_content(auth.uid())) WITH CHECK (public.can_content(auth.uid()));

DROP POLICY IF EXISTS "Time interno gerencia redirects" ON public.redirects;
CREATE POLICY "Marketing gerencia redirects" ON public.redirects FOR ALL TO authenticated USING (public.can_content(auth.uid())) WITH CHECK (public.can_content(auth.uid()));

DROP POLICY IF EXISTS "Time interno lê assinantes" ON public.newsletter_subscribers;
CREATE POLICY "Marketing lê assinantes" ON public.newsletter_subscribers FOR SELECT TO authenticated USING (public.can_content(auth.uid()));

DROP POLICY IF EXISTS "Time interno le saude analytics" ON public.analytics_health_checks;
CREATE POLICY "Marketing le saude analytics" ON public.analytics_health_checks FOR SELECT TO authenticated USING (public.can_content(auth.uid()));

DROP POLICY IF EXISTS "staff manage social_accounts" ON public.social_accounts;
CREATE POLICY "marketing manage social_accounts" ON public.social_accounts FOR ALL TO authenticated USING (public.can_content(auth.uid())) WITH CHECK (public.can_content(auth.uid()));
DROP POLICY IF EXISTS "staff manage social_imports" ON public.social_imports;
CREATE POLICY "marketing manage social_imports" ON public.social_imports FOR ALL TO authenticated USING (public.can_content(auth.uid())) WITH CHECK (public.can_content(auth.uid()));
DROP POLICY IF EXISTS "staff manage social_platform_daily" ON public.social_platform_daily;
CREATE POLICY "marketing manage social_platform_daily" ON public.social_platform_daily FOR ALL TO authenticated USING (public.can_content(auth.uid())) WITH CHECK (public.can_content(auth.uid()));
DROP POLICY IF EXISTS "staff manage social_post_metrics" ON public.social_post_metrics;
CREATE POLICY "marketing manage social_post_metrics" ON public.social_post_metrics FOR ALL TO authenticated USING (public.can_content(auth.uid())) WITH CHECK (public.can_content(auth.uid()));
DROP POLICY IF EXISTS "staff manage social_posts" ON public.social_posts;
CREATE POLICY "marketing manage social_posts" ON public.social_posts FOR ALL TO authenticated USING (public.can_content(auth.uid())) WITH CHECK (public.can_content(auth.uid()));
