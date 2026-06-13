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
  }, [data, loading]);
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
      <div className="px-6 pt-6 pb-5 overflow-x-auto border-b border-slate-200 dark:border-white/10">
        <div className="flex items-center gap-0 min-w-max">
          {data.columns.map((col, idx) => {
            const isPast = idx < activeStageIdx;
            const isActive = idx === activeStageIdx;
            const color = PIPELINE_COLORS[col.title] ?? '#64748b';
            const short = PIPELINE_SHORT[col.title] ?? col.title;
            return (
              <React.Fragment key={col.id}>
                <div className="flex flex-col items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold border-2 transition-all duration-300 ${
                      isActive || isPast
                        ? 'text-white'
                        : 'border-slate-200 text-slate-400 dark:border-white/15 dark:text-white/30'
                    }`}
                    style={{
                      background: isActive || isPast ? color : 'transparent',
                      borderColor: isActive || isPast ? color : undefined,
                      boxShadow: isActive ? `0 0 12px ${color}60` : 'none',
                    }}
                  >
                    {isPast ? '✓' : idx + 1}
                  </div>
                  <span
                    className={`text-[10px] font-semibold whitespace-nowrap transition-colors ${
                      isActive || isPast ? '' : 'text-slate-400 dark:text-white/30'
                    }`}
                    style={isActive || isPast ? { color: isActive ? color : color + 'cc' } : {}}
                  >
                    {short}
                  </span>
                </div>
                {idx < data.columns.length - 1 && (
                  <div
                    className={`h-[2px] w-8 mt-[-18px] mx-1 rounded-full transition-all duration-300 ${
                      idx < activeStageIdx ? '' : 'bg-slate-200 dark:bg-white/10'
                    }`}
                    style={idx < activeStageIdx ? { background: PIPELINE_COLORS[data.columns[idx + 1]?.title] ?? '#00b09b' } : {}}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* ── Important notice ── */}
      <div className="mx-6 mt-4 rounded-xl px-4 py-3 flex items-start gap-2.5 bg-amber-50 border border-amber-200 dark:bg-amber-400/10 dark:border-amber-400/20">
        <span className="text-amber-500 dark:text-amber-400 shrink-0 mt-0.5">⚠</span>
        <p className="text-xs leading-relaxed text-amber-700 dark:text-amber-400/80">
          Serviços extras não previstos no escopo serão orçados à parte. Alterações após entrega podem gerar custos adicionais.
          Dúvidas? Fale com a equipe EasyDev.
        </p>
      </div>

      {/* ── Project title ── */}
      <div className="px-6 pt-5 pb-2 flex items-center gap-2.5">
        <span className="w-2.5 h-2.5 rounded-full animate-pulse bg-[#00b09b] shrink-0 inline-block" />
        <h2 className="font-bold text-slate-900 dark:text-white text-base">{data.project.title}</h2>
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
      <div 
        ref={scrollContainerRef}
        className="px-4 pb-6 pt-3 flex gap-4 overflow-x-auto items-start scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-white/10" 
        style={{ minHeight: '42vh' }}
        onWheel={(e) => {
          if (e.deltaY !== 0 && e.deltaX === 0) {
            e.currentTarget.scrollLeft += e.deltaY;
          }
        }}
      >
        {data.columns.map((col) => {
          const accentColor = PIPELINE_COLORS[col.title] ?? '#64748b';
          return (
            <div
              key={col.id}
              className="shrink-0 rounded-2xl flex flex-col transition-all duration-200 bg-slate-50 border border-slate-200 dark:bg-white/5 dark:border-white/10"
              style={{ width: 272 }}
            >
              {/* Column header */}
              <div className="px-4 pt-4 pb-3 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ background: accentColor }} />
                <span className="font-semibold text-sm text-slate-800 dark:text-white/80 flex-1 truncate">{col.title}</span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full tabular-nums" style={{ background: accentColor + '18', color: accentColor }}>
                  {col.cards.length}
                </span>
              </div>

              {/* Cards */}
              <div className="px-3 pb-4 flex flex-col gap-2" style={{ minHeight: 72 }}>
                {col.cards.length === 0 && (
                  <div className="flex items-center justify-center py-7 text-xs rounded-xl border-2 border-dashed border-slate-300 text-slate-400 dark:border-white/10 dark:text-white/20">
                    Sem tarefas
                  </div>
                )}
                {col.cards.map(card => (
                  <div
                    key={card.id}
                    onDoubleClick={() => setSelectedCard(card)}
                    className="group rounded-xl px-3.5 py-3 border transition-all duration-150 bg-white border-slate-200 shadow-sm hover:shadow-md dark:bg-white/10 dark:border-white/10 dark:shadow-[0_2px_8px_rgba(0,0,0,0.3)]"
                    style={{ animationName: 'fadeInCard', animationDuration: '0.3s', animationFillMode: 'both' }}
                  >
                    <div className="font-semibold text-[13px] text-slate-800 dark:text-white/90 leading-snug">{card.title}</div>
                    {card.description && (
                      <div className="mt-1 text-[11px] leading-relaxed line-clamp-2 text-slate-500 dark:text-white/45">{card.description}</div>
                    )}
                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                      {card.responsavel && (
                        <span className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-white/35">
                          <FiUser className="w-2.5 h-2.5" />{card.responsavel}
                        </span>
                      )}
                      {card.data && (
                        <span className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-white/35">
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
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-[#0a0f1e]/75 backdrop-blur-md"
          onClick={() => setSelectedCard(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl p-6 relative shadow-2xl bg-white border border-slate-200 dark:bg-[#131929] dark:border-[#00b09b]/20"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedCard(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center transition text-slate-400 hover:bg-slate-100 dark:text-white/35 dark:hover:bg-white/10"
            >
              <FiX className="w-4 h-4" />
            </button>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white pr-8 leading-snug">{selectedCard.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-white/55">{selectedCard.description || 'Sem descrição.'}</p>
            <div className="mt-4 flex flex-col gap-2">
              {selectedCard.responsavel && (
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-white/35">
                  <FiUser className="w-3.5 h-3.5" /> Responsável: {selectedCard.responsavel}
                </div>
              )}
              {selectedCard.data && (
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-white/35">
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
