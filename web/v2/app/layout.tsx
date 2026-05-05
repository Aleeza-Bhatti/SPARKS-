import type { Metadata } from "next";
import { Fraunces, Urbanist, Cormorant_Garamond, Barlow_Condensed } from "next/font/google";
import "./globals.css";

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700", "800"],
});

const body = Urbanist({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700"],
});

const heading = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["500", "600", "700"],
});

const detail = Barlow_Condensed({
  subsets: ["latin"],
  variable: "--font-detail",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Sparks — Modest Fashion, Finally Findable",
  description:
    "Tell us your standards. We search hundreds of brands and bring back only what actually fits.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${display.variable} ${body.variable} ${heading.variable} ${detail.variable}`}>
        {children}
      </body>
    </html>
  );
}
