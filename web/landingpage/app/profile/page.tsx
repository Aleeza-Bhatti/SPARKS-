import { redirect } from "next/navigation";
import Link from "next/link";
import Nav from "@/components/Nav";
import { createClient } from "@/lib/supabase/server";

const AESTHETIC_LABELS: Record<string, string> = {
  dark_feminine: "Dark Feminine",
  cottagecore: "Cottagecore",
  minimalist: "Minimalist",
  streetwear: "Streetwear",
  bohemian: "Bohemian",
  old_money: "Old Money",
  soft_girl: "Soft Girl",
  coastal: "Coastal",
  academia: "Academia",
  maximalist: "Maximalist",
};

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("style_profiles")
    .select("aesthetics, raw_text_dump, updated_at")
    .eq("user_id", user.id)
    .single();

  const { count: favCount } = await supabase
    .from("favorites")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  const displayName = user.user_metadata?.full_name || user.email?.split("@")[0] || "Your profile";
  const updatedAt = profile?.updated_at
    ? new Date(profile.updated_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    : null;

  return (
    <div style={{ minHeight: "100vh", background: "#FEF7F0" }}>
      <Nav />
      <main className="page-main">

        {/* Header */}
        <div style={{ marginBottom: "3.5rem" }}>
          <p style={{ color: "rgba(102, 12, 13, 0.45)", fontSize: "1.1rem", marginBottom: "0.4rem" }}>
            {user.email}
          </p>
          <h1 style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(1.6rem, 2.5vw, 2.2rem)",
            fontWeight: 500,
            color: "#660C0D",
            letterSpacing: "-0.02em",
            lineHeight: 1,
          }}>
            {displayName}
          </h1>
        </div>

        {/* Style section */}
        <section style={{ marginBottom: "3rem", paddingBottom: "3rem", borderBottom: "1px solid rgba(102, 12, 13, 0.1)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.2rem, 1.8vw, 1.6rem)", fontWeight: 500, color: "#660C0D" }}>
              Your style
            </h2>
            {updatedAt && (
              <span style={{ fontSize: "1rem", color: "rgba(102, 12, 13, 0.35)" }}>Updated {updatedAt}</span>
            )}
          </div>

          {profile?.aesthetics?.length ? (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.6rem", marginBottom: profile?.raw_text_dump ? "1.25rem" : 0 }}>
              {(profile.aesthetics as string[]).map((a) => (
                <span key={a} style={{
                  padding: "0.45rem 1.1rem",
                  background: "rgba(102, 12, 13, 0.07)",
                  borderRadius: "999px",
                  fontSize: "1rem",
                  fontWeight: 500,
                  color: "#660C0D",
                }}>
                  {AESTHETIC_LABELS[a] ?? a}
                </span>
              ))}
            </div>
          ) : (
            <p style={{ color: "rgba(102, 12, 13, 0.45)", fontSize: "1.1rem" }}>No style profile yet.</p>
          )}

          {profile?.raw_text_dump && (
            <p style={{ color: "rgba(102, 12, 13, 0.6)", fontSize: "1.1rem", lineHeight: 1.6, fontStyle: "italic" }}>
              "{profile.raw_text_dump}"
            </p>
          )}
        </section>

        {/* Actions */}
        <section>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.2rem, 1.8vw, 1.6rem)", fontWeight: 500, color: "#660C0D", marginBottom: "0.5rem" }}>
            Settings
          </h2>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {([
              { href: "/quiz", title: "Redo style quiz", subtitle: "Update your aesthetic preferences" },
              { href: "/favorites", title: "Saved items", subtitle: favCount ? `${favCount} saved product${favCount === 1 ? "" : "s"}` : "Nothing saved yet" },
            ] as const).map(({ href, title, subtitle }, i) => (
              <Link key={href} href={href} style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "1.4rem 0",
                borderBottom: "1px solid rgba(102, 12, 13, 0.08)",
                textDecoration: "none",
                color: "#660C0D",
              }}>
                <div>
                  <p style={{ fontWeight: 600, marginBottom: "0.2rem", fontSize: "1.2rem" }}>{title}</p>
                  <p style={{ fontSize: "1rem", color: "rgba(102, 12, 13, 0.5)" }}>{subtitle}</p>
                </div>
                <span style={{ color: "rgba(102, 12, 13, 0.3)", fontSize: "1.4rem" }}>→</span>
              </Link>
            ))}
            <a href="/api/pinterest/auth" style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "1.4rem 0",
              textDecoration: "none",
              color: "#660C0D",
            }}>
              <div>
                <p style={{ fontWeight: 600, marginBottom: "0.2rem", fontSize: "1.2rem" }}>Connect Pinterest</p>
                <p style={{ fontSize: "1rem", color: "rgba(102, 12, 13, 0.5)" }}>Import a board to refine your feed</p>
              </div>
              <span style={{ color: "rgba(102, 12, 13, 0.3)", fontSize: "1.4rem" }}>→</span>
            </a>
          </div>
        </section>

      </main>
    </div>
  );
}
