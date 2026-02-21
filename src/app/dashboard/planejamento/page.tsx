'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import PopupPlanejamento from '../../../component/PopupPlanejamento';
import DashboardNav from '../../../component/DashboardNav';
import DashboardSidebar from '../../../component/DashboardSidebar';

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

export default function PlanejamentoPage() {
  const [projectsData, setProjectsData] = useState<ProjectWithUpdates[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [popupOpen, setPopupOpen] = useState(false);
  const [selectedUpdate, setSelectedUpdate] = useState<Update | null>(null);
  const [projectDetails, setProjectDetails] = useState<ProjectDetails | null>(null);
  const [acceptedStatus, setAcceptedStatus] = useState<'accepted' | 'rejected' | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [profileId, setProfileId] = useState<number | null>(null);

  // Planejamento: somente admin (role vem do banco via /api/profile)
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await fetch('/api/profile', { credentials: 'include' });
        if (!res.ok) {
          setIsAdmin(false);
          setProfileId(null);
          return;
        }
        const payload = await res.json();
        // tolerate different payload shapes and role casing
        const profile = payload?.profile ?? payload?.user ?? null;
        const rawRole = profile?.role ?? profile?.type ?? (profile && profile.roles ? profile.roles : null);
        const roleStr = rawRole != null ? String(rawRole).toLowerCase() : '';
        const isAdminFlag = typeof roleStr === 'string' && (
          roleStr.includes('admin') || roleStr.includes('administrator') || roleStr === 'superuser' || roleStr === 'super-admin' || roleStr === '1' || roleStr === 'true'
        );
        const idCandidate = typeof profile?.id === 'number' ? profile.id : (typeof profile?.userId === 'number' ? profile.userId : null);
        setProfileId(idCandidate ?? null);
        setIsAdmin(Boolean(isAdminFlag));
      } catch {
        setIsAdmin(false);
        setProfileId(null);
      } finally {
        setAuthChecked(true);
      }
    };

    void loadProfile();
  }, []);

  useEffect(() => {
    const load = async () => {
      if (!authChecked) return;
      setLoading(true);
      setError(null);
      try {
        if (isAdmin) {
          const res = await fetch('/api/projects', { credentials: 'include' });
          const payload = await res.json();
          if (!res.ok) throw new Error(payload.message || 'Falha ao carregar planejamento.');
          setProjectsData(Array.isArray(payload.projects) ? payload.projects : []);
        } else {
          // Cliente: mantém comportamento antigo
          const userId = profileId;
          if (!userId) throw new Error('Faça login para ver o planejamento.');
          const res = await fetch(`/api/projects?userId=${userId}`, { credentials: 'include' });
          const payload = await res.json();
          if (!res.ok) throw new Error(payload.message || 'Falha ao carregar planejamento.');
          setProjectsData(payload.project ? [{ project: payload.project, updates: payload.updates }] : []);
        }
      } catch (e) {
        setProjectsData([]);
        setError(e instanceof Error ? e.message : 'Erro desconhecido.');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [authChecked, isAdmin, profileId]);

  return (
    <div className="w-full relative flex ct-docs-disable-sidebar-content overflow-x-hidden bg-blueGray-100 dark:bg-gray-900 min-h-screen">
      <DashboardSidebar />
      <div className="relative md:ml-64 bg-blueGray-100 dark:bg-gray-900 w-full">
        <DashboardNav />

        <div className="px-4 md:px-6 mx-auto w-full pt-24 pb-10">
          <div className="rounded-3xl bg-white/90 dark:bg-gray-800/80 backdrop-blur-md border border-white/20 dark:border-gray-700/50 shadow-2xl p-5 sm:p-6">
            <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white">Planejamento</h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Mostra tudo que foi discutido sobre o projeto (itens inseridos pelo cliente ou por você).
            </p>

            {authChecked && !isAdmin ? (
              <div className="mt-6 rounded-2xl border border-slate-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/40 px-5 py-4">
                <p className="text-sm text-slate-700 dark:text-slate-200">Planejamento fica disponível somente para o administrador.</p>
                <Link href="/dashboard/projeto" className="mt-3 inline-block text-sm font-semibold text-blue-700 dark:text-blue-300 hover:underline">
                  Ir para Seu Projeto
                </Link>
              </div>
            ) : loading ? (
              <p className="mt-6 text-sm text-slate-600 dark:text-slate-300">Carregando…</p>
            ) : error ? (
              <p className="mt-6 text-sm text-red-600 dark:text-red-400">{error}</p>
            ) : projectsData.length === 0 ? (
              <p className="mt-6 text-sm text-slate-600 dark:text-slate-300">Nenhum projeto encontrado.</p>
            ) : (
              <div className="mt-6 space-y-8">
                {projectsData.map(({ project, updates }) => {
                  // Filtra updates para mostrar apenas os do projeto correto (por ID)
                  const filteredUpdates = updates.filter((u) => {
                    try {
                      if (typeof u.message === 'string' && u.message.startsWith('{')) {
                        const obj = JSON.parse(u.message);
                        if (obj && typeof obj === 'object') {
                          // projectId pode estar no root ou em obj.projeto.id
                          if (typeof obj.projectId === 'number') return obj.projectId === project.id;
                          if (obj.projeto && typeof obj.projeto === 'object' && typeof obj.projeto.id === 'number') return obj.projeto.id === project.id;
                        }
                      }
                    } catch {}
                    return true; // fallback: mostra se não conseguir identificar
                  });
                  return (
                    <div key={project.id} className="rounded-2xl border border-slate-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/40 px-5 py-4 shadow-sm">
                      <div className="mb-2 flex flex-wrap items-center gap-2 justify-between">
                        <span className="text-base font-bold text-blue-800 dark:text-blue-200">{project.title}</span>
                        <span className="text-xs px-2 py-1 rounded bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 font-semibold">{project.status}</span>
                      </div>
                      <div className="mb-2 text-xs text-slate-700 dark:text-slate-200">
                        <b>Progresso:</b> {project.progress}%
                      </div>
                      {filteredUpdates.length === 0 ? (
                        <div className="text-xs text-slate-500 dark:text-slate-400">Nenhum registro de planejamento.</div>
                      ) : (
                        <div className="space-y-3">
                          {filteredUpdates.map((u) => {
                          let parsed: { texto?: string; projeto?: ProjectDetails } | null = null;
                          try {
                            if (typeof u.message === 'string' && u.message.startsWith('{')) {
                              const obj: unknown = JSON.parse(u.message);
                              if (obj && typeof obj === 'object') {
                                const rec = obj as Record<string, unknown>;
                                const texto = typeof rec.texto === 'string' ? rec.texto : undefined;
                                const projeto =
                                  rec.projeto && typeof rec.projeto === 'object'
                                    ? (rec.projeto as ProjectDetails)
                                    : undefined;
                                parsed = { texto, projeto };
                              }
                            }
                          } catch {}
                          const projeto = parsed?.projeto;
                          return (
                            <div
                              key={u.id}
                              className="rounded-xl border border-slate-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/40 px-4 py-3 cursor-pointer transition hover:bg-blue-50/80 dark:hover:bg-blue-900/40"
                              onClick={async () => {
                                setSelectedUpdate(u);
                                setPopupOpen(true);
                                setProjectDetails(projeto || null);
                              }}
                            >
                              <div className="flex flex-wrap items-center gap-2 justify-between">
                                <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">{new Date(u.created_at).toLocaleString()}</span>
                                {projeto?.status && (
                                  <span className="text-xs px-2 py-1 rounded bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 font-semibold">{projeto.status}</span>
                                )}
                              </div>
                              <div className="mt-1 text-base text-slate-900 dark:text-slate-100 font-semibold truncate">
                                {projeto?.title || parsed?.texto || u.message}
                              </div>
                              <div className="mt-1 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1 text-xs text-slate-700 dark:text-slate-200">
                                {projeto && (
                                  <>
                                    <div><b>Progresso:</b> {projeto.progress}%</div>
                                    <div><b>Nome:</b> {projeto.client_name || '-'}</div>
                                    <div><b>E-mail:</b> {projeto.client_email || '-'}</div>
                                    <div><b>Tipo:</b> {projeto.project_type || '-'}</div>
                                    <div><b>Data final:</b> {projeto.final_date ? String(projeto.final_date).slice(0,10) : '-'}</div>
                                  </>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );  })} 
                <PopupPlanejamento
                  open={popupOpen}
                  onClose={() => setPopupOpen(false)}
                  project={projectDetails}
                  update={selectedUpdate}
                  isAdmin={isAdmin}
                  acceptedStatus={acceptedStatus}
                  onDelete={async () => {
                    if (!selectedUpdate) return;
                    let projectId: number | null = null;
                    try {
                      if (selectedUpdate.message) {
                        const obj: unknown = JSON.parse(selectedUpdate.message);
                        if (obj && typeof obj === 'object') {
                          const rec = obj as Record<string, unknown>;
                          const projeto = rec.projeto && typeof rec.projeto === 'object' ? (rec.projeto as ProjectDetails) : undefined;
                          projectId = typeof projeto?.id === 'number' ? projeto.id : null;
                        }
                      }
                    } catch {}
                    if (!projectId && projectDetails?.id) projectId = projectDetails.id;
                    if (!projectId) return;
                    if (!window.confirm('Tem certeza que deseja excluir este projeto? Esta ação não pode ser desfeita.')) return;
                    await fetch('/api/project_admin_status', {
                      method: 'DELETE',
                      headers: { 'Content-Type': 'application/json' },
                      credentials: 'include',
                      body: JSON.stringify({ projectId })
                    });
                    setPopupOpen(false);
                    window.location.reload();
                  }}
                  onAccept={async () => {
                    if (!selectedUpdate) return;
                    let projectId: number | null = null;
                    try {
                      if (selectedUpdate.message) {
                        const obj: unknown = JSON.parse(selectedUpdate.message);
                        if (obj && typeof obj === 'object') {
                          const rec = obj as Record<string, unknown>;
                          const projeto = rec.projeto && typeof rec.projeto === 'object' ? (rec.projeto as ProjectDetails) : undefined;
                          projectId = typeof projeto?.id === 'number' ? projeto.id : null;
                        }
                      }
                    } catch {}
                    if (!projectId && projectDetails?.id) projectId = projectDetails.id;
                    if (!projectId) return;
                    await fetch('/api/project_admin_status', {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json' },
                      credentials: 'include',
                      body: JSON.stringify({ projectId, status: 'accepted' })
                    });
                    setAcceptedStatus('accepted');
                  }}
                  onReject={async () => {
                    if (!selectedUpdate) return;
                    let projectId: number | null = null;
                    try {
                      if (selectedUpdate.message) {
                        const obj: unknown = JSON.parse(selectedUpdate.message);
                        if (obj && typeof obj === 'object') {
                          const rec = obj as Record<string, unknown>;
                          const projeto = rec.projeto && typeof rec.projeto === 'object' ? (rec.projeto as ProjectDetails) : undefined;
                          projectId = typeof projeto?.id === 'number' ? projeto.id : null;
                        }
                      }
                    } catch {}
                    if (!projectId && projectDetails?.id) projectId = projectDetails.id;
                    if (!projectId) return;
                    await fetch('/api/project_admin_status', {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json' },
                      credentials: 'include',
                      body: JSON.stringify({ projectId, status: 'rejected' })
                    });
                    setAcceptedStatus('rejected');
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
