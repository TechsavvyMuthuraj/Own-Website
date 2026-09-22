import { NextResponse, NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// In-memory rate limiting (resets on cold-start / serverless spin-up)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute window
const RATE_LIMIT_MAX = 5; // max 5 submissions per IP per minute

function getRateLimitKey(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  if (entry.count >= RATE_LIMIT_MAX) return true;

  entry.count++;
  return false;
}

export async function POST(request: NextRequest) {
  try {
    // ── Rate limiting ─────────────────────────────────────────────────────────
    const ipKey = getRateLimitKey(request);
    if (isRateLimited(ipKey)) {
      return NextResponse.json(
        { error: "Too many submissions. Please wait a moment and try again." },
        { status: 429 }
      );
    }

    // ── Parse body ────────────────────────────────────────────────────────────
    let body: Record<string, string>;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    }

    const { name, email, subject, message } = body;

    // ── Field validation ──────────────────────────────────────────────────────
    if (!name?.trim()) {
      return NextResponse.json({ error: "Name is required." }, { status: 400 });
    }
    if (!email?.trim() || !email.includes("@") || !email.includes(".")) {
      return NextResponse.json({ error: "A valid email address is required." }, { status: 400 });
    }
    if (!subject?.trim()) {
      return NextResponse.json({ error: "Subject is required." }, { status: 400 });
    }
    if (!message?.trim() || message.trim().length < 5) {
      return NextResponse.json(
        { error: "Message must be at least 5 characters." },
        { status: 400 }
      );
    }

    // ── 1. Save directly to Supabase via Admin Client ─────────────────────────
    let dbSuccess = false;
    try {
      const supabaseAdmin = createAdminClient();
      const { error: insertErr } = await supabaseAdmin.from("contact_messages").insert({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        subject: subject.trim(),
        message: message.trim(),
        status: "UNREAD",
      });

      if (!insertErr) {
        dbSuccess = true;
      } else {
        console.error("[Contact] Database insert error:", insertErr);
      }
    } catch (dbErr) {
      console.error("[Contact] Supabase client exception:", dbErr);
    }

    // ── 2. Web3Forms submission (Optional email delivery) ─────────────────────
    const web3FormsKey = process.env.WEB3FORMS_ACCESS_KEY;
    if (web3FormsKey) {
      try {
        const formPayload = new FormData();
        formPayload.append("access_key", web3FormsKey);
        formPayload.append("subject", `NammaTech - ${subject.trim()}`);
        formPayload.append("from_name", "NammaTech Website");
        formPayload.append("name", name.trim());
        formPayload.append("email", email.trim());
        formPayload.append("message", `Subject: ${subject.trim()}\n\n${message.trim()}`);
        formPayload.append("redirect", "false");

        await fetch("https://api.web3forms.com/submit", {
          method: "POST",
          body: formPayload,
        });
      } catch (mailErr) {
        console.warn("[Contact] Web3Forms delivery warning (non-fatal):", mailErr);
      }
    }

    // Return success if stored in DB or processed
    return NextResponse.json({ success: true, saved: dbSuccess });
  } catch (err: any) {
    console.error("[Contact] Unexpected error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
