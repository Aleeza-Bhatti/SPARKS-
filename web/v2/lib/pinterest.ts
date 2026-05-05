import type { PinterestBoard, PinterestPin } from "./types";

const BASE = "https://api.pinterest.com/v5";

async function pinterestFetch(path: string, token: string) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Pinterest API ${res.status}: ${text}`);
  }
  return res.json();
}

export async function getPinterestUser(token: string) {
  const data = await pinterestFetch("/user_account", token);
  return {
    id: String(data.username ?? data.id ?? "unknown"),
    name: String(data.business_name ?? data.username ?? ""),
    avatar_url: (data.profile_image as string | null) ?? null,
  };
}

export async function getBoards(token: string): Promise<PinterestBoard[]> {
  const data = await pinterestFetch("/boards?page_size=50", token);
  const items: PinterestBoard[] = ((data.items ?? []) as Record<string, unknown>[]).map((b) => ({
    id: String(b.id),
    name: String(b.name),
    pin_count: Number(b.pin_count ?? 0),
    cover_image_url:
      ((b.media as Record<string, unknown> | undefined)?.image_cover_url as string | null) ?? null,
  }));
  return items;
}

function extractPinImageUrl(pin: Record<string, unknown>): string | null {
  const images = (pin?.media as Record<string, unknown> | undefined)
    ?.images as Record<string, unknown> | undefined;
  if (images && typeof images === "object") {
    const first = Object.values(images).find(
      (img): img is { url: string } =>
        typeof img === "object" &&
        img !== null &&
        typeof (img as Record<string, unknown>).url === "string"
    );
    if (first?.url) return first.url.replace("/150x150/", "/736x/");
  }
  // fallback: media_list array (some pin types)
  const mediaList = Array.isArray(pin?.media_list) ? pin.media_list : [];
  for (const m of mediaList as Record<string, unknown>[]) {
    if (m?.media_type === "image" && typeof m?.image_url === "string") {
      return (m.image_url as string).replace("/150x150/", "/736x/");
    }
  }
  return null;
}

export async function getPins(
  token: string,
  boardId: string,
  limit = 25
): Promise<PinterestPin[]> {
  const data = await pinterestFetch(
    `/boards/${boardId}/pins?page_size=${limit}`,
    token
  );
  return ((data.items ?? []) as Record<string, unknown>[])
    .map((p) => ({
      id: String(p.id),
      title: (p.title as string | null) ?? null,
      description: (p.description as string | null) ?? null,
      image_url: extractPinImageUrl(p),
      board_id: boardId,
    }))
    .filter((p) => p.image_url !== null) as PinterestPin[];
}
