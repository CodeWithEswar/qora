-- ==============================================================================
-- NXTQR — Supabase Storage Buckets & Policies Migration
-- Version: 20260918000002_storage_and_files.sql
-- Storage buckets, file metadata tracking, and multi-tenant security policies.
-- ==============================================================================

-- 1. FILE ASSETS METADATA TABLE
CREATE TABLE IF NOT EXISTS public.file_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    bucket TEXT NOT NULL,
    object_path TEXT NOT NULL,
    file_name TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    size_bytes BIGINT NOT NULL,
    uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    legacy_id TEXT UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_file_assets_org ON public.file_assets(organization_id);
CREATE INDEX IF NOT EXISTS idx_file_assets_bucket_path ON public.file_assets(bucket, object_path);

-- 2. CREATE STANDARD SUPABASE STORAGE BUCKETS
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
    ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']),
    ('brand-assets', 'brand-assets', false, 20971520, NULL),
    ('qr-assets', 'qr-assets', true, 20971520, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'application/pdf']),
    ('files', 'files', false, 104857600, NULL),
    ('reports', 'reports', false, 52428800, ARRAY['application/pdf', 'text/csv', 'application/json']),
    ('exports', 'exports', false, 52428800, NULL)
ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 3. STORAGE OBJECTS ROW LEVEL SECURITY POLICIES

-- Avatars: Public read, owner manage
DROP POLICY IF EXISTS "Public can view avatars" ON storage.objects;
CREATE POLICY "Public can view avatars"
    ON storage.objects FOR SELECT
    TO public
    USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
CREATE POLICY "Users can upload their own avatar"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'avatars' AND
        (select auth.uid())::text = (storage.foldername(name))[1]
    );

DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
CREATE POLICY "Users can update their own avatar"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (
        bucket_id = 'avatars' AND
        (select auth.uid())::text = (storage.foldername(name))[1]
    )
    WITH CHECK (
        bucket_id = 'avatars' AND
        (select auth.uid())::text = (storage.foldername(name))[1]
    );

DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;
CREATE POLICY "Users can delete their own avatar"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'avatars' AND
        (select auth.uid())::text = (storage.foldername(name))[1]
    );

-- QR Assets: Public read, authenticated org members upload
DROP POLICY IF EXISTS "Public can view qr assets" ON storage.objects;
CREATE POLICY "Public can view qr assets"
    ON storage.objects FOR SELECT
    TO public
    USING (bucket_id = 'qr-assets');

DROP POLICY IF EXISTS "Authenticated users can upload qr assets" ON storage.objects;
CREATE POLICY "Authenticated users can upload qr assets"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'qr-assets');

DROP POLICY IF EXISTS "Authenticated users can update qr assets" ON storage.objects;
CREATE POLICY "Authenticated users can update qr assets"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (bucket_id = 'qr-assets')
    WITH CHECK (bucket_id = 'qr-assets');
