import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Geist_Mono } from "next/font/google";
import "./globals.css";

const systemaGrotesk = Plus_Jakarta_Sans({
  variable: "--font-systema-grotesk",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Beres.in - Sistem Manajemen Servis & Sparepart Gadget",
  description: "Platform Manajemen Servis HP, Inventaris Sparepart, dan Kasir POS Terintegrasi dengan Presisi Tinggi.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="id"
      className={`${systemaGrotesk.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-[#f8fafc] text-[#334155] dark:bg-[#0b192c] dark:text-[#94a3b8]">
        {children}
      </body>
    </html>
  );
}
