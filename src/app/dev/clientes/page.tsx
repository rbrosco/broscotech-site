'use client';
import React, { useState, useEffect } from 'react';
import DashboardNav from '../../../component/DashboardNav';
import DevSidebar from '../../../component/DevSidebar';
import {
  FiUser,
  FiMail,
  FiPhone,
  FiExternalLink,
  FiSearch,
  FiFolder,
  FiLayers,
  FiActivity,
  FiCheckCircle,
} from 'react-icons/fi';
import Link from 'next/link';

interface Project {
  id: number;
  title: string;
  status?: string;
  progress?: number;
  admin_status?: string;
  client_name?: string;
  client_email?: string;
  client_phone?: string;
  project_type?: string;
  final_date?: string;
  created_at?: string;
}

function StatusBadge({ status }: { status?: string }) {
  const map: Record<string, { label: string; color: string; bg: string }> = {
    'em andamento': { label: 'Em Andamento', color: '#00b09b', bg: 'rgba(0,176,155,0.15)' },
    'concluído': { label: 'Concluído', color: '#22c55e', bg: 'rgba(34,197,94,0.15)' },
    'pausado': { label: 'Pausado', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
    'cancelado': { label: 'Cancelado', color: '#ef4444', bg: 'rgba(239,68,68,0.15)' },
    'planejamento': { label: 'Planejamento', color: '#818cf8', bg: 'rgba(99,102,241,0.15)' },
  };
  const cfg = map[(status ?? '').toLowerCase()] ?? {
    label: status || 'Indefinido',
    color: '#94a3b8',
    bg: 'rgba(148,163,184,0.15)',
  };
  return (
    <span
      className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full"
      style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}30` }}
    >
      {cfg.label}
    </span>
  );
}

function ProgressBar({ value }: { value?: number }) {
  const pct = Math.max(0, Math.min(100, value ?? 0));
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full overflow-hidden bg-slate-200 dark:bg-white/10">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #004aad, #00b09b)' }}
        />
      </div>
      <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 w-8 text-right">{pct}%</span>
    </div>
  );
}

export default function DevClientesPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/projects?all=1', { credentials: 'include' })
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data.projects)) setProjects(data.projects);
        else throw new Error(data.message || 'Erro ao carregar projetos.');
      })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Erro.'))
      .finally(() => setLoading(false));
  }, []);

  // Group projects by client
  const groupedMap = new Map<string, { key: string; name?: string; email?: string; phone?: string; projects: Project[] }>();
  for (const p of projects) {
    const name = p.client_name?.trim();
    const email = p.client_email?.trim();
    const key = name || email || `ID-${p.id}`;
    if (!groupedMap.has(key)) {
      groupedMap.set(key, { key, name, email, phone: p.client_phone, projects: [] });
    }
    groupedMap.get(key)!.projects.push(p);
  }
  const grouped = Array.from(groupedMap.values());

  const filtered = search.trim()
    ? grouped.filter(
        (g) =>
          g.key.toLowerCase().includes(search.toLowerCase()) ||
          (g.email ?? '').toLowerCase().includes(search.toLowerCase()) ||
          g.projects.some((p) => p.title.toLowerCase().includes(search.toLowerCase()))
      )
    : grouped;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#040d1a] text-slate-900 dark:text-slate-200 selection:bg-cyan-500/30">
      <DevSidebar />
      <div className="md:pl-sidebar transition-[padding] duration-300 flex flex-col min-h-screen">
        <DashboardNav />

        <main className="flex-1 px-4 md:px-8 pt-[70px] pb-12">
          {/* Header */}
          <div className="relative overflow-hidden rounded-[2rem] mt-4 px-7 py-7 bg-white/90 dark:bg-[#071324]/90 border border-black/10 dark:border-white/10 shadow-2xl backdrop-blur-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-pixel text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-500 dark:bg-cyan-400/20 dark:text-cyan-300 border border-cyan-500/30 uppercase">
                    EASYDEV DEV CORE
                  </span>
                  <span className="text-xs font-semibold text-slate-400">•</span>
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {grouped.length} Clientes Ativos
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  Base de Clientes & Projetos
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Visualize informações de contato, progresso geral e acesse diretamente o quadro de cada cliente.
                </p>
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-72">
                <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar por cliente ou projeto..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                />
              </div>
            </div>
          </div>

          {/* Clients Grid */}
          <div className="mt-6 space-y-4">
            {loading ? (
              <div className="py-20 flex justify-center">
                <div className="w-8 h-8 rounded-full border-[3px] animate-spin border-[var(--color-accent)] border-t-transparent" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-400 bg-white/40 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10">
                Nenhum cliente encontrado com os critérios de busca.
              </div>
            ) : (
              filtered.map((client, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl p-6 bg-white/80 dark:bg-[#071324]/85 border border-slate-200 dark:border-white/10 shadow-sm backdrop-blur-xl transition-all hover:border-[var(--color-accent)]/40"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-white/10">
                    <div className="flex items-center gap-3.5">
                      <div
                        className="w-11 h-11 rounded-2xl flex items-center justify-center text-white font-bold text-sm shadow shrink-0"
                        style={{ background: 'linear-gradient(135deg, #004aad, #00b09b)' }}
                      >
                        {(client.name || client.key)[0].toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-base font-black text-slate-900 dark:text-white">
                          {client.name || client.key}
                        </h3>
                        <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-slate-500 dark:text-slate-400">
                          {client.email && (
                            <span className="flex items-center gap-1.5">
                              <FiMail className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                              {client.email}
                            </span>
                          )}
                          {client.phone && (
                            <span className="flex items-center gap-1.5">
                              <FiPhone className="w-3.5 h-3.5 text-emerald-400" />
                              {client.phone}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start md:self-auto">
                      <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300">
                        {client.projects.length} {client.projects.length === 1 ? 'Projeto' : 'Projetos'}
                      </span>
                    </div>
                  </div>

                  {/* Client Projects List */}
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                    {client.projects.map((proj) => (
                      <div
                        key={proj.id}
                        className="p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 flex flex-col justify-between gap-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-xs font-bold text-slate-900 dark:text-white">{proj.title}</p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                              {proj.project_type || 'Web App'}
                            </p>
                          </div>
                          <StatusBadge status={proj.status} />
                        </div>

                        <div>
                          <ProgressBar value={proj.progress} />
                          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200/60 dark:border-white/5">
                            <span className="text-[10px] text-slate-400">ID #{proj.id}</span>
                            <Link
                              href={`/dev/kanban?projectId=${proj.id}`}
                              className="text-xs font-bold text-[var(--color-accent)] hover:underline inline-flex items-center gap-1"
                            >
                              Abrir Kanban <FiExternalLink className="w-3 h-3" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
