-- ========================================================================
-- NAMMATECH SUPABASE MIGRATION: COMMUNITY CHAT & ZOOM MEETINGS SUITE
-- Run this script in your Supabase SQL Editor (Dashboard -> SQL Editor -> New Query)
-- ========================================================================

-- 1. Create ZOOM_MEETINGS Table
CREATE TABLE IF NOT EXISTS public.zoom_meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  meeting_type TEXT NOT NULL DEFAULT 'consultation' CHECK (meeting_type IN ('consultation', 'technical_support', 'vip_session', 'workshop')),
  host_name TEXT NOT NULL DEFAULT 'Muthuraj C',
  host_email TEXT NOT NULL DEFAULT 'contact@techsavvymuthuraj.dev',
  meeting_url TEXT NOT NULL,
  join_url TEXT NOT NULL,
  meeting_id TEXT,
  passcode TEXT,
  scheduled_start TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 45,
  max_participants INTEGER NOT NULL DEFAULT 50,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Create ZOOM_REGISTRATIONS (Attendees / Bookings) Table
CREATE TABLE IF NOT EXISTS public.zoom_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID NOT NULL REFERENCES public.zoom_meetings(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  attendee_name TEXT NOT NULL,
  attendee_email TEXT NOT NULL,
  attendee_phone TEXT,
  topic_notes TEXT,
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Create COMMUNITY_MESSAGES Table (Real-Time Cloud Persistence)
CREATE TABLE IF NOT EXISTS public.community_messages (
  id TEXT PRIMARY KEY,
  room_id TEXT NOT NULL DEFAULT 'general-tech',
  sender_id TEXT NOT NULL,
  sender_name TEXT NOT NULL,
  sender_avatar TEXT,
  sender_role TEXT NOT NULL DEFAULT 'MEMBER' CHECK (sender_role IN ('FOUNDER', 'ADMIN', 'VIP', 'MEMBER')),
  content TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'voice')),
  voice_data JSONB,
  reactions JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
  timestamp BIGINT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Fast Query Indexes
CREATE INDEX IF NOT EXISTS idx_zoom_meetings_status_start ON public.zoom_meetings(status, scheduled_start);
CREATE INDEX IF NOT EXISTS idx_zoom_registrations_meeting ON public.zoom_registrations(meeting_id);
CREATE INDEX IF NOT EXISTS idx_zoom_registrations_email ON public.zoom_registrations(attendee_email);
CREATE INDEX IF NOT EXISTS idx_community_messages_room_timestamp ON public.community_messages(room_id, timestamp DESC);

-- 5. Enable Row Level Security (RLS)
ALTER TABLE public.zoom_meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.zoom_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_messages ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies: Zoom Meetings
-- Public can view scheduled or live meetings
DROP POLICY IF EXISTS "Public can view active zoom meetings" ON public.zoom_meetings;
CREATE POLICY "Public can view active zoom meetings"
  ON public.zoom_meetings FOR SELECT
  USING (status IN ('scheduled', 'live', 'completed'));

-- Admins can do all actions on zoom_meetings
DROP POLICY IF EXISTS "Admins can manage zoom meetings" ON public.zoom_meetings;
CREATE POLICY "Admins can manage zoom meetings"
  ON public.zoom_meetings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role IN ('ADMIN', 'SUPER_ADMIN')
    )
  );

-- 7. RLS Policies: Zoom Registrations
-- Anyone can register for a meeting
DROP POLICY IF EXISTS "Anyone can insert meeting registrations" ON public.zoom_registrations;
CREATE POLICY "Anyone can insert meeting registrations"
  ON public.zoom_registrations FOR INSERT
  WITH CHECK (true);

-- Users can view their own registrations
DROP POLICY IF EXISTS "Users can view own registrations" ON public.zoom_registrations;
CREATE POLICY "Users can view own registrations"
  ON public.zoom_registrations FOR SELECT
  USING (
    user_id = auth.uid()
    OR attendee_email = (auth.jwt() ->> 'email')
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role IN ('ADMIN', 'SUPER_ADMIN')
    )
  );

-- 8. RLS Policies: Community Messages
-- Public can read all community messages
DROP POLICY IF EXISTS "Public can read community messages" ON public.community_messages;
CREATE POLICY "Public can read community messages"
  ON public.community_messages FOR SELECT
  USING (true);

-- Anyone (guests or logged-in users) can send community messages
DROP POLICY IF EXISTS "Anyone can insert community messages" ON public.community_messages;
CREATE POLICY "Anyone can insert community messages"
  ON public.community_messages FOR INSERT
  WITH CHECK (true);

-- Authors and Admins can update/delete messages (e.g. reactions or moderation)
DROP POLICY IF EXISTS "Authors or Admins can update community messages" ON public.community_messages;
CREATE POLICY "Authors or Admins can update community messages"
  ON public.community_messages FOR UPDATE
  USING (
    sender_id = auth.uid()::text
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role IN ('ADMIN', 'SUPER_ADMIN')
    )
  );

DROP POLICY IF EXISTS "Admins can delete community messages" ON public.community_messages;
CREATE POLICY "Admins can delete community messages"
  ON public.community_messages FOR DELETE
  USING (
    sender_id = auth.uid()::text
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role IN ('ADMIN', 'SUPER_ADMIN')
    )
  );

-- 9. Enable Realtime Broadcasting
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.zoom_meetings;
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.zoom_registrations;
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.community_messages;
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;
END $$;

-- 10. Update Navigation in site_settings so Community always appears in navbar
DO $$
DECLARE
  current_settings JSONB;
  current_nav JSONB;
  community_link JSONB := '{"id": "nav-community", "href": "/community", "label": "Community", "active": true, "badge": "LIVE"}'::jsonb;
BEGIN
  SELECT value::jsonb INTO current_settings FROM public.site_settings WHERE key = 'homepage_settings';

  IF current_settings IS NOT NULL AND current_settings ? 'navbar_items' THEN
    current_nav := current_settings -> 'navbar_items';
    -- Check if community already exists in navbar_items
    IF NOT current_nav @> '[{"href": "/community"}]'::jsonb THEN
      -- Prepend or append after home
      current_settings := jsonb_set(
        current_settings,
        '{navbar_items}',
        (SELECT jsonb_agg(elem) FROM (
          SELECT elem FROM jsonb_array_elements(current_nav) WITH ORDINALITY arr(elem, idx) WHERE idx = 1
          UNION ALL
          SELECT community_link
          UNION ALL
          SELECT elem FROM jsonb_array_elements(current_nav) WITH ORDINALITY arr(elem, idx) WHERE idx > 1
        ) sub)
      );

      UPDATE public.site_settings
      SET value = current_settings::text, updated_at = NOW()
      WHERE key = 'homepage_settings';
    END IF;
  END IF;
END $$;

-- 11. Initial Seed Data: Sample Live & Scheduled Zoom Sessions
INSERT INTO public.zoom_meetings (
  title,
  description,
  meeting_type,
  host_name,
  host_email,
  meeting_url,
  join_url,
  meeting_id,
  passcode,
  scheduled_start,
  duration_minutes,
  status
) VALUES
(
  'VIP 1-on-1 Consultation with Founder Muthuraj C',
  'Private architecture consultation, verified software packaging assistance, and direct technical Q&A.',
  'consultation',
  'Muthuraj C',
  'contact@techsavvymuthuraj.dev',
  'https://zoom.us/j/8492049102',
  'https://zoom.us/j/8492049102',
  '849 204 9102',
  'nammatech',
  NOW() + INTERVAL '2 hours',
  45,
  'scheduled'
),
(
  '4K UHD Cinema Audio & Remux Tech Masterclass',
  'Deep dive into Atmos 7.1 TrueHD sound engineering, bitrates, lossless container multiplexing, and home theatre configurations.',
  'workshop',
  'Muthuraj C',
  'contact@techsavvymuthuraj.dev',
  'https://zoom.us/j/8492049102',
  'https://zoom.us/j/8492049102',
  '849 204 9102',
  'nammatech',
  NOW() + INTERVAL '1 day',
  60,
  'scheduled'
)
ON CONFLICT DO NOTHING;

-- Verification query
SELECT id, title, meeting_type, status, scheduled_start FROM public.zoom_meetings ORDER BY scheduled_start DESC;
