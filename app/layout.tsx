import type { Metadata } from "next";
import { Geist, Geist_Mono, Fraunces, Cinzel, Special_Elite } from "next/font/google";
import "./globals.css";
import TopNav from "./TopNav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Variable serif — body and section headings.
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["SOFT", "opsz"],
});

// Cinzel — Roman-engraving caps. For brand wordmark, ornamental headers,
// and copper-plate-style labels in the steampunk treatment.
const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["400", "600", "700", "900"],
});

// Special Elite — typewriter face. For accent metadata and ledger-style
// captions in the steampunk treatment.
const specialElite = Special_Elite({
  variable: "--font-special-elite",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Strata Mundo — math mastery diagnostic",
  description:
    "A diagnostic that sees what tests miss, and a plan that closes the gap. Layer by layer, mastery is earned.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} ${cinzel.variable} ${specialElite.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <TopNav />
        {children}
      </body>
    </html>
  );
}
