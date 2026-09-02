'use client';
import React from 'react';
import Link from 'next/link';
import { FiInbox, FiUsers, FiZap, FiArrowRight } from 'react-icons/fi';
import { SiWhatsapp, SiInstagram, SiFacebook, SiGmail } from 'react-icons/si';

const CHANNELS = [
  { Icon: SiWhatsapp, label: 'WhatsApp', color: '#25D366' },
  { Icon: SiInstagram, label: 'Instagram', color: '#E1306C' },
  { Icon: SiFacebook, label: 'Facebook', color: '#1877F2' },
  { Icon: SiGmail, label: 'E-mail', color: '#EA4335' },
];

const HIGHLIGHTS = [
  {
    icon: FiInbox,
    title: 'Uma caixa só',
    description: 'WhatsApp, Instagram, Facebook e e-mail juntos — sem alternar entre apps ou perder conversa.',
  },
  {
    icon: FiUsers,
    title: 'CRM integrado',
    description: 'Histórico do cliente, funil e atendimento no mesmo lugar, sem depender de outra ferramenta.',
  },
  {
    icon: FiZap,
    title: 'Resposta rápida',
    description: 'Equipe inteira vendo a mesma fila, sem cliente esperando porque a mensagem ficou perdida.',
  },
];

const EasyChatPromo: React.FC = () => {
  return (
    <section id="EasyChat" className="py-16 px-4 sm:px-6 lg:px-8 scroll-mt-24">
      <div className="max-w-7xl mx-auto">
        <div className="relative overflow-hidden rounded-[2rem] border border-black/10 dark:border-white/10 bg-white/80 dark:bg-[#050e1c] backdrop-blur-2xl shadow-2xl">
          {/* Glow ambiente */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-32 -right-32 w-[420px] h-[420px] rounded-full blur-[120px] opacity-30"
            style={{ background: 'radial-gradient(circle, #00b09b, transparent 70%)' }}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-24 -left-24 w-[320px] h-[320px] rounded-full blur-[100px] opacity-20"
            style={{ background: 'radial-gradient(circle, #004aad, transparent 70%)' }}
          />

          <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-10 p-8 sm:p-12">
            {/* Coluna de texto */}
            <div className="flex flex-col justify-center">
              <span
                className="inline-flex items-center gap-1.5 self-start rounded-full px-3 py-1 text-xs font-bold uppercase tracking-widest mb-4"
                style={{ background: 'var(--color-accent-dim)', color: 'var(--color-accent)' }}
              >
                Produto EasyDev
              </span>

              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
                easychat — todo seu atendimento, <span className="font-display italic">numa caixa só</span>
              </h2>

              <p className="mt-4 text-base text-slate-600 dark:text-white/70 max-w-lg">
                Chega de responder cliente em cinco apps diferentes. O easychat junta WhatsApp, Instagram,
                Facebook e e-mail com CRM completo, pra sua equipe atender rápido sem perder conversa nem contexto.
              </p>

              {/* Canais suportados */}
              <div className="flex flex-wrap items-center gap-3 mt-6">
                {CHANNELS.map(({ Icon, label, color }) => (
                  <span
                    key={label}
                    className="inline-flex items-center gap-1.5 rounded-full pl-1.5 pr-3 py-1.5 text-xs font-semibold bg-slate-100 dark:bg-white/5 border border-black/5 dark:border-white/10 text-slate-700 dark:text-white/80"
                  >
                    <span
                      className="w-6 h-6 rounded-full flex items-center justify-center"
                      style={{ background: `${color}1a` }}
                    >
                      <Icon className="w-3.5 h-3.5" style={{ color }} aria-hidden="true" />
                    </span>
                    {label}
                  </span>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-8">
                <Link
                  href="https://chat.easydev.com.br"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white shadow-lg transition-transform hover:scale-[1.02]"
                  style={{ background: 'linear-gradient(135deg, var(--color-accent-600), var(--color-accent))' }}
                >
                  Conhecer o easychat
                  <FiArrowRight className="w-4 h-4" aria-hidden="true" />
                </Link>
                <span className="inline-flex items-center justify-center text-xs text-slate-400 dark:text-white/40 sm:px-2">
                  chat.easydev.com.br
                </span>
              </div>
            </div>

            {/* Coluna de destaques */}
            <div className="flex flex-col justify-center gap-4">
              {HIGHLIGHTS.map(({ icon: Icon, title, description }) => (
                <div
                  key={title}
                  className="flex items-start gap-4 rounded-2xl p-4 sm:p-5 bg-white/70 dark:bg-white/5 border border-black/5 dark:border-white/10 backdrop-blur-sm"
                >
                  <span
                    className="shrink-0 w-11 h-11 rounded-xl flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, var(--color-accent-600), var(--color-accent))' }}
                  >
                    <Icon className="w-5 h-5 text-white" aria-hidden="true" />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">{title}</h3>
                    <p className="text-sm text-slate-600 dark:text-white/60 mt-0.5">{description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EasyChatPromo;
