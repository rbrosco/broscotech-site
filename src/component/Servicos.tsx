'use client';
import React, { useState } from "react";
import Link from "next/link";
import ContactFormModal, { LeadInterest } from "./ContactFormModal";
import { motion } from "framer-motion";
import {
  FiMonitor,
  FiServer,
  FiZap,
  FiCpu,
  FiSmartphone,
  FiTrendingUp,
  FiCheckCircle,
  FiArrowRight,
  FiLayers,
  FiActivity,
  FiMessageSquare,
  FiCode,
  FiShield,
  FiClock,
  FiCheck,
} from "react-icons/fi";
import {
  SiNextdotjs,
  SiTypescript,
  SiPostgresql,
  SiN8N,
  SiTailwindcss,
} from "react-icons/si";

interface ServiceCardData {
  id: string;
  title: string;
  badge: string;
  featured?: boolean;
  icon: React.ReactNode;
  tagline: string;
  description: string;
  deliverables: string[];
  stack: string[];
  metrics: string;
}

const servicesList: ServiceCardData[] = [
  {
    id: "saas-webapps",
    title: "Sistemas Web & SaaS Full-Stack",
    badge: "Mais Solicitado",
    featured: true,
    icon: <FiMonitor className="w-6 h-6" />,
    tagline: "Do front-end moderno ao banco de dados blindado",
    description:
      "Desenvolvemos plataformas web completas, painéis administrativos, CRMs e aplicações SaaS sob medida. Foco em arquitetura escalável, autenticação segura e interfaces fluidas.",
    deliverables: [
      "Painel administrativo & Dashboard com gráficos",
      "Autenticação segura JWT com controle de acessos",
      "Código limpo, documentado e versionado no GitHub",
      "Deploy contínuo automatizado com CI/CD",
    ],
    stack: ["Next.js 15", "React 19", "TypeScript", "PostgreSQL", "Tailwind CSS"],
    metrics: "Sub-400ms TTFB",
  },
  {
    id: "ai-automation",
    title: "Agentes de IA & Automações n8n",
    badge: "Inovação",
    featured: true,
    icon: <FiCpu className="w-6 h-6" />,
    tagline: "Sua operação funcionando no piloto automático 24/7",
    description:
      "Integramos inteligência artificial (Groq, OpenAI) e fluxos no n8n para atendimento inteligente, qualificação instantânea de leads, disparo de webhooks e sincronização com seu CRM.",
    deliverables: [
      "Agentes de IA treinados no escopo da sua empresa",
      "Workflows de automação com n8n e webhooks",
      "Integração com WhatsApp, e-mail e planilhas",
      "Eliminação de 80%+ do trabalho manual repetitivo",
    ],
    stack: ["n8n", "Groq LLM", "OpenAI API", "Webhooks", "Node.js"],
    metrics: "24/7 Autônomo",
  },
  {
    id: "backend-apis",
    title: "Back-End Robusto & APIs RESTful",
    badge: "Alta Concorrência",
    icon: <FiServer className="w-6 h-6" />,
    tagline: "Microsserviços e bancos de dados modelados para crescer",
    description:
      "Estruturação de APIs rápidas, seguras e bem documentadas. Modelagem de dados com PostgreSQL, MongoDB e TypeORM para garantir integridade e velocidade de consulta.",
    deliverables: [
      "APIs RESTful com validação rigorosa de payloads",
      "Migrations automáticas e versionamento de schema",
      "Proteção contra SQL Injection, CORS e Rate Limiting",
      "Documentação clara e testes de integração",
    ],
    stack: ["Node.js", "Express / Next API", "PostgreSQL", "TypeORM", "Docker"],
    metrics: "99.9% Uptime",
  },
  {
    id: "seo-performance",
    title: "Performance Extrema & SEO Técnico",
    badge: "Lighthouse 100",
    icon: <FiZap className="w-6 h-6" />,
    tagline: "Sites ultra-rápidos que dominam o Google e convertem",
    description:
      "Otimização completa dos Core Web Vitals (LCP, CLS, INP), carregamento instantâneo de páginas e arquitetura semântica para posicionar seu negócio nas primeiras posições de busca.",
    deliverables: [
      "Otimização para nota 95-100 no Google PageSpeed",
      "Metatags OpenGraph, Schema.org e Sitemap dinâmico",
      "Compressão inteligente de imagens e fontes locais",
      "Aumento comprovado na taxa de conversão",
    ],
    stack: ["Core Web Vitals", "Next.js SSR", "Edge Caching", "Schema.org"],
    metrics: "100/100 SEO",
  },
  {
    id: "mobile-apps",
    title: "Aplicações Móveis Cross-Platform",
    badge: "iOS & Android",
    icon: <FiSmartphone className="w-6 h-6" />,
    tagline: "Experiência de app nativo em uma única base de código",
    description:
      "Criação de aplicativos modernos com React Native, sincronizados em tempo real com seu sistema web, com suporte a notificações push e experiência offline.",
    deliverables: [
      "Interface nativa para iPhone e Android",
      "Notificações push em tempo real",
      "Integração fluida com APIs e autenticação biométrica",
      "Pronto para publicação na App Store e Google Play",
    ],
    stack: ["React Native", "Expo", "TypeScript", "REST APIs"],
    metrics: "60 FPS Nativo",
  },
  {
    id: "analytics-cloud",
    title: "Consultoria & Infraestrutura Cloud",
    badge: "DevOps & Analytics",
    icon: <FiActivity className="w-6 h-6" />,
    tagline: "Monitoramento em tempo real, segurança e tracking",
    description:
      "Configuração de servidores em nuvem, containers Docker, monitoramento de acessos, Google Analytics 4, Tag Manager e esteiras de deploy à prova de falhas.",
    deliverables: [
      "Containers Docker configurados e orquestrados",
      "Setup avançado de GA4 e Google Search Console",
      "SSL, proteção Cloudflare e políticas de segurança",
      "Monitoramento de logs e métricas de servidores",
    ],
    stack: ["Docker", "Google Cloud / VPS", "Cloudflare", "GA4"],
    metrics: "Zero Downtime",
  },
];

const Servicos: React.FC = () => {
  const [selectedInterest, setSelectedInterest] = useState<LeadInterest | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'dev' | 'ai' | 'infra'>('all');
  const isModalOpen = selectedInterest !== null;
  const closeModal = () => setSelectedInterest(null);
  const openModalFor = (service: ServiceCardData) =>
    setSelectedInterest({ type: 'service', id: service.id, label: service.title });

  const filteredServices = servicesList.filter((s) => {
    if (activeFilter === 'dev') return s.id === 'saas-webapps' || s.id === 'backend-apis' || s.id === 'mobile-apps';
    if (activeFilter === 'ai') return s.id === 'ai-automation' || s.id === 'seo-performance';
    if (activeFilter === 'infra') return s.id === 'analytics-cloud' || s.id === 'backend-apis';
    return true;
  });

  return (
    <section id="Servicos" className="py-16 md:py-24 scroll-mt-20 relative overflow-hidden">
      {/* Glow ambient background */}
      <div className="pointer-events-none absolute top-1/3 right-0 w-96 h-96 rounded-full bg-[var(--color-accent-dim)] blur-[120px] -z-10" />

      <div className="container mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[var(--color-accent)]/30 bg-[var(--color-accent-dim)] text-[var(--color-accent)] text-xs font-semibold uppercase tracking-wider mb-4 shadow-sm">
            <FiLayers className="w-3.5 h-3.5" />
            Engenharia de Software Sob Medida
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Soluções completas que geram{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-400 to-indigo-500 font-display italic">
              resultado real
            </span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-300">
            Você não precisa de apenas &quot;mais um site bonito&quot;. Você precisa de um ecossistema digital que automatiza tarefas, converte visitantes em clientes e acompanha cada etapa em tempo real.
          </p>

          {/* Interactive Category Filter */}
          <div className="mt-8 inline-flex p-1.5 rounded-2xl border border-black/8 bg-white/70 backdrop-blur-md shadow-sm dark:border-white/10 dark:bg-white/5 flex-wrap justify-center gap-1">
            {[
              { id: 'all', label: 'Todos os Serviços' },
              { id: 'dev', label: 'Desenvolvimento & Apps' },
              { id: 'ai', label: 'IA & Automações' },
              { id: 'infra', label: 'Backend & Cloud' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
                  activeFilter === tab.id
                    ? 'bg-slate-900 text-white shadow-md dark:bg-white dark:text-slate-900'
                    : 'text-slate-600 hover:text-slate-900 dark:text-white/70 dark:hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Highlight Banner: Briefing com IA ou Acompanhamento no CRM */}
        <div className="max-w-7xl mx-auto mb-12 rounded-3xl border border-black/8 bg-gradient-to-r from-white/90 via-white/70 to-white/90 dark:from-white/[0.07] dark:via-white/[0.04] dark:to-white/[0.07] backdrop-blur-xl p-6 sm:p-8 shadow-xl relative overflow-hidden group">
          {/* Subtle animated gradient line at top */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-[var(--color-accent)] to-cyan-400" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-8">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[var(--color-accent)] mb-2">
                <span className="w-2 h-2 rounded-full bg-[var(--color-accent)] animate-pulse" />
                Metodologia EasyDev • Agilidade & Visibilidade
              </div>
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Como seu projeto ganha vida conosco?
              </h3>
              <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl">
                Diga adeus à falta de comunicação. Você pode fazer seu briefing instantâneo com nosso <strong>Agente de IA</strong> ou acompanhar o avanço das tarefas em tempo real direto no seu <strong>Dashboard Kanban</strong> exclusivo.
              </p>
              
              <div className="mt-4 flex flex-wrap gap-2.5">
                {[
                  '✓ Briefing em minutos com IA',
                  '✓ Kanban transparente em tempo real',
                  '✓ Faturas e histórico detalhado',
                  '✓ Suporte direto com desenvolvedores seniores',
                ].map((item, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-black/[0.03] dark:bg-white/[0.06] text-slate-700 dark:text-white/90 border border-black/5 dark:border-white/10"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3 justify-center">
              <Link
                href="/register"
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm text-white shadow-lg transition-all hover:scale-[1.02] hover:opacity-95 text-center"
                style={{ background: 'linear-gradient(135deg, #004aad, #00b09b)' }}
              >
                <FiZap className="w-4 h-4" />
                Iniciar Projeto / Cadastro
              </Link>
              <Link
                href="/iaagent"
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm border border-black/10 bg-white/80 dark:border-white/15 dark:bg-white/10 text-slate-800 dark:text-white hover:bg-white dark:hover:bg-white/15 transition-all text-center shadow-sm"
              >
                <FiCpu className="w-4 h-4 text-[var(--color-accent)]" />
                Falar com Agente IA
              </Link>
            </div>
          </div>
        </div>

        {/* Services Bento Grid */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service, index) => {
            const isFeatured = service.featured;
            return (
              <motion.div
                key={service.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className={`group relative rounded-3xl border p-6 sm:p-7 backdrop-blur-xl transition-all duration-300 flex flex-col justify-between hover:shadow-2xl hover:-translate-y-1 ${
                  isFeatured
                    ? 'border-[var(--color-accent)]/40 bg-gradient-to-b from-white/95 to-white/80 dark:from-white/[0.08] dark:to-white/[0.04] shadow-md dark:shadow-cyan-950/20'
                    : 'border-black/8 bg-white/80 dark:border-white/10 dark:bg-white/5 hover:border-[var(--color-accent)]/30'
                }`}
              >
                {/* Glow effect on hover */}
                <div
                  className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"
                  style={{
                    background:
                      'radial-gradient(400px circle at top center, rgba(0,212,170,0.15), transparent 70%)',
                  }}
                />

                <div>
                  {/* Card Header: Icon & Badge */}
                  <div className="flex items-center justify-between mb-5">
                    <span
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md transition-transform group-hover:scale-110"
                      style={{ background: 'linear-gradient(135deg, #004aad, #00b09b)' }}
                    >
                      {service.icon}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-[var(--color-accent)] px-2.5 py-1 rounded-full bg-[var(--color-accent-dim)] border border-[var(--color-accent)]/20">
                        {service.metrics}
                      </span>
                    </div>
                  </div>

                  {/* Title & Tagline */}
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-cyan-400">
                    {service.badge}
                  </span>
                  <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1 group-hover:text-[var(--color-accent)] transition-colors">
                    {service.title}
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {service.description}
                  </p>

                  {/* Deliverables Checklist */}
                  <div className="mt-5 pt-4 border-t border-black/5 dark:border-white/10">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 mb-2.5">
                      O que está incluído:
                    </p>
                    <ul className="space-y-2">
                      {service.deliverables.map((item, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2 text-xs text-slate-700 dark:text-white/80"
                        >
                          <FiCheckCircle className="w-3.5 h-3.5 text-[var(--color-accent)] shrink-0 mt-0.5" />
                          <span className="leading-snug">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Card Footer: Stack tags & CTA */}
                <div className="mt-6 pt-4 border-t border-black/5 dark:border-white/10">
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {service.stack.map((st, sIdx) => (
                      <span
                        key={sIdx}
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-white/70"
                      >
                        {st}
                      </span>
                    ))}
                  </div>

                  <button
                    onClick={() => openModalFor(service)}
                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-slate-900 dark:text-white bg-black/[0.04] hover:bg-black/[0.08] dark:bg-white/10 dark:hover:bg-white/15 transition-all group-hover:bg-[var(--color-accent)] group-hover:text-white dark:group-hover:text-slate-950"
                  >
                    Solicitar Proposta para este Serviço
                    <FiArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom Guarantee Banner */}
        <div className="mt-14 max-w-5xl mx-auto rounded-2xl border border-black/8 bg-white/60 dark:border-white/10 dark:bg-white/5 p-6 backdrop-blur-md">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-xl bg-[var(--color-accent-dim)] text-[var(--color-accent)] flex items-center justify-center mb-2 font-bold">
                <FiCode className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Propriedade Total do Código</h4>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Todo o código desenvolvido é 100% seu, sem contratos abusivos de fidelidade.</p>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-xl bg-[var(--color-accent-dim)] text-[var(--color-accent)] flex items-center justify-center mb-2 font-bold">
                <FiClock className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Entrega Ágil & Prazos Claros</h4>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Sprints estruturadas com entregas semanais acompanhadas em tempo real.</p>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-xl bg-[var(--color-accent-dim)] text-[var(--color-accent)] flex items-center justify-center mb-2 font-bold">
                <FiShield className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Suporte Pós-Lançamento</h4>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Garantia contra bugs, monitoramento e planos de evolução contínua.</p>
            </div>
          </div>
        </div>

        <ContactFormModal isOpen={isModalOpen} onClose={closeModal} interest={selectedInterest} />
      </div>
    </section>
  );
};

export default Servicos;
