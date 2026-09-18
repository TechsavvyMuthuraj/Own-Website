import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function cleanup() {
  const { data: list } = await supabase.auth.admin.listUsers();
  const testUser = list.users.find(u => u.email === "testuser@nammatech.dev");
  if (testUser) {
    await supabase.auth.admin.deleteUser(testUser.id);
    await supabase.from("profiles").delete().eq("id", testUser.id);
    console.log("Cleaned up test user");
  }
}

cleanup();
