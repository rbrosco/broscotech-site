'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const DashboardSidebar: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Para controle mobile no futuro

  // Ícone de placeholder para Font Awesome
  const IconPlaceholder = ({ iconName, className }: { iconName: string; className?: string }) => (
    <span className={`mr-2 text-sm ${className || 'text-blueGray-400 dark:text-gray-500'}`}>[{iconName}]</span>
  );

  return (
    <nav className="block py-4 px-6 top-0 bottom-0 w-64 bg-white shadow-xl left-0 absolute flex-row flex-nowrap md:z-10 z-9999 transition-all duration-300 ease-in-out transform md:translate-x-0 -translate-x-full dark:bg-gray-800">
      {/* Botão de toggle para mobile (funcionalidade a ser implementada se necessário) */}
      <button
        className="md:hidden flex items-center justify-center cursor-pointer text-blueGray-700 w-6 h-10 border-l-0 border-r border-t border-b border-solid border-blueGray-100 text-xl leading-none bg-white rounded-r border border-solid border-transparent absolute top-1/2 -right-24-px focus:outline-none z-9998"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        {/* Substituir por um ícone de menu real se desejar */}
        <IconPlaceholder iconName="ellipsis-v" />
      </button>

      <div className="flex-col min-h-full px-0 flex flex-wrap items-center justify-between w-full mx-auto overflow-y-auto overflow-x-hidden">
        <div className="flex bg-white dark:bg-gray-800 flex-col items-stretch opacity-100 relative mt-4 overflow-y-auto overflow-x-hidden h-auto z-40 items-center flex-1 rounded w-full">
          {/* Logo e Nome */}
          <Link href="/dashboard" className="md:flex items-center flex-col text-center md:pb-2 text-blueGray-700 dark:text-gray-100 mr-0 inline-flex whitespace-nowrap text-sm uppercase font-bold p-4 px-0">
            <Image
              src="/images/BROSCOTECHLOGO.png" // Seu logo
              alt="BROSCOTECH Logo"
              width={48} // Ajuste o tamanho
              height={48}
              className="max-w-full rounded dark:brightness-90 dark:contrast-125" // Ajuste para melhor visualização do logo no escuro
            />
            <span className="mt-2 text-lg text-gray-700 dark:text-white">BROSCOTECH</span>
          </Link>

          {/* Links de Navegação */}
          <div className="md:flex-col md:min-w-full flex flex-col list-none mt-6">
            <hr className="my-4 md:min-w-full dark:border-gray-700" />
            <h6 className="md:min-w-full text-blueGray-500 dark:text-gray-500 text-xs uppercase font-bold block pt-1 pb-4 no-underline">
              Admin Layout Pages
            </h6>
            <Link href="/dashboard" className="text-xs uppercase py-3 font-bold block text-blueGray-700 hover:text-blueGray-500 dark:text-gray-300 dark:hover:text-gray-100">
              <IconPlaceholder iconName="tv" />
              Dashboard
            </Link>
            <Link href="/dashboard/settings" className="text-xs uppercase py-3 font-bold block text-blueGray-700 hover:text-blueGray-500 dark:text-gray-300 dark:hover:text-gray-100">
              <IconPlaceholder iconName="tools" />
              Configurações
            </Link>
            <Link href="/dashboard/tables" className="text-xs uppercase py-3 font-bold block text-blueGray-700 hover:text-blueGray-500 dark:text-gray-300 dark:hover:text-gray-100">
              <IconPlaceholder iconName="table" />
              Tabelas
            </Link>
            <Link href="/dashboard/maps" className="text-xs uppercase py-3 font-bold block text-blueGray-700 hover:text-blueGray-500 dark:text-gray-300 dark:hover:text-gray-100">
              <IconPlaceholder iconName="map-marked" />
              Mapas
            </Link>
            {/* Adicione mais seções e links conforme o exemplo */}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default DashboardSidebar;