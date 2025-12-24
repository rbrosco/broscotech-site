'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiHome, FiFolder, FiCalendar, FiFileText } from 'react-icons/fi';

const DashboardSidebar: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Para controle mobile no futuro

  return (
    <nav className="block py-6 px-4 top-0 bottom-0 w-64 bg-gradient-to-b from-blue-600 via-blue-700 to-blue-900 shadow-2xl left-0 absolute flex-row flex-nowrap md:z-10 z-50 transition-all duration-300 ease-in-out transform md:translate-x-0 -translate-x-full dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 rounded-r-3xl">
      {/* Botão de toggle para mobile (funcionalidade a ser implementada se necessário) */}
      <button
        className="md:hidden flex items-center justify-center cursor-pointer text-blueGray-700 w-6 h-10 border-l-0 border-r border-t border-b border-solid border-blueGray-100 text-xl leading-none bg-white rounded-r border border-solid border-transparent absolute top-1/2 -right-24-px focus:outline-none z-9998"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        <span aria-hidden="true">≡</span>
      </button>

      <div className="flex-col min-h-full px-0 flex flex-wrap items-center justify-between w-full mx-auto overflow-y-auto overflow-x-hidden">
        <div className="flex bg-transparent flex-col items-stretch opacity-100 relative mt-4 overflow-y-auto overflow-x-hidden h-auto z-40 items-center flex-1 rounded-2xl w-full">
          {/* Logo e Nome */}
          <Link href="/dashboard" className="md:flex items-center flex-col text-center md:pb-2 text-slate-900 dark:text-white dark:text-white mr-0 inline-flex whitespace-nowrap text-sm uppercase font-bold p-4 px-0 hover:scale-105 transition-transform">
            <Image
              src="/images/EASYDEVLOGO.png"
              alt="Logo"
              width={56}
              height={56}
              className="max-w-full rounded-full shadow-lg border-4 border-white dark:border-gray-700 bg-white dark:bg-gray-900"
            />
            <span className="mt-3 text-xl tracking-widest font-extrabold drop-shadow-lg"></span>
          </Link>

          {/* Links de Navegação */}
          <div className="md:flex-col md:min-w-full flex flex-col list-none mt-8 gap-2">
            <hr className="my-4 md:min-w-full border-blue-800 dark:border-gray-700" />
            <h6 className="md:min-w-full text-blue-200 dark:text-gray-400 text-xs uppercase font-bold block pt-1 pb-4 tracking-widest">
              Área do Cliente
            </h6>
            <Link href="/dashboard" className="flex items-center gap-3 text-sm uppercase py-3 px-4 font-bold rounded-xl transition-all duration-200 text-slate-900 dark:text-white hover:bg-blue-800/80 dark:hover:bg-gray-700">
              <FiHome className="w-5 h-5" />
              Dashboard
            </Link>
            <Link href="/dashboard/projeto" className="flex items-center gap-3 text-sm uppercase py-3 px-4 font-bold rounded-xl transition-all duration-200 text-slate-900 dark:text-white hover:bg-blue-800/80 dark:hover:bg-gray-700">
              <FiFolder className="w-5 h-5" />
              Seu Projeto
            </Link>
            <Link href="/dashboard/planejamento" className="flex items-center gap-3 text-sm uppercase py-3 px-4 font-bold rounded-xl transition-all duration-200 text-slate-900 dark:text-white hover:bg-blue-800/80 dark:hover:bg-gray-700">
              <FiCalendar className="w-5 h-5" />
              Planejamento
            </Link>
            <Link href="/dashboard/faturas" className="flex items-center gap-3 text-sm uppercase py-3 px-4 font-bold rounded-xl transition-all duration-200 text-slate-900 dark:text-white hover:bg-blue-800/80 dark:hover:bg-gray-700">
              <FiFileText className="w-5 h-5" />
              Faturas
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default DashboardSidebar;