'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import DevSidebar from '../../component/DevSidebar';
import DashboardNav from '../../component/DashboardNav';
import {
  FiFolder,
  FiTrendingUp,
  FiCheckCircle,
  FiClock,
  FiUsers,
  FiMessageSquare,
  FiArrowRight,
  FiAlertCircle,
  FiActivity,
  FiCpu,
  FiServer,
  FiZap,
  FiLayers,
  FiCode,
  FiShield,
  FiDollarSign,
  FiDatabase,
} from 'react-icons/fi';
import {
  SiNextdotjs,
  SiPostgresql,
  SiN8N,
  SiTypescript,
  SiTailwindcss,
  SiDocker,
} from 'react-icons/si';

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
  const [filterQuery, setFilterQuery] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const me = await fetch('/api/me', { credentials: 'include' });
        if (!me.ok) {
          setError('Não autenticado.');
          setLoading(false);
          return;
        }
        const meData = (await me.json()) as { role?: string };
        if (meData.role !== 'admin') {
          setError('Acesso restrito a desenvolvedores da EasyDev.');
          setLoading(false);
          return;
        }
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
                  admin_status: p.admin_status,
                },
                updates: p.updates || [],
              }))
            : [];
          setData(list);
        }
      } catch {
        setError('Erro ao carregar dados do painel.');
      }
      setLoading(false);
    })();
  }, []);

  const projects = data.map((d) => d.project);
  const total = projects.length;
  const inProgress = projects.filter((p) => p.status === 'Em andamento').length;
  const done = projects.filter((p) => p.status === 'Concluído').length;
  const clients = new Set(projects.map((p) => p.client_email).filter(Boolean)).size;
  const recentUpdates = data
    .flatMap((d) => d.updates.map((u) => ({ ...u, projectTitle: d.project.title })))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 6);

  const filteredProjects = projects.filter((p) => {
    if (!filterQuery) return true;
    const q = filterQuery.toLowerCase();
    return (
      p.title.toLowerCase().includes(q) ||
      (p.client_name && p.client_name.toLowerCase().includes(q)) ||
      (p.client_email && p.client_email.toLowerCase().includes(q)) ||
      (p.project_type && p.project_type.toLowerCase().includes(q))
    );
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#071324] flex items-center justify-center">
        <DevSidebar />
        <div className="w-8 h-8 rounded-full border-[3px] animate-spin border-[var(--color-accent)] border-t-transparent shadow-lg" />
      </div>
    );
  }

  if (!isAdmin || error) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#071324] flex items-center justify-center p-4">
        <DevSidebar />
        <div className="text-center bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 p-8 rounded-3xl shadow-xl max-w-md">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 bg-red-50 dark:bg-red-500/10 border border-red-500/20">
            <FiAlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">{error ?? 'Acesso Restrito'}</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Esta área é exclusiva para a equipe técnica da EasyDev.</p>
          <Link
            href="/dashboard"
            className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs text-white"
            style={{ background: 'linear-gradient(135deg, #004aad, #00b09b)' }}
          >
            Voltar ao Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#040d1a] text-slate-900 dark:text-slate-200 selection:bg-cyan-500/30">
      <DevSidebar />
      <div className="md:pl-sidebar transition-[padding] duration-300 flex flex-col min-h-screen">
        <DashboardNav />

        <main className="flex-1 px-4 md:px-8 pt-[70px] pb-12">
          {/* Cyber Command Header */}
          <div className="relative overflow-hidden rounded-[2rem] mt-4 px-7 sm:px-9 py-8 bg-white/90 dark:bg-[#071324]/90 border border-black/10 dark:border-white/10 shadow-2xl backdrop-blur-2xl group">
            <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-cyan-500/20 blur-[90px] pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-indigo-500/20 blur-[90px] pointer-events-none" />

            <div className="relative flex flex-wrap items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg shrink-0"
                  style={{ background: 'linear-gradient(135deg, #004aad, #00b09b)' }}
                >
                  <FiActivity className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-pixel text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-500 dark:bg-cyan-400/20 dark:text-cyan-300 border border-cyan-500/30 uppercase">
                      EASYDEV DEV CORE
                    </span>
                    <span className="text-xs font-semibold text-slate-400">•</span>
                    <span className="text-xs font-semibold text-emerald-500 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Servidores 100% Operacionais
                    </span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                    Painel do Desenvolvedor & Hub de Operações
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Gerencie todos os projetos, clientes, faturas e orquestração de automações em tempo real.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <Link
                  href="/dev/kanban"
                  className="px-4 py-2.5 rounded-xl font-bold text-xs text-white shadow-md transition-all hover:scale-105 flex items-center gap-2"
                  style={{ background: 'linear-gradient(135deg, #004aad, #00b09b)' }}
                >
                  <FiLayers className="w-4 h-4" />
                  Quadro Geral Kanban
                </Link>
                <Link
                  href="/dev/ia-monitor"
                  className="px-4 py-2.5 rounded-xl font-semibold text-xs border border-black/10 bg-white/80 dark:border-white/15 dark:bg-white/10 text-slate-800 dark:text-white hover:bg-white dark:hover:bg-white/15 transition-all flex items-center gap-2 shadow-sm"
                >
                  <FiCpu className="w-4 h-4 text-[var(--color-accent)]" />
                  Monitor de IA
                </Link>
              </div>
            </div>
          </div>

          {/* Core Tech Stack Capabilities Bar (Tecnologias que vendemos) */}
          <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { name: 'Next.js 15 & React 19', tag: 'Frontend & SSR', icon: SiNextdotjs, status: 'Online' },
              { name: 'PostgreSQL & TypeORM', tag: 'Database Pool', icon: SiPostgresql, status: 'Connected' },
              { name: 'n8n Workflows', tag: 'Automação 24/7', icon: SiN8N, status: 'Active' },
              { name: 'Groq & OpenAI Gateway', tag: 'Agentes IA', icon: FiCpu, status: 'Ready' },
              { name: 'TypeScript Strict', tag: 'Zero Type Errors', icon: SiTypescript, status: 'Enforced' },
              { name: 'Docker Microservices', tag: 'Cloud Deploy', icon: SiDocker, status: 'Healthy' },
            ].map((tech, idx) => {
              const TechIcon = tech.icon;
              return (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 backdrop-blur-md flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-2">
                    <TechIcon className="w-5 h-5 text-[var(--color-accent)]" />
                    <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                      {tech.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{tech.name}</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">{tech.tag}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5">
            {[
              {
                label: 'Total de Projetos',
                value: total,
                icon: FiFolder,
                color: 'text-indigo-500',
                bg: 'bg-indigo-500/10 border-indigo-500/20',
              },
              {
                label: 'Em Andamento',
                value: inProgress,
                icon: FiTrendingUp,
                color: 'text-[var(--color-accent)]',
                bg: 'bg-[var(--color-accent-dim)] border-[var(--color-accent)]/20',
              },
              {
                label: 'Entregas Concluídas',
                value: done,
                icon: FiCheckCircle,
                color: 'text-emerald-500',
                bg: 'bg-emerald-500/10 border-emerald-500/20',
              },
              {
                label: 'Clientes Ativos',
                value: clients,
                icon: FiUsers,
                color: 'text-amber-500',
                bg: 'bg-amber-500/10 border-amber-500/20',
              },
            ].map(({ label, value, icon: Icon, color, bg }) => (
              <div
                key={label}
                className="rounded-2xl p-5 bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-sm backdrop-blur-xl flex items-center justify-between"
              >
                <div>
                  <p className="text-3xl font-black text-slate-900 dark:text-white tabular-nums tracking-tight">
                    {value}
                  </p>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mt-1">
                    {label}
                  </p>
                </div>
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center border shrink-0 ${bg}`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
              </div>
            ))}
          </div>

          {/* Main Grid: Projects List + Live Feed */}
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Projects List */}
            <div className="lg:col-span-2 rounded-[2rem] overflow-hidden bg-white/80 dark:bg-[#071324]/90 border border-slate-200 dark:border-white/10 shadow-xl backdrop-blur-2xl flex flex-col">
              <div className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-white/10">
                <div className="flex items-center gap-2">
                  <FiFolder className="w-5 h-5 text-[var(--color-accent)]" />
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Pipeline de Projetos ({filteredProjects.length})
                  </h2>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={filterQuery}
                    onChange={(e) => setFilterQuery(e.target.value)}
                    placeholder="Filtrar por nome ou cliente..."
                    className="px-3 py-1.5 rounded-xl text-xs bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
                  />
                  <Link
                    href="/dev/kanban"
                    className="text-xs font-bold text-[var(--color-accent)] hover:underline inline-flex items-center gap-1 shrink-0"
                  >
                    Abrir Kanban <FiArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-white/5 flex-1 overflow-y-auto max-h-[460px]">
                {filteredProjects.length === 0 ? (
                  <div className="py-16 text-center text-slate-400 text-xs">Nenhum projeto encontrado no filtro.</div>
                ) : (
                  filteredProjects.map((p) => (
                    <div
                      key={p.id}
                      className="px-6 py-4 flex items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-white/[0.03] transition-colors"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-sm font-bold text-white bg-gradient-to-br from-[#004aad] to-[#00b09b] shadow">
                          {p.title[0].toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{p.title}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                            {p.client_name || p.client_email || 'Cliente não vinculado'} ·{' '}
                            <span className="font-semibold text-slate-700 dark:text-slate-300">
                              {p.project_type || 'Web App'}
                            </span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 shrink-0">
                        <div className="hidden sm:flex flex-col items-end gap-1 w-28">
                          <div className="w-full h-1.5 rounded-full overflow-hidden bg-slate-200 dark:bg-white/10">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-[#004aad] to-[#00b09b]"
                              style={{ width: `${p.progress ?? 0}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-mono text-slate-400">{p.progress ?? 0}% progresso</span>
                        </div>

                        <span
                          className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase"
                          style={{
                            background: `${STATUS_COLOR[p.status ?? ''] ?? '#475569'}15`,
                            color: STATUS_COLOR[p.status ?? ''] ?? '#64748b',
                            border: `1px solid ${STATUS_COLOR[p.status ?? ''] ?? '#475569'}30`,
                          }}
                        >
                          {p.status ?? 'Em andamento'}
                        </span>

                        <Link
                          href={`/dev/kanban?projectId=${p.id}`}
                          className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 text-slate-700 dark:text-white transition-colors"
                          title="Ver Kanban deste projeto"
                        >
                          <FiLayers className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Live Feed / Recent Activity */}
            <div className="rounded-[2rem] overflow-hidden bg-white/80 dark:bg-[#071324]/90 border border-slate-200 dark:border-white/10 shadow-xl backdrop-blur-2xl flex flex-col">
              <div className="px-5 py-4 flex items-center justify-between border-b border-slate-200 dark:border-white/10">
                <div className="flex items-center gap-2">
                  <FiMessageSquare className="w-4 h-4 text-[var(--color-accent)]" />
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Feed de Atualizações
                  </h2>
                </div>
                <Link
                  href="/dev/comunicacao"
                  className="text-xs font-bold text-[var(--color-accent)] hover:underline inline-flex items-center gap-1"
                >
                  Ver Tudo <FiArrowRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="p-4 flex flex-col gap-2.5 flex-1 overflow-y-auto max-h-[460px]">
                {recentUpdates.length === 0 ? (
                  <div className="py-16 text-center text-slate-400 text-xs">Sem atividades registradas recentemente.</div>
                ) : (
                  recentUpdates.map((u) => {
                    let displayText = u.message;
                    if (u.message && u.message.startsWith('{')) {
                      try {
                        const parsed = JSON.parse(u.message);
                        if (parsed.texto) displayText = parsed.texto;
                      } catch {}
                    }
                    return (
                      <div
                        key={u.id}
                        className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[11px] font-bold text-[var(--color-accent)] truncate max-w-[180px]">
                            {u.projectTitle}
                          </span>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                            {timeAgo(u.created_at)}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2">
                          {displayText}
                        </p>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Quick Access Matrix */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                href: '/dev/kanban',
                label: 'Quadro Kanban Global',
                desc: 'Mova cards, adicione colunas e atualize status',
                icon: FiLayers,
                color: 'text-cyan-400',
                bg: 'bg-cyan-500/10 border-cyan-500/20',
              },
              {
                href: '/dev/clientes',
                label: 'Gestão de Clientes',
                desc: 'Base completa de usuários e projetos vinculados',
                icon: FiUsers,
                color: 'text-indigo-400',
                bg: 'bg-indigo-500/10 border-indigo-500/20',
              },
              {
                href: '/dev/comunicacao',
                label: 'Hub de Mensageria',
                desc: 'Envie comunicados em lote e atualizações aos clientes',
                icon: FiMessageSquare,
                color: 'text-emerald-400',
                bg: 'bg-emerald-500/10 border-emerald-500/20',
              },
              {
                href: '/dev/faturas',
                label: 'Módulo Financeiro',
                desc: 'Acompanhe faturas, cobranças e recebimentos',
                icon: FiDollarSign,
                color: 'text-amber-400',
                bg: 'bg-amber-500/10 border-amber-500/20',
              },
            ].map(({ href, label, desc, icon: Icon, color, bg }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-4 p-5 rounded-2xl bg-white/80 dark:bg-[#071324]/85 border border-slate-200 dark:border-white/10 hover:border-[var(--color-accent)]/40 transition-all hover:scale-[1.01] shadow-sm backdrop-blur-xl"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center border shrink-0 ${bg}`}>
                  <Icon className={`w-6 h-6 ${color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{label}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">{desc}</p>
                </div>
                <FiArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
              </Link>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
