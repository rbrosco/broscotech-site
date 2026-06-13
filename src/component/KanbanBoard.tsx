import React, { useState, useEffect } from 'react';
import { FiUser, FiCalendar, FiX } from 'react-icons/fi';

export type KanbanCard = {
  id: number;
  column_id: number;
  title: string;
  description: string | null;
  responsavel?: string | null;
  data?: string | null;
  position: number;
};

export type KanbanColumn = {
  id: number;
  project_id: number;
  title: string;
  position: number;
  cards: KanbanCard[];
};

type KanbanData = {
  project: { id: number; title: string };
  columns: KanbanColumn[];
};

const PIPELINE_COLORS: Record<string, string> = {
  'Backlog': '#64748b',
  'Levantamento de Requisitos': '#3b82f6',
  'Planejamento': '#6366f1',
  'Design UI/UX': '#8b5cf6',
  'Desenvolvimento': '#00b09b',
  'Code Review': '#06b6d4',
  'Testes': '#f59e0b',
  'Homologação': '#f97316',
  'Deploy': '#10b981',
  'Aguardando Cliente': '#eab308',
  'Concluído': '#22c55e',
};

const PIPELINE_SHORT: Record<string, string> = {
  'Levantamento de Requisitos': 'Requisitos',
  'Planejamento': 'Plano',
  'Design UI/UX': 'Design',
  'Desenvolvimento': 'Dev',
  'Code Review': 'Review',
  'Homologação': 'Homolog.',
  'Aguardando Cliente': 'Cliente',
};

function KanbanBoard({ projectId }: { projectId: number }) {
  const [data, setData] = useState<KanbanData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCard, setSelectedCard] = useState<KanbanCard | null>(null);
  const [dragging, setDragging] = useState<{ cardId: number; fromColumnId: number } | null>(null);
  const [dragOverCol, setDragOverCol] = useState<number | null>(null);

  useEffect(() => {
    if (!projectId) return;
    setLoading(true);
    fetch(`/api/kanban?projectId=${projectId}`, { credentials: 'include' })
      .then(r => r.json())
      .then(d => {
        if (d.project && d.columns) {
          setData({ project: d.project, columns: d.columns as KanbanColumn[] });
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [projectId]);

  const persistMove = (cardId: number, toColumnId: number) => {
    fetch('/api/kanban', {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cardId, toColumnId, toPosition: 0 }),
    });
  };

  const handleDrop = (toColumnId: number) => {
    if (!dragging || dragging.fromColumnId === toColumnId) { setDragOverCol(null); return; }
    const fromColId = dragging.fromColumnId;
    const cardId = dragging.cardId;
    setData(prev => {
      if (!prev) return prev;
      const card = prev.columns.find(c => c.id === fromColId)?.cards.find(c => c.id === cardId);
      if (!card) return prev;
      return {
        ...prev,
        columns: prev.columns.map(col => {
          if (col.id === fromColId) return { ...col, cards: col.cards.filter(c => c.id !== cardId) };
          if (col.id === toColumnId) return { ...col, cards: [...col.cards, { ...card, column_id: toColumnId }] };
          return col;
        }),
      };
    });
    persistMove(cardId, toColumnId);
    setDragging(null);
    setDragOverCol(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="w-7 h-7 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#00b09b', borderTopColor: 'transparent' }} />
          <span className="text-sm text-slate-400">Carregando pipeline...</span>
        </div>
      </div>
    );
  }

  if (!data) return null;

  // Active stage = highest-index column that has at least 1 card
  const activeStageIdx = data.columns.reduce((best, col, idx) => col.cards.length > 0 ? idx : best, -1);

  {/* OLD render — replaced below */}
  const _unused = null; void _unused; // suppress unused var warning

  return (
    <div className="flex flex-col min-w-0">
      {/* ── Pipeline Stage Tracker ── */}
      <div className="px-6 pt-6 pb-5 overflow-x-auto" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="flex items-center gap-0 min-w-max">
          {data.columns.map((col, idx) => {
            const isPast = idx < activeStageIdx;
            const isActive = idx === activeStageIdx;
            const color = PIPELINE_COLORS[col.title] ?? '#64748b';
            const short = PIPELINE_SHORT[col.title] ?? col.title;
            return (
              <React.Fragment key={col.id}>
                <div className="flex flex-col items-center gap-1.5">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold border-2 transition-all duration-300"
                    style={{
                      background: isActive ? color : isPast ? color : 'transparent',
                      borderColor: isActive || isPast ? color : 'rgba(255,255,255,0.15)',
                      color: isActive || isPast ? '#fff' : 'rgba(255,255,255,0.25)',
                      boxShadow: isActive ? `0 0 12px ${color}60` : 'none',
                    }}
                  >
                    {isPast ? '✓' : idx + 1}
                  </div>
                  <span
                    className="text-[9px] font-semibold whitespace-nowrap transition-colors"
                    style={{ color: isActive ? color : isPast ? color + 'aa' : '#cbd5e1' }}
                  >
                    {short}
                  </span>
                </div>
                {idx < data.columns.length - 1 && (
                  <div
                    className="h-[2px] w-6 mt-[-14px] mx-0.5 rounded-full transition-all duration-300"
                    style={{ background: idx < activeStageIdx ? PIPELINE_COLORS[data.columns[idx + 1]?.title] ?? '#00b09b' : 'rgba(255,255,255,0.12)' }}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* ── Important notice ── */}
      <div className="mx-6 mt-4 rounded-xl px-4 py-3 flex items-start gap-2.5" style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)' }}>
        <span className="text-amber-400 shrink-0 mt-0.5">⚠</span>
        <p className="text-xs leading-relaxed" style={{ color: 'rgba(251,191,36,0.8)' }}>
          Serviços extras não previstos no escopo serão orçados à parte. Alterações após entrega podem gerar custos adicionais.
          Dúvidas? Fale com a equipe EasyDev.
        </p>
      </div>

      {/* ── Project title ── */}
      <div className="px-6 pt-5 pb-2 flex items-center gap-2.5">
        <span className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ background: '#00b09b', display: 'inline-block', flexShrink: 0 }} />
        <h2 className="font-bold text-white text-base">{data.project.title}</h2>
        {activeStageIdx >= 0 && (
          <span
            className="ml-auto text-xs font-semibold px-3 py-1 rounded-full"
            style={{ background: (PIPELINE_COLORS[data.columns[activeStageIdx]?.title] ?? '#00b09b') + '15', color: PIPELINE_COLORS[data.columns[activeStageIdx]?.title] ?? '#00b09b' }}
          >
            {data.columns[activeStageIdx]?.title}
          </span>
        )}
      </div>

      {/* ── Kanban columns ── */}
      <div className="px-4 pb-6 pt-3 flex gap-4 overflow-x-auto items-start" style={{ minHeight: '42vh' }}>
        {data.columns.map((col) => {
          const accentColor = PIPELINE_COLORS[col.title] ?? '#64748b';
          const isOver = dragOverCol === col.id;
          return (
            <div
              key={col.id}
              className="shrink-0 rounded-2xl flex flex-col transition-all duration-200"
              style={{
                width: 272,
                background: isOver ? accentColor + '18' : 'rgba(255,255,255,0.04)',
                border: `1.5px solid ${isOver ? accentColor + '60' : 'rgba(255,255,255,0.08)'}`,  
              }}
              onDragOver={e => { e.preventDefault(); setDragOverCol(col.id); }}
              onDragLeave={() => setDragOverCol(null)}
              onDrop={() => handleDrop(col.id)}
            >
              {/* Column header */}
              <div className="px-4 pt-4 pb-3 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ background: accentColor }} />
                <span className="font-semibold text-sm text-white/80 flex-1 truncate">{col.title}</span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full tabular-nums" style={{ background: accentColor + '18', color: accentColor }}>
                  {col.cards.length}
                </span>
              </div>

              {/* Cards */}
              <div className="px-3 pb-4 flex flex-col gap-2" style={{ minHeight: 72 }}>
                {col.cards.length === 0 && (
                  <div className="flex items-center justify-center py-7 text-xs rounded-xl border-2 border-dashed" style={{ color: 'rgba(255,255,255,0.2)', borderColor: 'rgba(255,255,255,0.08)' }}>
                    Sem tarefas
                  </div>
                )}
                {col.cards.map(card => (
                  <div
                    key={card.id}
                    draggable
                    onDragStart={() => setDragging({ cardId: card.id, fromColumnId: col.id })}
                    onDragEnd={() => { setDragging(null); setDragOverCol(null); }}
                    onDoubleClick={() => setSelectedCard(card)}
                    className="group rounded-xl px-3.5 py-3 border cursor-grab hover:-translate-y-0.5 transition-all duration-150 active:cursor-grabbing"
                    style={{ background: 'rgba(255,255,255,0.07)', borderColor: 'rgba(255,255,255,0.1)', animationName: 'fadeInCard', animationDuration: '0.3s', animationFillMode: 'both', boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }}
                  >
                    <div className="font-semibold text-[13px] text-white/90 leading-snug">{card.title}</div>
                    {card.description && (
                      <div className="mt-1 text-[11px] leading-relaxed line-clamp-2" style={{ color: 'rgba(255,255,255,0.45)' }}>{card.description}</div>
                    )}
                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                      {card.responsavel && (
                        <span className="flex items-center gap-1 text-[10px]" style={{ color: 'rgba(255,255,255,0.35)' }}>
                          <FiUser className="w-2.5 h-2.5" />{card.responsavel}
                        </span>
                      )}
                      {card.data && (
                        <span className="flex items-center gap-1 text-[10px]" style={{ color: 'rgba(255,255,255,0.35)' }}>
                          <FiCalendar className="w-2.5 h-2.5" />{card.data}
                        </span>
                      )}
                      <span
                        className="ml-auto text-[10px] px-2 py-0.5 rounded-full font-medium"
                        style={{ background: accentColor + '15', color: accentColor }}
                      >
                        {PIPELINE_SHORT[col.title] ?? col.title}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes fadeInCard { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
      `}</style>

      {/* ── Card detail modal ── */}
      {selectedCard && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(10,15,30,0.75)', backdropFilter: 'blur(6px)' }}
          onClick={() => setSelectedCard(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl p-6 relative shadow-2xl"
            style={{ background: '#131929', border: '1px solid rgba(0,176,155,0.2)' }}
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedCard(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center transition"
              style={{ color: 'rgba(255,255,255,0.35)' }}
            >
              <FiX className="w-4 h-4" />
            </button>
            <h3 className="font-bold text-lg text-white pr-8 leading-snug">{selectedCard.title}</h3>
            <p className="mt-3 text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>{selectedCard.description || 'Sem descrição.'}</p>
            <div className="mt-4 flex flex-col gap-2">
              {selectedCard.responsavel && (
                <div className="flex items-center gap-2 text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
                  <FiUser className="w-3.5 h-3.5" /> Responsável: {selectedCard.responsavel}
                </div>
              )}
              {selectedCard.data && (
                <div className="flex items-center gap-2 text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
                  <FiCalendar className="w-3.5 h-3.5" /> Data: {selectedCard.data}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  //#endregion
}
export default KanbanBoard;
