"use client";

import Link from "next/link";
import { BookOpen, Star } from "lucide-react";

type AppHeaderProps = {
  active?: "home" | "bookmarks";
};

export default function AppHeader({ active = "home" }: AppHeaderProps) {
  return (
    <header className="border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
      <div className="mx-auto flex w-full max-w-2xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-700 text-white dark:bg-teal-500 dark:text-slate-900">
            <BookOpen className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-lg font-semibold text-slate-900 dark:text-slate-100">
              Quran Finder
            </h1>
            <p className="truncate text-xs text-slate-500 dark:text-slate-400">
              Shazam untuk ayat Al-Quran
            </p>
          </div>
        </Link>

        <Link
          href="/bookmarks"
          className={`inline-flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
            active === "bookmarks"
              ? "bg-teal-700 text-white dark:bg-teal-500 dark:text-slate-900"
              : "text-teal-700 hover:bg-teal-50 dark:text-teal-400 dark:hover:bg-teal-950/40"
          }`}
          aria-current={active === "bookmarks" ? "page" : undefined}
        >
          <Star
            className={`h-4 w-4 ${active === "bookmarks" ? "fill-current" : ""}`}
            aria-hidden="true"
          />
          <span className="hidden sm:inline">Bookmark</span>
        </Link>
      </div>
    </header>
  );
}
