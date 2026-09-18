import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function testConfirm() {
  const { data: list } = await supabase.auth.admin.listUsers();
  const testUser = list.users.find(u => u.email === "testuser@nammatech.dev");
  console.log("Before confirm:", testUser.email, "confirmed:", !!testUser.email_confirmed_at);

  const { data: updated, error } = await supabase.auth.admin.updateUserById(testUser.id, {
    email_confirm: true,
    user_metadata: { ...testUser.user_metadata, is_approved: true },
    app_metadata: { ...testUser.app_metadata, is_approved: true }
  });

  if (error) console.error("Confirm error:", error);
  console.log("After confirm:", updated.user.email, "confirmed:", !!updated.user.email_confirmed_at);
}

testConfirm();
