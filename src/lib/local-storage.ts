import type { Ayah } from "@/types/quran";

const BOOKMARKS_KEY = "quran-finder-bookmarks";
const SEARCH_HISTORY_KEY = "quran-finder-search-history";
const MAX_SEARCH_HISTORY = 10;

export type Bookmark = {
  surah: number;
  ayat: number;
  globalNumber: number;
  surahName: string;
  text: string;
  juz: number;
  savedAt: number;
};

function readStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") {
    return fallback;
  }

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      return fallback;
    }

    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeStorage<T>(key: string, value: T) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
}

export function getBookmarks(): Bookmark[] {
  return readStorage<Bookmark[]>(BOOKMARKS_KEY, []);
}

export function isBookmarked(surah: number, ayat: number): boolean {
  return getBookmarks().some(
    (bookmark) => bookmark.surah === surah && bookmark.ayat === ayat,
  );
}

export function toggleBookmark(ayah: Ayah): boolean {
  const bookmarks = getBookmarks();
  const index = bookmarks.findIndex(
    (bookmark) =>
      bookmark.surah === ayah.surah.number &&
      bookmark.ayat === ayah.numberInSurah,
  );

  if (index >= 0) {
    bookmarks.splice(index, 1);
    writeStorage(BOOKMARKS_KEY, bookmarks);
    return false;
  }

  bookmarks.unshift({
    surah: ayah.surah.number,
    ayat: ayah.numberInSurah,
    globalNumber: ayah.number,
    surahName: ayah.surah.englishName,
    text: ayah.text,
    juz: ayah.juz,
    savedAt: Date.now(),
  });
  writeStorage(BOOKMARKS_KEY, bookmarks);
  return true;
}

export function removeBookmark(surah: number, ayat: number) {
  const bookmarks = getBookmarks().filter(
    (bookmark) => !(bookmark.surah === surah && bookmark.ayat === ayat),
  );
  writeStorage(BOOKMARKS_KEY, bookmarks);
}

export function getSearchHistory(): string[] {
  return readStorage<string[]>(SEARCH_HISTORY_KEY, []);
}

export function addSearchHistory(query: string) {
  const trimmed = query.trim();
  if (!trimmed) {
    return;
  }

  const history = getSearchHistory().filter(
    (item) => item.toLowerCase() !== trimmed.toLowerCase(),
  );
  history.unshift(trimmed);
  writeStorage(SEARCH_HISTORY_KEY, history.slice(0, MAX_SEARCH_HISTORY));
}

export function clearSearchHistory() {
  writeStorage(SEARCH_HISTORY_KEY, []);
}
