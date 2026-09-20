-- ==============================================================================
-- NAMMATECH 4K WALLPAPERS SCHEMA & SEED DATA
-- Run this SQL in your Supabase SQL Editor: Dashboard -> SQL Editor -> New Query
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.wallpapers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    preview_url TEXT NOT NULL,
    download_url TEXT NOT NULL,
    category VARCHAR(100) DEFAULT '4K Wallpapers',
    resolution VARCHAR(50) DEFAULT '4K Ultra HD',
    is_featured BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    downloads_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_wallpapers_active ON public.wallpapers(is_active);
CREATE INDEX IF NOT EXISTS idx_wallpapers_featured ON public.wallpapers(is_featured);
CREATE INDEX IF NOT EXISTS idx_wallpapers_sort ON public.wallpapers(sort_order ASC, created_at DESC);

ALTER TABLE public.wallpapers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view active wallpapers" ON public.wallpapers;
CREATE POLICY "Public can view active wallpapers"
    ON public.wallpapers FOR SELECT
    USING (is_active = true);

DROP POLICY IF EXISTS "Admins full access on wallpapers" ON public.wallpapers;
CREATE POLICY "Admins full access on wallpapers"
    ON public.wallpapers FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access on wallpapers" ON public.wallpapers;
CREATE POLICY "Service role full access on wallpapers"
    ON public.wallpapers FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);
