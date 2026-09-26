import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compress: true,
  poweredByHeader: false,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http",  hostname: "**" },
    ],
    // Allow quality=85 for hero image; enable WebP + AVIF for ~70% smaller payloads
    formats: ["image/avif", "image/webp"],
    qualities: [50, 60, 70, 75, 80, 85, 90],
    minimumCacheTTL: 31536000, // 1 year CDN caching for optimized images
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === "production" ? { exclude: ["error", "warn"] } : false,
  },
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "framer-motion",
      "@supabase/supabase-js",
      "clsx",
      "tailwind-merge",
    ],
  },
  async headers() {
    return [
      {
        source: "/images/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/(logo.png|favicon.ico)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=604800, stale-while-revalidate=2592000",
          },
        ],
      },
      {
        // Apply security headers to all routes
        source: "/(.*)",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(self), microphone=(self), geolocation=()",
          },
          {
            // Content-Security-Policy — fully allows third-party ad networks (Adsterra, AdSense) + Supabase + Cloudflare
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https: blob: data:",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https:",
              "font-src 'self' https://fonts.gstatic.com data: https:",
              "img-src 'self' data: blob: https:",
              "frame-src 'self' https: data: blob:",
              "media-src 'self' https: data: blob:",
              "connect-src 'self' https: wss: blob: data:",
              "worker-src 'self' blob:",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
