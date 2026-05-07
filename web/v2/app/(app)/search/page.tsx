"use client";

import { useState } from "react";
import SearchBar from "@/components/search/SearchBar";
import ThinkingSteps from "@/components/search/ThinkingSteps";
import ProductCard from "@/components/product/ProductCard";
import type { Product } from "@/lib/types";

export default function SearchPage() {
  const [loading, setLoading] = useState(false);
  const [intent, setIntent] = useState<string | null>(null);
  const [results, setResults] = useState<Product[] | null>(null);
  const [error, setError] = useState("");

  const handleSearch = async (query: string) => {
    setLoading(true);
    setError("");
    setResults(null);
    setIntent(null);

    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      if (!res.ok) {
        setError("Search failed. Please try again.");
        return;
      }

      const data = (await res.json()) as { results: Product[]; intent: string };
      setIntent(data.intent);
      setResults(data.results);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-display font-medium text-brand tracking-tight mb-4">Search</h1>
        <SearchBar onSearch={handleSearch} loading={loading} />
      </div>

      {loading && <ThinkingSteps active />}

      {error && !loading && (
        <p className="text-sm text-terracotta text-center py-8">{error}</p>
      )}

      {results && !loading && (
        <div>
          {intent && (
            <p className="text-xs text-brand-soft mb-4">
              Showing results for:{" "}
              <span className="text-brand font-medium">{intent}</span>
            </p>
          )}
          {results.length === 0 ? (
            <p className="text-sm text-brand-soft text-center py-12">
              No results found. Try different search terms.
            </p>
          ) : (
            <div className="product-grid">
              {results.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      )}

      {!loading && !results && !error && (
        <div className="text-center py-16">
          <img src="/assets/sparkle.svg" alt="" className="w-8 h-8 mx-auto mb-4 sparkle-pulse opacity-40" />
          <p className="text-sm text-brand-soft leading-relaxed">
            Describe what you&apos;re looking for —<br />
            occasion, silhouette, colors, anything.
          </p>
        </div>
      )}
    </div>
  );
}
