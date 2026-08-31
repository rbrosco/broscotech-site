'use client';
import React, { useEffect, useMemo, useState, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import DevSidebar from '../../../component/DevSidebar';
import DashboardNav from '../../../component/DashboardNav';
import {
  FiAlertCircle,
  FiPlus,
  FiChevronDown,
  FiLayers,
  FiTrash2,
  FiCheckCircle,
  FiFolder,
  FiClock,
  FiActivity,
} from 'react-icons/fi';

type KanbanCard = {
  id: number;
  column_id: number;
  title: string;
  description: string | null;
  responsavel?: string | null;
  data?: string | null;
  position: number;
};

type KanbanColumn = {
  id: number;
  project_id: number;
  title: string;
  position: number;
  cards: KanbanCard[];
};

type KanbanResponse = {
  project: { id: number; title: string };
  columns: KanbanColumn[];
};

type Project = {
  id: number;
  title: string;
  client_name: string | null;
  status: string | null;
};

function DevKanbanContent() {
  const searchParams = useSearchParams();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [data, setData] = useState<KanbanResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [boardLoading, setBoardLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showProjectPicker, setShowProjectPicker] = useState(false);

  const [newColumnTitle, setNewColumnTitle] = useState('');
  const [newCardTitles, setNewCardTitles] = useState<Record<number, string>>({});
  const [dragging, setDragging] = useState<{ cardId: number; fromColumnId: number } | null>(null);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY !== 0 && e.deltaX === 0) {
        e.preventDefault();
        el.scrollLeft += e.deltaY;
      }
    };
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [data, boardLoading]);

  const loadBoard = useCallback(async (projectId?: number | null) => {
    setBoardLoading(true);
    try {
      const url = projectId ? `/api/kanban?projectId=${projectId}` : '/api/kanban';
      const res = await fetch(url, { credentials: 'include' });
      if (res.ok) {
        const p = (await res.json()) as KanbanResponse;
        setData(p);
        if (p.project?.id && !selectedProjectId) {
          setSelectedProjectId(Number(p.project.id));
        }
      }
    } catch {}
    setBoardLoading(false);
  }, [selectedProjectId]);

  // Load all projects
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
          setError('Acesso restrito.');
          setLoading(false);
          return;
        }

        const res = await fetch('/api/projects?all=1', { credentials: 'include' });
        if (res.ok) {
          const p = (await res.json()) as { projects?: Project[]; project?: Project };
          const list = p.projects ?? (p.project ? [p.project] : []);
          setProjects(list);
          const qid = Number(searchParams.get('projectId'));
          const targetId =
            Number.isFinite(qid) && qid > 0 && list.some((x) => Number(x.id) === qid)
              ? qid
              : list.length > 0
              ? Number(list[0].id)
              : null;
          if (targetId) {
            setSelectedProjectId(targetId);
            await loadBoard(targetId);
          } else {
            await loadBoard(null);
          }
        } else {
          await loadBoard(null);
        }
      } catch {
        setError('Erro ao carregar projetos.');
      }
      setLoading(false);
    })();
  }, [loadBoard, searchParams]);

  useEffect(() => {
    if (selectedProjectId) void loadBoard(selectedProjectId);
  }, [selectedProjectId, loadBoard]);

  const totals = useMemo(() => {
    const cols = data?.columns ?? [];
    return cols.reduce((acc, c) => acc + c.cards.length, 0);
  }, [data]);

  const handleAddColumn = async () => {
    if (!newColumnTitle.trim() || !selectedProjectId) return;
    await fetch('/api/kanban', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'column', title: newColumnTitle, projectId: selectedProjectId }),
    });
    setNewColumnTitle('');
    void loadBoard(selectedProjectId);
  };

  const handleAddCard = async (columnId: number) => {
    const title = newCardTitles[columnId]?.trim();
    if (!title || !selectedProjectId) return;
    await fetch('/api/kanban', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'card', columnId: columnId, title, projectId: selectedProjectId }),
    });
    setNewCardTitles((prev) => ({ ...prev, [columnId]: '' }));
    void loadBoard(selectedProjectId);
  };

  const handleDrop = async (toColumnId: number) => {
    if (!dragging || dragging.fromColumnId === toColumnId || !selectedProjectId) return;
    await fetch('/api/kanban', {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cardId: dragging.cardId, toColumnId: toColumnId, toPosition: 0 }),
    });
    setDragging(null);
    void loadBoard(selectedProjectId);
  };

  const handleDeleteCard = async (cardId: number) => {
    if (!selectedProjectId) return;
    await fetch('/api/kanban', {
      method: 'DELETE',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cardId: cardId }),
    });
    void loadBoard(selectedProjectId);
  };

  const selectedProject = projects.find((p) => p.id === selectedProjectId);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#040d1a] flex items-center justify-center">
        <DevSidebar />
        <div className="w-8 h-8 rounded-full border-[3px] animate-spin border-[var(--color-accent)] border-t-transparent shadow-lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#040d1a] flex items-center justify-center p-4">
        <DevSidebar />
        <div className="text-center bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 p-8 rounded-3xl shadow-xl max-w-md">
          <FiAlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <p className="text-sm font-bold text-slate-900 dark:text-white">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#040d1a] text-slate-900 dark:text-slate-200 selection:bg-cyan-500/30">
      <DevSidebar />
      <div className="md:pl-sidebar transition-[padding] duration-300 flex flex-col min-h-screen">
        <DashboardNav />

        <main className="px-4 md:px-8 pt-[70px] pb-10 flex-1 flex flex-col">
          {/* Top Control Bar */}
          <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white/80 dark:bg-[#071324]/85 border border-slate-200 dark:border-white/10 shadow-sm backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md"
                style={{ background: 'linear-gradient(135deg, #004aad, #00b09b)' }}
              >
                <FiLayers className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-lg font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                  Gestão Geral do Kanban
                  <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-[var(--color-accent-dim)] text-[var(--color-accent)] border border-[var(--color-accent)]/30">
                    {totals} Tarefas
                  </span>
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Arraste cards entre as colunas para atualizar o pipeline do cliente em tempo real.
                </p>
              </div>
            </div>

            {/* Project Picker */}
            <div className="relative">
              <button
                onClick={() => setShowProjectPicker((v) => !v)}
                className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/15 bg-white dark:bg-white/5 hover:border-[var(--color-accent)]/50 transition-all text-xs font-bold text-slate-900 dark:text-white shadow-sm"
              >
                <FiFolder className="w-4 h-4 text-[var(--color-accent)]" />
                <span>{selectedProject?.title || 'Selecione o Projeto'}</span>
                <FiChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showProjectPicker && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-[#071324] border border-slate-200 dark:border-white/15 shadow-2xl p-2 z-50">
                  <div className="max-h-60 overflow-y-auto space-y-1">
                    {projects.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => {
                          setSelectedProjectId(p.id);
                          setShowProjectPicker(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                          selectedProjectId === p.id
                            ? 'bg-[var(--color-accent-dim)] text-[var(--color-accent)] font-bold'
                            : 'hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {p.title}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Kanban Columns Board */}
          <div
            ref={scrollContainerRef}
            className="mt-6 flex-1 flex gap-5 overflow-x-auto pb-6 scrollbar-thin scrollbar-thumb-white/10"
          >
            {boardLoading ? (
              <div className="flex-1 flex items-center justify-center py-20">
                <div className="w-8 h-8 rounded-full border-[3px] animate-spin border-[var(--color-accent)] border-t-transparent" />
              </div>
            ) : (
              <>
                {data?.columns.map((col) => (
                  <div
                    key={col.id}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => handleDrop(col.id)}
                    className="w-80 shrink-0 flex flex-col rounded-2xl bg-white/80 dark:bg-[#071324]/80 border border-slate-200 dark:border-white/10 p-4 shadow-md backdrop-blur-xl max-h-[calc(100vh-250px)]"
                  >
                    {/* Column Header */}
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/10 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-accent)] shadow-[0_0_8px_rgba(0,212,170,0.6)]" />
                        <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white truncate max-w-[170px]">
                          {col.title}
                        </h3>
                      </div>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300">
                        {col.cards.length}
                      </span>
                    </div>

                    {/* Cards Container */}
                    <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 scrollbar-none">
                      {col.cards.map((card) => (
                        <div
                          key={card.id}
                          draggable
                          onDragStart={() => setDragging({ cardId: card.id, fromColumnId: col.id })}
                          className="group p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-[var(--color-accent)]/50 transition-all hover:scale-[1.01] shadow-sm cursor-grab active:cursor-grabbing relative"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
                              {card.title}
                            </p>
                            <button
                              onClick={() => handleDeleteCard(card.id)}
                              className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 transition-opacity"
                              title="Excluir card"
                            >
                              <FiTrash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {card.description && (
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                              {card.description}
                            </p>
                          )}

                          {card.responsavel && (
                            <div className="mt-2 flex items-center gap-1 text-[10px] text-slate-400 font-mono">
                              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                              {card.responsavel}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Add Card Input */}
                    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-white/10">
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          value={newCardTitles[col.id] || ''}
                          onChange={(e) =>
                            setNewCardTitles((prev) => ({ ...prev, [col.id]: e.target.value }))
                          }
                          onKeyDown={(e) => e.key === 'Enter' && handleAddCard(col.id)}
                          placeholder="Adicionar tarefa..."
                          className="flex-1 px-3 py-1.5 rounded-lg text-xs bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
                        />
                        <button
                          onClick={() => handleAddCard(col.id)}
                          className="p-2 rounded-lg bg-[var(--color-accent-dim)] text-[var(--color-accent)] hover:bg-[var(--color-accent)] hover:text-white transition-colors"
                          title="Adicionar"
                        >
                          <FiPlus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Add New Column Box */}
                <div className="w-80 shrink-0 rounded-2xl bg-white/40 dark:bg-[#071324]/40 border-2 border-dashed border-slate-300 dark:border-white/15 p-4 flex flex-col justify-start h-fit">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
                    Nova Coluna
                  </h4>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newColumnTitle}
                      onChange={(e) => setNewColumnTitle(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddColumn()}
                      placeholder="Ex: Em Homologação..."
                      className="flex-1 px-3 py-2 rounded-xl text-xs bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
                    />
                    <button
                      onClick={handleAddColumn}
                      disabled={!newColumnTitle.trim()}
                      className="px-3 py-2 rounded-xl text-xs font-bold text-white transition-all disabled:opacity-40"
                      style={{ background: 'linear-gradient(135deg, #004aad, #00b09b)' }}
                    >
                      Criar
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function DevKanbanPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 dark:bg-[#040d1a] flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-[3px] animate-spin border-cyan-500 border-t-transparent" />
        </div>
      }
    >
      <DevKanbanContent />
    </Suspense>
  );
}
