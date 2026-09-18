import { NextResponse, NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

// In-memory rate limiting (resets on cold-start / serverless spin-up)
// For production, use Redis/Upstash. This guards against burst spam.
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute window
const RATE_LIMIT_MAX = 3; // max 3 submissions per IP per minute

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

    const { name, email, subject, message, turnstileToken } = body;

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
    if (!message?.trim() || message.trim().length < 10) {
      return NextResponse.json(
        { error: "Message must be at least 10 characters." },
        { status: 400 }
      );
    }
    if (!turnstileToken) {
      return NextResponse.json(
        { error: "Security verification (Turnstile) token is missing. Please reload the page." },
        { status: 400 }
      );
    }

    // ── Cloudflare Turnstile server-side verification ─────────────────────────
    const turnstileSecretKey = process.env.TURNSTILE_SECRET_KEY;
    if (!turnstileSecretKey) {
      console.error("[Contact] TURNSTILE_SECRET_KEY is not configured.");
      return NextResponse.json(
        { error: "Server configuration error. Please contact support." },
        { status: 500 }
      );
    }

    const turnstileVerifyRes = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          secret: turnstileSecretKey,
          response: turnstileToken,
          // Optionally include IP for stricter verification
          remoteip: ipKey !== "unknown" ? ipKey : "",
        }),
      }
    );

    if (!turnstileVerifyRes.ok) {
      console.error("[Contact] Turnstile verify request failed:", turnstileVerifyRes.status);
      return NextResponse.json(
        { error: "Failed to verify security challenge. Please try again." },
        { status: 502 }
      );
    }

    const turnstileData = await turnstileVerifyRes.json();

    if (!turnstileData.success) {
      const codes: string[] = turnstileData["error-codes"] || [];
      console.warn("[Contact] Turnstile failed:", codes);

      // Provide specific messages for common error codes
      if (codes.includes("timeout-or-duplicate")) {
        return NextResponse.json(
          { error: "Security challenge expired or already used. Please refresh the page and try again.", turnstileExpired: true },
          { status: 400 }
        );
      }
      if (codes.includes("invalid-input-response")) {
        return NextResponse.json(
          { error: "Invalid security token. Please reload the page." },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { error: "Security verification failed. Please try again.", turnstileError: true },
        { status: 400 }
      );
    }

    // ── Web3Forms submission (server-side — access key never leaves server) ────
    const web3FormsKey = process.env.WEB3FORMS_ACCESS_KEY;
    if (!web3FormsKey) {
      console.error("[Contact] WEB3FORMS_ACCESS_KEY is not configured.");
      return NextResponse.json(
        { error: "Server configuration error. Please contact support." },
        { status: 500 }
      );
    }

    const formPayload = new FormData();
    formPayload.append("access_key", web3FormsKey);
    formPayload.append("subject", "NammaTech - New Contact Form Message");
    formPayload.append("from_name", "NammaTech Website");
    formPayload.append("name", name.trim());
    formPayload.append("email", email.trim());
    // Rewrite subject field as the user's subject in the body so the email subject stays consistent
    formPayload.append("message", `Subject: ${subject.trim()}\n\n${message.trim()}`);
    // Disable Web3Forms' built-in redirect — we handle success on the client
    formPayload.append("redirect", "false");

    const web3Res = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      body: formPayload,
    });

    const web3Data = await web3Res.json();

    if (!web3Res.ok || !web3Data.success) {
      console.error("[Contact] Web3Forms error:", web3Data);
      return NextResponse.json(
        { error: web3Data.message || "Failed to deliver your message. Please try again shortly." },
        { status: 502 }
      );
    }

    // ── Also log to Supabase contact_messages (best-effort, non-blocking) ─────
    try {
      const supabase = await createClient();
      await supabase.from("contact_messages").insert({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        subject: subject.trim(),
        message: message.trim(),
        status: "UNREAD",
      });
    } catch (dbErr) {
      // Don't fail the response if DB insert fails — email was already sent
      console.warn("[Contact] Supabase log failed (non-fatal):", dbErr);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[Contact] Unexpected error:", err);
    return NextResponse.json({ error: "An unexpected error occurred. Please try again." }, { status: 500 });
  }
}
