import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FiUser, FiCalendar, FiX, FiCheck, FiAlertTriangle, FiFlag } from 'react-icons/fi';

export type KanbanCard = {
  id: number;
  column_id: number;
  title: string;
  description: string | null;
  responsavel?: string | null;
  data?: string | null;
  due_date?: string | null;
  priority?: 'baixa' | 'media' | 'alta' | null;
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
  project: { id: number; title: string; progress?: number };
  columns: KanbanColumn[];
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
  const modalRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

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

  // Modal a11y: ESC fecha, foco no botão de fechar, foco volta ao gatilho
  const handleModalKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      setSelectedCard(null);
    }
  }, []);

  useEffect(() => {
    if (!selectedCard) return;
    const prevFocus = document.activeElement as HTMLElement | null;
    // Foco no botão de fechar quando o modal abre
    const t = setTimeout(() => closeBtnRef.current?.focus(), 0);
    document.addEventListener('keydown', handleModalKeyDown);
    return () => {
      clearTimeout(t);
      document.removeEventListener('keydown', handleModalKeyDown);
      prevFocus?.focus?.();
    };
  }, [selectedCard, handleModalKeyDown]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20" role="status" aria-live="polite">
        <div className="flex flex-col items-center gap-3">
          <div className="w-7 h-7 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'var(--color-accent)', borderTopColor: 'transparent' }} aria-hidden="true" />
          <span className="text-sm text-slate-400 dark:text-white/40">Carregando pipeline...</span>
        </div>
      </div>
    );
  }

  if (!data) return null;

  // Active stage = highest-index column that has at least 1 card
  const activeStageIdx = data.columns.reduce((best, col, idx) => col.cards.length > 0 ? idx : best, -1);

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
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-300 ${
                      isActive || isPast
                        ? 'text-white'
                        : 'border-slate-200 text-slate-400 dark:border-white/15 dark:text-white/50'
                    }`}
                    style={{
                      background: isActive || isPast ? color : 'transparent',
                      borderColor: isActive || isPast ? color : undefined,
                      boxShadow: isActive ? `0 0 12px ${color}60` : 'none',
                    }}
                    aria-label={`Etapa ${idx + 1}: ${col.title}${isPast || isActive ? (isPast ? ' (concluída)' : ' (em andamento)') : ''}`}
                  >
                    {isPast ? <FiCheck className="w-3.5 h-3.5" aria-hidden="true" /> : idx + 1}
                  </div>
                  <span
                    className={`text-xs font-semibold whitespace-nowrap transition-colors ${
                      isActive || isPast ? '' : 'text-slate-400 dark:text-white/50'
                    }`}
                    style={isActive || isPast ? { color: isActive ? color : color + 'cc' } : {}}
                  >
                    {short}
                  </span>
                </div>
                {idx < data.columns.length - 1 && (
                  <div
                    aria-hidden="true"
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
      <div className="mx-6 mt-4 rounded-xl px-4 py-3 flex items-start gap-2.5 bg-amber-50 border border-amber-200 dark:bg-amber-400/10 dark:border-amber-400/20" role="note">
        <FiAlertTriangle className="text-amber-500 dark:text-amber-400 shrink-0 mt-0.5" aria-hidden="true" />
        <p className="text-xs leading-relaxed text-amber-700 dark:text-amber-400/80">
          Serviços extras não previstos no escopo serão orçados à parte. Alterações após entrega podem gerar custos adicionais.
          Dúvidas? Fale com a equipe EasyDev.
        </p>
      </div>

      {/* ── Project title ── */}
      <div className="px-6 pt-5 pb-2 flex items-center gap-2.5">
        <span className="w-2.5 h-2.5 rounded-full animate-pulse bg-[#00b09b] shrink-0 inline-block" aria-hidden="true" />
        <h2 className="font-bold text-slate-900 dark:text-white text-base">{data.project.title}</h2>
        {typeof data.project.progress === 'number' && (
          <span className="text-xs font-black text-[var(--color-accent)] tabular-nums">{data.project.progress}%</span>
        )}
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
        role="region"
        aria-label="Pipeline de tarefas"
      >
        {data.columns.map((col) => {
          const accentColor = PIPELINE_COLORS[col.title] ?? '#64748b';
          return (
            <div
              key={col.id}
              className="shrink-0 rounded-2xl flex flex-col transition-all duration-200 bg-slate-50 border border-slate-200 dark:bg-white/5 dark:border-white/10"
              style={{ width: 272 }}
              role="group"
              aria-label={`${col.title}: ${col.cards.length} tarefa(s)`}
            >
              {/* Column header */}
              <div className="px-4 pt-4 pb-3 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ background: accentColor }} aria-hidden="true" />
                <span className="font-semibold text-sm text-slate-800 dark:text-white/80 flex-1 truncate">{col.title}</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full tabular-nums" style={{ background: accentColor + '18', color: accentColor }}>
                  {col.cards.length}
                </span>
              </div>

              {/* Cards */}
              <div className="px-3 pb-4 flex flex-col gap-2" style={{ minHeight: 72 }}>
                {col.cards.length === 0 && (
                  <div className="flex items-center justify-center py-7 text-xs rounded-xl border-2 border-dashed border-slate-300 text-slate-400 dark:border-white/10 dark:text-white/50">
                    Sem tarefas
                  </div>
                )}
                {col.cards.map(card => {
                  const prio = card.priority ? PRIORITY_CONFIG[card.priority] : null;
                  const dueLabel = formatDate(card.due_date || card.data);
                  return (
                  <div
                    key={card.id}
                    onDoubleClick={() => setSelectedCard(card)}
                    tabIndex={0}
                    role="button"
                    aria-label={`Ver detalhes: ${card.title}`}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedCard(card); } }}
                    className="group rounded-xl px-3.5 py-3 border transition-all duration-150 bg-white border-slate-200 shadow-sm hover:shadow-md dark:bg-white/10 dark:border-white/10 dark:shadow-[0_2px_8px_rgba(0,0,0,0.3)] focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:outline-none cursor-pointer relative overflow-hidden"
                    style={{ animationName: 'fadeInCard', animationDuration: '0.3s', animationFillMode: 'both', borderLeftWidth: prio ? 3 : undefined, borderLeftColor: prio ? prio.color : undefined }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-semibold text-[13px] text-slate-800 dark:text-white/90 leading-snug flex-1">{card.title}</div>
                      {prio && (
                        <span
                          className="shrink-0 inline-flex items-center gap-1 text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full"
                          style={{ background: prio.color + '18', color: prio.color }}
                        >
                          <FiFlag className="w-2.5 h-2.5" aria-hidden="true" />
                          {prio.label}
                        </span>
                      )}
                    </div>
                    {card.description && (
                      <div className="mt-1 text-xs leading-relaxed line-clamp-2 text-slate-500 dark:text-white/60">{card.description}</div>
                    )}
                    <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 pt-2 border-t border-slate-100 dark:border-white/5">
                      {card.responsavel && (
                        <span className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-white/50">
                          <span
                            className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-black text-white shrink-0"
                            style={{ background: 'linear-gradient(135deg, #004aad, #00b09b)' }}
                          >
                            {card.responsavel[0]?.toUpperCase()}
                          </span>
                          {card.responsavel}
                        </span>
                      )}
                      {dueLabel && (
                        <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-white/50">
                          <FiCalendar className="w-3 h-3" aria-hidden="true" />{dueLabel}
                        </span>
                      )}
                      <span
                        className="ml-auto text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{ background: accentColor + '15', color: accentColor }}
                      >
                        {PIPELINE_SHORT[col.title] ?? col.title}
                      </span>
                    </div>
                  </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes fadeInCard { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
        @media (prefers-reduced-motion: reduce) {
          .kanban-card-anim { animation: none !important; }
        }
      `}</style>

      {/* ── Card detail modal ── */}
      {selectedCard && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-[#0a0f1e]/75 backdrop-blur-md"
          onClick={() => setSelectedCard(null)}
        >
          <div
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="kanban-card-modal-title"
            className="w-full max-w-md rounded-2xl p-6 relative shadow-2xl bg-white border border-slate-200 dark:bg-[#131929] dark:border-[#00b09b]/20"
            onClick={e => e.stopPropagation()}
          >
            <button
              ref={closeBtnRef}
              onClick={() => setSelectedCard(null)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center transition text-slate-400 hover:bg-slate-100 dark:text-white/35 dark:hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:outline-none"
              aria-label="Fechar detalhes da tarefa"
            >
              <FiX className="w-4 h-4" aria-hidden="true" />
            </button>
            <h3 id="kanban-card-modal-title" className="font-bold text-lg text-slate-900 dark:text-white pr-10 leading-snug">{selectedCard.title}</h3>
            {selectedCard.priority && PRIORITY_CONFIG[selectedCard.priority] && (
              <span
                className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full"
                style={{ background: PRIORITY_CONFIG[selectedCard.priority].color + '18', color: PRIORITY_CONFIG[selectedCard.priority].color }}
              >
                <FiFlag className="w-3 h-3" aria-hidden="true" />
                Prioridade {PRIORITY_CONFIG[selectedCard.priority].label}
              </span>
            )}
            <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-white/55">{selectedCard.description || 'Sem descrição.'}</p>
            <div className="mt-4 flex flex-col gap-2">
              {selectedCard.responsavel && (
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-white/50">
                  <FiUser className="w-3.5 h-3.5" aria-hidden="true" /> Responsável: {selectedCard.responsavel}
                </div>
              )}
              {(selectedCard.due_date || selectedCard.data) && (
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-white/50">
                  <FiCalendar className="w-3.5 h-3.5" aria-hidden="true" /> Prazo: {formatDate(selectedCard.due_date || selectedCard.data)}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default KanbanBoard;
