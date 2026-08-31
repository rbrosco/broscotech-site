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

// Componente de Depoimentos
const depoimentos = [
  {
    texto: 'O serviço foi excelente, superou todas as expectativas! Recomendo muito a equipe.',
    autor: 'João Silva',
    cargo: 'CEO da StartupX',
  },
  {
    texto: 'Atendimento rápido, solução eficiente e design impecável. Com certeza voltarei a contratar!',
    autor: 'Maria Oliveira',
    cargo: 'Gerente de Projetos',
  },
  {
    texto: 'A automação implementada transformou nosso dia a dia. Equipe muito competente e comprometida.',
    autor: 'Carlos Souza',
    cargo: 'Diretor de TI',
  },
];

function DepoimentosBlock() {
  return (
    <section id="Depoimentos" className="py-16 px-4 sm:px-6 lg:px-8 scroll-mt-24">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--color-accent)' }}>
            Depoimentos
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
            O que nossos clientes{' '}
            <span className="font-display italic">dizem</span>
          </h2>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {depoimentos.map((dep, idx) => (
            <div
              key={idx}
              className="relative flex flex-col h-full rounded-2xl border border-black/8 bg-white/80 backdrop-blur-sm p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 dark:border-white/10 dark:bg-white/5"
            >
              <span className="font-display italic text-6xl leading-none opacity-30 select-none mb-2" style={{ color: 'var(--color-accent)' }}>&ldquo;</span>
              <p className="text-[15px] text-slate-700 dark:text-white/85 leading-relaxed flex-1">
                {dep.texto}
              </p>
              <div className="flex items-center mt-5 pt-4 border-t border-black/8 dark:border-white/10 gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-[#004aad] to-[#00b09b] flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                  {dep.autor.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                </div>
                <div>
                  <span className="block text-sm font-semibold text-slate-900 dark:text-white">{dep.autor}</span>
                  <span className="block text-xs text-slate-500 dark:text-white/60">{dep.cargo}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
import ContactFormModal from '../component/ContactFormModal';
import Header from "../component/Header";
import VCard from "../component/VCard";
import IAHomeBanner from "../component/IAHomeBanner";
import Chatbot from "../component/ChatBot";
import Servicos from "../component/Servicos";
import Planos from "../component/Planos";
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

  // Typewriter effect states
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const words = ['máquina_de_crescimento', 'automação_inteligente', 'código_limpo', 'software_escalável'];
    const typingSpeed = isDeleting ? 30 : 80;
    const currentWord = words[currentWordIndex];
    
    let timeout: NodeJS.Timeout;
    
    if (!isDeleting && currentText === currentWord) {
      timeout = setTimeout(() => setIsDeleting(true), 2500);
    } else if (isDeleting && currentText === '') {
      setIsDeleting(false);
      setCurrentWordIndex((prev) => (prev + 1) % words.length);
    } else {
      timeout = setTimeout(() => {
        setCurrentText(currentWord.substring(0, currentText.length + (isDeleting ? -1 : 1)));
      }, typingSpeed);
    }
    
    return () => clearTimeout(timeout);
  }, [currentText, isDeleting, currentWordIndex]);

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
                <p className="inline-flex items-center gap-2 rounded-full bg-white/60 border border-black/10 px-4 py-2 text-xs sm:text-sm backdrop-blur-md dark:bg-white/10 dark:border-white/15">
                  <span className="font-semibold"></span>
                                    <span className="font-semibold">EASYDEV</span>
                  <span className="text-slate-500 dark:text-white/80">•</span>
                  <span className="text-slate-600 dark:text-white/80">Soluções digitais que realmente entregam</span>
                </p>

                {/* IA banner: mensagem diferenciada com botão para conversar com a IA */}
                <div className="mt-4">
                  <IAHomeBanner />
                </div>
                <h1 id="home-title" className="mt-5 text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.12] text-slate-900 dark:text-white">
                  Transforme seu negócio em uma
                  <span className="block gradient-text">máquina de crescimento.</span>
                </h1>

                <p className="mt-4 max-w-xl text-sm sm:text-base text-slate-700 dark:text-white/90">
                  Sites, sistemas, automações e integrações com foco em performance, clareza e resultado.
                  Tudo organizado como uma matriz: cada peça conversa com a outra.
                </p>

                {/* Efeito de digitação movido para cá */}
                <div className="mt-6 text-xl sm:text-2xl font-mono font-bold tracking-tight lowercase" style={{ color: '#00d4aa' }}>
                  {`< ${currentText} />`}
                  <span className="animate-pulse opacity-75">_</span>
                </div>

                {/* Bloco de botões e tags removido daqui para evitar duplicidade. */}
              </div>

              <div className="relative mt-[-2rem]">
                <div className="absolute -inset-3 rounded-3xl bg-white/60 blur-xl dark:bg-white/5" aria-hidden="true" />
                <div className="relative rounded-3xl border border-black/10 bg-white/60 backdrop-blur-md p-4 sm:p-6 dark:border-white/15 dark:bg-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-slate-900 dark:text-white font-semibold">Matriz de capacidades</h2>
                    <span className="text-xs text-slate-600 dark:text-white/70">Tudo conectado</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 overflow-visible">
                    {matrixItems.map(({ title, subtitle, Icon, tooltip }) => (
                      <div
                        key={title}
                        className="relative group rounded-2xl bg-white/60 border border-black/10 p-4 hover:bg-white/50 transition dark:bg-white/10 dark:border-white/15 dark:hover:bg-white/15 cursor-pointer overflow-visible"
                      >
                        <Icon className="h-6 w-6 text-slate-800 dark:text-white/90" aria-hidden="true" />
                        <p className="mt-3 text-sm font-semibold text-slate-900 dark:text-white">{title}</p>
                        <p className="mt-1 text-[11px] text-slate-600 dark:text-white/75 leading-snug">{subtitle}</p>
                        <span className="pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity absolute left-0 top-full mt-2 z-20 w-56 bg-slate-900 text-white text-xs rounded-lg px-3 py-2 shadow-xl border border-white/10" style={{whiteSpace: 'normal'}}>
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

        {/* PLANOS (serviço mensal / recorrência) */}
        <Planos />

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
              bio="Desenvolvedor Full Stack especialista em banco de dados, APIs robustas e automação de processos com n8n e integrações cloud-native."
              email="adriano@easydev.com.br"
            />
            <VCard
              name="Rogger Brosco"
              image="/images/Perfil_Rogger.png"
              title="Full Stack • Banco de Dados • Automação"
              skills={["EasyDev", "Web Apps", "APIs", "PostgreSQL", "MongoDB", "n8n"]}
              bio="Desenvolvedor Full Stack e fundador da EasyDev. Foco em arquitetura moderna, performance e experiências digitais que geram resultado real."
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
