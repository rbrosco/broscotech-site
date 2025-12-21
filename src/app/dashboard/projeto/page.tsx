'use client';

import { useEffect, useState } from 'react';
import DashboardNav from '../../../component/DashboardNav';
import DashboardSidebar from '../../../component/DashboardSidebar';

type Project = {
  id: number;
  title: string;
  status: string;
  progress: number;
  updated_at: string;
  client_name?: string | null;
  client_email?: string | null;
  client_phone?: string | null;
  project_type?: string | null;
  final_date?: string | null;
};

type ProjectsResponse = {
  project: Project | null;
  updates: Array<{ id: number; kind: string; message: string; created_at: string }>;
};

export default function ProjetoPage() {
  const [data, setData] = useState<ProjectsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [lastSavedProject, setLastSavedProject] = useState<Project | null>(null);
  const [adminStatus, setAdminStatus] = useState<'accepted' | 'rejected' | null>(null);

  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [projectType, setProjectType] = useState('');
  const [finalDate, setFinalDate] = useState('');

  const getUserId = () => {
    const userDataRaw = localStorage.getItem('userData');
    return userDataRaw ? Number((JSON.parse(userDataRaw) as { id?: string | number }).id) : NaN;
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const userId = getUserId();
        if (!Number.isFinite(userId)) throw new Error('Faça login para ver seu projeto.');

        const res = await fetch(`/api/projects?userId=${userId}`, { credentials: 'include' });
        const payload = (await res.json()) as Partial<ProjectsResponse> & { message?: string };
        if (!res.ok) throw new Error(payload.message || 'Falha ao carregar seu projeto.');
        const resolved = payload as ProjectsResponse;
        setData(resolved);
        if (resolved.project) {
          setClientName(resolved.project.client_name ?? '');
          setClientEmail(resolved.project.client_email ?? '');
          setClientPhone(resolved.project.client_phone ?? '');
          setProjectType(resolved.project.project_type ?? '');
          setFinalDate(resolved.project.final_date ? String(resolved.project.final_date).slice(0, 10) : '');

          try {
            const resStatus = await fetch(`/api/project_admin_status?projectId=${resolved.project.id}`, {
              credentials: 'include',
            });
            if (resStatus.ok) {
              const statusPayload = (await resStatus.json()) as { admin_status?: unknown };
              const raw = statusPayload?.admin_status;
              setAdminStatus(raw === 'accepted' || raw === 'rejected' ? raw : null);
            } else {
              setAdminStatus(null);
            }
          } catch {
            setAdminStatus(null);
          }
        }
      } catch (e) {
        setData(null);
        setError(e instanceof Error ? e.message : 'Erro desconhecido.');
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  const onSave = async () => {
    setSaveMessage(null);
    setSaving(true);
    try {
      const userId = getUserId();
      if (!Number.isFinite(userId)) throw new Error('Faça login para salvar seu projeto.');

      const res = await fetch('/api/projects', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          userId,
          clientName,
          clientEmail,
          clientPhone,
          projectType,
          finalDate: finalDate || null,
        }),
      });

      const payload = (await res.json()) as { project?: Project; message?: string };
      if (!res.ok) throw new Error(payload.message || 'Falha ao salvar.');

      if (payload.project) {
        setLastSavedProject(payload.project);

        try {
          const resStatus = await fetch(`/api/project_admin_status?projectId=${payload.project.id}`, {
            credentials: 'include',
          });
          if (resStatus.ok) {
            const statusPayload = (await resStatus.json()) as { admin_status?: unknown };
            const raw = statusPayload?.admin_status;
            setAdminStatus(raw === 'accepted' || raw === 'rejected' ? raw : null);
          } else {
            setAdminStatus(null);
          }
        } catch {
          setAdminStatus(null);
        }
      }

      setData((prev) => (prev ? { ...prev, project: payload.project ?? prev.project } : prev));
      // Cria atualização de planejamento com snapshot do projeto
      if (payload.project?.id) {
        await fetch('/api/project_updates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            projectId: payload.project.id,
            userId,
            kind: 'planejamento',
            message: JSON.stringify({
              texto: 'Informações do projeto atualizadas.',
              projeto: payload.project
            })
          })
        });
      }
      setSaveMessage('Dados salvos com sucesso.');
    } catch (e) {
      setSaveMessage(e instanceof Error ? e.message : 'Erro ao salvar.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full relative flex ct-docs-disable-sidebar-content overflow-x-hidden bg-blueGray-100 dark:bg-gray-900 min-h-screen">
      <DashboardSidebar />
      <div className="relative md:ml-64 bg-blueGray-100 dark:bg-gray-900 w-full">
        <DashboardNav />

        <div className="px-4 md:px-6 mx-auto w-full pt-24 pb-10">
          <div className="rounded-3xl bg-white/90 dark:bg-gray-800/80 backdrop-blur-md border border-white/20 dark:border-gray-700/50 shadow-2xl p-5 sm:p-6">
            <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white">Seu Projeto</h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Cadastro e informações do projeto em desenvolvimento.</p>

            {loading ? (
              <p className="mt-6 text-sm text-slate-600 dark:text-slate-300">Carregando…</p>
            ) : error ? (
              <p className="mt-6 text-sm text-red-600 dark:text-red-400">{error}</p>
            ) : data?.project ? (
              <div className="mt-6 space-y-6">
                <div className="space-y-2 text-sm text-slate-700 dark:text-slate-200">
                  <div><span className="font-semibold">Título:</span> {data.project.title}</div>
                  <div><span className="font-semibold">Status:</span> {data.project.status}</div>
                  <div><span className="font-semibold">Progresso:</span> {data.project.progress}%</div>
                  <div>
                    <span className="font-semibold">Resposta do administrador:</span>{' '}
                    {adminStatus === 'accepted'
                      ? 'Aceito'
                      : adminStatus === 'rejected'
                        ? 'Recusado'
                        : 'Aguardando'}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {adminStatus === 'rejected'
                      ? 'Seu projeto foi recusado. Você pode ajustar os dados e clicar em Salvar novamente.'
                      : 'Quando o administrador responder, o status aparecerá aqui.'}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Nome</label>
                    <input
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-200 dark:border-gray-700 bg-white/90 dark:bg-gray-900/40 px-3 py-2 text-sm text-slate-900 dark:text-white"
                      placeholder="Seu nome"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">E-mail</label>
                    <input
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-200 dark:border-gray-700 bg-white/90 dark:bg-gray-900/40 px-3 py-2 text-sm text-slate-900 dark:text-white"
                      placeholder="seu@email.com"
                      type="email"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Telefone</label>
                    <input
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-200 dark:border-gray-700 bg-white/90 dark:bg-gray-900/40 px-3 py-2 text-sm text-slate-900 dark:text-white"
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Tipo de projeto</label>
                    <select
                      value={projectType}
                      onChange={(e) => setProjectType(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-200 dark:border-gray-700 bg-white/90 dark:bg-gray-900/40 px-3 py-2 text-sm text-slate-900 dark:text-white"
                    >
                      <option value="">Selecione</option>
                      <option value="Site">Site</option>
                      <option value="App">App</option>
                      <option value="Landing Page">Landing Page</option>
                      <option value="E-commerce">E-commerce</option>
                      <option value="Sistema Web">Sistema Web</option>
                      <option value="Outro">Outro</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Linguagem/Código</label>
                    <select
                      className="mt-1 w-full rounded-xl border border-slate-200 dark:border-gray-700 bg-white/90 dark:bg-gray-900/40 px-3 py-2 text-sm text-slate-900 dark:text-white"
                    >
                      <option value="">Selecione</option>
                      <option value="TypeScript">TypeScript</option>
                      <option value="JavaScript">JavaScript</option>
                      <option value="Python">Python</option>
                      <option value="PHP">PHP</option>
                      <option value="Java">Java</option>
                      <option value="C#">C#</option>
                      <option value="Outro">Outro</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Framework</label>
                    <select
                      className="mt-1 w-full rounded-xl border border-slate-200 dark:border-gray-700 bg-white/90 dark:bg-gray-900/40 px-3 py-2 text-sm text-slate-900 dark:text-white"
                    >
                      <option value="">Selecione</option>
                      <option value="Next.js">Next.js</option>
                      <option value="React">React</option>
                      <option value="Vue.js">Vue.js</option>
                      <option value="Angular">Angular</option>
                      <option value="Laravel">Laravel</option>
                      <option value="Django">Django</option>
                      <option value="Outro">Outro</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Integrações</label>
                    <input
                      className="mt-1 w-full rounded-xl border border-slate-200 dark:border-gray-700 bg-white/90 dark:bg-gray-900/40 px-3 py-2 text-sm text-slate-900 dark:text-white"
                      placeholder="Ex: PagSeguro, WhatsApp, Google Analytics, etc."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Data final</label>
                    <input
                      value={finalDate}
                      onChange={(e) => setFinalDate(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-200 dark:border-gray-700 bg-white/90 dark:bg-gray-900/40 px-3 py-2 text-sm text-slate-900 dark:text-white"
                      type="date"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => void onSave()}
                    disabled={saving}
                    className="rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2 text-sm font-medium disabled:opacity-60"
                  >
                    {saving ? 'Salvando…' : 'Salvar'}
                  </button>
                  {saveMessage ? (
                    <p
                      className={
                        saveMessage === 'Dados salvos com sucesso.'
                          ? 'text-sm text-emerald-700 dark:text-emerald-400'
                          : 'text-sm text-red-600 dark:text-red-400'
                      }
                    >
                      {saveMessage}
                    </p>
                  ) : null}
                </div>

                {lastSavedProject && (
                  <div className="mt-6 rounded-2xl border border-slate-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/40 px-5 py-4">
                    <div className="text-sm font-semibold text-slate-900 dark:text-white">Dados salvos</div>
                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-sm text-slate-700 dark:text-slate-200">
                      <div><span className="font-semibold">Título:</span> {lastSavedProject.title}</div>
                      <div><span className="font-semibold">Status:</span> {lastSavedProject.status}</div>
                      <div>
                        <span className="font-semibold">Resposta do administrador:</span>{' '}
                        {adminStatus === 'accepted'
                          ? 'Aceito'
                          : adminStatus === 'rejected'
                            ? 'Recusado'
                            : 'Aguardando'}
                      </div>
                      <div><span className="font-semibold">Progresso:</span> {lastSavedProject.progress}%</div>
                      <div><span className="font-semibold">Última atualização:</span> {new Date(lastSavedProject.updated_at).toLocaleString()}</div>
                      <div><span className="font-semibold">Nome:</span> {lastSavedProject.client_name || '-'}</div>
                      <div><span className="font-semibold">E-mail:</span> {lastSavedProject.client_email || '-'}</div>
                      <div><span className="font-semibold">Telefone:</span> {lastSavedProject.client_phone || '-'}</div>
                      <div><span className="font-semibold">Tipo:</span> {lastSavedProject.project_type || '-'}</div>
                      <div><span className="font-semibold">Data final:</span> {lastSavedProject.final_date ? String(lastSavedProject.final_date).slice(0, 10) : '-'}</div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="mt-6 text-sm text-slate-600 dark:text-slate-300">Nenhum projeto encontrado.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
