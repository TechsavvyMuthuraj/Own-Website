import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://rixdlxqktshrwjbaxxcz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJpeGRseHFrdHNocndqYmF4eGN6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTcxODEwMywiZXhwIjoyMTA1Mjk0MTAzfQ.jirviICOr8IBz_39JSI5OSDoMHpnUDRiIGFtSQ0O1Zw',
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const { data, error } = await supabase
  .from('articles')
  .select('*')
  .eq('slug', 'free-gaming-websites-launched-2026')
  .eq('status', 'PUBLISHED')
  .maybeSingle();

console.log('Error:', error?.message || 'none');
console.log('Found:', data ? `"${data.title}" | ${data.status}` : 'NULL');
