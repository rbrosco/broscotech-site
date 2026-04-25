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
    <div className="flex h-screen overflow-hidden" style={{ background: '#0a0f1e' }}>
      <DevSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <DashboardNav />
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-5xl mx-auto flex flex-col gap-6">
            {/* Header */}
            <div>
              <h1 className="text-2xl font-bold text-white">Comunicação com Clientes</h1>
              <p className="text-gray-400 text-sm mt-1">Envie atualizações e marcos para seus clientes.</p>
            </div>

            {/* Project selector */}
            <div className="rounded-xl p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center"
              style={{ background: '#0d1224', border: '1px solid #1e2a4a' }}>
              <div className="flex-1">
                <label className="block text-xs text-gray-400 mb-1">Projeto</label>
                <select
                  className="w-full rounded-lg px-3 py-2 text-white text-sm focus:outline-none"
                  style={{ background: '#1a2035', border: '1px solid #2a3555' }}
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
                <div className="text-sm text-gray-400">
                  <span className="text-gray-500">Cliente: </span>
                  <span className="text-white">{selectedProject.client_name || 'Não informado'}</span>
                  {selectedProject.client_email && (
                    <span className="ml-3 text-gray-500">
                      {selectedProject.client_email}
                    </span>
                  )}
                </div>
              )}
              <button
                onClick={loadUpdates}
                className="p-2 rounded-lg transition-colors"
                style={{ background: '#1a2035', border: '1px solid #2a3555', color: '#00b09b' }}
                title="Recarregar"
              >
                <FiRefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              </button>
            </div>

            {error && (
              <div className="rounded-lg px-4 py-3 text-sm text-red-300"
                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                {error}
              </div>
            )}

            {/* Messages feed */}
            <div className="rounded-xl flex flex-col" style={{ background: '#0d1224', border: '1px solid #1e2a4a' }}>
              <div className="px-5 py-3 border-b" style={{ borderColor: '#1e2a4a' }}>
                <span className="text-white font-medium text-sm">Histórico de atualizações</span>
                <span className="ml-2 text-gray-500 text-xs">{updates.length} registro{updates.length !== 1 ? 's' : ''}</span>
              </div>
              <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-3" style={{ minHeight: 280, maxHeight: 440 }}>
                {loading && (
                  <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-t-transparent" style={{ borderColor: '#00b09b', borderTopColor: 'transparent' }} />
                  </div>
                )}
                {!loading && updates.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-32 text-gray-500">
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
                    <div key={u.id} className="rounded-lg p-4" style={{ background: '#0a0f1e', border: '1px solid #1a2240' }}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded"
                          style={{ background: `${cfg.color}20`, color: cfg.color }}>
                          {cfg.label}
                        </span>
                        {date && <span className="text-xs text-gray-500">{date}</span>}
                      </div>
                      <p className="text-sm text-gray-200 whitespace-pre-wrap">{u.message}</p>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>
            </div>

            {/* Compose */}
            <form onSubmit={handleSend} className="rounded-xl p-5 flex flex-col gap-4"
              style={{ background: '#0d1224', border: '1px solid #1e2a4a' }}>
              <div className="flex flex-wrap gap-2">
                {KIND_OPTIONS.map(k => (
                  <button
                    type="button"
                    key={k.value}
                    onClick={() => setKind(k.value)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                    style={{
                      background: kind === k.value ? `${k.color}30` : '#1a2035',
                      border: `1px solid ${kind === k.value ? k.color : '#2a3555'}`,
                      color: kind === k.value ? k.color : '#6b7280',
                    }}
                  >
                    {k.label}
                  </button>
                ))}
              </div>
              <textarea
                className="w-full rounded-lg px-4 py-3 text-white text-sm resize-none focus:outline-none focus:ring-1"
                style={{ background: '#1a2035', border: '1px solid #2a3555', minHeight: 100 }}
                placeholder="Escreva uma atualização para o cliente..."
                value={message}
                onChange={e => setMessage(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleSend(e as unknown as React.FormEvent);
                }}
              />
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Ctrl+Enter para enviar</span>
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
