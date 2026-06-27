"use client";

import { Search } from "lucide-react";
import { FormEvent, KeyboardEvent } from "react";

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
  function submitSearch() {
    const trimmed = value.trim();
    if (!trimmed || loading) {
      return;
    }

    onSearch(trimmed);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submitSearch();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      submitSearch();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full gap-2">
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ketik penggalan ayat, latin, atau terjemah..."
        disabled={loading}
        className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-base text-foreground placeholder:text-slate-400 focus:border-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-700/20 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:placeholder:text-slate-500 dark:focus:border-teal-400 dark:focus:ring-teal-400/20"
        aria-label="Kata kunci pencarian ayat"
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
  );
}
