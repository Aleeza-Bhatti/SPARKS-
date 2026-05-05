"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import type { Product } from "@/lib/types";

export const FAVORITES_KEY = "sparks:favorites";
export const FAVORITES_CHANGED_EVENT = "sparks:favorites-changed";

export default function ProductCard({ product }: { product: Product }) {
  const router = useRouter();
  const [reported, setReported] = useState(false);
  const [showReportMenu, setShowReportMenu] = useState(false);
  const [favorited, setFavorited] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(FAVORITES_KEY);
    if (!stored) return;

    try {
      const favorites = JSON.parse(stored) as Product[];
      setFavorited(favorites.some((item) => item.id === product.id));
    } catch {
      window.localStorage.removeItem(FAVORITES_KEY);
    }
  }, [product.id]);

  const toggleFavorite = () => {
    const stored = window.localStorage.getItem(FAVORITES_KEY);
    let favorites: Product[] = [];

    if (stored) {
      try {
        favorites = JSON.parse(stored) as Product[];
      } catch {
        favorites = [];
      }
    }

    const alreadyFavorited = favorites.some((item) => item.id === product.id);
    const nextFavorites = alreadyFavorited
      ? favorites.filter((item) => item.id !== product.id)
      : [...favorites, product];

    window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(nextFavorites));
    setFavorited(!alreadyFavorited);
    window.dispatchEvent(new Event(FAVORITES_CHANGED_EVENT));
  };

  const handleReport = (reason: string) => {
    setShowReportMenu(false);
    setReported(true);
    // Fire-and-forget; no backend yet
    fetch("/api/products/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: product.id, reason }),
    }).catch(() => {});
  };

  const handleTryOn = () => {
    const params = new URLSearchParams({
      id: product.id,
      img: product.imageUrl,
      name: product.name,
      brand: product.brand,
      price: String(product.price),
      url: product.productUrl,
    });
    router.push(`/tryon?${params.toString()}`);
  };

  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-[#E5BE9A] shadow-[0_8px_24px_rgba(90,23,26,0.08)] group flex flex-col card-hover relative">

      {/* Image */}
      <div className="relative overflow-hidden bg-[#F3EEE8]" style={{ aspectRatio: "3/4" }}>
        <a
          href={product.productUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute inset-0 block"
        >
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          unoptimized
        />
        </a>

        {/* Favorite button */}
        <button
          onClick={toggleFavorite}
          className={`absolute top-2 right-2 z-10 w-8 h-8 rounded-full bg-white shadow-[0_3px_12px_rgba(90,23,26,0.18)] border border-[#E5BE9A] flex items-center justify-center transition-colors ${
            favorited ? "text-terracotta" : "text-brand hover:text-terracotta"
          }`}
          aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
          aria-pressed={favorited}
        >
          <Heart className="w-4 h-4" fill={favorited ? "currentColor" : "none"} aria-hidden="true" />
        </button>

        {/* Report button — top-left, shows on hover */}
        <div className="absolute top-2 left-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
          {reported ? (
            <span className="bg-white text-brand text-xs px-2 py-0.5 rounded-full shadow-sm border border-[rgba(102,12,13,0.12)]">
              Reported ✓
            </span>
          ) : (
            <div className="relative">
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowReportMenu((v) => !v); }}
                className="bg-white hover:bg-[#FFFCF8] text-brand hover:text-terracotta text-xs px-2 py-1 rounded-full shadow-sm border border-[rgba(102,12,13,0.12)] transition-colors flex items-center gap-1"
                aria-label="Report this product"
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                  <line x1="4" y1="22" x2="4" y2="15" />
                </svg>
                Report
              </button>

              {showReportMenu && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setShowReportMenu(false)} />
                  <div className="absolute left-0 top-8 z-30 bg-white border border-[rgba(102,12,13,0.1)] rounded-xl shadow-lg py-1 min-w-[160px]">
                    <p className="px-3 py-1.5 text-xs font-semibold text-brand-soft uppercase tracking-wide">Why are you reporting?</p>
                    {["Not modest", "Wrong size", "Broken link", "Not my style", "Other"].map((r) => (
                      <button
                        key={r}
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleReport(r); }}
                        className="w-full text-left px-3 py-2 text-xs text-brand hover:bg-[rgba(102,12,13,0.04)] transition-colors"
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="px-3.5 pt-3.5 pb-3.5 flex flex-col flex-1">
        <p className="text-[11px] text-brand-soft font-bold uppercase tracking-wide mb-1">
          {product.brand}
        </p>
        <p className="text-[15px] font-semibold text-brand leading-snug mb-1.5 line-clamp-2">
          {product.name}
        </p>
        <p className="text-base text-brand font-bold mb-3.5">
          ${product.price % 1 === 0 ? product.price.toFixed(0) : product.price.toFixed(2)}
        </p>

        {/* Action row */}
        <div className="mt-auto grid gap-2">
          <a
            href={product.productUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="min-h-10 flex items-center justify-center rounded-xl text-sm font-bold text-white bg-[#5A171A] shadow-[0_4px_12px_rgba(90,23,26,0.2)] transition-colors hover:bg-[#C96F35]"
          >
            Shop →
          </a>
          <button
            onClick={handleTryOn}
            className="min-h-9 flex items-center justify-center gap-1.5 rounded-xl text-xs font-bold border border-[#E5BE9A] bg-[#FFFCF8] text-brand hover:bg-[#FBE1CC] hover:border-terracotta transition-colors"
          >
            <img src="/assets/sparkle.svg" alt="" className="w-3.5 h-3.5 opacity-90" />
            Try on
          </button>
        </div>
      </div>
    </div>
  );
}
