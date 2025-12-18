import Image from "next/image";

const ProfileCard: React.FC = () => {
  return (
    <section className="py-10 md:py-14 scroll-mt-[calc(var(--header-height)+1rem)]">
      <div className="container mx-auto px-4 sm:px-6 flex items-center justify-center">
      <div className="w-full max-w-2xl mx-auto p-6 sm:p-8 bg-white/85 shadow-2xl rounded-3xl dark:bg-gray-800/80 dark:text-white backdrop-blur-md border border-white/20 dark:border-gray-700/50">
        {/* Profile Image */}
        <div className="flex justify-center mb-6">
          <Image
            src="/images/Perfil_Rogger.png" // Substitua pela URL da sua foto
            alt="Foto de Rogger Brosco"
            width={160}
            height={160}
            className="rounded-full border-4 border-blue-600 shadow-lg"
          />
        </div>

        {/* Profile Info */}
        <div className="text-center mb-6">
          <h1 className="text-4xl sm:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-400 dark:from-blue-400 dark:to-indigo-300 pb-2">
            Rogger Brosco
          </h1>
          <p className="text-md sm:text-lg font-medium text-gray-600 dark:text-gray-400 mt-1">
            Desenvolvedor Full Stack | Especialista em Banco de Dados e Automação
          </p>
        </div>

        {/* Skills Section */}
        <div className="space-y-4 mb-8 p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
          <h2 className="text-xl sm:text-2xl font-semibold text-blue-600 dark:text-blue-400 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
            Minhas Habilidades
          </h2>
          <ul className="list-none pl-2 text-gray-700 dark:text-gray-300 space-y-1.5 text-sm sm:text-base">
            {/* React, Next.js, Tailwind CSS */}
            <li className="flex items-center">
              {/* Ícone para Front-End (Monitor) */}
              <svg className="w-6 h-6 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
              </svg>
              Desenvolvimento Front-End (React, Next.js, Tailwind CSS)
            </li>
            {/* Node.js, Express */}
            <li className="flex items-center">
              {/* Ícone para Backend (Servidor) */}
              <svg className="w-6 h-6 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"></path>
              </svg>
              Backend (Node.js, Express, API RESTful)
            </li>
            {/* Banco de Dados */}
            <li className="flex items-center">
              {/* Ícone para Banco de Dados */}
              <svg className="w-6 h-6 mr-2 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"></path>
              </svg>
              Banco de Dados (SQL, NoSQL, PostgreSQL, MongoDB)
            </li>
            {/* Git, GitHub, GitLab */}
            <li className="flex items-center">
              {/* Ícone para Controle de Versionamento (Git Branch) */}
              <svg className="w-6 h-6 mr-2 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 3v12M6 3a3 3 0 100 6 3 3 0 000-6zm0 12a3 3 0 100 6 3 3 0 000-6zm0 0h6m6 0a3 3 0 100-6 3 3 0 000 6zm0 0V9"></path>
              </svg>
              Controle de Versionamento (Git, GitHub, GitLab)
            </li>
            {/* Automação e Chatbots */}
            <li className="flex items-center">
              {/* Ícone para Automação (Engrenagem/Cog) */}
              <svg className="w-6 h-6 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
              Automação e Chatbots (Chatbot Integrations)
            </li>
          </ul>
        </div>

        {/* Bio Section */}
        <div className="mb-8 p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
          <h2 className="text-xl sm:text-2xl font-semibold text-blue-600 dark:text-blue-400 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Sobre Mim
          </h2>
          <p className="text-gray-700 dark:text-gray-300 text-sm sm:text-base leading-relaxed">
            Sou um desenvolvedor apaixonado por criar soluções inovadoras para empresas
            através da tecnologia. Tenho experiência prática no desenvolvimento de sistemas
            robustos, aplicativos móveis e automações que atendem às necessidades do cliente.
            Adoro aprender novas tecnologias e estou sempre em busca de desafios que me
            permitam evoluir como profissional e oferecer as melhores soluções para os {/* Mantido o texto original */}
            projetos em que estou envolvido.
          </p>
        </div>

        {/* Contact and CV Download Buttons */}
        <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6 mt-8">
          <a
            href="mailto:rogger@broscotech.com.br" // Substitua com seu e-mail
            className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-blue-400 dark:focus:ring-offset-gray-800 transition-all duration-300 ease-in-out transform hover:scale-105"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
            </svg>
            Entre em Contato
          </a>

        </div>
      </div>
      </div>
    </section>
  );
};

export default ProfileCard;
