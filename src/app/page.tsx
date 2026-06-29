"use client";

import { useCallback, useRef, useState } from "react";
import AppHeader from "@/components/AppHeader";
import SearchBar from "@/components/SearchBar";
import SearchResults from "@/components/SearchResults";
import VoiceButton from "@/components/VoiceButton";
import { addSearchHistory } from "@/lib/local-storage";
import { searchAyah } from "@/lib/quran-api";
import type { Ayah } from "@/types/quran";

export default function Home() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Ayah[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const resultsRef = useRef<HTMLElement>(null);
  const lastQueryRef = useRef("");

  const runSearch = useCallback(async (searchQuery: string) => {
    const trimmed = searchQuery.trim();
    if (!trimmed) {
      return;
    }

    lastQueryRef.current = trimmed;
    addSearchHistory(trimmed);
    setLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const data = await searchAyah(trimmed);
      setResults(data.matches);
    } catch (err) {
      setResults([]);
      setError(
        err instanceof Error
          ? err.message
          : "Pencarian gagal. Silakan coba lagi.",
      );
    } finally {
      setLoading(false);
      requestAnimationFrame(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  }, []);

  function handleVoiceResult(transcript: string) {
    setQuery(transcript);
    void runSearch(transcript);
  }

  function handleRetry() {
    if (lastQueryRef.current) {
      void runSearch(lastQueryRef.current);
    }
  }

  return (
    <div className="flex min-h-full flex-col">
      <AppHeader />

      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8">
        <section className="space-y-4">
          <SearchBar
            value={query}
            onChange={setQuery}
            onSearch={runSearch}
            loading={loading}
          />
          <VoiceButton onResult={handleVoiceResult} disabled={loading} />
        </section>

        <section ref={resultsRef} className="scroll-mt-4">
          <SearchResults
            results={results}
            loading={loading}
            error={error}
            hasSearched={hasSearched}
            onRetry={handleRetry}
          />
        </section>
      </main>
    </div>
  );
}
