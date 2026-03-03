'use client';
import { useState } from "react"; // useEffect não é mais necessário para o tema aqui
import ContactFormModal from "./ContactFormModal"; // Importando o modal
import {
  FiMessageSquare,
  FiMonitor,
  FiServer,
  FiSliders,
  FiSmartphone,
  FiZap,
} from "react-icons/fi";

const Servicos: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Função para fechar o modal
  const closeModal = () => setIsModalOpen(false);

  const servicesData = [
    {
      title: "Desenvolvimento Front-End",
      icon: (
        <FiMonitor className="w-7 h-7 text-slate-900 dark:text-white/90" />
      ),
      description: "Interfaces modernas, rápidas e responsivas (desktop, tablet e celular) com React, Next.js e Tailwind — com tema claro/escuro quando fizer sentido.",
      items: ["✔ React, Next.js", "✔ Tailwind CSS, Sass, CSS-in-JS", "✔ Integração com APIs e Microserviços"]
    },
    {
      title: "Desenvolvimento Backend",
      icon: (
        <FiServer className="w-7 h-7 text-slate-900 dark:text-white/90" />
      ),
      description: "Desenvolvemos sistemas robustos com Node.js, Express e bancos de dados como PostgreSQL, MongoDB e SQL.",
      items: ["✔ Node.js, Express.js", "✔ APIs RESTful", "✔ PostgreSQL, MongoDB"]
    },
    {
      title: "Automação e Chatbots",
      icon: (
        <FiMessageSquare className="w-7 h-7 text-slate-900 dark:text-white/90" />
      ),
      description: "Atendimento automatizado, captura de leads e fluxos que economizam tempo. IA + integrações para manter tudo rodando sem fricção.",
      items: ["✔ Integração de Chatbots", "✔ Automação de Processos Empresariais", "✔ Configuração de N8N, TypeBot"]
    },
    {
      title: "Desenvolvimento de Aplicações Móveis",
      icon: (
        <FiSmartphone className="w-7 h-7 text-slate-900 dark:text-white/90" />
      ),
      description: "Criamos aplicativos móveis rápidos e escaláveis usando React Native.",
      items: ["✔ React Native", "✔ Integração com APIs", "✔ Publicação na App Store / Google Play"]
    },
    {
      title: "Facilidade e Desempenho",
      icon: (
        <FiZap className="w-7 h-7 text-slate-900 dark:text-white/90" />
      ),
      description: "Criamos automações integrando seu SQL com React N8N, permitindo solicitações de boletos via dispositivos móveis.",
      items: ["✔ Facilidade", "✔ Integração com APIs", "✔ Whatsapp API"]
    },
    {
      title: "Ferramentas Google",
      icon: (
        <FiSliders className="w-7 h-7 text-slate-900 dark:text-white/90" />
      ),
      description: "Configuramos seu Site integrando com notas e ranks no GoogleAds e GoogleWorks para melhor posicionamento.",
      items: ["✔ Google ADS", "✔ Google Works com APIs"]
    }
  ];

  return (
    <section id="Servicos" className="py-10 md:py-14 scroll-mt-[calc(var(--header-height)+1rem)]">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl font-semibold mb-4 animate__animated animate__fadeIn">
            Serviços que viram resultado
          </h1>
          <p className="text-base sm:text-lg max-w-3xl mx-auto mb-6 animate__animated animate__fadeIn animate__delay-1s text-slate-700 dark:text-slate-100">
            Você não precisa de “mais um site”. Você precisa de um sistema completo: presença, funil, automação, integração e visibilidade do progresso.
          </p>

          <div className="max-w-5xl mx-auto mb-10 rounded-3xl bg-white/60 border border-black/10 backdrop-blur-md p-5 sm:p-6 dark:bg-white/10 dark:border-white/15">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-left">
                <p className="text-xs uppercase tracking-wider text-slate-600 dark:text-white/70">Dois caminhos, um objetivo</p>
                <h2 className="mt-1 text-xl sm:text-2xl font-semibold text-slate-900 dark:text-white">Comece agora: cadastro ou IA Agent</h2>
                <p className="mt-1 text-sm text-slate-700 dark:text-white/85">
                  Cadastre-se para acompanhar seu projeto no dashboard, ou fale com o nosso agente com IA para acelerar o briefing.
                </p>

                <div className="mt-4 flex flex-wrap gap-2 text-xs">
                  {['Multi-dispositivo', 'Tema claro/escuro', 'Dashboard de progresso'].map((tag) => (
                    <span key={tag} className="rounded-full bg-white/60 border border-black/10 px-3 py-1.5 text-slate-700 dark:bg-black/10 dark:border-white/15 dark:text-white/90">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <a
                  href="/register"
                  className="inline-flex items-center justify-center rounded-xl bg-slate-900 text-slate-900 dark:text-white px-6 py-3 font-semibold hover:bg-slate-800 transition dark:bg-white/90 dark:text-slate-900 dark:hover:bg-white"
                >
                  Quero me cadastrar
                </a>
                <a
                  href="/iaagent"
                  className="inline-flex items-center justify-center rounded-xl bg-white/60 border border-black/10 px-6 py-3 font-semibold text-slate-900 hover:bg-white/50 transition dark:bg-white/10 dark:border-white/20 dark:text-white dark:hover:bg-white/15"
                >
                  Usar IA Agent
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Serviços */}
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {servicesData.map((service, index) => (
            <div
              key={index}
              className="flex flex-col p-5 sm:p-6 rounded-3xl bg-white/60 border border-black/10 backdrop-blur-md hover:bg-white/50 transition dark:bg-white/10 dark:border-white/15 dark:hover:bg-white/15"
            >
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white/60 border border-black/10 dark:bg-white/10 dark:border-white/10">
                  {service.icon}
                </span>
                <h3 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white">{service.title}</h3>
              </div>
              <div className="flex-grow mt-2">
                <p className="mt-3 mb-3 text-sm text-slate-700 dark:text-white/85">{service.description}</p>
                <ul className="space-y-1 text-sm text-slate-600 dark:text-white/80">
                  {service.items.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action removido */}

        {/* Modal de Contato */}
        <ContactFormModal isOpen={isModalOpen} onClose={closeModal} />
      </div>
    </section>
  );
};

export default Servicos;
