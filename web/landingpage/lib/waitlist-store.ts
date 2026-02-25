import { promises as fs } from "node:fs";
import path from "node:path";

import type { WaitlistSubmission } from "@/lib/types";

const dataPath = path.join(process.cwd(), "data", "waitlist-users.json");

function hasSupabaseConfig() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY);
}

async function saveToSupabase(entry: WaitlistSubmission) {
  const url = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error("Supabase credentials are missing.");
  }

  const response = await fetch(`${url}/rest/v1/waitlist_users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
      Prefer: "return=minimal",
    },
    body: JSON.stringify(entry),
    cache: "no-store",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Supabase insert failed: ${errorText}`);
  }
}

async function saveToLocalFile(entry: WaitlistSubmission) {
  await fs.mkdir(path.dirname(dataPath), { recursive: true });

  let existingEntries: WaitlistSubmission[] = [];

  try {
    const fileContent = await fs.readFile(dataPath, "utf8");
    existingEntries = JSON.parse(fileContent) as WaitlistSubmission[];
  } catch {
    existingEntries = [];
  }

  existingEntries.push(entry);
  await fs.writeFile(dataPath, `${JSON.stringify(existingEntries, null, 2)}\n`, "utf8");
}

export async function storeWaitlistEntry(entry: WaitlistSubmission) {
  if (hasSupabaseConfig()) {
    await saveToSupabase(entry);
    return { provider: "supabase" as const };
  }

  await saveToLocalFile(entry);
  return { provider: "local" as const };
}
