CREATE TABLE public.editorial_authors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  slug text NOT NULL UNIQUE,
  cargo text,
  bio text,
  foto_url text,
  links jsonb NOT NULL DEFAULT '[]'::jsonb,
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.editorial_authors TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.editorial_authors TO authenticated;
GRANT ALL ON public.editorial_authors TO service_role;
ALTER TABLE public.editorial_authors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Autores sao publicos" ON public.editorial_authors FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Time interno gerencia autores" ON public.editorial_authors FOR ALL TO authenticated USING (is_staff(auth.uid())) WITH CHECK (is_staff(auth.uid()));
CREATE TRIGGER editorial_authors_set_updated_at BEFORE UPDATE ON public.editorial_authors FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE public.editorial_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  editoria text NOT NULL CHECK (editoria IN ('momento-atual','cripto-wine','vida-atual')),
  nome text NOT NULL,
  slug text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (editoria, slug)
);
GRANT SELECT ON public.editorial_categories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.editorial_categories TO authenticated;
GRANT ALL ON public.editorial_categories TO service_role;
ALTER TABLE public.editorial_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Categorias sao publicas" ON public.editorial_categories FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Time interno gerencia categorias" ON public.editorial_categories FOR ALL TO authenticated USING (is_staff(auth.uid())) WITH CHECK (is_staff(auth.uid()));
CREATE TRIGGER editorial_categories_set_updated_at BEFORE UPDATE ON public.editorial_categories FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE public.editorial_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  editoria text NOT NULL CHECK (editoria IN ('momento-atual','cripto-wine','vida-atual')),
  tipo text NOT NULL DEFAULT 'artigo' CHECK (tipo IN ('artigo','podcast','video')),
  titulo text NOT NULL,
  subtitulo text,
  resumo text,
  slug text NOT NULL,
  categoria text,
  category_id uuid REFERENCES public.editorial_categories(id) ON DELETE SET NULL,
  author_id uuid REFERENCES public.editorial_authors(id) ON DELETE SET NULL,
  autor_nome text,
  hero_image text,
  hero_alt text,
  social_image text,
  corpo jsonb NOT NULL DEFAULT '[]'::jsonb,
  related_cta text NOT NULL DEFAULT 'nenhum',
  destaque_editoria boolean NOT NULL DEFAULT false,
  destaque_home boolean NOT NULL DEFAULT false,
  newsletter_selected boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'rascunho' CHECK (status IN ('rascunho','revisao','publicado')),
  seo_title text,
  meta_description text,
  canonical text,
  indexable boolean NOT NULL DEFAULT true,
  podcast jsonb,
  video jsonb,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  created_by uuid,
  updated_by uuid
);
CREATE UNIQUE INDEX editorial_content_slug_unico ON public.editorial_content (editoria, slug) WHERE deleted_at IS NULL;
CREATE INDEX editorial_content_publicados ON public.editorial_content (editoria, published_at DESC) WHERE status = 'publicado' AND deleted_at IS NULL;
GRANT SELECT ON public.editorial_content TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.editorial_content TO authenticated;
GRANT ALL ON public.editorial_content TO service_role;
ALTER TABLE public.editorial_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Publico le apenas publicados" ON public.editorial_content FOR SELECT TO anon, authenticated
  USING (status = 'publicado' AND deleted_at IS NULL);
CREATE POLICY "Time interno le tudo" ON public.editorial_content FOR SELECT TO authenticated USING (is_staff(auth.uid()));
CREATE POLICY "Time interno cria conteudo" ON public.editorial_content FOR INSERT TO authenticated WITH CHECK (is_staff(auth.uid()));
CREATE POLICY "Time interno edita conteudo" ON public.editorial_content FOR UPDATE TO authenticated USING (is_staff(auth.uid())) WITH CHECK (is_staff(auth.uid()));
CREATE POLICY "Admin remove conteudo" ON public.editorial_content FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE TRIGGER editorial_content_set_updated_at BEFORE UPDATE ON public.editorial_content FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE public.editorial_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id uuid NOT NULL REFERENCES public.editorial_content(id) ON DELETE CASCADE,
  nome text NOT NULL,
  url text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX editorial_sources_content ON public.editorial_sources (content_id);
GRANT SELECT ON public.editorial_sources TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.editorial_sources TO authenticated;
GRANT ALL ON public.editorial_sources TO service_role;
ALTER TABLE public.editorial_sources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Fontes de publicados sao publicas" ON public.editorial_sources FOR SELECT TO anon, authenticated
  USING (EXISTS (SELECT 1 FROM public.editorial_content c WHERE c.id = content_id AND c.status = 'publicado' AND c.deleted_at IS NULL));
CREATE POLICY "Time interno gerencia fontes" ON public.editorial_sources FOR ALL TO authenticated USING (is_staff(auth.uid())) WITH CHECK (is_staff(auth.uid()));

CREATE TABLE public.redirects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_path text NOT NULL UNIQUE,
  target_path text NOT NULL,
  status_code integer NOT NULL DEFAULT 301,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.redirects TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.redirects TO authenticated;
GRANT ALL ON public.redirects TO service_role;
ALTER TABLE public.redirects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Redirects sao publicos" ON public.redirects FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Time interno gerencia redirects" ON public.redirects FOR ALL TO authenticated USING (is_staff(auth.uid())) WITH CHECK (is_staff(auth.uid()));

CREATE POLICY "Imagens editoriais sao publicas" ON storage.objects FOR SELECT USING (bucket_id = 'editorial');
CREATE POLICY "Time interno envia imagens editoriais" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'editorial' AND is_staff(auth.uid()));
CREATE POLICY "Time interno atualiza imagens editoriais" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'editorial' AND is_staff(auth.uid()));
CREATE POLICY "Time interno remove imagens editoriais" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'editorial' AND is_staff(auth.uid()));

INSERT INTO public.editorial_authors (nome, slug, cargo, bio) VALUES
  ('Redação Atual', 'redacao-atual', 'Redação', 'Time editorial da Atual Câmbio.');

INSERT INTO public.editorial_categories (editoria, nome, slug, sort_order) VALUES
  ('momento-atual','Economia','economia',1),
  ('momento-atual','Política','politica',2),
  ('momento-atual','Mercados','mercados',3),
  ('momento-atual','Empresas','empresas',4),
  ('momento-atual','Mundo','mundo',5),
  ('momento-atual','Tecnologia','tecnologia',6),
  ('momento-atual','Regulação','regulacao',7),
  ('momento-atual','Câmbio','cambio',8),
  ('momento-atual','Editorial','editorial',9),
  ('cripto-wine','Vinhos','vinhos',1),
  ('cripto-wine','Tecnologia','tecnologia',2),
  ('cripto-wine','Mercado','mercado',3),
  ('cripto-wine','Cultura','cultura',4),
  ('cripto-wine','Viagens','viagens',5),
  ('cripto-wine','Gastronomia','gastronomia',6),
  ('cripto-wine','Negócios','negocios',7),
  ('cripto-wine','Pessoas','pessoas',8),
  ('cripto-wine','Editorial','editorial',9),
  ('vida-atual','Wellness','wellness',1),
  ('vida-atual','Longevidade','longevidade',2),
  ('vida-atual','Movimento','movimento',3),
  ('vida-atual','Sono','sono',4),
  ('vida-atual','Alimentação','alimentacao',5),
  ('vida-atual','Comportamento','comportamento',6),
  ('vida-atual','Tecnologia','tecnologia',7),
  ('vida-atual','Qualidade de Vida','qualidade-de-vida',8),
  ('vida-atual','Editorial','editorial',9);