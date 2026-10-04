import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "THENGA — A Taste of Kerala in Every Sip",
  description: "Paradise in every sip. Discover THENGA, a premium coconut-water concept rooted in the tropical beauty of Kerala.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
