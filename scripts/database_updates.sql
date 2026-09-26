-- ====================================================================
-- NAMMATECH: FULL DATABASE UPDATE FOR ADS & MONETIZATION
-- Run in Supabase SQL Editor (Dashboard > SQL Editor)
-- ====================================================================

-- 1. Ensure site_settings table exists
CREATE TABLE IF NOT EXISTS public.site_settings (
  key TEXT PRIMARY KEY,
  value TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

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
  ('adsterra_settings', '{"enabled":true,"smartlink1Enabled":true,"smartlink2Enabled":true,"smartlink3Enabled":true,"scriptEnabled":true,"script2Enabled":true,"nativeBannerEnabled":true,"bannerZonesEnabled":true,"smartlink1":"https://demolishwrestconclusions.com/hebd0wzjqw?key=ef54880efe2cf24e942204e7b606498c","smartlink2":"https://demolishwrestconclusions.com/x0a8ik0sn4?key=01cda2b2e4e25f16daea215015495d74","smartlink3":"https://demolishwrestconclusions.com/p9zz1z9nw?key=f0d4b0285569216ca06b70c80fd36df8","scriptUrl":"https://demolishwrestconclusions.com/18/91/1b/18911b7efb81e91a2cf994b94c5589c2.js","scriptUrl2":"https://demolishwrestconclusions.com/30/9f/95/309f95fd3760f90cc4ce9941f34d920f.js","customBannerCode":"","placements":{"homepage":true,"resourceList":true,"resourceDetails":true,"article":true,"mobile":true,"desktop":true,"smartlinks":true}}', NOW())
ON CONFLICT (key) DO UPDATE
SET value = EXCLUDED.value, updated_at = NOW();

-- 3. Ensure ad_placements table exists
CREATE TABLE IF NOT EXISTS public.ad_placements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  location TEXT NOT NULL,
  provider TEXT DEFAULT 'ADSTERRA',
  ad_code TEXT,
  priority INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

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

-- 4. Activate all monetization slots
UPDATE public.ad_placements
SET is_active = true, provider = 'ADSTERRA', updated_at = NOW();

-- 5. Insert dedicated POPUP ad placement
INSERT INTO public.ad_placements (title, location, provider, priority, is_active)
SELECT 'Full-Website Pop-up Ad (300x250 Medium Rectangle)', 'POPUP', 'ADSTERRA', 15, true
WHERE NOT EXISTS (
  SELECT 1 FROM public.ad_placements WHERE location = 'POPUP'
);
