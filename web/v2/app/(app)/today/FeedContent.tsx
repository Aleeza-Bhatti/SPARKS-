"use client";

import { useState } from "react";
import SearchBar from "@/components/search/SearchBar";
import ThinkingSteps from "@/components/search/ThinkingSteps";
import ProductCard from "@/components/product/ProductCard";
import type { Product } from "@/lib/types";

interface FeedContentProps {
  initialProducts: Product[];
}

export default function FeedContent({ initialProducts }: FeedContentProps) {
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Product[] | null>(null);
  const [searchIntent, setSearchIntent] = useState<string | null>(null);
  const [searchError, setSearchError] = useState("");

  const handleSearch = async (query: string) => {
    setSearching(true);
    setSearchError("");
    setSearchResults(null);
    setSearchIntent(null);

    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      if (!res.ok) { setSearchError("Search failed. Please try again."); return; }
      const data = await res.json() as { results: Product[]; intent: string };
      setSearchIntent(data.intent);
      setSearchResults(data.results);
    } catch {
      setSearchError("Something went wrong. Please try again.");
    } finally {
      setSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchResults(null);
    setSearchIntent(null);
    setSearchError("");
  };

  const isSearching = searching;
  const hasSearchResults = searchResults !== null;
  const displayProducts = searchResults ?? initialProducts;

  return (
    <div>
      {/* Search bar */}
      <div className="mb-6">
        <SearchBar onSearch={handleSearch} loading={searching} />
      </div>

      {/* Thinking / loading */}
      {isSearching && <ThinkingSteps active />}

      {/* Search error */}
      {searchError && !isSearching && (
        <p className="text-sm text-terracotta text-center py-4">{searchError}</p>
      )}

      {/* Feed header */}
      {!isSearching && (
        <div className="mb-5">
          {hasSearchResults ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img src="/assets/sparkle.svg" alt="" className="w-4 h-4 sparkle-pulse" />
                <p className="text-sm font-medium text-brand">
                  {searchIntent ?? "Search results"}
                </p>
              </div>
              <button
                onClick={clearSearch}
                className="text-xs text-brand-soft hover:text-brand transition-colors"
              >
                ← Back to feed
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <img src="/assets/sparkle.svg" alt="" className="w-4 h-4 sparkle-pulse" />
              <p className="text-base font-semibold tracking-widest uppercase text-brand-soft">
                Today&apos;s picks
              </p>
            </div>
          )}
        </div>
      )}

      {/* Products grid */}
      {!isSearching && displayProducts.length > 0 && (
        <div className="product-grid">
          {displayProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}

      {!isSearching && hasSearchResults && searchResults?.length === 0 && (
        <p className="text-sm text-brand-soft text-center py-12">
          No results found. Try different search terms.
        </p>
      )}
    </div>
  );
}
