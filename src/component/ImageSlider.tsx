'use client'; // Certifique-se de que este arquivo seja tratado no lado do cliente
import React, { useState, useEffect, useCallback } from 'react'; // useState e useEffect já estão aqui
import Image from 'next/image';

// SVG para o ícone de seta para a esquerda
const ChevronLeftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-full h-full">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
  </svg>
);

// SVG para o ícone de seta para a direita
const ChevronRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-full h-full">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
  </svg>
);

interface Slide {
  type: 'image' | 'gif' | 'mp4';
  src: string;
  alt: string;
  title?: string;
  description?: string;
}

interface ImageSliderProps {
  slides?: Slide[]; // Tornar a prop opcional
  autoPlay?: boolean;
  autoPlayInterval?: number;
}

const ImageSlider: React.FC<ImageSliderProps> = ({ slides = [], autoPlay = true, autoPlayInterval = 7000 }) => { // Adicionar valor padrão slides = []
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const updateThemeState = () => {
        const storedTheme = localStorage.getItem("theme");
        const isDark = storedTheme === "dark" || (!storedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches);
        setIsDarkMode(isDark);
    };
    
    updateThemeState();

    const handleStorageChange = (event: StorageEvent) => {
        if (event.key === 'theme') {
            updateThemeState();
        }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
        window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const goToPrevious = useCallback(() => {
    const isFirstSlide = currentIndex === 0;
    const newIndex = isFirstSlide ? slides.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
  }, [currentIndex, slides.length]);

  const goToNext = useCallback(() => {
    const isLastSlide = currentIndex === slides.length - 1;
    const newIndex = isLastSlide ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
  }, [currentIndex, slides.length]);

  const goToSlide = (slideIndex: number) => {
    setCurrentIndex(slideIndex);
  };

  useEffect(() => {
    if (!autoPlay || slides.length <= 1) return;
    const interval = setInterval(goToNext, autoPlayInterval);
    return () => clearInterval(interval);
  }, [autoPlay, autoPlayInterval, goToNext, slides.length]);

  if (!slides || slides.length === 0) {
    return (
      <div className={`relative w-full h-[50vh] sm:h-[60vh] md:h-[calc(100vh-80px)] flex items-center justify-center ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`}>
        <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Nenhum slide para exibir.</p>
      </div>
    );
  }

  return (
    <div className={`relative w-full h-[50vh] sm:h-[60vh] md:h-[calc(100vh-var(--header-height,50px))] overflow-hidden group shadow-lg ${isDarkMode ? 'bg-gradient-to-br from-gray-800 to-gray-900' : 'bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50'}`}>
      {/* Slides */}
      <div className="w-full h-full">
        {slides.map((slide, slideIndex) => (
          <div
            key={slide.src} // Usar src como chave se for único, ou adicionar um id
            className={`absolute top-0 left-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
              slideIndex === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            {slide.type === 'mp4' ? (
              <video
                src={slide.src}
                autoPlay
                loop
                muted // Autoplay com som geralmente é bloqueado pelos navegadores
                playsInline // Necessário para autoplay em alguns dispositivos móveis
                className="w-full h-full object-cover"
                controls // Adiciona controles de play/pause
                aria-label={slide.alt}
              />
            ) : (
              <Image
                src={slide.src}
                alt={slide.alt}
                layout="fill"
                objectFit="cover"
                unoptimized={slide.type === 'gif'}
                priority={slideIndex === 0} // Otimiza o carregamento do primeiro slide
              />
            )}
            {(slide.title || slide.description) && (
              <div className="absolute inset-0 flex flex-col items-center justify-end p-6 sm:p-10 md:p-16 bg-gradient-to-t from-black/75 via-black/40 to-transparent text-center">
                <div className="max-w-3xl mb-4 sm:mb-8">
                  {slide.title && <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold text-white mb-2 sm:mb-3 drop-shadow-lg animate__animated animate__fadeInDown animate__delay-0.5s">{slide.title}</h2>}
                  {slide.description && <p className="text-sm sm:text-lg md:text-xl text-gray-100 drop-shadow-md animate__animated animate__fadeInUp animate__delay-0.7s">{slide.description}</p>}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Controles de Navegação */}
      {slides.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className={`absolute top-1/2 left-3 sm:left-5 transform -translate-y-1/2 p-2 sm:p-3 rounded-full shadow-lg
                        ${isDarkMode ? 'bg-gray-700/60 hover:bg-gray-600/80 text-white' : 'bg-white/60 hover:bg-white/90 text-gray-800'} 
                        focus:outline-none focus:ring-2 focus:ring-offset-2 
                        ${isDarkMode ? 'focus:ring-blue-400 focus:ring-offset-gray-800' : 'focus:ring-blue-600 focus:ring-offset-gray-100'} 
                        transition-all duration-200 opacity-0 group-hover:opacity-100 z-20`}
            aria-label="Slide anterior"
          >
            <div className="w-5 h-5 sm:w-6 sm:h-6"><ChevronLeftIcon /></div>
          </button>

          <button
            onClick={goToNext}
            className={`absolute top-1/2 right-3 sm:right-5 transform -translate-y-1/2 p-2 sm:p-3 rounded-full shadow-lg
                        ${isDarkMode ? 'bg-gray-700/60 hover:bg-gray-600/80 text-white' : 'bg-white/60 hover:bg-white/90 text-gray-800'} 
                        focus:outline-none focus:ring-2 focus:ring-offset-2 
                        ${isDarkMode ? 'focus:ring-blue-400 focus:ring-offset-gray-800' : 'focus:ring-blue-600 focus:ring-offset-gray-100'} 
                        transition-all duration-200 opacity-0 group-hover:opacity-100 z-20`}
            aria-label="Próximo slide"
          >
            <div className="w-5 h-5 sm:w-6 sm:h-6"><ChevronRightIcon /></div>
          </button>

          <div className="absolute bottom-5 sm:bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2.5 z-20">
            {slides.map((_, slideIndex) => (
              <button
                key={slideIndex}
                onClick={() => goToSlide(slideIndex)}
                className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full ring-1 ring-offset-2 transition-all duration-300
                            ${currentIndex === slideIndex 
                                ? (isDarkMode ? 'bg-blue-400 ring-blue-400 ring-offset-gray-900' : 'bg-blue-600 ring-blue-600 ring-offset-white') 
                                : (isDarkMode ? 'bg-gray-600/70 hover:bg-gray-500/90 ring-gray-700 ring-offset-gray-900' : 'bg-gray-400/70 hover:bg-gray-500/90 ring-gray-500 ring-offset-white')}`}
                aria-label={`Ir para o slide ${slideIndex + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ImageSlider;