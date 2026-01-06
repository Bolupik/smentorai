-- Allow anyone to view profiles (for contributor display)
CREATE POLICY "Anyone can view profiles for contributor display"
ON public.profiles
FOR SELECT
USING (true);