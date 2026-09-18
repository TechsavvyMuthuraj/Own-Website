import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function testUpdateUser() {
  const { data: list } = await supabase.auth.admin.listUsers();
  const user = list.users[0];
  console.log("Before update:", user.email, "confirmed:", !!user.email_confirmed_at, "app_metadata:", user.app_metadata);

  const { data: updated, error } = await supabase.auth.admin.updateUserById(user.id, {
    email_confirm: true,
    app_metadata: { ...user.app_metadata, is_approved: true },
    user_metadata: { ...user.user_metadata, is_approved: true }
  });

  console.log("After update:", updated.user.email, "confirmed:", !!updated.user.email_confirmed_at, "app_metadata:", updated.user.app_metadata);
  if (error) console.error("Error:", error);
}

testUpdateUser();
