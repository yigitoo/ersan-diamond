import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import { Providers } from "@/components/shared/providers";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://ersandiamond.com"
  ),
  title: {
    default: "Ersan Diamond | Lüks Saat & Hermès",
    template: "%s | Ersan Diamond",
  },
  description:
    "İstanbul merkezli lüks saat ve Hermès ürünleri alım-satım. Sadece Orijinal. Orijinal garantili.",
  keywords: [
    "Ersan Diamond",
    "Ersan Diamond Istanbul",
    "Ersan Diamond Luxury",
    "Ersan Gülmez",
    "lüks saat",
    "Rolex",
    "Patek Philippe",
    "Hermès",
    "Birkin",
    "Kelly",
    "İstanbul",
    "ikinci el lüks",
    "luxury watches",
    "pre-owned luxury",
    "luxury watch dealer",
  ],
  authors: [{ name: "Ersan Diamond" }],
  icons: {
    icon: [
      { url: "/imgs/logo-square.png", type: "image/png", sizes: "1024x1024" },
    ],
    apple: [{ url: "/imgs/logo-square.png", sizes: "1024x1024" }],
    shortcut: "/imgs/logo-square.png",
  },
  openGraph: {
    type: "website",
    locale: "tr_TR",
    alternateLocale: "en_US",
    url: "https://ersandiamond.com",
    siteName: "Ersan Diamond",
    title: "Ersan Diamond | Lüks Saat & Hermès",
    description:
      "İstanbul merkezli lüks saat ve Hermès ürünleri alım-satım. Sadece Orijinal. Orijinal garantili.",
    images: [
      {
        url: "/imgs/logo-square.png",
        width: 1024,
        height: 1024,
        alt: "Ersan Diamond Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ersan Diamond | Lüks Saat & Hermès",
    description:
      "İstanbul merkezli lüks saat ve Hermès ürünleri alım-satım. Sadece Orijinal. Orijinal garantili.",
    images: ["/imgs/logo-square.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  other: {
    "apple-mobile-web-app-title": "Ersan Diamond",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="tr"
      className={`${playfair.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-brand-black text-brand-white">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
