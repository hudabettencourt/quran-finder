"use client";

import { BookOpen, RefreshCw, SearchX } from "lucide-react";
import AyahCard from "@/components/AyahCard";
import type { Ayah } from "@/types/quran";

type SearchResultsProps = {
  results: Ayah[];
  loading: boolean;
  error: string | null;
  hasSearched: boolean;
  onRetry: () => void;
};

function ResultSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800/80">
      <div className="mb-3 space-y-2">
        <div className="h-4 w-40 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
        <div className="h-3 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
      </div>
      <div className="space-y-2">
        <div className="h-5 w-full animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
        <div className="h-5 w-5/6 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
        <div className="h-5 w-4/6 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
      </div>
    </div>
  );
}

export default function SearchResults({
  results,
  loading,
  error,
  hasSearched,
  onRetry,
}: SearchResultsProps) {
  if (loading) {
    return (
      <div className="space-y-4" aria-live="polite" aria-busy="true">
        <ResultSkeleton />
        <ResultSkeleton />
        <ResultSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-8 text-center dark:border-red-900/50 dark:bg-red-950/30">
        <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
        >
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          Coba lagi
        </button>
      </div>
    );
  }

  if (!hasSearched) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-10 text-center dark:border-slate-700 dark:bg-slate-800/50">
        <BookOpen
          className="mx-auto h-10 w-10 text-teal-700 dark:text-teal-400"
          aria-hidden="true"
        />
        <h2 className="mt-4 text-lg font-semibold text-slate-900 dark:text-slate-100">
          Temukan ayat dari penggalan bacaan
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          Ketik atau rekam penggalan ayat — dalam bahasa Arab, latin, atau
          terjemah Indonesia — lalu kami tampilkan surah dan ayat yang cocok.
        </p>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white px-6 py-10 text-center dark:border-slate-700 dark:bg-slate-800/50">
        <SearchX
          className="mx-auto h-10 w-10 text-slate-400 dark:text-slate-500"
          aria-hidden="true"
        />
        <h2 className="mt-4 text-lg font-semibold text-slate-900 dark:text-slate-100">
          Tidak ada ayat ditemukan
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-slate-600 dark:text-slate-400">
          Coba kata kunci yang lebih spesifik, atau gunakan potongan terjemah
          yang lebih panjang.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600 dark:text-slate-400">
        {results.length} ayat ditemukan
      </p>
      {results.map((ayah) => (
        <AyahCard
          key={`${ayah.surah.number}:${ayah.numberInSurah}:${ayah.number}`}
          ayah={ayah}
        />
      ))}
    </div>
  );
}
