import type { Metadata } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import "./globals.css";
import Footer from "../component/Footer";
import ThemeProvider from "../component/ThemeProvider";
import IAAgentButton from "../component/IAAgentButton";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "EasyDev — Soluções Digitais que Entregam",
  description: "Sites, sistemas, automações e integrações com foco em performance, clareza e resultado real.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
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
      <body className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} antialiased min-h-screen flex flex-col relative`}>
        <div
          aria-hidden="true"
          className="fixed inset-0 z-0 pointer-events-none select-none bg-[url('/images/bg-circuit.png?v=2')] bg-center bg-cover bg-fixed bg-no-repeat opacity-[0.04] dark:opacity-[0.06] w-screen h-screen"
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
