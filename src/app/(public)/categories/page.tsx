import React from "react";
import Link from "next/link";
import {
  Layers,
  ArrowRight,
  Smartphone,
  Monitor,
  Code,
  Cpu,
  FileText,
  Shapes,
  GraduationCap,
  Globe,
  Film,
  Folder,
} from "lucide-react";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import type { Category } from "@/types/database";

export const metadata: Metadata = {
  title: "Resource Categories - Software, Tools & Assets",
  description:
    "Browse verified digital resources across categories including Android APKs, PC Software, Developer Tools, AI Utilities, Templates, and Cinema.",
  openGraph: {
    title: "Resource Categories - Software, Tools & Assets | NammaTech",
    description:
      "Browse verified digital resources across curated categories on NammaTech.",
  },
};

export const revalidate = 60;

export default async function CategoriesPage() {
  const supabase = await createClient();
  let categories: Category[] = [];

  try {
    const { data } = await supabase
      .from("categories")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (data) {
      categories = data as Category[];
    }
  } catch (err) {
    console.error("Failed to load categories:", err);
  }

  const categoryIcons: Record<string, React.ReactNode> = {
    apk: <Smartphone className="w-6 h-6 text-emerald-500" />,
    "pc-software": <Monitor className="w-6 h-6 text-blue-500" />,
    "developer-tools": <Code className="w-6 h-6 text-purple-500" />,
    "ai-tools": <Cpu className="w-6 h-6 text-cyan-500" />,
    templates: <FileText className="w-6 h-6 text-amber-500" />,
    icons: <Shapes className="w-6 h-6 text-rose-500" />,
    education: <GraduationCap className="w-6 h-6 text-indigo-500" />,
    "useful-websites": <Globe className="w-6 h-6 text-teal-500" />,
    media: <Film className="w-6 h-6 text-pink-500" />,
    other: <Folder className="w-6 h-6 text-slate-500" />,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 w-full">
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--primary)] mb-1">
          <Layers className="w-4 h-4" />
          <span>Classifications</span>
        </div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[var(--foreground)] tracking-tight">
          Resource Categories
        </h1>
        <p className="text-xs sm:text-sm text-[var(--muted-foreground)] mt-1">
          Explore curated open-source software, freeware, assets, and tools by category.
        </p>
      </div>

      {categories.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-5">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={cat.slug === "movies" ? "/movies" : `/category/${cat.slug}`}
              className="group flex flex-col p-4 sm:p-6 rounded-2xl border border-[var(--border)] bg-[var(--card)] hover:border-[var(--ring)]/50 hover:bg-[var(--secondary)]/40 transition-all shadow-xs"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[var(--secondary)] border border-[var(--border)] flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-105 transition-transform shadow-xs">
                {categoryIcons[cat.slug] || <Layers className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--primary)]" />}
              </div>
              <h3 className="font-bold text-sm sm:text-base text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors mb-1">
                {cat.name}
              </h3>
              <p className="text-xs text-[var(--muted-foreground)] line-clamp-2 leading-relaxed mb-3 sm:mb-4 flex-1">
                {cat.description || "Discover verified resources in this category."}
              </p>
              <div className="flex items-center gap-1 text-xs font-semibold text-[var(--primary)] group-hover:translate-x-0.5 transition-transform">
                <span>Browse category</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center rounded-2xl border border-[var(--border)] bg-[var(--card)]">
          <p className="text-sm text-[var(--muted-foreground)]">
            No categories available in the database yet. Check back soon.
          </p>
        </div>
      )}
    </div>
  );
}
