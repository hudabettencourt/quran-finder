# Quran Finder — Project Spec

## Ringkasan
Aplikasi web untuk mencari ayat Al-Quran berdasarkan penggalan bacaan (teks latin, Arab, atau terjemah Indonesia).
Mirip konsep Shazam tapi untuk Al-Quran — user baca/ketik penggalan ayat, app tampilkan surah dan ayat yang cocok lengkap dengan terjemah.

---

## Stack Teknologi

| Layer | Pilihan |
|---|---|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS |
| Bahasa | TypeScript |
| API Data | Al-Quran Cloud (`api.alquran.cloud/v1`) |
| Speech | Web Speech API (browser built-in) |
| Deploy | Vercel (free tier) |
| Package manager | npm |

> Tidak ada database. Semua data real-time dari Al-Quran Cloud API.

---

## Sumber Data — Al-Quran Cloud API

Base URL: `https://api.alquran.cloud/v1`
Tidak butuh API key. Tidak ada rate limit yang dipublish.

### Endpoint yang dipakai

```
GET /search/{keyword}/all/ar          → cari di teks Arab
GET /search/{keyword}/all/id.indonesian → cari di terjemah Indonesia
GET /ayah/{surah}:{ayat}/quran-uthmani → ambil teks Arab satu ayat
GET /ayah/{surah}:{ayat}/id.indonesian → ambil terjemah Indonesia satu ayat
GET /ayah/{surah}:{ayat}/en.transliteration → ambil latin/transliterasi
GET /surah/{number}                   → info lengkap satu surah
```

### Catatan penting
- Search API hanya support bahasa Arab atau per-edisi terjemah, tidak bisa full-text lintas bahasa sekaligus
- Strategi: cari Arab dulu → kalau hasil < 3, fallback cari ke terjemah Indonesia
- Terjemah dan transliterasi di-fetch terpisah saat user tap/klik kartu (lazy load)
- CORS aman karena fetch dilakukan dari Next.js API Route (server-side), bukan langsung dari browser

---

## Arsitektur Aplikasi

```
quran-finder/
├── app/
│   ├── page.tsx                  → halaman utama (search + hasil)
│   ├── layout.tsx                → root layout, metadata, font
│   └── api/
│       ├── search/route.ts       → proxy ke Al-Quran Cloud (hindari CORS)
│       └── ayah/[ref]/route.ts   → ambil detail satu ayat
├── components/
│   ├── SearchBar.tsx             → input teks + tombol cari
│   ├── VoiceButton.tsx           → rekam suara via Web Speech API
│   ├── AyahCard.tsx              → kartu hasil ayat
│   └── AyahDetail.tsx            → detail ayat yang di-expand
├── lib/
│   └── quran-api.ts             → fungsi fetch ke API route internal
├── types/
│   └── quran.ts                 → TypeScript types untuk data ayat
└── public/
    └── (aset statis)
```

---

## Fitur

### Phase 1 — MVP (prioritas sekarang)
- [ ] Search ayat by teks latin/Arab/terjemah
- [ ] Tampilkan hasil: teks Arab, nomor surah:ayat, nama surah
- [ ] Lazy load terjemah Indonesia saat kartu di-tap
- [ ] Rekam suara (Web Speech API, bahasa Arab)
- [ ] Responsive — mobile-first, nyaman di HP dan desktop
- [ ] Loading state dan error handling yang jelas

### Phase 2 — Setelah MVP live
- [ ] Transliterasi latin di setiap ayat
- [ ] Putar audio recitation (dari CDN Al-Quran Cloud)
- [ ] Bookmark ayat favorit (localStorage)
- [ ] Riwayat pencarian terakhir (localStorage)
- [ ] PWA — bisa di-install ke homescreen HP

### Phase 3 — Opsional jangka panjang
- [ ] Progress hafalan per juz
- [ ] Flutter app (APK) — share via WhatsApp ke keluarga
- [ ] Multi-bahasa terjemah (English, dll)

---

## UI / UX

### Prinsip desain
- Mobile-first — mayoritas user pakai HP
- Clean dan minimal — fokus ke konten ayat
- Teks Arab harus besar dan terbaca (min 22px, font Arab proper)
- Dark mode support

### Font
- Teks Arab: `Amiri` atau `Scheherazade New` (Google Fonts)
- UI: `Inter` atau system font

### Warna utama
- Aksen: hijau teal (#0F6E56 / teal-700) — nuansa islami
- Background: putih / abu sangat muda
- Dark mode: slate-900 background

### Layout halaman utama
```
[Header: logo + nama app]
[SearchBar + tombol Cari]
[VoiceButton: rekam tilawah]
[Daftar AyahCard hasil pencarian]
```

### AyahCard
```
[Nama Surah — Ayat ke-N]  [Juz N]
[Teks Arab — right-to-left, besar]
[Tap untuk lihat terjemah]
─────────────────────────
[Terjemah Indonesia — muncul setelah tap]
[chip: Surah N · Ayat N · Makkiyah/Madaniyah]
```

---

## API Route Internal (Next.js)

### GET /api/search?q={keyword}&lang={ar|id}
Proxy ke Al-Quran Cloud, kembalikan array ayat yang match.

### GET /api/ayah?ref={surah:ayat}
Ambil detail satu ayat: teks Arab + terjemah + transliterasi sekaligus (3 fetch paralel).

---

## TypeScript Types

```typescript
type Surah = {
  number: number
  name: string           // Arab: الفاتحة
  englishName: string    // Al-Fatihah
  revelationType: 'Meccan' | 'Medinan'
  numberOfAyahs: number
}

type Ayah = {
  number: number          // nomor global (1-6236)
  numberInSurah: number   // nomor dalam surah
  surah: Surah
  juz: number
  text: string            // teks Arab
  translation?: string    // terjemah Indonesia (lazy)
  transliteration?: string // latin (lazy)
  audio?: string          // URL audio (lazy)
}

type SearchResult = {
  count: number
  matches: Ayah[]
}
```

---

## Environment Variables

Tidak ada API key yang dibutuhkan untuk MVP.
Untuk production nanti cukup tambahkan:

```env
NEXT_PUBLIC_APP_URL=https://quran-finder.vercel.app
```

---

## Deployment

1. Push ke GitHub repo baru: `quran-finder`
2. Connect ke Vercel
3. Deploy otomatis — tidak perlu config tambahan
4. Domain gratis: `quran-finder.vercel.app` (atau custom domain)

---

## Catatan Development

- Gunakan `fetch` dengan `cache: 'force-cache'` untuk response API yang jarang berubah (data ayat statis)
- Untuk search, gunakan `cache: 'no-store'` karena keyword selalu beda
- Handling error: Al-Quran Cloud kadang lambat — tampilkan skeleton loader, bukan blank
- Web Speech API: hanya jalan di Chrome (desktop & Android). Safari belum support. Tampilkan pesan yang jelas kalau tidak support.
- Teks Arab harus pakai `dir="rtl"` dan font Arab yang proper agar harakat terbaca

