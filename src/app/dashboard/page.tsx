'use client';
import React, { useEffect, useState } from 'react';
import DashboardSidebar from '../../component/DashboardSidebar';
import DashboardNav from '../../component/DashboardNav';
import KanbanBoard from '../../component/KanbanBoard';

type Project = { id: number; title: string };

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/projects?all=1', { credentials: 'include' });
        const payload = await res.json();
        if (res.ok && Array.isArray(payload.projects)) {
          const arr = payload.projects as Array<{ id: number; title: string }>;
          setProjects(arr.map((p) => ({ id: p.id, title: p.title })));
          if (arr.length > 0 && selectedProjectId === null) {
            setSelectedProjectId(arr[0].id);
          }
        }
      } catch {
        setProjects([]);
      }
    })();
  }, [selectedProjectId]);

  return (
    <div className="w-full relative flex ct-docs-disable-sidebar-content bg-blueGray-100 dark:bg-gray-900 min-h-screen min-w-0">
      <DashboardSidebar />
      <div className="relative md:ml-64 bg-blueGray-100 dark:bg-gray-900 w-full min-w-0 flex-1">
        <DashboardNav />
        <div className="px-4 md:px-6 mx-auto w-full pt-24 pb-10 min-w-0">
          <div className="rounded-3xl bg-white/90 dark:bg-gray-800/80 backdrop-blur-md border border-white/20 dark:border-gray-700/50 shadow-2xl p-5 sm:p-6 min-w-0">
            {/* Seletor de projetos */}
            <div className="mb-6 flex flex-wrap gap-2 items-center">
              <span className="font-semibold text-slate-700 dark:text-white">Meus Projetos:</span>
              <select
                value={selectedProjectId ?? ''}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedProjectId(val ? Number(val) : null);
                }}
                className="rounded-xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-900/40 px-3 py-2 text-sm text-slate-900 dark:text-white"
              >
                <option value="" disabled>Selecione um projeto</option>
                {projects.map((proj) => (
                  <option key={proj.id} value={proj.id}>{proj.title}</option>
                ))}
              </select>
            </div>
            {/* KanbanBoard genérico, sem lógica UBVA */}
            {selectedProjectId && (
              <KanbanBoard projectId={selectedProjectId} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}