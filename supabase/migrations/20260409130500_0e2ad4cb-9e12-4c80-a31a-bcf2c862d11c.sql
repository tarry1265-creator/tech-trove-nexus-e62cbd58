CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  metadata_username text;
  metadata_phone text;
BEGIN
  metadata_username := NULLIF(BTRIM(COALESCE(NEW.raw_user_meta_data->>'username', '')), '');
  metadata_phone := NULLIF(BTRIM(COALESCE(NEW.raw_user_meta_data->>'phone_number', '')), '');

  INSERT INTO public.profiles (user_id, username, phone_number)
  VALUES (NEW.id, metadata_username, metadata_phone)
  ON CONFLICT (user_id) DO UPDATE
  SET
    username = COALESCE(public.profiles.username, EXCLUDED.username),
    phone_number = COALESCE(public.profiles.phone_number, EXCLUDED.phone_number),
    updated_at = now();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

UPDATE public.profiles AS p
SET
  username = COALESCE(
    NULLIF(BTRIM(p.username), ''),
    NULLIF(BTRIM(COALESCE(u.raw_user_meta_data->>'username', '')), '')
  ),
  phone_number = COALESCE(
    NULLIF(BTRIM(p.phone_number), ''),
    NULLIF(BTRIM(COALESCE(u.raw_user_meta_data->>'phone_number', '')), '')
  )
FROM auth.users AS u
WHERE u.id = p.user_id
  AND (
    p.username IS NULL OR BTRIM(p.username) = ''
    OR p.phone_number IS NULL OR BTRIM(p.phone_number) = ''
  );
