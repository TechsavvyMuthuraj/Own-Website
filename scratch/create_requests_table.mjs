import { createClient } from '@supabase/supabase-js';

const client = createClient(
  'https://rixdlxqktshrwjbaxxcz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJpeGRseHFrdHNocndqYmF4eGN6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTcxODEwMywiZXhwIjoyMTA1Mjk0MTAzfQ.jirviICOr8IBz_39JSI5OSDoMHpnUDRiIGFtSQ0O1Zw'
);

async function run() {
  // Test insert first to see if table exists
  const { error: testErr } = await client.from('resource_requests').select('id').limit(1);
  if (!testErr) {
    console.log('Table already exists!');
    return;
  }
  
  console.log('Table does not exist. Creating via SQL...');
  // Try via Supabase management - we need to use the admin execute
  const createSQL = `
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
ALTER TABLE public.resource_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Allow anon insert" ON public.resource_requests FOR INSERT WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Allow select own" ON public.resource_requests FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Allow admin update" ON public.resource_requests FOR UPDATE USING (true);
`;

  // Unfortunately we can't run DDL directly. Let's test with a dummy insert.
  // The admin API approach - insert with service role bypasses RLS
  const { data, error } = await client.from('resource_requests').insert({
    user_email: '__schema_test__@test.com',
    software_name: '__test__',
  }).select('id').single();
  
  if (error) {
    console.log('Cannot create via API - table does not exist. SQL to run in Supabase SQL editor:');
    console.log(createSQL);
  } else {
    console.log('Table exists! Inserted test row:', data.id, '- deleting...');
    await client.from('resource_requests').delete().eq('id', data.id);
    console.log('Done.');
  }
}

run().catch(console.error);
