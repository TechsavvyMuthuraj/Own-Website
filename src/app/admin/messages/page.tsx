import React from "react";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ContactMessage } from "@/types/database";
import { MessagesClient } from "./messages-client";

export const revalidate = 0;

export default async function AdminMessagesPage() {
  const supabase = createAdminClient();
  const { data: messages } = await supabase
    .from("contact_messages")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-extrabold text-[var(--foreground)] tracking-tight">
          Contact Submissions & Support Inbox
        </h1>
        <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
          Review incoming user inquiries, support requests, and DMCA copyright notices.
        </p>
      </div>

      <MessagesClient initialMessages={(messages || []) as ContactMessage[]} />
    </div>
  );
}
