"use client";

import { ChevronDown, ChevronUp, Pause, Play, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { getAyahDetail } from "@/lib/quran-api";
import {
  getPlayingAyahNumber,
  playAyahAudio,
  subscribePlayingAyah,
} from "@/lib/audio-player";
import { isBookmarked, toggleBookmark } from "@/lib/local-storage";
import type { Ayah } from "@/types/quran";

type AyahCardProps = {
  ayah: Ayah;
  defaultExpanded?: boolean;
  onBookmarkChange?: (bookmarked: boolean) => void;
};

function revelationLabel(type: Ayah["surah"]["revelationType"]) {
  return type === "Meccan" ? "Makkiyah" : "Madaniyah";
}

function isArabicScript(text: string): boolean {
  return /[\u0600-\u06FF]/.test(text);
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

export default function AyahCard({
  ayah,
  defaultExpanded = false,
  onBookmarkChange,
}: AyahCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detailLoaded, setDetailLoaded] = useState(
    Boolean(ayah.translation || ayah.transliteration),
  );
  const [translation, setTranslation] = useState(ayah.translation ?? "");
  const [transliteration, setTransliteration] = useState(ayah.transliteration ?? "");
  const [arabic, setArabic] = useState(ayah.text);
  const [bookmarked, setBookmarked] = useState(() =>
    isBookmarked(ayah.surah.number, ayah.numberInSurah),
  );
  const [playingAyah, setPlayingAyah] = useState<number | null>(null);
  const [audioError, setAudioError] = useState<string | null>(null);
  const previewIsArabic = isArabicScript(arabic);
  const isPlaying = playingAyah === ayah.number;

  useEffect(() => {
    return subscribePlayingAyah(setPlayingAyah);
  }, []);

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

  async function handlePlayAudio() {
    setAudioError(null);

    try {
      await playAyahAudio(ayah.number);
    } catch {
      setAudioError("Gagal memutar audio. Silakan coba lagi.");
      if (getPlayingAyahNumber() === ayah.number) {
        setPlayingAyah(null);
      }
    }
  }

  function handleToggleBookmark() {
    const next = toggleBookmark({ ...ayah, text: arabic });
    setBookmarked(next);
    onBookmarkChange?.(next);
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
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={handlePlayAudio}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-teal-700 transition-colors hover:bg-teal-50 dark:text-teal-400 dark:hover:bg-teal-950/40"
            aria-label={isPlaying ? "Jeda audio tilawah" : "Putar audio tilawah"}
          >
            {isPlaying ? (
              <Pause className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Play className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
          <button
            type="button"
            onClick={handleToggleBookmark}
            className={`inline-flex h-9 w-9 items-center justify-center rounded-full transition-colors ${
              bookmarked
                ? "text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/30"
                : "text-slate-400 hover:bg-slate-100 hover:text-amber-500 dark:hover:bg-slate-700"
            }`}
            aria-label={bookmarked ? "Hapus bookmark" : "Simpan bookmark"}
            aria-pressed={bookmarked}
          >
            <Star
              className={`h-4 w-4 ${bookmarked ? "fill-current" : ""}`}
              aria-hidden="true"
            />
          </button>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-300">
            {revelationLabel(ayah.surah.revelationType)}
          </span>
        </div>
      </div>

      <p
        dir={previewIsArabic ? "rtl" : "ltr"}
        className={
          previewIsArabic
            ? "font-arab text-right text-[1.375rem] leading-loose text-slate-900 dark:text-slate-100"
            : "text-left text-base leading-relaxed text-slate-700 italic dark:text-slate-300"
        }
      >
        {arabic}
      </p>

      {audioError && (
        <p className="mt-2 text-xs text-red-600 dark:text-red-400">{audioError}</p>
      )}

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
