"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { getAyahDetail } from "@/lib/quran-api";
import type { Ayah } from "@/types/quran";

type AyahCardProps = {
  ayah: Ayah;
  defaultExpanded?: boolean;
};

function revelationLabel(type: Ayah["surah"]["revelationType"]) {
  return type === "Meccan" ? "Makkiyah" : "Madaniyah";
}

function AyahCardSkeleton() {
  return (
    <div className="mt-3 space-y-2 border-t border-slate-100 pt-3 dark:border-slate-700">
      <div className="h-4 w-full animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
      <div className="h-4 w-5/6 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
      <div className="h-4 w-2/3 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
    </div>
  );
}

export default function AyahCard({ ayah, defaultExpanded = false }: AyahCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detailLoaded, setDetailLoaded] = useState(
    Boolean(ayah.translation || ayah.transliteration),
  );
  const [translation, setTranslation] = useState(ayah.translation ?? "");
  const [transliteration, setTransliteration] = useState(ayah.transliteration ?? "");
  const [arabic, setArabic] = useState(ayah.text);

  async function handleToggle() {
    const nextExpanded = !expanded;
    setExpanded(nextExpanded);

    if (!nextExpanded || detailLoaded || loading) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const detail = await getAyahDetail(ayah.surah.number, ayah.numberInSurah);
      setTranslation(detail.translation);
      setTransliteration(detail.transliteration);
      setDetailLoaded(true);
      if (detail.arabic) {
        setArabic(detail.arabic);
      }
    } catch {
      setError("Gagal memuat detail ayat. Silakan coba lagi.");
      setExpanded(false);
    } finally {
      setLoading(false);
    }
  }

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-slate-700 dark:bg-slate-800/80">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-teal-700 dark:text-teal-400">
            {ayah.surah.englishName} — Ayat {ayah.numberInSurah}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Surah {ayah.surah.number} · Juz {ayah.juz}
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-300">
          {revelationLabel(ayah.surah.revelationType)}
        </span>
      </div>

      <p
        dir="rtl"
        className="font-arab text-right text-[1.375rem] leading-loose text-slate-900 dark:text-slate-100"
      >
        {arabic}
      </p>

      <button
        type="button"
        onClick={handleToggle}
        className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-teal-700 hover:text-teal-800 dark:text-teal-400 dark:hover:text-teal-300"
        aria-expanded={expanded}
      >
        {expanded ? (
          <>
            <ChevronUp className="h-4 w-4" aria-hidden="true" />
            Sembunyikan detail
          </>
        ) : (
          <>
            <ChevronDown className="h-4 w-4" aria-hidden="true" />
            Tap untuk lihat terjemah & transliterasi
          </>
        )}
      </button>

      {expanded && (
        <div className="transition-opacity duration-200">
          {loading && <AyahCardSkeleton />}

          {!loading && error && (
            <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>
          )}

          {!loading && !error && (translation || transliteration) && (
            <div className="mt-3 border-t border-slate-100 pt-3 dark:border-slate-700">
              {transliteration && (
                <p className="text-sm italic leading-relaxed text-slate-600 dark:text-slate-400">
                  {transliteration}
                </p>
              )}
              {translation && (
                <p
                  className={`text-sm leading-relaxed text-slate-700 dark:text-slate-300${transliteration ? " mt-2" : ""}`}
                >
                  {translation}
                </p>
              )}
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-full bg-teal-50 px-2.5 py-1 text-xs text-teal-800 dark:bg-teal-950/50 dark:text-teal-300">
                  Surah {ayah.surah.number}
                </span>
                <span className="rounded-full bg-teal-50 px-2.5 py-1 text-xs text-teal-800 dark:bg-teal-950/50 dark:text-teal-300">
                  Ayat {ayah.numberInSurah}
                </span>
                <span className="rounded-full bg-teal-50 px-2.5 py-1 text-xs text-teal-800 dark:bg-teal-950/50 dark:text-teal-300">
                  {revelationLabel(ayah.surah.revelationType)}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </article>
  );
}
