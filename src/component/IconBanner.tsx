'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import type { IconType } from 'react-icons';
import {
  FiExternalLink,
  FiCode,
  FiZap,
  FiCpu,
  FiLayers,
  FiServer,
  FiCheckCircle,
  FiArrowRight,
  FiMonitor,
  FiTrendingUp,
  FiShield,
  FiMaximize2,
  FiX,
} from 'react-icons/fi';
import {
  FaReact,
  FaNodeJs,
  FaDocker,
  FaGithub,
} from 'react-icons/fa';
import {
  SiNextdotjs,
  SiTailwindcss,
  SiTypescript,
  SiPostgresql,
  SiMongodb,
  SiN8N,
} from 'react-icons/si';
import { FcGoogle } from 'react-icons/fc';

interface IconBannerProps {
  icons?: {
    label: string;
    Icon: IconType;
  }[] | ReadonlyArray<{ label: string; Icon: IconType }>;
  speed?: string;
}

interface ProjectItem {
  id: string;
  title: string;
  subtitle: string;
  category: 'saas' | 'automacao' | 'web';
  categoryLabel: string;
  image: string;
  description: string;
  metrics: { label: string; value: string }[];
  stack: { name: string; icon: IconType }[];
  highlights: string[];
  liveDemoUrl?: string;
}

const portfolioProjects: ProjectItem[] = [
  {
    id: 'easydev-crm',
    title: 'EasyDev CRM & Hub de Projetos',
    subtitle: 'SaaS / Gestão de Clientes e Kanban',
    category: 'saas',
    categoryLabel: 'SaaS & CRM',
    image: '/images/Comp.jpeg',
    description:
      'Sistema completo de gestão de projetos com quadro Kanban em tempo real, emissão de faturas, notificações interativas e portal exclusivo do cliente.',
    metrics: [
      { label: 'Tempo de Carregamento', value: '< 0.4s' },
      { label: 'Disponibilidade', value: '99.9%' },
      { label: 'Produtividade da Equipe', value: '+350%' },
    ],
    stack: [
      { name: 'Next.js 15', icon: SiNextdotjs },
      { name: 'TypeScript', icon: SiTypescript },
      { name: 'PostgreSQL', icon: SiPostgresql },
      { name: 'Tailwind CSS', icon: SiTailwindcss },
      { name: 'Docker', icon: FaDocker },
    ],
    highlights: [
      'Quadro Kanban com drag-and-drop e sincronização instantânea',
      'Controle de faturas, pagamentos e histórico financeiro',
      'Área segura do cliente com autenticação JWT e criptografia bcrypt',
      'Design responsivo com suporte a Dark Mode nativo',
    ],
  },
  {
    id: 'trading-app',
    title: 'Fintech Trading & Analytics Platform',
    subtitle: 'Aplicações Web em Tempo Real',
    category: 'web',
    categoryLabel: 'Web App & Fintech',
    image: '/images/TradingApp.webp',
    description:
      'Plataforma analítica e dashboard financeiro para acompanhamento de ativos, com gráficos dinâmicos de alta precisão e streaming de cotações em tempo real.',
    metrics: [
      { label: 'Latência de Dados', value: '< 50ms' },
      { label: 'Lighthouse Score', value: '98/100' },
      { label: 'Acessos Simultâneos', value: '10k+' },
    ],
    stack: [
      { name: 'React', icon: FaReact },
      { name: 'Node.js', icon: FaNodeJs },
      { name: 'TypeScript', icon: SiTypescript },
      { name: 'PostgreSQL', icon: SiPostgresql },
      { name: 'Tailwind', icon: SiTailwindcss },
    ],
    highlights: [
      'Pipelines de streaming de dados com WebSocket',
      'Visualização de gráficos interativos com performance de 60fps',
      'Arquitetura modular em microsserviços',
      'Interface adaptativa para mobile e desktop',
    ],
  },
  {
    id: 'n8n-ia-automation',
    title: 'Hub de Automações & Agente IA 24/7',
    subtitle: 'Automação Inteligente de Processos',
    category: 'automacao',
    categoryLabel: 'IA & Automação',
    image: '/images/PhotoWebsite.webp',
    description:
      'Fluxos inteligentes integrando n8n, modelos de linguagem (Groq/OpenAI) e mensageria instantânea para atendimento automatizado, qualificação de leads e sincronização de CRM.',
    metrics: [
      { label: 'Tempo de Resposta', value: '< 2s' },
      { label: 'Economia Operacional', value: '80%' },
      { label: 'Atendimento Automatizado', value: '24/7' },
    ],
    stack: [
      { name: 'n8n Workflows', icon: SiN8N },
      { name: 'Groq / LLMs', icon: FiCpu },
      { name: 'Node.js', icon: FaNodeJs },
      { name: 'PostgreSQL', icon: SiPostgresql },
      { name: 'Google APIs', icon: FcGoogle },
    ],
    highlights: [
      'Captura e triagem de leads com IA conversacional',
      'Disparo de webhooks e integração direta com bancos de dados',
      'Eliminação de tarefas manuais repetitivas',
      'Relatórios e métricas de conversão em tempo real',
    ],
  },
  {
    id: 'high-converting-portal',
    title: 'Portais & Landing Pages de Alta Conversão',
    subtitle: 'Engenharia de Performance e SEO',
    category: 'web',
    categoryLabel: 'Design & SEO',
    image: '/images/PortfolioWebsite.webp',
    description:
      'Desenvolvimento de websites ultra-otimizados focados em conversão, com visual impactante, tempo de carregamento instantâneo e pontuação máxima nos Core Web Vitals.',
    metrics: [
      { label: 'Google Lighthouse', value: '100/100' },
      { label: 'Taxa de Conversão', value: '+280%' },
      { label: 'FCP (First Contentful Paint)', value: '0.3s' },
    ],
    stack: [
      { name: 'Next.js', icon: SiNextdotjs },
      { name: 'React', icon: FaReact },
      { name: 'Tailwind CSS', icon: SiTailwindcss },
      { name: 'TypeScript', icon: SiTypescript },
    ],
    highlights: [
      'Estrutura semântica rigorosa para indexação no Google',
      'Animações leves e micro-interações envolventes',
      'Otimização avançada de imagens e fontes locais',
      'Compatibilidade total com temas claro e escuro',
    ],
  },
];

const techCatalog = [
  {
    name: 'Next.js 15 & React 19',
    category: 'Frontend & Full Stack',
    icon: SiNextdotjs,
    level: 'Core da Aplicação',
    description: 'Server Components, Turbopack e renderização híbrida para performance extrema.',
    metrics: 'SSR + SSG Instantâneo',
    color: 'from-blue-600 to-cyan-500',
  },
  {
    name: 'TypeScript',
    category: 'Linguagem & Segurança',
    icon: SiTypescript,
    level: 'Tipagem Estrita',
    description: 'Zero runtime errors por tipos, código auto-documentado e refatoração segura.',
    metrics: '100% Type-Safe',
    color: 'from-blue-500 to-indigo-600',
  },
  {
    name: 'Node.js & APIs REST',
    category: 'Backend & Integrações',
    icon: FaNodeJs,
    level: 'Alta Escalabilidade',
    description: 'Serviços rápidos e arquitetura assíncrona pronta para alto volume de requisições.',
    metrics: '< 80ms Latência',
    color: 'from-emerald-500 to-teal-600',
  },
  {
    name: 'PostgreSQL & TypeORM',
    category: 'Banco de Dados Relacional',
    icon: SiPostgresql,
    level: 'Persistência & ACID',
    description: 'Modelagem relacional sólida, queries otimizadas e migrations versionadas.',
    metrics: 'Integridade Total',
    color: 'from-sky-600 to-blue-700',
  },
  {
    name: 'n8n & Webhooks',
    category: 'Automação de Fluxos',
    icon: SiN8N,
    level: 'Integração Contínua',
    description: 'Conexão entre APIs, CRMs, WhatsApp e sistemas sem intervenção manual.',
    metrics: 'Fluxos 24/7',
    color: 'from-rose-500 to-orange-500',
  },
  {
    name: 'IA & Agentes LLM',
    category: 'Inteligência Artificial',
    icon: FiCpu,
    level: 'Automação Cognitiva',
    description: 'Modelos rápidos com Groq e OpenAI integrados ao escopo do seu negócio.',
    metrics: 'Briefing Inteligente',
    color: 'from-purple-500 to-pink-500',
  },
  {
    name: 'Tailwind CSS 4',
    category: 'Design System',
    icon: SiTailwindcss,
    level: 'UI Responsiva & Dark Mode',
    description: 'Interfaces consistentes, variáveis CSS modernas e componentes modulares.',
    metrics: 'Zero CSS Bloat',
    color: 'from-cyan-400 to-teal-500',
  },
  {
    name: 'Docker & DevOps',
    category: 'Infraestrutura & Deploy',
    icon: FaDocker,
    level: 'Containers & CI/CD',
    description: 'Ambientes isolados, deploys previsíveis e escalabilidade em nuvem.',
    metrics: 'Deploys Automatizados',
    color: 'from-blue-500 to-cyan-600',
  },
];

const IconBanner: React.FC<IconBannerProps> = () => {
  const [activeTab, setActiveTab] = useState<'portfolio' | 'stack' | 'architecture'>('portfolio');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'saas' | 'automacao' | 'web'>('all');
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);

  const filteredProjects =
    selectedCategory === 'all'
      ? portfolioProjects
      : portfolioProjects.filter((p) => p.category === selectedCategory);

  return (
    <section id="Portfolio" className="w-full py-16 md:py-24 scroll-mt-20 relative overflow-hidden">
      {/* Background ambient decorative light */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b from-[#00b09b]/15 via-[#004aad]/10 to-transparent blur-[120px] -z-10" />

      <div className="container mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 md:mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[var(--color-accent)]/30 bg-[var(--color-accent-dim)] text-[var(--color-accent)] text-xs font-semibold uppercase tracking-wider mb-4 shadow-sm">
            <FiZap className="w-3.5 h-3.5" />
            Showcase de Engenharia & Portfólio
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Projetos reais, tecnologia de ponta e{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-400 to-indigo-500 font-display italic">
              resultado
            </span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-300">
            Do design à arquitetura de banco de dados: explore nosso portfólio prático, conheça o ecossistema tecnológico e veja como transformamos código em valor para o seu negócio.
          </p>

          {/* Navigation Tabs */}
          <div className="mt-8 inline-flex p-1.5 rounded-2xl border border-black/8 bg-white/70 backdrop-blur-md shadow-sm dark:border-white/10 dark:bg-white/5">
            <button
              onClick={() => setActiveTab('portfolio')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                activeTab === 'portfolio'
                  ? 'bg-slate-900 text-white shadow-md dark:bg-white dark:text-slate-900'
                  : 'text-slate-600 hover:text-slate-900 dark:text-white/70 dark:hover:text-white'
              }`}
            >
              <FiMonitor className="w-4 h-4" />
              Projetos & Portfólio
            </button>
            <button
              onClick={() => setActiveTab('stack')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                activeTab === 'stack'
                  ? 'bg-slate-900 text-white shadow-md dark:bg-white dark:text-slate-900'
                  : 'text-slate-600 hover:text-slate-900 dark:text-white/70 dark:hover:text-white'
              }`}
            >
              <FiCpu className="w-4 h-4" />
              Stack & Ecossistema
            </button>
            <button
              onClick={() => setActiveTab('architecture')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                activeTab === 'architecture'
                  ? 'bg-slate-900 text-white shadow-md dark:bg-white dark:text-slate-900'
                  : 'text-slate-600 hover:text-slate-900 dark:text-white/70 dark:hover:text-white'
              }`}
            >
              <FiLayers className="w-4 h-4" />
              Arquitetura
            </button>
          </div>
        </div>

        {/* TAB 1: PORTFOLIO SHOWCASE */}
        {activeTab === 'portfolio' && (
          <div>
            {/* Category Filter Pills */}
            <div className="flex items-center justify-center gap-2 mb-10 flex-wrap">
              {[
                { id: 'all', label: 'Todos os Projetos' },
                { id: 'saas', label: 'SaaS & CRM' },
                { id: 'web', label: 'Web Apps & Portais' },
                { id: 'automacao', label: 'IA & Automação' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id as any)}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 border ${
                    selectedCategory === cat.id
                      ? 'border-[var(--color-accent)] bg-[var(--color-accent-dim)] text-[var(--color-accent)] font-semibold shadow-sm'
                      : 'border-black/5 bg-white/60 text-slate-600 hover:bg-white hover:border-black/10 dark:border-white/10 dark:bg-white/5 dark:text-white/70 dark:hover:bg-white/10'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Projects Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-7xl mx-auto">
              {filteredProjects.map((project) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.3 }}
                  key={project.id}
                  className="group relative rounded-3xl border border-black/8 bg-white/80 dark:border-white/10 dark:bg-white/5 backdrop-blur-xl overflow-hidden shadow-lg hover:shadow-2xl hover:border-[var(--color-accent)]/40 transition-all duration-300 flex flex-col justify-between"
                >
                  {/* Image Preview & Browser Header Mockup */}
                  <div className="relative overflow-hidden bg-slate-900/10 dark:bg-black/30 border-b border-black/5 dark:border-white/10">
                    {/* Browser Toolbar simulation */}
                    <div className="px-4 py-3 flex items-center justify-between border-b border-black/5 dark:border-white/10 bg-slate-100/80 dark:bg-black/40 backdrop-blur-md">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/80" />
                      </div>
                      <span className="text-[11px] font-mono text-slate-500 dark:text-white/50 tracking-wider">
                        easydev.com.br/{project.id}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-[var(--color-accent-dim)] text-[var(--color-accent)] text-[10px] font-bold uppercase tracking-wider">
                        {project.categoryLabel}
                      </span>
                    </div>

                    {/* Project Image Preview */}
                    <div className="relative h-56 sm:h-64 w-full overflow-hidden bg-slate-950/20">
                      <Image
                        src={project.image}
                        alt={project.title}
                        fill
                        className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
                        unoptimized
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

                      {/* Quick Inspect Button Overlay */}
                      <button
                        onClick={() => setSelectedProject(project)}
                        className="absolute bottom-3 right-3 px-3 py-1.5 rounded-xl bg-white/90 dark:bg-slate-900/90 text-slate-900 dark:text-white text-xs font-semibold shadow-lg backdrop-blur-md flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0"
                      >
                        <FiMaximize2 className="w-3.5 h-3.5" />
                        Ver Detalhes
                      </button>
                    </div>
                  </div>

                  {/* Project Info */}
                  <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white group-hover:text-[var(--color-accent)] transition-colors">
                        {project.title}
                      </h3>
                      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                        {project.description}
                      </p>

                      {/* Metrics Showcase Row */}
                      <div className="mt-5 grid grid-cols-3 gap-2 py-3 px-3.5 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/5 dark:border-white/10">
                        {project.metrics.map((m, idx) => (
                          <div key={idx} className="text-center">
                            <span className="block text-sm sm:text-base font-extrabold text-[var(--color-accent)]">
                              {m.value}
                            </span>
                            <span className="block text-[10px] sm:text-[11px] text-slate-500 dark:text-white/60 leading-tight mt-0.5">
                              {m.label}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Tech Stack Chips */}
                      <div className="mt-4 flex flex-wrap gap-2">
                        {project.stack.map((t, idx) => {
                          const IconComp = t.icon;
                          return (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-white/8 text-slate-700 dark:text-white/80 border border-black/5 dark:border-white/10"
                            >
                              <IconComp className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                              {t.name}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div className="mt-6 pt-4 border-t border-black/8 dark:border-white/10 flex items-center justify-between">
                      <button
                        onClick={() => setSelectedProject(project)}
                        className="text-xs sm:text-sm font-semibold text-[var(--color-accent)] hover:underline inline-flex items-center gap-1"
                      >
                        Conhecer a arquitetura
                        <FiArrowRight className="w-3.5 h-3.5" />
                      </button>

                      <a
                        href="/register"
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white shadow transition-all hover:opacity-90 hover:shadow-md"
                        style={{ background: 'linear-gradient(135deg, #004aad, #00b09b)' }}
                      >
                        Quero um projeto assim
                      </a>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: STACK & ECOSYSTEM */}
        {activeTab === 'stack' && (
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {techCatalog.map((tech, idx) => {
                const IconComponent = tech.icon;
                return (
                  <div
                    key={idx}
                    className="relative group p-6 rounded-3xl border border-black/8 bg-white/80 dark:border-white/10 dark:bg-white/5 backdrop-blur-xl hover:border-[var(--color-accent)]/50 hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span
                          className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform"
                          style={{ background: 'linear-gradient(135deg, #004aad, #00b09b)' }}
                        >
                          <IconComponent className="w-6 h-6" />
                        </span>
                        <span className="text-[11px] font-bold uppercase px-2.5 py-1 rounded-full bg-[var(--color-accent-dim)] text-[var(--color-accent)]">
                          {tech.level}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                        {tech.name}
                      </h3>
                      <p className="text-xs font-semibold text-slate-500 dark:text-cyan-400 mt-0.5">
                        {tech.category}
                      </p>
                      <p className="mt-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                        {tech.description}
                      </p>
                    </div>

                    <div className="mt-5 pt-3 border-t border-black/5 dark:border-white/10 flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-500 dark:text-white/60">
                        Vantagem:
                      </span>
                      <span className="text-xs font-bold text-[var(--color-accent)]">
                        {tech.metrics}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Why our stack matters card */}
            <div className="mt-10 rounded-3xl p-6 sm:p-8 border border-black/8 bg-gradient-to-r from-cyan-500/10 via-teal-500/5 to-indigo-500/10 dark:border-white/10 backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="max-w-2xl">
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                  Por que essa stack faz sua empresa crescer?
                </h3>
                <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                  Não usamos tecnologias por moda. Cada ferramenta (Next.js, Node, Postgres, n8n, IA) foi escolhida para garantir velocidade de desenvolvimento, facilidade de manutenção e zero travamentos quando sua operação escalar.
                </p>
              </div>
              <a
                href="/iaagent"
                className="shrink-0 px-6 py-3 rounded-xl text-sm font-bold text-white shadow-lg transition-all hover:scale-105"
                style={{ background: 'linear-gradient(135deg, #004aad, #00b09b)' }}
              >
                Conversar com nosso Agente IA
              </a>
            </div>
          </div>
        )}

        {/* TAB 3: ARCHITECTURE */}
        {activeTab === 'architecture' && (
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  step: '01',
                  title: 'Frontend de Alta Performance',
                  desc: 'Next.js 15 App Router com SSR e componentes otimizados para máxima pontuação nos Core Web Vitals e retenção do usuário.',
                  icon: FiMonitor,
                  features: ['React 19 & Hooks', 'Tailwind CSS 4 Tokens', 'Animações a 60fps', 'SEO Semântico'],
                },
                {
                  step: '02',
                  title: 'Backend Escalável & APIs',
                  desc: 'Endpoints REST e WebSockets protegidos por JWT, com rotas tipadas em TypeScript e persistência relacional no PostgreSQL.',
                  icon: FiServer,
                  features: ['TypeORM & Migrations', 'Autenticação Segura', 'Cache Estruturado', 'Validação de Dados'],
                },
                {
                  step: '03',
                  title: 'Automação & Inteligência',
                  desc: 'Integrações ativas com n8n e IA para capturar briefings, orquestrar webhooks e alimentar seu CRM em tempo real.',
                  icon: FiZap,
                  features: ['Modelos Groq & OpenAI', 'Fluxos N8N Automatizados', 'Webhooks Bidirecionais', 'Disparos Instantâneos'],
                },
              ].map((arch, idx) => {
                const IconArch = arch.icon;
                return (
                  <div
                    key={idx}
                    className="relative p-6 sm:p-8 rounded-3xl border border-black/8 bg-white/80 dark:border-white/10 dark:bg-white/5 backdrop-blur-xl shadow-md flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-5">
                        <span className="w-12 h-12 rounded-2xl bg-[var(--color-accent-dim)] text-[var(--color-accent)] flex items-center justify-center font-bold">
                          <IconArch className="w-6 h-6" />
                        </span>
                        <span className="font-mono text-xl font-black text-slate-300 dark:text-white/20">
                          {arch.step}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                        {arch.title}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                        {arch.desc}
                      </p>

                      <ul className="space-y-2">
                        {arch.features.map((feat, fIdx) => (
                          <li
                            key={fIdx}
                            className="flex items-center gap-2 text-xs sm:text-sm text-slate-700 dark:text-white/80"
                          >
                            <FiCheckCircle className="w-4 h-4 text-[var(--color-accent)] shrink-0" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* MODAL DE DETALHES DO PROJETO */}
      <AnimatePresence>
        {selectedProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProject(null)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-3xl rounded-3xl bg-white dark:bg-[#071324] border border-black/10 dark:border-white/15 p-6 sm:p-8 shadow-2xl z-10 max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => setSelectedProject(null)}
                className="absolute top-4 right-4 p-2 rounded-full text-slate-500 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-white/10"
              >
                <FiX className="w-5 h-5" />
              </button>

              <span className="px-3 py-1 rounded-full bg-[var(--color-accent-dim)] text-[var(--color-accent)] text-xs font-bold uppercase tracking-wider">
                {selectedProject.categoryLabel}
              </span>

              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-3">
                {selectedProject.title}
              </h2>
              <p className="text-sm font-medium text-slate-500 dark:text-cyan-400">
                {selectedProject.subtitle}
              </p>

              <div className="relative h-64 sm:h-72 w-full rounded-2xl overflow-hidden mt-5 border border-black/10 dark:border-white/10 shadow-inner">
                <Image
                  src={selectedProject.image}
                  alt={selectedProject.title}
                  fill
                  className="object-cover object-top"
                  unoptimized
                />
              </div>

              <div className="mt-6">
                <h4 className="text-base font-bold text-slate-900 dark:text-white">Sobre o Projeto</h4>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {selectedProject.description}
                </p>
              </div>

              {/* Highlights */}
              <div className="mt-6">
                <h4 className="text-base font-bold text-slate-900 dark:text-white">Destaques Técnicos</h4>
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {selectedProject.highlights.map((h, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2 text-xs sm:text-sm text-slate-700 dark:text-white/80 p-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-black/5 dark:border-white/5"
                    >
                      <FiCheckCircle className="w-4 h-4 text-[var(--color-accent)] shrink-0 mt-0.5" />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action */}
              <div className="mt-8 pt-5 border-t border-black/10 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-slate-500 dark:text-white/60">
                  Quer uma solução personalizada sob medida para a sua empresa?
                </div>
                <div className="flex gap-3 w-full sm:w-auto">
                  <a
                    href="/register"
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-sm font-bold text-white text-center shadow-lg transition-all hover:opacity-95"
                    style={{ background: 'linear-gradient(135deg, #004aad, #00b09b)' }}
                  >
                    Iniciar Projeto Agora
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default IconBanner;
