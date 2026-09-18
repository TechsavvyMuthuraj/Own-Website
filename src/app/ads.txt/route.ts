export async function GET() {
  const content = "google.com, pub-1960459798233871, DIRECT, f08c47fec0942fa0\n";
  return new Response(content, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}
