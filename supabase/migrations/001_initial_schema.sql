-- ==============================================================================
-- ANTIGRAVITY DIGITAL RESOURCE PLATFORM - PRODUCTION SCHEMA
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. PROFILES & ROLES
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'USER' CHECK (role IN ('USER', 'ADMIN', 'SUPER_ADMIN')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. CATEGORIES
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT,
  description TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  meta_title TEXT,
  meta_description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. RESOURCES
CREATE TABLE IF NOT EXISTS public.resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  short_description TEXT,
  description TEXT,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  thumbnail_url TEXT,
  icon_url TEXT,
  resource_type TEXT NOT NULL DEFAULT 'DOWNLOAD' CHECK (
    resource_type IN (
      'DOWNLOAD', 'EXTERNAL_LINK', 'MULTIPLE_LINKS', 'FILE',
      'SOFTWARE', 'APK', 'GAME', 'WEBSITE', 'DIGITAL_PRODUCT', 'MEDIA', 'OTHER'
    )
  ),
  access_type TEXT NOT NULL DEFAULT 'FREE' CHECK (access_type IN ('FREE', 'PAID', 'EXTERNAL')),
  price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  sale_price NUMERIC(10, 2),
  currency TEXT NOT NULL DEFAULT 'INR',
  platform TEXT,
  version TEXT,
  version_code INT,
  package_name TEXT,
  size_bytes BIGINT,
  developer TEXT,
  license TEXT,
  official_url TEXT,
  download_type TEXT,
  status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'PUBLISHED', 'SCHEDULED', 'ARCHIVED', 'DELETED')),
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  changelog TEXT,
  system_requirements TEXT,
  features TEXT[],
  tags TEXT[],
  views_count BIGINT NOT NULL DEFAULT 0,
  downloads_count BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  published_at TIMESTAMPTZ
);

-- 4. RESOURCE IMAGES
CREATE TABLE IF NOT EXISTS public.resource_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id UUID NOT NULL REFERENCES public.resources(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. DOWNLOAD LINKS
CREATE TABLE IF NOT EXISTS public.download_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id UUID NOT NULL REFERENCES public.resources(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Primary Download',
  link_type TEXT NOT NULL DEFAULT 'PRIMARY' CHECK (link_type IN ('PRIMARY', 'MIRROR', 'R2_FILE', 'EXTERNAL')),
  url TEXT,
  r2_key TEXT,
  size_bytes BIGINT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. ORDERS
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  order_number TEXT NOT NULL UNIQUE,
  subtotal NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  discount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  total NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  currency TEXT NOT NULL DEFAULT 'INR',
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PAID', 'FAILED', 'REFUNDED')),
  payment_provider TEXT,
  payment_id TEXT,
  coupon_code TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. ORDER ITEMS
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  resource_id UUID NOT NULL REFERENCES public.resources(id) ON DELETE RESTRICT,
  price NUMERIC(10, 2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. ENTITLEMENTS (PAID ACCESS RIGHTS)
CREATE TABLE IF NOT EXISTS public.entitlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  resource_id UUID NOT NULL REFERENCES public.resources(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'REVOKED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, resource_id)
);

-- 9. COUPONS
CREATE TABLE IF NOT EXISTS public.coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('PERCENTAGE', 'FIXED')),
  discount_value NUMERIC(10, 2) NOT NULL,
  min_order NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  max_discount NUMERIC(10, 2),
  usage_limit INT,
  times_used INT NOT NULL DEFAULT 0,
  per_user_limit INT DEFAULT 1,
  starts_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. DOWNLOAD EVENT LOGS
CREATE TABLE IF NOT EXISTS public.downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id UUID NOT NULL REFERENCES public.resources(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  ip_hash TEXT,
  downloaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. FAVORITES
CREATE TABLE IF NOT EXISTS public.favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  resource_id UUID NOT NULL REFERENCES public.resources(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, resource_id)
);

-- 12. ANNOUNCEMENTS
CREATE TABLE IF NOT EXISTS public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT,
  cta_text TEXT,
  cta_url TEXT,
  priority INT NOT NULL DEFAULT 0,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  location TEXT NOT NULL DEFAULT 'TOP_BAR' CHECK (location IN ('TOP_BAR', 'HOMEPAGE', 'POPUP', 'NOTIFICATION')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. AD PLACEMENTS
CREATE TABLE IF NOT EXISTS public.ad_placements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  location TEXT NOT NULL CHECK (location IN ('HEADER', 'HOMEPAGE', 'IN_FEED', 'SIDEBAR', 'RESOURCE_PAGE', 'FOOTER')),
  provider TEXT NOT NULL DEFAULT 'CUSTOM',
  ad_code TEXT NOT NULL,
  priority INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 14. CONTACT MESSAGES
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'UNREAD' CHECK (status IN ('UNREAD', 'READ', 'ARCHIVED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 15. AUDIT LOGS
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  old_data JSONB,
  new_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 16. SITE SETTINGS
CREATE TABLE IF NOT EXISTS public.site_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- INDEXES FOR MAXIMUM QUERY PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_resources_slug ON public.resources(slug);
CREATE INDEX IF NOT EXISTS idx_resources_category ON public.resources(category_id);
CREATE INDEX IF NOT EXISTS idx_resources_status ON public.resources(status);
CREATE INDEX IF NOT EXISTS idx_resources_created_at ON public.resources(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_resources_updated_at ON public.resources(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_resources_published_at ON public.resources(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_resources_access_type ON public.resources(access_type);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_entitlements_user_id ON public.entitlements(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON public.favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_downloads_resource_id ON public.downloads(resource_id);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.download_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entitlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_placements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Helper security function: Check if current authenticated user is an admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('ADMIN', 'SUPER_ADMIN')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles: Users can view their own profile; admins can view all profiles
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Categories: Anyone can view active categories; admins have full access
CREATE POLICY "Public can view active categories" ON public.categories
  FOR SELECT USING (is_active = TRUE OR public.is_admin());

CREATE POLICY "Admins can manage categories" ON public.categories
  FOR ALL USING (public.is_admin());

-- Resources: Public can only view published resources; admins can manage all
CREATE POLICY "Public can view published resources" ON public.resources
  FOR SELECT USING (status = 'PUBLISHED' OR public.is_admin());

CREATE POLICY "Admins can manage resources" ON public.resources
  FOR ALL USING (public.is_admin());

-- Resource Images: Follows resource visibility
CREATE POLICY "Public can view resource images" ON public.resource_images
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.resources r
      WHERE r.id = resource_images.resource_id
      AND (r.status = 'PUBLISHED' OR public.is_admin())
    )
  );

CREATE POLICY "Admins can manage resource images" ON public.resource_images
  FOR ALL USING (public.is_admin());

-- Download Links: Follows resource visibility; admins have full access
CREATE POLICY "Public can view active download links for published resources" ON public.download_links
  FOR SELECT USING (
    is_active = TRUE AND EXISTS (
      SELECT 1 FROM public.resources r
      WHERE r.id = download_links.resource_id
      AND (r.status = 'PUBLISHED' OR public.is_admin())
    )
  );

CREATE POLICY "Admins can manage download links" ON public.download_links
  FOR ALL USING (public.is_admin());

-- Orders: Users can view their own orders; admins can view all
CREATE POLICY "Users can view own orders" ON public.orders
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can insert own orders" ON public.orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage orders" ON public.orders
  FOR ALL USING (public.is_admin());

-- Order Items: Follows order access
CREATE POLICY "Users can view own order items" ON public.order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_items.order_id
      AND (o.user_id = auth.uid() OR public.is_admin())
    )
  );

CREATE POLICY "Admins can manage order items" ON public.order_items
  FOR ALL USING (public.is_admin());

-- Entitlements: Users can view their own active entitlements
CREATE POLICY "Users can view own entitlements" ON public.entitlements
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Admins can manage entitlements" ON public.entitlements
  FOR ALL USING (public.is_admin());

-- Coupons: Public can view active coupons; admins have full control
CREATE POLICY "Public can view active coupons" ON public.coupons
  FOR SELECT USING (is_active = TRUE OR public.is_admin());

CREATE POLICY "Admins can manage coupons" ON public.coupons
  FOR ALL USING (public.is_admin());

-- Downloads: Users can insert and view their own download records; admins can view all
CREATE POLICY "Users can view own downloads" ON public.downloads
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Anyone can record downloads" ON public.downloads
  FOR INSERT WITH CHECK (TRUE);

-- Favorites: Authenticated users can manage their own favorites
CREATE POLICY "Users can view own favorites" ON public.favorites
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favorites" ON public.favorites
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites" ON public.favorites
  FOR DELETE USING (auth.uid() = user_id);

-- Announcements: Public can view active announcements; admins can manage
CREATE POLICY "Public can view active announcements" ON public.announcements
  FOR SELECT USING (
    (is_active = TRUE AND (start_date IS NULL OR start_date <= NOW()) AND (end_date IS NULL OR end_date >= NOW()))
    OR public.is_admin()
  );

CREATE POLICY "Admins can manage announcements" ON public.announcements
  FOR ALL USING (public.is_admin());

-- Ad Placements: Public can view active ads; admins can manage
CREATE POLICY "Public can view active ads" ON public.ad_placements
  FOR SELECT USING (
    (is_active = TRUE AND (start_date IS NULL OR start_date <= NOW()) AND (end_date IS NULL OR end_date >= NOW()))
    OR public.is_admin()
  );

CREATE POLICY "Admins can manage ads" ON public.ad_placements
  FOR ALL USING (public.is_admin());

-- Contact Messages: Anyone can send; only admins can view/manage
CREATE POLICY "Public can submit contact messages" ON public.contact_messages
  FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Admins can manage contact messages" ON public.contact_messages
  FOR ALL USING (public.is_admin());

-- Audit Logs: Only admins can view audit logs
CREATE POLICY "Admins can view audit logs" ON public.audit_logs
  FOR SELECT USING (public.is_admin());

-- Site Settings: Public can read public settings; admins can manage
CREATE POLICY "Public can view site settings" ON public.site_settings
  FOR SELECT USING (TRUE);

CREATE POLICY "Admins can manage site settings" ON public.site_settings
  FOR ALL USING (public.is_admin());

-- ==============================================================================
-- TRIGGERS & FUNCTIONS
-- ==============================================================================

-- Trigger: Automatically create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, role)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url',
    COALESCE(NEW.raw_user_meta_data->>'role', 'USER')
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email,
      full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
      avatar_url = COALESCE(EXCLUDED.avatar_url, public.profiles.avatar_url);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger: Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_timestamp BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();
CREATE TRIGGER update_categories_timestamp BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();
CREATE TRIGGER update_resources_timestamp BEFORE UPDATE ON public.resources FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();
CREATE TRIGGER update_orders_timestamp BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();
