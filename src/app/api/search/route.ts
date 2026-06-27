import { NextRequest, NextResponse } from "next/server";
import type { Ayah, SearchResponse, Surah } from "@/types/quran";

const ALQURAN_BASE = "https://api.alquran.cloud/v1";
const FETCH_TIMEOUT_MS = 10_000;
const ARABIC_FALLBACK_THRESHOLD = 3;

type CloudSurah = {
  number: number;
  name: string;
  englishName: string;
  revelationType: string;
  numberOfAyahs: number;
};

type CloudMatch = {
  number: number;
  numberInSurah: number;
  text: string;
  surah: CloudSurah;
  juz: number;
};

type CloudSearchData = {
  count: number;
  matches: CloudMatch[];
};

type CloudSearchResponse = {
  code: number;
  status: string;
  data: CloudSearchData;
};

function mapSurah(surah: CloudSurah): Surah {
  return {
    number: surah.number,
    name: surah.name,
    englishName: surah.englishName,
    revelationType: surah.revelationType === "Medinan" ? "Medinan" : "Meccan",
    numberOfAyahs: surah.numberOfAyahs,
  };
}

function mapMatch(match: CloudMatch): Ayah {
  return {
    number: match.number,
    numberInSurah: match.numberInSurah,
    surah: mapSurah(match.surah),
    juz: match.juz,
    text: match.text,
  };
}

async function fetchWithTimeout(
  url: string,
  init: RequestInit = {},
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeoutId);
  }
}

async function searchEdition(
  keyword: string,
  edition: string,
): Promise<CloudSearchData | null> {
  const url = `${ALQURAN_BASE}/search/${encodeURIComponent(keyword)}/all/${edition}`;

  const response = await fetchWithTimeout(url, { cache: "no-store" });

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as CloudSearchResponse;

  if (payload.code !== 200 || !payload.data) {
    return null;
  }

  return payload.data;
}

export async function GET(request: NextRequest) {
  const keyword = request.nextUrl.searchParams.get("q")?.trim();
  const lang = request.nextUrl.searchParams.get("lang") ?? "ar";

  if (!keyword) {
    return NextResponse.json(
      { error: "Query parameter 'q' is required." },
      { status: 400 },
    );
  }

  try {
    let source: "ar" | "id" = lang === "id" ? "id" : "ar";
    let data: CloudSearchData | null = null;

    if (lang === "id") {
      data = await searchEdition(keyword, "id.indonesian");
    } else {
      data = await searchEdition(keyword, "ar");

      if (!data || data.count < ARABIC_FALLBACK_THRESHOLD) {
        const fallback = await searchEdition(keyword, "id.indonesian");
        if (fallback && fallback.count > (data?.count ?? 0)) {
          data = fallback;
          source = "id";
        }
      }
    }

    if (!data) {
      return NextResponse.json(
        { error: "Search request failed. Please try again." },
        { status: 502 },
      );
    }

    const result: SearchResponse = {
      count: data.count,
      matches: data.matches.map(mapMatch),
      source,
    };

    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error && error.name === "AbortError"
        ? "Search request timed out. Please try again."
        : "Search request failed. Please try again.";

    return NextResponse.json({ error: message }, { status: 504 });
  }
}
