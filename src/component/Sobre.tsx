'use client';

const Sobre: React.FC = () => {
  const valuesData = [
    {
      // Ícone: Lâmpada (Inovação)
      icon: "💡",
      text: "Inovação contínua",
    },
    {
      // Ícone: Escudo com Check (Qualidade)
      icon: "🤝",
      text: "Compromisso com a qualidade",
    },
    {
      // Ícone: Folha/Planta (Sustentabilidade)
      icon: "🌱",
      text: "Sustentabilidade e ética",
    },
    {
      // Ícone: Globo (Impacto Social)
      icon: "🌍",
      text: "Impacto positivo na sociedade",
    }
  ];

  return (
    <section id="Sobre" className="py-10 md:py-14 scroll-mt-[calc(var(--header-height)+1rem)] text-white">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Introdução */}
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl font-semibold mb-6 animate__animated animate__fadeIn">
            Sobre a Broscotech
          </h1>
          <p className="text-base sm:text-lg max-w-3xl mx-auto mb-10 animate__animated animate__fadeIn animate__delay-1s text-slate-100">
            A Broscotech é uma empresa inovadora que oferece soluções tecnológicas personalizadas para empresas de todos os tamanhos. Com uma equipe altamente qualificada, nós nos especializamos em transformar ideias em soluções digitais eficientes e escaláveis.
          </p>
        </div>

        {/* Missão e Valores */}
        <div className="max-w-5xl mx-auto text-center mt-12">
          <h2 className="text-3xl sm:text-4xl font-semibold mb-6 animate__animated animate__fadeIn text-white">
            Nossa Missão e Valores
          </h2>
          <p className="text-base sm:text-lg max-w-3xl mx-auto mb-10 animate__animated animate__fadeIn animate__delay-1s text-slate-100">
            Na Broscotech, nossa missão é fornecer soluções tecnológicas que ajudem nossos clientes a crescer de forma sustentável. Acreditamos no uso de tecnologias de ponta para resolver problemas reais, garantindo a satisfação e o sucesso de cada cliente.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {valuesData.map((value, index) => (
              <div
                key={index}
                className={`flex flex-col items-center justify-center text-center p-6 rounded-xl 
                            transition-all duration-300 ease-in-out transform hover:-translate-y-1.5 hover:scale-105 group
                            bg-white/80 hover:bg-gray-50/90 border border-gray-200 hover:border-indigo-400 shadow-md hover:shadow-indigo-400/50 
                            dark:bg-gray-700/80 dark:hover:bg-gray-600/90 dark:border-gray-600 dark:hover:border-indigo-500/60 dark:shadow-lg dark:hover:shadow-indigo-500/40`}
              >
                <div className="text-4xl mb-3 transition-transform duration-300 group-hover:scale-110 text-gray-700 dark:text-indigo-400 dark:group-hover:text-indigo-300">
                  {value.icon}
                </div>
                <p className="text-base sm:text-lg font-semibold transition-colors duration-300 text-gray-700 group-hover:text-gray-900 dark:text-gray-200 dark:group-hover:text-white">
                  {value.text}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* O que fazemos */}
        <div className="text-center max-w-5xl mx-auto mt-14">
          <h2 className="text-3xl sm:text-4xl font-semibold mb-6 animate__animated animate__fadeIn text-white">
            O que fazemos
          </h2>
          <p className="text-base sm:text-lg max-w-3xl mx-auto mb-10 animate__animated animate__fadeIn animate__delay-1s text-slate-100">
            Oferecemos uma gama de serviços personalizados para atender às necessidades tecnológicas de nossos clientes. Nossa equipe é especializada em:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="p-6 rounded-lg shadow-lg hover:shadow-xl transition-all bg-white/85 text-gray-800 dark:bg-gray-700/80 dark:text-white backdrop-blur-md border border-white/20 dark:border-gray-700/50">
              <h3 className="text-xl font-semibold mb-4 text-indigo-600 dark:text-indigo-400">Desenvolvimento Web</h3>
              <p className="text-gray-600 dark:text-gray-300">Construímos sites dinâmicos e responsivos utilizando as mais modernas tecnologias do mercado, como React, Next.js e Tailwind CSS.</p>
            </div>
            <div className="p-6 rounded-lg shadow-lg hover:shadow-xl transition-all bg-white/85 text-gray-800 dark:bg-gray-700/80 dark:text-white backdrop-blur-md border border-white/20 dark:border-gray-700/50">
              <h3 className="text-xl font-semibold mb-4 text-indigo-600 dark:text-indigo-400">Desenvolvimento de Aplicações Móveis</h3>
              <p className="text-gray-600 dark:text-gray-300">Criamos aplicativos móveis nativos e híbridos, com foco em performance, experiência do usuário e integração com plataformas diversas.</p>
            </div>
            <div className="p-6 rounded-lg shadow-lg hover:shadow-xl transition-all bg-white/85 text-gray-800 dark:bg-gray-700/80 dark:text-white backdrop-blur-md border border-white/20 dark:border-gray-700/50">
              <h3 className="text-xl font-semibold mb-4 text-indigo-600 dark:text-indigo-400">Consultoria e Automação</h3>
              <p className="text-gray-600 dark:text-gray-300">Implementamos soluções de automação para melhorar a eficiência dos processos de negócios e oferecer uma experiência mais ágil e fluida aos nossos clientes.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Sobre;
