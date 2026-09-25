"use client";

import React, { useState, useEffect } from "react";
import {
  Share2,
  Copy,
  Check,
  Bookmark,
  Printer,
  ThumbsUp,
  ThumbsDown,
  Mail,
  Send,
} from "lucide-react";
import { useToast } from "@/components/ui/toast";

interface ArticleShareBarProps {
  title: string;
  slug: string;
}

export function ArticleShareBar({ title, slug }: ArticleShareBarProps) {
  const { showToast } = useToast();
  const [copied, setCopied] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState<"yes" | "no" | null>(null);

  const canonicalUrl = `https://www.techsavvymuthuraj.dev/articles/${slug}`;
  const [articleUrl, setArticleUrl] = useState(canonicalUrl);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setArticleUrl(`${window.location.origin}/articles/${slug}`);
    }

    try {
      const saved = localStorage.getItem(`bookmark_article_${slug}`);
      if (saved) setIsBookmarked(true);
      const fb = localStorage.getItem(`feedback_article_${slug}`);
      if (fb === "yes" || fb === "no") setFeedbackGiven(fb);
    } catch {
      // Ignore
    }
  }, [slug]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(articleUrl);
      setCopied(true);
      showToast({ type: "success", title: "Link Copied", message: "Article URL copied to clipboard" });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast({ type: "info", title: "Article URL", message: articleUrl });
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: `Read "${title}" on NammaTech Journal:`,
          url: articleUrl,
        });
      } catch {
        // User cancelled
      }
    } else {
      handleCopyLink();
    }
  };

  const handleBookmarkToggle = () => {
    try {
      if (isBookmarked) {
        localStorage.removeItem(`bookmark_article_${slug}`);
        setIsBookmarked(false);
        showToast({ type: "info", title: "Bookmark Removed", message: "Article removed from reading list" });
      } else {
        localStorage.setItem(`bookmark_article_${slug}`, "true");
        setIsBookmarked(true);
        showToast({ type: "success", title: "Article Saved", message: "Saved to your offline reading bookmarks" });
      }
    } catch {
      // Ignore
    }
  };

  const handleFeedback = (val: "yes" | "no") => {
    setFeedbackGiven(val);
    try {
      localStorage.setItem(`feedback_article_${slug}`, val);
    } catch {}
    showToast({
      type: "success",
      title: "Thank You!",
      message: val === "yes" ? "Glad this was helpful!" : "Thanks for the feedback. We will refine this guide.",
    });
  };

  const shareText = encodeURIComponent(`Read "${title}" on NammaTech Journal`);
  const encodedUrl = encodeURIComponent(articleUrl);

  return (
    <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 sm:p-7 space-y-6 shadow-sm">
      {/* 1. Share Channels */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--foreground)] flex items-center gap-2">
          <Share2 className="w-4 h-4 text-amber-500" />
          <span>Share This Publication</span>
        </h4>

        <div className="flex flex-wrap items-center gap-2">
          {/* Native Share */}
          <button
            type="button"
            onClick={handleNativeShare}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500 text-neutral-950 font-bold text-xs hover:bg-amber-400 transition-all cursor-pointer shadow-xs active:scale-95"
            title="Share via device options"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share</span>
          </button>

          {/* WhatsApp */}
          <a
            href={`https://api.whatsapp.com/send?text=${shareText}%20${encodedUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 hover:bg-emerald-500/25 font-bold text-xs transition-all"
            title="Share on WhatsApp"
          >
            <span>WhatsApp</span>
          </a>

          {/* Telegram */}
          <a
            href={`https://t.me/share/url?url=${encodedUrl}&text=${shareText}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-sky-500/15 text-sky-500 border border-sky-500/30 hover:bg-sky-500/25 font-bold text-xs transition-all"
            title="Share on Telegram"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Telegram</span>
          </a>

          {/* X / Twitter */}
          <a
            href={`https://twitter.com/intent/tweet?text=${shareText}&url=${encodedUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[var(--secondary)] text-[var(--foreground)] border border-[var(--border)] hover:border-amber-500/40 font-bold text-xs transition-all"
            title="Share on X"
          >
            <span>X (Twitter)</span>
          </a>

          {/* LinkedIn */}
          <a
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-500/15 text-blue-500 border border-blue-500/30 hover:bg-blue-500/25 font-bold text-xs transition-all"
            title="Share on LinkedIn"
          >
            <span>LinkedIn</span>
          </a>

          {/* Email */}
          <a
            href={`mailto:?subject=${encodeURIComponent(title)}&body=${shareText}%0A%0A${encodedUrl}`}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[var(--secondary)] text-[var(--foreground)] border border-[var(--border)] hover:border-amber-500/40 font-bold text-xs transition-all"
            title="Send via Email"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Email</span>
          </a>

          {/* Copy Link */}
          <button
            type="button"
            onClick={handleCopyLink}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[var(--secondary)] text-[var(--foreground)] border border-[var(--border)] hover:border-amber-500/40 font-bold text-xs transition-all cursor-pointer"
            title="Copy URL"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Copy Link"}</span>
          </button>

          {/* Bookmark */}
          <button
            type="button"
            onClick={handleBookmarkToggle}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
              isBookmarked
                ? "bg-amber-500/20 text-amber-500 border-amber-500/40"
                : "bg-[var(--secondary)] text-[var(--foreground)] border-[var(--border)] hover:border-amber-500/40"
            }`}
            title={isBookmarked ? "Remove Bookmark" : "Save for Later"}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? "fill-amber-500" : ""}`} />
            <span>{isBookmarked ? "Saved" : "Save"}</span>
          </button>

          {/* Print Article */}
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[var(--secondary)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] border border-[var(--border)] font-bold text-xs transition-all cursor-pointer"
            title="Print or Save PDF"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Print</span>
          </button>
        </div>
      </div>

      {/* 2. Helpful / Reader Feedback Widget */}
      <div className="pt-4 border-t border-[var(--border)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <span className="font-semibold text-[var(--foreground)]">
          Was this article helpful to your learning?
        </span>

        {feedbackGiven ? (
          <span className="inline-flex items-center gap-1.5 text-emerald-500 font-bold">
            <Check className="w-4 h-4" />
            <span>Thank you for your feedback!</span>
          </span>
        ) : (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleFeedback("yes")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 font-bold transition-all cursor-pointer"
            >
              <ThumbsUp className="w-3.5 h-3.5" />
              <span>Yes, Helpful</span>
            </button>
            <button
              type="button"
              onClick={() => handleFeedback("no")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--border)] bg-[var(--secondary)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] font-bold transition-all cursor-pointer"
            >
              <ThumbsDown className="w-3.5 h-3.5" />
              <span>Needs Work</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
