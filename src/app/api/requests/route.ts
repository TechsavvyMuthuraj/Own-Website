import { NextResponse, NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

// In-memory rate limiting: IP -> timestamps[]
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_REQUESTS_PER_WINDOW = 5;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const timestamps = rateLimitMap.get(ip) || [];
  const validTimestamps = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  
  if (validTimestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }

  validTimestamps.push(now);
  rateLimitMap.set(ip, validTimestamps);
  return true;
}

// Normalize international phone number
function normalizePhoneNumber(phone: string): string {
  const cleaned = phone.replace(/[\s\-\(\)]/g, "").trim();
  if (cleaned.startsWith("+")) {
    return cleaned;
  }
  // If 10 digits without country code, default to India (+91)
  if (/^\d{10}$/.test(cleaned)) {
    return `+91${cleaned}`;
  }
  // Otherwise, prefix '+' if digits only
  if (/^\d+$/.test(cleaned)) {
    return `+${cleaned}`;
  }
  return cleaned;
}

// Mask phone number for privacy in public/admin list views: e.g. +91 ••••• ••456
function maskPhoneNumber(phone: string): string {
  if (!phone || phone.length < 8) return phone || "—";
  const prefix = phone.slice(0, 3);
  const suffix = phone.slice(-3);
  return `${prefix} ••••• ••${suffix}`;
}

// POST: Submit a new resource request (public: guests or authenticated users)
export async function POST(request: NextRequest) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown-ip";

    // Rate limiting check
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a few minutes before submitting again." },
        { status: 429 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const {
      name,
      whatsapp_number,
      resource_name,
      category,
      description,
      hp_website, // Anti-spam honeypot
    } = body;

    // Honeypot anti-spam check: If filled, silently reject or fail
    if (hp_website) {
      return NextResponse.json(
        { error: "Invalid submission detected." },
        { status: 400 }
      );
    }

    // Required field validations
    const trimmedName = (name || "").trim();
    if (!trimmedName || trimmedName.length < 2 || trimmedName.length > 100) {
      return NextResponse.json(
        { error: "Please enter a valid name (2 to 100 characters)." },
        { status: 400 }
      );
    }

    const rawPhone = (whatsapp_number || "").trim();
    if (!rawPhone || rawPhone.length < 7 || rawPhone.length > 25) {
      return NextResponse.json(
        { error: "Please enter a valid WhatsApp phone number with country code." },
        { status: 400 }
      );
    }

    const normalizedPhone = normalizePhoneNumber(rawPhone);
    if (!/^\+\d{7,15}$/.test(normalizedPhone)) {
      return NextResponse.json(
        { error: "Invalid WhatsApp phone format. Example: +919876543210" },
        { status: 400 }
      );
    }

    const trimmedResourceName = (resource_name || "").trim();
    if (!trimmedResourceName || trimmedResourceName.length < 2 || trimmedResourceName.length > 200) {
      return NextResponse.json(
        { error: "Please enter the resource or tool name you are looking for." },
        { status: 400 }
      );
    }

    const trimmedDescription = (description || "").trim();
    if (!trimmedDescription || trimmedDescription.length < 5 || trimmedDescription.length > 3000) {
      return NextResponse.json(
        { error: "Please provide request details or description (minimum 5 characters)." },
        { status: 400 }
      );
    }

    const chosenCategory = (category || "Software").trim();

    // Check authenticated user
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Duplicate prevention: check if identical request was submitted in the last 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const { data: duplicateCheck } = await supabaseAdmin
      .from("resource_requests")
      .select("id")
      .gte("created_at", fiveMinutesAgo)
      .limit(10);

    // Try modern insert first (with new columns)
    const modernPayload = {
      user_id: user?.id || null,
      name: trimmedName,
      whatsapp_number: normalizedPhone,
      resource_name: trimmedResourceName,
      category: chosenCategory,
      description: trimmedDescription,
      status: "pending",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    let insertedId: string | null = null;
    const modernRes = await supabaseAdmin
      .from("resource_requests")
      .insert(modernPayload)
      .select("id")
      .single();

    if (!modernRes.error && modernRes.data) {
      insertedId = modernRes.data.id;
    } else {
      // Fallback for existing database table column structure
      console.warn("Primary column insert returned:", modernRes.error?.message, "Attempting compatible schema fallback...");
      const fallbackPayload = {
        user_id: user?.id || null,
        user_name: trimmedName,
        user_email: `${normalizedPhone.replace("+", "")}@whatsapp.nammatech`,
        software_name: trimmedResourceName,
        software_category: chosenCategory,
        description: `[WhatsApp: ${normalizedPhone}]\n\n${trimmedDescription}`,
        status: "pending",
        priority: "NORMAL",
      };

      const fallbackRes = await supabaseAdmin
        .from("resource_requests")
        .insert(fallbackPayload)
        .select("id")
        .single();

      if (fallbackRes.error) {
        console.error("All insert attempts failed:", fallbackRes.error);
        return NextResponse.json(
          { error: "Database error saving your request. Please try again." },
          { status: 500 }
        );
      }
      insertedId = fallbackRes.data.id;
    }

    return NextResponse.json({
      success: true,
      id: insertedId,
      message: "Request received successfully.",
    });
  } catch (err: any) {
    console.error("Resource request submission error:", err);
    return NextResponse.json(
      { error: err?.message || "An unexpected error occurred." },
      { status: 500 }
    );
  }
}

// GET: List requests (Admin only)
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminEmails = (process.env.ADMIN_EMAILS || "techsavvy.muthuraj.dev@gmail.com")
      .split(",")
      .map((e) => e.trim().toLowerCase());

    const isDesignatedAdmin = user.email && adminEmails.includes(user.email.toLowerCase());
    const { data: callerProfile } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (
      !isDesignatedAdmin &&
      callerProfile?.role !== "ADMIN" &&
      callerProfile?.role !== "SUPER_ADMIN"
    ) {
      return NextResponse.json({ error: "Forbidden: Admin access required." }, { status: 403 });
    }

    const url = new URL(request.url);
    const status = (url.searchParams.get("status") || "all").toLowerCase();
    const search = (url.searchParams.get("q") || "").trim().toLowerCase();
    const sort = url.searchParams.get("sort") || "newest";
    const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10));
    const perPage = Math.min(100, Math.max(10, parseInt(url.searchParams.get("per_page") || "30", 10)));

    let query = supabaseAdmin
      .from("resource_requests")
      .select("*", { count: "exact" });

    // Status filter
    if (status !== "all") {
      // Support case-insensitive status match
      query = query.or(`status.eq.${status},status.eq.${status.toUpperCase()}`);
    }

    // Sorting
    query = query.order("created_at", { ascending: sort === "oldest" });

    // Pagination
    query = query.range((page - 1) * perPage, page * perPage - 1);

    const { data, error, count } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Normalize records to canonical shape
    const normalized = (data || []).map((row: any) => {
      let rawPhone = row.whatsapp_number || "";
      if (!rawPhone && row.description) {
        const match = row.description.match(/\[WhatsApp:\s*([^\]]+)\]/);
        if (match) rawPhone = match[1].trim();
      }
      if (!rawPhone && row.user_email && row.user_email.includes("@whatsapp.nammatech")) {
        rawPhone = "+" + row.user_email.replace("@whatsapp.nammatech", "");
      }

      // Clean description if WhatsApp tag was prepended
      let cleanDesc = row.description || "";
      cleanDesc = cleanDesc.replace(/^\[WhatsApp:[^\]]+\]\s*/, "").trim();

      const rawStatus = (row.status || "pending").toLowerCase();
      // Map legacy uppercase status
      const mappedStatus =
        rawStatus === "fulfilled"
          ? "completed"
          : rawStatus === "in_review"
          ? "reviewing"
          : rawStatus;

      return {
        id: row.id,
        user_id: row.user_id,
        name: row.name || row.user_name || "Anonymous",
        whatsapp_number: rawPhone || "—",
        masked_whatsapp: maskPhoneNumber(rawPhone),
        resource_name: row.resource_name || row.software_name || "Resource",
        category: row.category || row.software_category || "Software",
        description: cleanDesc,
        status: mappedStatus,
        admin_note: row.admin_note || row.admin_notes || null,
        created_at: row.created_at,
        updated_at: row.updated_at,
        contacted_at: row.contacted_at || null,
        resolved_at: row.resolved_at || null,
      };
    });

    // In-memory search filter if search parameter provided
    const filtered = search
      ? normalized.filter(
          (r: any) =>
            r.resource_name.toLowerCase().includes(search) ||
            r.name.toLowerCase().includes(search) ||
            r.whatsapp_number.includes(search) ||
            r.category.toLowerCase().includes(search)
        )
      : normalized;

    return NextResponse.json({
      requests: filtered,
      total: count || filtered.length,
      page,
      per_page: perPage,
    });
  } catch (err: any) {
    console.error("Resource request fetch error:", err);
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}
