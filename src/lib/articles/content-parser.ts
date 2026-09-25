export interface TocItem {
  id: string;
  text: string;
  level: number;
}

/**
 * Normalizes text to a clean URL-friendly anchor ID
 */
export function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/<[^>]+>/g, "") // strip HTML tags
    .replace(/[^\w\s-]/g, "") // remove special chars
    .trim()
    .replace(/\s+/g, "-");
}

/**
 * Extracts all H1-H4 headings from Markdown or HTML content for the Table of Contents
 */
export function extractHeadings(content: string | null | undefined): TocItem[] {
  if (!content || !content.trim()) return [];

  const items: TocItem[] = [];
  const lines = content.split("\n");
  const seenIds = new Map<string, number>();

  function getUniqueId(base: string): string {
    const count = seenIds.get(base) || 0;
    seenIds.set(base, count + 1);
    return count === 0 ? base : `${base}-${count}`;
  }

  // 1. Check for Markdown Headings (# Heading, ## Heading, etc.)
  for (const line of lines) {
    const mdMatch = line.match(/^(#{1,4})\s+(.+)$/);
    if (mdMatch) {
      const level = mdMatch[1].length;
      const rawText = mdMatch[2].replace(/[*_`]/g, "").trim();
      const baseId = slugifyHeading(rawText) || `heading-${items.length + 1}`;
      const id = getUniqueId(baseId);
      items.push({ id, text: rawText, level });
    }
  }

  // 2. If no Markdown headings found, check for HTML headings (<h1-4>...</h1-4>)
  if (items.length === 0) {
    const htmlHeadingRegex = /<h([1-4])[^>]*>(.*?)<\/h\1>/gi;
    let match: RegExpExecArray | null;
    while ((match = htmlHeadingRegex.exec(content)) !== null) {
      const level = parseInt(match[1], 10);
      const rawText = match[2].replace(/<[^>]+>/g, "").trim();
      if (rawText) {
        const baseId = slugifyHeading(rawText) || `heading-${items.length + 1}`;
        const id = getUniqueId(baseId);
        items.push({ id, text: rawText, level });
      }
    }
  }

  // 3. Fallback: Check for emoji-prefixed section lines
  if (items.length === 0) {
    const emojiHeadingRegex = /^([\p{Extended_Pictographic}\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]\s*.{3,60})$/u;
    for (const line of lines) {
      const trimmed = line.trim();
      if (
        emojiHeadingRegex.test(trimmed) &&
        !trimmed.startsWith("http") &&
        !trimmed.startsWith("[") &&
        !trimmed.endsWith("...")
      ) {
        const baseId = slugifyHeading(trimmed) || `section-${items.length + 1}`;
        const id = getUniqueId(baseId);
        items.push({ id, text: trimmed, level: 2 });
      }
    }
  }

  return items;
}

/**
 * Calculates estimated reading time in minutes and formatted string
 */
export function calculateReadingStats(content: string | null | undefined): {
  wordsCount: number;
  charactersCount: number;
  readingTimeMinutes: number;
  readingTimeText: string;
} {
  if (!content || !content.trim()) {
    return {
      wordsCount: 0,
      charactersCount: 0,
      readingTimeMinutes: 1,
      readingTimeText: "1 min read",
    };
  }

  const cleanText = content.replace(/<[^>]+>/g, " ").replace(/[#*`_~[\]()]/g, "");
  const words = cleanText.trim().split(/\s+/).filter(Boolean);
  const wordsCount = words.length;
  const charactersCount = cleanText.length;
  const readingTimeMinutes = Math.max(1, Math.ceil(wordsCount / 200));

  return {
    wordsCount,
    charactersCount,
    readingTimeMinutes,
    readingTimeText: `${readingTimeMinutes} min read`,
  };
}
