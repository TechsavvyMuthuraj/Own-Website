import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function testCreateUnconfirmed() {
  const { data: user, error } = await supabase.auth.admin.createUser({
    email: "testuser@nammatech.dev",
    password: "Password123!",
    email_confirm: false,
    user_metadata: { full_name: "Test User", is_approved: false },
    app_metadata: { is_approved: false, role: "USER" }
  });

  if (error) {
    console.error("Create error:", error);
    return;
  }

  console.log("Created user:", user.user.id, user.user.email, "confirmed:", !!user.user.email_confirmed_at);

  // Also create profile
  await supabase.from("profiles").upsert({
    id: user.user.id,
    email: user.user.email,
    full_name: "Test User",
    role: "USER"
  });

  console.log("Profile created");
}

testCreateUnconfirmed();
