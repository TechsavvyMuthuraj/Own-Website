import { createClient } from "./client";

export function subscribeToTable(
  tableName: string,
  onPayload: (payload: any) => void
) {
  const supabase = createClient();
  const channel = supabase
    .channel(`public:${tableName}`)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: tableName },
      (payload) => {
        onPayload(payload);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
