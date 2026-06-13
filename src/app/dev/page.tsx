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
          const p = await res.json() as { projects?: ProjectWithUpdates[] };
          setData(p.projects ?? []);
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
      <div style={{ minHeight: '100vh', background: '#080c18' }}>
        <DevSidebar />
        <div className="md:pl-64 flex items-center justify-center min-h-screen">
          <div className="w-6 h-6 rounded-full border-2 animate-spin" style={{ borderColor: '#00b09b', borderTopColor: 'transparent' }} />
        </div>
      </div>
    );
  }

  if (!isAdmin || error) {
    return (
      <div style={{ minHeight: '100vh', background: '#080c18' }}>
        <DevSidebar />
        <div className="md:pl-64 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(239,68,68,0.1)' }}>
              <FiAlertCircle className="w-8 h-8 text-red-400" />
            </div>
            <h2 className="text-lg font-bold text-white">{error ?? 'Acesso restrito'}</h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#080c18' }}>
      <DevSidebar />
      <div className="md:pl-64 flex flex-col min-h-screen">
        <DashboardNav />

        <main className="px-4 md:px-8 pt-[81px] pb-20">
          {/* Header */}
          <div
            className="relative overflow-hidden rounded-2xl mt-6 px-7 py-6"
            style={{ background: 'linear-gradient(130deg, rgba(0,74,173,0.22) 0%, rgba(0,176,155,0.14) 100%)', border: '1px solid rgba(0,176,155,0.18)' }}
          >
            <div className="absolute -top-12 -right-12 w-56 h-56 rounded-full blur-3xl opacity-10 pointer-events-none" style={{ background: 'radial-gradient(circle,#00b09b,transparent)' }} />
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(0,176,155,0.15)' }}>
                <FiActivity className="w-5 h-5" style={{ color: '#00b09b' }} />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-white tracking-tight">Painel do Desenvolvedor</h1>
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>Visão geral de todos os projetos e clientes</p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5">
            {[
              { label: 'Total de Projetos', value: total, icon: FiFolder, color: '#6366f1', bg: 'rgba(99,102,241,0.12)' },
              { label: 'Em Andamento', value: inProgress, icon: FiTrendingUp, color: '#00b09b', bg: 'rgba(0,176,155,0.12)' },
              { label: 'Concluídos', value: done, icon: FiCheckCircle, color: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
              { label: 'Clientes', value: clients, icon: FiUsers, color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
            ].map(({ label, value, icon: Icon, color, bg }) => (
              <div key={label} className="rounded-2xl px-5 py-5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: bg }}>
                  <Icon className="w-4 h-4" style={{ color }} />
                </div>
                <p className="text-2xl font-extrabold text-white">{value}</p>
                <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>{label}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Projects list */}
            <div className="lg:col-span-2 rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="flex items-center gap-2">
                  <FiFolder className="w-4 h-4" style={{ color: '#00b09b' }} />
                  <h2 className="text-sm font-bold text-white">Todos os Projetos</h2>
                </div>
                <Link href="/dev/kanban" className="text-xs font-semibold flex items-center gap-1 transition hover:opacity-70" style={{ color: '#00b09b' }}>
                  Gerenciar <FiArrowRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                {projects.length === 0 && (
                  <div className="py-12 flex flex-col items-center gap-2">
                    <FiFolder className="w-8 h-8" style={{ color: 'rgba(255,255,255,0.1)' }} />
                    <p className="text-sm" style={{ color: 'rgba(255,255,255,0.25)' }}>Nenhum projeto cadastrado</p>
                  </div>
                )}
                {projects.map(p => (
                  <div key={p.id} className="px-6 py-4 flex items-center gap-4 hover:bg-white/[0.02] transition">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold text-white"
                      style={{ background: 'linear-gradient(135deg,#004aad,#00b09b)' }}
                    >
                      {p.title[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{p.title}</p>
                      <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
                        {p.client_name || p.client_email || 'Sem cliente'} · {p.project_type || 'Tipo não definido'}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="w-24 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                        <div className="h-full rounded-full" style={{ width: `${p.progress ?? 0}%`, background: 'linear-gradient(90deg,#004aad,#00b09b)' }} />
                      </div>
                      <span className="text-xs font-semibold w-8 text-right" style={{ color: 'rgba(255,255,255,0.5)' }}>{p.progress ?? 0}%</span>
                      <span
                        className="text-[10px] font-bold px-2.5 py-1 rounded-full"
                        style={{
                          background: `${STATUS_COLOR[p.status ?? ''] ?? '#475569'}22`,
                          color: STATUS_COLOR[p.status ?? ''] ?? '#94a3b8',
                          border: `1px solid ${STATUS_COLOR[p.status ?? ''] ?? '#475569'}44`,
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
            <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="flex items-center gap-2">
                  <FiMessageSquare className="w-4 h-4" style={{ color: '#00b09b' }} />
                  <h2 className="text-sm font-bold text-white">Atividade Recente</h2>
                </div>
                <Link href="/dev/comunicacao" className="text-xs font-semibold flex items-center gap-1 transition hover:opacity-70" style={{ color: '#00b09b' }}>
                  Ver tudo <FiArrowRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="p-3 flex flex-col gap-1">
                {recentUpdates.length === 0 && (
                  <div className="py-8 flex flex-col items-center gap-2">
                    <FiClock className="w-6 h-6" style={{ color: 'rgba(255,255,255,0.1)' }} />
                    <p className="text-xs text-center" style={{ color: 'rgba(255,255,255,0.25)' }}>Sem atividade recente</p>
                  </div>
                )}
                {recentUpdates.map(u => (
                  <div key={u.id} className="px-3 py-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold truncate" style={{ color: '#00b09b' }}>{u.projectTitle}</span>
                      <span className="text-[10px] ml-auto shrink-0" style={{ color: 'rgba(255,255,255,0.25)' }}>{timeAgo(u.created_at)}</span>
                    </div>
                    <p className="text-xs leading-relaxed line-clamp-2" style={{ color: 'rgba(255,255,255,0.6)' }}>{u.message}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick access */}
          <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { href: '/dev/kanban', label: 'Gerenciar Kanban', desc: 'Controle o board de qualquer projeto', icon: FiActivity, color: '#00b09b' },
              { href: '/dev/comunicacao', label: 'Comunicação', desc: 'Envie atualizações para os clientes', icon: FiMessageSquare, color: '#6366f1' },
              { href: '/dev/clientes', label: 'Clientes', desc: 'Lista completa de clientes e projetos', icon: FiUsers, color: '#f59e0b' },
            ].map(({ href, label, desc, icon: Icon, color }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-4 px-5 py-4 rounded-2xl transition hover:scale-[1.01]"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${color}18` }}>
                  <Icon className="w-5 h-5" style={{ color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white">{label}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>{desc}</p>
                </div>
                <FiArrowRight className="w-4 h-4 shrink-0" style={{ color: 'rgba(255,255,255,0.2)' }} />
              </Link>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
