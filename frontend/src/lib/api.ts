import { cacheLife } from "next/cache";

/** Base URL of the Python backend (see next.config.ts for the /api/py rewrite). */
export const API_URL = process.env.SHIELDNEST_API_URL ?? "https://shieldnest-api.vercel.app";

export type BlocklistStats = {
  categories: { ads: number; malware: number; phishing: number };
  total: number;
};

/** Live list sizes; cached for hours, and null if the API can't be reached. */
export async function getBlocklistStats(): Promise<BlocklistStats | null> {
  "use cache";
  cacheLife("hours");
  try {
    const response = await fetch(`${API_URL}/api/py/stats`, { signal: AbortSignal.timeout(30_000) });
    if (!response.ok) return null;
    return (await response.json()) as BlocklistStats;
  } catch {
    return null;
  }
}
