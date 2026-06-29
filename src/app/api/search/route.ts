import { NextRequest, NextResponse } from "next/server";
import type { Ayah, SearchResponse, Surah } from "@/types/quran";

const ALQURAN_BASE = "https://api.alquran.cloud/v1";
const FETCH_TIMEOUT_MS = 10_000;
const ARABIC_FALLBACK_THRESHOLD = 3;

const EMPTY_RESULTS = { count: 0, matches: [] as CloudMatch[] };

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
  data: CloudSearchData | string;
};

type SearchSource = SearchResponse["source"];

type EditionConfig = {
  edition: string;
  source: SearchSource;
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

function hasArabicScript(text: string): boolean {
  return /[\u0600-\u06FF]/.test(text);
}

function getSearchKeywords(keyword: string): string[] {
  const variants = new Set<string>([keyword.trim()]);
  const trimmed = keyword.trim();

  if (!trimmed || hasArabicScript(trimmed)) {
    return [...variants];
  }

  const compact = trimmed.replace(/\s+/g, "").toLowerCase();

  if (compact.includes("lillah")) {
    const prefix = compact.split("lillah")[0];
    if (prefix.length >= 4) {
      variants.add(prefix);
    }
    variants.add(compact.replace("lillah", " lillah"));
  }

  if (compact.startsWith("bismi")) {
    variants.add("bismillah");
    variants.add("bismi");
  }

  return [...variants];
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

  let payload: CloudSearchResponse;
  try {
    payload = (await response.json()) as CloudSearchResponse;
  } catch {
    return null;
  }

  if (payload.code === 404) {
    return { ...EMPTY_RESULTS };
  }

  if (
    !response.ok ||
    payload.code !== 200 ||
    !payload.data ||
    typeof payload.data === "string" ||
    !Array.isArray(payload.data.matches)
  ) {
    return null;
  }

  return payload.data;
}

async function searchEditionWithVariants(
  keywords: string[],
  edition: string,
): Promise<{ data: CloudSearchData; hadHardError: boolean }> {
  let best = { ...EMPTY_RESULTS };
  let hadHardError = false;

  for (const keyword of keywords) {
    const result = await searchEdition(keyword, edition);

    if (result === null) {
      hadHardError = true;
      continue;
    }

    if (result.count > best.count) {
      best = result;
    }

    if (best.count >= ARABIC_FALLBACK_THRESHOLD) {
      break;
    }
  }

  return { data: best, hadHardError };
}

function getEditionConfigs(lang: string): EditionConfig[] {
  if (lang === "id") {
    return [{ edition: "id.indonesian", source: "id" }];
  }

  return [
    { edition: "ar", source: "ar" },
    { edition: "id.indonesian", source: "id" },
    { edition: "en.transliteration", source: "en" },
  ];
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
    const keywords = getSearchKeywords(keyword);
    const editions = getEditionConfigs(lang);

    let bestData = { ...EMPTY_RESULTS };
    let bestSource: SearchSource = editions[0]?.source ?? "ar";
    let anySuccess = false;
    let allHardErrors = true;

    for (const { edition, source } of editions) {
      const { data, hadHardError } = await searchEditionWithVariants(
        keywords,
        edition,
      );

      if (!hadHardError) {
        anySuccess = true;
        allHardErrors = false;
      }

      if (data.count > bestData.count) {
        bestData = data;
        bestSource = source;
      }

      if (bestData.count >= ARABIC_FALLBACK_THRESHOLD) {
        break;
      }
    }

    if (!anySuccess && allHardErrors) {
      return NextResponse.json(
        { error: "Search request failed. Please try again." },
        { status: 502 },
      );
    }

    const result: SearchResponse = {
      count: bestData.count,
      matches: bestData.matches.map(mapMatch),
      source: bestSource,
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
