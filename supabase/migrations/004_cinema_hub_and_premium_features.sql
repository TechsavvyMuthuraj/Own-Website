-- ==============================================================================
-- NAMMATECH CINEMA HUB & PREMIUM 4K FEATURES MIGRATION
-- Migration: 004_cinema_hub_and_premium_features.sql
-- ==============================================================================

-- 1. Add Dedicated Cinema Hub Columns to Resources Table (if not existing)
ALTER TABLE public.resources ADD COLUMN IF NOT EXISTS trailer_url TEXT;
ALTER TABLE public.resources ADD COLUMN IF NOT EXISTS rating NUMERIC(3, 1);
ALTER TABLE public.resources ADD COLUMN IF NOT EXISTS quality TEXT DEFAULT '1080p FHD';

-- Comment on columns for clear documentation
COMMENT ON COLUMN public.resources.trailer_url IS 'Direct YouTube or video trailer URL (supports watch, embed, shorts, youtu.be)';
COMMENT ON COLUMN public.resources.rating IS 'IMDb or critic rating score (e.g. 8.5)';
COMMENT ON COLUMN public.resources.quality IS 'Primary video quality label (4K UHD, 1080p FHD, 720p HD, 4K HDR Dolby)';

-- 2. Ensure Movies & Cinema Category Exists
INSERT INTO public.categories (id, name, slug, description, icon, is_active, sort_order)
VALUES (
  '50e82476-24c6-498c-a703-49bbb96b0dcf',
  'Movies & Cinema',
  'movies',
  'Blockbuster movies, cinema downloads, 4K UHD masters, multi-audio releases with Dolby Atmos.',
  'Film',
  true,
  10
)
ON CONFLICT (slug) DO UPDATE
SET 
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  is_active = true;

-- 3. High-Performance Cinema Hub Indexes
-- GIN Index for rapid genre & tags array filtering (Action, Thriller, 4K UHD, etc.)
CREATE INDEX IF NOT EXISTS idx_resources_tags_gin
  ON public.resources USING gin(tags);

-- Fast lookup index on slug for dedicated /movies/[slug] view page
CREATE INDEX IF NOT EXISTS idx_resources_slug_status
  ON public.resources(slug, status);

-- Composite index for Cinema category listing & sorting
CREATE INDEX IF NOT EXISTS idx_resources_cinema_published
  ON public.resources(category_id, published_at DESC)
  WHERE status = 'PUBLISHED';

-- Dedicated index on download_links for fast mirror retrieval
CREATE INDEX IF NOT EXISTS idx_download_links_composite
  ON public.download_links(resource_id, link_type, sort_order ASC);

-- 4. Secure Row-Level Security (RLS) Policies for Cinema Hub
ALTER TABLE public.download_links ENABLE ROW LEVEL SECURITY;

-- Public can view active download links for published movies/resources
DROP POLICY IF EXISTS "Public can view active download links for published resources" ON public.download_links;
CREATE POLICY "Public can view active download links for published resources"
  ON public.download_links
  FOR SELECT
  USING (
    is_active = true
    AND EXISTS (
      SELECT 1 FROM public.resources r
      WHERE r.id = download_links.resource_id
        AND r.status = 'PUBLISHED'
    )
  );

-- Admins can manage (INSERT, UPDATE, DELETE) all download links
DROP POLICY IF EXISTS "Admins can manage download links" ON public.download_links;
CREATE POLICY "Admins can manage download links"
  ON public.download_links
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('ADMIN', 'SUPER_ADMIN')
    )
  );

-- 5. Helpful view for Cinema Hub Catalog (Optional / Query Acceleration)
CREATE OR REPLACE VIEW public.vw_cinema_movies AS
SELECT 
  r.id,
  r.title,
  r.slug,
  r.version AS year,
  r.platform AS audio,
  r.developer AS cast_crew,
  r.thumbnail_url AS poster_url,
  COALESCE(r.trailer_url, r.changelog) AS trailer_url,
  r.price,
  r.sale_price,
  r.status,
  r.featured,
  r.published_at,
  r.created_at,
  (
    SELECT json_agg(
      json_build_object(
        'id', dl.id,
        'title', dl.title,
        'link_type', dl.link_type,
        'url', dl.url,
        'size_bytes', dl.size_bytes,
        'is_active', dl.is_active,
        'sort_order', dl.sort_order
      ) ORDER BY dl.sort_order ASC
    )
    FROM public.download_links dl
    WHERE dl.resource_id = r.id AND dl.is_active = true
  ) AS download_links
FROM public.resources r
WHERE r.category_id = '50e82476-24c6-498c-a703-49bbb96b0dcf'
  AND r.status = 'PUBLISHED';
