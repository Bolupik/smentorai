-- 1. Drop the trigger preventing age_level changes (it blocks onboarding from setting the level)
DROP TRIGGER IF EXISTS enforce_age_level_immutability ON public.profiles;
DROP FUNCTION IF EXISTS public.prevent_age_level_change();

-- 2. Reset stuck profiles that have age_level='adult' set by the old buggy default
UPDATE public.profiles
SET age_level = NULL
WHERE age_level = 'adult'
  AND stacks_address IS NULL
  AND username IS NULL
  AND display_name IS NULL;

-- 3. Ensure the on_auth_user_created trigger exists (creates profile on signup)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();