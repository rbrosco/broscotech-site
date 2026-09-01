'use client';
import React, { useEffect, useMemo, useRef, useState, useCallback, Suspense } from 'react';
import { createPortal } from 'react-dom';
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
  FiX,
  FiUser,
  FiCalendar,
  FiFlag,
  FiEdit2,
} from 'react-icons/fi';

type KanbanCard = {
  id: number;
  column_id: number;
  title: string;
  description: string | null;
  responsavel?: string | null;
  due_date?: string | null;
  priority?: 'baixa' | 'media' | 'alta' | null;
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
  project: { id: number; title: string; progress?: number };
  columns: KanbanColumn[];
};

type Project = {
  id: number;
  title: string;
  client_name: string | null;
  status: string | null;
};

const PRIORITY_CONFIG: Record<string, { label: string; color: string }> = {
  alta: { label: 'Alta', color: '#ef4444' },
  media: { label: 'Média', color: '#f59e0b' },
  baixa: { label: 'Baixa', color: '#6366f1' },
};

function formatDate(iso?: string | null) {
  if (!iso) return null;
  try {
    return new Date(iso.length <= 10 ? `${iso}T00:00:00` : iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  } catch {
    return null;
  }
}

type CardFormState = {
  title: string;
  description: string;
  responsavel: string;
  dueDate: string;
  priority: '' | 'baixa' | 'media' | 'alta';
};

const EMPTY_CARD_FORM: CardFormState = { title: '', description: '', responsavel: '', dueDate: '', priority: '' };

function DevKanbanContent() {
  const searchParams = useSearchParams();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [data, setData] = useState<KanbanResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [boardLoading, setBoardLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showProjectPicker, setShowProjectPicker] = useState(false);
  const [pickerPos, setPickerPos] = useState<{ top: number; left: number; width: number } | null>(null);
  const [mounted, setMounted] = useState(false);
  const pickerButtonRef = React.useRef<HTMLButtonElement>(null);
  const [currentDevName, setCurrentDevName] = useState<string>('');

  const [newColumnTitle, setNewColumnTitle] = useState('');
  const [dragging, setDragging] = useState<{ cardId: number; fromColumnId: number } | null>(null);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  // Modal de criação/edição de card
  const [cardModal, setCardModal] = useState<{ mode: 'create' | 'edit'; columnId: number; cardId?: number } | null>(null);
  const [cardForm, setCardForm] = useState<CardFormState>(EMPTY_CARD_FORM);
  const [savingCard, setSavingCard] = useState(false);

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

  useEffect(() => {
    setMounted(true);
  }, []);

  // Reposiciona o dropdown do seletor de projeto sempre que ele abre
  // (e ao rolar/redimensionar) — renderizado via portal para não ficar
  // por trás das colunas do Kanban (que têm seu próprio stacking context
  // por causa do backdrop-blur + overflow-x-auto).
  useEffect(() => {
    if (!showProjectPicker) return;
    const updatePos = () => {
      const rect = pickerButtonRef.current?.getBoundingClientRect();
      if (!rect) return;
      setPickerPos({ top: rect.bottom + 8, left: rect.right - 288, width: 288 });
    };
    updatePos();
    window.addEventListener('scroll', updatePos, true);
    window.addEventListener('resize', updatePos);
    return () => {
      window.removeEventListener('scroll', updatePos, true);
      window.removeEventListener('resize', updatePos);
    };
  }, [showProjectPicker]);

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
        const meData = (await me.json()) as { role?: string; name?: string };
        if (meData.role !== 'admin') {
          setError('Acesso restrito.');
          setLoading(false);
          return;
        }
        setCurrentDevName(meData.name || '');

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

  function openCreateCard(columnId: number) {
    setCardForm({ ...EMPTY_CARD_FORM, responsavel: currentDevName });
    setCardModal({ mode: 'create', columnId });
  }

  function openEditCard(card: KanbanCard) {
    setCardForm({
      title: card.title,
      description: card.description || '',
      responsavel: card.responsavel || currentDevName,
      dueDate: card.due_date ? String(card.due_date).slice(0, 10) : '',
      priority: (card.priority as CardFormState['priority']) || '',
    });
    setCardModal({ mode: 'edit', columnId: card.column_id, cardId: card.id });
  }

  const handleSaveCard = async () => {
    if (!cardModal || !cardForm.title.trim() || !selectedProjectId) return;
    setSavingCard(true);
    try {
      if (cardModal.mode === 'create') {
        await fetch('/api/kanban', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'card',
            columnId: cardModal.columnId,
            projectId: selectedProjectId,
            title: cardForm.title.trim(),
            description: cardForm.description.trim() || null,
            responsavel: cardForm.responsavel.trim() || null,
            dueDate: cardForm.dueDate || null,
            priority: cardForm.priority || null,
          }),
        });
      } else if (cardModal.cardId) {
        await fetch('/api/kanban', {
          method: 'PATCH',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            cardId: cardModal.cardId,
            title: cardForm.title.trim(),
            description: cardForm.description.trim(),
            responsavel: cardForm.responsavel.trim(),
            dueDate: cardForm.dueDate,
            priority: cardForm.priority || null,
          }),
        });
      }
      setCardModal(null);
      setCardForm(EMPTY_CARD_FORM);
      void loadBoard(selectedProjectId);
    } finally {
      setSavingCard(false);
    }
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
                  {typeof data?.project?.progress === 'number' && (
                    <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/30">
                      {data.project.progress}% concluído
                    </span>
                  )}
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Arraste cards entre as colunas para atualizar o pipeline do cliente em tempo real. O progresso do projeto é calculado automaticamente pela coluna mais avançada.
                </p>
              </div>
            </div>

            {/* Project Picker */}
            <div className="relative">
              <button
                ref={pickerButtonRef}
                onClick={() => setShowProjectPicker((v) => !v)}
                className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/15 bg-white dark:bg-white/5 hover:border-[var(--color-accent)]/50 transition-all text-xs font-bold text-slate-900 dark:text-white shadow-sm"
              >
                <FiFolder className="w-4 h-4 text-[var(--color-accent)]" />
                <span>{selectedProject?.title || 'Selecione o Projeto'}</span>
                <FiChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {mounted && showProjectPicker && pickerPos && createPortal(
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowProjectPicker(false)} />
                  <div
                    className="fixed rounded-2xl bg-white dark:bg-[#0b1728] border border-slate-200 dark:border-white/15 shadow-2xl p-2 z-50"
                    style={{ top: pickerPos.top, left: pickerPos.left, width: pickerPos.width }}
                  >
                    <div className="max-h-72 overflow-y-auto space-y-1">
                      {projects.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => {
                            setSelectedProjectId(p.id);
                            setShowProjectPicker(false);
                          }}
                          className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors flex items-center justify-between gap-2 ${
                            selectedProjectId === p.id
                              ? 'bg-[var(--color-accent-dim)] text-[var(--color-accent)] font-bold'
                              : 'hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200'
                          }`}
                        >
                          <span className="truncate">{p.title}</span>
                          {p.client_name && <span className="text-[10px] text-slate-400 shrink-0">{p.client_name}</span>}
                        </button>
                      ))}
                    </div>
                  </div>
                </>,
                document.body
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
                      {col.cards.map((card) => {
                        const prio = card.priority ? PRIORITY_CONFIG[card.priority] : null;
                        const dueLabel = formatDate(card.due_date);
                        return (
                          <div
                            key={card.id}
                            draggable
                            onDragStart={() => setDragging({ cardId: card.id, fromColumnId: col.id })}
                            onDoubleClick={() => openEditCard(card)}
                            className="group p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-[var(--color-accent)]/50 transition-all hover:scale-[1.01] shadow-sm cursor-grab active:cursor-grabbing relative"
                            style={{ borderLeftWidth: prio ? 3 : undefined, borderLeftColor: prio ? prio.color : undefined }}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-xs font-bold text-slate-900 dark:text-white leading-snug flex-1">
                                {card.title}
                              </p>
                              <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                <button
                                  onClick={(e) => { e.stopPropagation(); openEditCard(card); }}
                                  className="p-1 text-slate-400 hover:text-[var(--color-accent)] transition-colors"
                                  title="Editar card"
                                >
                                  <FiEdit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleDeleteCard(card.id); }}
                                  className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                                  title="Excluir card"
                                >
                                  <FiTrash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            {card.description && (
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                                {card.description}
                              </p>
                            )}

                            {(card.responsavel || dueLabel || prio) && (
                              <div className="mt-2.5 pt-2 border-t border-slate-200/60 dark:border-white/5 flex flex-wrap items-center gap-x-2.5 gap-y-1">
                                {card.responsavel && (
                                  <span className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400 font-semibold">
                                    <span
                                      className="w-3.5 h-3.5 rounded-full flex items-center justify-center text-[7px] font-black text-white shrink-0"
                                      style={{ background: 'linear-gradient(135deg, #004aad, #00b09b)' }}
                                    >
                                      {card.responsavel[0]?.toUpperCase()}
                                    </span>
                                    {card.responsavel}
                                  </span>
                                )}
                                {dueLabel && (
                                  <span className="flex items-center gap-1 text-[10px] text-slate-400 font-mono">
                                    <FiCalendar className="w-2.5 h-2.5" />
                                    {dueLabel}
                                  </span>
                                )}
                                {prio && (
                                  <span
                                    className="ml-auto inline-flex items-center gap-1 text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full"
                                    style={{ background: prio.color + '18', color: prio.color }}
                                  >
                                    <FiFlag className="w-2.5 h-2.5" />
                                    {prio.label}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Add Card Button */}
                    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-white/10">
                      <button
                        onClick={() => openCreateCard(col.id)}
                        className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold bg-[var(--color-accent-dim)] text-[var(--color-accent)] hover:bg-[var(--color-accent)] hover:text-white transition-colors"
                      >
                        <FiPlus className="w-3.5 h-3.5" />
                        Adicionar tarefa
                      </button>
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

      {/* Card Create/Edit Modal */}
      {cardModal && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md"
          onClick={() => setCardModal(null)}
        >
          <div
            className="w-full max-w-lg rounded-2xl overflow-hidden bg-white dark:bg-[#0b1728] border border-slate-200 dark:border-white/15 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-5 flex items-center justify-between border-b border-slate-100 dark:border-white/10">
              <h2 className="text-base font-black text-slate-900 dark:text-white">
                {cardModal.mode === 'create' ? 'Nova Tarefa' : 'Editar Tarefa'}
              </h2>
              <button
                onClick={() => setCardModal(null)}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>

            <div className="px-6 py-5 flex flex-col gap-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider block mb-1.5 text-slate-700 dark:text-slate-300">
                  Título <span className="text-[var(--color-accent)]">*</span>
                </label>
                <input
                  autoFocus
                  value={cardForm.title}
                  onChange={(e) => setCardForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="Ex: Integrar API de pagamento"
                  className="w-full rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider block mb-1.5 text-slate-700 dark:text-slate-300">
                  Descrição
                </label>
                <textarea
                  value={cardForm.description}
                  onChange={(e) => setCardForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Detalhes da tarefa, requisitos, contexto..."
                  rows={3}
                  className="w-full rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 outline-none focus:ring-2 focus:ring-[var(--color-accent)] resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider mb-1.5 text-slate-700 dark:text-slate-300 flex items-center justify-between gap-1.5">
                    <span className="flex items-center gap-1.5">
                      <FiUser className="w-3 h-3" /> Responsável
                    </span>
                    {currentDevName && cardForm.responsavel !== currentDevName && (
                      <button
                        type="button"
                        onClick={() => setCardForm((f) => ({ ...f, responsavel: currentDevName }))}
                        className="text-[10px] font-bold normal-case text-[var(--color-accent)] hover:underline"
                      >
                        Assumir para mim
                      </button>
                    )}
                  </label>
                  <input
                    value={cardForm.responsavel}
                    onChange={(e) => setCardForm((f) => ({ ...f, responsavel: e.target.value }))}
                    placeholder="Nome do dev"
                    className="w-full rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider block mb-1.5 text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <FiCalendar className="w-3 h-3" /> Prazo
                  </label>
                  <input
                    type="date"
                    value={cardForm.dueDate}
                    onChange={(e) => setCardForm((f) => ({ ...f, dueDate: e.target.value }))}
                    className="w-full rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider block mb-1.5 text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <FiFlag className="w-3 h-3" /> Prioridade
                </label>
                <div className="flex gap-2">
                  {(['baixa', 'media', 'alta'] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setCardForm((f) => ({ ...f, priority: f.priority === p ? '' : p }))}
                      className="flex-1 px-3 py-2 rounded-xl text-xs font-bold border transition-all"
                      style={
                        cardForm.priority === p
                          ? { background: PRIORITY_CONFIG[p].color + '18', color: PRIORITY_CONFIG[p].color, borderColor: PRIORITY_CONFIG[p].color + '50' }
                          : { background: 'transparent', borderColor: 'rgba(148,163,184,0.3)', color: '#94a3b8' }
                      }
                    >
                      {PRIORITY_CONFIG[p].label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-white/10">
              <button
                onClick={() => setCardModal(null)}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveCard}
                disabled={savingCard || !cardForm.title.trim()}
                className="px-5 py-2 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-40"
                style={{ background: 'linear-gradient(135deg,#004aad,#00b09b)' }}
              >
                {savingCard ? 'Salvando…' : cardModal.mode === 'create' ? 'Criar Tarefa' : 'Salvar Alterações'}
              </button>
            </div>
          </div>
        </div>
      )}
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
