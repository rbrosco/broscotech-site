'use client';
import React, { useState } from 'react';
import { FiCheck, FiStar } from 'react-icons/fi';
import ContactFormModal, { LeadInterest } from './ContactFormModal';

type Plan = {
  name: string;
  tagline: string;
  price: string;
  priceNote: string;
  featured?: boolean;
  features: string[];
};

// Valores de exemplo — troque pelos números reais antes de publicar.
const plansData: Plan[] = [
  {
    name: 'Básico',
    tagline: 'Para quem já tem o site/sistema pronto e quer tranquilidade.',
    price: 'R$ 000',
    priceNote: '/mês',
    features: [
      'Hospedagem e infraestrutura incluídas',
      'Pequenos ajustes e correções (até X/mês)',
      'Monitoramento e backup automático',
      'Acesso ao portal EasyDev CRM (acompanhamento e faturas)',
    ],
  },
  {
    name: 'Pro',
    tagline: 'Para quem quer evoluir o produto continuamente, não só mantê-lo.',
    price: 'R$ 000',
    priceNote: '/mês',
    featured: true,
    features: [
      'Tudo do plano Básico',
      'Horas de desenvolvimento novo incluídas por mês',
      'Prioridade no suporte e no agente de IA',
      'Kanban do projeto com atualizações em tempo real',
    ],
  },
  {
    name: 'Empresarial',
    tagline: 'Para operações maiores, com integrações e SLA dedicado.',
    price: 'Sob consulta',
    priceNote: '',
    features: [
      'Tudo do plano Pro',
      'Integrações e automações sob medida (n8n, APIs)',
      'SLA de suporte dedicado',
      'Onboarding e portal EasyDev CRM personalizados',
    ],
  },
];

const Planos: React.FC = () => {
  const [selectedInterest, setSelectedInterest] = useState<LeadInterest | null>(null);

  return (
    <section id="Planos" className="py-16 px-4 sm:px-6 lg:px-8 scroll-mt-24">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-4">
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--color-accent)' }}>
            Planos
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
            Projeto entregue não é o fim <span className="font-display italic">— é o começo</span>
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-base text-slate-600 dark:text-white/70">
            Escolha um acompanhamento mensal e continue evoluindo, sem depender de orçamento avulso a cada ajuste.
            Todo plano inclui o seu portal <strong className="font-semibold">EasyDev CRM</strong>: acompanhamento de
            projeto, faturas e suporte em um só lugar.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {plansData.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col rounded-3xl border p-6 sm:p-8 transition-all duration-300 ${
                plan.featured
                  ? 'border-transparent shadow-lg lg:scale-[1.03]'
                  : 'border-black/8 bg-white/70 backdrop-blur-sm hover:shadow-md dark:border-white/10 dark:bg-white/5'
              }`}
              style={plan.featured ? { background: 'linear-gradient(160deg, var(--color-accent-600), var(--color-accent))' } : undefined}
            >
              {plan.featured && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-900 shadow">
                  <FiStar className="w-3.5 h-3.5" style={{ color: 'var(--color-accent)' }} aria-hidden="true" />
                  Mais escolhido
                </span>
              )}

              <h3 className={`text-lg font-bold ${plan.featured ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                {plan.name}
              </h3>
              <p className={`mt-1.5 text-sm ${plan.featured ? 'text-white/85' : 'text-slate-600 dark:text-white/70'}`}>
                {plan.tagline}
              </p>

              <div className="mt-6 flex items-baseline gap-1">
                <span className={`text-3xl font-extrabold ${plan.featured ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                  {plan.price}
                </span>
                {plan.priceNote && (
                  <span className={`text-sm ${plan.featured ? 'text-white/75' : 'text-slate-500 dark:text-white/60'}`}>
                    {plan.priceNote}
                  </span>
                )}
              </div>

              <ul className="mt-6 flex-1 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5 text-sm">
                    <FiCheck
                      className={`w-4 h-4 mt-0.5 shrink-0 ${plan.featured ? 'text-white' : ''}`}
                      style={!plan.featured ? { color: 'var(--color-accent)' } : undefined}
                      aria-hidden="true"
                    />
                    <span className={plan.featured ? 'text-white/95' : 'text-slate-700 dark:text-white/80'}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                onClick={() => setSelectedInterest({ type: 'service', id: `plano-${plan.name.toLowerCase()}`, label: `Plano ${plan.name}` })}
                className={`mt-8 w-full rounded-xl py-2.5 text-sm font-semibold transition-colors duration-200 cursor-pointer ${
                  plan.featured
                    ? 'bg-white text-slate-900 hover:bg-white/90'
                    : 'border border-black/10 text-slate-900 hover:bg-slate-50 dark:border-white/15 dark:text-white dark:hover:bg-white/10'
                }`}
              >
                Falar sobre esse plano
              </button>
            </div>
          ))}
        </div>

        <p className="mt-6 text-center text-xs text-slate-400 dark:text-white/40">
          Valores de exemplo — os planos são ajustados conforme o escopo do seu projeto.
        </p>
      </div>

      <ContactFormModal
        isOpen={selectedInterest !== null}
        onClose={() => setSelectedInterest(null)}
        interest={selectedInterest}
      />
    </section>
  );
};

export default Planos;
