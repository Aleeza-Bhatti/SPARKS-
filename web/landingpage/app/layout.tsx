import type { Metadata } from "next";
import { Barlow_Condensed, Cormorant_Garamond, Fraunces, Urbanist } from "next/font/google";
import type { ReactNode } from "react";
import ConditionalFooter from "@/components/ConditionalFooter";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const heading = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["500", "600", "700"],
});

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

const body = Urbanist({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700"],
});

const detail = Barlow_Condensed({
  subsets: ["latin"],
  variable: "--font-detail",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Sparks",
  description: "Modest fashion discovery, curated to your style.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={`${heading.variable} ${display.variable} ${body.variable} ${detail.variable}`}>
        <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
          <div style={{ flex: 1 }}>{children}</div>
          <ConditionalFooter />
        </div>
        <Analytics />
      </body>
    </html>
  );
}
