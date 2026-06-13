'use client';
import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import DashboardNav from '../../../component/DashboardNav';
import DevSidebar from '../../../component/DevSidebar';
import { FiSend, FiRefreshCw } from 'react-icons/fi';

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
  { value: 'update', label: 'Atualização', color: '#00b09b' },
  { value: 'milestone', label: 'Marco', color: '#004aad' },
  { value: 'note', label: 'Nota', color: '#a855f7' },
  { value: 'alert', label: 'Alerta', color: '#f59e0b' },
];

function kindConfig(kind: string) {
  return KIND_OPTIONS.find(k => k.value === kind) ?? KIND_OPTIONS[0];
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
    fetch('/api/projects', { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data.projects)) {
          setProjects(data.projects);
          const qid = Number(searchParams.get('projectId'));
          const initial = Number.isFinite(qid) && qid > 0
            ? qid
            : (data.projects[0]?.id ?? null);
          setSelectedProjectId(initial);
        }
      })
      .catch(() => setError('Erro ao carregar projetos.'));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!selectedProjectId) return;
    loadUpdates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const selectedProject = projects.find(p => p.id === selectedProjectId);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-[#0a0f1e]" >
      <DevSidebar />
      <div className="flex-1 flex flex-col min-w-0 md:pl-[var(--sidebar-width,5rem)] transition-[padding] duration-300">
        <DashboardNav />
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-5xl mx-auto flex flex-col gap-6">
            {/* Header */}
            <div>
              <h1 className="text-2xl font-bold text-white">Comunicação com Clientes</h1>
              <p className="text-slate-500 dark:text-gray-400 text-sm mt-1">Envie atualizações e marcos para seus clientes.</p>
            </div>

            {/* Project selector */}
            <div className="rounded-xl p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center bg-white dark:bg-[#0d1224] border border-slate-200 dark:border-[#1e2a4a]">
              <div className="flex-1">
                <label className="block text-xs text-slate-500 dark:text-gray-400 mb-1">Projeto</label>
                <select
                  className="w-full rounded-lg px-3 py-2 text-white text-sm focus:outline-none bg-slate-50 dark:bg-[#1a2035] border border-slate-200 dark:border-[#2a3555]"
                  value={selectedProjectId ?? ''}
                  onChange={e => setSelectedProjectId(Number(e.target.value))}
                >
                  {projects.length === 0 && <option value="">Nenhum projeto encontrado</option>}
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </select>
              </div>
              {selectedProject && (
                <div className="text-sm text-slate-500 dark:text-gray-400">
                  <span className="text-slate-400 dark:text-gray-500">Cliente: </span>
                  <span className="text-slate-900 dark:text-white">{selectedProject.client_name || 'Não informado'}</span>
                  {selectedProject.client_email && (
                    <span className="ml-3 text-slate-400 dark:text-gray-500">
                      {selectedProject.client_email}
                    </span>
                  )}
                </div>
              )}
              <button
                onClick={loadUpdates}
                className="p-2 rounded-lg transition-colors bg-slate-50 dark:bg-[#1a2035] border border-slate-200 dark:border-[#2a3555] text-[#00b09b]"
                title="Recarregar"
              >
                <FiRefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              </button>
            </div>

            {error && (
              <div className="rounded-lg px-4 py-3 text-sm text-red-300 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20">
                {error}
              </div>
            )}

            {/* Messages feed */}
            <div className="rounded-xl flex flex-col bg-white dark:bg-[#0d1224] border border-slate-200 dark:border-[#1e2a4a]">
              <div className="px-5 py-3 border-b" >
                <span className="text-slate-900 dark:text-white font-medium text-sm">Histórico de atualizações</span>
                <span className="ml-2 text-slate-400 dark:text-gray-500 text-xs">{updates.length} registro{updates.length !== 1 ? 's' : ''}</span>
              </div>
              <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-3" style={{ minHeight: 280, maxHeight: 440 }}>
                {loading && (
                  <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-t-transparent" style={{ borderColor: '#00b09b', borderTopColor: 'transparent' }} />
                  </div>
                )}
                {!loading && updates.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-32 text-slate-400 dark:text-gray-500">
                    <FiSend size={28} className="mb-2 opacity-30" />
                    <p className="text-sm">Nenhuma atualização enviada ainda.</p>
                  </div>
                )}
                {!loading && updates.map(u => {
                  const cfg = kindConfig(u.kind ?? 'update');
                  const date = u.created_at
                    ? new Date(u.created_at).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })
                    : '';
                  return (
                    <div key={u.id} className="rounded-lg p-4 bg-white dark:bg-[#0a0f1e] border border-slate-200 dark:border-[#1a2240]">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded"
                          style={{ background: `${cfg.color}20`, color: cfg.color }}>
                          {cfg.label}
                        </span>
                        {date && <span className="text-xs text-slate-400 dark:text-gray-500">{date}</span>}
                      </div>
                      <p className="text-sm text-slate-700 dark:text-gray-200 whitespace-pre-wrap">{u.message}</p>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>
            </div>

            {/* Compose */}
            <form onSubmit={handleSend} className="rounded-xl p-5 flex flex-col gap-4 bg-white dark:bg-[#0d1224] border border-slate-200 dark:border-[#1e2a4a]">
              <div className="flex flex-wrap gap-2">
                {KIND_OPTIONS.map(k => (
                  <button
                    type="button"
                    key={k.value}
                    onClick={() => setKind(k.value)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      kind === k.value
                        ? 'bg-[#00b09b]/10 text-[#00b09b] dark:text-[#00d4aa] border border-[#00b09b]'
                        : 'bg-slate-50 text-slate-500 border border-slate-200 hover:bg-slate-100 dark:bg-[#1a2035] dark:border-[#2a3555] dark:text-[#6b7280]'
                    }`}
                  >
                    {k.label}
                  </button>
                ))}
              </div>
              <textarea
                className="w-full rounded-lg px-4 py-3 text-slate-900 dark:text-white text-sm resize-none focus:outline-none focus:ring-1 bg-white dark:bg-[#1a2035] border border-slate-200 dark:border-[#2a3555] min-h-[100px]"
                placeholder="Escreva uma atualização para o cliente..."
                value={message}
                onChange={e => setMessage(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleSend(e as unknown as React.FormEvent);
                }}
              />
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 dark:text-gray-500">Ctrl+Enter para enviar</span>
                <button
                  type="submit"
                  disabled={sending || !message.trim() || !selectedProjectId}
                  className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all disabled:opacity-40"
                  style={{ background: 'linear-gradient(135deg, #00b09b, #004aad)', color: 'white' }}
                >
                  <FiSend size={15} />
                  {sending ? 'Enviando...' : 'Enviar'}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function DevComunicacaoPage() {
  return (
    <Suspense>
      <DevComunicacaoContent />
    </Suspense>
  );
}
