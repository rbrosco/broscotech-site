'use client';
import React from "react";

interface Depoimento {
  texto: string;
  autor: string;
  cargo: string;
}

const depoimentos: Depoimento[] = [
  {
    texto: 'O serviço foi excelente, superou todas as expectativas! Recomendo muito.',
    autor: 'João Silva',
    cargo: 'CEO da StartupX',
  },
  {
    texto: 'Atendimento rápido, solução eficiente e design impecável. Voltarei a contratar!',
    autor: 'Maria Oliveira',
    cargo: 'Gerente de Projetos',
  },
  {
    texto: 'A automação implementada facilitou muito nosso dia a dia. Equipe muito competente.',
    autor: 'Carlos Souza',
    cargo: 'Diretor de TI',
  },
];

export default function DepoimentoPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8 bg-white/90 dark:bg-slate-800 rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-bold text-center text-slate-900 dark:text-white mb-6">Depoimentos</h1>
        <div className="space-y-6">
          {depoimentos.map((dep, idx) => (
            <div key={idx} className="bg-slate-100 dark:bg-slate-700 rounded-xl p-6 shadow">
              <p className="text-lg text-slate-800 dark:text-white mb-2">“{dep.texto}”</p>
              <span className="block text-sm text-slate-500 dark:text-slate-300">— {dep.autor}{dep.cargo ? `, ${dep.cargo}` : ''}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
