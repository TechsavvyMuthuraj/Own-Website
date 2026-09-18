-- ==============================================================================
-- DEVELOPMENT-ONLY SEED DATA (DO NOT RUN IN PRODUCTION)
-- ==============================================================================
-- This script is strictly for local database testing and development.
-- In production, the database starts completely empty with zero mock data.
-- ==============================================================================

-- Initial Base Categories (Real legitimate categories)
INSERT INTO public.categories (name, slug, icon, description, sort_order, is_active)
VALUES
  ('APK & Android', 'apk', 'Smartphone', 'Verified and authorized Android packages, utilities, and tools.', 1, true),
  ('PC Software', 'pc-software', 'Monitor', 'Legitimate open-source and freeware software for Windows, Mac, and Linux.', 2, true),
  ('Developer Tools', 'developer-tools', 'Code', 'Libraries, CLI tools, developer frameworks, and utilities.', 3, true),
  ('AI Tools', 'ai-tools', 'Cpu', 'Curated artificial intelligence utilities, models, and assistants.', 4, true),
  ('Templates', 'templates', 'FileText', 'Productivity, design, and code templates.', 5, true),
  ('Wallpapers', 'wallpapers', 'Image', 'High-definition, curated, public-domain and authorized wallpapers.', 6, true),
  ('Fonts', 'fonts', 'Type', 'Open-source and permissible typography sets.', 7, true),
  ('Icons', 'icons', 'Shapes', 'Vector icon sets and asset libraries.', 8, true),
  ('Education', 'education', 'GraduationCap', 'Academic references, guides, and learning resources.', 9, true),
  ('Useful Websites', 'useful-websites', 'Globe', 'Curated directory of legitimate and essential web tools.', 10, true),
  ('Media', 'media', 'Film', 'Public domain, authorized audio and video assets.', 11, true),
  ('Other Resources', 'other', 'Folder', 'Miscellaneous verified digital resources.', 12, true)
ON CONFLICT (slug) DO NOTHING;

-- Initial System Settings
INSERT INTO public.site_settings (key, value)
VALUES
  ('site_name', '"NammaTech"'),
  ('site_description', '"Discover trusted, verified open-source and digital resources."'),
  ('contact_email', '"support@yourdomain.com"'),
  ('default_currency', '"INR"'),
  ('maintenance_mode', 'false'),
  ('new_resource_threshold_days', '14'),
  ('updated_resource_threshold_days', '14')
ON CONFLICT (key) DO NOTHING;
