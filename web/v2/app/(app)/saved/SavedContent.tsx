"use client";

import { useEffect, useState } from "react";
import ProductCard from "@/components/product/ProductCard";
import { FAVORITES_CHANGED_EVENT, FAVORITES_KEY } from "@/components/product/ProductCard";
import type { Product } from "@/lib/types";

function readFavorites() {
  const stored = window.localStorage.getItem(FAVORITES_KEY);
  if (!stored) return [];

  try {
    return JSON.parse(stored) as Product[];
  } catch {
    window.localStorage.removeItem(FAVORITES_KEY);
    return [];
  }
}

export default function SavedContent() {
  const [favorites, setFavorites] = useState<Product[]>([]);

  useEffect(() => {
    const syncFavorites = () => setFavorites(readFavorites());

    syncFavorites();
    window.addEventListener(FAVORITES_CHANGED_EVENT, syncFavorites);
    window.addEventListener("storage", syncFavorites);

    return () => {
      window.removeEventListener(FAVORITES_CHANGED_EVENT, syncFavorites);
      window.removeEventListener("storage", syncFavorites);
    };
  }, []);

  if (favorites.length === 0) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
          style={{ background: "linear-gradient(135deg, rgba(251,225,204,0.85), rgba(242,161,95,0.28))" }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(102,12,13,0.6)" strokeWidth="1.8">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </div>
        <h1 className="text-2xl font-display font-medium text-brand mb-2">Saved items</h1>
        <p className="text-brand-soft text-sm leading-relaxed max-w-xs mx-auto">
          Heart pieces you love and they&apos;ll show up here.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-2xl font-display font-medium text-brand">Saved items</h1>
      </div>

      <div className="product-grid">
        {favorites.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
