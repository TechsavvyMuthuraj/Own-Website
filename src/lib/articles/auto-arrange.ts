export interface AutoArrangeResult {
  content: string;
  changesMade: string[];
}

/**
 * Extracts a YouTube Video ID from any standard YouTube URL
 */
export function extractYouTubeId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

/**
 * Auto-arranges and cleans editorial content:
 * - Formats headings and spacing
 * - Normalizes code blocks
 * - Converts raw YouTube links into native video embeds
 * - Auto-links raw URLs
 * - Cleans multiple blank lines
 */
export function autoArrangeArticleContent(rawContent: string): AutoArrangeResult {
  if (!rawContent || !rawContent.trim()) {
    return { content: "", changesMade: [] };
  }

  const changesMade: string[] = [];
  let content = rawContent;

  // 1. Normalize line endings (CRLF -> LF)
  content = content.replace(/\r\n/g, "\n");

  // 2. Protect existing code blocks from being modified by text replacements
  const codeBlocks: string[] = [];
  content = content.replace(/```[\s\S]*?```/g, (match) => {
    codeBlocks.push(match);
    return `__CODE_BLOCK_PLACEHOLDER_${codeBlocks.length - 1}__`;
  });

  // 3. Convert standalone YouTube URLs to YouTube Embed Blocks
  const ytRegex = /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})(?:\S+)?$/gim;
  const ytMatches = content.match(ytRegex);
  if (ytMatches && ytMatches.length > 0) {
    content = content.replace(ytRegex, (url) => {
      const id = extractYouTubeId(url.trim());
      if (id) {
        changesMade.push(`Converted YouTube URL into responsive video embed: ${id}`);
        return `\n[youtube:${id}]\n`;
      }
      return url;
    });
  }

  // 4. Auto-convert bare URLs into markdown links (if not already part of a markdown link)
  const urlRegex = /(?<![(\[])(https?:\/\/[^\s<>)"]+)(?![)\]])/g;
  let urlConversions = 0;
  content = content.replace(urlRegex, (url) => {
    // Skip if it's already a youtube embed token or code block placeholder
    if (url.includes("__CODE_BLOCK_") || url.startsWith("[youtube:")) return url;
    urlConversions++;
    return `[${url}](${url})`;
  });
  if (urlConversions > 0) {
    changesMade.push(`Auto-linked ${urlConversions} bare URL(s)`);
  }

  // 5. Normalize Headings: ensure a space after '#'
  const headingFixRegex = /^(#{1,6})([^#\s])/gm;
  if (headingFixRegex.test(content)) {
    content = content.replace(headingFixRegex, "$1 $2");
    changesMade.push("Normalized markdown heading spaces");
  }

  // 6. Normalize unordered lists (- item or * item)
  content = content.replace(/^([*•])\s+/gm, "- ");

  // 7. Remove excessive blank lines (more than 2 consecutive newlines -> 2 newlines)
  const initialNewlines = content;
  content = content.replace(/\n{3,}/g, "\n\n");
  if (content !== initialNewlines) {
    changesMade.push("Cleaned redundant blank lines and paragraph spacing");
  }

  // 8. Restore code blocks
  content = content.replace(/__CODE_BLOCK_PLACEHOLDER_(\d+)__/g, (_, idx) => {
    return codeBlocks[parseInt(idx, 10)] || "";
  });

  // 9. Trim outer whitespace
  content = content.trim();

  if (changesMade.length === 0) {
    changesMade.push("Content is already cleanly structured and formatted");
  }

  return {
    content,
    changesMade,
  };
}
