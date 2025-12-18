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
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(() => {
  try {
    const storageKey = 'theme';
    const stored = localStorage.getItem(storageKey);
    const theme = stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'system';
    const systemDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = theme === 'dark' || (theme === 'system' && systemDark);
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(isDark ? 'dark' : 'light');
  } catch (_) {
    // noop
  }
})();`,
          }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}>
        <ThemeProvider>
          <main className="flex-1 pt-10">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
