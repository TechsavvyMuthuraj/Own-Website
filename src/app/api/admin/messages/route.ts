import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, ids, all, status = "READ" } = body;
    const supabaseAdmin = createAdminClient();

    if (all) {
      // Mark all unread messages as read
      const { error } = await supabaseAdmin
        .from("contact_messages")
        .update({ status })
        .neq("status", status);

      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      return NextResponse.json({ success: true, all: true });
    }

    if (Array.isArray(ids) && ids.length > 0) {
      // Bulk update selected messages
      const { error } = await supabaseAdmin
        .from("contact_messages")
        .update({ status })
        .in("id", ids);

      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      return NextResponse.json({ success: true, count: ids.length });
    }

    if (!id) {
      return NextResponse.json({ error: "Missing message id" }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from("contact_messages")
      .update({ status })
      .eq("id", id);

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, ids, all, filter } = body;
    const supabaseAdmin = createAdminClient();

    if (all) {
      // Delete all messages (or filtered by status e.g. "READ")
      let query = supabaseAdmin.from("contact_messages").delete();
      if (filter === "READ") {
        query = query.eq("status", "READ");
      } else if (filter === "UNREAD") {
        query = query.eq("status", "UNREAD");
      } else {
        // Delete all contact messages
        query = query.neq("id", "00000000-0000-0000-0000-000000000000");
      }

      const { error } = await query;
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      return NextResponse.json({ success: true, all: true });
    }

    if (Array.isArray(ids) && ids.length > 0) {
      // Bulk delete selected messages
      const { error } = await supabaseAdmin
        .from("contact_messages")
        .delete()
        .in("id", ids);

      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      return NextResponse.json({ success: true, count: ids.length });
    }

    if (!id) {
      return NextResponse.json({ error: "Missing message id" }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from("contact_messages")
      .delete()
      .eq("id", id);

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}
