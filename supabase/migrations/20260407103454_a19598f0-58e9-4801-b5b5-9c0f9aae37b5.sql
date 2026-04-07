ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS web3_experience text DEFAULT NULL;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS web3_onboarded boolean DEFAULT false;