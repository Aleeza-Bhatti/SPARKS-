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
    <>
      <Nav />
      <main style={{ maxWidth: "640px", margin: "0 auto", padding: "3rem 1.5rem 5rem" }}>

        {/* Header */}
        <div style={{ marginBottom: "2.5rem" }}>
          <p style={{ color: "#888", fontSize: "0.85rem", marginBottom: "0.25rem" }}>{user.email}</p>
          <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "2rem" }}>{displayName}</h1>
        </div>

        {/* Style profile section */}
        <section style={{ marginBottom: "2rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
            <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "1.2rem" }}>Your style</h2>
            {updatedAt && (
              <span style={{ fontSize: "0.8rem", color: "#aaa" }}>Updated {updatedAt}</span>
            )}
          </div>

          {profile?.aesthetics?.length ? (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1rem" }}>
              {(profile.aesthetics as string[]).map((a) => (
                <span
                  key={a}
                  style={{
                    padding: "0.35rem 0.85rem",
                    background: "#f0f0f0",
                    borderRadius: "999px",
                    fontSize: "0.85rem",
                    fontWeight: 500,
                    color: "#333",
                  }}
                >
                  {AESTHETIC_LABELS[a] ?? a}
                </span>
              ))}
            </div>
          ) : (
            <p style={{ color: "#888", fontSize: "0.9rem", marginBottom: "1rem" }}>
              No style profile yet.
            </p>
          )}

          {profile?.raw_text_dump && (
            <p style={{ color: "#666", fontSize: "0.9rem", lineHeight: 1.6, fontStyle: "italic" }}>
              "{profile.raw_text_dump}"
            </p>
          )}
        </section>

        {/* Actions */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "2.5rem" }}>
          <Link
            href="/quiz"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "1rem 1.25rem",
              border: "1px solid #e0e0e0",
              borderRadius: "12px",
              textDecoration: "none",
              color: "#111",
              background: "#fff",
            }}
          >
            <div>
              <p style={{ fontWeight: 600, marginBottom: "0.15rem" }}>Redo style quiz</p>
              <p style={{ fontSize: "0.85rem", color: "#888" }}>Update your aesthetic preferences</p>
            </div>
            <span style={{ color: "#bbb" }}>→</span>
          </Link>

          <Link
            href="/favorites"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "1rem 1.25rem",
              border: "1px solid #e0e0e0",
              borderRadius: "12px",
              textDecoration: "none",
              color: "#111",
              background: "#fff",
            }}
          >
            <div>
              <p style={{ fontWeight: 600, marginBottom: "0.15rem" }}>Saved items</p>
              <p style={{ fontSize: "0.85rem", color: "#888" }}>
                {favCount ? `${favCount} saved product${favCount === 1 ? "" : "s"}` : "Nothing saved yet"}
              </p>
            </div>
            <span style={{ color: "#bbb" }}>→</span>
          </Link>

          <Link
            href="/api/pinterest/auth"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "1rem 1.25rem",
              border: "1px solid #e0e0e0",
              borderRadius: "12px",
              textDecoration: "none",
              color: "#111",
              background: "#fff",
            }}
          >
            <div>
              <p style={{ fontWeight: 600, marginBottom: "0.15rem" }}>Connect Pinterest</p>
              <p style={{ fontSize: "0.85rem", color: "#888" }}>Import a board to refine your feed</p>
            </div>
            <span style={{ color: "#bbb" }}>→</span>
          </Link>
        </div>

      </main>
    </>
  );
}
