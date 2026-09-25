/**
 * Comprehensive 200+ Google Fonts Typography Catalog for NammaTech
 * Curated across 6 distinct typographic categories with on-demand dynamic loading.
 */

export type FontCategory =
  | "all"
  | "sans"
  | "serif"
  | "display"
  | "mono"
  | "script"
  | "tech";

export interface FontDefinition {
  name: string;
  category: "sans" | "serif" | "display" | "mono" | "script" | "tech";
  fallback: string;
  sample?: string;
  popular?: boolean;
}

export const FONT_CATEGORIES: { id: FontCategory; label: string; count?: number }[] = [
  { id: "all", label: "All Fonts" },
  { id: "sans", label: "Sans-Serif" },
  { id: "serif", label: "Serif & Editorial" },
  { id: "display", label: "Display & Title" },
  { id: "mono", label: "Monospace & Code" },
  { id: "script", label: "Handwritten & Script" },
  { id: "tech", label: "Cyber & Tech" },
];

export const GOOGLE_FONTS_CATALOG: FontDefinition[] = [
  // ── SANS-SERIF (50 fonts) ──────────────────────────────────────────────────
  { name: "Inter", category: "sans", fallback: "sans-serif", popular: true },
  { name: "Roboto", category: "sans", fallback: "sans-serif", popular: true },
  { name: "Montserrat", category: "sans", fallback: "sans-serif", popular: true },
  { name: "Open Sans", category: "sans", fallback: "sans-serif", popular: true },
  { name: "Poppins", category: "sans", fallback: "sans-serif", popular: true },
  { name: "Lato", category: "sans", fallback: "sans-serif", popular: true },
  { name: "Raleway", category: "sans", fallback: "sans-serif" },
  { name: "Nunito", category: "sans", fallback: "sans-serif" },
  { name: "Rubik", category: "sans", fallback: "sans-serif" },
  { name: "Ubuntu", category: "sans", fallback: "sans-serif" },
  { name: "Work Sans", category: "sans", fallback: "sans-serif" },
  { name: "DM Sans", category: "sans", fallback: "sans-serif", popular: true },
  { name: "Plus Jakarta Sans", category: "sans", fallback: "sans-serif", popular: true },
  { name: "Outfit", category: "sans", fallback: "sans-serif", popular: true },
  { name: "Space Grotesk", category: "sans", fallback: "sans-serif", popular: true },
  { name: "Manrope", category: "sans", fallback: "sans-serif", popular: true },
  { name: "Sora", category: "sans", fallback: "sans-serif" },
  { name: "Syne", category: "sans", fallback: "sans-serif" },
  { name: "Urbanist", category: "sans", fallback: "sans-serif" },
  { name: "Lexend", category: "sans", fallback: "sans-serif" },
  { name: "Figtree", category: "sans", fallback: "sans-serif" },
  { name: "Quicksand", category: "sans", fallback: "sans-serif" },
  { name: "Public Sans", category: "sans", fallback: "sans-serif" },
  { name: "Albert Sans", category: "sans", fallback: "sans-serif" },
  { name: "Red Hat Display", category: "sans", fallback: "sans-serif" },
  { name: "Barlow", category: "sans", fallback: "sans-serif" },
  { name: "Jost", category: "sans", fallback: "sans-serif" },
  { name: "Kanit", category: "sans", fallback: "sans-serif" },
  { name: "Heebo", category: "sans", fallback: "sans-serif" },
  { name: "Mulish", category: "sans", fallback: "sans-serif" },
  { name: "Overpass", category: "sans", fallback: "sans-serif" },
  { name: "Titillium Web", category: "sans", fallback: "sans-serif" },
  { name: "Assistant", category: "sans", fallback: "sans-serif" },
  { name: "Karla", category: "sans", fallback: "sans-serif" },
  { name: "Chivo", category: "sans", fallback: "sans-serif" },
  { name: "Epilogue", category: "sans", fallback: "sans-serif" },
  { name: "Hanken Grotesk", category: "sans", fallback: "sans-serif" },
  { name: "Instrument Sans", category: "sans", fallback: "sans-serif" },
  { name: "Archivo", category: "sans", fallback: "sans-serif" },
  { name: "Bricolage Grotesque", category: "sans", fallback: "sans-serif" },
  { name: "General Sans", category: "sans", fallback: "sans-serif" },
  { name: "Onest", category: "sans", fallback: "sans-serif" },
  { name: "Be Vietnam Pro", category: "sans", fallback: "sans-serif" },
  { name: "Cabin", category: "sans", fallback: "sans-serif" },
  { name: "Catamaran", category: "sans", fallback: "sans-serif" },
  { name: "Exo", category: "sans", fallback: "sans-serif" },
  { name: "Maven Pro", category: "sans", fallback: "sans-serif" },
  { name: "Noto Sans", category: "sans", fallback: "sans-serif" },
  { name: "Teko", category: "sans", fallback: "sans-serif" },
  { name: "Yantramanav", category: "sans", fallback: "sans-serif" },

  // ── SERIF & EDITORIAL (40 fonts) ───────────────────────────────────────────
  { name: "Playfair Display", category: "serif", fallback: "serif", popular: true },
  { name: "Merriweather", category: "serif", fallback: "serif", popular: true },
  { name: "Lora", category: "serif", fallback: "serif", popular: true },
  { name: "PT Serif", category: "serif", fallback: "serif" },
  { name: "EB Garamond", category: "serif", fallback: "serif", popular: true },
  { name: "Cormorant Garamond", category: "serif", fallback: "serif", popular: true },
  { name: "Cinzel", category: "serif", fallback: "serif", popular: true },
  { name: "Bodoni Moda", category: "serif", fallback: "serif" },
  { name: "Spectral", category: "serif", fallback: "serif" },
  { name: "Newsreader", category: "serif", fallback: "serif" },
  { name: "Alegreya", category: "serif", fallback: "serif" },
  { name: "Bitter", category: "serif", fallback: "serif" },
  { name: "Castoro", category: "serif", fallback: "serif" },
  { name: "Fraunces", category: "serif", fallback: "serif" },
  { name: "Prata", category: "serif", fallback: "serif" },
  { name: "Libre Baskerville", category: "serif", fallback: "serif", popular: true },
  { name: "Marcellus", category: "serif", fallback: "serif" },
  { name: "DM Serif Display", category: "serif", fallback: "serif", popular: true },
  { name: "DM Serif Text", category: "serif", fallback: "serif" },
  { name: "Noto Serif", category: "serif", fallback: "serif" },
  { name: "Arvo", category: "serif", fallback: "serif" },
  { name: "Crimson Text", category: "serif", fallback: "serif" },
  { name: "Crimson Pro", category: "serif", fallback: "serif" },
  { name: "Vollkorn", category: "serif", fallback: "serif" },
  { name: "Cardo", category: "serif", fallback: "serif" },
  { name: "Faustina", category: "serif", fallback: "serif" },
  { name: "Bellefair", category: "serif", fallback: "serif" },
  { name: "Rozha One", category: "serif", fallback: "serif" },
  { name: "Italianno", category: "serif", fallback: "serif" },
  { name: "Cormorant", category: "serif", fallback: "serif" },
  { name: "Domine", category: "serif", fallback: "serif" },
  { name: "Besley", category: "serif", fallback: "serif" },
  { name: "Zilla Slab", category: "serif", fallback: "serif" },
  { name: "Petrona", category: "serif", fallback: "serif" },
  { name: "Frank Ruhl Libre", category: "serif", fallback: "serif" },
  { name: "Gilda Display", category: "serif", fallback: "serif" },
  { name: "Old Standard TT", category: "serif", fallback: "serif" },
  { name: "Sorts Mill Goudy", category: "serif", fallback: "serif" },
  { name: "Taviraj", category: "serif", fallback: "serif" },
  { name: "Vidaloka", category: "serif", fallback: "serif" },

  // ── DISPLAY & TITLE (45 fonts) ─────────────────────────────────────────────
  { name: "Cinzel Decorative", category: "display", fallback: "serif", popular: true },
  { name: "Bebas Neue", category: "display", fallback: "sans-serif", popular: true },
  { name: "Righteous", category: "display", fallback: "cursive", popular: true },
  { name: "Abril Fatface", category: "display", fallback: "serif", popular: true },
  { name: "Bungee", category: "display", fallback: "sans-serif" },
  { name: "Faster One", category: "display", fallback: "cursive" },
  { name: "Monoton", category: "display", fallback: "cursive", popular: true },
  { name: "Megrim", category: "display", fallback: "cursive" },
  { name: "Poiret One", category: "display", fallback: "cursive" },
  { name: "Unbounded", category: "display", fallback: "sans-serif", popular: true },
  { name: "Shrikhand", category: "display", fallback: "cursive" },
  { name: "Ultra", category: "display", fallback: "serif" },
  { name: "Staatliches", category: "display", fallback: "sans-serif" },
  { name: "Anton", category: "display", fallback: "sans-serif", popular: true },
  { name: "Alfa Slab One", category: "display", fallback: "serif" },
  { name: "Bangers", category: "display", fallback: "cursive" },
  { name: "Lobster", category: "display", fallback: "cursive", popular: true },
  { name: "Comfortaa", category: "display", fallback: "cursive" },
  { name: "Fredoka", category: "display", fallback: "sans-serif" },
  { name: "Paytone One", category: "display", fallback: "sans-serif" },
  { name: "Sigmar", category: "display", fallback: "cursive" },
  { name: "Passion One", category: "display", fallback: "cursive" },
  { name: "Changa One", category: "display", fallback: "cursive" },
  { name: "Rammetto One", category: "display", fallback: "cursive" },
  { name: "Titan One", category: "display", fallback: "cursive" },
  { name: "Racing Sans One", category: "display", fallback: "sans-serif" },
  { name: "Fugaz One", category: "display", fallback: "cursive" },
  { name: "Ruslan Display", category: "display", fallback: "sans-serif" },
  { name: "Rye", category: "display", fallback: "serif" },
  { name: "Sancreek", category: "display", fallback: "serif" },
  { name: "Shojumaru", category: "display", fallback: "serif" },
  { name: "Ribeye", category: "display", fallback: "serif" },
  { name: "Modern Antiqua", category: "display", fallback: "serif" },
  { name: "Plaster", category: "display", fallback: "cursive" },
  { name: "Major Mono Display", category: "display", fallback: "monospace" },
  { name: "Vast Shadow", category: "display", fallback: "serif" },
  { name: "Bungee Shade", category: "display", fallback: "cursive" },
  { name: "Creepster", category: "display", fallback: "cursive" },
  { name: "Fascinate", category: "display", fallback: "cursive" },
  { name: "Geostar", category: "display", fallback: "cursive" },
  { name: "Knewave", category: "display", fallback: "cursive" },
  { name: "Kumar One", category: "display", fallback: "cursive" },
  { name: "Londrina Solid", category: "display", fallback: "cursive" },
  { name: "Modak", category: "display", fallback: "cursive" },
  { name: "Poller One", category: "display", fallback: "cursive" },

  // ── MONOSPACE & CODE (30 fonts) ────────────────────────────────────────────
  { name: "Fira Code", category: "mono", fallback: "monospace", popular: true },
  { name: "JetBrains Mono", category: "mono", fallback: "monospace", popular: true },
  { name: "Source Code Pro", category: "mono", fallback: "monospace", popular: true },
  { name: "Space Mono", category: "mono", fallback: "monospace", popular: true },
  { name: "Inconsolata", category: "mono", fallback: "monospace" },
  { name: "Roboto Mono", category: "mono", fallback: "monospace", popular: true },
  { name: "IBM Plex Mono", category: "mono", fallback: "monospace" },
  { name: "Anonymous Pro", category: "mono", fallback: "monospace" },
  { name: "Share Tech Mono", category: "mono", fallback: "monospace" },
  { name: "Nova Mono", category: "mono", fallback: "monospace" },
  { name: "Ubuntu Mono", category: "mono", fallback: "monospace" },
  { name: "Oxygen Mono", category: "mono", fallback: "monospace" },
  { name: "Cousine", category: "mono", fallback: "monospace" },
  { name: "Overpass Mono", category: "mono", fallback: "monospace" },
  { name: "DM Mono", category: "mono", fallback: "monospace" },
  { name: "Red Hat Mono", category: "mono", fallback: "monospace" },
  { name: "Martian Mono", category: "mono", fallback: "monospace" },
  { name: "Victor Mono", category: "mono", fallback: "monospace" },
  { name: "Azeret Mono", category: "mono", fallback: "monospace" },
  { name: "Fragment Mono", category: "mono", fallback: "monospace" },
  { name: "Cutive Mono", category: "mono", fallback: "monospace" },
  { name: "Spline Sans Mono", category: "mono", fallback: "monospace" },
  { name: "Syne Mono", category: "mono", fallback: "monospace" },
  { name: "Sono", category: "mono", fallback: "monospace" },
  { name: "B612 Mono", category: "mono", fallback: "monospace" },
  { name: "VT323", category: "mono", fallback: "monospace", popular: true },
  { name: "Monofett", category: "mono", fallback: "monospace" },
  { name: "PT Mono", category: "mono", fallback: "monospace" },
  { name: "Xanh Mono", category: "mono", fallback: "monospace" },
  { name: "Nanum Gothic Coding", category: "mono", fallback: "monospace" },

  // ── SCRIPT & HANDWRITTEN (35 fonts) ────────────────────────────────────────
  { name: "Dancing Script", category: "script", fallback: "cursive", popular: true },
  { name: "Pacifico", category: "script", fallback: "cursive", popular: true },
  { name: "Caveat", category: "script", fallback: "cursive", popular: true },
  { name: "Great Vibes", category: "script", fallback: "cursive", popular: true },
  { name: "Sacramento", category: "script", fallback: "cursive" },
  { name: "Satisfy", category: "script", fallback: "cursive" },
  { name: "Kalam", category: "script", fallback: "cursive" },
  { name: "Shadows Into Light", category: "script", fallback: "cursive" },
  { name: "Yellowtail", category: "script", fallback: "cursive" },
  { name: "Alex Brush", category: "script", fallback: "cursive" },
  { name: "Parisienne", category: "script", fallback: "cursive" },
  { name: "Cookie", category: "script", fallback: "cursive" },
  { name: "Indie Flower", category: "script", fallback: "cursive", popular: true },
  { name: "Kaushan Script", category: "script", fallback: "cursive" },
  { name: "Allura", category: "script", fallback: "cursive" },
  { name: "Marck Script", category: "script", fallback: "cursive" },
  { name: "Tangerine", category: "script", fallback: "cursive" },
  { name: "Bad Script", category: "script", fallback: "cursive" },
  { name: "Bilbo Swash Caps", category: "script", fallback: "cursive" },
  { name: "Covered By Your Grace", category: "script", fallback: "cursive" },
  { name: "Damion", category: "script", fallback: "cursive" },
  { name: "Gochi Hand", category: "script", fallback: "cursive" },
  { name: "Gloria Hallelujah", category: "script", fallback: "cursive" },
  { name: "Homemade Apple", category: "script", fallback: "cursive" },
  { name: "Just Another Hand", category: "script", fallback: "cursive" },
  { name: "Kristi", category: "script", fallback: "cursive" },
  { name: "La Belle Aurore", category: "script", fallback: "cursive" },
  { name: "Loved by the King", category: "script", fallback: "cursive" },
  { name: "Meddon", category: "script", fallback: "cursive" },
  { name: "Nothing You Could Do", category: "script", fallback: "cursive" },
  { name: "Patrick Hand", category: "script", fallback: "cursive" },
  { name: "Reenie Beanie", category: "script", fallback: "cursive" },
  { name: "Rock Salt", category: "script", fallback: "cursive" },
  { name: "Walter Turncoat", category: "script", fallback: "cursive" },
  { name: "Zeyada", category: "script", fallback: "cursive" },

  // ── TECH, CYBER & FUTURISTIC (30 fonts) ───────────────────────────────────
  { name: "Orbitron", category: "tech", fallback: "sans-serif", popular: true },
  { name: "Audiowide", category: "tech", fallback: "cursive", popular: true },
  { name: "Michroma", category: "tech", fallback: "sans-serif" },
  { name: "Russo One", category: "tech", fallback: "sans-serif", popular: true },
  { name: "Press Start 2P", category: "tech", fallback: "cursive", popular: true },
  { name: "Silkscreen", category: "tech", fallback: "cursive" },
  { name: "Chakra Petch", category: "tech", fallback: "sans-serif" },
  { name: "Black Ops One", category: "tech", fallback: "cursive" },
  { name: "Electrolize", category: "tech", fallback: "sans-serif" },
  { name: "Bruno Ace", category: "tech", fallback: "sans-serif" },
  { name: "Bruno Ace SC", category: "tech", fallback: "sans-serif" },
  { name: "Quantico", category: "tech", fallback: "sans-serif" },
  { name: "Syne Tactile", category: "tech", fallback: "cursive" },
  { name: "Tourney", category: "tech", fallback: "sans-serif" },
  { name: "Zen Dots", category: "tech", fallback: "cursive" },
  { name: "Goldman", category: "tech", fallback: "cursive" },
  { name: "Jura", category: "tech", fallback: "sans-serif" },
  { name: "Nova Square", category: "tech", fallback: "sans-serif" },
  { name: "Share Tech", category: "tech", fallback: "sans-serif" },
  { name: "Saira Stencil One", category: "tech", fallback: "cursive" },
  { name: "Wallpoet", category: "tech", fallback: "cursive" },
  { name: "Geo", category: "tech", fallback: "sans-serif" },
  { name: "Kelly Slab", category: "tech", fallback: "serif" },
  { name: "DotGothic16", category: "tech", fallback: "sans-serif" },
  { name: "Bungee Hairline", category: "tech", fallback: "sans-serif" },
  { name: "Turret Road", category: "tech", fallback: "sans-serif" },
  { name: "Syncopate", category: "tech", fallback: "sans-serif" },
  { name: "Scada", category: "tech", fallback: "sans-serif" },
  { name: "Oxanium", category: "tech", fallback: "cursive", popular: true },
  { name: "Exo 2", category: "tech", fallback: "sans-serif", popular: true },
];

/**
 * Dynamically loads a Google Font in the browser via an injected link element.
 * Safe to call multiple times for the same font (deduplicates automatically).
 */
export function loadGoogleFont(fontName: string): void {
  if (typeof document === "undefined" || !fontName) return;

  const sanitizedId = `gfont-${fontName.toLowerCase().replace(/[^a-z0-9]/g, "-")}`;
  if (document.getElementById(sanitizedId)) return;

  const link = document.createElement("link");
  link.id = sanitizedId;
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(
    fontName
  )}:wght@400;600;700;900&display=swap`;

  // Fallback if weights fails
  link.onerror = () => {
    link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(
      fontName
    )}&display=swap`;
  };

  document.head.appendChild(link);
}

/**
 * Batch loads multiple Google Fonts
 */
export function loadMultipleGoogleFonts(fontNames: string[]): void {
  fontNames.forEach((name) => {
    if (name) loadGoogleFont(name.trim());
  });
}

/**
 * Extracts article-level base font directive:
 * e.g., <!-- font: Playfair Display --> or [article-font: Inter]
 */
export function extractArticleFont(content: string): string | null {
  if (!content) return null;

  const commentMatch = content.match(/<!--\s*font:\s*([a-zA-Z0-9\s-]+?)\s*-->/i);
  if (commentMatch) return commentMatch[1].trim();

  const tagMatch = content.match(/\[article-font:\s*([a-zA-Z0-9\s-]+?)\]/i);
  if (tagMatch) return tagMatch[1].trim();

  return null;
}

/**
 * Injects or updates the article-level font directive at the top of content.
 */
export function applyArticleFont(content: string, fontName: string): string {
  const directive = `<!-- font: ${fontName} -->`;
  if (!content) return directive + "\n\n";

  if (/<!--\s*font:\s*[a-zA-Z0-9\s-]+?\s*-->/i.test(content)) {
    return content.replace(/<!--\s*font:\s*[a-zA-Z0-9\s-]+?\s*-->/i, directive);
  }

  if (/\[article-font:\s*[a-zA-Z0-9\s-]+?\]/i.test(content)) {
    return content.replace(/\[article-font:\s*[a-zA-Z0-9\s-]+?\]/i, directive);
  }

  return `${directive}\n\n${content}`;
}

/**
 * Extracts all unique font names used in content:
 * from [font:Name] tags and article-level directive.
 */
export function extractUsedFonts(content: string): string[] {
  if (!content) return [];
  const fonts = new Set<string>();

  const baseFont = extractArticleFont(content);
  if (baseFont) fonts.add(baseFont);

  const inlineMatches = content.matchAll(/\[font:\s*([a-zA-Z0-9\s-]+?)\]/gi);
  for (const m of inlineMatches) {
    if (m[1]) fonts.add(m[1].trim());
  }

  const blockMatches = content.matchAll(/:::font\[\s*([a-zA-Z0-9\s-]+?)\s*\]/gi);
  for (const m of blockMatches) {
    if (m[1]) fonts.add(m[1].trim());
  }

  return Array.from(fonts);
}

/**
 * Finds font definition by name (case-insensitive)
 */
export function findFontDefinition(fontName: string): FontDefinition | undefined {
  if (!fontName) return undefined;
  const lower = fontName.toLowerCase().trim();
  return GOOGLE_FONTS_CATALOG.find((f) => f.name.toLowerCase() === lower);
}
