'use client';
import React from 'react';
import { FiCpu, FiGitBranch, FiLayers, FiMessageSquare, FiShield, FiTrendingUp, FiZap } from 'react-icons/fi';

const Sobre: React.FC = () => {
  const valuesData = [
    {
      Icon: FiZap,
      text: "Inovação com propósito",
    },
    {
      Icon: FiShield,
      text: "Entrega e compromisso",
    },
    {
      Icon: FiLayers,
      text: "Ética e transparência",
    },
    {
      Icon: FiTrendingUp,
      text: "Impacto real no negócio",
    }
  ];

  return (
    <section id="Sobre" className="py-12 md:py-16 scroll-mt-[calc(var(--header-height)+1rem)]">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl border border-border bg-white/70 backdrop-blur-sm p-6 sm:p-8 dark:bg-white/5">
          <div className="pointer-events-none absolute -inset-10 opacity-10 dark:opacity-15">
            <div className="gradient w-full h-full blur-3xl" />
          </div>

          <div className="relative">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
              <div className="max-w-3xl">
                <p className="text-xs font-semibold uppercase tracking-widest mb-3 text-accent">
                  Quem somos
                </p>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground">
                  Sobre a <span className="font-display italic">EasyDev</span>
                </h2>
                <p className="mt-4 text-base sm:text-lg text-fg-muted">
                  Transformamos ideias em produto: site, sistema, automação e integração — com uma experiência moderna,
                  multi-dispositivo e um fluxo claro do briefing até o acompanhamento no dashboard.
                </p>
              </div>

              <div className="w-full lg:w-[26rem]">
                <div className="rounded-2xl border border-border bg-white/70 p-5 dark:bg-white/5">
                  <p className="text-xs font-semibold uppercase tracking-widest text-fg-subtle mb-1">
                    Como entregamos
                  </p>
                  <div className="mt-3 space-y-3">
                    {[
                      { title: 'Briefing com IA', desc: 'Perguntas certas → escopo claro', Icon: FiMessageSquare },
                      { title: 'Arquitetura sólida', desc: 'React/Next/Node bem estruturado', Icon: FiLayers },
                      { title: 'Automação e integração', desc: 'n8n, Google, APIs, WhatsApp', Icon: FiZap },
                      { title: 'Acompanhamento', desc: 'Dashboard com progresso e updates', Icon: FiTrendingUp },
                    ].map(({ title, desc, Icon }) => (
                      <div key={title} className="flex items-start gap-3 rounded-2xl border border-border bg-white/60 p-4 dark:bg-white/4">
                        <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl shrink-0 bg-accent-dim text-accent">
                          <Icon className="h-5 w-5" aria-hidden="true" />
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-foreground">{title}</p>
                          <p className="mt-0.5 text-xs text-fg-subtle">{desc}</p>
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
            <h2 className="text-3xl sm:text-4xl font-semibold mb-4 animate__animated animate__fadeIn text-foreground">
              Nossa Missão e Valores
            </h2>
            <p className="text-base sm:text-lg max-w-3xl mx-auto mb-8 animate__animated animate__fadeIn animate__delay-1s text-fg-muted">
              Nossa missão é entregar tecnologia que vira resultado: performance, automação e acompanhamento.
              A gente constrói com base sólida (React/Next/Node) e evolui com dados e feedback.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
            <div className="lg:col-span-1 rounded-3xl border border-border bg-white/60 p-6 dark:bg-white/10">
              <p className="text-sm font-semibold text-foreground">Princípios</p>
              <p className="mt-2 text-sm text-fg-muted">
                Menos promessa, mais execução. A gente prefere um fluxo claro, telas consistentes e decisões orientadas por dados.
              </p>

              <div className="mt-5 space-y-3">
                {[
                  { label: 'Código limpo', Icon: FiGitBranch },
                  { label: 'Segurança', Icon: FiShield },
                  { label: 'Performance', Icon: FiTrendingUp },
                  { label: 'Automação', Icon: FiZap },
                ].map(({ label, Icon }) => (
                  <div key={label} className="flex items-center gap-3 rounded-2xl border border-border bg-white/60 px-4 py-3 dark:bg-black/20">
                    <Icon className="h-5 w-5 text-foreground" aria-hidden="true" />
                    <span className="text-sm font-semibold text-foreground">{label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {valuesData.map((value, index) => (
                  <div
                    key={index}
                    className="flex flex-col items-start justify-between p-5 rounded-3xl transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-[1.01] group bg-white/60 hover:bg-white/50 border border-border shadow-sm dark:bg-white/10 dark:hover:bg-white/15 hover:border-accent/30"
                  >
                    <div className="flex items-center gap-3 w-full">
                      <value.Icon className="h-7 w-7 text-accent transition-transform duration-300 group-hover:scale-110" aria-hidden="true" />
                      <div className="h-px flex-1 bg-border" />
                    </div>
                    <p className="mt-4 text-base font-semibold text-foreground">{value.text}</p>
                    <p className="mt-1 text-xs text-fg-subtle">
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
            <h2 className="text-3xl sm:text-4xl font-semibold mb-4 animate__animated animate__fadeIn text-foreground">
              O que fazemos
            </h2>
            <p className="text-base sm:text-lg max-w-3xl mx-auto mb-10 animate__animated animate__fadeIn animate__delay-1s text-fg-muted">
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
                className="relative overflow-hidden rounded-3xl border border-border bg-white/60 p-6 backdrop-blur-md transition hover:bg-white/50 dark:bg-white/10 dark:hover:bg-white/15 hover:border-accent/30"
              >
                <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-accent-dim blur-2xl" />
                <div className="relative">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-white/60 dark:border-white/10 dark:bg-black/20 text-accent">
                      <Icon className="h-6 w-6" aria-hidden="true" />
                    </span>
                    <h3 className="text-xl font-semibold text-foreground">{title}</h3>
                  </div>
                  <p className="mt-4 text-sm text-fg-muted">{desc}</p>
                  <div className="mt-5 flex flex-wrap gap-2 text-xs">
                    {['Multi-dispositivo', 'Tema claro/escuro', 'Integrações', 'Dashboard'].slice(0, title === 'Automação e integrações' ? 3 : 4).map((tag) => (
                      <span
                        key={`${title}-${tag}`}
                        className="rounded-full bg-white/60 border border-border px-3 py-1 text-fg-muted dark:bg-black/20 dark:border-white/10"
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
