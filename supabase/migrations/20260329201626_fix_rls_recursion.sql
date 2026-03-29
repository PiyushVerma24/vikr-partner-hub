-- Migration to fix infinite recursion in RLS policies
-- Created at: 2026-03-29

-- 1. Create helper functions with SECURITY DEFINER to bypass RLS recursion
CREATE OR REPLACE FUNCTION public.check_is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND is_admin = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_my_territory()
RETURNS territory AS $$
BEGIN
  RETURN (
    SELECT territory_code FROM public.profiles
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Update Profiles Policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (check_is_admin());

DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
CREATE POLICY "Admins can update all profiles"
  ON public.profiles FOR UPDATE
  USING (check_is_admin());

-- 3. Update Products Policies
DROP POLICY IF EXISTS "Admins manage products" ON public.products;
CREATE POLICY "Admins manage products"
  ON public.products FOR ALL
  USING (check_is_admin());

-- 4. Update Documents Policies
DROP POLICY IF EXISTS "Users view documents by region" ON public.documents;
CREATE POLICY "Users view documents by region"
  ON public.documents FOR SELECT
  USING (
    'GLOBAL' = ANY(valid_regions) OR
    get_my_territory() = ANY(valid_regions)
  );

DROP POLICY IF EXISTS "Admins manage documents" ON public.documents;
CREATE POLICY "Admins manage documents"
  ON public.documents FOR ALL
  USING (check_is_admin());

-- 5. Update Training Hub Videos Policies
DROP POLICY IF EXISTS "Users view training by region" ON public.training_hub_videos;
CREATE POLICY "Users view training by region"
  ON public.training_hub_videos FOR SELECT
  USING (
    'GLOBAL' = ANY(valid_regions) OR
    get_my_territory() = ANY(valid_regions)
  );

DROP POLICY IF EXISTS "Admins manage training" ON public.training_hub_videos;
CREATE POLICY "Admins manage training"
  ON public.training_hub_videos FOR ALL
  USING (check_is_admin());

-- 6. Update Announcements Policies
DROP POLICY IF EXISTS "Users view announcements by region" ON public.announcements;
CREATE POLICY "Users view announcements by region"
  ON public.announcements FOR SELECT
  USING (
    'GLOBAL' = ANY(valid_regions) OR
    get_my_territory() = ANY(valid_regions)
  );

DROP POLICY IF EXISTS "Admins manage announcements" ON public.announcements;
CREATE POLICY "Admins manage announcements"
  ON public.announcements FOR ALL
  USING (check_is_admin());

-- 7. Update Support Tickets Policies
DROP POLICY IF EXISTS "Admins manage all tickets" ON public.support_tickets;
CREATE POLICY "Admins manage all tickets"
  ON public.support_tickets FOR ALL
  USING (check_is_admin());

-- 8. Update Product Media Policies
DROP POLICY IF EXISTS "Admins manage product media" ON public.product_media;
CREATE POLICY "Admins manage product media"
  ON public.product_media FOR ALL
  USING (check_is_admin());

DROP POLICY IF EXISTS "Admins manage meetings" ON public.meetings;
CREATE POLICY "Admins manage meetings"
  ON public.meetings FOR ALL
  USING (check_is_admin());

-- 9. Update Storage Policies
DROP POLICY IF EXISTS "Admins can manage documents in storage" ON storage.objects;
CREATE POLICY "Admins can manage documents in storage"
  ON storage.objects FOR ALL
  TO authenticated
  USING (
    bucket_id = 'secure_documents' AND
    check_is_admin()
  );
