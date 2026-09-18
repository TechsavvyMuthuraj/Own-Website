import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceKey);

async function main() {
  const { data: profiles, error } = await supabase.from("profiles").select("*").limit(5);
  console.log("Profiles in DB:", profiles);
  if (error) console.error("Error:", error);

  const { data: authData } = await supabase.auth.admin.listUsers();
  console.log("Auth Users in DB:", authData.users.map(u => ({
    id: u.id,
    email: u.email,
    email_confirmed_at: u.email_confirmed_at,
    user_metadata: u.user_metadata,
    app_metadata: u.app_metadata
  })));
}

main();
