import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

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
  const host =
    request.headers.get("x-forwarded-host") ||
    request.headers.get("host") ||
    request.nextUrl.hostname ||
    "";
  const isAdminSubdomain = host.startsWith("admin.");

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Admin Subdomain Routing
  if (isAdminSubdomain) {
    if (pathname === "/") {
      if (!user) {
        return NextResponse.redirect(new URL("/admin/login", request.url));
      }
      return NextResponse.rewrite(new URL("/admin", request.url));
    }
    if (!pathname.startsWith("/admin") && !pathname.startsWith("/api") && !pathname.startsWith("/auth")) {
      return NextResponse.rewrite(new URL(`/admin${pathname}`, request.url));
    }
  }

  // Protect /admin routes
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

  // Protect /account routes
  if (pathname.startsWith("/account") && !user) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ── Maintenance Mode ──────────────────────────────────────────────────────
  const isMaintenanceExempt =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname === "/ads.txt" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml";

  if (!isMaintenanceExempt && supabaseServiceKey) {
    try {
      // Use direct fetch to Supabase REST API — avoids dynamic import overhead,
      // is Edge-runtime compatible, and is significantly faster (~10ms vs ~100ms).
      const settingsRes = await fetch(
        `${supabaseUrl}/rest/v1/site_settings?key=eq.maintenance_mode&select=value&limit=1`,
        {
          headers: {
            apikey: supabaseServiceKey,
            Authorization: `Bearer ${supabaseServiceKey}`,
            "Content-Type": "application/json",
            Prefer: "return=representation",
          },
          // No caching — always get the fresh value
          cache: "no-store",
        }
      );

      let isInMaintenance = false;
      if (settingsRes.ok) {
        const rows: Array<{ value: string | boolean }> = await settingsRes.json();
        if (rows.length > 0) {
          try {
            const raw = rows[0].value;
            const val = typeof raw === "string" ? JSON.parse(raw) : raw;
            isInMaintenance = val === true || val === "true";
          } catch { /* skip */ }
        }
      }

      // Case 1: Maintenance is OFF, but user requested /maintenance -> redirect to home
      if (!isInMaintenance && pathname === "/maintenance") {
        const liveRedirect = NextResponse.redirect(new URL("/", request.url), 307);
        liveRedirect.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
        liveRedirect.headers.set("Pragma", "no-cache");
        return liveRedirect;
      }

      // Case 2: Maintenance is ON
      if (isInMaintenance) {
        // Admins logged in can bypass maintenance by visiting /?admin_preview=true
        const hasAdminPreviewQuery = request.nextUrl.searchParams.get("admin_preview") === "true";
        const hasAdminPreviewCookie = request.cookies.get("admin_preview")?.value === "true";

        // Also allow bypass if the user is a logged-in admin (user object already fetched above)
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

        // For all public pages, redirect to /maintenance
        if (pathname !== "/maintenance") {
          const maintRedirect = NextResponse.redirect(new URL("/maintenance", request.url), 307);
          maintRedirect.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
          maintRedirect.headers.set("Pragma", "no-cache");
          return maintRedirect;
        }
      }
    } catch (err) {
      console.error("[Proxy] Maintenance check failed:", err);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
