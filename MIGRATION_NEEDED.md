# NammaTech — Pending DB Migration

## Run this SQL in the Supabase SQL Editor

Go to: https://supabase.com/dashboard/project/rixdlxqktshrwjbaxxcz/sql/new

Paste and run the following SQL:

```sql
-- Create resource_requests table for software request feature
CREATE TABLE IF NOT EXISTS public.resource_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email TEXT NOT NULL,
  user_name TEXT,
  software_name TEXT NOT NULL,
  software_category TEXT DEFAULT 'General',
  description TEXT,
  official_url TEXT,
  priority TEXT DEFAULT 'NORMAL',
  status TEXT DEFAULT 'PENDING',
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.resource_requests ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert requests
CREATE POLICY "Allow anon insert" ON public.resource_requests
  FOR INSERT WITH CHECK (true);

-- Allow anyone to read requests (service role used on admin side)
CREATE POLICY "Allow select all" ON public.resource_requests
  FOR SELECT USING (true);

-- Allow service role to update
CREATE POLICY "Allow admin all" ON public.resource_requests
  FOR ALL USING (true);
```

After running, the `/request` page and `/admin/requests` page will be fully functional.
