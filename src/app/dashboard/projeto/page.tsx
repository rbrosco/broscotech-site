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

      setData((prev) => (prev ? { ...prev, project: payload.project ?? prev.project } : prev));
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
            <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white">Seu Projeto (Em andamento)</h1>
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
                    <input
                      value={projectType}
                      onChange={(e) => setProjectType(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-200 dark:border-gray-700 bg-white/90 dark:bg-gray-900/40 px-3 py-2 text-sm text-slate-900 dark:text-white"
                      placeholder="Ex: Site, App, Landing Page"
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
