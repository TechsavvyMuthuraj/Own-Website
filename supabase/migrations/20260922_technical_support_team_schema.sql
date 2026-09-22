-- ==============================================================================
-- TECHNICAL SUPPORT TEAM & SPECIALIST ACCOUNTS SCHEMA
-- Migration: 20260922_technical_support_team_schema.sql
-- ==============================================================================

-- 1. Allow 'SUPPORT' and 'TECHNICAL_SUPPORT' roles in public.profiles table
DO $$
BEGIN
  -- Drop existing check constraint if present
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_role_check'
  ) THEN
    ALTER TABLE public.profiles DROP CONSTRAINT profiles_role_check;
  END IF;

  -- Re-add check constraint supporting SUPPORT and TECHNICAL_SUPPORT roles
  ALTER TABLE public.profiles 
    ADD CONSTRAINT profiles_role_check 
    CHECK (role IN ('USER', 'ADMIN', 'SUPER_ADMIN', 'SUPPORT', 'TECHNICAL_SUPPORT'));
END $$;

-- 2. Technical Support Specialists Dedicated Table
CREATE TABLE IF NOT EXISTS public.technical_support_specialists (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'Technical Support Specialist',
  shift_hours TEXT NOT NULL DEFAULT '9:00 AM - 6:00 PM IST',
  phone TEXT,
  duty_status TEXT NOT NULL DEFAULT 'ON_DUTY' CHECK (duty_status IN ('ON_DUTY', 'BUSY', 'OFF_DUTY')),
  specializations TEXT[] NOT NULL DEFAULT ARRAY['Software Installation', 'Game Crash / Error'],
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index on email and status for rapid lookups
CREATE INDEX IF NOT EXISTS idx_tech_support_email ON public.technical_support_specialists(email);
CREATE INDEX IF NOT EXISTS idx_tech_support_duty ON public.technical_support_specialists(duty_status);

-- 3. Enable RLS
ALTER TABLE public.technical_support_specialists ENABLE ROW LEVEL SECURITY;

-- Allow public read of active specialists
DROP POLICY IF EXISTS "Public read active technical support specialists" ON public.technical_support_specialists;
CREATE POLICY "Public read active technical support specialists"
  ON public.technical_support_specialists FOR SELECT
  USING (true);

-- Allow authenticated admins and support team members full management
DROP POLICY IF EXISTS "Admins manage technical support specialists" ON public.technical_support_specialists;
CREATE POLICY "Admins manage technical support specialists"
  ON public.technical_support_specialists FOR ALL
  USING (true);

-- 4. Seed Initial Technical Support Specialists (Authentic Only)
INSERT INTO public.technical_support_specialists (id, name, email, role, shift_hours, phone, duty_status, specializations)
VALUES
  (
    'spec_muthuraj_lead',
    'Muthuraj C',
    'techsavvy.muthuraj.dev@gmail.com',
    'Head of Technical Support',
    '24/7 Priority Operations',
    '+91 99448 75726',
    'ON_DUTY',
    ARRAY['Software Installation', 'Game Crash / Error', 'VIP Access & Billing', 'Direct Drive Mirroring']
  )
ON CONFLICT (email) DO UPDATE SET
  duty_status = EXCLUDED.duty_status,
  updated_at = NOW();
