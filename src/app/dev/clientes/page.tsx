'use client';
import React, { useState, useEffect } from 'react';
import DashboardNav from '../../../component/DashboardNav';
import DevSidebar from '../../../component/DevSidebar';
import { FiUser, FiMail, FiPhone, FiExternalLink, FiSearch } from 'react-icons/fi';
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
    'em andamento': { label: 'Em Andamento', color: '#00b09b', bg: '#00b09b20' },
    'concluído': { label: 'Concluído', color: '#22c55e', bg: '#22c55e20' },
    'pausado': { label: 'Pausado', color: '#f59e0b', bg: '#f59e0b20' },
    'cancelado': { label: 'Cancelado', color: '#ef4444', bg: '#ef444420' },
    'planejamento': { label: 'Planejamento', color: '#a855f7', bg: '#a855f720' },
  };
  const cfg = map[(status ?? '').toLowerCase()] ?? { label: status || 'Indefinido', color: '#6b7280', bg: '#6b728020' };
  return (
    <span className="text-xs font-semibold px-2 py-0.5 rounded"
      style={{ background: cfg.bg, color: cfg.color }}>
      {cfg.label}
    </span>
  );
}

function ProgressBar({ value }: { value?: number }) {
  const pct = Math.max(0, Math.min(100, value ?? 0));
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full overflow-hidden bg-slate-200 dark:bg-[#1e2a4a]">
        <div className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #00b09b, #004aad)' }} />
      </div>
      <span className="text-xs text-slate-500 dark:text-gray-400 w-8 text-right">{pct}%</span>
    </div>
  );
}

export default function DevClientesPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/projects?all=1', { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data.projects)) setProjects(data.projects);
        else throw new Error(data.message || 'Erro ao carregar projetos.');
      })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Erro.'))
      .finally(() => setLoading(false));
  }, []);

  // Group projects by client
  const groupedMap = new Map<string, { key: string; email?: string; phone?: string; projects: Project[] }>();
  for (const p of projects) {
    const key = p.client_name?.trim() || p.client_email?.trim() || `ID-${p.id}`;
    if (!groupedMap.has(key)) {
      groupedMap.set(key, { key, email: p.client_email, phone: p.client_phone, projects: [] });
    }
    groupedMap.get(key)!.projects.push(p);
  }
  const grouped = Array.from(groupedMap.values());

  const filtered = search.trim()
    ? grouped.filter(g =>
        g.key.toLowerCase().includes(search.toLowerCase()) ||
        (g.email ?? '').toLowerCase().includes(search.toLowerCase()) ||
        g.projects.some(p => p.title.toLowerCase().includes(search.toLowerCase()))
      )
    : grouped;

  return (
    <div className="flex h-screen overflow-hidden" >
      <DevSidebar />
      <div className="flex-1 flex flex-col min-w-0 md:pl-sidebar transition-[padding] duration-300">
        <DashboardNav />
        <main className="flex-1 overflow-auto px-6 md:px-8 pt-[85px] pb-8">
          <div className="max-w-5xl mx-auto flex flex-col gap-6">
            {/* Header */}
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Clientes</h1>
              <p className="text-slate-500 dark:text-gray-400 text-sm mt-1">Visão geral de todos os clientes e seus projetos.</p>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Total Clientes', value: grouped.length },
                { label: 'Total Projetos', value: projects.length },
                { label: 'Em Andamento', value: projects.filter(p => p.status?.toLowerCase() === 'em andamento').length },
                { label: 'Concluídos', value: projects.filter(p => p.status?.toLowerCase() === 'concluído').length },
              ].map(s => (
                <div key={s.label} className="rounded-xl px-4 py-4 bg-white dark:bg-[#0d1224] border border-slate-200 dark:border-[#1e2a4a]">
                  <p className="text-slate-500 dark:text-gray-400 text-xs mb-1">{s.label}</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{s.value}</p>
                </div>
              ))}
            </div>

            {/* Search */}
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-gray-500" size={15} />
              <input
                type="text"
                placeholder="Buscar cliente ou projeto..."
                className="w-full pl-9 pr-4 py-2 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none bg-white dark:bg-[#0d1224] border border-slate-200 dark:border-[#1e2a4a]"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            {error && (
              <div className="rounded-lg px-4 py-3 text-sm text-red-300 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20">
                {error}
              </div>
            )}

            {loading && (
              <div className="flex items-center justify-center py-16">
                <div className="animate-spin rounded-full h-8 w-8 border-2"
                  style={{ borderColor: '#00b09b', borderTopColor: 'transparent' }} />
              </div>
            )}

            {/* Client list */}
            {!loading && filtered.map(g => (
              <div key={g.key} className="rounded-xl overflow-hidden bg-white dark:bg-[#0d1224] border border-slate-200 dark:border-[#1e2a4a]">
                {/* Client header */}
                <button
                  className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/5 transition-colors"
                  onClick={() => setExpanded(expanded === g.projects[0].id * -1 ? null : g.projects[0].id * -1)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold bg-slate-100 dark:bg-[#1a2035] text-[#00b09b]">
                      {(g.key[0] ?? '?').toUpperCase()}
                    </div>
                    <div className="text-left">
                      <p className="text-slate-900 dark:text-slate-900 dark:text-white font-semibold text-sm">{g.key}</p>
                      <div className="flex items-center gap-3 mt-0.5">
                        {g.email && (
                          <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-gray-400">
                            <FiMail size={11} />{g.email}
                          </span>
                        )}
                        {g.phone && (
                          <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-gray-400">
                            <FiPhone size={11} />{g.phone}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400 dark:text-gray-500">{g.projects.length} projeto{g.projects.length !== 1 ? 's' : ''}</span>
                    <FiUser size={14} className="text-slate-400 dark:text-gray-500" />
                  </div>
                </button>

                {/* Projects table */}
                <div className="border-t" >
                  <table className="w-full text-sm">
                    <thead>
                      <tr >
                        <th className="text-left px-5 py-2 text-xs text-slate-400 dark:text-gray-500 font-medium">Projeto</th>
                        <th className="text-left px-3 py-2 text-xs text-slate-400 dark:text-gray-500 font-medium hidden md:table-cell">Tipo</th>
                        <th className="text-left px-3 py-2 text-xs text-slate-400 dark:text-gray-500 font-medium">Status</th>
                        <th className="px-3 py-2 text-xs text-slate-400 dark:text-gray-500 font-medium hidden lg:table-cell">Progresso</th>
                        <th className="text-left px-3 py-2 text-xs text-slate-400 dark:text-gray-500 font-medium hidden lg:table-cell">Prazo</th>
                        <th className="px-3 py-2 text-xs text-slate-400 dark:text-gray-500 font-medium">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {g.projects.map((p, i) => (
                        <tr key={p.id}
                          className={i > 0 ? "border-t border-slate-200 dark:border-[#1a2240]" : ""}>
                          <td className="px-5 py-3 text-slate-900 dark:text-white font-medium">{p.title}</td>
                          <td className="px-3 py-3 text-slate-500 dark:text-gray-400 hidden md:table-cell text-xs">{p.project_type || '—'}</td>
                          <td className="px-3 py-3"><StatusBadge status={p.status} /></td>
                          <td className="px-3 py-3 hidden lg:table-cell" style={{ minWidth: 120 }}>
                            <ProgressBar value={p.progress} />
                          </td>
                          <td className="px-3 py-3 text-slate-500 dark:text-gray-400 text-xs hidden lg:table-cell">{p.final_date || '—'}</td>
                          <td className="px-3 py-3">
                            <div className="flex items-center gap-1 justify-end">
                              <Link href={`/dev/kanban?projectId=${p.id}`}
                                className="p-1.5 rounded transition-colors text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:text-white bg-slate-100 dark:bg-[#1a2035]"
                                title="Ver Kanban">
                                <FiExternalLink size={13} />
                              </Link>
                              <Link href={`/dev/comunicacao?projectId=${p.id}`}
                                className="p-1.5 rounded transition-colors text-xs font-semibold"
                                style={{ background: '#00b09b20', color: '#00b09b' }}
                                title="Comunicação">
                                <FiMail size={13} />
                              </Link>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}

            {!loading && filtered.length === 0 && !error && (
              <div className="flex flex-col items-center justify-center py-16 text-slate-400 dark:text-gray-500">
                <FiUser size={32} className="mb-3 opacity-30" />
                <p>Nenhum cliente encontrado.</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
