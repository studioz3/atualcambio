CREATE TABLE public.oauth_states (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  state text NOT NULL UNIQUE,
  platform text NOT NULL,
  redirect_to text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '10 minutes'),
  consumed_at timestamptz
);

CREATE INDEX oauth_states_expires_idx ON public.oauth_states (expires_at);

GRANT ALL ON public.oauth_states TO service_role;

ALTER TABLE public.oauth_states ENABLE ROW LEVEL SECURITY;