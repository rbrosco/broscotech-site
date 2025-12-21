'use client';
import React, { useState, useEffect } from 'react';
import ContactFormModal from '../component/ContactFormModal';
import Header from "../component/Header";
import ProfileCard from "../component/ProfileCard";
import HeroProfileCard from "../component/HeroProfileCard";
import IAHomeBanner from "../component/IAHomeBanner";
import Chatbot from "../component/ChatBot";
import Servicos from "../component/Servicos";
import Sobre from "../component/Sobre";
import LoadingSpinner from '../component/LoadingSpinner';
import PrivacyModal from '../component/PrivacyModal';
import IconBanner from '../component/IconBanner';
import type { IconType } from 'react-icons';
import { FaDocker, FaGithub, FaNodeJs, FaReact } from 'react-icons/fa';
import { SiMongodb, SiN8N, SiNextdotjs, SiPostgresql, SiTailwindcss, SiTypescript } from 'react-icons/si';
import { FcGoogle } from 'react-icons/fc';
import { FiArrowRight, FiCode, FiMessageSquare, FiMonitor, FiServer, FiShield, FiSmartphone, FiZap } from 'react-icons/fi';

const matrixItems: ReadonlyArray<{
  title: string;
  subtitle: string;
  Icon: IconType;
}> = [
  { title: 'Web Apps', subtitle: 'Next.js + React', Icon: FiMonitor },
  { title: 'Back-end', subtitle: 'APIs e integrações', Icon: FiServer },
  { title: 'Mobile', subtitle: 'Experiência rápida', Icon: FiSmartphone },
  { title: 'Automação', subtitle: 'N8N / fluxos', Icon: FiZap },
  { title: 'Chatbots', subtitle: 'Atendimento 24/7', Icon: FiMessageSquare },
  { title: 'Segurança', subtitle: 'Boas práticas', Icon: FiShield },
  { title: 'Código limpo', subtitle: 'Arquitetura', Icon: FiCode },
  { title: 'Performance', subtitle: 'SEO + LCP', Icon: FiZap },
] as const;

const iconBannerData: ReadonlyArray<{ label: string; Icon: IconType }> = [
  { label: 'React', Icon: FaReact },
  { label: 'Next.js', Icon: SiNextdotjs },
  { label: 'Node.js', Icon: FaNodeJs },
  { label: 'Tailwind', Icon: SiTailwindcss },
  { label: 'TypeScript', Icon: SiTypescript },
  { label: 'Docker', Icon: FaDocker },
  { label: 'PostgreSQL', Icon: SiPostgresql },
  { label: 'MongoDB', Icon: SiMongodb },
  { label: 'n8n', Icon: SiN8N },
  { label: 'Google', Icon: FcGoogle },
  { label: 'GitHub', Icon: FaGithub },
] as const;

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  // Efeito para o spinner de carregamento inicial e verificação do modal de privacidade
  useEffect(() => {
    // Simula um tempo de carregamento. Em produção, isso seria
    // atrelado ao carregamento de dados reais ou recursos críticos.
    // Exemplo: se você estivesse buscando dados, faria setIsLoading(false) no .finally() da promise.
    const timer = setTimeout(() => {
      setIsLoading(false);
      // Verifica o estado do consentimento da política de privacidade apenas no cliente
      if (typeof window !== "undefined") { // Garante que localStorage só é acessado no cliente
        const privacyAccepted = localStorage.getItem('privacyPolicyAccepted');
        if (!privacyAccepted) {
          setIsPrivacyModalOpen(true);
        }
      }
    }, 1000); // Reduzido para 1 segundo como exemplo, ajuste conforme necessário

    return () => clearTimeout(timer); // Limpa o timer ao desmontar o componente
  }, []);

  const handleAcceptPrivacy = () => {
    localStorage.setItem('privacyPolicyAccepted', 'true');
    setIsPrivacyModalOpen(false);
  };
  const handleClosePrivacyModal = () => {
    setIsPrivacyModalOpen(false);
    // Você pode adicionar lógica aqui se o usuário recusar, 
    // como redirecionar ou limitar o acesso.
  };

  return (
    <>
      {isLoading && <LoadingSpinner />}
      <div className={`transition-opacity duration-500 ${isLoading ? 'opacity-0' : 'opacity-100'}`}> 
        <Header />

        {/* HERO (Matriz) */}
        <section
          id="Home"
          className="pt-[var(--header-height)] scroll-mt-[calc(var(--header-height)+1rem)]"
          aria-labelledby="home-title"
        >
          <div className="container mx-auto px-4 sm:px-6 py-12 md:py-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
              <div className="text-slate-900 dark:text-white">
                <p className="inline-flex items-center gap-2 rounded-full bg-black/5 border border-black/10 px-4 py-2 text-xs sm:text-sm backdrop-blur-md dark:bg-white/10 dark:border-white/15">
                  <span className="font-semibold">BROSCOTECH</span>
                  <span className="text-slate-500 dark:text-white/80">•</span>
                  <span className="text-slate-600 dark:text-white/80">Soluções digitais que realmente entregam</span>
                </p>

                {/* Hero profile card (diferenciado) */}
                <div className="mt-6">
                  <HeroProfileCard />
                </div>

                {/* IA banner: mensagem diferenciada com botão para conversar com a IA */}
                <div className="mt-4">
                  <IAHomeBanner />
                </div>
                <h1 id="home-title" className="mt-5 text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight">
                  Transforme seu negócio em uma
                  <span className="block">máquina de crescimento.</span>
                </h1>

                <p className="mt-4 max-w-xl text-sm sm:text-base text-slate-700 dark:text-white/90">
                  Sites, sistemas, automações e integrações com foco em performance, clareza e resultado.
                  Tudo organizado como uma matriz: cada peça conversa com a outra.
                </p>

                <div className="mt-8 flex flex-col sm:flex-row gap-3">
                  <a
                    href="#Servicos"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 text-white px-6 py-3 font-semibold hover:bg-slate-800 transition dark:bg-white/90 dark:text-slate-900 dark:hover:bg-white"
                  >
                    Ver serviços <FiArrowRight className="h-5 w-5" aria-hidden="true" />
                  </a>
                  <button
                    type="button"
                    onClick={() => setIsContactModalOpen(true)}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-black/5 border border-black/10 px-6 py-3 font-semibold text-slate-900 hover:bg-black/10 transition dark:bg-white/10 dark:border-white/20 dark:text-white dark:hover:bg-white/15"
                  >
                    Solicitar orçamento
                  </button>
                </div>

                <div className="mt-8 flex flex-wrap gap-2 text-xs sm:text-sm">
                  {[
                    'Entrega rápida',
                    'Design consistente',
                    'Integrações',
                    'Automação',
                    'Dashboard',
                    'SEO',
                  ].map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-black/5 border border-black/10 px-3 py-1.5 text-slate-700 backdrop-blur-md dark:bg-black/10 dark:border-white/15 dark:text-white/90"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="relative">
                <div className="absolute -inset-3 rounded-3xl bg-black/5 blur-xl dark:bg-white/5" aria-hidden="true" />
                <div className="relative rounded-3xl border border-black/10 bg-black/5 backdrop-blur-md p-4 sm:p-6 dark:border-white/15 dark:bg-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-slate-900 dark:text-white font-semibold">Matriz de capacidades</h2>
                    <span className="text-xs text-slate-600 dark:text-white/70">Tudo conectado</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {matrixItems.map(({ title, subtitle, Icon }) => (
                      <div
                        key={title}
                        className="rounded-2xl bg-black/5 border border-black/10 p-4 hover:bg-black/10 transition dark:bg-white/10 dark:border-white/15 dark:hover:bg-white/15"
                      >
                        <Icon className="h-6 w-6 text-slate-800 dark:text-white/90" aria-hidden="true" />
                        <p className="mt-3 text-sm font-semibold text-slate-900 dark:text-white">{title}</p>
                        <p className="mt-1 text-[11px] text-slate-600 dark:text-white/75 leading-snug">{subtitle}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 rounded-2xl bg-black/5 border border-black/10 p-4 dark:bg-black/10 dark:border-white/10">
                    <p className="text-xs sm:text-sm text-slate-700 dark:text-white/85">
                      Quer algo realmente diferente? A gente desenha o fluxo inteiro: do primeiro clique até a automação que fecha o ciclo.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SERVIÇOS (logo após o hero) */}
        <Servicos />

        {/* STACK / PROVA SOCIAL */}
        <IconBanner icons={iconBannerData} speed="55s" />

        {/* SOBRE + PERFIL (mais abaixo, como reforço) */}
        <Sobre />
        <ProfileCard />

        {/* DEMO (fecha com impacto) */}
        <section aria-labelledby="home-demo" className="py-10 md:py-14 scroll-mt-[calc(var(--header-height)+1rem)]">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="rounded-3xl bg-white/85 dark:bg-gray-900/60 backdrop-blur-md border border-white/20 dark:border-gray-700/50 p-4 sm:p-8 shadow-2xl">
              <div className="max-w-3xl mx-auto text-center">
                <h2 id="home-demo" className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-slate-100">
                  Veja em ação
                </h2>
                <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-300">
                  Um exemplo rápido do tipo de experiência e visual que entregamos.
                </p>
              </div>
              <div className="mt-6">
                <video
                  className="w-full max-w-5xl mx-auto rounded-2xl shadow-2xl border border-white/20 dark:border-gray-700/50"
                  src="/video/dynamic-tech.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                  controls
                />
              </div>
            </div>
          </div>
        </section>

        <Chatbot />
      </div>
      <ContactFormModal isOpen={isContactModalOpen} onClose={() => setIsContactModalOpen(false)} />
      <PrivacyModal 
        isOpen={isPrivacyModalOpen} 
        onClose={handleClosePrivacyModal} 
        onAccept={handleAcceptPrivacy} 
      />
    </>
  );
}
