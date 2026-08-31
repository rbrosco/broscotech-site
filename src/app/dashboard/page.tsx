'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Sidebar from '../../component/Sidebar';
import DashboardNav from '../../component/DashboardNav';
import KanbanBoard from '../../component/KanbanBoard';
import {
  FiPlus,
  FiFolder,
  FiTrendingUp,
  FiCheckCircle,
  FiX,
  FiArrowRight,
  FiZap,
  FiCpu,
  FiServer,
  FiLayers,
  FiActivity,
  FiMessageSquare,
  FiCode,
} from 'react-icons/fi';
import {
  SiNextdotjs,
  SiPostgresql,
  SiN8N,
  SiTypescript,
  SiTailwindcss,
} from 'react-icons/si';

type Project = { id: number; title: string; status: string | null; progress: number | null; project_type?: string | null };
type User = { name: string; email: string; role: string | null };

const PROJECT_TYPES = ['Web App SaaS', 'Mobile (React Native)', 'API & Back-end', 'Automação n8n', 'IA & Chatbot', 'Landing Page'];

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
      .then((r) => r.json())
      .then((d) => {
        if (d.name) {
          setUser(d);
          try {
            localStorage.setItem('userData', JSON.stringify(d));
          } catch {}
        }
      })
      .catch(() => {});

    fetch('/api/projects?all=1', { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d.projects)) {
          const arr = d.projects as Project[];
          setProjects(arr);
          if (arr.length > 0) setSelectedProjectId(arr[0].id);
        }
      })
      .catch(() => {});
  }, []);

  const handleCreate = async () => {
    if (!form.title.trim()) {
      setCreateError('Informe o nome do projeto.');
      return;
    }
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
      setProjects((prev) => [d.project, ...prev]);
      setSelectedProjectId(d.project.id);
      setShowModal(false);
      setForm({ title: '', type: '', description: '' });
    } else {
      setCreateError(d.message || 'Erro ao criar projeto.');
    }
    setCreating(false);
  };

  const selectedProject = projects.find((p) => p.id === selectedProjectId);
  const activeProjects = projects.filter((p) => p.status && !p.status.toLowerCase().includes('conclu'));
  const doneProjects = projects.filter((p) => p.status && p.status.toLowerCase().includes('conclu'));

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-200 selection:bg-cyan-500/30">
      <Sidebar />

      <div className="md:pl-sidebar transition-[padding] duration-300 flex flex-col min-h-screen">
        <DashboardNav />

        <main className="flex-1 px-4 md:px-8 pt-[70px] pb-12">
          {/* Cyber Command Welcome Hero */}
          <div className="relative overflow-hidden rounded-[2rem] mt-4 px-7 sm:px-9 py-8 bg-white/90 dark:bg-[#071324]/85 border border-black/10 dark:border-white/10 shadow-2xl backdrop-blur-2xl group">
            {/* Ambient Background Glows */}
            <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-cyan-500/20 blur-[90px] pointer-events-none group-hover:bg-cyan-400/25 transition-colors duration-700" />
            <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-indigo-500/20 blur-[90px] pointer-events-none group-hover:bg-indigo-400/25 transition-colors duration-700" />

            {/* Corner Tech Decorator */}
            <div className="absolute top-4 right-6 hidden sm:flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Pipeline Ativo
              </span>
              <span className="text-[10px] font-mono text-slate-400 dark:text-white/40">SYS.CRM v2.4</span>
            </div>

            <div className="relative flex flex-wrap items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="font-pixel text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-500 dark:bg-cyan-400/20 dark:text-cyan-300 border border-cyan-500/30 uppercase">
                    EASYDEV CRM
                  </span>
                  <span className="text-xs font-semibold text-slate-400 dark:text-slate-400">•</span>
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {greeting()}
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 dark:text-white flex items-center gap-3 tracking-tight">
                  {user?.name ?? 'Cliente'}
                  <span className="inline-block w-2.5 h-2.5 rounded-full bg-[var(--color-accent)] animate-pulse shadow-[0_0_15px_rgba(0,212,170,0.8)]" />
                </h1>

                <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-xl leading-relaxed">
                  Gerencie o fluxo de entrega dos seus projetos, visualize cards do Kanban em tempo real e acelere novos desenvolvimentos com nossa stack.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/iaagent"
                  className="flex items-center gap-2 px-5 py-3 rounded-xl text-xs sm:text-sm font-bold border border-[var(--color-accent)]/30 bg-[var(--color-accent-dim)] text-[var(--color-accent)] hover:bg-[var(--color-accent)]/20 transition-all shadow-sm"
                >
                  <FiCpu className="w-4 h-4" />
                  Briefing com IA
                </Link>

                <button
                  onClick={() => setShowModal(true)}
                  className="group relative flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs sm:text-sm text-white overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-[0_0_25px_rgba(0,176,155,0.4)]"
                  style={{ background: 'linear-gradient(135deg, #004aad 0%, #00b09b 60%, #00d4aa 100%)' }}
                >
                  <FiPlus className="w-4 h-4" />
                  <span>Novo Projeto</span>
                </button>
              </div>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5">
            {[
              {
                label: 'Total de Projetos',
                value: projects.length,
                Icon: FiFolder,
                accent: 'text-indigo-500',
                bgAccent: 'bg-indigo-500/10 border-indigo-500/20',
                desc: 'Iniciativas cadastradas',
              },
              {
                label: 'Sprints em Andamento',
                value: activeProjects.length,
                Icon: FiTrendingUp,
                accent: 'text-[var(--color-accent)]',
                bgAccent: 'bg-[var(--color-accent-dim)] border-[var(--color-accent)]/20',
                desc: 'Cards no pipeline Kanban',
              },
              {
                label: 'Entregas Concluídas',
                value: doneProjects.length,
                Icon: FiCheckCircle,
                accent: 'text-emerald-500',
                bgAccent: 'bg-emerald-500/10 border-emerald-500/20',
                desc: 'Deploy em produção',
              },
            ].map(({ label, value, Icon, accent, bgAccent, desc }) => (
              <div
                key={label}
                className="group rounded-2xl p-5 bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-[var(--color-accent)]/40 transition-all duration-300 hover:-translate-y-0.5 shadow-sm backdrop-blur-xl flex items-center justify-between"
              >
                <div>
                  <p className="text-3xl font-black text-slate-900 dark:text-white tabular-nums tracking-tight">
                    {value}
                  </p>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mt-1">
                    {label}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{desc}</p>
                </div>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border shrink-0 ${bgAccent} transition-transform group-hover:scale-110`}>
                  <Icon className={`w-6 h-6 ${accent}`} />
                </div>
              </div>
            ))}
          </div>

          {/* Stack Ecosystem Banner (Tecnologias que entregamos) */}
          <div className="mt-5 rounded-2xl p-4 sm:p-5 bg-white/70 dark:bg-white/5 border border-slate-200 dark:border-white/10 backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-[var(--color-accent-dim)] text-[var(--color-accent)] flex items-center justify-center font-bold shrink-0">
                <FiZap className="w-5 h-5" />
              </span>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                  Ecossistema Tecnológico de Alta Performance
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Aplicações com React 19, Next.js 15, PostgreSQL, n8n, Groq/AI e deploy contínuo em Docker.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {[
                { name: 'Next.js 15', icon: SiNextdotjs },
                { name: 'TypeScript', icon: SiTypescript },
                { name: 'PostgreSQL', icon: SiPostgresql },
                { name: 'n8n Workflows', icon: SiN8N },
                { name: 'Tailwind CSS', icon: SiTailwindcss },
              ].map((tech, idx) => {
                const TechIcon = tech.icon;
                return (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/10"
                  >
                    <TechIcon className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                    {tech.name}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Project selector tabs */}
          {projects.length > 1 && (
            <div className="mt-6 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mr-2 shrink-0">
                Selecione o Projeto:
              </span>
              {projects.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedProjectId(p.id)}
                  className={`shrink-0 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 border ${
                    selectedProjectId === p.id
                      ? 'bg-[var(--color-accent-dim)] text-[var(--color-accent)] border-[var(--color-accent)]/40 shadow-sm font-extrabold'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 dark:bg-white/5 dark:text-slate-400 dark:border-white/10 dark:hover:bg-white/10'
                  }`}
                >
                  {p.title}
                </button>
              ))}
            </div>
          )}

          {/* Progress bar */}
          {selectedProject && typeof selectedProject.progress === 'number' && selectedProject.progress > 0 && (
            <div className="mt-5 rounded-2xl p-5 bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-sm backdrop-blur-md">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest flex items-center gap-2">
                  <FiActivity className="w-4 h-4 text-[var(--color-accent)]" />
                  Progresso do Projeto ({selectedProject.title})
                </span>
                <span className="text-sm font-black text-[var(--color-accent)]">{selectedProject.progress}% Concluído</span>
              </div>
              <div className="h-2.5 rounded-full bg-slate-100 dark:bg-slate-900 overflow-hidden shadow-inner border border-slate-200 dark:border-white/5">
                <div
                  className="h-full rounded-full transition-all duration-1000 ease-out relative"
                  style={{ width: `${selectedProject.progress}%`, background: 'linear-gradient(90deg, #004aad, #00b09b, #00d4aa)' }}
                >
                  <div className="absolute inset-0 bg-white/25 mix-blend-overlay animate-pulse" />
                </div>
              </div>
            </div>
          )}

          {/* Kanban Pipeline Section */}
          <div className="mt-6 rounded-[2rem] overflow-hidden bg-white/80 dark:bg-[#071324]/90 border border-slate-200 dark:border-white/10 shadow-xl backdrop-blur-2xl relative">
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/10 via-transparent to-transparent" />
            {selectedProjectId ? (
              <KanbanBoard projectId={selectedProjectId} />
            ) : (
              <div className="flex flex-col items-center justify-center py-20 gap-5">
                <div className="w-20 h-20 rounded-3xl flex items-center justify-center bg-[var(--color-accent-dim)] border border-[var(--color-accent)]/30 shadow-[0_0_30px_rgba(0,212,170,0.2)] relative">
                  <FiZap className="w-10 h-10 text-[var(--color-accent)] relative z-10 animate-pulse" />
                </div>
                <div className="text-center max-w-sm">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Nenhum projeto selecionado</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Crie sua primeira solicitação para iniciar o acompanhamento no Kanban.</p>
                </div>
                <button
                  onClick={() => setShowModal(true)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-white shadow-md transition-all hover:scale-105"
                  style={{ background: 'linear-gradient(135deg, #004aad, #00b09b)' }}
                >
                  <FiPlus className="w-4 h-4" />
                  Solicitar Meu Primeiro Projeto
                </button>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Request project modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
          onClick={() => setShowModal(false)}
        >
          <div
            className="w-full max-w-lg rounded-[2rem] p-7 sm:p-9 relative bg-white dark:bg-[#071324] border border-slate-200 dark:border-white/15 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-5 right-5 w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-white/10 transition-colors"
            >
              <FiX className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3.5 mb-6">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md"
                style={{ background: 'linear-gradient(135deg, #004aad, #00b09b)' }}
              >
                <FiZap className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Solicitar Novo Projeto</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Nossa equipe estruturará o escopo no Kanban.</p>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider block mb-1.5 text-slate-700 dark:text-slate-300">
                  Nome do Projeto <span className="text-[var(--color-accent)]">*</span>
                </label>
                <input
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="Ex: SaaS de Gestão, Portal E-commerce, App Mobile..."
                  className="w-full rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                  onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider block mb-1.5 text-slate-700 dark:text-slate-300">
                  Tipo de Solução
                </label>
                <div className="flex flex-wrap gap-2">
                  {PROJECT_TYPES.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, type: f.type === t ? '' : t }))}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                        form.type === t
                          ? 'bg-[var(--color-accent-dim)] text-[var(--color-accent)] border-[var(--color-accent)]/50 font-extrabold'
                          : 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-white/5 dark:text-slate-400 dark:border-white/10'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {createError && <p className="text-xs font-bold text-red-500 mt-1">{createError}</p>}

              <button
                onClick={handleCreate}
                disabled={creating || !form.title.trim()}
                className="w-full mt-3 py-3.5 rounded-xl font-bold text-sm text-white transition-all hover:scale-[1.01] hover:opacity-95 disabled:opacity-40 flex items-center justify-center gap-2 shadow-lg"
                style={{ background: 'linear-gradient(135deg, #004aad 0%, #00b09b 60%, #00d4aa 100%)' }}
              >
                {creating ? 'Criando Projeto...' : 'Confirmar Solicitação'}
                <FiArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
