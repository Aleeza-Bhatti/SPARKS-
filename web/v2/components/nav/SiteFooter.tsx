import { Instagram } from "lucide-react";

export default function SiteFooter() {
  return (
    <footer className="border-t border-[rgba(102,12,13,0.1)] bg-white/95 px-4 py-6 text-brand shadow-[0_-1px_8px_rgba(102,12,13,0.04)] sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-[1800px] flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <a href="/" className="text-sm font-bold tracking-wide">
            Sparks
          </a>
          <p className="mt-1 text-xs text-brand-soft">
            Discover modest fashion that matches your style
          </p>
        </div>

        <nav className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-semibold text-brand-soft">
          <a href="/today" className="transition-colors hover:text-brand">
            Feed
          </a>
          <a href="/saved" className="transition-colors hover:text-brand">
            Saved
          </a>
          <a href="/occasion" className="transition-colors hover:text-brand">
            Occasion
          </a>
          <a href="mailto:sparksmodestfashion@gmail.com" className="transition-colors hover:text-brand">
            Contact
          </a>
          <a
            href="https://www.tiktok.com/@sparksmodestfashion"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 transition-colors hover:text-brand"
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M16.6 2c.32 2.76 1.86 4.42 4.4 4.6v3.12a8.04 8.04 0 0 1-4.34-1.24v6.52c0 4.04-2.48 7-6.6 7A6.1 6.1 0 0 1 4 15.84c0-3.7 2.86-6.38 6.86-6.18v3.22c-1.88-.26-3.28.76-3.28 2.8 0 1.78 1.08 3.02 2.64 3.02 1.82 0 2.9-1.08 2.9-3.58V2h3.48Z" />
            </svg>
            TikTok
          </a>
          <a
            href="https://www.instagram.com/sparks_modestfashion"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 transition-colors hover:text-brand"
          >
            <Instagram className="h-3.5 w-3.5" aria-hidden="true" />
            Instagram
          </a>
        </nav>

        <p className="text-xs text-brand-soft/70">
          © 2026 Sparks
        </p>
      </div>
    </footer>
  );
}
