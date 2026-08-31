'use client';
import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import DashboardNav from '../../../component/DashboardNav';
import DevSidebar from '../../../component/DevSidebar';
import { FiSend, FiRefreshCw, FiMessageSquare, FiInfo, FiTag, FiClock } from 'react-icons/fi';

interface Project {
  id: number;
  title: string;
  client_name?: string;
  client_email?: string;
  status?: string;
}

interface Update {
  id: number;
  project_id: number;
  kind: string;
  message: string;
  created_at: string;
}

const KIND_OPTIONS = [
  { value: 'update', label: 'Atualização', color: '#00b09b', bg: 'rgba(0,176,155,0.15)' },
  { value: 'milestone', label: 'Marco Alcançado', color: '#6366f1', bg: 'rgba(99,102,241,0.15)' },
  { value: 'note', label: 'Nota Técnica', color: '#a855f7', bg: 'rgba(168,85,247,0.15)' },
  { value: 'alert', label: 'Alerta / Bloqueio', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
];

function kindConfig(kind: string) {
  return KIND_OPTIONS.find((k) => k.value === kind) ?? KIND_OPTIONS[0];
}

function DevComunicacaoContent() {
  const searchParams = useSearchParams();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [updates, setUpdates] = useState<Update[]>([]);
  const [message, setMessage] = useState('');
  const [kind, setKind] = useState('update');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/projects?all=1', { credentials: 'include' })
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data.projects)) {
          setProjects(data.projects);
          const qid = Number(searchParams.get('projectId'));
          const initial = Number.isFinite(qid) && qid > 0 ? qid : data.projects[0]?.id ?? null;
          setSelectedProjectId(initial);
        }
      })
      .catch(() => setError('Erro ao carregar projetos.'));
  }, [searchParams]);

  useEffect(() => {
    if (!selectedProjectId) return;
    loadUpdates();
  }, [selectedProjectId]);

  async function loadUpdates() {
    if (!selectedProjectId) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/project_updates?projectId=${selectedProjectId}`, {
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Erro.');
      setUpdates(Array.isArray(data.updates) ? data.updates : []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar mensagens.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [updates]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedProjectId || !message.trim()) return;
    setSending(true);
    setError('');
    try {
      const res = await fetch('/api/project_updates', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: selectedProjectId, kind, message: message.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Erro ao enviar.');
      setMessage('');
      await loadUpdates();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erro ao enviar mensagem.');
    } finally {
      setSending(false);
    }
  }

  const selectedProject = projects.find((p) => p.id === selectedProjectId);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#040d1a] text-slate-900 dark:text-slate-200 selection:bg-cyan-500/30">
      <DevSidebar />
      <div className="md:pl-sidebar transition-[padding] duration-300 flex flex-col min-h-screen">
        <DashboardNav />

        <main className="flex-1 px-4 md:px-8 pt-[70px] pb-12">
          {/* Header */}
          <div className="relative overflow-hidden rounded-[2rem] mt-4 px-7 py-7 bg-white/90 dark:bg-[#071324]/90 border border-black/10 dark:border-white/10 shadow-2xl backdrop-blur-2xl">
            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md"
                style={{ background: 'linear-gradient(135deg, #004aad, #00b09b)' }}
              >
                <FiMessageSquare className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-pixel text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-500 dark:bg-cyan-400/20 dark:text-cyan-300 border border-cyan-500/30 uppercase">
                    MENSAGERIA DEV
                  </span>
                  <span className="text-xs font-semibold text-slate-400">•</span>
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Updates de Projeto
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  Hub de Comunicação com Clientes
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Envie atualizações, marcos e notas técnicas diretamente para a área do cliente.
                </p>
              </div>
            </div>
          </div>

          {/* Main Container */}
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Project Picker & Details */}
            <div className="rounded-[2rem] p-6 bg-white/80 dark:bg-[#071324]/85 border border-slate-200 dark:border-white/10 shadow-sm backdrop-blur-xl flex flex-col justify-between h-fit">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                  Selecione o Projeto
                </label>
                <div className="relative">
                  <select
                    className="w-full rounded-xl px-4 py-3 text-xs sm:text-sm font-semibold bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[var(--color-accent)] appearance-none cursor-pointer"
                    value={selectedProjectId ?? ''}
                    onChange={(e) => setSelectedProjectId(Number(e.target.value))}
                  >
                    {projects.length === 0 && <option value="">Nenhum projeto encontrado</option>}
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedProject && (
                  <div className="mt-6 pt-5 border-t border-slate-100 dark:border-white/10 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Cliente:</span>
                      <span className="font-bold text-slate-800 dark:text-white">
                        {selectedProject.client_name || 'Não informado'}
                      </span>
                    </div>
                    {selectedProject.client_email && (
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">E-mail:</span>
                        <span className="font-mono text-slate-600 dark:text-slate-300">
                          {selectedProject.client_email}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Status:</span>
                      <span className="font-bold text-[var(--color-accent)]">{selectedProject.status || 'Ativo'}</span>
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={loadUpdates}
                disabled={loading}
                className="mt-6 w-full py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center justify-center gap-2 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
              >
                <FiRefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                Atualizar Histórico
              </button>
            </div>

            {/* Updates Feed & Sender */}
            <div className="lg:col-span-2 rounded-[2rem] overflow-hidden bg-white/80 dark:bg-[#071324]/85 border border-slate-200 dark:border-white/10 shadow-xl backdrop-blur-xl flex flex-col min-h-[500px]">
              <div className="px-6 py-4 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  Histórico de Atualizações ({updates.length})
                </span>
                <span className="text-[10px] font-mono text-slate-400">Canal do Projeto #{selectedProjectId}</span>
              </div>

              {/* Feed */}
              <div className="flex-1 overflow-y-auto p-6 space-y-3.5 max-h-[380px] scrollbar-thin scrollbar-thumb-white/10">
                {loading && updates.length === 0 ? (
                  <div className="py-20 flex justify-center">
                    <div className="w-8 h-8 rounded-full border-[3px] animate-spin border-[var(--color-accent)] border-t-transparent" />
                  </div>
                ) : updates.length === 0 ? (
                  <div className="py-20 text-center text-xs text-slate-400">
                    Nenhuma atualização enviada ainda para este projeto.
                  </div>
                ) : (
                  updates.map((u) => {
                    const cfg = kindConfig(u.kind);
                    const date = u.created_at ? new Date(u.created_at).toLocaleString('pt-BR') : '';

                    let parsedObj = null;
                    if (u.message && u.message.startsWith('{')) {
                      try {
                        parsedObj = JSON.parse(u.message);
                      } catch {}
                    }

                    return (
                      <div
                        key={u.id}
                        className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5"
                      >
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span
                            className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full"
                            style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}30` }}
                          >
                            {cfg.label}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">{date}</span>
                        </div>

                        {parsedObj && parsedObj.texto ? (
                          <div className="text-xs text-slate-800 dark:text-slate-200">
                            <p className="whitespace-pre-wrap leading-relaxed">{parsedObj.texto}</p>
                            {parsedObj.observacoes && (
                              <div className="mt-2 p-3 bg-white dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/5 text-[11px] text-slate-500">
                                <p className="font-semibold mb-0.5">Observações:</p>
                                <p className="whitespace-pre-wrap">{parsedObj.observacoes}</p>
                              </div>
                            )}
                          </div>
                        ) : (
                          <p className="text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                            {u.message}
                          </p>
                        )}
                      </div>
                    );
                  })
                )}
                <div ref={bottomRef} />
              </div>

              {/* Message Composer Form */}
              <form onSubmit={handleSend} className="p-5 border-t border-slate-200 dark:border-white/10 space-y-3 bg-white/40 dark:bg-white/5">
                {/* Kind Selector Pills */}
                <div className="flex flex-wrap gap-2">
                  {KIND_OPTIONS.map((k) => (
                    <button
                      key={k.value}
                      type="button"
                      onClick={() => setKind(k.value)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all border ${
                        kind === k.value
                          ? 'border-[var(--color-accent)] bg-[var(--color-accent-dim)] text-[var(--color-accent)]'
                          : 'border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
                      }`}
                    >
                      {k.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Escreva a atualização ou relatório técnico para o cliente..."
                    rows={2}
                    className="flex-1 px-4 py-2.5 rounded-xl text-xs sm:text-sm bg-white dark:bg-[#071324] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-[var(--color-accent)] resize-none"
                  />
                  <button
                    type="submit"
                    disabled={sending || !message.trim() || !selectedProjectId}
                    className="px-5 py-4 rounded-xl font-bold text-xs text-white shadow-md transition-all hover:scale-105 disabled:opacity-40 disabled:scale-100 flex items-center justify-center gap-2 shrink-0"
                    style={{ background: 'linear-gradient(135deg, #004aad, #00b09b)' }}
                  >
                    <FiSend className="w-4 h-4" />
                    <span>Enviar</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function DevComunicacaoPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 dark:bg-[#040d1a] flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-[3px] animate-spin border-cyan-500 border-t-transparent" />
        </div>
      }
    >
      <DevComunicacaoContent />
    </Suspense>
  );
}
