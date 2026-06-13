'use client';

import { useEffect, useState } from 'react';
import PopupPlanejamento from '../../component/PopupPlanejamento';
import DashboardNav from '../../component/DashboardNav';
import Sidebar from '../../component/Sidebar';
import { FiCalendar, FiClock, FiFolder, FiTrendingUp, FiAlertCircle, FiChevronRight } from 'react-icons/fi';

type Update = { id: number; kind: string; message: string; created_at: string };

type ProjectDetails = {
  id?: number;
  title?: string;
  status?: string;
  progress?: number;
  client_name?: string;
  client_email?: string;
  client_phone?: string;
  project_type?: string;
  final_date?: string | null;
  [key: string]: unknown;
};

type ProjectWithUpdates = {
  project: { id: number; title: string; status: string; progress: number; updated_at: string };
  updates: Update[];
};

function parseProjeto(message: string): { texto?: string; projeto?: ProjectDetails } | null {
  try {
    if (message.startsWith('{')) {
      const obj = JSON.parse(message) as Record<string, unknown>;
      return {
        texto: typeof obj.texto === 'string' ? obj.texto : undefined,
        projeto: obj.projeto && typeof obj.projeto === 'object' ? (obj.projeto as ProjectDetails) : undefined,
      };
    }
  } catch {}
  return null;
}

const KIND_COLOR: Record<string, string> = {
  update: '#00b09b',
  note: '#6366f1',
  milestone: '#f59e0b',
  alert: '#ef4444',
};
const KIND_LABEL: Record<string, string> = {
  update: 'Atualização',
  note: 'Nota',
  milestone: 'Marco',
  alert: 'Alerta',
};

export default function PlanejamentoPage() {
  const [projectsData, setProjectsData] = useState<ProjectWithUpdates[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [popupOpen, setPopupOpen] = useState(false);
  const [selectedUpdate, setSelectedUpdate] = useState<Update | null>(null);
  const [projectDetails, setProjectDetails] = useState<ProjectDetails | null>(null);
  const [acceptedStatus, setAcceptedStatus] = useState<'accepted' | 'rejected' | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [expandedProject, setExpandedProject] = useState<number | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        // Usa /api/me que lê o role do banco diretamente
        const meRes = await fetch('/api/me', { credentials: 'include' });
        const me = await meRes.json();
        const admin = me?.role === 'admin';
        setIsAdmin(admin);

        if (admin) {
          const res = await fetch('/api/projects', { credentials: 'include' });
          const payload = await res.json();
          if (!res.ok) throw new Error(payload.message || 'Falha ao carregar.');
          const list: ProjectWithUpdates[] = Array.isArray(payload.projects) 
            ? payload.projects.map((p: any) => ({
                project: {
                  id: p.id,
                  title: p.title,
                  status: p.status,
                  progress: p.progress,
                  updated_at: p.updated_at
                },
                updates: p.updates || []
              }))
            : [];
          setProjectsData(list);
          if (list.length > 0) setExpandedProject(list[0].project.id);
        } else {
          const res = await fetch('/api/projects', { credentials: 'include' });
          const payload = await res.json();
          if (!res.ok) throw new Error(payload.message || 'Falha ao carregar.');
          // Formato singular: { project, updates }
          if (payload.project) {
            setProjectsData([{ project: payload.project, updates: payload.updates ?? [] }]);
            setExpandedProject(payload.project.id);
          }
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Erro desconhecido.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const totalUpdates = projectsData.reduce((s, p) => s + p.updates.length, 0);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-200 selection:bg-cyan-500/30">
      <Sidebar />
      <div className="md:pl-[var(--sidebar-width,5rem)] transition-[padding] duration-300 flex flex-col min-h-screen">
        <DashboardNav />

        <main className="flex-1 px-4 md:px-8 pt-[65px] pb-8">

          {/* Header */}
          <div className="relative overflow-hidden rounded-3xl mt-4 px-8 py-8 bg-white dark:bg-transparent bg-gradient-to-br from-indigo-50 via-cyan-50 to-emerald-50 dark:from-indigo-600/10 dark:via-cyan-500/5 dark:to-emerald-500/10 border border-slate-200 dark:border-white/5 shadow-xl dark:shadow-2xl group">
            <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-cyan-500/20 blur-[80px] pointer-events-none group-hover:bg-cyan-400/20 transition-colors duration-700" />
            <div className="absolute -bottom-20 left-20 w-72 h-72 rounded-full bg-indigo-500/20 blur-[80px] pointer-events-none group-hover:bg-indigo-400/20 transition-colors duration-700" />
            
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight relative z-10">Planejamento</h1>
            <p className="mt-2 text-sm md:text-base text-slate-500 dark:text-slate-400 max-w-md leading-relaxed relative z-10">
              Registro de tudo que foi discutido e definido sobre o projeto.
            </p>
            {!loading && (
              <div className="flex flex-wrap gap-4 mt-6 relative z-10">
                {[
                  { label: 'Projetos', value: projectsData.length, icon: FiFolder, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-400/10', border: 'border-indigo-100 dark:border-indigo-400/20' },
                  { label: 'Registros', value: totalUpdates, icon: FiTrendingUp, color: 'text-cyan-600 dark:text-cyan-400', bg: 'bg-cyan-50 dark:bg-cyan-400/10', border: 'border-cyan-100 dark:border-cyan-400/20' },
                ].map(({ label, value, icon: Icon, color, bg, border }) => (
                  <div key={label} className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl border ${bg} ${border} shadow-sm dark:shadow-lg`}>
                    <Icon className={`w-4 h-4 shrink-0 ${color}`} />
                    <span className="text-slate-900 dark:text-white font-black tabular-nums text-sm">{value}</span>
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-widest">{label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="mt-5">
            {loading ? (
              <div className="flex items-center justify-center py-24 gap-3">
                <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#00b09b', borderTopColor: 'transparent' }} />
                <span className="text-sm text-slate-500 dark:text-white/35">Carregando planejamento...</span>
              </div>
            ) : error ? (
              <div className="flex items-center gap-4 rounded-2xl px-6 py-5 mt-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 shadow-sm dark:shadow-lg">
                <FiAlertCircle className="w-6 h-6 text-red-500 dark:text-red-400 shrink-0" />
                <p className="text-sm font-bold text-red-600 dark:text-red-300">{error}</p>
              </div>
            ) : projectsData.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 gap-5">
                <div className="w-20 h-20 rounded-3xl flex items-center justify-center bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-100 dark:border-cyan-500/20 shadow-sm dark:shadow-[0_0_30px_rgba(6,182,212,0.15)] relative">
                  <div className="absolute inset-0 bg-cyan-400 blur-xl opacity-20 rounded-3xl animate-pulse" />
                  <FiCalendar className="w-10 h-10 text-cyan-600 dark:text-cyan-400 relative z-10" />
                </div>
                <p className="text-slate-500 dark:text-slate-400 font-medium">Nenhum registro de planejamento ainda.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {projectsData.map(({ project, updates }) => {
                  const isExpanded = expandedProject === project.id;
                  return (
                    <div
                      key={project.id}
                      className="rounded-3xl overflow-hidden transition-all duration-300 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10 hover:bg-slate-50 dark:hover:bg-white/[0.07] shadow-sm dark:shadow-lg"
                    >
                      {/* Project header */}
                      <button
                        className="w-full px-6 py-5 flex items-center gap-4 text-left transition-colors hover:bg-slate-50 dark:hover:bg-white/5 group"
                        onClick={() => setExpandedProject(isExpanded ? null : project.id)}
                      >
                        <div className="w-2.5 h-2.5 rounded-full shrink-0 bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.6)] animate-pulse" />
                        <span className="font-black text-slate-900 dark:text-white flex-1 text-lg tracking-tight group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">{project.title}</span>
                        {project.status && (
                          <span className="text-xs px-3 py-1.5 rounded-xl font-bold bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-500/20 shadow-sm dark:shadow-[0_0_15px_rgba(6,182,212,0.1)]">
                            {project.status}
                          </span>
                        )}
                        {typeof project.progress === 'number' && (
                          <span className="text-xs font-black tabular-nums text-slate-500 dark:text-slate-400">
                            {project.progress}%
                          </span>
                        )}
                        <span className="text-xs px-3 py-1.5 rounded-xl ml-2 font-bold bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-white/10">
                          {updates.length} registro{updates.length !== 1 ? 's' : ''}
                        </span>
                        <FiChevronRight
                          className={`w-5 h-5 shrink-0 transition-transform duration-300 text-slate-400 dark:text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white ${isExpanded ? 'rotate-90' : ''}`}
                        />
                      </button>

                      {/* Progress bar */}
                      {isExpanded && typeof project.progress === 'number' && project.progress > 0 && (
                        <div className="px-6 pb-4">
                          <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-900 shadow-inner overflow-hidden border border-slate-200 dark:border-white/5">
                            <div className="h-full rounded-full transition-all duration-1000 relative" style={{ width: `${project.progress}%`, background: 'linear-gradient(90deg,#4f46e5,#06b6d4)' }}>
                               <div className="absolute inset-0 bg-white/20 mix-blend-overlay animate-pulse" />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Updates list */}
                      {isExpanded && (
                        <div className="px-6 pb-6 flex flex-col gap-4 border-t border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900/30 pt-6 relative before:absolute before:inset-y-6 before:left-9 before:w-px before:bg-slate-200 dark:before:bg-white/10">
                          {updates.length === 0 ? (
                            <p className="text-center py-8 text-sm font-bold text-slate-500">Nenhum registro.</p>
                          ) : (
                            updates.map(u => {
                              const parsed = parseProjeto(u.message);
                              const projeto = parsed?.projeto;
                              const accentColor = KIND_COLOR[u.kind] ?? '#00b09b';
                              return (
                                <div
                                  key={u.id}
                                  className="group relative rounded-2xl px-5 py-4 cursor-pointer transition-all hover:-translate-y-1 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10 hover:bg-slate-50 dark:hover:bg-white/10 ml-8 shadow-sm hover:shadow-md dark:shadow-md dark:hover:shadow-lg"
                                  onClick={() => { setSelectedUpdate(u); setProjectDetails(projeto || null); setAcceptedStatus(null); setPopupOpen(true); }}
                                >
                                  {/* Timeline dot */}
                                  <div 
                                    className="absolute -left-9 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-white dark:border-slate-900 shadow-[0_0_10px_rgba(255,255,255,0.2)] transition-transform group-hover:scale-125"
                                    style={{ background: accentColor }}
                                  />
                                  
                                  <div className="flex items-center gap-3 flex-wrap">
                                    <span className="text-[10px] font-black uppercase px-3 py-1 rounded-xl tracking-widest border" style={{ background: accentColor + '15', color: accentColor, borderColor: accentColor + '30' }}>
                                      {KIND_LABEL[u.kind] ?? u.kind}
                                    </span>
                                    <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                                      <FiClock className="w-3.5 h-3.5" />
                                      {new Date(u.created_at).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                    <FiChevronRight className="ml-auto w-4 h-4 text-slate-400 dark:text-slate-600 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
                                  </div>
                                  <p className="mt-3 text-base font-bold text-slate-900 dark:text-white tracking-tight">
                                    {projeto?.title || parsed?.texto || u.message}
                                  </p>
                                  {projeto && (
                                    <div className="mt-2.5 flex flex-wrap gap-x-5 gap-y-1.5 text-xs font-medium text-slate-600 dark:text-slate-400">
                                      {projeto.client_name && <span className="bg-slate-100 dark:bg-slate-800/50 px-2 py-1 rounded-md border border-slate-200 dark:border-white/5">Cliente: <span className="text-slate-900 dark:text-slate-200">{projeto.client_name}</span></span>}
                                      {projeto.project_type && <span className="bg-slate-100 dark:bg-slate-800/50 px-2 py-1 rounded-md border border-slate-200 dark:border-white/5">Tipo: <span className="text-slate-900 dark:text-slate-200">{projeto.project_type}</span></span>}
                                      {projeto.final_date && <span className="bg-slate-100 dark:bg-slate-800/50 px-2 py-1 rounded-md border border-slate-200 dark:border-white/5">Entrega: <span className="text-slate-900 dark:text-slate-200">{String(projeto.final_date).slice(0,10)}</span></span>}
                                    </div>
                                  )}
                                </div>
                              );
                            })
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>

      <PopupPlanejamento
        open={popupOpen}
        onClose={() => setPopupOpen(false)}
        project={projectDetails}
        update={selectedUpdate}
        isAdmin={isAdmin}
        acceptedStatus={acceptedStatus}
        onDelete={async () => {
          if (!selectedUpdate) return;
          let projectId: number | null = projectDetails?.id ?? null;
          try {
            if (selectedUpdate.message.startsWith('{')) {
              const obj = JSON.parse(selectedUpdate.message) as Record<string, unknown>;
              const p = obj.projeto as ProjectDetails | undefined;
              if (typeof p?.id === 'number') projectId = p.id;
            }
          } catch {}
          if (!projectId) return;
          if (!window.confirm('Excluir este projeto? Ação irreversível.')) return;
          await fetch('/api/project_admin_status', {
            method: 'DELETE', headers: { 'Content-Type': 'application/json' },
            credentials: 'include', body: JSON.stringify({ projectId }),
          });
          setPopupOpen(false);
          window.location.reload();
        }}
        onAccept={async () => {
          if (!selectedUpdate) return;
          setAcceptedStatus('accepted');
        }}
        onReject={async () => {
          if (!selectedUpdate) return;
          setAcceptedStatus('rejected');
        }}
      />
    </div>
  );
}
