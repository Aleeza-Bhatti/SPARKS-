"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import Image from "next/image";

function TryOnContent() {
  const params = useSearchParams();
  const router = useRouter();

  const img   = params.get("img") ?? "";
  const name  = params.get("name") ?? "Product";
  const brand = params.get("brand") ?? "";
  const price = params.get("price") ?? "";
  const url   = params.get("url") ?? "";

  return (
    <div className="max-w-2xl mx-auto">

      {/* Back */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-sm text-brand-soft hover:text-brand transition-colors mb-6"
      >
        ← Back
      </button>

      <div className="flex items-start gap-2 mb-6">
        <img src="/assets/sparkle.svg" alt="" className="w-5 h-5 mt-0.5 sparkle-pulse flex-shrink-0" />
        <div>
          <p className="text-xs font-semibold tracking-widest uppercase text-brand-soft mb-0.5">Virtual try-on</p>
          <h1 className="text-2xl font-display font-medium text-brand tracking-tight">
            See how it looks on you.
          </h1>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">

        {/* Avatar / upload area — left */}
        <div className="flex flex-col gap-4">

          {/* Upload zone */}
          <div className="flex-1 bg-white border-2 border-dashed border-[rgba(102,12,13,0.15)] rounded-2xl flex flex-col items-center justify-center p-8 text-center min-h-[220px] hover:border-[rgba(102,12,13,0.3)] hover:bg-[rgba(102,12,13,0.02)] transition-colors cursor-pointer">
            <div className="w-12 h-12 rounded-full bg-[rgba(102,12,13,0.06)] flex items-center justify-center mb-3">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(102,12,13,0.5)" strokeWidth="1.8">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </div>
            <p className="text-sm font-medium text-brand mb-1">Upload your photo</p>
            <p className="text-xs text-brand-soft">A full-body photo works best</p>
          </div>

          {/* Coming soon banner */}
          <div
            className="rounded-2xl px-4 py-4 text-center"
            style={{ background: "linear-gradient(135deg, rgba(255,207,197,0.4) 0%, rgba(255,208,174,0.3) 100%)", border: "1px solid rgba(102,12,13,0.1)" }}
          >
            <div className="flex items-center justify-center gap-2 mb-1.5">
              <img src="/assets/sparkle.svg" alt="" className="w-4 h-4 sparkle-pulse" />
              <p className="text-sm font-semibold text-brand">AI try-on coming soon</p>
            </div>
            <p className="text-xs text-brand-soft leading-relaxed">
              We&apos;re building AI-powered virtual try-on. You&apos;ll be able to see exactly how any piece looks on your body before buying.
            </p>
          </div>
        </div>

        {/* Product preview — right */}
        <div className="flex flex-col gap-4">
          <div className="bg-white border border-[rgba(102,12,13,0.08)] rounded-2xl overflow-hidden">
            <div className="relative aspect-[3/4] w-full">
              {img ? (
                <Image src={img} alt={name} fill className="object-cover" unoptimized />
              ) : (
                <div className="absolute inset-0 bg-[rgba(102,12,13,0.04)] flex items-center justify-center">
                  <span className="text-brand-soft text-sm">No image</span>
                </div>
              )}
            </div>
            <div className="px-4 py-3">
              <p className="text-xs text-brand-soft font-medium uppercase tracking-wide mb-0.5">{brand}</p>
              <p className="text-sm font-medium text-brand line-clamp-2 mb-1">{name}</p>
              {price && <p className="text-sm font-semibold text-brand">${parseFloat(price) % 1 === 0 ? parseFloat(price).toFixed(0) : parseFloat(price).toFixed(2)}</p>}
            </div>
          </div>

          {/* Shop CTA */}
          {url && (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full text-center py-3 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ background: "linear-gradient(135deg, #c24f5a, #af6a43)" }}
            >
              Shop this piece →
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export default function TryOnPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-20">
        <div className="loading-bar h-1.5 w-48 rounded-full">
          <div className="loading-bar-fill" />
        </div>
      </div>
    }>
      <TryOnContent />
    </Suspense>
  );
}
