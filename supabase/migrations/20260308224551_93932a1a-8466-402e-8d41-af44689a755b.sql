-- Drop the correctly-named trigger
DROP TRIGGER IF EXISTS enforce_age_level_immutability ON public.profiles;

-- Fix default to NULL (the root cause of onboarding being broken)
ALTER TABLE public.profiles ALTER COLUMN age_level SET DEFAULT NULL;

-- Reset auto-filled 'adult' on profiles that never completed onboarding
UPDATE public.profiles
SET age_level = NULL
WHERE age_level = 'adult'
  AND display_name IS NULL
  AND username IS NULL;

-- Recreate the lock trigger with correct name (safe now since default is NULL)
CREATE TRIGGER enforce_age_level_immutability
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.prevent_age_level_change();

-- Create the missing handle_new_user trigger so email signups auto-get a profile row
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();