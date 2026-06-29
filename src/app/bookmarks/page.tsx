"use client";

import { Star } from "lucide-react";
import { useState } from "react";
import AppHeader from "@/components/AppHeader";
import AyahCard from "@/components/AyahCard";
import { getBookmarks, type Bookmark } from "@/lib/local-storage";
import type { Ayah } from "@/types/quran";

function bookmarkToAyah(bookmark: Bookmark): Ayah {
  return {
    number: bookmark.globalNumber,
    numberInSurah: bookmark.ayat,
    juz: bookmark.juz,
    text: bookmark.text,
    surah: {
      number: bookmark.surah,
      name: bookmark.surahName,
      englishName: bookmark.surahName,
      revelationType: "Meccan",
      numberOfAyahs: 0,
    },
  };
}

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(() => getBookmarks());

  return (
    <div className="flex min-h-full flex-col">
      <AppHeader active="bookmarks" />

      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8">
        <section>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Ayat Tersimpan
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Bookmark disimpan di perangkat ini (localStorage).
          </p>
        </section>

        {bookmarks.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-10 text-center dark:border-slate-700 dark:bg-slate-800/50">
            <Star
              className="mx-auto h-10 w-10 text-slate-400 dark:text-slate-500"
              aria-hidden="true"
            />
            <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-slate-100">
              Belum ada bookmark
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-600 dark:text-slate-400">
              Ketuk ikon bintang di kartu ayat untuk menyimpan ayat favorit.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookmarks.map((bookmark) => (
              <AyahCard
                key={`${bookmark.surah}:${bookmark.ayat}`}
                ayah={bookmarkToAyah(bookmark)}
                onBookmarkChange={(bookmarked) => {
                  if (!bookmarked) {
                    setBookmarks(getBookmarks());
                  }
                }}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
