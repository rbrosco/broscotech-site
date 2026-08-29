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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-200 selection:bg-cyan-500/30">
      <Sidebar />

      <div className="md:pl-sidebar transition-[padding] duration-300 flex flex-col min-h-screen">
        <DashboardNav />

        <main className="flex-1 px-4 md:px-8 pt-[65px] pb-8">

          {/* ── Welcome Hero ── */}
          <div className="relative overflow-hidden rounded-3xl mt-4 px-8 py-10 bg-white dark:bg-transparent bg-gradient-to-br from-indigo-50 via-cyan-50 to-emerald-50 dark:from-indigo-600/10 dark:via-cyan-500/5 dark:to-emerald-500/10 border border-slate-200 dark:border-white/5 shadow-xl dark:shadow-2xl group">
            <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-cyan-500/20 blur-[80px] pointer-events-none group-hover:bg-cyan-400/20 transition-colors duration-700" />
            <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-indigo-500/20 blur-[80px] pointer-events-none group-hover:bg-indigo-400/20 transition-colors duration-700" />

            <div className="relative flex flex-wrap items-center justify-between gap-5">
              <div>
                <span className="text-sm font-semibold tracking-wider text-cyan-600 dark:text-cyan-400 uppercase">{greeting()},</span>
                <h1 className="mt-1 text-3xl md:text-4xl font-black text-slate-900 dark:text-white flex items-center gap-3 tracking-tight">
                  {user?.name ?? 'Cliente'}
                  <span className="inline-block w-2.5 h-2.5 rounded-full bg-cyan-500 dark:bg-cyan-400 animate-pulse shadow-[0_0_15px_rgba(34,211,238,0.6)]" />
                </h1>
                <p className="mt-2 text-sm md:text-base text-slate-500 dark:text-slate-400 max-w-md leading-relaxed">
                  Acompanhe seu projeto, veja onde está no pipeline e solicite novos desenvolvimentos.
                </p>
              </div>
              <button
                onClick={() => setShowModal(true)}
                className="group relative flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm text-white overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_-5px_rgba(6,182,212,0.4)]"
                style={{ background: 'linear-gradient(135deg,#004aad 0%,#00b09b 60%,#00d4aa 100%)' }}
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out" />
                <FiPlus className="w-4 h-4 relative z-10" />
                <span className="relative z-10">Solicitar projeto</span>
              </button>
            </div>
          </div>

          {/* ── Stats ── */}
          <div className="grid grid-cols-3 gap-3 mt-4">
            {[
              { label: 'Total de projetos', value: projects.length, Icon: FiFolder, accent: 'text-indigo-400', bgAccent: 'bg-indigo-400/10' },
              { label: 'Em andamento', value: activeProjects.length, Icon: FiTrendingUp, accent: 'text-cyan-400', bgAccent: 'bg-cyan-400/10' },
              { label: 'Concluídos', value: doneProjects.length, Icon: FiCheckCircle, accent: 'text-emerald-400', bgAccent: 'bg-emerald-400/10' },
            ].map(({ label, value, Icon, accent, bgAccent }) => (
              <div
                key={label}
                className="group rounded-2xl px-6 py-5 flex items-center gap-5 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/10 dark:hover:border-white/10 transition-all duration-300 hover:-translate-y-1 shadow-sm dark:shadow-lg"
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${bgAccent} transition-transform group-hover:scale-110 group-hover:rotate-3`}>
                  <Icon className={`w-6 h-6 ${accent}`} />
                </div>
                <div>
                  <p className="text-3xl font-black text-slate-900 dark:text-white tabular-nums tracking-tight">{value}</p>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-0.5">{label}</p>
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
                  className={`shrink-0 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 border ${selectedProjectId === p.id ? 'bg-cyan-50 text-cyan-600 border-cyan-200 dark:bg-cyan-500/10 dark:text-cyan-400 dark:border-cyan-500/30 dark:shadow-[0_0_15px_rgba(6,182,212,0.15)]' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900 dark:bg-white/5 dark:text-slate-400 dark:border-white/5 dark:hover:bg-white/10 dark:hover:text-white'}`}
                >
                  {p.title}
                </button>
              ))}
            </div>
          )}

          {/* ── Progress bar ── */}
          {selectedProject && typeof selectedProject.progress === 'number' && selectedProject.progress > 0 && (
            <div
              className="mt-6 rounded-2xl px-6 py-5 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-lg"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Progresso geral</span>
                <span className="text-sm font-black text-cyan-600 dark:text-cyan-400">{selectedProject.progress}%</span>
              </div>
              <div className="h-2.5 rounded-full bg-slate-100 dark:bg-slate-900 overflow-hidden shadow-inner border border-slate-200 dark:border-white/5">
                <div
                  className="h-full rounded-full transition-all duration-1000 ease-out relative"
                  style={{ width: `${selectedProject.progress}%`, background: 'linear-gradient(90deg,#004aad,#00d4aa)' }}
                >
                  <div className="absolute inset-0 bg-white/20 mix-blend-overlay animate-pulse" />
                </div>
              </div>
            </div>
          )}

          {/* ── Kanban Pipeline ── */}
          <div
            className="mt-6 rounded-3xl overflow-hidden bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-[0_8px_40px_rgba(0,0,0,0.4)] relative"
          >
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/10 via-transparent to-transparent" />
            {selectedProjectId ? (
              <KanbanBoard projectId={selectedProjectId} />
            ) : (
              <div className="flex flex-col items-center justify-center py-24 gap-5">
                <div className="w-20 h-20 rounded-3xl flex items-center justify-center bg-cyan-500/10 border border-cyan-500/20 shadow-[0_0_30px_rgba(6,182,212,0.15)] relative">
                  <div className="absolute inset-0 bg-cyan-400 blur-xl opacity-20 rounded-3xl animate-pulse" />
                  <FiZap className="w-10 h-10 text-cyan-400 relative z-10" />
                </div>
                <p className="text-slate-500 dark:text-slate-400 font-medium">Nenhum projeto encontrado.</p>
                <button
                  onClick={() => setShowModal(true)}
                  className="group flex items-center gap-2 text-sm font-bold text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  <FiPlus className="w-4 h-4 transition-transform group-hover:scale-110" />
                  Solicitar meu primeiro projeto
                  <FiArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            )}
          </div>

        </main>
      </div>

      {/* ── Request project modal ── */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-md"
          onClick={() => setShowModal(false)}
        >
          <div
            className="w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl px-6 sm:px-10 pt-10 pb-12 relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-xl dark:shadow-[0_0_60px_rgba(0,0,0,0.6)]"
            onClick={e => e.stopPropagation()}
          >
            {/* Drag handle on mobile */}
            <div className="sm:hidden w-12 h-1.5 rounded-full mx-auto mb-8 bg-slate-200 dark:bg-white/10" />

            <button
              onClick={() => setShowModal(false)}
              className="absolute top-6 right-6 w-10 h-10 rounded-full flex items-center justify-center transition-colors text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10"
            >
              <FiX className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br from-indigo-500 to-cyan-500 shadow-lg shadow-cyan-500/20">
                <FiZap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Solicitar novo projeto</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Nossa equipe alinhará o escopo com você.</p>
              </div>
            </div>

            <div className="flex flex-col gap-5">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider block mb-2 text-slate-500 dark:text-slate-400">
                  Nome do projeto <span className="text-cyan-600 dark:text-cyan-400">*</span>
                </label>
                <input
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="Ex: App de agendamento, Loja virtual..."
                  className="w-full rounded-2xl px-5 py-4 text-sm text-slate-900 dark:text-white bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 placeholder-slate-400 dark:placeholder-slate-500 outline-none transition-all focus:ring-2 focus:ring-cyan-500 focus:bg-white dark:focus:bg-white/10"
                  onKeyDown={e => e.key === 'Enter' && handleCreate()}
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider block mb-2 text-slate-500 dark:text-slate-400">
                  Tipo de projeto
                </label>
                <div className="flex flex-wrap gap-2.5">
                  {PROJECT_TYPES.map(t => (
                    <button
                      key={t}
                      onClick={() => setForm(f => ({ ...f, type: f.type === t ? '' : t }))}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 border ${form.type === t ? 'bg-cyan-50 text-cyan-600 border-cyan-200 dark:bg-cyan-500/15 dark:text-cyan-400 dark:border-cyan-500/40 dark:shadow-[0_0_15px_rgba(6,182,212,0.15)]' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900 dark:bg-white/5 dark:text-slate-400 dark:border-white/5 dark:hover:bg-white/10 dark:hover:text-white'}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {createError && (
                <p className="text-sm font-bold text-red-400 mt-1">{createError}</p>
              )}

              <button
                onClick={handleCreate}
                disabled={creating || !form.title.trim()}
                className="group relative w-full overflow-hidden mt-3 py-4 rounded-2xl font-black text-sm text-white transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:hover:scale-100 disabled:cursor-not-allowed shadow-[0_10px_30px_-10px_rgba(6,182,212,0.5)]"
                style={{ background: 'linear-gradient(135deg,#004aad 0%,#00b09b 60%,#00d4aa 100%)' }}
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out" />
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {creating ? 'Criando projeto...' : <>Confirmar solicitação <FiArrowRight className="w-4 h-4" /></>}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
