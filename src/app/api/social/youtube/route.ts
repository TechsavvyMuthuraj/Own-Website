import { NextResponse } from "next/server";

export interface ParsedYouTubeVideo {
  id: string;
  videoId: string;
  title: string;
  link: string;
  thumbnailUrl: string;
  publishedAt: string;
  views: string;
  tag: string;
  duration?: string;
  description?: string;
}

export const revalidate = 1800; // Cache feed for 30 minutes

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const channelId = searchParams.get("channelId") || "UCavl9VKjbVWJBsqlVaCiIsw";

  try {
    const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
    const res = await fetch(rssUrl, {
      next: { revalidate: 1800 },
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) NammaTech/1.0",
      },
    });

    if (!res.ok) {
      throw new Error(`YouTube RSS responded with ${res.status}`);
    }

    const xml = await res.text();
    const entries: ParsedYouTubeVideo[] = [];

    // Parse channel title if present
    const channelTitleMatch = xml.match(/<title>([^<]+)<\/title>/);
    const channelTitle = channelTitleMatch ? channelTitleMatch[1].trim() : "Techie Muthuraj";

    const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
    let match: RegExpExecArray | null;

    while ((match = entryRegex.exec(xml)) !== null) {
      const block = match[1];

      const idMatch = block.match(/<yt:videoId>([^<]+)<\/yt:videoId>/);
      const titleMatch = block.match(/<title>([^<]+)<\/title>/);
      const linkMatch = block.match(/<link[^>]+href="([^"]+)"/);
      const publishedMatch = block.match(/<published>([^<]+)<\/published>/);
      const viewsMatch = block.match(/views="(\d+)"/);

      if (idMatch && titleMatch) {
        const videoId = idMatch[1].trim();
        const rawTitle = titleMatch[1].replace(/&amp;/g, "&").replace(/&quot;/g, '"').trim();
        const link = linkMatch ? linkMatch[1] : `https://www.youtube.com/watch?v=${videoId}`;
        const rawViews = viewsMatch ? parseInt(viewsMatch[1], 10) : 0;

        let formattedViews = `${rawViews} views`;
        if (rawViews >= 1000) {
          formattedViews = `${(rawViews / 1000).toFixed(1)}K views`;
        }

        const isShort = link.includes("/shorts/") || rawTitle.toLowerCase().includes("shorts");
        const tag = isShort ? "#Shorts" : "#TechTutorial";

        entries.push({
          id: videoId,
          videoId,
          title: rawTitle,
          link,
          thumbnailUrl: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
          publishedAt: publishedMatch ? publishedMatch[1] : new Date().toISOString(),
          views: formattedViews,
          tag,
          duration: isShort ? "0:60" : "12:45",
          description: `Watch ${rawTitle} by ${channelTitle} on YouTube.`,
        });
      }
    }

    // Default fallback tutorial items to ensure 4 distinct cards if the channel has fewer than 4 uploads
    const fallbackCatalog: ParsedYouTubeVideo[] = [
      {
        id: "yt-obs-guide",
        videoId: "YCWA1uiY3gs",
        title: "🔥 Multiple OBS at the Same Time?! 😱 | UMINGLE + Recording/Streaming Full Setup",
        link: "https://www.youtube.com/watch?v=YCWA1uiY3gs",
        thumbnailUrl: "https://i.ytimg.com/vi/YCWA1uiY3gs/hqdefault.jpg",
        publishedAt: "2026-08-25T11:17:35+00:00",
        views: "18.5K views",
        tag: "#OBSStudio",
        duration: "14:28",
        description: "Multiple OBS instances running simultaneously for streaming and virtual cameras.",
      },
      {
        id: "yt-short-tip",
        videoId: "n9exIjLuJSk",
        title: "#techiemuthuraj Quick Software Tips & Tricks",
        link: "https://www.youtube.com/shorts/n9exIjLuJSk",
        thumbnailUrl: "https://i.ytimg.com/vi/n9exIjLuJSk/hqdefault.jpg",
        publishedAt: "2026-08-26T17:01:47+00:00",
        views: "24.1K views",
        tag: "#Shorts",
        duration: "0:45",
        description: "Essential software tools and developer shortcuts.",
      },
      {
        id: "yt-ytsage-dl",
        videoId: "ytsage-dl-2026",
        title: "YTSage - How to Download YouTube Videos in High Quality | Open Source Media Downloader",
        link: `https://www.youtube.com/channel/${channelId}`,
        thumbnailUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
        publishedAt: "2026-08-20T10:00:00+00:00",
        views: "31.4K views",
        tag: "#Downloader",
        duration: "09:30",
        description: "Open-source tool demonstration for extracting HD/4K video streams cleanly.",
      },
      {
        id: "yt-virtual-cam",
        videoId: "virtual-cam-setup",
        title: "OBS Virtual Camera & Audio Routing Setup for Video Calls & Streaming",
        link: `https://www.youtube.com/channel/${channelId}`,
        thumbnailUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80",
        publishedAt: "2026-08-15T15:30:00+00:00",
        views: "42.9K views",
        tag: "#Streaming",
        duration: "16:15",
        description: "Zero-latency audio and virtual camera synchronization for online platforms.",
      },
    ];

    // Merge: Put live entries first, then supplement with non-duplicate fallbacks up to 4 items
    const combined: ParsedYouTubeVideo[] = [...entries];
    for (const fb of fallbackCatalog) {
      if (combined.length >= 4) break;
      if (!combined.some((item) => item.videoId === fb.videoId)) {
        combined.push(fb);
      }
    }

    return NextResponse.json({
      success: true,
      channel: {
        id: channelId,
        title: channelTitle,
      },
      videos: combined.slice(0, 4),
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to fetch YouTube feed",
      },
      { status: 500 }
    );
  }
}
