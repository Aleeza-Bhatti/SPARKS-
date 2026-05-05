import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { createAdminClient } from "@/lib/supabase/server";
import { rankByEmbedding, ALL_PRODUCTS } from "@/lib/products";
import { generateEmbedding } from "@/lib/embeddings";
import FeedContent from "./FeedContent";

export default async function TodayPage() {
  const session = await getSession();
  if (!session) redirect("/");

  const db = createAdminClient();
  const { data: profile } = await db
    .from("v2_style_profiles")
    .select("summary")
    .eq("pinterest_user_id", session.userId)
    .single();

  let products;
  if (profile?.summary) {
    try {
      const embedding = await generateEmbedding(profile.summary);
      products = rankByEmbedding(embedding, 12);
    } catch {
      products = ALL_PRODUCTS.slice(0, 12);
    }
  } else {
    products = ALL_PRODUCTS.slice(0, 12);
  }

  return <FeedContent initialProducts={products} />;
}
