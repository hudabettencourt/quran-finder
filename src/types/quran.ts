export type Surah = {
  number: number;
  name: string;
  englishName: string;
  revelationType: "Meccan" | "Medinan";
  numberOfAyahs: number;
};

export type Ayah = {
  number: number;
  numberInSurah: number;
  surah: Surah;
  juz: number;
  text: string;
  translation?: string;
  transliteration?: string;
  audio?: string;
};

export type SearchResult = {
  count: number;
  matches: Ayah[];
};

export type SearchResponse = SearchResult & {
  source: "ar" | "id" | "en";
};

export type AyahDetail = {
  arabic: string;
  translation: string;
  transliteration: string;
};
