'use client';
import React from 'react';
import type { IconType } from 'react-icons';
import { FiCpu, FiLayout, FiMessageSquare, FiShield, FiTrendingUp, FiZap } from 'react-icons/fi';

interface IconBannerProps {
  icons: {
    label: string;
    Icon: IconType;
  }[] | ReadonlyArray<{ label: string; Icon: IconType }>;
  speed?: string; // Duração da animação, ex: '20s', '40s'
}

const IconBanner: React.FC<IconBannerProps> = ({ icons, speed = '40s' }) => {
  // Duplicar os ícones para criar um efeito de loop contínuo e suave
  const iconsArray = Array.from(icons);
  const duplicatedIcons = [...iconsArray, ...iconsArray];

  return (
    <div className="w-full py-10 md:py-14 overflow-hidden bg-black/5 dark:bg-black/10">
      <div className="relative">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-semibold text-slate-900 dark:text-white">Stack que usamos no dia a dia</h2>
            <p className="mt-2 text-sm sm:text-base text-slate-100/90">
              Um visual mais limpo, consistente e com identidade. React + Next.js + Node.js com foco em performance,
              automação e acompanhamento.
            </p>
          </div>
        </div>
        {/* Scrolling Icons Banner Start */}
        <div className="w-full mt-8 mb-10 space-y-3">
          <div className="relative w-full overflow-hidden">
            <div
              className="flex items-center justify-start animate-scroll"
              style={{ '--animation-duration': speed } as React.CSSProperties}
            >
              {duplicatedIcons.map((icon, index) => (
                <div key={`row1-${index}`} className="flex-shrink-0 px-3 py-3">
                  <div className="flex items-center gap-2 rounded-full border border-black/10 bg-black/5 px-4 py-2 whitespace-nowrap dark:border-white/10 dark:bg-gradient-to-r dark:from-white/10 dark:to-white/5">
                    <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-black/5 dark:bg-white/10">
                      <icon.Icon className="w-5 h-5 text-slate-900/90 dark:text-white/90" aria-hidden="true" />
                    </span>
                    <span className="text-sm font-semibold text-slate-700 dark:text-white/90">{icon.label}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-white to-transparent dark:from-black/40" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-white to-transparent dark:from-black/40" />
          </div>

          <div className="relative w-full overflow-hidden">
            <div
              className="flex items-center justify-start animate-scroll-reverse"
              style={{ '--animation-duration': speed } as React.CSSProperties}
            >
              {duplicatedIcons.map((icon, index) => (
                <div key={`row2-${index}`} className="flex-shrink-0 px-3 py-3">
                  <div className="flex items-center gap-2 rounded-full border border-black/10 bg-black/5 px-4 py-2 whitespace-nowrap dark:border-white/10 dark:bg-gradient-to-r dark:from-white/5 dark:to-white/10">
                    <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-black/5 dark:bg-white/10">
                      <icon.Icon className="w-5 h-5 text-slate-900/90 dark:text-white/90" aria-hidden="true" />
                    </span>
                    <span className="text-sm font-semibold text-slate-600 dark:text-white/80">{icon.label}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-white to-transparent dark:from-black/40" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-white to-transparent dark:from-black/40" />
          </div>
        </div>
        {/* Scrolling Icons Banner End */}

        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-5xl mx-auto rounded-3xl bg-black/5 border border-black/10 backdrop-blur-md p-5 sm:p-6 dark:bg-white/10 dark:border-white/15">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl sm:text-2xl font-semibold text-slate-900 dark:text-white">Experiência do cliente</h3>
                <p className="mt-1 text-sm text-slate-700 dark:text-white/85">
                  Do primeiro contato ao acompanhamento do projeto: tudo em um fluxo moderno.
                </p>
              </div>

              <div className="hidden md:block">
                <div className="relative w-40 h-72 rounded-[2.25rem] border border-black/10 bg-black/5 overflow-hidden dark:border-white/20 dark:bg-black/40">
                  <div className="absolute inset-x-0 top-0 h-7 bg-black/30 border-b border-white/10" />
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 h-1.5 w-12 rounded-full bg-white/20" />

                  <div className="absolute inset-0 p-4 pt-10">
                    <div className="rounded-2xl bg-white/10 border border-white/10 p-3">
                      <div className="h-3 w-24 rounded bg-white/20" />
                      <div className="mt-2 h-2 w-28 rounded bg-white/15" />
                      <div className="mt-1 h-2 w-20 rounded bg-white/10" />
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <div className="rounded-2xl bg-white/10 border border-white/10 p-3">
                        <div className="h-6 w-6 rounded-xl bg-white/15" />
                        <div className="mt-2 h-2 w-16 rounded bg-white/15" />
                      </div>
                      <div className="rounded-2xl bg-white/10 border border-white/10 p-3">
                        <div className="h-6 w-6 rounded-xl bg-white/15" />
                        <div className="mt-2 h-2 w-14 rounded bg-white/15" />
                      </div>
                      <div className="rounded-2xl bg-white/10 border border-white/10 p-3">
                        <div className="h-6 w-6 rounded-xl bg-white/15" />
                        <div className="mt-2 h-2 w-16 rounded bg-white/15" />
                      </div>
                      <div className="rounded-2xl bg-white/10 border border-white/10 p-3">
                        <div className="h-6 w-6 rounded-xl bg-white/15" />
                        <div className="mt-2 h-2 w-12 rounded bg-white/15" />
                      </div>
                    </div>

                    <div className="mt-3 rounded-2xl bg-white/10 border border-white/10 p-3">
                      <div className="h-2 w-24 rounded bg-white/15" />
                      <div className="mt-2 h-2 w-28 rounded bg-white/10" />
                      <div className="mt-1 h-2 w-20 rounded bg-white/10" />
                    </div>
                  </div>

                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/40" />
                </div>
                <p className="mt-2 text-center text-xs text-slate-600 dark:text-white/70">Mockup • tema escuro</p>
              </div>

              <div className="flex flex-wrap gap-2">
                <a href="/register" className="rounded-full bg-black/5 border border-black/10 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-black/10 transition dark:bg-white/10 dark:border-white/20 dark:text-white dark:hover:bg-white/15">
                  Cadastro
                </a>
                <a href="/iaagent" className="rounded-full bg-black/5 border border-black/10 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-black/10 transition dark:bg-white/10 dark:border-white/20 dark:text-white dark:hover:bg-white/15">
                  IA Agent
                </a>
                <a href="/dashboard" className="rounded-full bg-black/5 border border-black/10 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-black/10 transition dark:bg-white/10 dark:border-white/20 dark:text-white dark:hover:bg-white/15">
                  Dashboard
                </a>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                { title: 'Briefing com IA', desc: 'Coleta requisitos e organiza o escopo.', Icon: FiMessageSquare },
                { title: 'Performance', desc: 'SEO, LCP e experiência rápida.', Icon: FiTrendingUp },
                { title: 'Automação', desc: 'Fluxos com integrações e gatilhos.', Icon: FiZap },
                { title: 'Arquitetura', desc: 'Código limpo e escalável.', Icon: FiCpu },
                { title: 'Design consistente', desc: 'UI moderna e identidade forte.', Icon: FiLayout },
                { title: 'Segurança', desc: 'Boas práticas desde o início.', Icon: FiShield },
              ].map(({ title, desc, Icon }) => (
                <div key={title} className="rounded-2xl bg-black/5 border border-black/10 p-4 hover:bg-black/10 transition dark:bg-white/10 dark:border-white/15 dark:hover:bg-white/15">
                  <Icon className="h-6 w-6 text-slate-800 dark:text-white/90" aria-hidden="true" />
                  <p className="mt-3 text-sm font-semibold text-slate-900 dark:text-white">{title}</p>
                  <p className="mt-1 text-xs text-slate-600 dark:text-white/75">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IconBanner;
