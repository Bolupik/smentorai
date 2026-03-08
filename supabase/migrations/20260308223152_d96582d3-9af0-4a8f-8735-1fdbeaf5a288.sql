
-- Add stacks_address and bns_name columns to profiles for account linking
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS stacks_address text,
  ADD COLUMN IF NOT EXISTS bns_name text;

-- Unique index: one STX address can only be linked to one profile
CREATE UNIQUE INDEX IF NOT EXISTS profiles_stacks_address_key ON public.profiles (stacks_address)
  WHERE stacks_address IS NOT NULL;
