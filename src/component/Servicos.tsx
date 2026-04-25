'use client';
import React, { useState } from "react";
import ContactFormModal from "./ContactFormModal";
import {
  FiMessageSquare,
  FiMonitor,
  FiServer,
  FiSliders,
  FiSmartphone,
  FiZap,
} from "react-icons/fi";

const Servicos: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const closeModal = () => setIsModalOpen(false);

  const servicesData = [
    {
      title: "Desenvolvimento Front-End",
      icon: <FiMonitor />,
      description: "Interfaces modernas, rápidas e responsivas com React, Next.js e Tailwind — com tema claro/escuro e foco em performance.",
      items: ["React, Next.js", "Tailwind CSS, Sass, CSS-in-JS", "Integração com APIs e Microserviços"],
    },
    {
      title: "Desenvolvimento Back-End",
      icon: <FiServer />,
      description: "Sistemas robustos com Node.js, Express e bancos de dados como PostgreSQL, MongoDB e SQL — escaláveis e bem arquitetados.",
      items: ["Node.js, Express.js", "APIs RESTful e GraphQL", "PostgreSQL, MongoDB, Redis"],
    },
    {
      title: "Automação e Chatbots",
      icon: <FiMessageSquare />,
      description: "Atendimento automatizado, captura de leads e fluxos que economizam tempo — IA + integrações sem fricção.",
      items: ["Integração de Chatbots com IA", "Automação de Processos com N8N", "Configuração de TypeBot e Chatwoot"],
    },
    {
      title: "Aplicações Móveis",
      icon: <FiSmartphone />,
      description: "Aplicativos rápidos e escaláveis com React Native, publicados na App Store e Google Play.",
      items: ["React Native cross-platform", "Integração com APIs", "Publicação nas lojas"],
    },
    {
      title: "Performance e SEO",
      icon: <FiZap />,
      description: "Otimização de carregamento, Core Web Vitals e SEO técnico para seu site ranquear e converter melhor.",
      items: ["LCP, CLS, INP otimizados", "SEO técnico e semântico", "Integração WhatsApp API"],
    },
    {
      title: "Ferramentas Google",
      icon: <FiSliders />,
      description: "Configuração e integração com o ecossistema Google para melhorar visibilidade e conversão.",
      items: ["Google ADS e Analytics", "Google Workspace com APIs", "Search Console e SEO"],
    },
  ];

  return (
    <section id="Servicos" className="py-12 md:py-16 scroll-mt-[calc(var(--header-height)+1rem)]">
      <div className="container mx-auto px-4 sm:px-6">

        {/* Header */}
        <div className="text-center mb-10">
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--color-accent)' }}>
            O que fazemos
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Serviços que viram <span className="font-display italic">resultado</span>
          </h2>
          <p className="text-base max-w-2xl mx-auto text-slate-600 dark:text-white/70">
            Você não precisa de &quot;mais um site&quot;. Você precisa de um sistema completo: presença,
            automação, integração e visibilidade do progresso.
          </p>
        </div>

        {/* CTA card */}
        <div className="max-w-5xl mx-auto mb-10 rounded-2xl border border-black/8 bg-white/70 backdrop-blur-sm p-5 sm:p-6 dark:border-white/10 dark:bg-white/5">
          <div className="flex flex-col md:flex-row items-center justify-between gap-5">
            <div className="text-left">
              <p className="text-xs uppercase tracking-widest font-semibold" style={{ color: 'var(--color-accent)' }}>
                Dois caminhos, um objetivo
              </p>
              <h3 className="mt-1 text-lg sm:text-xl font-semibold text-slate-900 dark:text-white">
                Comece agora: cadastro ou IA Agent
              </h3>
              <p className="mt-1 text-sm text-slate-600 dark:text-white/70">
                Cadastre-se para acompanhar seu projeto, ou converse com nossa IA para acelerar o briefing.
              </p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                {['Multi-dispositivo', 'Tema claro/escuro', 'Dashboard de progresso'].map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-black/8 bg-white/60 px-3 py-1 text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-white/70"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
              <a
                href="/register"
                className="inline-flex items-center justify-center rounded-xl bg-slate-900 text-white px-6 py-2.5 text-sm font-semibold hover:bg-slate-800 transition dark:bg-white/90 dark:text-slate-900 dark:hover:bg-white"
              >
                Quero me cadastrar
              </a>
              <a
                href="/iaagent"
                className="inline-flex items-center justify-center rounded-xl border border-black/10 bg-white/60 px-6 py-2.5 text-sm font-semibold text-slate-800 hover:bg-white transition dark:border-white/15 dark:bg-white/8 dark:text-white dark:hover:bg-white/12"
              >
                Usar IA Agent
              </a>
            </div>
          </div>
        </div>

        {/* Service cards */}
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-5">
          {servicesData.map((service, index) => (
            <div
              key={index}
              className="group flex flex-col p-5 sm:p-6 rounded-2xl border border-black/8 bg-white/70 backdrop-blur-sm hover:border-[var(--color-accent)]/30 hover:shadow-md transition-all duration-300 dark:border-white/10 dark:bg-white/5 dark:hover:border-[var(--color-accent)]/30"
            >
              <div className="flex items-start gap-4">
                <span
                  className="inline-flex items-center justify-center w-11 h-11 rounded-xl text-[var(--color-accent)] shrink-0 transition-colors duration-200"
                  style={{ background: 'var(--color-accent-dim)' }}
                >
                  {React.cloneElement(service.icon, { className: 'w-5 h-5' })}
                </span>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold text-slate-900 dark:text-white">{service.title}</h3>
                  <p className="mt-1.5 text-sm text-slate-600 dark:text-white/70 leading-relaxed">
                    {service.description}
                  </p>
                  <ul className="mt-3 space-y-1">
                    {service.items.map((item, i) => (
                      <li key={i} className="flex items-center gap-2 text-[13px] text-slate-600 dark:text-white/65">
                        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: 'var(--color-accent)' }} />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>

        <ContactFormModal isOpen={isModalOpen} onClose={closeModal} />
      </div>
    </section>
  );
};

export default Servicos;
