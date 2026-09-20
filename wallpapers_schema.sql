-- ==============================================================================
-- NAMMATECH 4K WALLPAPERS SCHEMA & SEED DATA
-- Run this SQL in your Supabase SQL Editor: Dashboard -> SQL Editor -> New Query
-- ==============================================================================

-- 1. Create the wallpapers table
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

-- 2. Create indexes for high-speed queries
CREATE INDEX IF NOT EXISTS idx_wallpapers_active ON public.wallpapers(is_active);
CREATE INDEX IF NOT EXISTS idx_wallpapers_featured ON public.wallpapers(is_featured);
CREATE INDEX IF NOT EXISTS idx_wallpapers_sort ON public.wallpapers(sort_order ASC, created_at DESC);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.wallpapers ENABLE ROW LEVEL SECURITY;

-- 4. Policies
-- Allow anyone to view active wallpapers
DROP POLICY IF EXISTS "Public can view active wallpapers" ON public.wallpapers;
CREATE POLICY "Public can view active wallpapers"
    ON public.wallpapers FOR SELECT
    USING (is_active = true);

-- Allow authenticated admins full CRUD access
DROP POLICY IF EXISTS "Admins full access on wallpapers" ON public.wallpapers;
CREATE POLICY "Admins full access on wallpapers"
    ON public.wallpapers FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Allow service role full access
DROP POLICY IF EXISTS "Service role full access on wallpapers" ON public.wallpapers;
CREATE POLICY "Service role full access on wallpapers"
    ON public.wallpapers FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- 5. Seed initial high-definition 4K wallpapers
INSERT INTO public.wallpapers (name, preview_url, download_url, category, resolution, is_featured, is_active, sort_order)
VALUES
(
    'Cosmic Nebula & Golden Stars',
    'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=3840&q=100',
    'Cosmic & Space',
    '4K Ultra HD',
    true,
    true,
    1
),
(
    'Cyberpunk Neo Tokyo Night',
    'https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=3840&q=100',
    'Cyberpunk & Tech',
    '4K Ultra HD',
    true,
    true,
    2
),
(
    'Minimalist Obsidian Peaks',
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=3840&q=100',
    'Minimal & Dark',
    '4K Ultra HD',
    true,
    true,
    3
),
(
    'Anime Sunset Horizon Drive',
    'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=3840&q=100',
    'Anime & Art',
    '4K Ultra HD',
    true,
    true,
    4
),
(
    'Neon Abstract Fluid Waves',
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=3840&q=100',
    'Abstract & 3D',
    '4K Ultra HD',
    true,
    true,
    5
),
(
    'Mystic Emerald Mountain Mist',
    'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=3840&q=100',
    'Nature & Cinema',
    '4K Ultra HD',
    true,
    true,
    6
)
ON CONFLICT DO NOTHING;
