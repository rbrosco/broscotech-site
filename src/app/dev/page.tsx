'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import DevSidebar from '../../component/DevSidebar';
import DashboardNav from '../../component/DashboardNav';
import {
  FiFolder, FiTrendingUp, FiCheckCircle, FiClock,
  FiUsers, FiMessageSquare, FiArrowRight, FiAlertCircle,
  FiActivity,
} from 'react-icons/fi';

type Project = {
  id: number;
  title: string;
  status: string | null;
  progress: number | null;
  client_name: string | null;
  client_email: string | null;
  project_type: string | null;
  updated_at: string | null;
  admin_status: string | null;
};

type ProjectWithUpdates = {
  project: Project;
  updates: { id: number; kind: string; message: string; created_at: string }[];
};

const STATUS_COLOR: Record<string, string> = {
  'Em planejamento': '#6366f1',
  'Em andamento': '#00b09b',
  'Concluído': '#22c55e',
  'Pausado': '#f59e0b',
  'Cancelado': '#ef4444',
};

function timeAgo(iso: string | null) {
  if (!iso) return '—';
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'agora';
  if (m < 60) return `${m}m atrás`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h atrás`;
  const d = Math.floor(h / 24);
  return `${d}d atrás`;
}

export default function DevPage() {
  const [data, setData] = useState<ProjectWithUpdates[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const me = await fetch('/api/me', { credentials: 'include' });
        if (!me.ok) { setError('Não autenticado.'); setLoading(false); return; }
        const meData = await me.json() as { role?: string };
        if (meData.role !== 'admin') { setError('Acesso restrito.'); setLoading(false); return; }
        setIsAdmin(true);

        const res = await fetch('/api/projects', { credentials: 'include' });
        if (res.ok) {
          const payload = await res.json();
          const list: ProjectWithUpdates[] = Array.isArray(payload.projects) 
            ? payload.projects.map((p: any) => ({
                project: {
                  id: p.id,
                  title: p.title,
                  status: p.status,
                  progress: p.progress,
                  client_name: p.client_name,
                  client_email: p.client_email,
                  project_type: p.project_type,
                  updated_at: p.updated_at,
                  admin_status: p.admin_status
                },
                updates: p.updates || []
              }))
            : [];
          setData(list);
        }
      } catch { setError('Erro ao carregar dados.'); }
      setLoading(false);
    })();
  }, []);

  const projects = data.map(d => d.project);
  const total = projects.length;
  const inProgress = projects.filter(p => p.status === 'Em andamento').length;
  const done = projects.filter(p => p.status === 'Concluído').length;
  const clients = new Set(projects.map(p => p.client_email).filter(Boolean)).size;
  const recentUpdates = data
    .flatMap(d => d.updates.map(u => ({ ...u, projectTitle: d.project.title })))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 6);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#080c18]">
        <DevSidebar />
        <div className="md:pl-sidebar transition-[padding] duration-300 flex items-center justify-center min-h-screen">
          <div className="w-6 h-6 rounded-full border-2 animate-spin" style={{ borderColor: '#00b09b', borderTopColor: 'transparent' }} />
        </div>
      </div>
    );
  }

  if (!isAdmin || error) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#080c18]">
        <DevSidebar />
        <div className="md:pl-sidebar transition-[padding] duration-300 flex items-center justify-center min-h-screen">
          <div className="text-center bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 p-8 rounded-3xl shadow-xl">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 bg-red-50 dark:bg-red-500/10">
              <FiAlertCircle className="w-8 h-8 text-red-500 dark:text-red-400" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-900 dark:text-white">{error ?? 'Acesso restrito'}</h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#080c18]">
      <DevSidebar />
      <div className="md:pl-sidebar transition-[padding] duration-300 flex flex-col min-h-screen">
        <DashboardNav />

        <main className="flex-1 px-4 md:px-8 pt-[65px] pb-8">
          {/* Header */}
          <div
            className="relative overflow-hidden rounded-3xl mt-4 px-8 py-8 bg-white dark:bg-transparent bg-gradient-to-br from-indigo-50 via-cyan-50 to-emerald-50 dark:from-indigo-600/10 dark:via-cyan-500/5 dark:to-emerald-500/10 border border-slate-200 dark:border-white/5 shadow-xl dark:shadow-2xl group"
          >
            <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-cyan-500/20 blur-[80px] pointer-events-none group-hover:bg-cyan-400/20 transition-colors duration-700" />
            <div className="absolute -bottom-20 left-20 w-72 h-72 rounded-full bg-indigo-500/20 blur-[80px] pointer-events-none group-hover:bg-indigo-400/20 transition-colors duration-700" />
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-cyan-100 dark:bg-cyan-500/10 border border-cyan-200 dark:border-cyan-500/20">
                <FiActivity className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Painel do Desenvolvedor</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Visão geral de todos os projetos e clientes</p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5">
            {[
              { label: 'Total de Projetos', value: total, icon: FiFolder, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-500/10' },
              { label: 'Em Andamento', value: inProgress, icon: FiTrendingUp, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
              { label: 'Concluídos', value: done, icon: FiCheckCircle, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-500/10' },
              { label: 'Clientes', value: clients, icon: FiUsers, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10' },
            ].map(({ label, value, icon: Icon, color, bg }) => (
              <div key={label} className="rounded-2xl px-5 py-5 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-md">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${bg}`}>
                  <Icon className={`w-4 h-4 ${color}`} />
                </div>
                <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-900 dark:text-white">{value}</p>
                <p className="text-xs mt-0.5 text-slate-500 dark:text-slate-400">{label}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Projects list */}
            <div className="lg:col-span-2 rounded-2xl overflow-hidden bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-md">
              <div className="px-6 py-4 flex items-center justify-between border-b border-slate-200 dark:border-white/5">
                <div className="flex items-center gap-2">
                  <FiFolder className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                  <h2 className="text-sm font-bold text-slate-900 dark:text-slate-900 dark:text-white">Todos os Projetos</h2>
                </div>
                <Link href="/dev/kanban" className="text-xs font-semibold flex items-center gap-1 transition text-cyan-600 dark:text-cyan-400 hover:opacity-70">
                  Gerenciar <FiArrowRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-white/5">
                {projects.length === 0 && (
                  <div className="py-12 flex flex-col items-center gap-2">
                    <FiFolder className="w-8 h-8 text-slate-300 dark:text-white/10" />
                    <p className="text-sm text-slate-400 dark:text-white/30">Nenhum projeto cadastrado</p>
                  </div>
                )}
                {projects.map(p => (
                  <div key={p.id} className="px-6 py-4 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold text-slate-900 dark:text-white bg-gradient-to-br from-indigo-500 to-cyan-500">
                      {p.title[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-900 dark:text-white truncate">{p.title}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {p.client_name || p.client_email || 'Sem cliente'} · {p.project_type || 'Tipo não definido'}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="w-24 h-1.5 rounded-full overflow-hidden bg-slate-100 dark:bg-white/10">
                        <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500" style={{ width: `${p.progress ?? 0}%` }} />
                      </div>
                      <span className="text-xs font-semibold w-8 text-right text-slate-500 dark:text-slate-400">{p.progress ?? 0}%</span>
                      <span
                        className="text-[10px] font-bold px-2.5 py-1 rounded-full"
                        style={{
                          background: `${STATUS_COLOR[p.status ?? ''] ?? '#475569'}15`,
                          color: STATUS_COLOR[p.status ?? ''] ?? '#64748b',
                          border: `1px solid ${STATUS_COLOR[p.status ?? ''] ?? '#475569'}30`,
                        }}
                      >
                        {p.status ?? '—'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent updates */}
            <div className="rounded-2xl overflow-hidden bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-md">
              <div className="px-5 py-4 flex items-center justify-between border-b border-slate-200 dark:border-white/5">
                <div className="flex items-center gap-2">
                  <FiMessageSquare className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                  <h2 className="text-sm font-bold text-slate-900 dark:text-slate-900 dark:text-white">Atividade Recente</h2>
                </div>
                <Link href="/dev/comunicacao" className="text-xs font-semibold flex items-center gap-1 transition text-cyan-600 dark:text-cyan-400 hover:opacity-70">
                  Ver tudo <FiArrowRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="p-3 flex flex-col gap-1">
                {recentUpdates.length === 0 && (
                  <div className="py-8 flex flex-col items-center gap-2">
                    <FiClock className="w-6 h-6 text-slate-300 dark:text-white/10" />
                    <p className="text-xs text-center text-slate-400 dark:text-white/30">Sem atividade recente</p>
                  </div>
                )}
                {recentUpdates.map(u => {
                  let displayText = u.message;
                  if (u.message && u.message.startsWith('{')) {
                    try {
                      const parsed = JSON.parse(u.message);
                      if (parsed.texto) displayText = parsed.texto;
                    } catch {}
                  }

                  return (
                    <div key={u.id} className="px-3 py-3 rounded-xl bg-slate-50 dark:bg-white/5">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold truncate text-cyan-600 dark:text-cyan-400">{u.projectTitle}</span>
                        <span className="text-[10px] ml-auto shrink-0 text-slate-400 dark:text-white/30">{timeAgo(u.created_at)}</span>
                      </div>
                      <p className="text-xs leading-relaxed line-clamp-2 text-slate-600 dark:text-white/70">{displayText}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Quick access */}
          <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { href: '/dev/kanban', label: 'Gerenciar Kanban', desc: 'Controle o board de qualquer projeto', icon: FiActivity, color: 'text-cyan-600 dark:text-cyan-400', bg: 'bg-cyan-50 dark:bg-cyan-500/10' },
              { href: '/dev/comunicacao', label: 'Comunicação', desc: 'Envie atualizações para os clientes', icon: FiMessageSquare, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-500/10' },
              { href: '/dev/clientes', label: 'Clientes', desc: 'Lista completa de clientes e projetos', icon: FiUsers, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10' },
            ].map(({ href, label, desc, icon: Icon, color, bg }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-4 px-5 py-4 rounded-2xl transition hover:scale-[1.01] bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-md"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${bg}`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900 dark:text-slate-900 dark:text-white">{label}</p>
                  <p className="text-xs mt-0.5 text-slate-500 dark:text-slate-400">{desc}</p>
                </div>
                <FiArrowRight className="w-4 h-4 shrink-0 text-slate-300 dark:text-white/20" />
              </Link>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
