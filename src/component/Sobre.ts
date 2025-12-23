'use client';

import { FiCpu, FiGitBranch, FiLayers, FiMessageSquare, FiShield, FiTrendingUp, FiZap } from 'react-icons/fi';

const Sobre: React.FC = () => {
  const valuesData = [
    {
      // Ícone: Lâmpada (Inovação)
      icon: "💡",
      text: "Inovação com propósito",
    },
    {
      // Ícone: Escudo com Check (Qualidade)
      icon: "🤝",
      text: "Entrega e compromisso",
    },
    {
      // Ícone: Folha/Planta (Sustentabilidade)
      icon: "🌱",
      text: "Ética e transparência",
    },
    {
      // Ícone: Globo (Impacto Social)
      icon: "🌍",
      text: "Impacto real no negócio",
    }
  ];

  return (
    <section id="Sobre" className="py-10 md:py-14 scroll-mt-[calc(var(--header-height)+1rem)]">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl border border-black/10 bg-black/5 backdrop-blur-md p-6 sm:p-8 dark:border-white/15 dark:bg-white/10">
          <div className="pointer-events-none absolute -inset-10 opacity-20 dark:opacity-25">
            <div className="gradient w-full h-full blur-3xl" />
          </div>

          <div className="relative">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
              <div className="max-w-3xl">
                <p className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/50 px-4 py-2 text-xs font-semibold text-slate-900 dark:border-white/15 dark:bg-black/20 dark:text-white">
                  <span className="opacity-80">Manifesto</span>
                  <span className="opacity-40">•</span>
                  <span className="opacity-80"></span>
                </p>

                <h1 className="mt-4 text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                  Sobre
                </h1>
                <p className="mt-4 text-base sm:text-lg text-slate-700 dark:text-white/85">
                  Transformamos ideias em produto: site, sistema, automação e integração — com uma experiência moderna,
                  multi-dispositivo e um fluxo claro do briefing até o acompanhamento no dashboard.
                </p>
              </div>

              <div className="w-full lg:w-[26rem]">
                <div className="rounded-3xl border border-black/10 bg-white/60 p-5 backdrop-blur-md dark:border-white/15 dark:bg-black/20">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-white/70">
                    Como entregamos
                  </p>
                  <div className="mt-3 space-y-3">
                    {[
                      { title: 'Briefing com IA', desc: 'Perguntas certas → escopo claro', Icon: FiMessageSquare },
                      { title: 'Arquitetura sólida', desc: 'React/Next/Node bem estruturado', Icon: FiLayers },
                      { title: 'Automação e integração', desc: 'n8n, Google, APIs, WhatsApp', Icon: FiZap },
                      { title: 'Acompanhamento', desc: 'Dashboard com progresso e updates', Icon: FiTrendingUp },
                    ].map(({ title, desc, Icon }) => (
                      <div key={title} className="flex items-start gap-3 rounded-2xl border border-black/10 bg-black/5 p-4 dark:border-white/10 dark:bg-white/10">
                        <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-black/10 bg-white/60 dark:border-white/10 dark:bg-black/20">
                          <Icon className="h-5 w-5 text-slate-900 dark:text-white/90" aria-hidden="true" />
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-slate-900 dark:text-white">{title}</p>
                          <p className="mt-0.5 text-xs text-slate-600 dark:text-white/70">{desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Missão e Valores */}
        <div className="max-w-6xl mx-auto mt-12">
          <div className="text-center">
            <h2 className="text-3xl sm:text-4xl font-semibold mb-4 animate__animated animate__fadeIn text-slate-900 dark:text-white">
            Nossa Missão e Valores
          </h2>
            <p className="text-base sm:text-lg max-w-3xl mx-auto mb-8 animate__animated animate__fadeIn animate__delay-1s text-slate-700 dark:text-slate-100">
            Nossa missão é entregar tecnologia que vira resultado: performance, automação e acompanhamento.
            A gente constrói com base sólida (React/Next/Node) e evolui com dados e feedback.
          </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
            <div className="lg:col-span-1 rounded-3xl border border-black/10 bg-black/5 p-6 dark:border-white/15 dark:bg-white/10">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Princípios</p>
              <p className="mt-2 text-sm text-slate-700 dark:text-white/80">
                Menos promessa, mais execução. A gente prefere um fluxo claro, telas consistentes e decisões orientadas por dados.
              </p>

              <div className="mt-5 space-y-3">
                {[
                  { label: 'Código limpo', Icon: FiGitBranch },
                  { label: 'Segurança', Icon: FiShield },
                  { label: 'Performance', Icon: FiTrendingUp },
                  { label: 'Automação', Icon: FiZap },
                ].map(({ label, Icon }) => (
                  <div key={label} className="flex items-center gap-3 rounded-2xl border border-black/10 bg-white/60 px-4 py-3 dark:border-white/10 dark:bg-black/20">
                    <Icon className="h-5 w-5 text-slate-900 dark:text-white/90" aria-hidden="true" />
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">{label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {valuesData.map((value, index) => (
                  <div
                    key={index}
                    className="flex flex-col items-start justify-between p-5 rounded-3xl transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-[1.01] group bg-black/5 hover:bg-black/10 border border-black/10 shadow-sm dark:bg-white/10 dark:hover:bg-white/15 dark:border-white/15"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-3xl transition-transform duration-300 group-hover:scale-110">{value.icon}</div>
                      <div className="h-px flex-1 bg-black/10 dark:bg-white/10" />
                    </div>
                    <p className="mt-4 text-base font-semibold text-slate-900 dark:text-white">{value.text}</p>
                    <p className="mt-1 text-xs text-slate-600 dark:text-white/70">
                      Compromisso aplicado em cada entrega.
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* O que fazemos */}
        <div className="max-w-6xl mx-auto mt-14">
          <div className="text-center">
            <h2 className="text-3xl sm:text-4xl font-semibold mb-4 animate__animated animate__fadeIn text-slate-900 dark:text-white">
            O que fazemos
          </h2>
            <p className="text-base sm:text-lg max-w-3xl mx-auto mb-10 animate__animated animate__fadeIn animate__delay-1s text-slate-700 dark:text-slate-100">
            Entregamos o pacote completo, do visual ao back-end — com integrações e automações para o seu negócio rodar no piloto automático.
          </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: 'Desenvolvimento Web',
                desc:
                  'Sites e web apps rápidos, responsivos e com UI consistente — prontos para SEO, performance e escala.',
                Icon: FiCpu,
              },
              {
                title: 'Aplicações móveis',
                desc:
                  'Experiência mobile com performance e integração: app, painel, notificações e tudo conectado ao seu sistema.',
                Icon: FiTrendingUp,
              },
              {
                title: 'Automação e integrações',
                desc:
                  'Fluxos com n8n, chatbots e integrações (Google, WhatsApp, APIs) para reduzir trabalho manual e ganhar velocidade.',
                Icon: FiZap,
              },
            ].map(({ title, desc, Icon }) => (
              <div
                key={title}
                className="relative overflow-hidden rounded-3xl border border-black/10 bg-black/5 p-6 backdrop-blur-md transition hover:bg-black/10 dark:border-white/15 dark:bg-white/10 dark:hover:bg-white/15"
              >
                <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-black/5 blur-2xl dark:bg-white/10" />
                <div className="relative">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-black/10 bg-white/60 dark:border-white/10 dark:bg-black/20">
                      <Icon className="h-6 w-6 text-slate-900 dark:text-white/90" aria-hidden="true" />
                    </span>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white">{title}</h3>
                  </div>
                  <p className="mt-4 text-sm text-slate-700 dark:text-white/80">{desc}</p>
                  <div className="mt-5 flex flex-wrap gap-2 text-xs">
                    {['Multi-dispositivo', 'Tema claro/escuro', 'Integrações', 'Dashboard'].slice(0, title === 'Automação e integrações' ? 3 : 4).map((tag) => (
                      <span
                        key={`${title}-${tag}`}
                        className="rounded-full bg-white/60 border border-black/10 px-3 py-1 text-slate-700 dark:bg-black/20 dark:border-white/10 dark:text-white/80"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Sobre;
