"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ExternalLink, Flag, Heart, Sparkles } from "lucide-react";
import type { Product } from "@/lib/types";

const SAVED_KEY = "sparks_v2_saved";

/** Dispatched when saved items change so other surfaces (e.g. saved page) can refresh. */
export const SAVED_ITEMS_CHANGED_EVENT = "sparks-v2-saved-changed";

function useSaved(productId: string) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const items = JSON.parse(localStorage.getItem(SAVED_KEY) ?? "[]") as Product[];
      setSaved(items.some((p) => p.id === productId));
    } catch {
      /* ignore */
    }

    const onStorage = () => {
      try {
        const items = JSON.parse(localStorage.getItem(SAVED_KEY) ?? "[]") as Product[];
        setSaved(items.some((p) => p.id === productId));
      } catch {
        setSaved(false);
      }
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener(SAVED_ITEMS_CHANGED_EVENT, onStorage);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(SAVED_ITEMS_CHANGED_EVENT, onStorage);
    };
  }, [productId]);

  const toggle = useCallback((product: Product) => {
    try {
      const items = JSON.parse(localStorage.getItem(SAVED_KEY) ?? "[]") as Product[];
      const exists = items.some((p) => p.id === product.id);
      const updated = exists ? items.filter((p) => p.id !== product.id) : [product, ...items];
      localStorage.setItem(SAVED_KEY, JSON.stringify(updated));
      setSaved(!exists);
      window.dispatchEvent(new Event(SAVED_ITEMS_CHANGED_EVENT));
    } catch {
      /* storage full */
    }
  }, []);

  return { saved, toggle };
}

export default function ProductCard({ product }: { product: Product }) {
  const router = useRouter();
  const [reported, setReported] = useState(false);
  const [showReportMenu, setShowReportMenu] = useState(false);
  const { saved, toggle } = useSaved(product.id);

  const handleReport = (reason: string) => {
    setShowReportMenu(false);
    setReported(true);
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
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-[#621414] bg-white shadow-[0_8px_24px_rgba(90,23,26,0.08)]">

      {/* Image */}
      <a
        href={product.productUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="relative block overflow-hidden bg-[#F3EEE8]"
        style={{ aspectRatio: "3/4" }}
      >
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          unoptimized
        />

        {/* Report overlay — top-left, visible on hover */}
        <div className="absolute left-2 top-2 opacity-0 transition-opacity group-hover:opacity-100">
          {reported ? (
            <span className="inline-flex items-center rounded-full bg-white/90 px-2 py-1 text-xs font-semibold text-brand shadow-sm backdrop-blur-sm">
              Reported ✓
            </span>
          ) : (
            <div className="relative">
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowReportMenu((v) => !v); }}
                className="inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-xs font-semibold text-brand-soft shadow-sm backdrop-blur-sm transition-colors hover:text-brand"
                aria-label="Report this product"
              >
                <Flag className="h-3 w-3" aria-hidden="true" />
                Report
              </button>
              {showReportMenu && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setShowReportMenu(false)} />
                  <div className="absolute left-0 top-8 z-30 min-w-[160px] rounded-xl border border-[rgba(102,12,13,0.1)] bg-white py-1 shadow-lg">
                    <p className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-brand-soft">
                      Why are you reporting?
                    </p>
                    {["Not modest", "Wrong size", "Broken link", "Not my style", "Other"].map((r) => (
                      <button
                        key={r}
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleReport(r); }}
                        className="w-full px-3 py-2 text-left text-xs text-brand transition-colors hover:bg-[rgba(102,12,13,0.04)]"
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
      </a>

      {/* Info */}
      <div className="flex flex-col px-3 pb-0 pt-3">
        <p className="text-xs font-bold uppercase tracking-wide text-brand-soft">
          {product.brand}
        </p>
        <p className="mt-1 line-clamp-2 text-sm font-semibold leading-snug text-brand">
          {product.name}
        </p>
        <p className="mt-1.5 text-sm font-bold text-brand">
          ${product.price % 1 === 0 ? product.price.toFixed(0) : product.price.toFixed(2)}
        </p>

        {product.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {product.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-[rgba(102,12,13,0.1)] bg-[#FFFCF8] px-2 py-0.5 text-xs capitalize text-brand-soft"
              >
                {tag.replace(/-/g, " ")}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Action row */}
      <div className="mt-3 grid grid-cols-3 divide-x divide-[#621414] border-t border-[#621414]">
        <a
          href={product.productUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex min-h-9 items-center justify-center gap-1.5 text-sm font-bold text-brand transition-colors hover:bg-[#FBE1CC]"
        >
          Shop
          <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
        </a>
        <button
          onClick={handleTryOn}
          className="grid min-h-9 place-items-center text-brand transition-colors hover:bg-[#FBE1CC]"
          aria-label="Try on"
        >
          <Sparkles className="h-4 w-4" aria-hidden="true" />
        </button>
        <button
          onClick={() => toggle(product)}
          className={`grid min-h-9 place-items-center transition-colors ${
            saved ? "text-terracotta" : "text-brand hover:text-terracotta"
          }`}
          aria-label={saved ? "Remove from saved" : "Add to saved"}
          aria-pressed={saved}
        >
          <Heart className="h-4 w-4" fill={saved ? "currentColor" : "none"} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
