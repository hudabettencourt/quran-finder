import type { Metadata, Viewport } from "next";
import { Amiri, Inter } from "next/font/google";
import InstallPrompt from "@/components/InstallPrompt";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const amiri = Amiri({
  variable: "--font-amiri",
  subsets: ["arabic", "latin"],
  weight: ["400", "700"],
});

const appUrl =
  process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: "Quran Finder",
  description:
    "Cari ayat Al-Quran dari penggalan bacaan — teks latin, Arab, atau terjemah Indonesia.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Quran Finder",
  },
  icons: {
    icon: "/icons/icon.svg",
    apple: "/icons/icon.svg",
  },
  openGraph: {
    title: "Quran Finder",
    description:
      "Cari ayat Al-Quran dari penggalan bacaan — mirip Shazam tapi untuk Al-Quran.",
    type: "website",
    url: appUrl,
    siteName: "Quran Finder",
    locale: "id_ID",
    images: [
      {
        url: "/globe.svg",
        width: 1200,
        height: 630,
        alt: "Quran Finder",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Quran Finder",
    description:
      "Cari ayat Al-Quran dari penggalan bacaan — teks latin, Arab, atau terjemah Indonesia.",
    images: ["/globe.svg"],
  },
};

export const viewport: Viewport = {
  themeColor: "#0F6E56",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${inter.variable} ${amiri.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
        <InstallPrompt />
      </body>
    </html>
  );
}
