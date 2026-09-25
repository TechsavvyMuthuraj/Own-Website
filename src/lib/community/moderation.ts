export const COMMUNITY_TIMEOUT_DURATION_MS = 30 * 1000; // 30 seconds

// Approved safe domains for sharing links in the community
const APPROVED_DOMAINS = [
  "techsavvymuthuraj.dev",
  "www.techsavvymuthuraj.dev",
  "localhost",
  "youtube.com",
  "www.youtube.com",
  "youtu.be",
  "github.com",
  "www.github.com",
  "google.com",
  "drive.google.com",
  "imdb.com",
  "www.imdb.com",
  "wikipedia.org",
  "en.wikipedia.org",
];

// Blocked abusive words and toxic phrases (case-insensitive)
const ABUSIVE_PATTERNS: RegExp[] = [
  /\b(fuck|shit|asshole|bitch|bastard|dick|pussy|cunt|slut|whore|motherfucker|fucker)\b/i,
  /\b(tholi|thevidiya|ommala|sunni|punda|poolu|kena|otha|thevidiya)\b/i,
  /\b(scam|phishing|free\s*crypto|earn\s*\$|make\s*money\s*fast|click\s*here\s*for\s*free|free\s*gift\s*card)\b/i,
  /\b(hack\s*account|telegram\s*bot|telegram\s*dm|leak\s*video|porn|nude|sex)\b/i,
];

// Regex to extract URLs from text
const URL_REGEX = /(?:https?:\/\/|www\.)[^\s/$.?#].[^\s]*/gi;

export interface ModerationResult {
  isClean: boolean;
  blockedReason?: string;
  hasAbusiveLanguage?: boolean;
  hasSuspiciousLink?: boolean;
}

/**
 * Validates text against scam links and abusive profanity.
 * If prohibited, returns false with the specific reason.
 */
export function moderateText(text: string): ModerationResult {
  const trimmed = text.trim();
  if (!trimmed) {
    return { isClean: true };
  }

  // 1. Check for abusive or prohibited words
  for (const pattern of ABUSIVE_PATTERNS) {
    if (pattern.test(trimmed)) {
      return {
        isClean: false,
        hasAbusiveLanguage: true,
        blockedReason: "Message blocked: Abusive, profane, or prohibited language detected.",
      };
    }
  }

  // 2. Check for unknown/suspicious links
  const extractedUrls = trimmed.match(URL_REGEX);
  if (extractedUrls && extractedUrls.length > 0) {
    for (const rawUrl of extractedUrls) {
      try {
        const normalized = rawUrl.startsWith("http") ? rawUrl : `https://${rawUrl}`;
        const urlObj = new URL(normalized);
        const hostname = urlObj.hostname.toLowerCase();

        const isSafe = APPROVED_DOMAINS.some(
          (safe) => hostname === safe || hostname.endsWith(`.${safe}`)
        );

        if (!isSafe) {
          return {
            isClean: false,
            hasSuspiciousLink: true,
            blockedReason: `Message blocked: Unverified or suspicious external link (${hostname}) detected. Only approved verified links are permitted.`,
          };
        }
      } catch {
        return {
          isClean: false,
          hasSuspiciousLink: true,
          blockedReason: "Message blocked: Malformed or unverified link detected.",
        };
      }
    }
  }

  // 3. Check for telegram scam redirects (e.g. t.me/...)
  if (/(?:t\.me\/|bit\.ly\/|tinyurl\.com\/|goo\.by\/)/i.test(trimmed)) {
    return {
      isClean: false,
      hasSuspiciousLink: true,
      blockedReason: "Message blocked: URL shorteners and unverified redirect links are prohibited.",
    };
  }

  return { isClean: true };
}
