import type { AyahDetail, SearchResponse } from "@/types/quran";

class QuranApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "QuranApiError";
  }
}

async function parseJsonResponse<T>(response: Response): Promise<T> {
  const payload = (await response.json()) as T & { error?: string };

  if (!response.ok) {
    throw new QuranApiError(
      payload.error ?? "Permintaan gagal. Silakan coba lagi.",
    );
  }

  return payload;
}

export async function searchAyah(query: string): Promise<SearchResponse> {
  const params = new URLSearchParams({ q: query.trim() });
  const response = await fetch(`/api/search?${params.toString()}`, {
    cache: "no-store",
  });

  return parseJsonResponse<SearchResponse>(response);
}

export async function getAyahDetail(
  surah: number,
  ayat: number,
): Promise<AyahDetail> {
  const params = new URLSearchParams({ ref: `${surah}:${ayat}` });
  const response = await fetch(`/api/ayah?${params.toString()}`);

  return parseJsonResponse<AyahDetail>(response);
}
