import { NextRequest, NextResponse } from "next/server";
import type { AyahDetail } from "@/types/quran";

const ALQURAN_BASE = "https://api.alquran.cloud/v1";
const FETCH_TIMEOUT_MS = 10_000;

type CloudAyahResponse = {
  code: number;
  status: string;
  data: {
    text: string;
  };
};

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

async function fetchAyahText(
  ref: string,
  edition: string,
): Promise<string | null> {
  const url = `${ALQURAN_BASE}/ayah/${ref}/${edition}`;
  const response = await fetchWithTimeout(url, { cache: "force-cache" });

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as CloudAyahResponse;

  if (payload.code !== 200 || !payload.data?.text) {
    return null;
  }

  return payload.data.text;
}

function isValidRef(ref: string): boolean {
  const match = /^(\d{1,3}):(\d{1,3})$/.exec(ref);
  if (!match) {
    return false;
  }

  const surah = Number(match[1]);
  const ayat = Number(match[2]);

  return surah >= 1 && surah <= 114 && ayat >= 1;
}

export async function GET(request: NextRequest) {
  const ref = request.nextUrl.searchParams.get("ref")?.trim();

  if (!ref) {
    return NextResponse.json(
      { error: "Query parameter 'ref' is required (format: surah:ayat)." },
      { status: 400 },
    );
  }

  if (!isValidRef(ref)) {
    return NextResponse.json(
      { error: "Invalid ref format. Use surah:ayat (example: 2:255)." },
      { status: 400 },
    );
  }

  try {
    const [arabic, translation, transliteration] = await Promise.all([
      fetchAyahText(ref, "quran-uthmani"),
      fetchAyahText(ref, "id.indonesian"),
      fetchAyahText(ref, "en.transliteration"),
    ]);

    if (!arabic && !translation && !transliteration) {
      return NextResponse.json(
        { error: "Ayah detail request failed. Please try again." },
        { status: 502 },
      );
    }

    const result: AyahDetail = {
      arabic: arabic ?? "",
      translation: translation ?? "",
      transliteration: transliteration ?? "",
    };

    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error && error.name === "AbortError"
        ? "Ayah detail request timed out. Please try again."
        : "Ayah detail request failed. Please try again.";

    return NextResponse.json({ error: message }, { status: 504 });
  }
}
