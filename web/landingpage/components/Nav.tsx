"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Route } from "next";

const LINKS: { href: Route; label: string }[] = [
  { href: "/feed", label: "Shop" },
  { href: "/favorites", label: "Favorites" },
  { href: "/about", label: "About" },
  { href: "/profile", label: "Profile" },
];

export default function Nav() {
  const pathname = usePathname();
  const router = useRouter();

  const signOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <nav style={{
      position: "sticky",
      top: 0,
      zIndex: 100,
      background: "linear-gradient(135deg, #FFD0AE 0%, #FFCFC5 100%)",
      borderBottom: "1px solid rgba(102, 12, 13, 0.08)",
      boxShadow: "0 2px 16px rgba(102, 12, 13, 0.1)",
      display: "flex",
      alignItems: "stretch",
      height: "clamp(56px, 6vw, 80px)",
    }}>
      {/* Logo */}
      <Link
        href="/feed"
        style={{
          display: "flex",
          alignItems: "center",
          padding: "0 2rem",
          textDecoration: "none",
          flexShrink: 0,
        }}
      >
        <img
          src="/sparks-logo.png"
          alt="Sparks"
          style={{ height: "clamp(36px, 4.5vw, 60px)", width: "auto", display: "block" }}
        />
      </Link>

      {/* Nav links — centered group */}
      <div style={{ display: "flex", flex: 1, alignItems: "stretch", justifyContent: "center" }}>
        {LINKS.map(({ href, label }, i) => {
          const active = pathname === href || (href !== "/feed" && pathname.startsWith(href));
          return (
            <>
              <Link
                key={href}
                href={href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "0 clamp(1rem, 2.5vw, 3rem)",
                  fontSize: "clamp(0.85rem, 1.1vw, 1.2rem)",
                  fontWeight: active ? 700 : 400,
                  color: "#660C0D",
                  background: active ? "rgba(102, 12, 13, 0.12)" : "transparent",
                  textDecoration: "none",
                  transition: "background 0.15s",
                  letterSpacing: "0.01em",
                  whiteSpace: "nowrap",
                }}
              >
                {label}
              </Link>
              {i < LINKS.length - 1 && (
                <div style={{
                  width: "1px",
                  height: "40px",
                  background: "rgba(102, 12, 13, 0.2)",
                  alignSelf: "center",
                  flexShrink: 0,
                }} />
              )}
            </>
          );
        })}

      </div>

      {/* Sign out — pinned to right */}
      <button
        onClick={signOut}
        style={{
          padding: "0 clamp(1rem, 2vw, 2.5rem)",
          fontSize: "clamp(0.8rem, 1vw, 1.1rem)",
          color: "rgba(102, 12, 13, 0.5)",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          transition: "color 0.15s",
          whiteSpace: "nowrap",
          alignSelf: "center",
        }}
      >
        Sign out
      </button>
    </nav>
  );
}
