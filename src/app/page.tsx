"use client";
import React, { useEffect, useState } from 'react';
import Image from 'next/image';

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n: string) => (n[0] ?? ''))
    .join('')
    .toUpperCase();
}

// Componente de Depoimentos reutilizável
const depoimentos = [
  {
    texto: 'O serviço foi excelente, superou todas as expectativas! Recomendo muito.',
    autor: 'João Silva',
    cargo: 'CEO da StartupX' },
  {
    texto: 'Atendimento rápido, solução eficiente e design impecável. Voltarei a contratar!',
    autor: 'Maria Oliveira',
    cargo: 'Gerente de Projetos' },
  {
    texto: 'A automação implementada facilitou muito nosso dia a dia. Equipe muito competente.',
    autor: 'Carlos Souza',
    cargo: 'Diretor de TI' },
];

function DepoimentosBlock() {
  // Cores do projeto
  const avatarBg = "bg-indigo-500 dark:bg-indigo-400 border-4 border-white dark:border-slate-800";
  const avatarText = "text-slate-900 dark:text-white";

  return (
    <div id="Depoimentos" className="flex flex-col items-center justify-center py-16 px-4 sm:px-6 lg:px-8 scroll-mt-24">
      <div className="max-w-5xl w-full bg-white/90 dark:bg-slate-800 rounded-2xl shadow-2xl p-10 mx-auto">
        <h2 className="text-3xl font-bold text-center text-slate-900 dark:text-white mb-10 tracking-tight">Depoimentos</h2>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {depoimentos.map((dep, idx) => (
            <div
              key={idx}
              className="relative flex flex-col h-full bg-slate-50 dark:bg-slate-700 rounded-xl p-7 shadow group border border-slate-200 dark:border-slate-600 transition hover:scale-[1.025] hover:shadow-xl"
            >
              <span className="absolute -top-6 left-6 text-5xl text-indigo-200 dark:text-indigo-400 select-none">“</span>
              <p className="text-base sm:text-lg text-slate-800 dark:text-white mb-4 font-medium leading-relaxed z-10">
                {dep.texto}
              </p>
              <div className="flex items-center mt-auto pt-4 border-t border-slate-200 dark:border-slate-600 gap-3">
                <div className={`flex-shrink-0 w-12 h-12 rounded-full ${avatarBg} flex items-center justify-center ${avatarText} font-bold text-lg shadow relative overflow-hidden`}>
                  <Image
                    src={`/images/ia-avatar-${idx + 1}.png`}
                    alt={dep.autor}
                    fill
                    sizes="48px"
                    className="absolute inset-0 object-cover rounded-full"
                  />
                  <span className="relative z-10 text-xl font-extrabold tracking-wide">
                    {getInitials(dep.autor)}
                  </span>
                </div>
                <div>
                  <span className="block text-sm font-semibold text-slate-900 dark:text-white">{dep.autor}</span>
                  <span className="block text-xs text-slate-500 dark:text-slate-300">{dep.cargo}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
function Banner50Off() {
  // 30 dias a partir de agora
  const [timeLeft, setTimeLeft] = useState(30 * 24 * 60 * 60); // segundos
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 5000); // aparece após 5s
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!visible) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [visible]);

  function formatTime(secs: number) {
    const days = Math.floor(secs / (24 * 60 * 60));
    const hours = Math.floor((secs % (24 * 60 * 60)) / 3600);
    const minutes = Math.floor((secs % 3600) / 60);
    const seconds = secs % 60;
    return `${days}d ${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  if (!visible) return null;

  return (
    <div className="fixed z-50 bottom-4 right-4 sm:bottom-6 sm:right-6 animate-float-in">
      <div className="relative bg-gradient-to-br from-indigo-600 via-fuchsia-500 to-amber-400 rounded-xl shadow-2xl p-3 sm:p-4 max-w-[220px] w-full text-center flex flex-col items-center border-2 border-white/70">
        <span className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white drop-shadow-lg">50% OFF</span>
        <span className="block mt-1 text-xs sm:text-sm font-bold text-slate-900 dark:text-white/90">Só hoje!<br />Acredite no seu projeto.<br /><span className="text-slate-900 dark:text-white/80 text-xs font-medium">Eu acredito em você 🚀</span></span>
        <span className="inline-block mt-2 px-3 py-1.5 rounded-xl bg-white/90 text-indigo-700 font-bold text-xs shadow hover:bg-white cursor-pointer">Aproveitar agora</span>
        <span className="mt-2 text-[10px] font-semibold text-slate-900 dark:text-white/90 bg-white/40 px-2 py-0.5 rounded-full tracking-wider">Expira em: {formatTime(timeLeft)}</span>
      </div>
      <style>{`
        @keyframes float-in {
          0% { transform: translateY(60px) scale(0.7); opacity: 0; }
          60% { transform: translateY(-10px) scale(1.05); opacity: 1; }
          100% { transform: translateY(0) scale(1); }
        }
        .animate-float-in { animation: float-in 0.9s cubic-bezier(.68,-0.55,.27,1.55); }
      `}</style>
    </div>
  );
}
import ContactFormModal from '../component/ContactFormModal';
import Header from "../component/Header";
import VCard from "../component/VCard";
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
import { FiCode, FiMessageSquare, FiMonitor, FiServer, FiShield, FiSmartphone, FiZap } from 'react-icons/fi';

const matrixItems: ReadonlyArray<{
  title: string;
  subtitle: string;
  Icon: IconType;
  tooltip: string;
}> = [
  { title: 'Web Apps', subtitle: 'Next.js + React', Icon: FiMonitor, tooltip: 'Desenvolvimento de aplicações web modernas e responsivas.' },
  { title: 'Back-end', subtitle: 'APIs e integrações', Icon: FiServer, tooltip: 'Criação de APIs e integrações robustas para conectar sistemas.' },
  { title: 'Mobile', subtitle: 'Experiência rápida', Icon: FiSmartphone, tooltip: 'Soluções otimizadas para dispositivos móveis.' },
  { title: 'Automação', subtitle: 'N8N / fluxos', Icon: FiZap, tooltip: 'Automatização de processos e fluxos com N8N.' },
  { title: 'Chatbots', subtitle: 'Atendimento 24/7', Icon: FiMessageSquare, tooltip: 'Chatbots para atendimento automatizado e eficiente.' },
  { title: 'Segurança', subtitle: 'Boas práticas', Icon: FiShield, tooltip: 'Implementação de boas práticas de segurança em sistemas.' },
  { title: 'Código limpo', subtitle: 'Arquitetura', Icon: FiCode, tooltip: 'Organização e arquitetura de código para manutenção fácil.' },
  { title: 'Performance', subtitle: 'SEO + LCP', Icon: FiZap, tooltip: 'Otimização de performance, SEO e velocidade de carregamento.' },
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
      <Banner50Off />
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
                <p className="inline-flex items-center gap-2 rounded-full bg-white/60 border border-black/10 px-4 py-2 text-xs sm:text-sm backdrop-blur-md dark:bg-white/10 dark:border-white/15">
                  <span className="font-semibold"></span>
                                    <span className="font-semibold">EASYDEV</span>
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

                {/* Bloco de botões e tags removido daqui para evitar duplicidade. */}
              </div>

              <div className="relative mt-[-2rem]">
                <div className="absolute -inset-3 rounded-3xl bg-white/60 blur-xl dark:bg-white/5" aria-hidden="true" />
                <div className="relative rounded-3xl border border-black/10 bg-white/60 backdrop-blur-md p-4 sm:p-6 dark:border-white/15 dark:bg-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-slate-900 dark:text-white font-semibold">Matriz de capacidades</h2>
                    <span className="text-xs text-slate-600 dark:text-white/70">Tudo conectado</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {matrixItems.map(({ title, subtitle, Icon, tooltip }) => (
                      <div
                        key={title}
                        className="relative group rounded-2xl bg-white/60 border border-black/10 p-4 hover:bg-white/50 transition dark:bg-white/10 dark:border-white/15 dark:hover:bg-white/15 cursor-pointer"
                      >
                        <Icon className="h-6 w-6 text-slate-800 dark:text-white/90" aria-hidden="true" />
                        <p className="mt-3 text-sm font-semibold text-slate-900 dark:text-white">{title}</p>
                        <p className="mt-1 text-[11px] text-slate-600 dark:text-white/75 leading-snug">{subtitle}</p>
                        <span className="pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity absolute left-1/2 -translate-x-1/2 top-full mt-2 z-20 w-56 bg-slate-900 text-slate-900 dark:text-white text-xs rounded-lg px-3 py-2 shadow-xl border border-white/10 dark:bg-slate-800 dark:border-white/20" style={{whiteSpace: 'normal'}}>
                          {tooltip}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 rounded-2xl bg-white/60 border border-black/10 p-4 dark:bg-black/10 dark:border-white/10">
                    <p className="text-xs sm:text-sm text-slate-700 dark:text-white/85">
                      Quer algo realmente diferente? A gente desenha o fluxo inteiro: do primeiro clique até a automação que fecha o ciclo.
                    </p>
                  </div>
                  {/* Bloco de botões e tags removido do card da matriz conforme solicitado */}
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

        {/* Depoimentos centralizados acima do que fazemos */}
        <DepoimentosBlock />

        {/* VCARD dupla: Rogger Brosco e Adriano Neco */}
        <div className="container mx-auto px-4 sm:px-6 pt-0 pb-0 mt-2">
          <h2 className="text-3xl font-bold text-center mb-8 text-slate-900 dark:text-white">Nossos desenvolvedores</h2>
          <div className="flex flex-col md:flex-row justify-center items-stretch gap-6">
            <VCard
              name="Adriano Neco"
              image="/images/Perfil_Adriano.png"
              title="Full Stack • Banco de Dados • Automação"
              skills={["EasyDev", "Web Apps", "APIs", "PostgreSQL", "MongoDB", "n8n"]}
              bio="Foto de Adriano Neco\nAdriano Neco\nFull Stack • Banco de Dados • Automação\n\nEasyDev\nWeb Apps\nAPIs\nPostgreSQL\nMongoDB\nn8n\nVer serviços"
              email="adriano@easydev.com.br"
            />
            <VCard
              name="Rogger Brosco"
              image="/images/Perfil_Rogger.png"
              title="Full Stack • Banco de Dados • Automação"
              skills={["EasyDev", "Web Apps", "APIs", "PostgreSQL", "MongoDB", "n8n"]}
              bio={"Foto de Rogger Brosco\nRogger Brosco\nFull Stack • Banco de Dados • Automação\n\nEasyDev\nWeb Apps\nAPIs\nPostgreSQL\nMongoDB\nn8n\nVer serviços"}
              email="contato@easydev.com.br"
            />
          </div>
        </div>



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
