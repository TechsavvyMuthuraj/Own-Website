"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Search, X, Loader2, ArrowRight, Layers } from "lucide-react";
import type { Resource } from "@/types/database";
import { createClient } from "@/lib/supabase/client";
import { ResourceVisual } from "@/components/resources/resource-visual";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
      setQuery("");
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Open handled by parent or custom event
        }
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Debounced search query
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("resources")
          .select("id, title, slug, short_description, thumbnail_url, access_type, price, platform, category:categories(name)")
          .eq("status", "PUBLISHED")
          .ilike("title", `%${query.trim()}%`)
          .limit(8);

        if (!error && data) {
          // Flatten Supabase array/object category relation
          const formatted = (data as unknown[]).map((item: any) => ({
            ...item,
            category: Array.isArray(item.category) ? item.category[0] : item.category,
          })) as Resource[];
          setResults(formatted);
        } else {
          setResults([]);
        }
      } catch (err) {
        console.error("Search failed:", err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query, supabase]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-[var(--border)] gap-3 bg-[var(--card)]">
          <Search className="w-5 h-5 text-[var(--muted-foreground)]" />
          <input
            ref={inputRef}
            type="text"
            id="global-search-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search apps, software, tools, templates, files..."
            className="flex-1 bg-transparent text-sm sm:text-base text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:outline-none"
          />
          {loading && <Loader2 className="w-4 h-4 text-[var(--primary)] animate-spin" />}
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="p-1 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--secondary)]"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 text-[10px] font-mono text-[var(--muted-foreground)] bg-[var(--secondary)] rounded border border-[var(--border)]">
            ESC
          </kbd>
        </div>

        {/* Results Container */}
        <div className="flex-1 overflow-y-auto p-3 divide-y divide-[var(--border)]/40">
          {query.trim() === "" ? (
            <div className="p-8 text-center">
              <p className="text-xs text-[var(--muted-foreground)]">
                Type keywords like &quot;Android&quot;, &quot;VLC&quot;, &quot;Editor&quot;, or &quot;Icons&quot; to search the directory.
              </p>
            </div>
          ) : loading ? (
            <div className="p-8 text-center text-xs text-[var(--muted-foreground)] flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-[var(--primary)]" />
              Searching real database...
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-1">
              {results.map((res) => (
                <Link
                  key={res.id}
                  href={`/resource/${res.slug}`}
                  onClick={onClose}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-[var(--secondary)] transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <ResourceVisual resource={res} variant="icon" size="sm" showFormatTag={false} />
                    <div>
                      <h4 className="text-sm font-medium text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors">
                        {res.title}
                      </h4>
                      <div className="flex items-center gap-2 text-[11px] text-[var(--muted-foreground)]">
                        <span>{res.category?.name || "General"}</span>
                        {res.platform && <span>• {res.platform}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium px-2 py-0.5 rounded bg-[var(--background)] border border-[var(--border)]">
                      {res.access_type === "PAID" ? "Premium" : "Free"}
                    </span>
                    <ArrowRight className="w-4 h-4 text-[var(--muted-foreground)] group-hover:text-[var(--foreground)] group-hover:translate-x-0.5 transition-all" />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <p className="text-sm font-medium text-[var(--foreground)] mb-1">
                No resources found for &quot;{query}&quot;
              </p>
              <p className="text-xs text-[var(--muted-foreground)]">
                Try checking for typos or searching by broader keywords.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 bg-[var(--secondary)]/50 border-t border-[var(--border)] flex items-center justify-between text-[11px] text-[var(--muted-foreground)]">
          <span>Real-time database search</span>
          <Link
            href={`/search?q=${encodeURIComponent(query)}`}
            onClick={onClose}
            className="text-[var(--primary)] hover:underline font-medium"
          >
            View all results
          </Link>
        </div>
      </div>
    </div>
  );
}
