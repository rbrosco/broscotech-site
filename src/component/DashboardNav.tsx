'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from './Header'; // Importando o Header

const DashboardNav: React.FC = () => {
  
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  // Mock user data - substitua pela lógica de autenticação real
  const userData = {
    avatar: '/images/Perfil_Rogger.png', // Seu avatar ou placeholder
  };

  // Ícone de placeholder para Font Awesome
  const IconPlaceholder = ({ iconName, className }: { iconName: string; className?: string }) => (
    <span className={`mr-2 text-sm ${className || 'text-blueGray-400 dark:text-gray-500'}`}>[{iconName}]</span>
  );

  return (
    <>
      <Header /> {/* Renderizando o Header aqui */}
      <nav className="absolute top-0 left-0 w-full z-10 bg-transparent md:flex-row md:flex-nowrap md:justify-start flex items-center p-4 mt-[var(--header-height,50px)]"> {/* Adicionado mt para não sobrepor o Header fixo */}
        <div className="w-full mx-auto items-center flex justify-between md:flex-nowrap flex-wrap md:px-10 px-4">
          <Link href="/dashboard" className="text-white dark:text-gray-100 text-sm uppercase hidden lg:inline-block font-semibold">
            Dashboard
          </Link>
          {/* Formulário de busca (opcional) */}
          <form className="md:flex hidden flex-row flex-wrap items-center lg:ml-auto mr-3">
            <div className="relative flex w-full flex-wrap items-stretch">
              <span className="z-10 h-full leading-snug font-normal absolute text-center text-blueGray-300 dark:text-gray-500 bg-transparent rounded text-base items-center justify-center w-8 pl-3 py-3">
                <IconPlaceholder iconName="search" />
              </span>
              <input
                type="text"
                placeholder="Buscar aqui..."
                className="border-0 px-3 py-3 placeholder-blueGray-300 dark:placeholder-gray-500 text-blueGray-600 dark:text-gray-200 relative bg-white dark:bg-gray-700 rounded text-sm shadow outline-none focus:outline-none focus:ring w-full pl-10"
              />
            </div>
          </form>
          {/* Menu do Usuário */}
          <ul className="flex-col md:flex-row list-none items-center hidden md:flex">
            <li className="relative">
              <button onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)} className="text-blueGray-500 dark:text-gray-400 block">
                <div className="items-center flex">
                  <span className="w-12 h-12 text-sm text-white bg-blueGray-200 inline-flex items-center justify-center rounded-full">
                    <Image
                      alt="User Avatar"
                      className="w-full rounded-full align-middle border-none shadow-lg"
                      src={userData.avatar}
                      width={48}
                      height={48}
                    />
                  </span>
                </div>
              </button>
              {/* Dropdown (funcionalidade a ser implementada se necessário) */}
              <div className={`${isUserDropdownOpen ? 'block' : 'hidden'} bg-white dark:bg-gray-800 text-base z-50 float-left py-2 list-none text-left rounded shadow-lg min-w-48 absolute right-0 mt-2`}>
                <Link href="/perfil" className="text-sm py-2 px-4 font-normal block w-full whitespace-nowrap bg-transparent text-blueGray-700 dark:text-gray-200 hover:bg-blueGray-100 dark:hover:bg-gray-700">Perfil</Link>
                <div className="h-0 my-2 border border-solid border-blueGray-100 dark:border-gray-700"></div>
                <button className="text-sm py-2 px-4 font-normal block w-full whitespace-nowrap bg-transparent text-blueGray-700 dark:text-gray-200 hover:bg-blueGray-100 dark:hover:bg-gray-700 text-left">Sair</button>
              </div>
            </li>
          </ul>
        </div>
      </nav>
    </>
  );
};

export default DashboardNav;