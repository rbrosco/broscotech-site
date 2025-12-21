'use client';
import React, { useEffect, useMemo, useState } from 'react';
import DashboardSidebar from '../../component/DashboardSidebar';
import DashboardNav from '../../component/DashboardNav';
import { FiAlertCircle, FiPlus } from 'react-icons/fi';

type KanbanCard = {
  id: number;
  column_id: number;
  title: string;
  description: string | null;
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

export default function DashboardPage() {
    const [data, setData] = useState<KanbanResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [newColumnTitle, setNewColumnTitle] = useState('');
    const [newCardTitles, setNewCardTitles] = useState<Record<number, string>>({});
    const [dragging, setDragging] = useState<{ cardId: number; fromColumnId: number } | null>(null);

    const totals = useMemo(() => {
      const cols = data?.columns ?? [];
      const totalCards = cols.reduce((acc, c) => acc + (c.cards?.length ?? 0), 0);
      return { totalCards };
    }, [data]);

    const MAX_COLUMNS = 9;
    const canCreateColumn = (data?.columns?.length ?? 0) < MAX_COLUMNS;

    const reload = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/kanban', { credentials: 'include' });
        const payload = (await res.json()) as Partial<KanbanResponse> & { message?: string };
        if (!res.ok) throw new Error(payload.message || 'Falha ao carregar Kanban.');
        if (!payload.project || !payload.columns) throw new Error('Resposta inválida do servidor.');
        setData(payload as KanbanResponse);
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Erro desconhecido.';
        setError(msg);
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
      void reload();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const createColumn = async () => {
      const title = newColumnTitle.trim();
      if (!title) return;
      setNewColumnTitle('');
      try {
        const res = await fetch('/api/kanban', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'column', title }),
        });
        const payload = (await res.json()) as { message?: string };
        if (!res.ok) throw new Error(payload.message || 'Falha ao criar coluna.');
        await reload();
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Erro desconhecido.';
        setError(msg);
      }
    };

    const createCard = async (columnId: number) => {
      const title = (newCardTitles[columnId] || '').trim();
      if (!title) return;
      setNewCardTitles((prev) => ({ ...prev, [columnId]: '' }));
      try {
        const res = await fetch('/api/kanban', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'card', columnId, title }),
        });
        const payload = (await res.json()) as { message?: string };
        if (!res.ok) throw new Error(payload.message || 'Falha ao criar card.');
        await reload();
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Erro desconhecido.';
        setError(msg);
      }
    };

    const moveCard = async (cardId: number, toColumnId: number, toPosition: number) => {
      setData((prev) => {
        if (!prev) return prev;
        const columns = prev.columns.map((c) => ({ ...c, cards: [...c.cards] }));
        let moved: KanbanCard | null = null;

        for (const col of columns) {
          const idx = col.cards.findIndex((x) => x.id === cardId);
          if (idx >= 0) {
            moved = col.cards[idx];
            col.cards.splice(idx, 1);
            break;
          }
        }

        if (!moved) return prev;
        const dest = columns.find((c) => c.id === toColumnId);
        if (!dest) return prev;
        const normalizedPos = Math.max(0, Math.min(dest.cards.length, toPosition));
        dest.cards.splice(normalizedPos, 0, { ...moved, column_id: toColumnId });

        for (const col of columns) {
          col.cards = col.cards.map((card, i) => ({ ...card, position: i }));
        }

        return { ...prev, columns };
      });

      try {
        const res = await fetch('/api/kanban', {
          method: 'PATCH',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cardId, toColumnId, toPosition }),
        });
        const payload = (await res.json()) as { message?: string };
        if (!res.ok) throw new Error(payload.message || 'Falha ao mover card.');
        await reload();
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Erro desconhecido.';
        setError(msg);
        await reload();
      }
    };

    return (
      <div className="w-full relative flex ct-docs-disable-sidebar-content bg-blueGray-100 dark:bg-gray-900 min-h-screen min-w-0">
        <DashboardSidebar />
        <div className="relative md:ml-64 bg-blueGray-100 dark:bg-gray-900 w-full min-w-0 flex-1">
          <DashboardNav />

          <div className="px-4 md:px-6 mx-auto w-full pt-24 pb-10 min-w-0">
            <div className="rounded-3xl bg-white/90 dark:bg-gray-800/80 backdrop-blur-md border border-white/20 dark:border-gray-700/50 shadow-2xl p-5 sm:p-6 min-w-0">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">Dashboard Kanban</p>
                  <h1 className="mt-1 text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white">
                    {data?.project?.title || (loading ? 'Carregando…' : 'Projeto')}
                  </h1>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                    Total de cards: <span className="font-semibold">{loading ? '—' : totals.totalCards}</span>
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
                  {canCreateColumn ? (
                    <div className="flex gap-2">
                      <input
                        value={newColumnTitle}
                        onChange={(e) => setNewColumnTitle(e.target.value)}
                        placeholder="Nova coluna"
                        className="w-full sm:w-56 rounded-xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-900/40 px-3 py-2 text-sm text-slate-900 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={() => void createColumn()}
                        className="inline-flex items-center gap-2 rounded-xl bg-blue-600 text-white px-4 py-2 text-sm font-semibold hover:bg-blue-700 transition"
                      >
                        <FiPlus className="h-4 w-4" aria-hidden="true" />
                        Coluna
                      </button>
                    </div>
                  ) : null}

                  <button
                    type="button"
                    onClick={() => void reload()}
                    className="rounded-xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-900/40 px-4 py-2 text-sm font-semibold text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-gray-900/60 transition"
                  >
                    Atualizar
                  </button>
                </div>
              </div>

              {error && (
                <div className="mt-5 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-amber-100">
                  <div className="flex items-start gap-2">
                    <FiAlertCircle className="h-5 w-5 mt-0.5" aria-hidden="true" />
                    <div>
                      <p className="text-sm font-semibold">Não foi possível carregar o Kanban</p>
                      <p className="mt-1 text-xs text-amber-100/90 whitespace-pre-wrap">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-6 min-w-0">
                <div className="flex gap-4 overflow-x-auto pb-2 w-full max-w-full min-w-0">
                  {(data?.columns ?? []).map((col) => (
                    <div
                      key={col.id}
                      className="min-w-[260px] w-[260px] sm:min-w-[280px] sm:w-[280px] rounded-2xl bg-slate-50 dark:bg-gray-900/40 border border-slate-200 dark:border-gray-700 p-3"
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        const raw = e.dataTransfer.getData('text/plain');
                        const parsed = raw ? (JSON.parse(raw) as { cardId: number; fromColumnId: number }) : null;
                        const payload = parsed || dragging;
                        if (!payload) return;
                        void moveCard(payload.cardId, col.id, col.cards.length);
                        setDragging(null);
                      }}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <h2 className="text-sm font-semibold text-slate-900 dark:text-white">{col.title}</h2>
                        <span className="text-xs rounded-full px-2 py-0.5 border border-slate-200 dark:border-gray-700 bg-white/70 dark:bg-gray-800/60 text-slate-700 dark:text-slate-200">
                          {col.cards.length}
                        </span>
                      </div>

                      <div className="mt-3 space-y-2">
                        {col.cards.map((card, index) => (
                          <div
                            key={card.id}
                            draggable
                            onDragStart={(e) => {
                              const payload = { cardId: card.id, fromColumnId: col.id };
                              setDragging(payload);
                              e.dataTransfer.setData('text/plain', JSON.stringify(payload));
                              e.dataTransfer.effectAllowed = 'move';
                            }}
                            onDragEnd={() => setDragging(null)}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => {
                              e.preventDefault();
                              const raw = e.dataTransfer.getData('text/plain');
                              const parsed = raw ? (JSON.parse(raw) as { cardId: number; fromColumnId: number }) : null;
                              const payload = parsed || dragging;
                              if (!payload) return;
                              void moveCard(payload.cardId, col.id, index);
                              setDragging(null);
                            }}
                            className="cursor-grab active:cursor-grabbing rounded-xl bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 p-3 shadow-sm"
                          >
                            <p className="text-sm font-semibold text-slate-900 dark:text-white">{card.title}</p>
                            {card.description && (
                              <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 whitespace-pre-wrap">{card.description}</p>
                            )}
                          </div>
                        ))}
                      </div>

                      <div className="mt-3 flex gap-2">
                        <input
                          value={newCardTitles[col.id] || ''}
                          onChange={(e) => setNewCardTitles((prev) => ({ ...prev, [col.id]: e.target.value }))}
                          placeholder="Novo card"
                          className="w-full rounded-xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-900/40 px-3 py-2 text-sm text-slate-900 dark:text-white"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') void createCard(col.id);
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => void createCard(col.id)}
                          className="inline-flex items-center justify-center rounded-xl bg-slate-900 text-white px-3 py-2 text-sm font-semibold hover:bg-black/90 dark:bg-white dark:text-slate-900 dark:hover:bg-white/90 transition"
                          aria-label="Adicionar card"
                          title="Adicionar card"
                        >
                          <FiPlus className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {!loading && (data?.columns?.length ?? 0) === 0 && (
                  <p className="text-sm text-slate-600 dark:text-slate-300">Nenhuma coluna encontrada.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }