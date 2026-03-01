
-- Prevent age_level from being changed after the profile row is created.
-- We use a trigger (BEFORE UPDATE) to enforce immutability of age_level.

CREATE OR REPLACE FUNCTION public.prevent_age_level_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- If age_level was already set (non-null), disallow any change
  IF OLD.age_level IS NOT NULL AND NEW.age_level IS DISTINCT FROM OLD.age_level THEN
    RAISE EXCEPTION 'age_level cannot be changed after it has been set';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER enforce_age_level_immutability
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.prevent_age_level_change();
