import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export interface SupportTeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl?: string;
  dutyStatus: "ON_DUTY" | "BUSY" | "OFF_DUTY";
  shiftHours: string;
  phone?: string;
  specializations: string[];
  activeChatsCount: number;
  resolvedChatsCount: number;
  rating: number;
  createdAt: string;
}

const DEFAULT_TEAM_MEMBERS: SupportTeamMember[] = [
  {
    id: "agent_muthuraj_lead",
    name: "Muthuraj C",
    email: "techsavvy.muthuraj.dev@gmail.com",
    role: "Lead Software Architect & Head of Support",
    dutyStatus: "ON_DUTY",
    shiftHours: "24/7 Priority Operations",
    phone: "+91 99448 75726",
    specializations: [
      "Software Installation",
      "Game Crash / Error",
      "Broken Download Link",
      "VIP Access & Billing",
    ],
    activeChatsCount: 0,
    resolvedChatsCount: 0,
    rating: 5.0,
    createdAt: new Date().toISOString(),
  },
];

const MOCK_EMAILS = [
  "karthik.techsupport@nammatech.dev",
  "priya.vip@nammatech.dev",
  "support.saravanan@nammatech.dev",
  "praveen.repack@nammatech.dev",
];

async function checkAdminAuth() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const adminEmails = (process.env.ADMIN_EMAILS || "techsavvy.muthuraj.dev@gmail.com")
      .split(",")
      .map((e) => e.trim().toLowerCase());

    if (user.email && adminEmails.includes(user.email.toLowerCase())) {
      return true;
    }

    const supabaseAdmin = createAdminClient();
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    return profile?.role === "ADMIN" || profile?.role === "SUPER_ADMIN";
  } catch {
    return false;
  }
}

export async function GET() {
  try {
    const supabaseAdmin = createAdminClient();
    const { data } = await supabaseAdmin
      .from("site_settings")
      .select("value")
      .eq("key", "technical_support_team")
      .maybeSingle();

    let team: SupportTeamMember[] = [];
    if (data?.value) {
      try {
        team = typeof data.value === "string" ? JSON.parse(data.value) : data.value;
      } catch {
        team = DEFAULT_TEAM_MEMBERS;
      }
    } else {
      team = DEFAULT_TEAM_MEMBERS;
    }

    // Filter out any default fake mock accounts so only authentic admin-created specialists remain
    const originalTeam = team.filter(
      (m) => !MOCK_EMAILS.includes(m.email.toLowerCase().trim())
    );

    const finalTeam = originalTeam.length > 0 ? originalTeam : DEFAULT_TEAM_MEMBERS;

    // If mock entries were removed, sync clean list to database
    if (team.length !== finalTeam.length) {
      await supabaseAdmin.from("site_settings").upsert({
        key: "technical_support_team",
        value: JSON.stringify(finalTeam),
        updated_at: new Date().toISOString(),
      });
    }

    return NextResponse.json({ team: finalTeam });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const isAdmin = await checkAdminAuth();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      email,
      role = "Technical Support Specialist",
      shiftHours = "9:00 AM - 6:00 PM IST",
      phone,
      specializations = ["General Support"],
      dutyStatus = "ON_DUTY",
    } = body;

    if (!name?.trim() || !email?.trim()) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
    }

    const supabaseAdmin = createAdminClient();
    const { data } = await supabaseAdmin
      .from("site_settings")
      .select("value")
      .eq("key", "technical_support_team")
      .maybeSingle();

    let currentTeam: SupportTeamMember[] = [];
    if (data?.value) {
      try {
        currentTeam = typeof data.value === "string" ? JSON.parse(data.value) : data.value;
      } catch {}
    }
    if (!currentTeam.length) {
      currentTeam = [...DEFAULT_TEAM_MEMBERS];
    }

    const newMember: SupportTeamMember = {
      id: `agent_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role: role.trim(),
      shiftHours: shiftHours.trim(),
      phone: phone?.trim(),
      specializations: Array.isArray(specializations) && specializations.length ? specializations : ["General Support"],
      dutyStatus: dutyStatus as any,
      activeChatsCount: 0,
      resolvedChatsCount: 0,
      rating: 5.0,
      createdAt: new Date().toISOString(),
    };

    const updatedTeam = [newMember, ...currentTeam];

    await supabaseAdmin.from("site_settings").upsert({
      key: "technical_support_team",
      value: JSON.stringify(updatedTeam),
      updated_at: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, member: newMember, team: updatedTeam });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, email, dutyStatus, role, shiftHours, phone, specializations } = body;

    if (!id) {
      return NextResponse.json({ error: "Member ID is required" }, { status: 400 });
    }

    const isAdmin = await checkAdminAuth();
    // Only administrators can change core roles or assigned shift configurations
    if (!isAdmin && (name || email || role || shiftHours || phone !== undefined || specializations)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabaseAdmin = createAdminClient();
    const { data } = await supabaseAdmin
      .from("site_settings")
      .select("value")
      .eq("key", "technical_support_team")
      .maybeSingle();

    let currentTeam: SupportTeamMember[] = [];
    if (data?.value) {
      try {
        currentTeam = typeof data.value === "string" ? JSON.parse(data.value) : data.value;
      } catch {}
    }

    const updatedTeam = currentTeam.map((member) => {
      if (member.id === id) {
        return {
          ...member,
          ...(name ? { name: name.trim() } : {}),
          ...(email ? { email: email.trim().toLowerCase() } : {}),
          ...(dutyStatus ? { dutyStatus } : {}),
          ...(role ? { role: role.trim() } : {}),
          ...(shiftHours ? { shiftHours: shiftHours.trim() } : {}),
          ...(phone !== undefined ? { phone: phone.trim() } : {}),
          ...(specializations ? { specializations } : {}),
        };
      }
      return member;
    });

    await supabaseAdmin.from("site_settings").upsert({
      key: "technical_support_team",
      value: JSON.stringify(updatedTeam),
      updated_at: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, team: updatedTeam });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const isAdmin = await checkAdminAuth();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    let id = searchParams.get("id");
    if (!id) {
      try {
        const body = await request.json();
        id = body?.id;
      } catch {}
    }

    if (!id) {
      return NextResponse.json({ error: "Member ID is required" }, { status: 400 });
    }

    const supabaseAdmin = createAdminClient();
    const { data } = await supabaseAdmin
      .from("site_settings")
      .select("value")
      .eq("key", "technical_support_team")
      .maybeSingle();

    let currentTeam: SupportTeamMember[] = [];
    if (data?.value) {
      try {
        currentTeam = typeof data.value === "string" ? JSON.parse(data.value) : data.value;
      } catch {
        currentTeam = DEFAULT_TEAM_MEMBERS;
      }
    } else {
      currentTeam = DEFAULT_TEAM_MEMBERS;
    }

    const updatedTeam = currentTeam.filter((m) => m.id !== id);

    await supabaseAdmin.from("site_settings").upsert({
      key: "technical_support_team",
      value: JSON.stringify(updatedTeam),
      updated_at: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, team: updatedTeam });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
