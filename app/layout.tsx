import type { Metadata } from "next";
import { DM_Serif_Display, Space_Mono } from "next/font/google";
import "katex/dist/katex.min.css";
import "highlight.js/styles/github-dark.css";
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
  metadataBase: new URL("https://snap2study.vercel.app"),

  title: {
    default: "Snap2Study — Snap. Understand. Learn.",
    template: "%s — Snap2Study",
  },

  description: "Snap a question and turn it into a clear, useful study experience with Snap2Study.",
  applicationName: "Snap2Study",
  keywords: [
    "Snap2Study",
    "AI study tool",
    "AI homework helper",
    "question solver",
    "student study tool",
    "AI question solver",
    "study assistant",
    "student AI",
  ],
  authors: [
    {
      name: "Snap2Study",
    },
  ],
  creator: "Snap2Study",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://snap2study.vercel.app",
    siteName: "Snap2Study",
    title: "Snap2Study — Snap. Understand. Learn.",
    description: "Turn questions into understanding with Snap2Study.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Snap2Study — Snap. Understand. Learn.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Snap2Study — Snap. Understand. Learn.",
    description: "Turn questions into understanding with Snap2Study.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${dmSerif.variable} ${spaceMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}