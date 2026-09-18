import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function test() {
  const { data: list } = await supabase.auth.admin.listUsers();
  console.log("Total auth users:", list.users.length);
  for (const u of list.users) {
    console.log(`User ${u.email}: confirmed=${!!u.email_confirmed_at}, app_meta=`, u.app_metadata);
  }
}

test();
