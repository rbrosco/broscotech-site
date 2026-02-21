import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Footer from "../component/Footer";
import ThemeProvider from "../component/ThemeProvider"; // Importando o ThemeProvider
import IAAgentButton from "../component/IAAgentButton";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EasyDev",
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
    const theme = stored === 'dark' ? 'dark' : 'light';
    const isDark = theme === 'dark';
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
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col relative`}>
        <div
          aria-hidden="true"
          className="fixed inset-0 z-0 pointer-events-none select-none bg-[url('/images/bg-circuit.png?v=2')] bg-center bg-cover bg-fixed bg-no-repeat opacity-20 dark:opacity-32 dark:filter dark:blur-sm dark:brightness-75 w-screen h-screen"
        />
        <div className="relative z-10">
          <ThemeProvider>
            <main className="flex-1 pt-10">{children}</main>
            <IAAgentButton />
            <Footer />
          </ThemeProvider>
        </div>
      </body>
    </html>
  );
}
