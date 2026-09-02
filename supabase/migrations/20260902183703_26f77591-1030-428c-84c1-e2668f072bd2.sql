CREATE TABLE public.denuncias (
  id uuid primary key default gen_random_uuid(),
  protocolo text not null unique,
  anonima boolean not null default true,
  nome text,
  email text,
  telefone text,
  categoria text not null,
  relato text not null,
  envolvidos text,
  ocorrido_em text,
  local text,
  status text not null default 'Nova',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
GRANT ALL ON public.denuncias TO service_role;
ALTER TABLE public.denuncias ENABLE ROW LEVEL SECURITY;