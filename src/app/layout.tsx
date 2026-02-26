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
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://ersandiamond.com"),
  title: {
    default: "Ersan Diamond | Luxury Watches & Hermès",
    template: "%s | Ersan Diamond",
  },
  description:
    "İstanbul merkezli lüks saat ve Hermès ürünleri alım-satım. Only Original. Authentication guaranteed.",
  keywords: [
    "luxury watches",
    "Rolex",
    "Patek Philippe",
    "Hermès",
    "Birkin",
    "Kelly",
    "İstanbul",
    "pre-owned luxury",
  ],
  authors: [{ name: "Ersan Diamond" }],
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: "https://ersandiamond.com",
    siteName: "Ersan Diamond",
    title: "Ersan Diamond | Luxury Watches & Hermès",
    description:
      "İstanbul merkezli lüks saat ve Hermès ürünleri alım-satım. Only Original.",
    images: [{ url: "/imgs/logo-square.png", width: 1024, height: 1024 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ersan Diamond | Luxury Watches & Hermès",
    description:
      "İstanbul merkezli lüks saat ve Hermès ürünleri alım-satım. Only Original.",
  },
  robots: {
    index: true,
    follow: true,
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
