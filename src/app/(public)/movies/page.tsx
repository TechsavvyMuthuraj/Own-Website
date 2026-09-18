import React from "react";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { MoviesClient, type MovieItem } from "./movies-client";

export const metadata: Metadata = {
  title: "Movies Cinema Hub - Free & 4K VIP Premium Downloads | NammaTech",
  description:
    "Explore and download blockbuster regional and global movies. High quality 4K UHD, 1080p FHD, and 720p with Free direct downloads and ultra-fast VIP links.",
};

export const revalidate = 60;

const DEFAULT_MOVIES: MovieItem[] = [
  {
    id: "mov-leo-2023",
    title: "Leo: Bloody Sweet (2023)",
    year: 2023,
    genres: ["Action", "Crime", "Thriller"],
    quality: "4K UHD",
    posterUrl: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=800&q=80",
    rating: "8.2",
    sizeNormal: "1.4 GB",
    sizePremium: "5.2 GB",
    audio: "Tamil + Telugu + Hindi + Eng 5.1",
    normalDownloadUrl: "https://archive.org",
    premiumPrice: 49,
    description: "Parthiban is a mild-mannered cafe owner in Kashmir who becomes targeted by dangerous gangsters who believe him to be someone else.",
  },
  {
    id: "mov-goat-2024",
    title: "The Greatest of All Time (GOAT) (2024)",
    year: 2024,
    genres: ["Sci-Fi", "Action", "Thriller"],
    quality: "4K UHD",
    posterUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80",
    rating: "7.9",
    sizeNormal: "1.6 GB",
    sizePremium: "5.8 GB",
    audio: "Tamil + Telugu + Hindi 5.1 Dolby",
    normalDownloadUrl: "https://archive.org",
    premiumPrice: 49,
    description: "An elite special agent and bomb specialist retires after a tragic overseas mission, only to be dragged back when past ghosts resurface.",
  },
  {
    id: "mov-jailer-2023",
    title: "Jailer (2023)",
    year: 2023,
    genres: ["Action", "Comedy", "Crime"],
    quality: "4K UHD",
    posterUrl: "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?auto=format&fit=crop&w=800&q=80",
    rating: "8.1",
    sizeNormal: "1.3 GB",
    sizePremium: "4.5 GB",
    audio: "Tamil + Telugu + Hindi + Kannada",
    normalDownloadUrl: "https://archive.org",
    premiumPrice: 49,
    description: "A retired prison warden goes on a ruthless manhunt after his police officer son disappears investigating an international idol smuggling syndicate.",
  },
  {
    id: "mov-vikram-2022",
    title: "Vikram: Hitlist (2022)",
    year: 2022,
    genres: ["Action", "Mystery", "Thriller"],
    quality: "4K UHD",
    posterUrl: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80",
    rating: "8.6",
    sizeNormal: "1.5 GB",
    sizePremium: "5.1 GB",
    audio: "Tamil + Telugu + Hindi + Mal 5.1",
    normalDownloadUrl: "https://archive.org",
    premiumPrice: 49,
    description: "A high-ranking black-ops commander leads an undercover squad to track down a masked syndicate of drug cartel lords in Chennai.",
  },
  {
    id: "mov-interstellar-2014",
    title: "Interstellar (2014)",
    year: 2014,
    genres: ["Sci-Fi", "Adventure", "Drama"],
    quality: "4K UHD",
    posterUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80",
    rating: "8.7",
    sizeNormal: "1.8 GB",
    sizePremium: "6.4 GB",
    audio: "English + Tamil + Hindi Dolby Atmos",
    normalDownloadUrl: "https://archive.org",
    premiumPrice: 49,
    description: "When Earth becomes uninhabitable in the future, a former NASA pilot leads a crew through a newly discovered wormhole near Saturn.",
  },
  {
    id: "mov-oppenheimer-2023",
    title: "Oppenheimer (2023)",
    year: 2023,
    genres: ["Biography", "Drama", "History"],
    quality: "4K UHD",
    posterUrl: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=800&q=80",
    rating: "8.9",
    sizeNormal: "1.9 GB",
    sizePremium: "7.2 GB",
    audio: "English + Hindi + Tamil 5.1",
    normalDownloadUrl: "https://archive.org",
    premiumPrice: 49,
    description: "The sweeping historical drama following J. Robert Oppenheimer's role in the Manhattan Project and the development of the atomic bomb.",
  },
  {
    id: "mov-kgf2-2022",
    title: "K.G.F: Chapter 2 (2022)",
    year: 2022,
    genres: ["Action", "Crime", "Drama"],
    quality: "1080p FHD",
    posterUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80",
    rating: "8.3",
    sizeNormal: "1.4 GB",
    sizePremium: "4.9 GB",
    audio: "Kannada + Tamil + Telugu + Hindi",
    normalDownloadUrl: "https://archive.org",
    premiumPrice: 49,
    description: "In the blood-soaked Kolar Gold Fields, Rocky's name strikes fear into his foes while the government sees him as a deadly threat.",
  },
  {
    id: "mov-manjummel-2024",
    title: "Manjummel Boys (2024)",
    year: 2024,
    genres: ["Adventure", "Drama", "Thriller"],
    quality: "1080p FHD",
    posterUrl: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=800&q=80",
    rating: "8.5",
    sizeNormal: "1.2 GB",
    sizePremium: "3.9 GB",
    audio: "Malayalam + Tamil + Telugu 5.1",
    normalDownloadUrl: "https://archive.org",
    premiumPrice: 49,
    description: "A group of close friends from Kochi journey to Kodaikanal, where an unexpected mishap deep inside the Guna Caves tests their courage.",
  },
];

export default async function MoviesPage() {
  const supabase = await createClient();
  let dbMovies: MovieItem[] = [];

  try {
    const { data } = await supabase
      .from("resources")
      .select("*, category:categories(*)")
      .eq("status", "PUBLISHED")
      .ilike("title", "%movie%")
      .order("published_at", { ascending: false })
      .limit(20);

    if (data && data.length > 0) {
      dbMovies = data.map((item: any) => ({
        id: item.id,
        title: item.title,
        year: new Date(item.created_at || Date.now()).getFullYear(),
        genres: item.tags && item.tags.length > 0 ? item.tags : ["Cinema", "Feature"],
        quality: item.price > 0 ? "4K UHD" : "1080p FHD",
        posterUrl: item.thumbnail_url || "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=800&q=80",
        rating: "8.5",
        sizeNormal: item.size_bytes ? `${Math.round(item.size_bytes / (1024 * 1024 * 1024) * 10) / 10} GB` : "1.4 GB",
        sizePremium: item.size_bytes ? `${Math.round(item.size_bytes / (1024 * 1024 * 1024) * 2.5 * 10) / 10} GB` : "4.8 GB",
        audio: "Tamil + Telugu + Hindi + Eng",
        normalDownloadUrl: item.download_type === "EXTERNAL" ? item.official_url || "https://archive.org" : "/api/download/" + item.id,
        premiumPrice: item.price > 0 ? item.price : 49,
        description: item.short_description || item.description || "High quality cinema release with verified high-speed mirrors.",
      }));
    }
  } catch (err) {
    console.error("Error loading movies from db:", err);
  }

  // Combine db movies with default catalog
  const movies = dbMovies.length > 0 ? [...dbMovies, ...DEFAULT_MOVIES] : DEFAULT_MOVIES;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      <MoviesClient movies={movies} />
    </div>
  );
}
