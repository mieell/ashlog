import type { Metadata } from "next";
import { DM_Serif_Display, Inter, DM_Mono } from "next/font/google";
import "./globals.css";

const dmSerif = DM_Serif_Display({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-dm-serif",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const dmMono = DM_Mono({
  weight: ["300", "400", "500"],
  subsets: ["latin"],
  variable: "--font-dm-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AshLog — Understand Your Body. Sleep Better. Feel More Like Yourself.",
  description:
    "AshLog combines period tracking, sleep analysis, mood monitoring, and wellness insights into one private, beautifully designed experience. No ads. No data selling. Ever.",
  keywords: [
    "period tracker",
    "menstrual health",
    "sleep tracking",
    "mood tracker",
    "wellness",
    "women's health",
  ],
};

import { Providers } from "@/components/Providers";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${dmSerif.variable} ${inter.variable} ${dmMono.variable}`}
      suppressHydrationWarning
    >
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
