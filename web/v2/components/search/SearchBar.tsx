"use client";

import { useState } from "react";
import { Search } from "lucide-react";

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
        placeholder="What are you looking for?"
        disabled={loading}
        className="w-full bg-[#FFFCF8] border border-[#E5BE9A] rounded-2xl px-4 py-3.5 pr-14 text-sm font-medium text-brand shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] placeholder:text-brand-soft/70 focus:outline-none focus:border-brand/60 focus:ring-2 focus:ring-brand/25 disabled:opacity-60"
      />
      <button
        type="submit"
        disabled={!query.trim() || loading}
        aria-label="Search"
        className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full text-terracotta disabled:opacity-40 hover:bg-[#FBE1CC] hover:text-brand transition-colors"
      >
        {loading ? (
          <span className="w-3.5 h-3.5 border-2 border-brand/25 border-t-brand rounded-full animate-spin" />
        ) : (
          <Search className="w-4 h-4" aria-hidden="true" />
        )}
      </button>
    </form>
  );
}
