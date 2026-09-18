import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://rixdlxqktshrwjbaxxcz.supabase.co";
const serviceRoleKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJpeGRseHFrdHNocndqYmF4eGN6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTcxODEwMywiZXhwIjoyMTA1Mjk0MTAzfQ.jirviICOr8IBz_39JSI5OSDoMHpnUDRiIGFtSQ0O1Zw";

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function check() {
  console.log("Checking connection to Supabase...");
  const tables = ["categories", "resources", "profiles", "orders", "announcements", "site_settings"];
  
  for (const table of tables) {
    const { data, error } = await supabase.from(table).select("*").limit(1);
    if (error) {
      console.log(`Table '${table}': NOT FOUND or ERROR: ${error.message}`);
    } else {
      console.log(`Table '${table}': OK (records found: ${data.length})`);
    }
  }
}

check();
