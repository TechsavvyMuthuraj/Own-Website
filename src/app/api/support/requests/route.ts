import { NextResponse, NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

function normalizePhoneNumber(phone: string): string {
  const cleaned = phone.replace(/[\s\-\(\)]/g, "").trim();
  if (cleaned.startsWith("+")) return cleaned;
  if (/^\d{10}$/.test(cleaned)) return `+91${cleaned}`;
  if (/^\d+$/.test(cleaned)) return `+${cleaned}`;
  return cleaned;
}

// GET: Technical Support Specialists fetch user requests to troubleshoot and resolve
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const statusFilter = (searchParams.get("status") || "all").toLowerCase();
    const queryTerm = (searchParams.get("q") || "").trim().toLowerCase();

    let query = supabaseAdmin
      .from("resource_requests")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    if (statusFilter !== "all") {
      if (statusFilter === "in_review") {
        query = query.or("status.ilike.in_review,status.ilike.reviewing");
      } else if (statusFilter === "fulfilled") {
        query = query.or("status.ilike.fulfilled,status.ilike.completed");
      } else {
        query = query.ilike("status", statusFilter);
      }
    }

    const { data, error } = await query;
    if (error) {
      console.error("[Support Requests GET Error]:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const requests = (data || []).map((row: any) => {
      let rawPhone = row.whatsapp_number || "";
      if (!rawPhone && row.description) {
        const match = row.description.match(/\[WhatsApp:\s*([^\]]+)\]/);
        if (match) rawPhone = match[1].trim();
      }
      if (!rawPhone && row.user_email && row.user_email.includes("@whatsapp.nammatech")) {
        rawPhone = "+" + row.user_email.replace("@whatsapp.nammatech", "");
      }

      let cleanDesc = row.description || "";
      cleanDesc = cleanDesc.replace(/^\[WhatsApp:[^\]]+\]\s*/, "").trim();

      const rawStatus = (row.status || "pending").toLowerCase();
      const mappedStatus =
        rawStatus === "fulfilled" || rawStatus === "completed"
          ? "fulfilled"
          : rawStatus === "in_review" || rawStatus === "reviewing"
          ? "in_review"
          : rawStatus === "rejected"
          ? "rejected"
          : "pending";

      return {
        id: row.id,
        userId: row.user_id,
        userName: row.name || row.user_name || "User",
        whatsappNumber: rawPhone ? normalizePhoneNumber(rawPhone) : "—",
        resourceName: row.resource_name || row.software_name || "Resource / Software",
        category: row.category || row.software_category || "Software",
        description: cleanDesc,
        status: mappedStatus,
        adminNote: row.admin_note || row.admin_notes || null,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        contactedAt: row.contacted_at,
        resolvedAt: row.resolved_at,
      };
    });

    const filtered = queryTerm
      ? requests.filter(
          (r) =>
            r.resourceName.toLowerCase().includes(queryTerm) ||
            r.userName.toLowerCase().includes(queryTerm) ||
            r.whatsappNumber.includes(queryTerm) ||
            r.category.toLowerCase().includes(queryTerm) ||
            r.description.toLowerCase().includes(queryTerm)
        )
      : requests;

    return NextResponse.json({
      success: true,
      requests: filtered,
      counts: {
        total: requests.length,
        pending: requests.filter((r) => r.status === "pending").length,
        inReview: requests.filter((r) => r.status === "in_review").length,
        fulfilled: requests.filter((r) => r.status === "fulfilled").length,
      },
    });
  } catch (err: any) {
    console.error("[Support Requests GET Exception]:", err);
    return NextResponse.json({ error: err?.message || "Failed to load requests" }, { status: 500 });
  }
}

// PATCH: Technical Support Specialists update request status (e.g. In Review, Fulfilled, Rejected)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, adminNote, specialistName } = body;

    if (!id || !status) {
      return NextResponse.json({ error: "Missing required fields: id and status" }, { status: 400 });
    }

    const now = new Date().toISOString();
    const updates: Record<string, any> = {
      status,
      updated_at: now,
    };

    if (adminNote !== undefined) {
      updates.admin_note = adminNote;
    }

    if (status === "in_review") {
      updates.contacted_at = now;
    } else if (status === "fulfilled" || status === "completed") {
      updates.resolved_at = now;
      if (specialistName && !adminNote) {
        updates.admin_note = `Resolved & fulfilled by Specialist ${specialistName}`;
      }
    }

    const { data, error } = await supabaseAdmin
      .from("resource_requests")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("[Support Requests PATCH Error]:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      request: data,
      message: `Request marked as ${status.replace("_", " ")}.`,
    });
  } catch (err: any) {
    console.error("[Support Requests PATCH Exception]:", err);
    return NextResponse.json({ error: err?.message || "Failed to update request" }, { status: 500 });
  }
}
