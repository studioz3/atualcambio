-- 1. Entidade Editorias
CREATE TABLE IF NOT EXISTS public.editorials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  status text NOT NULL DEFAULT 'ativa',
  visible_on_site boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  image text,
  meta_title text,
  meta_description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.editorials TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.editorials TO authenticated;
GRANT ALL ON public.editorials TO service_role;

ALTER TABLE public.editorials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Editorias visiveis sao publicas"
  ON public.editorials FOR SELECT TO anon, authenticated
  USING (visible_on_site = true AND status = 'ativa');

CREATE POLICY "Time interno le todas as editorias"
  ON public.editorials FOR SELECT TO authenticated
  USING (public.is_staff(auth.uid()));

CREATE POLICY "Time interno gerencia editorias"
  ON public.editorials FOR ALL TO authenticated
  USING (public.is_staff(auth.uid()))
  WITH CHECK (public.is_staff(auth.uid()));

CREATE TRIGGER editorials_set_updated_at
  BEFORE UPDATE ON public.editorials
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.editorials (name, slug, description, display_order, meta_title, meta_description)
VALUES
  ('Momento Atual', 'momento-atual', 'Economia, política, mercados e mundo.', 1,
   'Momento Atual | Economia, política e mercados',
   'O que está acontecendo no mundo — e por que isso importa.'),
  ('Cripto Wine', 'cripto-wine', 'Vinho, tecnologia, mercado e cultura.', 2,
   'Cripto Wine | Vinho, tecnologia e mercado',
   'Onde vinho, tecnologia, cultura e mercado se encontram.'),
  ('Vida Atual', 'vida-atual', 'Wellness, comportamento e qualidade de vida.', 3,
   'Vida Atual | Wellness, comportamento e qualidade de vida',
   'Informação para viver melhor em um mundo que muda rápido.')
ON CONFLICT (slug) DO NOTHING;

-- 2. Relacionamento dos conteúdos com a editoria
ALTER TABLE public.editorial_content
  ADD COLUMN IF NOT EXISTS editorial_id uuid REFERENCES public.editorials(id);

UPDATE public.editorial_content c
SET editorial_id = e.id
FROM public.editorials e
WHERE c.editorial_id IS NULL AND e.slug = c.editoria;

CREATE INDEX IF NOT EXISTS editorial_content_editorial_id_idx
  ON public.editorial_content (editorial_id);

-- 3. Migração não destrutiva dos episódios de podcast para a biblioteca de conteúdo
INSERT INTO public.editorial_content (
  id, editoria, editorial_id, tipo, titulo, resumo, slug, autor_nome,
  corpo, related_cta, status, podcast, published_at, created_at, updated_at, indexable
)
SELECT
  p.id,
  p.editoria,
  e.id,
  'podcast',
  p.titulo,
  p.descricao,
  left(
    trim(both '-' from regexp_replace(
      lower(translate(p.titulo,
        'áàâãäéèêëíìîïóòôõöúùûüçÁÀÂÃÄÉÈÊËÍÌÎÏÓÒÔÕÖÚÙÛÜÇ',
        'aaaaaeeeeiiiiooooouuuucAAAAAEEEEIIIIOOOOOUUUUC')),
      '[^a-z0-9]+', '-', 'g')),
    90),
  'Redação Atual',
  jsonb_build_array(jsonb_build_object('type', 'spotify', 'url', p.spotify_url, 'titulo', p.titulo)),
  'nenhum',
  CASE WHEN p.ativo THEN 'publicado' ELSE 'rascunho' END,
  jsonb_strip_nulls(jsonb_build_object(
    'spotify_url', p.spotify_url,
    'duracao_segundos', p.duracao_segundos,
    'plataforma', 'spotify'
  )),
  p.published_at,
  p.created_at,
  p.updated_at,
  true
FROM public.podcast_episodes p
LEFT JOIN public.editorials e ON e.slug = p.editoria
WHERE NOT EXISTS (SELECT 1 FROM public.editorial_content c WHERE c.id = p.id);
