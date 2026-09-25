"use client";

import React, { useState, useEffect } from "react";
import {
  Copy,
  Check,
  ExternalLink,
  Info,
  AlertTriangle,
  Lightbulb,
  ShieldAlert,
  StickyNote,
  Terminal,
  Maximize2,
  X,
  Play,
  Hash,
  Download,
  FileArchive,
  ShieldCheck,
  Sparkles,
  Type,
} from "lucide-react";
import { slugifyHeading } from "@/lib/articles/content-parser";
import {
  extractUsedFonts,
  loadMultipleGoogleFonts,
  findFontDefinition,
} from "@/lib/articles/font-catalog";

interface ArticleContentRendererProps {
  content: string | null | undefined;
  fontSize?: "default" | "medium" | "large";
}

/**
 * Universal Content Engine:
 * Formats Markdown, HTML, Code blocks, Terminal commands, Callout boxes,
 * Image lightboxes, Tables, and YouTube video embeds seamlessly.
 */
export function ArticleContentRenderer({
  content,
  fontSize = "default",
}: ArticleContentRendererProps) {
  const [copiedCodeIndex, setCopiedCodeIndex] = useState<number | null>(null);
  const [lightboxImage, setLightboxImage] = useState<{ src: string; alt: string } | null>(null);
  const [copiedAnchor, setCopiedAnchor] = useState<string | null>(null);

  // Automatically load all fonts used in the content
  useEffect(() => {
    if (!content) return;
    const fonts = extractUsedFonts(content);
    if (fonts.length > 0) {
      loadMultipleGoogleFonts(fonts);
    }
  }, [content]);

  if (!content || !content.trim()) {
    return (
      <div className="p-12 rounded-3xl border border-dashed border-[var(--border)] text-center text-sm text-[var(--muted-foreground)]">
        Content is being prepared by the NammaTech editorial team. Check back soon!
      </div>
    );
  }

  const handleCopyCode = async (codeText: string, index: number) => {
    try {
      await navigator.clipboard.writeText(codeText);
      setCopiedCodeIndex(index);
      setTimeout(() => setCopiedCodeIndex(null), 2000);
    } catch {
      // Fallback
    }
  };

  const handleCopyAnchor = async (anchorId: string) => {
    try {
      const url = `${window.location.origin}${window.location.pathname}#${anchorId}`;
      await navigator.clipboard.writeText(url);
      setCopiedAnchor(anchorId);
      setTimeout(() => setCopiedAnchor(null), 2000);
    } catch {
      // Ignore
    }
  };

  const fontScaleClass =
    fontSize === "large"
      ? "text-lg leading-relaxed sm:text-xl sm:leading-loose"
      : fontSize === "medium"
      ? "text-base leading-relaxed sm:text-lg sm:leading-relaxed"
      : "text-sm leading-relaxed sm:text-base sm:leading-relaxed";

  // Check if content is primarily legacy HTML
  const isHtml = content.trim().startsWith("<") && content.includes("</");

  if (isHtml) {
    return (
      <div className={`prose dark:prose-invert max-w-none ${fontScaleClass}`}>
        <div
          dangerouslySetInnerHTML={{ __html: content }}
          className="article-html-body space-y-4"
        />
      </div>
    );
  }

  // Parse Markdown with our custom rich block engine
  const blocks = parseMarkdownBlocks(content);

  return (
    <>
      <div className={`article-content-body space-y-6 ${fontScaleClass} text-[var(--foreground)]/90`}>
        {blocks.map((block, idx) => {
          switch (block.type) {
            case "heading": {
              const anchor = slugifyHeading(block.text);
              const HeadingTag = `h${block.level}` as keyof React.JSX.IntrinsicElements;

              const headingStyles: Record<number, string> = {
                1: "text-2xl sm:text-3xl font-black text-[var(--foreground)] pt-6 pb-2 tracking-tight",
                2: "text-xl sm:text-2xl font-extrabold text-[var(--foreground)] pt-5 pb-1 tracking-tight border-b border-[var(--border)]/60",
                3: "text-lg sm:text-xl font-bold text-[var(--foreground)] pt-4 pb-1",
                4: "text-base sm:text-lg font-semibold text-[var(--foreground)] pt-3 pb-1",
                5: "text-sm sm:text-base font-semibold text-[var(--foreground)] pt-2",
                6: "text-xs sm:text-sm font-semibold uppercase tracking-wider text-[var(--muted-foreground)] pt-2",
              };

              return (
                <div key={idx} id={anchor} className="group relative scroll-mt-24">
                  <HeadingTag className={`${headingStyles[block.level] || headingStyles[2]} flex items-center gap-2`}>
                    <span>{block.text}</span>
                    <button
                      type="button"
                      onClick={() => handleCopyAnchor(anchor)}
                      title="Copy link to this section"
                      aria-label="Copy section link"
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-[var(--muted-foreground)] hover:text-amber-500 rounded-md cursor-pointer"
                    >
                      {copiedAnchor === anchor ? (
                        <Check className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Hash className="w-4 h-4" />
                      )}
                    </button>
                  </HeadingTag>
                </div>
              );
            }

            case "code": {
              const isTerminal = ["bash", "sh", "zsh", "shell", "terminal", "powershell"].includes(
                (block.lang || "").toLowerCase()
              );
              const lines = block.code.split("\n");

              return (
                <div
                  key={idx}
                  className="my-5 rounded-2xl overflow-hidden border border-[var(--border)] bg-neutral-950 shadow-xl"
                >
                  {/* Code Block Header */}
                  <div className="flex items-center justify-between px-4 py-2.5 bg-neutral-900/90 border-b border-neutral-800/80 text-xs">
                    <div className="flex items-center gap-2">
                      {isTerminal ? (
                        <div className="flex items-center gap-1.5 mr-2">
                          <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                          <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
                          <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                        </div>
                      ) : null}
                      <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-amber-500/90">
                        {block.lang || (isTerminal ? "TERMINAL" : "CODE")}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopyCode(block.code, idx)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white text-[11px] font-medium transition-colors cursor-pointer"
                      title="Copy snippet"
                    >
                      {copiedCodeIndex === idx ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400 font-semibold">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Code Block Content */}
                  <div className="overflow-x-auto p-4 text-xs sm:text-sm font-mono leading-relaxed text-neutral-200">
                    <pre className="grid grid-cols-[auto_1fr] gap-x-4">
                      <span className="select-none text-neutral-600 text-right pr-2">
                        {lines.map((_: string, i: number) => (
                          <span key={i} className="block leading-relaxed">
                            {i + 1}
                          </span>
                        ))}
                      </span>
                      <code>
                        {lines.map((line: string, i: number) => (
                          <span key={i} className="block leading-relaxed">
                            {isTerminal && line.trim() && !line.startsWith("#") ? (
                              <span className="text-emerald-400 select-none mr-2 font-bold">$</span>
                            ) : null}
                            {line || "\u00A0"}
                          </span>
                        ))}
                      </code>
                    </pre>
                  </div>
                </div>
              );
            }

            case "callout": {
              const calloutStyles: Record<
                string,
                { bg: string; border: string; text: string; icon: React.ReactNode; label: string }
              > = {
                tip: {
                  bg: "bg-emerald-500/10",
                  border: "border-emerald-500/30",
                  text: "text-emerald-400",
                  icon: <Lightbulb className="w-5 h-5 text-emerald-400" />,
                  label: "PRO TIP",
                },
                warning: {
                  bg: "bg-amber-500/10",
                  border: "border-amber-500/30",
                  text: "text-amber-400",
                  icon: <AlertTriangle className="w-5 h-5 text-amber-400" />,
                  label: "WARNING",
                },
                danger: {
                  bg: "bg-rose-500/10",
                  border: "border-rose-500/30",
                  text: "text-rose-400",
                  icon: <ShieldAlert className="w-5 h-5 text-rose-400" />,
                  label: "DANGER",
                },
                note: {
                  bg: "bg-blue-500/10",
                  border: "border-blue-500/30",
                  text: "text-blue-400",
                  icon: <StickyNote className="w-5 h-5 text-blue-400" />,
                  label: "NOTE",
                },
                info: {
                  bg: "bg-cyan-500/10",
                  border: "border-cyan-500/30",
                  text: "text-cyan-400",
                  icon: <Info className="w-5 h-5 text-cyan-400" />,
                  label: "INFORMATION",
                },
              };

              const style = calloutStyles[block.variant] || calloutStyles.info;

              return (
                <div
                  key={idx}
                  className={`my-4 p-4 sm:p-5 rounded-2xl border ${style.border} ${style.bg} space-y-2`}
                >
                  <div className="flex items-center gap-2">
                    {style.icon}
                    <span className={`text-[11px] font-black uppercase tracking-wider ${style.text}`}>
                      {style.label}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-[var(--foreground)]/90 leading-relaxed pl-7 whitespace-pre-line">
                    {block.text}
                  </p>
                </div>
              );
            }

            case "quote": {
              return (
                <blockquote
                  key={idx}
                  className="my-5 pl-5 border-l-4 border-amber-500 italic text-[var(--foreground)]/80 bg-amber-500/5 py-3 pr-4 rounded-r-2xl"
                >
                  <p className="leading-relaxed">{block.text}</p>
                  {block.author && (
                    <cite className="block text-xs font-semibold text-amber-500 not-italic mt-2">
                      — {block.author}
                    </cite>
                  )}
                </blockquote>
              );
            }

            case "youtube": {
              return (
                <div key={idx} className="my-6 rounded-2xl overflow-hidden border border-[var(--border)] shadow-2xl bg-neutral-950">
                  <div className="relative aspect-video w-full">
                    <iframe
                      src={`https://www.youtube-nocookie.com/embed/${block.id}?rel=0`}
                      title="YouTube video player"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      className="absolute inset-0 w-full h-full border-0"
                    />
                  </div>
                </div>
              );
            }

            case "download": {
              return (
                <div
                  key={idx}
                  className="my-6 rounded-3xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-neutral-900/90 to-neutral-950 p-5 sm:p-6 shadow-xl relative overflow-hidden group hover:border-amber-500/50 transition-all"
                >
                  <div className="absolute -top-12 -right-12 w-36 h-36 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 relative z-10">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-500 flex items-center justify-center shrink-0 shadow-md">
                        <FileArchive className="w-6 h-6 animate-pulse" />
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30">
                            {block.fileType || "RESOURCE"}
                          </span>
                          <span className="text-[11px] font-mono text-neutral-400">
                            {block.size}
                          </span>
                        </div>

                        <h4 className="text-base font-bold text-neutral-100 tracking-tight">
                          {block.title}
                        </h4>

                        <p className="text-xs text-neutral-400 flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Verified NammaTech resource • Free direct download</span>
                        </p>
                      </div>
                    </div>

                    <a
                      href={block.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                      className="inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-neutral-950 font-black text-xs transition-all shadow-lg shadow-amber-500/20 active:scale-95 shrink-0 cursor-pointer"
                    >
                      <Download className="w-4 h-4 stroke-[3]" />
                      <span>Download Resource</span>
                    </a>
                  </div>
                </div>
              );
            }

            case "image": {
              return (
                <figure key={idx} className="my-6 space-y-2">
                  <div
                    onClick={() => setLightboxImage({ src: block.src, alt: block.alt || "Article illustration" })}
                    className="group relative rounded-2xl overflow-hidden border border-[var(--border)] bg-neutral-950 cursor-pointer shadow-lg hover:border-amber-500/40 transition-colors"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={block.src}
                      alt={block.alt || "Article illustration"}
                      loading="lazy"
                      className="w-full max-h-[500px] object-cover group-hover:scale-[1.01] transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-neutral-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="p-2 rounded-xl bg-neutral-900/80 text-white backdrop-blur-md text-xs font-semibold flex items-center gap-1.5 shadow-lg">
                        <Maximize2 className="w-3.5 h-3.5" />
                        <span>Click to expand</span>
                      </span>
                    </div>
                  </div>
                  {block.alt && (
                    <figcaption className="text-center text-xs text-[var(--muted-foreground)] font-medium">
                      {block.alt}
                    </figcaption>
                  )}
                </figure>
              );
            }

            case "table": {
              return (
                <div key={idx} className="my-6 rounded-2xl border border-[var(--border)] overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs sm:text-sm border-collapse">
                      <thead>
                        <tr className="bg-[var(--secondary)]/80 border-b border-[var(--border)] text-[var(--foreground)]">
                          {block.headers.map((h: string, i: number) => (
                            <th key={i} className="px-4 py-3 font-bold uppercase tracking-wider text-[11px]">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--border)]/60 bg-[var(--card)]/50">
                        {block.rows.map((row: string[], rIdx: number) => (
                          <tr key={rIdx} className="hover:bg-[var(--secondary)]/40 transition-colors">
                            {row.map((cell: string, cIdx: number) => (
                              <td key={cIdx} className="px-4 py-3 text-[var(--foreground)]/85">
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            }

            case "list": {
              return (
                <ul key={idx} className="my-3 space-y-2 list-none pl-1">
                  {block.items.map((item: string, i: number) => {
                    const isTask = item.startsWith("[ ] ") || item.startsWith("[x] ");
                    const isChecked = item.startsWith("[x] ");
                    const text = isTask ? item.slice(4) : item;

                    return (
                      <li key={i} className="flex items-start gap-2.5">
                        {isTask ? (
                          <span
                            className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center text-[10px] border flex-shrink-0 ${
                              isChecked
                                ? "bg-amber-500 border-amber-500 text-neutral-950"
                                : "border-[var(--border)] bg-[var(--secondary)]"
                            }`}
                          >
                            {isChecked ? <Check className="w-3 h-3 stroke-[3]" /> : null}
                          </span>
                        ) : (
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 flex-shrink-0" />
                        )}
                        <span className={isChecked ? "line-through text-[var(--muted-foreground)]" : ""}>
                          {renderInlineMarkdown(text)}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              );
            }

            case "divider": {
              return <hr key={idx} className="my-8 border-[var(--border)]" />;
            }

            case "font-block": {
              const def = findFontDefinition(block.fontName);
              const fallback = def?.fallback || "sans-serif";
              return (
                <div
                  key={idx}
                  style={{ fontFamily: `'${block.fontName}', ${fallback}` }}
                  className="p-5 sm:p-6 my-4 rounded-2xl border border-amber-500/25 bg-amber-500/[0.04] space-y-2 relative overflow-hidden"
                >
                  <div className="flex items-center gap-1.5 text-[10px] uppercase font-mono tracking-wider text-amber-500/80 font-bold select-none">
                    <Sparkles className="w-3 h-3" />
                    <span>Typography: {block.fontName}</span>
                  </div>
                  <div className="text-base sm:text-lg leading-relaxed">
                    {renderInlineMarkdown(block.text)}
                  </div>
                </div>
              );
            }

            case "paragraph":
            default: {
              return (
                <p key={idx} className="leading-relaxed">
                  {renderInlineMarkdown(block.text)}
                </p>
              );
            }
          }
        })}
      </div>

      {/* Lightbox Modal for Fullscreen Image Zoom */}
      {lightboxImage && (
        <div
          onClick={() => setLightboxImage(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out animate-in fade-in duration-200"
        >
          <button
            type="button"
            onClick={() => setLightboxImage(null)}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="Close"
          >
            <X className="w-6 h-6" />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightboxImage.src}
            alt={lightboxImage.alt}
            className="max-w-[90vw] max-h-[90vh] object-contain rounded-2xl shadow-2xl"
          />
        </div>
      )}
    </>
  );
}

/**
 * Inline markdown parser: fonts, **bold**, *italic*, `inline code`, [link](url)
 */
function renderInlineMarkdown(text: string): React.ReactNode {
  if (!text) return "";

  // Check if text contains inline [font:FontName]...[/font] tags
  const fontRegex = /\[font:\s*([a-zA-Z0-9\s-]+?)\]([\s\S]*?)\[\/font\]/gi;
  if (fontRegex.test(text)) {
    fontRegex.lastIndex = 0;
    const fontNodes: React.ReactNode[] = [];
    let lastIdx = 0;
    let match: RegExpExecArray | null;

    while ((match = fontRegex.exec(text)) !== null) {
      if (match.index > lastIdx) {
        fontNodes.push(renderBaseInlineMarkdown(text.substring(lastIdx, match.index)));
      }
      const fontName = match[1].trim();
      const innerText = match[2];
      const def = findFontDefinition(fontName);
      const fallback = def?.fallback || "sans-serif";

      fontNodes.push(
        <span
          key={`font-${match.index}`}
          style={{ fontFamily: `'${fontName}', ${fallback}` }}
          className="inline-font-styled font-normal"
        >
          {renderBaseInlineMarkdown(innerText)}
        </span>
      );
      lastIdx = fontRegex.lastIndex;
    }

    if (lastIdx < text.length) {
      fontNodes.push(renderBaseInlineMarkdown(text.substring(lastIdx)));
    }

    return <>{fontNodes}</>;
  }

  return renderBaseInlineMarkdown(text);
}

function renderBaseInlineMarkdown(text: string): React.ReactNode {
  if (!text) return "";

  // Split by inline code first to preserve backticks
  const parts = text.split(/(`[^`]+`)/g);

  return parts.map((part, i) => {
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={i}
          className="px-1.5 py-0.5 rounded bg-[var(--secondary)] text-amber-500 font-mono text-xs border border-[var(--border)] font-semibold"
        >
          {part.slice(1, -1)}
        </code>
      );
    }

    // Replace Markdown links [text](url)
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const subParts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = linkRegex.exec(part)) !== null) {
      if (match.index > lastIndex) {
        subParts.push(part.substring(lastIndex, match.index));
      }
      const linkText = match[1];
      const linkUrl = match[2];
      const isExternal = linkUrl.startsWith("http");

      subParts.push(
        <a
          key={`${i}-${match.index}`}
          href={linkUrl}
          target={isExternal ? "_blank" : undefined}
          rel={isExternal ? "noopener noreferrer" : undefined}
          className="text-amber-500 hover:text-amber-400 underline underline-offset-4 font-medium inline-flex items-center gap-0.5"
        >
          <span>{linkText}</span>
          {isExternal && <ExternalLink className="w-3 h-3 inline-block ml-0.5 opacity-80" />}
        </a>
      );
      lastIndex = linkRegex.lastIndex;
    }

    if (lastIndex < part.length) {
      subParts.push(part.substring(lastIndex));
    }

    if (subParts.length > 0) {
      return (
        <span key={i}>
          {subParts.map((sp, spIdx) =>
            typeof sp === "string" ? (
              <span
                key={spIdx}
                dangerouslySetInnerHTML={{ __html: formatBoldAndItalic(sp) }}
              />
            ) : (
              sp
            )
          )}
        </span>
      );
    }

    return (
      <span
        key={i}
        dangerouslySetInnerHTML={{
          __html: formatBoldAndItalic(part),
        }}
      />
    );
  });
}

function formatBoldAndItalic(str: string): string {
  if (!str) return "";
  return str
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-[var(--foreground)]">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="italic text-[var(--foreground)]/80">$1</em>');
}

/**
 * Parses markdown into structured render blocks
 */
function parseMarkdownBlocks(rawText: string): any[] {
  const lines = rawText.split("\n");
  const blocks: any[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // 1. YouTube embed token [youtube:ID] or raw YouTube link
    const trimmedLine = line.trim();
    const ytTokenMatch = trimmedLine.match(/^\[youtube:([a-zA-Z0-9_-]{11})\]$/i);
    if (ytTokenMatch) {
      blocks.push({ type: "youtube", id: ytTokenMatch[1] });
      i++;
      continue;
    }

    const rawYtMatch = trimmedLine.match(/^(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|shorts\/|watch\?v=|watch\?.+&v=))([\w-]{11})(?:[^\s]*)?$/i);
    if (rawYtMatch) {
      blocks.push({ type: "youtube", id: rawYtMatch[1] });
      i++;
      continue;
    }

    // 1b. Download Resource Token [download:Title|URL|Size|Type] or :::download block
    const downloadTokenMatch = trimmedLine.match(/^\[download:(.+?)\|(.+?)(?:\|(.+?))?(?:\|(.+?))?\]$/i);
    if (downloadTokenMatch) {
      blocks.push({
        type: "download",
        title: downloadTokenMatch[1].trim(),
        url: downloadTokenMatch[2].trim(),
        size: downloadTokenMatch[3]?.trim() || "Verified Download",
        fileType: downloadTokenMatch[4]?.trim() || "ZIP",
      });
      i++;
      continue;
    }

    if (trimmedLine.match(/^:::download$/i)) {
      const blockLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().match(/^:::$/)) {
        blockLines.push(lines[i]);
        i++;
      }
      let title = "Resource Package";
      let url = "#";
      let size = "Downloadable File";
      let fileType = "ZIP";
      for (const bl of blockLines) {
        const mTitle = bl.match(/^title:\s*(.+)$/i);
        if (mTitle) title = mTitle[1].trim();
        const mUrl = bl.match(/^url:\s*(.+)$/i);
        if (mUrl) url = mUrl[1].trim();
        const mSize = bl.match(/^size:\s*(.+)$/i);
        if (mSize) size = mSize[1].trim();
        const mType = bl.match(/^type:\s*(.+)$/i);
        if (mType) fileType = mType[1].trim();
      }
      blocks.push({ type: "download", title, url, size, fileType });
      i++;
      continue;
    }

    // 1c. Block-level Font Style (:::font[Font Name] ... :::)
    const fontBlockStart = trimmedLine.match(/^:::font\[\s*([a-zA-Z0-9\s-]+?)\s*\]$/i);
    if (fontBlockStart) {
      const fontName = fontBlockStart[1].trim();
      const fontLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().match(/^:::$/)) {
        fontLines.push(lines[i]);
        i++;
      }
      blocks.push({
        type: "font-block",
        fontName,
        text: fontLines.join("\n").trim(),
      });
      i++;
      continue;
    }

    // 2. Fenced Code Blocks (```lang ... ```)
    if (line.trim().startsWith("```")) {
      const lang = line.trim().slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      blocks.push({ type: "code", lang, code: codeLines.join("\n") });
      i++;
      continue;
    }

    // 3. Callout blocks (:::tip ... ::: or [TIP] ...)
    const calloutStart = line.match(/^:::(tip|warning|danger|note|info)$/i);
    if (calloutStart) {
      const variant = calloutStart[1].toLowerCase();
      const textLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith(":::")) {
        textLines.push(lines[i]);
        i++;
      }
      blocks.push({ type: "callout", variant, text: textLines.join("\n").trim() });
      i++;
      continue;
    }

    // 4. Headings (# H1 to ###### H6)
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      blocks.push({
        type: "heading",
        level: headingMatch[1].length,
        text: headingMatch[2].trim(),
      });
      i++;
      continue;
    }

    // 4b. Emoji-prefixed section titles (e.g. "🚀 Welcome to NammaTech!")
    const emojiTitleMatch = line.trim().match(/^([\p{Extended_Pictographic}\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]\s*.{3,60})$/u);
    if (
      emojiTitleMatch &&
      !line.trim().startsWith("http") &&
      !line.trim().startsWith("[") &&
      !line.trim().endsWith("...")
    ) {
      blocks.push({
        type: "heading",
        level: 2,
        text: emojiTitleMatch[1].trim(),
      });
      i++;
      continue;
    }

    // 5. Divider (--- or ***)
    if (line.trim() === "---" || line.trim() === "***") {
      blocks.push({ type: "divider" });
      i++;
      continue;
    }

    // 6. Blockquote (> text)
    if (line.startsWith("> ")) {
      const quoteLines: string[] = [line.slice(2)];
      i++;
      while (i < lines.length && lines[i].startsWith("> ")) {
        quoteLines.push(lines[i].slice(2));
        i++;
      }
      blocks.push({ type: "quote", text: quoteLines.join(" ") });
      continue;
    }

    // 7. Markdown Tables (| Col 1 | Col 2 |)
    if (line.startsWith("|") && line.endsWith("|")) {
      const tableLines: string[] = [line];
      i++;
      while (i < lines.length && lines[i].startsWith("|") && lines[i].endsWith("|")) {
        tableLines.push(lines[i]);
        i++;
      }
      if (tableLines.length >= 2) {
        const headers = tableLines[0]
          .split("|")
          .map((s) => s.trim())
          .filter(Boolean);
        const rows = tableLines.slice(2).map((r) =>
          r
            .split("|")
            .map((s) => s.trim())
            .filter(Boolean)
        );
        blocks.push({ type: "table", headers, rows });
        continue;
      }
    }

    // 8. Image (![alt](src))
    const imgMatch = line.match(/^!\[(.*?)\]\((.*?)\)$/);
    if (imgMatch) {
      blocks.push({ type: "image", alt: imgMatch[1], src: imgMatch[2] });
      i++;
      continue;
    }

    // 9. Lists (- item or * item)
    if (line.match(/^[-*]\s+/)) {
      const listItems: string[] = [line.replace(/^[-*]\s+/, "")];
      i++;
      while (i < lines.length && lines[i].match(/^[-*]\s+/)) {
        listItems.push(lines[i].replace(/^[-*]\s+/, ""));
        i++;
      }
      blocks.push({ type: "list", items: listItems });
      continue;
    }

    // 10. Default: Paragraph
    if (line.trim()) {
      blocks.push({ type: "paragraph", text: line });
    }
    i++;
  }

  return blocks;
}
