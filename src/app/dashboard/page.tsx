'use client';
import React, { useEffect, useMemo, useState } from 'react';
import DashboardSidebar from '../../component/DashboardSidebar'; 
import DashboardNav from '../../component/DashboardNav';     
import { FiActivity, FiAlertCircle, FiCheckCircle, FiClock, FiTrendingUp } from 'react-icons/fi';

type Project = {
  id: number;
  title: string;
  status: string;
  progress: number;
  updated_at: string;
} | null;

type ProjectUpdate = {
  id: number;
  kind: string;
  message: string;
  created_at: string;
};

type UserData = {
  id: number;
  name: string;
  login: string;
  email: string;
};

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
  const [user, setUser] = useState<UserData | null>(null);
  const [project, setProject] = useState<Project>(null);
  const [updates, setUpdates] = useState<ProjectUpdate[]>([]);
  const [loadingProject, setLoadingProject] = useState(true);
  const [projectError, setProjectError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('userData');
      if (raw) setUser(JSON.parse(raw) as UserData);
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      if (!user?.id) {
        setLoadingProject(false);
        return;
      }

      setLoadingProject(true);
      setProjectError(null);
      try {
        const res = await fetch(`/api/projects?userId=${encodeURIComponent(String(user.id))}`);
        const data = (await res.json()) as { project?: Project; updates?: ProjectUpdate[]; message?: string };
        if (!res.ok) throw new Error(data.message || 'Falha ao carregar projeto.');
        setProject(data.project ?? null);
        setUpdates(Array.isArray(data.updates) ? data.updates : []);
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Erro desconhecido.';
        setProjectError(msg);
      } finally {
        setLoadingProject(false);
      }
    };

    void load();
  }, [user?.id]);

  const statusBadge = useMemo(() => {
    const status = project?.status || '—';
    const base = 'inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold border';

    if (status.toLowerCase().includes('planej')) {
      return { className: `${base} bg-white/10 border-white/15 text-white`, Icon: FiClock, label: status };
    }
    if (status.toLowerCase().includes('and')) {
      return { className: `${base} bg-emerald-500/15 border-emerald-500/30 text-emerald-100`, Icon: FiActivity, label: status };
    }
    if (status.toLowerCase().includes('concl')) {
      return { className: `${base} bg-blue-500/15 border-blue-500/30 text-blue-100`, Icon: FiCheckCircle, label: status };
    }

    return { className: `${base} bg-white/10 border-white/15 text-white`, Icon: FiTrendingUp, label: status };
  }, [project?.status]);

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

        {/* Conteúdo Principal (Status do Projeto) */}
        <div className="px-4 md:px-6 mx-auto w-full -mt-24">
          <div className="mb-8">
            <div className="rounded-3xl bg-white/90 dark:bg-gray-800/80 backdrop-blur-md border border-white/20 dark:border-gray-700/50 shadow-2xl p-5 sm:p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">Dashboard do cliente</p>
                  <h1 className="mt-1 text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white">
                    {user?.name ? `Olá, ${user.name}` : 'Olá'}
                  </h1>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                    Acompanhe o status do seu projeto e as últimas atualizações.
                  </p>
                </div>
                <div>
                  <span className={statusBadge.className}>
                    <statusBadge.Icon className="h-4 w-4" aria-hidden="true" />
                    {statusBadge.label}
                  </span>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="rounded-2xl bg-slate-50 dark:bg-gray-900/40 border border-slate-200 dark:border-gray-700 p-4">
                  <p className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">Projeto</p>
                  <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">
                    {loadingProject ? 'Carregando…' : project?.title || 'Nenhum projeto ainda'}
                  </p>
                  <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                    {project?.updated_at ? `Atualizado em ${new Date(project.updated_at).toLocaleString()}` : ''}
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 dark:bg-gray-900/40 border border-slate-200 dark:border-gray-700 p-4">
                  <p className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">Progresso</p>
                  <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">
                    {loadingProject ? '—' : `${Math.max(0, Math.min(100, project?.progress ?? 0))}%`}
                  </p>
                  <div className="mt-3 h-2 rounded-full bg-slate-200 dark:bg-gray-700 overflow-hidden">
                    <div
                      className="h-full bg-blue-600 dark:bg-blue-500"
                      style={{ width: `${Math.max(0, Math.min(100, project?.progress ?? 0))}%` }}
                    />
                  </div>
                </div>

                <div className="rounded-2xl bg-slate-50 dark:bg-gray-900/40 border border-slate-200 dark:border-gray-700 p-4">
                  <p className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">Ação rápida</p>
                  <a
                    href="/iaagent"
                    className="mt-2 inline-flex w-full items-center justify-center rounded-xl bg-blue-600 text-white px-4 py-2.5 font-semibold hover:bg-blue-700 transition"
                  >
                    Atualizar briefing no IA Agent
                  </a>
                  <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">
                    Use o agente para detalhar requisitos e acelerar as próximas etapas.
                  </p>
                </div>
              </div>

              {projectError && (
                <div className="mt-5 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-amber-100">
                  <div className="flex items-start gap-2">
                    <FiAlertCircle className="h-5 w-5 mt-0.5" aria-hidden="true" />
                    <div>
                      <p className="text-sm font-semibold">Banco de dados não configurado</p>
                      <p className="mt-1 text-xs text-amber-100/90">{projectError}</p>
                      <p className="mt-2 text-xs text-amber-100/90">
                        Rode o schema em `scripts/schema.sql` e configure `DATABASE_URL`.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {!loadingProject && !projectError && project && (
                <div className="mt-5">
                  <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Últimas atualizações</h2>
                  {updates.length === 0 ? (
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                      Ainda não há atualizações. Em breve você verá tudo por aqui.
                    </p>
                  ) : (
                    <div className="mt-3 space-y-2">
                      {updates.map((u) => (
                        <div key={u.id} className="rounded-2xl bg-slate-50 dark:bg-gray-900/40 border border-slate-200 dark:border-gray-700 p-4">
                          <p className="text-xs text-slate-500 dark:text-slate-400">{new Date(u.created_at).toLocaleString()}</p>
                          <p className="mt-1 text-sm text-slate-900 dark:text-white whitespace-pre-wrap">{u.message}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

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