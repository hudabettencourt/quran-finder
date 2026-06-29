"use client";

import { Clock, Search, X } from "lucide-react";
import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from "react";
import {
  addSearchHistory,
  clearSearchHistory,
  getSearchHistory,
} from "@/lib/local-storage";

type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  onSearch: (query: string) => void;
  loading: boolean;
};

export default function SearchBar({
  value,
  onChange,
  onSearch,
  loading,
}: SearchBarProps) {
  const [focused, setFocused] = useState(false);
  const [history, setHistory] = useState<string[]>(() => getSearchHistory());
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setFocused(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function submitSearch(query: string) {
    const trimmed = query.trim();
    if (!trimmed || loading) {
      return;
    }

    addSearchHistory(trimmed);
    setHistory(getSearchHistory());
    onSearch(trimmed);
    setFocused(false);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submitSearch(value);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      submitSearch(value);
    }

    if (event.key === "Escape") {
      setFocused(false);
    }
  }

  function handleClearHistory() {
    clearSearchHistory();
    setHistory([]);
  }

  const showSuggestions = focused && history.length > 0 && !loading;

  return (
    <div
      ref={containerRef}
      className="relative w-full"
      aria-expanded={showSuggestions}
    >
      <form onSubmit={handleSubmit} className="flex w-full gap-2">
        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onFocus={() => {
            setFocused(true);
            setHistory(getSearchHistory());
          }}
          onKeyDown={handleKeyDown}
          placeholder="Ketik penggalan ayat, latin, atau terjemah..."
          disabled={loading}
          className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-base text-foreground placeholder:text-slate-400 focus:border-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-700/20 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:placeholder:text-slate-500 dark:focus:border-teal-400 dark:focus:ring-teal-400/20"
          aria-label="Kata kunci pencarian ayat"
          aria-controls="search-history-list"
          autoComplete="off"
        />
        <button
          type="submit"
          disabled={loading || !value.trim()}
          className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-teal-700 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-teal-500 dark:text-slate-900 dark:hover:bg-teal-400"
        >
          <Search className="h-4 w-4" aria-hidden="true" />
          {loading ? "Mencari..." : "Cari"}
        </button>
      </form>

      {showSuggestions && (
        <div
          id="search-history-list"
          className="absolute z-20 mt-2 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-800"
        >
          <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2 dark:border-slate-700">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Pencarian terakhir
            </p>
            <button
              type="button"
              onClick={handleClearHistory}
              className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            >
              <X className="h-3 w-3" aria-hidden="true" />
              Hapus
            </button>
          </div>
          <ul>
            {history.map((item) => (
              <li key={item}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(item);
                    submitSearch(item);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-700/60"
                >
                  <Clock className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
                  <span className="truncate">{item}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
