CREATE TABLE public.podcast_episodes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  editoria text NOT NULL DEFAULT 'momento-atual',
  titulo text NOT NULL,
  descricao text,
  spotify_url text NOT NULL,
  duracao_segundos integer,
  published_at timestamptz NOT NULL DEFAULT now(),
  ativo boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.podcast_episodes TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.podcast_episodes TO authenticated;
GRANT ALL ON public.podcast_episodes TO service_role;

ALTER TABLE public.podcast_episodes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Episodios ativos sao publicos" ON public.podcast_episodes
  FOR SELECT TO anon, authenticated USING (ativo = true);

CREATE POLICY "Time interno gerencia episodios" ON public.podcast_episodes
  FOR ALL TO authenticated USING (is_staff(auth.uid())) WITH CHECK (is_staff(auth.uid()));

CREATE TRIGGER podcast_episodes_updated_at BEFORE UPDATE ON public.podcast_episodes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.podcast_episodes (titulo, spotify_url, duracao_segundos, published_at) VALUES
  ('Momento Atual - 34ª Semana', 'https://open.spotify.com/episode/4YeH5pqF6rYvs0mOHGarrd', 914, '2026-08-21T14:20:00Z'),
  ('Momento Atual - 33ª Semana', 'https://open.spotify.com/episode/3AvD9YqcDj7xpI4WbDIZ6s', 476, '2026-08-14T14:05:00Z'),
  ('Momento Atual - 32ª Semana', 'https://open.spotify.com/episode/7LNVvmJDbTy8peciBl3W1m', 782, '2026-08-07T13:57:00Z'),
  ('Momento Atual - 31ª Semana', 'https://open.spotify.com/episode/3PV29RzGG7BGYWdNKwU5wr', 582, '2026-07-31T14:37:00Z'),
  ('Momento Atual - 30ª Semana', 'https://open.spotify.com/episode/24DudHibxLu5thTIWrVtYG', 546, '2026-07-24T14:46:00Z'),
  ('Momento Atual - 29ª Semana', 'https://open.spotify.com/episode/5Z05VUa4kzCcMczqwCwpJg', 439, '2026-07-17T18:00:00Z'),
  ('Momento Atual - 28ª Semana', 'https://open.spotify.com/episode/5Kf96maG70XZTB8PmvbzIs', 177, '2026-07-10T18:32:00Z'),
  ('Momento Atual - 27ª Semana', 'https://open.spotify.com/episode/43gIVplH8QrN9X82Veusol', 302, '2026-07-03T17:03:00Z'),
  ('Momento Atual - 26ª Semana', 'https://open.spotify.com/episode/6y0QQc9AMEKLw9HuTnmb9n', 236, '2026-06-26T19:50:00Z'),
  ('Momento Atual - 25ª Semana', 'https://open.spotify.com/episode/12CCdUMIWHiaAqB6gmcaLu', 140, '2026-06-26T19:44:00Z'),
  ('Momento Atual - 24ª Semana', 'https://open.spotify.com/episode/6Id4uce5hA0HCAiYU6N5LO', 123, '2026-06-26T19:38:00Z');