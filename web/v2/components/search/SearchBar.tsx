"use client";

import { useState } from "react";

interface SearchBarProps {
  onSearch: (query: string) => void;
  loading: boolean;
}

export default function SearchBar({ onSearch, loading }: SearchBarProps) {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || loading) return;
    onSearch(query.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="e.g. flowy midi skirt for summer, modest office look…"
        disabled={loading}
        className="w-full bg-card-bg border border-warm-line rounded-2xl px-4 py-3.5 pr-14 text-sm text-brand placeholder:text-brand-soft/40 focus:outline-none focus:ring-2 focus:ring-brand/30 disabled:opacity-60"
      />
      <button
        type="submit"
        disabled={!query.trim() || loading}
        aria-label="Search"
        className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-xl bg-brand text-cream disabled:opacity-40 hover:bg-brand/90 transition-colors"
      >
        {loading ? (
          <span className="w-3.5 h-3.5 border-2 border-cream/40 border-t-cream rounded-full animate-spin" />
        ) : (
          <span className="text-sm leading-none">→</span>
        )}
      </button>
    </form>
  );
}
