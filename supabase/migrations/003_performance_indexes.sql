-- ==============================================================================
-- NAMMATECH HIGH-PERFORMANCE DATABASE INDEXES (003_performance_indexes.sql)
-- ==============================================================================
-- These indexes directly accelerate the exact query access patterns used across
-- the homepage, explore catalog, search, cinema hub, and admin dashboard.

-- 1. Enable pg_trgm for fast text search (ilike queries on title)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 2. Composite Index for Public Catalog Sorting & Filtering
-- Eliminates bitmap heap scan and manual sorting for all public resource pages
CREATE INDEX IF NOT EXISTS idx_resources_status_published_at
  ON public.resources(status, published_at DESC);

-- 3. Partial Index for Featured Resources
-- Ultra-lightweight index scan for homepage hero & featured grids
CREATE INDEX IF NOT EXISTS idx_resources_featured_published
  ON public.resources(published_at DESC)
  WHERE status = 'PUBLISHED' AND featured = true;

-- 4. Category-filtered Public Resources Index
-- Accelerates category pages & explore category filtering
CREATE INDEX IF NOT EXISTS idx_resources_category_status_published
  ON public.resources(category_id, published_at DESC)
  WHERE status = 'PUBLISHED';

-- 5. Trigram GIN Index for Interactive Search
-- Accelerates ILIKE '%search%' queries by 10x-50x compared to full table scans
CREATE INDEX IF NOT EXISTS idx_resources_title_trgm
  ON public.resources USING gin (title gin_trgm_ops);

-- 6. Active Download Links Index
-- Accelerates resolution and size-based download links lookup by resource
CREATE INDEX IF NOT EXISTS idx_download_links_resource_active
  ON public.download_links(resource_id, sort_order ASC)
  WHERE is_active = true;

-- 7. Ad Placements Priority Index
-- Accelerates getActiveAd lookups across layout and resource pages
CREATE INDEX IF NOT EXISTS idx_ad_placements_location_active_priority
  ON public.ad_placements(location, priority DESC)
  WHERE is_active = true;

-- 8. Top Announcements Priority Index
-- Accelerates top bar and popup announcement checks
CREATE INDEX IF NOT EXISTS idx_announcements_location_active_priority
  ON public.announcements(location, priority DESC)
  WHERE is_active = true;

-- 9. Active Categories Sorting Index
CREATE INDEX IF NOT EXISTS idx_categories_active_sort
  ON public.categories(sort_order ASC)
  WHERE is_active = true;

-- 10. Orders Status & Date Index for Admin & User Lookups
CREATE INDEX IF NOT EXISTS idx_orders_status_created_at
  ON public.orders(status, created_at DESC);
