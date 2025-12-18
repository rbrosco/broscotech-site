'use client';
import { useState } from "react"; // useEffect não é mais necessário para o tema aqui
import ContactFormModal from "./ContactFormModal"; // Importando o modal

const Servicos: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Função para abrir o modal
  const openModal = () => setIsModalOpen(true);

  // Função para fechar o modal
  const closeModal = () => setIsModalOpen(false);

  const servicesData = [
    {
      title: "Desenvolvimento Front-End",
      icon: (
        <svg className="w-8 h-8 mb-3 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
        </svg>
      ),
      description: "Criamos interfaces de usuário interativas e intuitivas utilizando as melhores tecnologias do mercado como React, Next.js e Tailwind CSS.",
      items: ["✔ React, Next.js", "✔ Tailwind CSS, Sass, CSS-in-JS", "✔ Integração com APIs e Microserviços"]
    },
    {
      title: "Desenvolvimento Backend",
      icon: (
        <svg className="w-8 h-8 mb-3 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"></path>
        </svg>
      ),
      description: "Desenvolvemos sistemas robustos com Node.js, Express e bancos de dados como PostgreSQL, MongoDB e SQL.",
      items: ["✔ Node.js, Express.js", "✔ APIs RESTful", "✔ PostgreSQL, MongoDB"]
    },
    {
      title: "Automação e Chatbots",
      icon: (
        <svg className="w-8 h-8 mb-3 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
        </svg>
      ),
      description: "Implementamos sistemas de automação que podem otimizar processos e melhorar a interação com clientes.",
      items: ["✔ Integração de Chatbots", "✔ Automação de Processos Empresariais", "✔ Configuração de N8N, TypeBot"]
    },
    {
      title: "Desenvolvimento de Aplicações Móveis",
      icon: (
        <svg className="w-8 h-8 mb-3 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
        </svg>
      ),
      description: "Criamos aplicativos móveis rápidos e escaláveis usando React Native.",
      items: ["✔ React Native", "✔ Integração com APIs", "✔ Publicação na App Store / Google Play"]
    },
    {
      title: "Facilidade e Desempenho",
      icon: (
        <svg className="w-8 h-8 mb-3 text-yellow-500 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
        </svg>
      ),
      description: "Criamos automações integrando seu SQL com React N8N, permitindo solicitações de boletos via dispositivos móveis.",
      items: ["✔ Facilidade", "✔ Integração com APIs", "✔ Whatsapp API"]
    },
    {
      title: "Ferramentas Google",
      icon: (
        <svg className="w-8 h-8 mb-3 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path>
        </svg>
      ),
      description: "Configuramos seu Site integrando com notas e ranks no GoogleAds e GoogleWorks para melhor posicionamento.",
      items: ["✔ Google ADS", "✔ Google Works com APIs"]
    }
  ];

  return (
    <div id="Servicos">
    <div
      className={`min-h-screen py-12 transition-all duration-300 bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 text-white`}
    >
      <div className="text-center text-white">
        <h1 className="text-4xl font-semibold mb-8 animate__animated animate__fadeIn">
          Nossos Serviços
        </h1>
        <p className="text-lg max-w-3xl mx-auto mb-12 animate__animated animate__fadeIn animate__delay-1s">
          Nós oferecemos soluções de desenvolvimento personalizadas para atender às
          necessidades específicas de seu projeto. Nosso time especializado trabalha com
          diversas tecnologias para garantir que seu produto seja inovador, escalável e de
          alta qualidade.
        </p>
      </div>

      {/* Serviços */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8"> {/* Ajustado para 2 colunas no desktop (md) e 1 no mobile */}
        {servicesData.map((service, index) => (
          <div key={index} 
            className={`flex flex-col p-4 sm:p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 animate__animated animate__fadeIn 
              bg-white text-gray-700 dark:bg-gray-800 dark:text-white`}
          >
            <div className="flex-shrink-0">
              {service.icon}
            </div>
            <div className="flex-grow mt-2">
              <h3 className="text-xl font-semibold text-blue-600 dark:text-blue-400 mb-2">{service.title}</h3>
              {/* A cor do texto do parágrafo e da lista será herdada do card: text-gray-700 (claro) ou dark:text-white (escuro) */}
              <p className="mb-3 text-xs sm:text-sm"> 
                {service.description}
              </p>
              <ul className="list-disc pl-4 space-y-1 text-xs sm:text-sm"> 
              {service.items.map((item, i) => <li key={i}>{item}</li>)}
            </ul>
          </div>
          </div>
        ))}
      </div>

      {/* Call to Action */}
      <div className="text-center mt-16">
        <button
          onClick={openModal}
          className="inline-block px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 text-lg font-semibold"
        >
          Solicite um Orçamento
        </button>
      </div>

      {/* Modal de Contato */}
      <ContactFormModal isOpen={isModalOpen} onClose={closeModal} />
    </div>
    </div>
  );
};

export default Servicos;
