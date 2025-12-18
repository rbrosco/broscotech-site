'use client';
import React from 'react';
import DashboardSidebar from '../../component/DashboardSidebar'; 
import DashboardNav from '../../component/DashboardNav';     

// Componente de placeholder para os cards de estatísticas
const StatCard = ({ title, value, icon, iconBgColor, change, changePeriod }: { title: string; value: string; icon: string; iconBgColor: string; change: string; changePeriod: string; }) => (
  <div className="w-full lg:w-6/12 xl:w-3/12 px-4">
    <div className="relative flex flex-col min-w-0 break-words bg-white rounded-lg mb-6 xl:mb-0 shadow-lg">
      <div className="flex-auto p-4">
        <div className="flex flex-wrap dark:text-gray-300">
          <div className="relative w-full pr-4 max-w-full flex-grow flex-1">
            <h5 className="text-blueGray-400 dark:text-gray-400 uppercase font-bold text-xs">{title}</h5>
            <span className="font-bold text-xl text-blueGray-700 dark:text-gray-100">{value}</span>
          </div>
          <div className="relative w-auto pl-4 flex-initial">
            <div className={`text-white p-3 text-center inline-flex items-center justify-center w-12 h-12 shadow-lg rounded-full ${iconBgColor}`}>
              <span>[{icon}]</span> {/* Placeholder para ícone */}
            </div>
          </div>
        </div>
        <p className="text-sm text-blueGray-500 dark:text-gray-400 mt-4">
          <span className={`${change.startsWith('+') ? 'text-emerald-500 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'} mr-2`}>
            <span>{change.startsWith('+') ? '↑' : '↓'}</span> {change.substring(1)}
          </span>
          <span className="whitespace-nowrap">{changePeriod}</span>
        </p>
      </div>
    </div>
  </div>
);

const DashboardPage: React.FC = () => {
  return (
    <div className="w-full relative flex ct-docs-disable-sidebar-content overflow-x-hidden bg-blueGray-100 dark:bg-gray-900 min-h-screen">
      <DashboardSidebar />
      <div className="relative md:ml-64 bg-blueGray-100 dark:bg-gray-900 w-full">
        <DashboardNav />
        {/* Header com fundo colorido */}
        <div className="relative pt-32 pb-32 bg-lightBlue-500 dark:bg-indigo-800"> {/* Ajuste a cor de fundo */}
          <div className="px-4 md:px-6 mx-auto w-full">
            <div>
              {/* Cards de Estatísticas */}
              <div className="flex flex-wrap">
                <StatCard title="Tráfego" value="350,897" icon="chart-bar" iconBgColor="bg-red-500" change="+3.48%" changePeriod="Desde o mês passado" />
                <StatCard title="Novos Usuários" value="2,356" icon="chart-pie" iconBgColor="bg-orange-500" change="-3.48%" changePeriod="Desde a semana passada" />
                <StatCard title="Vendas" value="924" icon="users" iconBgColor="bg-pink-500" change="-1.10%" changePeriod="Desde ontem" />
                <StatCard title="Performance" value="49,65%" icon="percent" iconBgColor="bg-lightBlue-500 dark:bg-blue-500" change="+12%" changePeriod="Desde o mês passado" />
              </div>
            </div>
          </div>
        </div>

        {/* Conteúdo Principal (Gráficos, Tabelas, etc.) */}
        <div className="px-4 md:px-6 mx-auto w-full -mt-24">
          <div className="flex flex-wrap">
            {/* Placeholder para Gráfico de Linha */}
            <div className="w-full xl:w-8/12 px-4 mb-8 ">
              <div className="relative flex flex-col min-w-0 break-words w-full shadow-lg rounded-lg bg-white dark:bg-gray-800">
                <div className="rounded-t mb-0 px-4 py-3 bg-transparent">
                  <div className="flex flex-wrap items-center">
                    <div className="relative w-full max-w-full flex-grow flex-1">
                      <h6 className="uppercase mb-1 text-xs font-semibold text-blueGray-400 dark:text-gray-400">Visão Geral</h6>
                      <h2 className="text-xl font-semibold text-white dark:text-gray-100">Valor das Vendas</h2>
                    </div>
                  </div>
                </div>
                <div className="p-4 flex-auto">
                  <div className="relative h-350-px bg-gray-300 dark:bg-gray-600 flex items-center justify-center"> {/* Placeholder para canvas */}
                    <p className="text-gray-500 dark:text-gray-400">Gráfico de Linha Aqui</p>
                  </div>
                </div>
              </div>
            </div>
            {/* Placeholder para Gráfico de Barra */}
            <div className="w-full xl:w-4/12 px-4 mb-8">
              <div className="relative flex flex-col min-w-0 break-words w-full shadow-lg rounded-lg bg-white dark:bg-gray-800">
                <div className="rounded-t mb-0 px-4 py-3 bg-transparent">
                  <div className="flex flex-wrap items-center">
                    <div className="relative w-full max-w-full flex-grow flex-1">
                      <h6 className="uppercase mb-1 text-xs font-semibold text-blueGray-500 dark:text-gray-400">Performance</h6>
                      <h2 className="text-xl font-semibold text-blueGray-700 dark:text-gray-100">Total de Pedidos</h2>
                    </div>
                  </div>
                </div>
                <div className="p-4 flex-auto">
                  <div className="relative h-350-px bg-gray-300 dark:bg-gray-600 flex items-center justify-center"> {/* Placeholder para canvas */}
                    <p className="text-gray-500 dark:text-gray-400">Gráfico de Barras Aqui</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Placeholder para Tabelas */}
          {/* Adicione aqui a estrutura para as tabelas "Page visits" e "Social traffic" se desejar */}

          {/* Footer do Dashboard */}
          <footer className="block py-4">
            <div className="container mx-auto px-4">
              <hr className="mb-4 border-b-1 border-gray-200 dark:border-gray-700" />
              <div className="flex flex-wrap items-center md:justify-between justify-center">
                <div className="w-full md:w-4/12 px-4">
                  <div className="text-center mb-2 md:text-left md:mb-0">
                    <a href="https://www.broscotech.com.br" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-500 dark:text-gray-400 font-semibold py-1 text-center md:text-left hover:underline">
                      Copyright © {new Date().getFullYear()} BROSCOTECH
                    </a>
                  </div>
                </div>
                {/* Links do footer (opcional) */}
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;