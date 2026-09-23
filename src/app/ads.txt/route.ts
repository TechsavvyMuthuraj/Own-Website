import { NextResponse } from "next/server";

export const dynamic = "force-static";
export const revalidate = 86400; // 24 hours

export async function GET() {
  const adsTxtContent = "google.com, pub-1960459798233871, DIRECT, f08c47fec0942fa0\n";

  return new NextResponse(adsTxtContent, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800",
    },
  });
}
