import { signInWithGoogle } from "./actions";

export default function LoginPage() {
  return (
    <main style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", gap: "1.5rem" }}>
      <h1 style={{ fontSize: "2rem", fontFamily: "var(--font-heading)" }}>Welcome to Sparks</h1>
      <form action={signInWithGoogle}>
        <button
          type="submit"
          style={{ padding: "0.75rem 2rem", fontSize: "1rem", cursor: "pointer", borderRadius: "8px", border: "1px solid #ccc", background: "#fff" }}
        >
          Continue with Google
        </button>
      </form>
    </main>
  );
}
