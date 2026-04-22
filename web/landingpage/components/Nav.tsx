"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Route } from "next";

const LINKS: { href: Route; label: string }[] = [
  { href: "/feed", label: "Feed" },
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
      background: "#fff",
      borderBottom: "1px solid #e8e8e8",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 1.5rem",
      height: "56px",
    }}>
      <Link
        href="/feed"
        style={{
          fontFamily: "var(--font-heading)",
          fontSize: "1.4rem",
          fontWeight: 700,
          color: "#111",
          textDecoration: "none",
          letterSpacing: "-0.02em",
        }}
      >
        Sparks
      </Link>

      <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
        {LINKS.map(({ href, label }) => {
          const active = pathname === href || (href !== "/feed" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              style={{
                padding: "0.4rem 0.85rem",
                borderRadius: "8px",
                fontSize: "0.9rem",
                fontWeight: active ? 600 : 400,
                color: active ? "#111" : "#666",
                background: active ? "#f0f0f0" : "transparent",
                textDecoration: "none",
                transition: "background 0.15s, color 0.15s",
              }}
            >
              {label}
            </Link>
          );
        })}
        <button
          onClick={signOut}
          style={{
            marginLeft: "0.5rem",
            padding: "0.4rem 0.85rem",
            borderRadius: "8px",
            fontSize: "0.9rem",
            color: "#888",
            background: "transparent",
            border: "1px solid #e8e8e8",
            cursor: "pointer",
          }}
        >
          Sign out
        </button>
      </div>
    </nav>
  );
}
