ALTER TABLE public.social_accounts DROP COLUMN IF EXISTS account_name;
ALTER TABLE public.social_accounts DROP COLUMN IF EXISTS username;
ALTER TABLE public.social_accounts DROP CONSTRAINT IF EXISTS social_accounts_platform_external_id_key;