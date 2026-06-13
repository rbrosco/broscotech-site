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
    <div className="w-full py-12 md:py-16 overflow-hidden" style={{ background: 'var(--background)' }}>
      <div className="relative">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">Stack que usamos no dia a dia</h2>
            <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-white/90">
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
                  <div className="flex items-center gap-2 rounded-full border border-black/8 bg-white/80 px-4 py-2 whitespace-nowrap dark:border-white/10 dark:bg-white/5">
                    <span className="inline-flex items-center justify-center w-9 h-9 rounded-full" style={{ background: 'var(--color-accent-dim)' }}>
                      <icon.Icon className="w-5 h-5" style={{ color: 'var(--color-accent)' }} aria-hidden="true" />
                    </span>
                    <span className="text-sm font-semibold text-slate-700 dark:text-white/85">{icon.label}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="pointer-events-none absolute inset-y-0 left-0 w-20 z-10" style={{ background: 'linear-gradient(to right, var(--background), transparent)' }} />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-20 z-10" style={{ background: 'linear-gradient(to left, var(--background), transparent)' }} />
          </div>

          <div className="relative w-full overflow-hidden">
            <div
              className="flex items-center justify-start animate-scroll-reverse"
              style={{ '--animation-duration': speed } as React.CSSProperties}
            >
              {duplicatedIcons.map((icon, index) => (
                <div key={`row2-${index}`} className="flex-shrink-0 px-3 py-3">
                  <div className="flex items-center gap-2 rounded-full border border-black/8 bg-white/80 px-4 py-2 whitespace-nowrap dark:border-white/10 dark:bg-white/5">
                    <span className="inline-flex items-center justify-center w-9 h-9 rounded-full" style={{ background: 'var(--color-accent-dim)' }}>
                      <icon.Icon className="w-5 h-5" style={{ color: 'var(--color-accent)' }} aria-hidden="true" />
                    </span>
                    <span className="text-sm font-semibold text-slate-700 dark:text-white/85">{icon.label}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="pointer-events-none absolute inset-y-0 left-0 w-20 z-10" style={{ background: 'linear-gradient(to right, var(--background), transparent)' }} />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-20 z-10" style={{ background: 'linear-gradient(to left, var(--background), transparent)' }} />
          </div>
        </div>
        {/* Scrolling Icons Banner End */}

        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-5xl mx-auto rounded-3xl bg-white border border-slate-200 p-5 sm:p-6 shadow-sm dark:bg-black/10 dark:border-white/15 dark:backdrop-blur-md">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl sm:text-2xl font-semibold text-slate-900 dark:text-white">Experiência do cliente</h3>
                <p className="mt-1 text-sm text-slate-700 dark:text-white/85">
                  Do primeiro contato ao acompanhamento do projeto: tudo em um fluxo moderno.
                </p>
              </div>

              {/* Phone Mockup */}
              <div className="hidden md:block relative animate-float" style={{ width: 160 }}>
                {/* Ambient glow behind phone */}
                <div
                  aria-hidden="true"
                  className="absolute inset-0 -z-10 scale-110 blur-2xl dark:opacity-40 opacity-20"
                  style={{ background: 'radial-gradient(ellipse at 50% 60%, #00b09b 0%, #004aad 60%, transparent 100%)' }}
                />

                {/* Phone frame — gradient border */}
                <div
                  className="relative rounded-[2.5rem] p-[2px]"
                  style={{ background: 'linear-gradient(160deg, #004aad 0%, #00b09b 100%)' }}
                >
                  {/* Screen */}
                  <div className="relative rounded-[2.375rem] overflow-hidden bg-slate-100 dark:bg-[#0a0f1e]" style={{ height: 288 }}>
                    {/* Dynamic Island */}
                    <div className="absolute top-3 left-1/2 -translate-x-1/2 h-[18px] w-[52px] rounded-full z-10 bg-black dark:bg-black" />

                    {/* Screen content */}
                    <div className="absolute inset-0 pt-9 px-3 pb-3 flex flex-col gap-2 overflow-hidden">
                      {/* Header bar */}
                      <div className="flex items-center justify-between px-1">
                        <div className="h-2 w-12 rounded-full bg-[#00b09b]/60" />
                        <div className="h-4 w-4 rounded-full" style={{ background: 'linear-gradient(135deg,#004aad,#00b09b)' }} />
                      </div>

                      {/* Stat card */}
                      <div className="rounded-2xl p-3 border border-[#00b09b]/25 bg-blue-50 dark:bg-gradient-to-br dark:from-[#004aad80] dark:to-[#00b09b4d]">
                        <div className="h-1.5 w-16 rounded-full mb-2 bg-slate-300 dark:bg-white/25" />
                        <div className="h-5 w-10 rounded-md bg-slate-700 dark:bg-white/90" />
                        <div className="mt-1.5 h-1 w-20 rounded-full bg-[#00b09b]/50" />
                      </div>

                      {/* 2-col cards */}
                      <div className="grid grid-cols-2 gap-2">
                        {([['#004aad', '#1e3a8a'], ['#00b09b', '#065f46'], ['#7c3aed', '#4c1d95'], ['#f59e0b', '#92400e']] as [string,string][]).map(([a, b], i) => (
                          <div
                            key={i}
                            className="rounded-xl p-2.5 border border-slate-200 bg-white dark:border-white/[0.06]"
                            style={{ ['--a' as string]: a, ['--b' as string]: b }}
                          >
                            <div className="h-5 w-5 rounded-lg mb-1.5" style={{ background: `linear-gradient(135deg, ${a}, ${b})` }} />
                            <div className="h-1.5 w-full rounded-full bg-slate-200 dark:bg-white/15" />
                            <div className="mt-1 h-1.5 w-3/4 rounded-full bg-slate-100 dark:bg-white/8" />
                          </div>
                        ))}
                      </div>

                      {/* Bottom bar */}
                      <div className="rounded-xl px-3 py-2 flex items-center justify-between mt-auto border border-slate-200 bg-white/60 dark:border-white/[0.06] dark:bg-white/[0.04]">
                        <div className="h-5 w-5 rounded-full" style={{ background: 'linear-gradient(135deg,#00b09b,#004aad)' }} />
                        <div className="h-5 w-5 rounded-full bg-slate-200 dark:bg-white/10" />
                        <div className="h-5 w-5 rounded-full bg-slate-200 dark:bg-white/10" />
                        <div className="h-5 w-5 rounded-full bg-slate-200 dark:bg-white/10" />
                      </div>
                    </div>

                    {/* Bottom screen glow */}
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16" style={{ background: 'linear-gradient(to top, rgba(0,176,155,0.10), transparent)' }} />
                  </div>
                </div>

                {/* Floating badge — status */}
                <div
                  className="absolute -right-8 top-10 flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold shadow-lg"
                  style={{ background: 'linear-gradient(135deg,#004aad,#00b09b)', color: '#fff', whiteSpace: 'nowrap' }}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-white/80 animate-pulse inline-block" />
                  Live
                </div>

                {/* Floating notification */}
                <div
                  className="absolute -left-10 bottom-14 rounded-2xl px-3 py-2 shadow-xl text-xs border border-[#00b09b]/30 bg-white dark:bg-[rgba(10,15,30,0.92)] text-slate-800 dark:text-white"
                  style={{ whiteSpace: 'nowrap', backdropFilter: 'blur(8px)' }}
                >
                  <span style={{ color: '#00d4aa' }}>✓</span> Deploy concluído
                </div>

                <p className="mt-3 text-center text-[11px] font-medium" style={{ color: 'var(--color-accent)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  EasyDev • App
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <a href="/register" className="rounded-full bg-white border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50 transition dark:bg-white/10 dark:border-white/20 dark:text-white dark:hover:bg-white/15">
                  Cadastro
                </a>
                <a href="/iaagent" className="rounded-full bg-white border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50 transition dark:bg-white/10 dark:border-white/20 dark:text-white dark:hover:bg-white/15">
                  IA Agent
                </a>
                <a href="/dashboard" className="rounded-full bg-white border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50 transition dark:bg-white/10 dark:border-white/20 dark:text-white dark:hover:bg-white/15">
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
                <div key={title} className="rounded-2xl bg-white border border-slate-200 p-4 hover:bg-slate-50 transition dark:bg-white/10 dark:border-white/15 dark:hover:bg-white/15">
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
