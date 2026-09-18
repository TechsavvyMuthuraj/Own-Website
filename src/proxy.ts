import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes("placeholder")) {
    return supabaseResponse;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  const { pathname } = request.nextUrl;

  const isMaintenanceExempt =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname === "/ads.txt" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml";

  // ── Run auth check + maintenance fetch IN PARALLEL for max speed ───────────
  const maintenanceFetch =
    !isMaintenanceExempt && supabaseServiceKey
      ? fetch(
          `${supabaseUrl}/rest/v1/site_settings?key=eq.maintenance_mode&select=value&limit=1`,
          {
            headers: {
              apikey: supabaseServiceKey,
              Authorization: `Bearer ${supabaseServiceKey}`,
              "Content-Type": "application/json",
            },
            cache: "no-store",
          }
        ).catch(() => null)
      : Promise.resolve(null);

  const [{ data: { user } }, maintenanceRes] = await Promise.all([
    supabase.auth.getUser(),
    maintenanceFetch,
  ]);

  // ── Protect /admin routes (Access strictly via /admin and /admin/login) ──────
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    if (!user) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    const adminEmails = (process.env.ADMIN_EMAILS || "techsavvy.muthuraj.dev@gmail.com")
      .split(",")
      .map((e) => e.trim().toLowerCase());

    const isDesignatedAdmin = Boolean(user.email && adminEmails.includes(user.email.toLowerCase()));

    if (!isDesignatedAdmin) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (!profile || (profile.role !== "ADMIN" && profile.role !== "SUPER_ADMIN")) {
        const homeUrl = new URL("/", request.url);
        homeUrl.searchParams.set("error", "unauthorized");
        return NextResponse.redirect(homeUrl);
      }
    }
  }

  // ── Protect /account routes ────────────────────────────────────────────────
  if (pathname.startsWith("/account") && !user) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ── Maintenance Mode ───────────────────────────────────────────────────────
  if (!isMaintenanceExempt && maintenanceRes) {
    try {
      let isInMaintenance = false;

      if (maintenanceRes.ok) {
        const rows: Array<{ value: string | boolean }> = await maintenanceRes.json();
        if (rows.length > 0) {
          const raw = rows[0].value;
          const val = typeof raw === "string" ? JSON.parse(raw) : raw;
          isInMaintenance = val === true || val === "true";
        }
      }

      if (!isInMaintenance && pathname === "/maintenance") {
        const r = NextResponse.redirect(new URL("/", request.url), 307);
        r.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
        return r;
      }

      if (isInMaintenance) {
        const hasAdminPreviewQuery = request.nextUrl.searchParams.get("admin_preview") === "true";
        const hasAdminPreviewCookie = request.cookies.get("admin_preview")?.value === "true";
        const adminEmails = (process.env.ADMIN_EMAILS || "techsavvy.muthuraj.dev@gmail.com")
          .split(",")
          .map((e) => e.trim().toLowerCase());
        const isAdminUser = Boolean(user?.email && adminEmails.includes(user.email.toLowerCase()));

        if (hasAdminPreviewQuery || hasAdminPreviewCookie || isAdminUser) {
          if (hasAdminPreviewQuery) {
            supabaseResponse.cookies.set("admin_preview", "true", { path: "/", maxAge: 3600 });
          }
          return supabaseResponse;
        }

        if (pathname !== "/maintenance") {
          const r = NextResponse.redirect(new URL("/maintenance", request.url), 307);
          r.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
          return r;
        }
      }
    } catch (err) {
      console.error("[Proxy] Maintenance check error:", err);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
