'use client';
import React, { useState, useEffect } from 'react';
import Header from "../component/Header";
import ProfileCard from "../component/ProfileCard";
import Chatbot from "../component/ChatBot";
import Servicos from "../component/Servicos";
import Sobre from "../component/Sobre";
import ImageSlider from "../component/ImageSlider";
import LoadingSpinner from '../component/LoadingSpinner';
import PrivacyModal from '../component/PrivacyModal';
import IconBanner from '../component/IconBanner';

const slidesData = [
  {
    type: 'image' as const,
    src: '/images/slider-placeholder-1.jpg', // Ex: public/images/slider-placeholder-1.jpg
    alt: 'Soluções Tecnológicas Inovadoras',
    title: 'Bem-vindo à BROSCOTECH',
    description: 'Transformamos ideias em realidade digital com tecnologia de ponta.',
  },
  {
    type: 'image' as const,
    src: '/images/slider-placeholder-2.jpg', // Ex: public/images/slider-placeholder-2.jpg
    alt: 'Equipe Especializada',
    title: 'Sua Visão, Nossa Expertise',
    description: 'Conte com nossa equipe para impulsionar seu negócio.',
  },
];

const iconBannerData = [
  { src: '/images/react.png', alt: 'React' },
  { src: '/images/Next.js.png', alt: 'Next.js' },
  { src: '/images/nodejs.png', alt: 'Node.js' },
  { src: '/images/tailwind-css-logo.png', alt: 'Tailwind CSS' },
  { src: '/images/typescript-240.png', alt: 'TypeScript' },
  { src: '/images/icons8-docker-240.png', alt: 'Docker' },
  { src: '/images/icons8-postgresql-240.png', alt: 'PostgreSQL' },
  { src: '/images/icons8-mongodb-240.png', alt: 'MongoDB' },
  { src: '/images/n8n-color.svg', alt: 'N8N' },
  { src: '/images/icons8-google-logo-240.png', alt: 'Google' },
  { src: '/images/icons8-github-250.png', alt: 'GitHub' },
] as const; // Adiciona 'as const' para tipos mais estritos e inferência

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);

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
        <div id="Home" className="pt-[var(--header-height)] scroll-mt-[calc(var(--header-height)+1rem)]">
          <ImageSlider slides={slidesData} />
        </div>

        <IconBanner icons={iconBannerData} speed="60s" />

        {/* Seção do Vídeo */}
        <section
          aria-labelledby="home-demo"
          className="py-10 md:py-14 scroll-mt-[calc(var(--header-height)+1rem)]"
        >
          <div className="container mx-auto px-4 sm:px-6">
            <div className="rounded-2xl bg-white/80 dark:bg-gray-900/60 backdrop-blur-md border border-white/20 dark:border-gray-700/50 p-4 sm:p-6">
              <h2 id="home-demo" className="text-center text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-slate-100">
                Veja em ação
              </h2>
              <p className="mt-2 text-center text-sm sm:text-base text-slate-600 dark:text-slate-300">
                Um exemplo rápido do tipo de experiência e visual que entregamos.
              </p>
              <div className="mt-6">
                <video
                  className="w-full max-w-4xl mx-auto rounded-xl shadow-2xl border border-white/20 dark:border-gray-700/50"
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

        <ProfileCard />
        <Servicos />
        <Sobre />
        <Chatbot />
      </div>
      <PrivacyModal 
        isOpen={isPrivacyModalOpen} 
        onClose={handleClosePrivacyModal} 
        onAccept={handleAcceptPrivacy} 
      />
    </>
  );
}
