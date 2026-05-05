"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { Product } from "@/lib/types";

export default function ProductCard({ product }: { product: Product }) {
  const router = useRouter();
  const [reported, setReported] = useState(false);
  const [showReportMenu, setShowReportMenu] = useState(false);

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
    <div className="bg-white rounded-2xl overflow-hidden border border-[rgba(102,12,13,0.08)] shadow-sm group flex flex-col card-hover relative">

      {/* Image */}
      <a
        href={product.productUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block relative overflow-hidden"
        style={{ aspectRatio: "3/4" }}
      >
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          unoptimized
        />

        {/* Report button — top-left, shows on hover */}
        <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {reported ? (
            <span className="bg-white/90 text-brand-soft text-xs px-2 py-0.5 rounded-full shadow-sm">
              Reported ✓
            </span>
          ) : (
            <div className="relative">
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowReportMenu((v) => !v); }}
                className="bg-white/90 hover:bg-white text-brand-soft hover:text-terracotta text-xs px-2 py-1 rounded-full shadow-sm transition-colors flex items-center gap-1"
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
      </a>

      {/* Info */}
      <div className="px-3.5 pt-3 pb-3 flex flex-col flex-1">
        <p className="text-xs text-brand-soft font-medium uppercase tracking-wide mb-0.5">
          {product.brand}
        </p>
        <p className="text-sm font-medium text-brand leading-snug mb-1 line-clamp-2">
          {product.name}
        </p>
        <p className="text-sm text-brand font-semibold mb-3">
          ${product.price % 1 === 0 ? product.price.toFixed(0) : product.price.toFixed(2)}
        </p>

        {/* Action row */}
        <div className="mt-auto flex items-center gap-2">
          <button
            onClick={handleTryOn}
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold border border-[rgba(102,12,13,0.15)] text-brand hover:bg-[rgba(102,12,13,0.05)] transition-colors"
          >
            <img src="/assets/sparkle.svg" alt="" className="w-3 h-3 opacity-70" />
            Try on
          </button>
          <a
            href={product.productUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 text-center py-1.5 rounded-lg text-xs font-semibold text-white transition-opacity hover:opacity-85"
            style={{ background: "linear-gradient(135deg, #c24f5a, #af6a43)" }}
          >
            Shop →
          </a>
        </div>
      </div>
    </div>
  );
}
