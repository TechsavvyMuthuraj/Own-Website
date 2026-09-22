-- ==============================================================================
-- NAMMATECH TECHNICAL SUPPORT REALTIME CHAT SCHEMA & PERSISTENCE
-- Migration: 20260922_support_chat_sessions_schema.sql
-- ==============================================================================

-- 1. Initialize site_settings keys for serverless persistence
INSERT INTO public.site_settings (key, value, updated_at)
VALUES 
  ('active_support_sessions', '[]'::jsonb, NOW()),
  ('deleted_support_sessions', '[]'::jsonb, NOW())
ON CONFLICT (key) DO NOTHING;

-- 2. Create full relational table for live support chat sessions
CREATE TABLE IF NOT EXISTS public.support_chat_sessions (
  id TEXT PRIMARY KEY,
  user_name TEXT NOT NULL DEFAULT 'User',
  user_email TEXT,
  user_phone TEXT,
  category TEXT DEFAULT 'General Technical Support',
  assigned_specialist_name TEXT,
  assigned_specialist_email TEXT,
  assigned_specialist_role TEXT DEFAULT 'Technical Support Specialist',
  specialist_duty_status TEXT DEFAULT 'ON_DUTY',
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'WAITING', 'RESOLVED', 'DELETED')),
  unread_admin_count INT NOT NULL DEFAULT 0,
  unread_user_count INT NOT NULL DEFAULT 0,
  is_user_typing BOOLEAN DEFAULT FALSE,
  is_admin_typing BOOLEAN DEFAULT FALSE,
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  rating NUMERIC(3, 2),
  feedback TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Indexes for maximum query performance
CREATE INDEX IF NOT EXISTS idx_support_chat_status ON public.support_chat_sessions(status);
CREATE INDEX IF NOT EXISTS idx_support_chat_user_email ON public.support_chat_sessions(user_email);
CREATE INDEX IF NOT EXISTS idx_support_chat_updated_at ON public.support_chat_sessions(updated_at DESC);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.support_chat_sessions ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies
DROP POLICY IF EXISTS "Public can create and view support sessions" ON public.support_chat_sessions;
CREATE POLICY "Public can create and view support sessions"
  ON public.support_chat_sessions
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- 6. Trigger for updated_at
CREATE OR REPLACE FUNCTION update_support_chat_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_support_chat_updated_at ON public.support_chat_sessions;
CREATE TRIGGER trg_support_chat_updated_at
  BEFORE UPDATE ON public.support_chat_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_support_chat_timestamp();
