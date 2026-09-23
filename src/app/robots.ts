import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL &&
    !process.env.NEXT_PUBLIC_SITE_URL.includes("localhost")
      ? process.env.NEXT_PUBLIC_SITE_URL
      : "https://www.techsavvymuthuraj.dev";

  const privateDisallows = [
    "/admin/",
    "/technicalsupport/",
    "/account/",
    "/checkout/",
    "/cart/",
    "/api/",
  ];

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: privateDisallows,
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: privateDisallows,
      },
      {
        userAgent: "Bingbot",
        allow: "/",
        disallow: privateDisallows,
      },
      {
        userAgent: "DuckDuckBot",
        allow: "/",
        disallow: privateDisallows,
      },
      {
        userAgent: "Applebot",
        allow: "/",
        disallow: privateDisallows,
      },
      {
        userAgent: "YandexBot",
        allow: "/",
        disallow: privateDisallows,
      },
      {
        userAgent: "Slurp", // Yahoo!
        allow: "/",
        disallow: privateDisallows,
      },
      {
        userAgent: "Mediapartners-Google",
        allow: "/",
      },
      {
        userAgent: "AdsBot-Google",
        allow: "/",
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
