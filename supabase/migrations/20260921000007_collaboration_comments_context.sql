-- Migration: 20260921000007_collaboration_comments_context.sql
-- Establishes contextual collaboration threads, attachments, references, and read states

-- 1. Create collaboration_threads table
CREATE TABLE IF NOT EXISTS public.collaboration_threads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    public_id TEXT UNIQUE NOT NULL,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    context_type TEXT NOT NULL, -- 'qr', 'approval', 'team', 'order', 'member', 'campaign', 'route', 'incident', 'journal'
    context_id TEXT NOT NULL,
    context_title TEXT NOT NULL,
    context_ref TEXT NOT NULL, -- e.g. 'VS-7F3K-9021', 'APR-8K2F'
    context_state TEXT,
    context_metadata JSONB DEFAULT '{}'::jsonb,
    title TEXT NOT NULL,
    state TEXT NOT NULL DEFAULT 'OPEN' CHECK (state IN ('OPEN', 'RESOLVED', 'LOCKED')),
    created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    resolved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    resolved_at TIMESTAMPTZ,
    resolution_note TEXT,
    last_activity_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Upgrade public.comments table
DO $$
BEGIN
    -- Drop restrictive resource_type check constraint if present
    ALTER TABLE public.comments DROP CONSTRAINT IF EXISTS comments_resource_type_check;
    
    -- Make resource_type and resource_id optional if they exist
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'comments' AND column_name = 'resource_type'
    ) THEN
        ALTER TABLE public.comments ALTER COLUMN resource_type DROP NOT NULL;
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'comments' AND column_name = 'resource_id'
    ) THEN
        ALTER TABLE public.comments ALTER COLUMN resource_id DROP NOT NULL;
    END IF;
END $$;

ALTER TABLE public.comments
    ADD COLUMN IF NOT EXISTS thread_id UUID REFERENCES public.collaboration_threads(id) ON DELETE CASCADE,
    ADD COLUMN IF NOT EXISTS public_id TEXT UNIQUE,
    ADD COLUMN IF NOT EXISTS parent_comment_id UUID REFERENCES public.comments(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS edited_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS body_format TEXT NOT NULL DEFAULT 'markdown',
    ADD COLUMN IF NOT EXISTS metadata JSONB NOT NULL DEFAULT '{}'::jsonb;

-- 3. Create comment_references table for linking real domain entities
CREATE TABLE IF NOT EXISTS public.comment_references (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    comment_id UUID NOT NULL REFERENCES public.comments(id) ON DELETE CASCADE,
    referenced_type TEXT NOT NULL, -- 'qr', 'approval', 'team', 'order', 'member', 'incident', 'journal'
    referenced_id TEXT NOT NULL,
    referenced_ref TEXT NOT NULL, -- e.g. 'APR-8K2F'
    referenced_title TEXT NOT NULL,
    referenced_state TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Create comment_attachments table
CREATE TABLE IF NOT EXISTS public.comment_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    comment_id UUID NOT NULL REFERENCES public.comments(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    file_type TEXT NOT NULL DEFAULT 'DOCUMENT', -- 'IMAGE', 'DOCUMENT', 'LOG'
    mime_type TEXT NOT NULL DEFAULT 'application/octet-stream',
    size_bytes BIGINT NOT NULL DEFAULT 0,
    storage_path TEXT NOT NULL,
    uploaded_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Create thread_read_states table for server-backed unread tracking
CREATE TABLE IF NOT EXISTS public.thread_read_states (
    thread_id UUID NOT NULL REFERENCES public.collaboration_threads(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    last_read_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY(thread_id, user_id)
);

-- 6. Indexes for high performance
CREATE INDEX IF NOT EXISTS idx_threads_org_state ON public.collaboration_threads(organization_id, state, last_activity_at DESC);
CREATE INDEX IF NOT EXISTS idx_threads_context ON public.collaboration_threads(organization_id, context_type, context_id);
CREATE INDEX IF NOT EXISTS idx_threads_public_id ON public.collaboration_threads(public_id);
CREATE INDEX IF NOT EXISTS idx_comments_thread ON public.comments(thread_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_comments_public_id ON public.comments(public_id);
CREATE INDEX IF NOT EXISTS idx_comment_refs_comment ON public.comment_references(comment_id);
CREATE INDEX IF NOT EXISTS idx_comment_att_comment ON public.comment_attachments(comment_id);
CREATE INDEX IF NOT EXISTS idx_thread_read_user ON public.thread_read_states(user_id, thread_id);

-- 7. Enable RLS
ALTER TABLE public.collaboration_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_references ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.thread_read_states ENABLE ROW LEVEL SECURITY;

-- 8. Policies for collaboration threads
DROP POLICY IF EXISTS "Members can view collaboration threads" ON public.collaboration_threads;
CREATE POLICY "Members can view collaboration threads" ON public.collaboration_threads
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.organization_memberships m
            WHERE m.organization_id = collaboration_threads.organization_id
            AND m.user_id = auth.uid()
            AND m.status = 'active'
        )
    );

DROP POLICY IF EXISTS "Members can create collaboration threads" ON public.collaboration_threads;
CREATE POLICY "Members can create collaboration threads" ON public.collaboration_threads
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.organization_memberships m
            WHERE m.organization_id = collaboration_threads.organization_id
            AND m.user_id = auth.uid()
            AND m.status = 'active'
        )
    );

DROP POLICY IF EXISTS "Members can update collaboration threads" ON public.collaboration_threads;
CREATE POLICY "Members can update collaboration threads" ON public.collaboration_threads
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.organization_memberships m
            WHERE m.organization_id = collaboration_threads.organization_id
            AND m.user_id = auth.uid()
            AND m.status = 'active'
        )
    );
