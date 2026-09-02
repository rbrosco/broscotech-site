'use client';
import React from 'react';
import DashboardNav from '@/component/DashboardNav';
import DevSidebar from '@/component/DevSidebar';
import PlanosManagement from './PlanosManagement';
import { FiCreditCard } from 'react-icons/fi';

export default function DevPlanosPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#040d1a] text-slate-900 dark:text-slate-200 selection:bg-cyan-500/30">
      <DevSidebar />
      <div className="md:pl-sidebar transition-[padding] duration-300 flex flex-col min-h-screen">
        <DashboardNav />

        <main className="flex-1 px-4 md:px-8 pt-[70px] pb-12">
          {/* Header */}
          <div className="relative overflow-hidden rounded-[2rem] mt-4 px-7 py-7 bg-white/90 dark:bg-[#071324]/90 border border-black/10 dark:border-white/10 shadow-2xl backdrop-blur-2xl">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-pixel text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-500 dark:bg-cyan-400/20 dark:text-cyan-300 border border-cyan-500/30 uppercase">
                EASYDEV DEV CORE
              </span>
              <span className="text-xs font-semibold text-slate-400">•</span>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <FiCreditCard className="w-3.5 h-3.5" /> Planos
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Planos do Site
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Controle o que aparece na seção de Planos da página inicial. Deixe o campo de preço em branco
              para exibir &quot;Sob consulta&quot; publicamente.
            </p>
          </div>

          <div className="mt-6 rounded-[2rem] px-6 sm:px-7 py-6 bg-white/80 dark:bg-[#071324]/85 border border-slate-200 dark:border-white/10 shadow-xl backdrop-blur-2xl">
            <PlanosManagement />
          </div>
        </main>
      </div>
    </div>
  );
}
