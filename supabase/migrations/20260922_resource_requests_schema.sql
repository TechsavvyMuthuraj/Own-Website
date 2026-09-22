-- Migration: Resource Requests Schema & RLS Policies
-- Date: 2026-09-22
-- Purpose: Support community resource requests with WhatsApp follow-up and admin triage

CREATE TABLE IF NOT EXISTS public.resource_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  whatsapp_number TEXT NOT NULL,
  resource_name TEXT NOT NULL,
  category TEXT DEFAULT 'Software',
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  admin_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  contacted_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ
);

-- Backwards compatibility / Column migration for existing tables
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'resource_requests' AND column_name = 'name') THEN
    ALTER TABLE public.resource_requests ADD COLUMN name TEXT;
    -- Populate from user_name if available
    UPDATE public.resource_requests SET name = COALESCE(user_name, 'Anonymous') WHERE name IS NULL;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'resource_requests' AND column_name = 'whatsapp_number') THEN
    ALTER TABLE public.resource_requests ADD COLUMN whatsapp_number TEXT;
    UPDATE public.resource_requests SET whatsapp_number = COALESCE(user_email, 'N/A') WHERE whatsapp_number IS NULL;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'resource_requests' AND column_name = 'resource_name') THEN
    ALTER TABLE public.resource_requests ADD COLUMN resource_name TEXT;
    UPDATE public.resource_requests SET resource_name = COALESCE(software_name, 'Resource') WHERE resource_name IS NULL;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'resource_requests' AND column_name = 'category') THEN
    ALTER TABLE public.resource_requests ADD COLUMN category TEXT DEFAULT 'Software';
    UPDATE public.resource_requests SET category = COALESCE(software_category, 'Software') WHERE category IS NULL;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'resource_requests' AND column_name = 'admin_note') THEN
    ALTER TABLE public.resource_requests ADD COLUMN admin_note TEXT;
    UPDATE public.resource_requests SET admin_note = admin_notes WHERE admin_note IS NULL;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'resource_requests' AND column_name = 'contacted_at') THEN
    ALTER TABLE public.resource_requests ADD COLUMN contacted_at TIMESTAMPTZ;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'resource_requests' AND column_name = 'resolved_at') THEN
    ALTER TABLE public.resource_requests ADD COLUMN resolved_at TIMESTAMPTZ;
  END IF;
END $$;

-- Indexes for performance & query optimization
CREATE INDEX IF NOT EXISTS idx_resource_requests_status ON public.resource_requests(status);
CREATE INDEX IF NOT EXISTS idx_resource_requests_created_at ON public.resource_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_resource_requests_user_id ON public.resource_requests(user_id);

-- Enable Row Level Security
ALTER TABLE public.resource_requests ENABLE ROW LEVEL SECURITY;

-- 1. Insert Policy: Allow anyone (guests & authenticated users) to submit a resource request
DROP POLICY IF EXISTS "Allow anon and auth insert" ON public.resource_requests;
CREATE POLICY "Allow anon and auth insert" ON public.resource_requests
  FOR INSERT WITH CHECK (true);

-- 2. Select Policy: Authenticated users can only see their own requests (prevents leaking WhatsApp numbers)
DROP POLICY IF EXISTS "Users can view own requests" ON public.resource_requests;
CREATE POLICY "Users can view own requests" ON public.resource_requests
  FOR SELECT USING (
    (auth.uid() IS NOT NULL AND auth.uid() = user_id)
    OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role IN ('ADMIN', 'SUPER_ADMIN')
    )
  );

-- 3. Update Policy: Only admins can update status, notes, timestamps
DROP POLICY IF EXISTS "Admins can update requests" ON public.resource_requests;
CREATE POLICY "Admins can update requests" ON public.resource_requests
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role IN ('ADMIN', 'SUPER_ADMIN')
    )
  );
