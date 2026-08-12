import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HH GOA 2026 | Frame Your Build",
  description: "Upload your photo and instantly generate an HH Goa 2026 branded social graphic.",
  keywords: ["Hacker House Goa", "HH Goa 2026", "Frame Generator", "Devfolio", "Goa"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground bg-grid" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
