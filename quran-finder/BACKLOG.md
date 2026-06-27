# Quran Finder — Development Backlog

## Status Legend
- [ ] Todo
- [~] In Progress
- [x] Done

---

## PHASE 1 — MVP

### SETUP
- [ ] **SETUP-01** Init project Next.js 14 + TypeScript + Tailwind
  ```bash
  npx create-next-app@latest quran-finder --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
  ```
- [ ] **SETUP-02** Install dependencies tambahan
  ```bash
  npm install @fontsource/amiri lucide-react
  ```
- [ ] **SETUP-03** Setup folder structure sesuai spec (`components/`, `lib/`, `types/`)
- [ ] **SETUP-04** Setup font Arab di `layout.tsx` — import Amiri dari Google Fonts
- [ ] **SETUP-05** Setup Tailwind config — tambah font custom, warna aksen teal

---

### TYPES
- [ ] **TYPE-01** Buat `src/types/quran.ts` — definisi `Surah`, `Ayah`, `SearchResult`

---

### API ROUTES (server-side proxy — hindari CORS)
- [ ] **API-01** Buat `src/app/api/search/route.ts`
  - Terima query param: `q` (keyword) dan `lang` (default: `ar`)
  - Fetch ke `https://api.alquran.cloud/v1/search/{q}/all/{edition}`
  - Kalau hasil Arab < 3 ayat, otomatis fetch ulang ke edisi `id.indonesian`
  - Return JSON: `{ matches: Ayah[], count: number, source: 'ar' | 'id' }`

- [ ] **API-02** Buat `src/app/api/ayah/route.ts`
  - Terima query param: `ref` (format: `surah:ayat`, contoh: `2:255`)
  - Fetch paralel 3 sekaligus: teks Arab + terjemah ID + transliterasi EN
  - Return JSON: `{ arabic, translation, transliteration }`

---

### COMPONENTS
- [ ] **COMP-01** Buat `src/components/SearchBar.tsx`
  - Input teks controlled
  - Tombol "Cari" — trigger search on click
  - Enter key juga trigger search
  - Props: `onSearch: (query: string) => void`, `loading: boolean`

- [ ] **COMP-02** Buat `src/components/VoiceButton.tsx`
  - Cek support Web Speech API — tampilkan pesan kalau tidak support
  - State: idle / recording / processing
  - Animasi pulse saat recording
  - Lang: `ar-SA` (Arab Saudi)
  - Setelah dapat final transcript → panggil `onResult(text)`
  - Props: `onResult: (text: string) => void`, `disabled: boolean`

- [ ] **COMP-03** Buat `src/components/AyahCard.tsx`
  - Tampilkan: nama surah, nomor ayat, teks Arab, juz, makkiyah/madaniyah
  - Teks Arab: font Amiri, min 22px, dir="rtl", text-right
  - State collapsed/expanded untuk terjemah
  - Saat pertama expand: fetch ke `/api/ayah?ref={surah}:{ayat}`
  - Tampilkan skeleton loader saat fetch terjemah
  - Props: `ayah: Ayah`, `defaultExpanded?: boolean`

- [ ] **COMP-04** Buat `src/components/SearchResults.tsx`
  - Wrapper untuk list AyahCard
  - Handle state: empty, loading, error, hasil
  - Empty state: ilustrasi/icon + teks panduan
  - Error state: pesan error + tombol retry
  - Loading: skeleton 3 kartu

---

### HALAMAN UTAMA
- [ ] **PAGE-01** Buat `src/app/page.tsx`
  - Layout: header → SearchBar → VoiceButton → SearchResults
  - State management: `query`, `results`, `loading`, `error`
  - Saat VoiceButton dapat hasil → isi SearchBar → auto-trigger search
  - Scroll ke hasil setelah search selesai

- [ ] **PAGE-02** Buat `src/app/layout.tsx`
  - Metadata: title, description, og:image
  - Import font Amiri (Arab) dan Inter (UI)
  - Dark mode class setup

---

### LIB
- [ ] **LIB-01** Buat `src/lib/quran-api.ts`
  - `searchAyah(query: string): Promise<SearchResult>` → fetch `/api/search`
  - `getAyahDetail(surah: number, ayat: number): Promise<AyahDetail>` → fetch `/api/ayah`

---

### STYLING & POLISH
- [ ] **STYLE-01** Mobile-first responsive layout — test di viewport 375px
- [ ] **STYLE-02** Dark mode — gunakan Tailwind `dark:` prefix
- [ ] **STYLE-03** Loading skeleton untuk AyahCard
- [ ] **STYLE-04** Animasi smooth saat expand/collapse terjemah
- [ ] **STYLE-05** Empty state illustration (SVG sederhana atau icon lucide)

---

### TESTING & DEPLOY
- [ ] **DEPLOY-01** Test di Chrome Android (Web Speech API)
- [ ] **DEPLOY-02** Test di Safari iOS (pastikan graceful fallback)
- [ ] **DEPLOY-03** Test koneksi lambat — pastikan loader muncul
- [ ] **DEPLOY-04** Push ke GitHub repo `quran-finder`
- [ ] **DEPLOY-05** Connect ke Vercel, set domain
- [ ] **DEPLOY-06** Test production build

---

## PHASE 2 — Post-MVP

- [ ] **P2-01** Audio recitation — tambah tombol play di AyahCard
  - URL audio dari Al-Quran Cloud CDN: `https://cdn.alquran.cloud/media/audio/ayah/ar.alafasy/128/{nomor_ayat_global}`
  - Gunakan HTML5 `<audio>` element
  - Satu audio main dalam satu waktu

- [ ] **P2-02** Bookmark ayat favorit
  - Simpan ke `localStorage` key: `quran-finder-bookmarks`
  - Halaman `/bookmarks` untuk lihat semua bookmark
  - Toggle bookmark dari AyahCard (icon bintang)

- [ ] **P2-03** Riwayat pencarian
  - Simpan 10 pencarian terakhir ke `localStorage`
  - Tampilkan sebagai suggestion saat SearchBar focus

- [ ] **P2-04** PWA setup
  - Install `next-pwa`
  - Buat `manifest.json` — nama, icon, warna
  - Service worker untuk cache aset static
  - "Add to homescreen" prompt di mobile

- [ ] **P2-05** Transliterasi latin di setiap ayat
  - Sudah di-fetch di `API-02`, tinggal tampilkan di AyahCard

---

## PHASE 3 — Flutter App

- [ ] **FL-01** Setup Flutter project baru: `quran_finder_mobile`
- [ ] **FL-02** Install packages: `http`, `speech_to_text`, `flutter_tts`
- [ ] **FL-03** Port logic search → pakai endpoint `/api/search` dari web app yang sudah deploy (atau langsung hit Al-Quran Cloud)
- [ ] **FL-04** UI AyahCard di Flutter
- [ ] **FL-05** Voice input pakai `speech_to_text` package
- [ ] **FL-06** Build APK release
- [ ] **FL-07** Share ke keluarga via WhatsApp

---

## Urutan Ngoding yang Disarankan

```
SETUP-01 → SETUP-02 → SETUP-03 → SETUP-04 → SETUP-05
    ↓
TYPE-01
    ↓
API-01 → API-02        ← test dulu pakai curl/Postman
    ↓
LIB-01
    ↓
COMP-01 → COMP-02 → COMP-03 → COMP-04
    ↓
PAGE-01 → PAGE-02
    ↓
STYLE-01 → STYLE-02 → STYLE-03 → STYLE-04
    ↓
DEPLOY-01 → ... → DEPLOY-06
```

---

## Catatan Penting untuk Claude di Cursor

- Selalu fetch dari API route internal (`/api/...`), BUKAN langsung ke `api.alquran.cloud` dari komponen — ini untuk hindari CORS error di browser
- Web Speech API: cek `typeof window !== 'undefined'` sebelum inisialisasi (Next.js SSR)
- Teks Arab wajib `dir="rtl"` dan class font Arab, jangan pakai font default
- Gunakan `Promise.all()` di `API-02` agar 3 fetch jalan paralel, bukan sequential
- Untuk error Al-Quran Cloud: API kadang lambat atau timeout — set timeout 10 detik dan handle gracefully
- `cache: 'force-cache'` untuk data ayat, `cache: 'no-store'` untuk search

