import React from "react";
import Image from "next/image";
import {
  FiCode,
  FiDatabase,
  FiGitBranch,
  FiMail,
  FiMonitor,
  FiServer,
  FiSettings,
  FiUser,
} from "react-icons/fi";
import { FaGithub } from "react-icons/fa";

const ProfileCard: React.FC = () => {
  return (
    <section className="py-10 md:py-14 scroll-mt-[calc(var(--header-height)+1rem)]">
      <div className="container mx-auto px-4 sm:px-6 flex items-center justify-center">
      <div className="relative w-full max-w-4xl mx-auto p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-white/10 to-white/5 border border-white/20 backdrop-blur-xl shadow-2xl dark:from-black/20 dark:to-black/10 dark:border-white/10 overflow-hidden">
        <div className="pointer-events-none absolute -inset-10 opacity-20 dark:opacity-30">
          <div className="gradient w-full h-full blur-3xl animate-pulse" />
        </div>

        <div className="relative">
        {/* Profile Image */}
          <div className="grid grid-cols-1 md:grid-cols-[180px,1fr] gap-6 items-center">
            <div className="flex justify-center md:justify-start">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 blur-xl opacity-30 animate-pulse"></div>
                <Image
                  src="https://github.com/rbrosco.png"
                  alt="Foto de Rogger Brosco"
                  width={160}
                  height={160}
                  unoptimized
                  className="relative rounded-full border-4 border-white/50 shadow-2xl dark:border-white/70"
                />
              </div>
            </div>

            <div className="text-center md:text-left">
              <p className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/60 px-4 py-2 text-xs font-semibold text-slate-900 dark:border-white/15 dark:bg-black/20 dark:text-slate-900 dark:text-white">
                <span className="opacity-80">Foto de</span>
                <span className="opacity-40">•</span>
                <span className="opacity-80">Rogger Brosco</span>
              </p>

              <h1 className="mt-4 text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-slate-900 dark:text-white bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-white/80 bg-clip-text text-transparent">
                Rogger Brosco
              </h1>
              <p className="mt-2 text-md sm:text-lg font-medium text-slate-700 dark:text-slate-900 dark:text-white/70">
                Full Stack • Banco de Dados • Automação
              </p>

              <div className="mt-4 flex flex-wrap gap-2 justify-center md:justify-start text-xs">
                {['Web Apps', 'APIs', 'PostgreSQL', 'MongoDB', 'n8n'].map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-white/60 border border-black/10 px-3 py-1 text-slate-700 dark:bg-black/20 dark:border-white/10 dark:text-slate-900 dark:text-white/80"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

        {/* Skills Section */}
        <div className="space-y-4 mb-8 p-6 rounded-2xl bg-gradient-to-r from-white/10 to-white/5 border border-white/20 backdrop-blur-sm dark:from-black/20 dark:to-black/10 dark:border-white/10 shadow-lg">
          <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 dark:text-slate-900 dark:text-white flex items-center">
            <FiCode className="h-6 w-6 mr-2 text-blue-500" />
            Minhas Habilidades
          </h2>
          <ul className="list-none pl-2 text-slate-700 dark:text-slate-900 dark:text-white/80 space-y-2 text-sm sm:text-base">
            {/* React, Next.js, Tailwind CSS */}
            <li className="flex items-center p-2 rounded-lg bg-white/20 dark:bg-black/20 backdrop-blur-sm border border-white/10 dark:border-white/5">
              {/* Ícone para Front-End (Monitor) */}
              <FiMonitor className="w-6 h-6 mr-3 text-green-500" />
              Desenvolvimento Front-End (React, Next.js, Tailwind CSS)
            </li>
            {/* Node.js, Express */}
            <li className="flex items-center p-2 rounded-lg bg-white/20 dark:bg-black/20 backdrop-blur-sm border border-white/10 dark:border-white/5">
              {/* Ícone para Backend (Servidor) */}
              <FiServer className="w-6 h-6 mr-3 text-blue-500" />
              Backend (Node.js, Express, API RESTful)
            </li>
            {/* Banco de Dados */}
            <li className="flex items-center p-2 rounded-lg bg-white/20 dark:bg-black/20 backdrop-blur-sm border border-white/10 dark:border-white/5">
              {/* Ícone para Banco de Dados */}
              <FiDatabase className="w-6 h-6 mr-3 text-purple-500" />
              Banco de Dados (SQL, NoSQL, PostgreSQL, MongoDB)
            </li>
            {/* Git, GitHub, GitLab */}
            <li className="flex items-center p-2 rounded-lg bg-white/20 dark:bg-black/20 backdrop-blur-sm border border-white/10 dark:border-white/5">
              {/* Ícone para Controle de Versionamento (Git Branch) */}
              <FiGitBranch className="w-6 h-6 mr-3 text-orange-500" />
              Controle de Versionamento (Git, GitHub, GitLab)
            </li>
            {/* Automação e Chatbots */}
            <li className="flex items-center p-2 rounded-lg bg-white/20 dark:bg-black/20 backdrop-blur-sm border border-white/10 dark:border-white/5">
              {/* Ícone para Automação (Engrenagem/Cog) */}
              <FiSettings className="w-6 h-6 mr-3 text-red-500" />
              Automação e Chatbots (Chatbot Integrations)
            </li>
          </ul>
        </div>

        {/* Bio Section */}
        <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-white/10 to-white/5 border border-white/20 backdrop-blur-sm dark:from-black/20 dark:to-black/10 dark:border-white/10 shadow-lg">
          <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 dark:text-slate-900 dark:text-white flex items-center">
            <FiUser className="h-6 w-6 mr-2 text-purple-500" />
            Sobre Mim
          </h2>
          <p className="text-slate-700 dark:text-slate-900 dark:text-white/80 text-sm sm:text-base leading-relaxed">
            Eu ajudo empresas a transformar processos e ideias em produtos digitais — com foco em clareza, velocidade e manutenção.
            Na prática, isso significa: construir interfaces consistentes, APIs bem definidas, bancos de dados confiáveis e automações
            que tiram trabalho manual do caminho.
          </p>
        </div>

        {/* Contact and GitHub Buttons */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-8">
          <a
            href="https://github.com/rbrosco"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 rounded-xl border border-black/10 bg-white/70 hover:bg-white text-slate-800 dark:border-white/15 dark:bg-white/10 dark:text-white dark:hover:bg-white/20 shadow-md font-semibold text-sm transition-all duration-300 ease-in-out transform hover:scale-105"
          >
            <FaGithub className="h-5 w-5 mr-2" />
            GitHub
          </a>
          <a
            href="mailto:contato@easydev.com.br"
            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 rounded-xl text-white font-semibold text-sm shadow-lg hover:opacity-95 transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-xl"
            style={{ background: 'linear-gradient(135deg, #004aad, #00b09b)' }}
          >
            <FiMail className="h-5 w-5 mr-2" />
            Entre em Contato
          </a>
        </div>
        </div>
      </div>
      </div>
    </section>
  );
};

export default ProfileCard;
