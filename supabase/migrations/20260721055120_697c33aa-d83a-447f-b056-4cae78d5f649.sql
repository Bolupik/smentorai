
CREATE TABLE public.passkey_credentials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  credential_id TEXT NOT NULL UNIQUE,
  public_key TEXT NOT NULL,
  counter BIGINT NOT NULL DEFAULT 0,
  transports TEXT[] NOT NULL DEFAULT '{}',
  label TEXT,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX passkey_credentials_user_id_idx ON public.passkey_credentials(user_id);

GRANT SELECT, DELETE ON public.passkey_credentials TO authenticated;
GRANT ALL ON public.passkey_credentials TO service_role;
ALTER TABLE public.passkey_credentials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own passkeys" ON public.passkey_credentials
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users delete own passkeys" ON public.passkey_credentials
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.webauthn_challenges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_key TEXT NOT NULL UNIQUE,
  challenge TEXT NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('register','authenticate')),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '5 minutes'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX webauthn_challenges_session_key_idx ON public.webauthn_challenges(session_key);

GRANT ALL ON public.webauthn_challenges TO service_role;
ALTER TABLE public.webauthn_challenges ENABLE ROW LEVEL SECURITY;
-- No policies for authenticated: only service_role manages these via edge function.
