"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const LINKS = [
  { href: "/today",    label: "Feed" },
  { href: "/saved",    label: "Saved" },
  { href: "/tryon",   label: "Try on" },
  { href: "/occasion", label: "Occasion" },
];

export default function AppNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await fetch("/api/auth/signout", { method: "POST" });
    router.push("/");
  };

  const handleRedoQuiz = async () => {
    setMenuOpen(false);
    await fetch("/api/dev/reset", { method: "POST" });
    router.push("/onboarding/select-board");
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[rgba(102,12,13,0.1)] shadow-[0_1px_8px_rgba(102,12,13,0.06)]">
      <div className="flex items-center justify-between px-3 py-3.5 sm:px-5 sm:py-4 lg:px-8 max-w-[1800px] mx-auto w-full gap-2 sm:gap-3">

        {/* Logo */}
        <Link href="/" className="flex-shrink-0">
          <Image
            src="/sparks-logo.png"
            alt="Sparks"
            width={144}
            height={46}
            className="h-10 sm:h-12 w-auto"
            priority
          />
        </Link>

        {/* Nav links — scrollable on mobile */}
        <div className="flex items-center gap-0.5 overflow-x-auto scrollbar-none flex-1 justify-start sm:justify-center min-w-0">
          {LINKS.map(({ href, label }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={`flex-shrink-0 px-3 py-1.5 sm:px-3.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                  active
                    ? "bg-brand text-white shadow-sm"
                    : "text-[rgba(102,12,13,0.55)] hover:text-brand hover:bg-[rgba(102,12,13,0.06)]"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </div>

        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="w-9 h-9 rounded-full bg-[rgba(102,12,13,0.07)] flex items-center justify-center hover:bg-[rgba(102,12,13,0.13)] transition-colors border border-[rgba(102,12,13,0.1)]"
            aria-label="Account menu"
          >
            <img src="/assets/sparkle.svg" alt="" className="w-4 h-4 sparkle-pulse" />
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-11 z-20 bg-white border border-[rgba(102,12,13,0.1)] rounded-2xl shadow-lg py-1.5 min-w-[160px]">
                <button
                  onClick={handleRedoQuiz}
                  className="w-full text-left px-4 py-2.5 text-sm text-brand hover:bg-[rgba(102,12,13,0.04)] transition-colors"
                >
                  Redo style quiz
                </button>
                <div className="border-t border-[rgba(102,12,13,0.07)] my-1" />
                <button
                  onClick={handleSignOut}
                  className="w-full text-left px-4 py-2.5 text-sm text-terracotta hover:bg-[rgba(102,12,13,0.04)] transition-colors"
                >
                  Sign out
                </button>
              </div>
            </>
          )}
        </div>

      </div>
    </nav>
  );
}
