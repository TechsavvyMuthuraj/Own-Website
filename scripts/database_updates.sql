-- ====================================================================
-- NAMMATECH: FULL DATABASE UPDATE FOR ADS & MONETIZATION
-- Run in Supabase SQL Editor (Dashboard > SQL Editor)
-- Safely migrates tables, updates constraints, activates Adsterra slots
-- ====================================================================

-- 1. Ensure site_settings table exists and has all required columns
CREATE TABLE IF NOT EXISTS public.site_settings (
  key TEXT PRIMARY KEY,
  value TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Enable RLS & ensure read access for public
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'site_settings' AND policyname = 'Public can read site_settings'
  ) THEN
    CREATE POLICY "Public can read site_settings" ON public.site_settings
      FOR SELECT USING (true);
  END IF;
END $$;

-- 2. Upsert Master Ads Configuration & Adsterra Assets into site_settings
INSERT INTO public.site_settings (key, value, updated_at)
VALUES
  ('ads_enabled', 'true', NOW()),
  ('adsense_auto_ads', 'true', NOW()),
  ('adsterra_settings', '{"enabled":true,"smartlink1Enabled":true,"smartlink2Enabled":true,"smartlink3Enabled":true,"scriptEnabled":true,"script2Enabled":true,"nativeBannerEnabled":true,"bannerZonesEnabled":true,"popupAdEnabled":true,"stickyBarEnabled":true,"popupDelaySeconds":3.5,"smartlink1":"https://demolishwrestconclusions.com/hebd0wzjqw?key=ef54880efe2cf24e942204e7b606498c","smartlink2":"https://demolishwrestconclusions.com/x0a8ik0sn4?key=01cda2b2e4e25f16daea215015495d74","smartlink3":"https://demolishwrestconclusions.com/p9zz1z9nw?key=f0d4b0285569216ca06b70c80fd36df8","scriptUrl":"https://demolishwrestconclusions.com/18/91/1b/18911b7efb81e91a2cf994b94c5589c2.js","scriptUrl2":"https://demolishwrestconclusions.com/30/9f/95/309f95fd3760f90cc4ce9941f34d920f.js","customBannerCode":"","placements":{"homepage":true,"resourceList":true,"resourceDetails":true,"article":true,"mobile":true,"desktop":true,"smartlinks":true}}', NOW())
ON CONFLICT (key) DO UPDATE
SET value = EXCLUDED.value, updated_at = NOW();

-- 3. Ensure ad_placements table exists
CREATE TABLE IF NOT EXISTS public.ad_placements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  location TEXT NOT NULL,
  provider TEXT DEFAULT 'ADSTERRA',
  ad_code TEXT DEFAULT '',
  priority INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Crucial: Add missing columns if ad_placements was created with older schema
ALTER TABLE public.ad_placements ADD COLUMN IF NOT EXISTS provider TEXT DEFAULT 'ADSTERRA';
ALTER TABLE public.ad_placements ADD COLUMN IF NOT EXISTS ad_code TEXT DEFAULT '';
ALTER TABLE public.ad_placements ADD COLUMN IF NOT EXISTS priority INTEGER DEFAULT 0;
ALTER TABLE public.ad_placements ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE public.ad_placements ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.ad_placements ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Crucial fix 1: Drop NOT NULL constraint on ad_code to prevent ERROR 23502
DO $$
BEGIN
  ALTER TABLE public.ad_placements ALTER COLUMN ad_code DROP NOT NULL;
  ALTER TABLE public.ad_placements ALTER COLUMN ad_code SET DEFAULT '';
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

-- Populate empty string for any null ad_code rows
UPDATE public.ad_placements SET ad_code = '' WHERE ad_code IS NULL;

-- Crucial fix 2: Update check constraint on location to include DOWNLOAD_PAGE and POPUP
DO $$
BEGIN
  ALTER TABLE public.ad_placements DROP CONSTRAINT IF EXISTS ad_placements_location_check;
  ALTER TABLE public.ad_placements ADD CONSTRAINT ad_placements_location_check 
    CHECK (location IN ('HEADER', 'HOMEPAGE', 'IN_FEED', 'SIDEBAR', 'RESOURCE_PAGE', 'DOWNLOAD_PAGE', 'FOOTER', 'POPUP'));
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

-- Enable RLS & ensure read access for public
ALTER TABLE public.ad_placements ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'ad_placements' AND policyname = 'Public can read ad_placements'
  ) THEN
    CREATE POLICY "Public can read ad_placements" ON public.ad_placements
      FOR SELECT USING (true);
  END IF;
END $$;

-- 4. Seed all high-earning ad placement slots if they do not exist
-- (Explicitly supplying non-null ad_code for each slot)
INSERT INTO public.ad_placements (title, location, provider, ad_code, priority, is_active, updated_at)
SELECT 'Top Header Leaderboard Banner (728x90 / 320x50)', 'HEADER', 'ADSTERRA', '<!-- Adsterra Header Banner -->', 10, true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM public.ad_placements WHERE location = 'HEADER');

INSERT INTO public.ad_placements (title, location, provider, ad_code, priority, is_active, updated_at)
SELECT 'Homepage Feature Ad Banner (728x90 / 320x50)', 'HOMEPAGE', 'ADSTERRA', '<!-- Adsterra Homepage Banner -->', 10, true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM public.ad_placements WHERE location = 'HOMEPAGE');

INSERT INTO public.ad_placements (title, location, provider, ad_code, priority, is_active, updated_at)
SELECT 'In-Feed Native & Display Unit (300x250 Medium Rectangle)', 'IN_FEED', 'ADSTERRA', '<!-- Adsterra In-Feed Unit -->', 8, true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM public.ad_placements WHERE location = 'IN_FEED');

INSERT INTO public.ad_placements (title, location, provider, ad_code, priority, is_active, updated_at)
SELECT 'Resource Detail Sidebar Ad (300x250 Medium Rectangle)', 'SIDEBAR', 'ADSTERRA', '<!-- Adsterra Sidebar Rectangle -->', 9, true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM public.ad_placements WHERE location = 'SIDEBAR');

INSERT INTO public.ad_placements (title, location, provider, ad_code, priority, is_active, updated_at)
SELECT 'Resource Page Content Banner', 'RESOURCE_PAGE', 'ADSTERRA', '<!-- Adsterra Resource Banner -->', 7, true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM public.ad_placements WHERE location = 'RESOURCE_PAGE');

INSERT INTO public.ad_placements (title, location, provider, ad_code, priority, is_active, updated_at)
SELECT 'Download Access Verification Ad (728x90 / 300x250)', 'DOWNLOAD_PAGE', 'ADSTERRA', '<!-- Adsterra Download Banner -->', 12, true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM public.ad_placements WHERE location = 'DOWNLOAD_PAGE');

INSERT INTO public.ad_placements (title, location, provider, ad_code, priority, is_active, updated_at)
SELECT 'Above-Footer Leaderboard Banner (728x90 / 320x50)', 'FOOTER', 'ADSTERRA', '<!-- Adsterra Footer Banner -->', 6, true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM public.ad_placements WHERE location = 'FOOTER');

INSERT INTO public.ad_placements (title, location, provider, ad_code, priority, is_active, updated_at)
SELECT 'Full-Website Pop-up Ad (300x250 Medium Rectangle)', 'POPUP', 'ADSTERRA', '<!-- Adsterra Pop-up Modal -->', 15, true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM public.ad_placements WHERE location = 'POPUP');

-- 5. Activate all monetization slots and set provider to ADSTERRA
UPDATE public.ad_placements
SET is_active = true, provider = 'ADSTERRA', updated_at = NOW();

-- Verify configuration output
SELECT id, title, location, provider, is_active, priority FROM public.ad_placements ORDER BY priority DESC;
