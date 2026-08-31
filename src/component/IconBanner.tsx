'use client';
import React from 'react';
import type { IconType } from 'react-icons';
import { FiCheck, FiCpu, FiLayout, FiMessageSquare, FiShield, FiTrendingUp, FiZap } from 'react-icons/fi';

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

              {/* Device Mockup — desktop + mobile, com profundidade 3D */}
              <div
                className="hidden lg:block relative animate-float shrink-0"
                style={{ width: 340, height: 250, perspective: 1400 }}
              >
                {/* Ambient glow atrás dos dois dispositivos */}
                <div
                  aria-hidden="true"
                  className="absolute inset-0 -z-10 scale-110 blur-2xl dark:opacity-40 opacity-25"
                  style={{ background: 'radial-gradient(ellipse at 55% 55%, #00b09b 0%, #004aad 60%, transparent 100%)' }}
                />

                {/* Browser / desktop window */}
                <div
                  className="absolute left-0 top-0 w-[248px]"
                  style={{
                    transform: 'rotateY(10deg) rotateX(4deg) rotateZ(-1deg)',
                    transformStyle: 'preserve-3d',
                    boxShadow: '18px 26px 44px -16px rgba(4,13,26,0.35)',
                  }}
                >
                  {/* Barra do navegador */}
                  <div className="rounded-t-xl border border-b-0 border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/[0.06] px-2.5 py-[7px] flex items-center gap-1.5">
                    <span className="h-[7px] w-[7px] rounded-full bg-red-400/80" />
                    <span className="h-[7px] w-[7px] rounded-full bg-amber-400/80" />
                    <span className="h-[7px] w-[7px] rounded-full bg-emerald-400/80" />
                    <span className="ml-2 flex-1 rounded-md bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 px-2 py-[2px] text-[9px] text-slate-400 dark:text-white/40 truncate">
                      app.easydev.com/dashboard
                    </span>
                  </div>

                  {/* Conteúdo da tela */}
                  <div className="rounded-b-xl border border-t-0 border-slate-200 dark:border-white/10 bg-white dark:bg-[#0a0f1e] p-3 flex gap-2.5">
                    {/* Sidebar mini */}
                    <div className="w-9 shrink-0 flex flex-col gap-2">
                      <div className="h-6 w-6 rounded-md" style={{ background: 'linear-gradient(135deg,#004aad,#00b09b)' }} />
                      <div className="h-1.5 rounded-full w-full bg-slate-200 dark:bg-white/10" />
                      <div className="h-1.5 rounded-full w-full bg-slate-200 dark:bg-white/10" />
                      <div className="h-1.5 rounded-full w-full bg-slate-200 dark:bg-white/10" />
                    </div>
                    {/* Conteúdo principal */}
                    <div className="flex-1 flex flex-col gap-2">
                      <div className="grid grid-cols-3 gap-1.5">
                        <div className="h-9 rounded-md border border-[#00b09b]/25 bg-[#00b09b]/10" />
                        <div className="h-9 rounded-md border border-blue-200 dark:border-blue-500/25 bg-blue-50 dark:bg-blue-500/10" />
                        <div className="h-9 rounded-md border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5" />
                      </div>
                      <div className="rounded-md border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-2 flex flex-col gap-1.5 justify-center h-[46px]">
                        <div className="h-1.5 w-1/2 rounded-full bg-slate-300 dark:bg-white/15" />
                        <div className="h-1.5 w-4/5 rounded-full bg-slate-200 dark:bg-white/10" />
                      </div>
                      <div className="h-[46px] rounded-md border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5" />
                    </div>
                  </div>
                </div>

                {/* Phone frame — sobreposto na frente */}
                <div
                  className="absolute right-1 -bottom-1 w-[104px]"
                  style={{
                    transform: 'rotateY(-12deg) rotateX(3deg) rotateZ(2deg)',
                    transformStyle: 'preserve-3d',
                    filter: 'drop-shadow(-14px 20px 26px rgba(4,13,26,0.4))',
                  }}
                >
                  <div
                    className="relative rounded-[1.6rem] p-[2px]"
                    style={{ background: 'linear-gradient(160deg, #004aad 0%, #00b09b 100%)' }}
                  >
                    <div className="relative rounded-[1.45rem] overflow-hidden bg-slate-100 dark:bg-[#0a0f1e]" style={{ height: 188 }}>
                      {/* Dynamic Island */}
                      <div className="absolute top-2 left-1/2 -translate-x-1/2 h-[10px] w-[32px] rounded-full z-10 bg-black" />

                      {/* Conteúdo da tela */}
                      <div className="absolute inset-0 pt-6 px-2 pb-2 flex flex-col gap-1.5">
                        <div className="flex items-center justify-between px-0.5">
                          <div className="h-1.5 w-8 rounded-full bg-[#00b09b]/60" />
                          <div className="h-2.5 w-2.5 rounded-full" style={{ background: 'linear-gradient(135deg,#004aad,#00b09b)' }} />
                        </div>
                        <div className="rounded-lg p-1.5 bg-blue-50 dark:bg-gradient-to-br dark:from-[#004aad80] dark:to-[#00b09b4d]">
                          <div className="h-1 w-8 rounded-full mb-1 bg-slate-300 dark:bg-white/25" />
                          <div className="h-2.5 w-6 rounded bg-slate-700 dark:bg-white/90" />
                        </div>
                        <div className="grid grid-cols-2 gap-1.5">
                          <div className="h-[26px] rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/[0.06]" />
                          <div className="h-[26px] rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/[0.06]" />
                        </div>
                        <div className="mt-auto h-[16px] rounded-lg border border-slate-200 dark:border-white/[0.06] bg-white/60 dark:bg-white/[0.04]" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Badge — status ao vivo */}
                <div
                  className="absolute left-0 -top-2 flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold shadow-lg"
                  style={{ background: 'linear-gradient(135deg,#004aad,#00b09b)', color: '#fff', whiteSpace: 'nowrap' }}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-white/80 animate-pulse inline-block" />
                  Live
                </div>

                {/* Notificação flutuante */}
                <div
                  className="absolute right-24 bottom-16 rounded-xl px-2.5 py-1.5 shadow-xl text-xs border border-[#00b09b]/30 bg-white dark:bg-[rgba(10,15,30,0.92)] text-slate-800 dark:text-white flex items-center gap-1.5"
                  style={{ whiteSpace: 'nowrap', backdropFilter: 'blur(8px)' }}
                >
                  <FiCheck className="w-3.5 h-3.5 text-[#00d4aa]" aria-hidden="true" />
                  <span>Deploy concluído</span>
                </div>

                <p className="absolute left-0 bottom-0 text-xs font-medium" style={{ color: 'var(--color-accent)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
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
