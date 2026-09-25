"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Sparkles } from "lucide-react";
import { VoiceSearchButton } from "@/components/search/voice-search-button";

interface SearchPageInputProps {
  initialQuery?: string;
}

export function SearchPageInput({ initialQuery = "" }: SearchPageInputProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleVoiceTranscript = (transcript: string) => {
    setQuery(transcript);
    router.push(`/search?q=${encodeURIComponent(transcript)}`);
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-2xl mx-auto my-6">
      <div className="relative flex items-center rounded-2xl border-2 border-amber-500/40 bg-[var(--card)]/90 dark:bg-[#0c0c12]/90 shadow-2xl backdrop-blur-xl p-1.5 focus-within:border-amber-400 focus-within:ring-4 focus-within:ring-amber-500/20 transition-all">
        <Search className="w-5 h-5 text-amber-500 ml-3 flex-shrink-0" />

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Speak or type: apps, tools, 4K movies, tutorials..."
          className="flex-1 bg-transparent px-3 py-2 text-sm sm:text-base text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:outline-none"
        />

        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="p-1.5 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-black/5 dark:hover:bg-white/5 transition-colors mr-1"
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        <div className="flex items-center gap-1.5">
          <VoiceSearchButton onTranscript={handleVoiceTranscript} />

          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:brightness-110 text-neutral-950 text-xs font-black transition-all shadow-md active:scale-95 cursor-pointer flex-shrink-0"
          >
            Search
          </button>
        </div>
      </div>
    </form>
  );
}
