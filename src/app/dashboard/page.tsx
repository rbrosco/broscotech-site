'use client';
import React, { useEffect, useState } from 'react';
import Sidebar from '../../component/Sidebar';
import DashboardNav from '../../component/DashboardNav';
import KanbanBoard from '../../component/KanbanBoard';
import { FiPlus, FiFolder, FiTrendingUp, FiCheckCircle, FiX, FiArrowRight, FiZap } from 'react-icons/fi';

type Project = { id: number; title: string; status: string | null; progress: number | null };
type User = { name: string; email: string; role: string | null };

const PROJECT_TYPES = ['Web App', 'Mobile', 'API / Back-end', 'Automação', 'E-commerce', 'Landing Page', 'Outro'];

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Bom dia';
  if (h < 18) return 'Boa tarde';
  return 'Boa noite';
}

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', type: '', description: '' });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  useEffect(() => {
    fetch('/api/me', { credentials: 'include' })
      .then(r => r.json())
      .then(d => {
        if (d.name) {
          setUser(d);
          try { localStorage.setItem('userData', JSON.stringify(d)); } catch {}
        }
      }).catch(() => {});

    fetch('/api/projects?all=1', { credentials: 'include' })
      .then(r => r.json())
      .then(d => {
        if (Array.isArray(d.projects)) {
          const arr = d.projects as Project[];
          setProjects(arr);
          if (arr.length > 0) setSelectedProjectId(arr[0].id);
        }
      }).catch(() => {});
  }, []);

  const handleCreate = async () => {
    if (!form.title.trim()) { setCreateError('Informe o nome do projeto.'); return; }
    setCreating(true);
    setCreateError('');
    const res = await fetch('/api/projects', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: form.title, projectType: form.type }),
    });
    const d = await res.json();
    if (res.ok && d.project) {
      setProjects(prev => [d.project, ...prev]);
      setSelectedProjectId(d.project.id);
      setShowModal(false);
      setForm({ title: '', type: '', description: '' });
    } else {
      setCreateError(d.message || 'Erro ao criar projeto.');
    }
    setCreating(false);
  };

  const selectedProject = projects.find(p => p.id === selectedProjectId);
  const activeProjects = projects.filter(p => p.status && !p.status.toLowerCase().includes('conclu'));
  const doneProjects = projects.filter(p => p.status && p.status.toLowerCase().includes('conclu'));

  return (
    <div style={{ minHeight: '100vh', background: '#0a0f1e' }}>
      <Sidebar />

      <div className="md:pl-64 flex flex-col min-h-screen">
        <DashboardNav />

        <main className="px-4 md:px-8 pt-[81px] pb-16">

          {/* ── Welcome Hero ── */}
          <div
            className="relative overflow-hidden rounded-2xl mt-6 px-7 py-7"
            style={{ background: 'linear-gradient(130deg, rgba(0,74,173,0.18) 0%, rgba(0,176,155,0.12) 100%)', border: '1px solid rgba(0,176,155,0.2)' }}
          >
            <div className="absolute -top-10 -right-10 w-56 h-56 rounded-full blur-3xl opacity-20 pointer-events-none" style={{ background: 'radial-gradient(circle, #00b09b, transparent)' }} />
            <div className="absolute bottom-0 left-0 w-40 h-40 rounded-full blur-3xl opacity-10 pointer-events-none" style={{ background: 'radial-gradient(circle, #004aad, transparent)' }} />

            <div className="relative flex flex-wrap items-center justify-between gap-5">
              <div>
                <span className="text-sm font-semibold" style={{ color: '#00d4aa' }}>{greeting()},</span>
                <h1 className="mt-0.5 text-2xl md:text-3xl font-extrabold text-white flex items-center gap-2">
                  {user?.name ?? 'Cliente'}
                  <span className="inline-block w-2 h-2 rounded-full animate-pulse" style={{ background: '#00b09b' }} />
                </h1>
                <p className="mt-1.5 text-sm max-w-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>
                  Acompanhe seu projeto, veja onde está no pipeline e solicite novos desenvolvimentos.
                </p>
              </div>
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm text-white transition-all hover:scale-[1.03] active:scale-[0.97]"
                style={{ background: 'linear-gradient(135deg,#004aad,#00b09b)', boxShadow: '0 4px 20px rgba(0,176,155,0.35)' }}
              >
                <FiPlus className="w-4 h-4" />
                Solicitar projeto
              </button>
            </div>
          </div>

          {/* ── Stats ── */}
          <div className="grid grid-cols-3 gap-3 mt-4">
            {[
              { label: 'Total de projetos', value: projects.length, Icon: FiFolder, accent: '#004aad' },
              { label: 'Em andamento', value: activeProjects.length, Icon: FiTrendingUp, accent: '#00b09b' },
              { label: 'Concluídos', value: doneProjects.length, Icon: FiCheckCircle, accent: '#10b981' },
            ].map(({ label, value, Icon, accent }) => (
              <div
                key={label}
                className="rounded-2xl px-5 py-4 flex items-center gap-4"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: accent + '22' }}>
                  <Icon className="w-5 h-5" style={{ color: accent }} />
                </div>
                <div>
                  <p className="text-2xl font-extrabold text-white tabular-nums">{value}</p>
                  <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.35)' }}>{label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* ── Project selector tabs (if multiple) ── */}
          {projects.length > 1 && (
            <div className="mt-5 flex items-center gap-2 overflow-x-auto pb-1">
              {projects.map(p => (
                <button
                  key={p.id}
                  onClick={() => setSelectedProjectId(p.id)}
                  className="shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                  style={{
                    background: selectedProjectId === p.id ? 'rgba(0,176,155,0.14)' : 'rgba(255,255,255,0.04)',
                    color: selectedProjectId === p.id ? '#00d4aa' : 'rgba(255,255,255,0.45)',
                    border: `1.5px solid ${selectedProjectId === p.id ? 'rgba(0,176,155,0.4)' : 'rgba(255,255,255,0.07)'}`,
                  }}
                >
                  {p.title}
                </button>
              ))}
            </div>
          )}

          {/* ── Progress bar ── */}
          {selectedProject && typeof selectedProject.progress === 'number' && selectedProject.progress > 0 && (
            <div
              className="mt-4 rounded-xl px-5 py-4"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.4)' }}>Progresso geral</span>
                <span className="text-xs font-bold" style={{ color: '#00d4aa' }}>{selectedProject.progress}%</span>
              </div>
              <div className="h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${selectedProject.progress}%`, background: 'linear-gradient(90deg,#004aad,#00b09b)' }}
                />
              </div>
            </div>
          )}

          {/* ── Kanban Pipeline ── */}
          <div
            className="mt-5 rounded-2xl overflow-hidden"
            style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 8px 40px rgba(0,0,0,0.5)' }}
          >
            {selectedProjectId ? (
              <KanbanBoard projectId={selectedProjectId} />
            ) : (
              <div className="flex flex-col items-center justify-center py-24 gap-5">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(0,176,155,0.1)' }}>
                  <FiZap className="w-8 h-8" style={{ color: '#00b09b' }} />
                </div>
                <p className="text-slate-400 text-sm">Nenhum projeto encontrado.</p>
                <button
                  onClick={() => setShowModal(true)}
                  className="flex items-center gap-2 text-sm font-semibold"
                  style={{ color: '#00b09b' }}
                >
                  <FiPlus className="w-4 h-4" />
                  Solicitar meu primeiro projeto
                  <FiArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

        </main>
      </div>

      {/* ── Request project modal ── */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          style={{ background: 'rgba(10,15,30,0.88)', backdropFilter: 'blur(10px)' }}
          onClick={() => setShowModal(false)}
        >
          <div
            className="w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl px-6 sm:px-8 pt-8 pb-10 relative"
            style={{ background: '#131929', border: '1px solid rgba(0,176,155,0.2)' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Drag handle on mobile */}
            <div className="sm:hidden w-10 h-1 rounded-full mx-auto mb-6" style={{ background: 'rgba(255,255,255,0.15)' }} />

            <button
              onClick={() => setShowModal(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-xl flex items-center justify-center transition hover:bg-white/8"
              style={{ color: 'rgba(255,255,255,0.35)' }}
            >
              <FiX className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-7">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#004aad,#00b09b)' }}>
                <FiZap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-white">Solicitar novo projeto</h2>
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>Nossa equipe alinhará o escopo com você.</p>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider block mb-1.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  Nome do projeto *
                </label>
                <input
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="Ex: App de agendamento, Loja virtual..."
                  className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 outline-none transition focus:ring-1 focus:ring-[#00b09b]"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                  onKeyDown={e => e.key === 'Enter' && handleCreate()}
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider block mb-1.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  Tipo de projeto
                </label>
                <div className="flex flex-wrap gap-2">
                  {PROJECT_TYPES.map(t => (
                    <button
                      key={t}
                      onClick={() => setForm(f => ({ ...f, type: f.type === t ? '' : t }))}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
                      style={{
                        background: form.type === t ? 'rgba(0,176,155,0.15)' : 'rgba(255,255,255,0.05)',
                        color: form.type === t ? '#00d4aa' : 'rgba(255,255,255,0.45)',
                        border: `1.5px solid ${form.type === t ? 'rgba(0,176,155,0.4)' : 'rgba(255,255,255,0.08)'}`,
                      }}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {createError && (
                <p className="text-xs font-medium" style={{ color: '#f87171' }}>{createError}</p>
              )}

              <button
                onClick={handleCreate}
                disabled={creating || !form.title.trim()}
                className="mt-1 w-full py-3.5 rounded-xl font-bold text-sm text-white transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: 'linear-gradient(135deg,#004aad,#00b09b)', boxShadow: '0 4px 20px rgba(0,176,155,0.3)' }}
              >
                {creating ? 'Criando projeto...' : 'Confirmar solicitação →'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
