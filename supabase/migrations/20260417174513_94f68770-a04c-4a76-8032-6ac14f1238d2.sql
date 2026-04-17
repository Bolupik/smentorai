-- Ensure each Stacks wallet address can only be linked to one account.
-- Use a partial unique index so multiple NULLs (unlinked accounts) are allowed.
CREATE UNIQUE INDEX IF NOT EXISTS profiles_stacks_address_unique
  ON public.profiles (stacks_address)
  WHERE stacks_address IS NOT NULL;