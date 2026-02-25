import type { Metadata } from "next";
import { Cormorant_Garamond, Fraunces, Sora, Urbanist } from "next/font/google";
import type { ReactNode } from "react";
import "./globals.css";

const heading = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["500", "600", "700"],
});

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["700", "800", "900"],
});

const body = Urbanist({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700"],
});

const detail = Sora({
  subsets: ["latin"],
  variable: "--font-detail",
  weight: ["300", "400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Sparks Waitlist",
  description:
    "Join the Sparks waitlist for early access to premium modest fashion discovery curated to your style.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={`${heading.variable} ${display.variable} ${body.variable} ${detail.variable}`}>{children}</body>
    </html>
  );
}
