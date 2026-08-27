import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: {
    default: "EveryGyan — Know more. Live better.",
    template: "%s | EveryGyan",
  },
  description:
    "A modern independent publication for news, travel, entertainment, health and practical learning.",
  openGraph: {
    title: "EveryGyan — Know more. Live better.",
    description: "News, travel ideas and practical knowledge for curious minds.",
    type: "website",
    siteName: "EveryGyan",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}

