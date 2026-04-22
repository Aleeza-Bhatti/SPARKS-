const SERPAPI_KEY = process.env.SERPAPI_KEY;

export type RawProduct = {
  title: string;
  brand: string;
  price: number;
  imageUrl: string;
  productUrl: string;
  source: string;
  sourceQuery: string;
};

export async function fetchProductsForQuery(query: string): Promise<RawProduct[]> {
  if (!SERPAPI_KEY) throw new Error("SERPAPI_KEY is not set");

  const params = new URLSearchParams({
    engine: "google_shopping",
    q: query,
    api_key: SERPAPI_KEY,
    num: "10",
    gl: "us",
    hl: "en",
  });

  const response = await fetch(`https://serpapi.com/search?${params.toString()}`);
  const json = await response.json();

  if (!response.ok) throw new Error(json?.error || "SerpApi request failed");

  const results = Array.isArray(json.shopping_results) ? json.shopping_results : [];

  const mapped: RawProduct[] = [];
  for (const item of results as Record<string, unknown>[]) {
    const price = parseFloat(String(item.price ?? "0").replace(/[^0-9.]/g, ""));
    const link = String(item.link ?? item.product_link ?? "");
    const image = String(item.thumbnail ?? "");
    const title = String(item.title ?? "");
    const source = String(item.source ?? "");
    if (!title || !image || !link || !price || price <= 0) continue;
    mapped.push({ title, brand: source, price, imageUrl: image, productUrl: link, source: "serpapi", sourceQuery: query });
  }
  return mapped;
}

export async function fetchProductsForQueries(queries: string[]): Promise<RawProduct[]> {
  // Fire all queries in parallel
  const results = await Promise.allSettled(
    queries.map((query) => fetchProductsForQuery(query))
  );

  const all: RawProduct[] = [];
  results.forEach((result) => {
    if (result.status === "fulfilled") {
      all.push(...result.value);
    }
  });

  // Deduplicate by productUrl
  const seen = new Set<string>();
  return all.filter((product) => {
    if (seen.has(product.productUrl)) return false;
    seen.add(product.productUrl);
    return true;
  });
}
