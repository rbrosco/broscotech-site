'use client';
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import DevSidebar from '../../../component/DevSidebar';
import DashboardNav from '../../../component/DashboardNav';
import { FiAlertCircle, FiPlus, FiChevronDown, FiLayers } from 'react-icons/fi';

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

export default function DevKanbanPage() {
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

  // Load all projects for selector
  useEffect(() => {
    (async () => {
      try {
        const me = await fetch('/api/me', { credentials: 'include' });
        if (!me.ok) { setError('Não autenticado.'); setLoading(false); return; }
        const meData = await me.json() as { role?: string };
        if (meData.role !== 'admin') { setError('Acesso restrito.'); setLoading(false); return; }

        const res = await fetch('/api/projects', { credentials: 'include' });
        if (res.ok) {
          const p = await res.json() as { projects?: { project: Project }[] };
          const list = (p.projects ?? []).map(d => d.project);
          setProjects(list);
          if (list.length > 0) setSelectedProjectId(list[0].id);
        }
      } catch { setError('Erro ao carregar projetos.'); }
      setLoading(false);
    })();
  }, []);

  const loadBoard = useCallback(async (projectId: number) => {
    setBoardLoading(true);
    try {
      const res = await fetch(`/api/kanban?projectId=${projectId}`, { credentials: 'include' });
      if (res.ok) {
        const p = await res.json() as KanbanResponse;
        setData(p);
      }
    } catch {}
    setBoardLoading(false);
  }, []);

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
      body: JSON.stringify({ action: 'add_column', title: newColumnTitle, projectId: selectedProjectId }),
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
      body: JSON.stringify({ action: 'add_card', column_id: columnId, title, projectId: selectedProjectId }),
    });
    setNewCardTitles(prev => ({ ...prev, [columnId]: '' }));
    void loadBoard(selectedProjectId);
  };

  const handleDrop = async (toColumnId: number) => {
    if (!dragging || dragging.fromColumnId === toColumnId || !selectedProjectId) return;
    await fetch('/api/kanban', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'move_card', card_id: dragging.cardId, to_column_id: toColumnId, projectId: selectedProjectId }),
    });
    setDragging(null);
    void loadBoard(selectedProjectId);
  };

  const handleDeleteCard = async (cardId: number) => {
    if (!selectedProjectId) return;
    await fetch('/api/kanban', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete_card', card_id: cardId, projectId: selectedProjectId }),
    });
    void loadBoard(selectedProjectId);
  };

  const selectedProject = projects.find(p => p.id === selectedProjectId);

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

  if (error) {
    return (
      <div style={{ minHeight: '100vh', background: '#080c18' }}>
        <DevSidebar />
        <div className="md:pl-64 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <FiAlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
            <p className="text-white">{error}</p>
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

        <main className="px-4 md:px-6 pt-[81px] pb-10">
          {/* Header + Project selector */}
          <div className="mt-6 flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(0,176,155,0.15)' }}>
                <FiLayers className="w-4 h-4" style={{ color: '#00b09b' }} />
              </div>
              <div>
                <h1 className="text-xl font-extrabold text-white">Kanban</h1>
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{totals} tarefas · {data?.columns.length ?? 0} colunas</p>
              </div>
            </div>

            {/* Project picker */}
            <div className="relative md:ml-auto">
              <button
                onClick={() => setShowProjectPicker(v => !v)}
                className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium transition"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', minWidth: '220px' }}
              >
                <div className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                  style={{ background: 'linear-gradient(135deg,#004aad,#00b09b)' }}>
                  {selectedProject?.title[0] ?? '?'}
                </div>
                <span className="flex-1 text-left truncate">{selectedProject?.title ?? 'Selecionar projeto'}</span>
                <FiChevronDown className="w-3.5 h-3.5 shrink-0" style={{ color: 'rgba(255,255,255,0.4)' }} />
              </button>

              {showProjectPicker && (
                <div
                  className="absolute top-full left-0 mt-1 w-full rounded-xl overflow-hidden z-30"
                  style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}
                >
                  {projects.map(p => (
                    <button
                      key={p.id}
                      onClick={() => { setSelectedProjectId(p.id); setShowProjectPicker(false); }}
                      className="w-full text-left px-4 py-3 flex items-center gap-3 transition hover:bg-white/05"
                      style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
                    >
                      <div className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                        style={{ background: 'linear-gradient(135deg,#004aad,#00b09b)' }}>
                        {p.title[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-white truncate">{p.title}</p>
                        <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>{p.client_name ?? 'Sem cliente'} · {p.status ?? '—'}</p>
                      </div>
                      {p.id === selectedProjectId && <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: '#00b09b' }} />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Board */}
          {boardLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-6 h-6 rounded-full border-2 animate-spin" style={{ borderColor: '#00b09b', borderTopColor: 'transparent' }} />
            </div>
          ) : (
            <div className="mt-5 flex gap-4 overflow-x-auto pb-4" style={{ minHeight: '60vh' }}>
              {(data?.columns ?? []).map(col => (
                <div
                  key={col.id}
                  className="shrink-0 flex flex-col rounded-2xl overflow-hidden"
                  style={{ width: '272px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
                  onDragOver={e => e.preventDefault()}
                  onDrop={() => void handleDrop(col.id)}
                >
                  {/* Column header */}
                  <div className="px-4 py-3 flex items-center gap-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                    <div className="w-2 h-2 rounded-full" style={{ background: '#00b09b' }} />
                    <span className="text-xs font-bold text-white flex-1">{col.title}</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: 'rgba(0,176,155,0.12)', color: '#00b09b' }}>
                      {col.cards.length}
                    </span>
                  </div>

                  {/* Cards */}
                  <div className="flex-1 p-2 flex flex-col gap-2 overflow-y-auto" style={{ maxHeight: '60vh' }}>
                    {col.cards.map(card => (
                      <div
                        key={card.id}
                        draggable
                        onDragStart={() => setDragging({ cardId: card.id, fromColumnId: col.id })}
                        onDragEnd={() => setDragging(null)}
                        className="group px-3.5 py-3 rounded-xl cursor-grab active:cursor-grabbing relative"
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                      >
                        <p className="text-xs font-semibold text-white pr-5 leading-relaxed">{card.title}</p>
                        {card.description && <p className="text-[11px] mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>{card.description}</p>}
                        {card.responsavel && (
                          <p className="text-[10px] mt-1.5 font-medium" style={{ color: '#00b09b' }}>@ {card.responsavel}</p>
                        )}
                        <button
                          onClick={() => void handleDeleteCard(card.id)}
                          className="absolute top-2 right-2 w-5 h-5 rounded-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-white/40 hover:text-red-400 hover:bg-red-400/10"
                          style={{ fontSize: '10px' }}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add card input */}
                  <div className="p-2" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <div className="flex gap-1.5">
                      <input
                        className="flex-1 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder:text-white/25 outline-none"
                        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
                        placeholder="Nova tarefa..."
                        value={newCardTitles[col.id] ?? ''}
                        onChange={e => setNewCardTitles(prev => ({ ...prev, [col.id]: e.target.value }))}
                        onKeyDown={e => { if (e.key === 'Enter') void handleAddCard(col.id); }}
                      />
                      <button
                        onClick={() => void handleAddCard(col.id)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition hover:opacity-80"
                        style={{ background: 'linear-gradient(135deg,#004aad,#00b09b)' }}
                      >
                        <FiPlus className="w-3.5 h-3.5 text-white" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Add column */}
              <div className="shrink-0 flex flex-col gap-2" style={{ width: '220px' }}>
                <input
                  className="rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-white/30 outline-none"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px dashed rgba(255,255,255,0.12)' }}
                  placeholder="Nova coluna..."
                  value={newColumnTitle}
                  onChange={e => setNewColumnTitle(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') void handleAddColumn(); }}
                />
                <button
                  onClick={() => void handleAddColumn()}
                  className="flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-semibold transition hover:opacity-80"
                  style={{ background: 'rgba(0,176,155,0.1)', color: '#00b09b', border: '1px solid rgba(0,176,155,0.2)' }}
                >
                  <FiPlus className="w-4 h-4" /> Adicionar coluna
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
