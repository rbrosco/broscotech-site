'use client';

import { useEffect, useState } from 'react';
import DashboardNav from '../../../component/DashboardNav';
import DashboardSidebar from '../../../component/DashboardSidebar';

type Update = { id: number; kind: string; message: string; created_at: string };

type ProjectsResponse = {
  project: { id: number; title: string; status: string; progress: number; updated_at: string } | null;
  updates: Update[];
};

export default function PlanejamentoPage() {
  const [data, setData] = useState<ProjectsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const userDataRaw = localStorage.getItem('userData');
        const userId = userDataRaw ? Number((JSON.parse(userDataRaw) as { id?: string | number }).id) : NaN;
        if (!Number.isFinite(userId)) throw new Error('Faça login para ver o planejamento.');

        const res = await fetch(`/api/projects?userId=${userId}`, { credentials: 'include' });
        const payload = (await res.json()) as Partial<ProjectsResponse> & { message?: string };
        if (!res.ok) throw new Error(payload.message || 'Falha ao carregar planejamento.');
        setData(payload as ProjectsResponse);
      } catch (e) {
        setData(null);
        setError(e instanceof Error ? e.message : 'Erro desconhecido.');
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

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

            {loading ? (
              <p className="mt-6 text-sm text-slate-600 dark:text-slate-300">Carregando…</p>
            ) : error ? (
              <p className="mt-6 text-sm text-red-600 dark:text-red-400">{error}</p>
            ) : !data?.project ? (
              <p className="mt-6 text-sm text-slate-600 dark:text-slate-300">Nenhum projeto encontrado.</p>
            ) : data.updates?.length ? (
              <div className="mt-6 space-y-3">
                {data.updates.map((u) => (
                  <div
                    key={u.id}
                    className="rounded-2xl border border-slate-200 dark:border-gray-700 bg-white/70 dark:bg-gray-900/30 px-4 py-3"
                  >
                    <div className="text-xs text-slate-500 dark:text-slate-400">{new Date(u.created_at).toLocaleString()}</div>
                    <div className="mt-1 text-sm text-slate-800 dark:text-slate-100">{u.message}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-6 text-sm text-slate-600 dark:text-slate-300">Ainda não há registros de planejamento.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
