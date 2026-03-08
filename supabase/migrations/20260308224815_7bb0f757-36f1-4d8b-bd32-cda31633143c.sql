-- Clean up profiles where BNS name was accidentally stored as a JSON object string
-- Extract full_name from the JSON if it looks like a JSON object
UPDATE public.profiles
SET
  bns_name = CASE
    WHEN bns_name IS NOT NULL AND bns_name LIKE '{%' THEN
      (bns_name::jsonb ->> 'full_name')
    ELSE bns_name
  END,
  display_name = CASE
    WHEN display_name IS NOT NULL AND display_name LIKE '{%' THEN
      (display_name::jsonb ->> 'full_name')
    ELSE display_name
  END,
  username = CASE
    WHEN username IS NOT NULL AND username LIKE '{%' THEN
      (username::jsonb ->> 'full_name')
    ELSE username
  END
WHERE
  (bns_name LIKE '{%' OR display_name LIKE '{%' OR username LIKE '{%');