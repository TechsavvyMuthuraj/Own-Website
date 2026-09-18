import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceKey);

async function testColumn() {
  const { data, error } = await supabase.from("profiles").select("is_approved").limit(1);
  console.log("Select is_approved result:", { data, error });
}

testColumn();
