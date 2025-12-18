'use client';
import React from 'react';
import Image from 'next/image';

interface IconBannerProps {
  icons: {
    src: string;
    alt: string;
  }[] | ReadonlyArray<{ src: string; alt: string }>;
  speed?: string; // Duração da animação, ex: '20s', '40s'
}

const IconBanner: React.FC<IconBannerProps> = ({ icons, speed = '40s' }) => {
  // Duplicar os ícones para criar um efeito de loop contínuo e suave
  const iconsArray = Array.from(icons);
  const duplicatedIcons = [...iconsArray, ...iconsArray];

  return (
    <div className="w-full py-8 md:py-12 overflow-hidden bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500">
      <div className="relative">
        <h2 className="text-3xl font-semibold text-center text-white mb-8">
          Tecnologias e Ferramentas que Dominamos
        </h2>
        {/* Scrolling Icons Banner Start */}
        <div className="w-full inline-flex flex-nowrap mb-12"> {/* Adicionado mb-12 para espaço antes dos mockups */}
          <div
            className="flex items-center justify-start animate-scroll"
            style={{ '--animation-duration': speed } as React.CSSProperties}
          >
            {duplicatedIcons.map((icon, index) => (
              <div key={`icon-${index}`} className="flex flex-col items-center flex-shrink-0 mx-4 text-center w-20 md:w-24 lg:w-28">
                {/* Contêiner circular para o ícone */}
                <div className="w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 p-2 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white/20 transition-all duration-300">
                  <Image
                    src={icon.src}
                    alt={icon.alt}
                    width={60} // Ajuste conforme o tamanho desejado dentro do círculo
                    height={60}
                    className="object-contain"
                    unoptimized // Importante para GIFs animados
                  />
                </div>
                {/* Nome do ícone abaixo */}
                <p className="mt-2 text-xs md:text-sm text-white font-medium truncate w-full">
                  {icon.alt}
                </p>
              </div>
            ))}
          </div>
        </div>
        {/* Scrolling Icons Banner End */}

        {/* New Title for Multi-device Access */}
        <h3 className="text-2xl font-medium text-center text-white mb-8">
          Site com acesso multi dispositivo
        </h3>

        {/* Mockups Container Start */}
        <div className="flex flex-col md:flex-row justify-center items-center md:items-end gap-4 md:gap-4 mb-12 px-4">
          {/* Phone Mockup Start */} {/* Removido mx-auto daqui */}
          <div className="relative border-gray-300 dark:border-gray-700 bg-gray-300 dark:bg-gray-700 border-[14px] rounded-[2.5rem] h-[600px] w-[300px] shadow-2xl">
            <div className="h-[32px] w-[3px] bg-gray-300 dark:bg-gray-700 absolute -start-[17px] top-[72px] rounded-s-lg"></div>
            <div className="h-[46px] w-[3px] bg-gray-300 dark:bg-gray-700 absolute -start-[17px] top-[124px] rounded-s-lg"></div>
            <div className="h-[46px] w-[3px] bg-gray-300 dark:bg-gray-700 absolute -start-[17px] top-[178px] rounded-s-lg"></div>
            <div className="h-[64px] w-[3px] bg-gray-300 dark:bg-gray-700 absolute -end-[17px] top-[142px] rounded-e-lg"></div>
            <div className="rounded-[2rem] overflow-hidden w-[272px] h-[572px] bg-white dark:bg-gray-800">
              <img src="https://flowbite.s3.amazonaws.com/blocks/marketing-ui/hero/mockup-1-light.png" className="dark:hidden w-[272px] h-[572px] object-cover" alt="Mockup de celular tema claro" />
              <img src="https://flowbite.s3.amazonaws.com/blocks/marketing-ui/hero/mockup-1-dark.png" className="hidden dark:block w-[272px] h-[572px] object-cover" alt="Mockup de celular tema escuro" />
            </div>
          </div>
          {/* Phone Mockup End */}

          {/* Laptop Mockup Start */}
          <div className="flex flex-col items-center"> {/* Container para o Laptop e sua base */}
            <div className="relative mx-auto border-gray-800 dark:border-gray-800 bg-gray-800 border-[8px] rounded-t-xl h-[172px] max-w-[301px] md:h-[294px] md:max-w-[512px] shadow-2xl">
              <div className="rounded-lg overflow-hidden h-[156px] md:h-[278px] bg-white dark:bg-gray-800">
                <img src="https://flowbite.s3.amazonaws.com/docs/device-mockups/laptop-screen.png" className="dark:hidden h-[156px] md:h-[278px] w-full rounded-lg object-cover" alt="Tela de laptop tema claro" />
                <img src="https://flowbite.s3.amazonaws.com/docs/device-mockups/laptop-screen-dark.png" className="hidden dark:block h-[156px] md:h-[278px] w-full rounded-lg object-cover" alt="Tela de laptop tema escuro" />
              </div>
            </div>
            <div className="relative mx-auto bg-gray-900 dark:bg-gray-700 rounded-b-xl rounded-t-sm h-[17px] max-w-[351px] md:h-[21px] md:max-w-[597px] shadow-lg">
              <div className="absolute left-1/2 top-0 -translate-x-1/2 rounded-b-xl w-[56px] h-[5px] md:w-[96px] md:h-[8px] bg-gray-800"></div>
            </div>
          </div>
          {/* Laptop Mockup End */}
        </div>
        {/* Mockups Container End */}
      </div>
    </div>
  );
};

export default IconBanner;
