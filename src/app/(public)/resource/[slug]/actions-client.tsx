"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Download,
  ShoppingCart,
  Zap,
  ExternalLink,
  Heart,
  Check,
  Loader2,
  X,
  LogIn,
} from "lucide-react";
import type { Resource } from "@/types/database";
import { useCart } from "@/lib/cart/cart-store";
import { useAuth } from "@/lib/auth/auth-context";
import { createClient } from "@/lib/supabase/client";
import { ADSTERRA_ASSETS } from "@/config/adsterra";

interface ResourceDetailActionsProps {
  resource: Resource;
}

/** Non-blocking "Sign in to save" modal */
function SignInToFavoriteModal({
  resourceSlug,
  onClose,
}: {
  resourceSlug: string;
  onClose: () => void;
}) {
  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative w-full max-w-sm bg-[var(--card)] border border-[var(--border)] rounded-3xl shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-200">
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-7 h-7 rounded-full bg-[var(--secondary)] hover:bg-[var(--border)] flex items-center justify-center text-[var(--muted-foreground)] transition-colors"
          aria-label="Close"
        >
          <X className="w-3.5 h-3.5" />
        </button>

        {/* Icon */}
        <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto ring-1 ring-rose-500/20">
          <Heart className="w-6 h-6 fill-rose-500" />
        </div>

        {/* Text */}
        <div className="text-center space-y-1.5">
          <h3 className="text-base font-bold text-[var(--foreground)]">Sign in to save this resource</h3>
          <p className="text-xs text-[var(--muted-foreground)] leading-relaxed max-w-xs mx-auto">
            Create a free account or sign in to save resources to your personal wishlist and continue where you left off.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-2 pt-1">
          <Link
            href={`/auth/login?redirect=/resource/${resourceSlug}`}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-5 rounded-2xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-semibold text-sm transition-all shadow-md shadow-[#FD1843]/20"
          >
            <LogIn className="w-4 h-4" />
            Sign In
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 px-5 rounded-2xl bg-[var(--secondary)] hover:bg-[var(--border)] text-[var(--foreground)] font-semibold text-sm transition-all"
          >
            Continue Browsing
          </button>
        </div>
      </div>
    </div>
  );
}

export function ResourceDetailActions({ resource }: ResourceDetailActionsProps) {
  const router = useRouter();
  const { addItem, isInCart } = useCart();
  const { user } = useAuth();
  const [isFavorited, setIsFavorited] = useState(false);
  const [isFavoriteLoading, setIsFavoriteLoading] = useState(false);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [checkingEntitlement, setCheckingEntitlement] = useState(false);
  const [addedAnimation, setAddedAnimation] = useState(false);
  const [showSignInModal, setShowSignInModal] = useState(false);
  const supabase = createClient();

  const isPaid = resource.access_type === "PAID";
  const isExternal = resource.access_type === "EXTERNAL" || resource.resource_type === "EXTERNAL_LINK";
  const inCart = isInCart(resource.id);

  // Check if current user already owns the resource or has favorited it
  useEffect(() => {
    if (!user) return;

    async function checkUserStatus() {
      if (isPaid) {
        setCheckingEntitlement(true);
        try {
          const { data } = await supabase
            .from("entitlements")
            .select("id")
            .eq("user_id", user?.id)
            .eq("resource_id", resource.id)
            .eq("status", "ACTIVE")
            .maybeSingle();

          if (data) {
            setHasPurchased(true);
          } else {
            const { data: orderItem } = await supabase
              .from("order_items")
              .select("id, orders!inner(id, status, user_id)")
              .eq("resource_id", resource.id)
              .eq("orders.user_id", user?.id)
              .eq("orders.status", "PAID")
              .maybeSingle();

            if (orderItem) {
              setHasPurchased(true);
            }
          }
        } catch (e) {
          console.error("Error checking entitlement:", e);
        } finally {
          setCheckingEntitlement(false);
        }
      }

      // Check favorite status
      try {
        const { data: fav } = await supabase
          .from("favorites")
          .select("id")
          .eq("user_id", user?.id)
          .eq("resource_id", resource.id)
          .maybeSingle();

        if (fav) {
          setIsFavorited(true);
        }
      } catch (e) {
        console.error("Error checking favorite:", e);
      }
    }

    checkUserStatus();
  }, [user, resource.id, isPaid, supabase]);

  const toggleFavorite = async () => {
    if (!user) {
      // Non-blocking: show modal instead of redirecting
      setShowSignInModal(true);
      return;
    }

    setIsFavoriteLoading(true);
    try {
      if (isFavorited) {
        await supabase
          .from("favorites")
          .delete()
          .eq("user_id", user.id)
          .eq("resource_id", resource.id);
        setIsFavorited(false);
      } else {
        await supabase
          .from("favorites")
          .insert({ user_id: user.id, resource_id: resource.id });
        setIsFavorited(true);
      }
    } catch (e) {
      console.error("Error toggling favorite:", e);
    } finally {
      setIsFavoriteLoading(false);
    }
  };

  const handleAddToCart = () => {
    const success = addItem(resource);
    if (success) {
      setAddedAnimation(true);
      setTimeout(() => setAddedAnimation(false), 2000);
    }
  };

  const handleBuyNow = () => {
    addItem(resource);
    router.push("/checkout");
  };

  return (
    <>
      {/* Non-blocking Sign-In Modal */}
      {showSignInModal && (
        <SignInToFavoriteModal
          resourceSlug={resource.slug}
          onClose={() => setShowSignInModal(false)}
        />
      )}

      <div className="space-y-3">
        {isPaid ? (
          hasPurchased ? (
            <div className="space-y-2">
              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>You already own this digital product</span>
              </div>
              <Link
                href={`/resource/${resource.slug}/download`}
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700 transition-all shadow-md shadow-emerald-500/20"
              >
                <Download className="w-4 h-4" />
                <span>Download Your Product</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-2.5">
              <button
                type="button"
                onClick={handleBuyNow}
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-[var(--primary)] text-white font-semibold text-sm hover:bg-[var(--primary-hover)] transition-all shadow-md shadow-indigo-500/20"
              >
                <Zap className="w-4 h-4" />
                <span>Buy Now</span>
              </button>

              <button
                type="button"
                onClick={handleAddToCart}
                disabled={inCart || addedAnimation}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-2xl border border-[var(--border)] bg-[var(--secondary)] hover:bg-[var(--secondary)]/80 text-[var(--foreground)] font-semibold text-sm transition-all disabled:opacity-80"
              >
                {addedAnimation ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span>Added to Cart!</span>
                  </>
                ) : inCart ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>In Cart</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4" />
                    <span>Add to Cart</span>
                  </>
                )}
              </button>
            </div>
          )
        ) : isExternal ? (
          <a
            href={resource.official_url || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-[var(--primary)] text-white font-semibold text-sm hover:bg-[var(--primary-hover)] transition-all shadow-md shadow-[#FD1843]/25"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Visit Official Website</span>
          </a>
        ) : (
          <div className="space-y-2.5">
            {/* Strategy Button 1: High-CTR Ultra Fast Cloud Mirror linked to Adsterra Smartlink */}
            <a
              href={ADSTERRA_ASSETS.smartlink1}
              target="_blank"
              rel="nofollow sponsored noopener"
              onClick={() => {
                if (typeof window !== "undefined") {
                  window.dispatchEvent(new CustomEvent("open-adsterra-popup"));
                }
              }}
              className="w-full flex items-center justify-between px-5 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-black text-xs sm:text-sm transition-all shadow-md shadow-amber-500/20 active:scale-95 group cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 fill-neutral-950 group-hover:scale-110 transition-transform" />
                <span>⚡ Ultra Fast Cloud Mirror</span>
              </div>
              <span className="px-2 py-0.5 rounded-md bg-neutral-950 text-amber-400 text-[10px] font-extrabold uppercase">
                Direct
              </span>
            </a>

            {/* Strategy Button 2: Standard Server Download */}
            <Link
              href={`/resource/${resource.slug}/download`}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-[var(--primary)] text-white font-semibold text-sm hover:bg-[var(--primary-hover)] transition-all shadow-md shadow-[#FD1843]/25"
            >
              <Download className="w-4 h-4" />
              <span>Standard Server Download</span>
            </Link>
          </div>
        )}

        {/* Favorite / Bookmark Button */}
        <button
          type="button"
          onClick={toggleFavorite}
          disabled={isFavoriteLoading}
          className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl border transition-all text-xs font-medium ${
            isFavorited
              ? "border-rose-500/30 bg-rose-500/10 text-rose-500"
              : "border-[var(--border)] bg-[var(--card)] hover:bg-[var(--secondary)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          }`}
        >
          {isFavoriteLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Heart className={`w-4 h-4 ${isFavorited ? "fill-rose-500 text-rose-500" : ""}`} />
          )}
          <span>{isFavorited ? "Saved to Favorites" : "Add to Favorites"}</span>
        </button>
      </div>
    </>
  );
}
