import type { Metadata } from "next";
import { DM_Serif_Display, Space_Mono } from "next/font/google";
import "./globals.css";

const dmSerif = DM_Serif_Display({
  variable: "--font-dm-serif",
  subsets: ["latin"],
  weight: "400",
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Snap2Study — Snap. Understand. Learn.",
  description:
    "Turn questions into understanding with Snap2Study.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${dmSerif.variable} ${spaceMono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}