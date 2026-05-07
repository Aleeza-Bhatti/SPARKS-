"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { Product } from "@/lib/types";
import { SAVED_ITEMS_CHANGED_EVENT } from "@/components/product/ProductCard";

const SAVED_KEY = "sparks_v2_saved";

export default function SavedPage() {
  const router = useRouter();
  const [items, setItems] = useState<Product[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SAVED_KEY);
      setItems(raw ? (JSON.parse(raw) as Product[]) : []);
    } catch {
      setItems([]);
    }
    setHydrated(true);

    const sync = () => {
      try {
        const raw = localStorage.getItem(SAVED_KEY);
        setItems(raw ? (JSON.parse(raw) as Product[]) : []);
      } catch {
        setItems([]);
      }
    };
    window.addEventListener(SAVED_ITEMS_CHANGED_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(SAVED_ITEMS_CHANGED_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const remove = (id: string) => {
    setItems((prev) => {
      const updated = prev.filter((p) => p.id !== id);
      localStorage.setItem(SAVED_KEY, JSON.stringify(updated));
      window.dispatchEvent(new Event(SAVED_ITEMS_CHANGED_EVENT));
      return updated;
    });
  };

  if (!hydrated) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="loading-bar h-1.5 w-48 rounded-full">
          <div className="loading-bar-fill" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-start gap-2 mb-6">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: "linear-gradient(135deg, rgba(255,207,197,0.5), rgba(255,208,174,0.4))" }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(102,12,13,0.6)" strokeWidth="1.8">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </div>
        <div>
          <h1 className="text-2xl font-display font-medium text-brand">Saved items</h1>
          <p className="text-sm text-brand-soft mt-0.5">
            {items.length} item{items.length !== 1 ? "s" : ""} saved
          </p>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-brand-soft text-sm mb-4">Heart pieces you love and they&apos;ll show up here.</p>
          <button
            onClick={() => router.push("/today")}
            className="text-sm font-semibold text-brand hover:underline"
          >
            Browse the feed →
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {items.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl overflow-hidden border border-[rgba(102,12,13,0.08)] shadow-sm group relative">
                <a href={item.productUrl} target="_blank" rel="noopener noreferrer" className="block relative" style={{ aspectRatio: "3/4" }}>
                  <Image src={item.imageUrl} alt={item.name} fill className="object-cover" unoptimized sizes="(max-width: 640px) 50vw, 33vw" />
                  <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); remove(item.id); }}
                    className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-brand-soft hover:text-terracotta border-none cursor-pointer shadow-sm"
                    title="Remove"
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </a>
                <div className="px-3 py-2.5">
                  <p className="text-xs text-brand-soft font-medium uppercase tracking-wide mb-0.5">{item.brand}</p>
                  <p className="text-xs font-medium text-brand line-clamp-2">{item.name}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 text-center">
            <button
              onClick={() => router.push("/tryon")}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white shadow-sm hover:opacity-90 transition-opacity"
              style={{ background: "linear-gradient(135deg, #c24f5a, #af6a43)" }}
            >
              <img src="/assets/sparkle.svg" alt="" className="w-3.5 h-3.5 sparkle-pulse" />
              Try these on →
            </button>
          </div>
        </>
      )}
    </div>
  );
}
