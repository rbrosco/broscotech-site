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
          const list: ProjectWithUpdates[] = Array.isArray(payload.projects) ? payload.projects : [];
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
    <div style={{ minHeight: '100vh', background: '#0a0f1e' }}>
      <Sidebar />
      <div className="md:pl-64 flex flex-col min-h-screen">
        <DashboardNav />

        <main className="px-4 md:px-8 pt-[81px] pb-16">

          {/* Header */}
          <div
            className="relative overflow-hidden rounded-2xl mt-6 px-7 py-6"
            style={{ background: 'linear-gradient(130deg, rgba(0,74,173,0.18) 0%, rgba(0,176,155,0.12) 100%)', border: '1px solid rgba(0,176,155,0.2)' }}
          >
            <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full blur-3xl opacity-20 pointer-events-none" style={{ background: 'radial-gradient(circle,#00b09b,transparent)' }} />
            <h1 className="text-2xl font-extrabold text-white">Planejamento</h1>
            <p className="mt-1 text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>
              Registro de tudo que foi discutido e definido sobre o projeto.
            </p>
            {!loading && (
              <div className="flex gap-4 mt-4">
                {[
                  { label: 'Projetos', value: projectsData.length, icon: FiFolder, color: '#004aad' },
                  { label: 'Registros', value: totalUpdates, icon: FiTrendingUp, color: '#00b09b' },
                ].map(({ label, value, icon: Icon, color }) => (
                  <div key={label} className="flex items-center gap-2 px-4 py-2 rounded-xl" style={{ background: color + '20', border: `1px solid ${color}30` }}>
                    <Icon className="w-4 h-4" style={{ color }} />
                    <span className="text-white font-bold tabular-nums">{value}</span>
                    <span className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>{label}</span>
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
                <span className="text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>Carregando planejamento...</span>
              </div>
            ) : error ? (
              <div className="flex items-center gap-3 rounded-2xl px-5 py-4 mt-4" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                <FiAlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                <p className="text-sm text-red-300">{error}</p>
              </div>
            ) : projectsData.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 gap-4">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(0,176,155,0.1)' }}>
                  <FiCalendar className="w-7 h-7" style={{ color: '#00b09b' }} />
                </div>
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>Nenhum registro de planejamento ainda.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {projectsData.map(({ project, updates }) => {
                  const isExpanded = expandedProject === project.id;
                  return (
                    <div
                      key={project.id}
                      className="rounded-2xl overflow-hidden transition-all duration-200"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                    >
                      {/* Project header */}
                      <button
                        className="w-full px-5 py-4 flex items-center gap-3 text-left transition hover:bg-white/[0.02]"
                        onClick={() => setExpandedProject(isExpanded ? null : project.id)}
                      >
                        <div className="w-2 h-2 rounded-full shrink-0 animate-pulse" style={{ background: '#00b09b' }} />
                        <span className="font-bold text-white flex-1">{project.title}</span>
                        {project.status && (
                          <span className="text-xs px-2.5 py-1 rounded-full font-semibold" style={{ background: 'rgba(0,176,155,0.15)', color: '#00d4aa' }}>
                            {project.status}
                          </span>
                        )}
                        {typeof project.progress === 'number' && (
                          <span className="text-xs font-bold tabular-nums" style={{ color: 'rgba(255,255,255,0.35)' }}>
                            {project.progress}%
                          </span>
                        )}
                        <span className="text-xs px-2 py-0.5 rounded-full ml-1" style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.35)' }}>
                          {updates.length} registro{updates.length !== 1 ? 's' : ''}
                        </span>
                        <FiChevronRight
                          className="w-4 h-4 shrink-0 transition-transform"
                          style={{ color: 'rgba(255,255,255,0.25)', transform: isExpanded ? 'rotate(90deg)' : 'none' }}
                        />
                      </button>

                      {/* Progress bar */}
                      {isExpanded && typeof project.progress === 'number' && project.progress > 0 && (
                        <div className="px-5 pb-3">
                          <div className="h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
                            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${project.progress}%`, background: 'linear-gradient(90deg,#004aad,#00b09b)' }} />
                          </div>
                        </div>
                      )}

                      {/* Updates list */}
                      {isExpanded && (
                        <div className="px-4 pb-4 flex flex-col gap-2.5">
                          {updates.length === 0 ? (
                            <p className="text-center py-8 text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>Nenhum registro.</p>
                          ) : (
                            updates.map(u => {
                              const parsed = parseProjeto(u.message);
                              const projeto = parsed?.projeto;
                              const accentColor = KIND_COLOR[u.kind] ?? '#00b09b';
                              return (
                                <div
                                  key={u.id}
                                  className="rounded-xl px-4 py-3 cursor-pointer transition-all hover:-translate-y-px"
                                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderLeft: `3px solid ${accentColor}` }}
                                  onClick={() => { setSelectedUpdate(u); setProjectDetails(projeto || null); setAcceptedStatus(null); setPopupOpen(true); }}
                                >
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full" style={{ background: accentColor + '20', color: accentColor }}>
                                      {KIND_LABEL[u.kind] ?? u.kind}
                                    </span>
                                    <span className="flex items-center gap-1 text-[11px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
                                      <FiClock className="w-3 h-3" />
                                      {new Date(u.created_at).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                    <FiChevronRight className="ml-auto w-3.5 h-3.5" style={{ color: 'rgba(255,255,255,0.2)' }} />
                                  </div>
                                  <p className="mt-1.5 text-sm font-semibold text-white/80 truncate">
                                    {projeto?.title || parsed?.texto || u.message}
                                  </p>
                                  {projeto && (
                                    <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-[11px]" style={{ color: 'rgba(255,255,255,0.35)' }}>
                                      {projeto.client_name && <span>Cliente: {projeto.client_name}</span>}
                                      {projeto.project_type && <span>Tipo: {projeto.project_type}</span>}
                                      {projeto.final_date && <span>Entrega: {String(projeto.final_date).slice(0,10)}</span>}
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
