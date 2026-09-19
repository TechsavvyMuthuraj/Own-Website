import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http",  hostname: "**" },
    ],
    // Allow quality=85 for hero image; enable WebP + AVIF for ~70% smaller payloads
    formats: ["image/avif", "image/webp"],
    qualities: [50, 60, 70, 75, 80, 85, 90],
    minimumCacheTTL: 86400, // 24h CDN caching for optimized images
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },
  async headers() {
    return [
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
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            // Content-Security-Policy — allows Cloudflare Turnstile + Supabase + Google AdSense
            key: "Content-Security-Policy",
            value: [
              // Self + inline scripts (required by Next.js SSR)
              "default-src 'self'",
              // Scripts: self, inline (Next.js), Cloudflare Turnstile, Google AdSense, Supabase
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com https://pagead2.googlesyndication.com https://adservice.google.com https://tpc.googlesyndication.com https://*.googlesyndication.com https://*.google.com https://*.supabase.co",
              // Styles: self + inline (Tailwind/CSS-in-JS)
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              // Fonts
              "font-src 'self' https://fonts.gstatic.com data:",
              // Images: self, data URIs, Supabase storage, Google AdSense, Unsplash & all HTTPS + YouTube thumbnails
              "img-src 'self' data: blob: https: https://*.supabase.co https://*.supabase.in https://images.unsplash.com https://i.ytimg.com https://*.ytimg.com https://pagead2.googlesyndication.com https://*.google.com https://*.doubleclick.net https://tpc.googlesyndication.com",
              // Frames: YouTube Video Players + Cloudflare Turnstile iframe + Google AdSense & DoubleClick
              "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com https://youtube.com https://*.youtube.com https://*.youtube-nocookie.com https://challenges.cloudflare.com https://googleads.g.doubleclick.net https://tpc.googlesyndication.com https://*.google.com https://pagead2.googlesyndication.com",
              // Media: audio and video playback
              "media-src 'self' https: data: blob:",
              // Connections: API calls + Supabase + Cloudflare Turnstile verify endpoint + Web3Forms + AdSense + YouTube
              "connect-src 'self' https://*.supabase.co https://*.supabase.in wss://*.supabase.co https://challenges.cloudflare.com https://api.web3forms.com https://pagead2.googlesyndication.com https://*.google.com https://*.doubleclick.net https://www.youtube.com https://*.youtube.com https://*.googlevideo.com",
              // Workers: Cloudflare Turnstile uses workers
              "worker-src 'self' blob:",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
