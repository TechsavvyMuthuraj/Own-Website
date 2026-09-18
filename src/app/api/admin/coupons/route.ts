import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || (profile.role !== "ADMIN" && profile.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const supabaseAdmin = createAdminClient();

    const { data, error } = await supabaseAdmin
      .from("coupons")
      .insert({
        code: body.code.trim().toUpperCase(),
        discount_type: body.discount_type || "PERCENTAGE",
        discount_value: Number(body.discount_value),
        min_order: body.min_order ? Number(body.min_order) : 0,
        max_discount: body.max_discount ? Number(body.max_discount) : null,
        usage_limit: body.usage_limit ? Number(body.usage_limit) : null,
        expires_at: body.expires_at || null,
        is_active: body.is_active !== false,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ coupon: data });
  } catch (err) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
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

    const { id } = await request.json();
    const supabaseAdmin = createAdminClient();

    const { error } = await supabaseAdmin.from("coupons").delete().eq("id", id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || (profile.role !== "ADMIN" && profile.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: "Coupon ID required" }, { status: 400 });
    }

    const supabaseAdmin = createAdminClient();
    const { data, error } = await supabaseAdmin
      .from("coupons")
      .update({
        code: updates.code ? updates.code.trim().toUpperCase() : undefined,
        discount_type: updates.discount_type || "PERCENTAGE",
        discount_value: updates.discount_value !== undefined ? Number(updates.discount_value) : undefined,
        min_order: updates.min_order !== undefined ? Number(updates.min_order) : 0,
        max_discount: updates.max_discount !== undefined ? (updates.max_discount ? Number(updates.max_discount) : null) : undefined,
        usage_limit: updates.usage_limit !== undefined ? (updates.usage_limit ? Number(updates.usage_limit) : null) : undefined,
        expires_at: updates.expires_at || null,
        is_active: updates.is_active !== undefined ? updates.is_active : true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ coupon: data });
  } catch (err) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
