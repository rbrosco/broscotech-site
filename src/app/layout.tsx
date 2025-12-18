import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Footer from "../component/Footer";
import ThemeProvider from "../component/ThemeProvider"; // Importando o ThemeProvider

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Broscotech",
  description: "Criado por Rogger",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}>
        <ThemeProvider /> {/* Aplica o tema no cliente sem quebrar o SSR */}
        <main className="flex-1 pt-10">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
