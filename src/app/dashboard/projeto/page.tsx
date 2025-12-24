
'use client';

import { useEffect, useState, useCallback } from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';
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
  language?: string | null;
  framework?: string | null;
  integrations?: string | null;
};

type ProjectsResponse = {
  project: Project | null;
  updates: Array<{ id: number; kind: string; message: string; created_at: string }>;
};


export default function ProjetoPage() {
  const [, setEditProjectId] = useState<number | null>(null);
  // router removed (unused)
  const [, setData] = useState<ProjectsResponse | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [, setLastSavedProject] = useState<Project | null>(null);
  const [, setAdminStatus] = useState<'accepted' | 'rejected' | null>(null);

  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [projectType, setProjectType] = useState('');
  const [finalDate, setFinalDate] = useState('');
  const [projectName, setProjectName] = useState('');
  const [observations, setObservations] = useState('');
  const [language, setLanguage] = useState('');
  const [framework, setFramework] = useState('');
  const [integrationsField, setIntegrationsField] = useState('');
  const [projectsList, setProjectsList] = useState<Project[]>([]);
  const [, setCollapsedView] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [editMode, setEditMode] = useState(false);

  const fetchProjectsList = useCallback(async () => {
    try {
      const uid = userId ?? NaN;
      if (!Number.isFinite(uid)) return;
      const res = await fetch(`/api/projects?userId=${uid}&all=1`, { credentials: 'include' });
      if (!res.ok) return;
      const payload = await res.json();
      const list = (payload.projects ?? []) as Project[];
      setProjectsList(list);
      if (list.length > 0) setCollapsedView(true);
    } catch {
      // ignore
    }
  }, [userId]);

  useEffect(() => {
    const init = async () => {
      // try to get user from server session
      if (!Number.isFinite(userId ?? NaN)) {
        try {
          const resMe = await fetch('/api/me', { credentials: 'include' });
          if (resMe.ok) {
            const me = await resMe.json();
            setUserId(Number(me.id ?? NaN));
          } else {
            // no session
            return;
          }
        } catch {
          return;
        }
      }

      setLoading(true);
      setError(null);
      try {
        const uid = userId ?? NaN;
        if (!Number.isFinite(uid)) throw new Error('Faça login para ver seu projeto.');

        // Busca todos os projetos do usuário
        const res = await fetch(`/api/projects?userId=${uid}&all=1`, { credentials: 'include' });
        const payload = await res.json();
        if (!res.ok) throw new Error(payload.message || 'Falha ao carregar seus projetos.');
        const list = (payload.projects ?? []) as Project[];
        setProjectsList(list);

        // Mantém compatibilidade com o projeto principal
        if (list.length > 0) {
          setData({ project: list[0], updates: [] });
          setProjectName(list[0].title ?? '');
          setClientName(list[0].client_name ?? '');
          setClientEmail(list[0].client_email ?? '');
          setClientPhone(list[0].client_phone ?? '');
          setProjectType(list[0].project_type ?? '');
          setFinalDate(list[0].final_date ? String(list[0].final_date).slice(0, 10) : '');
          setLanguage(list[0].language ?? '');
          setFramework(list[0].framework ?? '');
          setIntegrationsField(list[0].integrations ?? '');
        }
      } catch (e) {
        setData(null);
        setError(e instanceof Error ? e.message : 'Erro desconhecido.');
      } finally {
        setLoading(false);
      }
    };

    void init();
  }, [userId]);

  const onSave = async () => {
    setSaveMessage(null);
    setSaving(true);
    try {
      if (!Number.isFinite(userId)) throw new Error('Faça login para salvar seu projeto.');

      const res = await fetch('/api/projects', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          userId,
          title: projectName?.trim() || null,
          clientName,
          clientEmail,
          clientPhone,
          projectType,
          language: language || null,
          framework: framework || null,
          integrations: integrationsField || null,
          observations: observations || null,
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
      // Cria atualização de planejamento com snapshot do projeto e observações
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
              projeto: payload.project,
              observacoes: observations || undefined,
            }),
          }),
        });
      }
      void fetchProjectsList();
        setCollapsedView(true);
      setSaveMessage('Dados salvos com sucesso.');
    } catch (e) {
      setSaveMessage(e instanceof Error ? e.message : 'Erro ao salvar.');
    } finally {
      setSaving(false);
    }
  };

  // Funções para apagar e enviar projeto
  const handleDeleteProject = async (projectId: number) => {
    if (!window.confirm('Tem certeza que deseja apagar este projeto?')) return;
    try {
      await fetch(`/api/projects?projectId=${projectId}`, { method: 'DELETE', credentials: 'include' });
      setData((prev) => (prev ? { ...prev, project: null } : prev));
      setLastSavedProject(null);
      setSaveMessage('Projeto apagado com sucesso.');
    } catch {
      setSaveMessage('Erro ao apagar projeto.');
    }
  };

  const handleSendToDev = async (projectId: number, projectStatus: string) => {
    if (projectStatus === 'enviado') {
      alert('Este projeto já foi enviado para o desenvolvedor!');
      return;
    }
    // Busca detalhes do projeto para usar no card do Kanban
    let projectData: Record<string, unknown> = {}; ;
    try {
      const res = await fetch(`/api/projects?projectId=${projectId}`, { credentials: 'include' });
      if (res.ok) {
        const payload = await res.json();
        projectData = payload?.project || {};
      }
    } catch {}

    try {
      // Envia o projeto para o desenvolvedor
      await fetch(`/api/projects/send_to_dev?projectId=${projectId}`, { method: 'POST', credentials: 'include' });
      // Cria um card na primeira coluna do Kanban, se ainda não existir (título e descrição)
      try {
        const resKanban = await fetch('/api/kanban', { credentials: 'include' });
        if (resKanban.ok) {
          const kanbanData = await resKanban.json();
          const firstColumn = Array.isArray(kanbanData.columns) ? kanbanData.columns[0] : null;
          if (firstColumn && firstColumn.id) {
            const description = [
              projectData.client_name && `Nome: ${projectData.client_name}`,
              projectData.client_email && `E-mail: ${projectData.client_email}`,
              projectData.client_phone && `Telefone: ${projectData.client_phone}`,
              projectData.project_type && `Tipo: ${projectData.project_type}`,
              projectData.final_date && `Data final: ${projectData.final_date}`,
              projectData.language && `Linguagem: ${projectData.language}`,
              projectData.framework && `Framework: ${projectData.framework}`,
              projectData.integrations && `Integrações: ${projectData.integrations}`,
            ].filter(Boolean).join('\n');
            // Verifica se já existe um card com o mesmo título e descrição
            const alreadyExists = firstColumn.cards.some((card: Record<string, unknown>) => card.title === projectData.title && card.description === description);
            if (!alreadyExists) {
              await fetch('/api/kanban', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  type: 'card',
                  columnId: firstColumn.id,
                  title: projectData.title || 'Novo Projeto',
                  description,
                }),
              });
            }
          }
        }
      } catch {}


      // Cria atualização de planejamento para análise do admin, com snapshot completo do projeto
      await fetch('/api/project_updates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          projectId,
          kind: 'planejamento',
          message: JSON.stringify({
            texto: 'Projeto enviado para análise do admin.',
            projeto: {
              id: projectData.id,
              title: projectData.title,
              status: 'enviado',
              progress: projectData.progress,
              client_name: projectData.client_name,
              client_email: projectData.client_email,
              client_phone: projectData.client_phone,
              project_type: projectData.project_type,
              final_date: projectData.final_date,
              language: projectData.language,
              framework: projectData.framework,
              integrations: projectData.integrations,
            }
          })
        })
      });

      // Cria atualização para o Kanban na etapa 'inicio'
      await fetch('/api/project_updates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          projectId,
          kind: 'kanban',
          message: JSON.stringify({ status: 'inicio', texto: 'Projeto iniciado no Kanban.' })
        })
      });

      setShowSuccessPopup(true);
      setSaveMessage('Projeto enviado para o desenvolvedor!');
      setTimeout(() => {
        setShowSuccessPopup(false);
      }, 1500);
      // Atualiza o status localmente para refletir imediatamente
      setProjectsList((prev) => prev.map((p) => p.id === projectId ? { ...p, status: 'enviado' } : p));
    } catch {
      setSaveMessage('Erro ao enviar para o desenvolvedor.');
    }
  };

  return (
    <div className="w-full relative flex ct-docs-disable-sidebar-content overflow-x-hidden bg-blueGray-100 dark:bg-gray-900 min-h-screen">
      <DashboardSidebar />
      <div className="relative md:ml-64 bg-blueGray-100 dark:bg-gray-900 w-full">
        <DashboardNav />
        <div className="px-4 md:px-6 mx-auto w-full pt-24 pb-10">
          <div className="rounded-3xl bg-white/90 dark:bg-gray-800/80 backdrop-blur-md border border-white/20 dark:border-gray-700/50 shadow-2xl p-5 sm:p-6">
            <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white">Meus Projetos</h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Acompanhe seus projetos em desenvolvimento e solicite novos!</p>

            {loading ? (
              <p className="mt-6 text-sm text-slate-600 dark:text-slate-300">Carregando...</p>
            ) : !Number.isFinite(userId) ? (
              <p className="mt-6 text-sm text-red-600 dark:text-red-400">Faça login para ver seus projetos.</p>
            ) : (
              <>
                {/* Botão para abrir modal de cadastro - TOPO */}
                <div className="flex justify-center mb-8 mt-2">
                  <button
                    onClick={() => {
                      setProjectName('');
                      setClientName('');
                      setClientEmail('');
                      setClientPhone('');
                      setProjectType('');
                      setFinalDate('');
                      setLanguage('');
                      setFramework('');
                      setIntegrationsField('');
                      setObservations('');
                      setEditMode(true);
                      setShowModal(true);
                    }}
                    className="rounded-xl bg-blue-600 text-slate-900 dark:text-white px-6 py-3 text-lg font-bold shadow-lg hover:bg-blue-700 transition"
                  >
                    + Criar novo projeto
                  </button>
                </div>

                {/* Modal de cadastro de projeto */}
                {showModal && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center">
                    {/* Motion blue background with fade-in transparency */}
                    <div
                      className="absolute inset-0 w-full h-full animate-pulse bg-gradient-to-br from-blue-800/60 via-blue-500/40 to-blue-900/80 blur-2xl opacity-0 transition-opacity duration-500"
                      style={{ zIndex: 0, opacity: showModal ? 0.8 : 0 }}
                    />
                    <div
                      className="absolute inset-0 w-full h-full bg-black bg-opacity-0 transition-opacity duration-500"
                      style={{ zIndex: 1, opacity: showModal ? 0.6 : 0 }}
                    />
                    <div className="relative rounded-2xl border border-slate-300 dark:border-gray-700 bg-white/90 dark:bg-gray-900/90 shadow-2xl p-8 w-full max-w-2xl" style={{zIndex:2}}>
                      <button
                        onClick={() => setShowModal(false)}
                        className="absolute top-4 right-4 text-slate-500 dark:text-slate-300 text-2xl font-bold hover:text-red-500"
                        aria-label="Fechar"
                      >
                        ×
                      </button>
                      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 text-center">Solicitar novo projeto</h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Nome do projeto</label>
                          <input
                            value={projectName}
                            onChange={(e) => setProjectName(e.target.value)}
                            className="mt-1 w-full rounded-xl border border-slate-200 dark:border-gray-700 bg-white/90 dark:bg-gray-900/40 px-3 py-2 text-sm text-slate-900 dark:text-white"
                            placeholder="Nome do projeto"
                            disabled={!editMode}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Nome</label>
                          <input
                            value={clientName}
                            onChange={(e) => setClientName(e.target.value)}
                            className="mt-1 w-full rounded-xl border border-slate-200 dark:border-gray-700 bg-white/90 dark:bg-gray-900/40 px-3 py-2 text-sm text-slate-900 dark:text-white"
                            placeholder="Seu nome"
                            disabled={!editMode}
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
                            disabled={!editMode}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Telefone</label>
                          <input
                            value={clientPhone}
                            onChange={(e) => setClientPhone(e.target.value)}
                            className="mt-1 w-full rounded-xl border border-slate-200 dark:border-gray-700 bg-white/90 dark:bg-gray-900/40 px-3 py-2 text-sm text-slate-900 dark:text-white"
                            placeholder="(00) 00000-0000"
                            disabled={!editMode}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Tipo de projeto</label>
                          <select
                            value={projectType}
                            onChange={(e) => setProjectType(e.target.value)}
                            className="mt-1 w-full rounded-xl border border-slate-200 dark:border-gray-700 bg-white/90 dark:bg-gray-900/40 px-3 py-2 text-sm text-slate-900 dark:text-white"
                            disabled={!editMode}
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
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            className="mt-1 w-full rounded-xl border border-slate-200 dark:border-gray-700 bg-white/90 dark:bg-gray-900/40 px-3 py-2 text-sm text-slate-900 dark:text-white"
                            disabled={!editMode}
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
                            value={framework}
                            onChange={(e) => setFramework(e.target.value)}
                            className="mt-1 w-full rounded-xl border border-slate-200 dark:border-gray-700 bg-white/90 dark:bg-gray-900/40 px-3 py-2 text-sm text-slate-900 dark:text-white"
                            disabled={!editMode}
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
                            value={integrationsField}
                            onChange={(e) => setIntegrationsField(e.target.value)}
                            className="mt-1 w-full rounded-xl border border-slate-200 dark:border-gray-700 bg-white/90 dark:bg-gray-900/40 px-3 py-2 text-sm text-slate-900 dark:text-white"
                            placeholder="Ex: PagSeguro, WhatsApp, Google Analytics, etc."
                            disabled={!editMode}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Data final</label>
                          <input
                            value={finalDate}
                            onChange={(e) => setFinalDate(e.target.value)}
                            className="mt-1 w-full rounded-xl border border-slate-200 dark:border-gray-700 bg-white/90 dark:bg-gray-900/40 px-3 py-2 text-sm text-slate-900 dark:text-white"
                            type="date"
                            disabled={!editMode}
                          />
                        </div>
                        <div className="col-span-1 sm:col-span-2">
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Observações</label>
                          <textarea
                            value={observations}
                            onChange={(e) => setObservations(e.target.value)}
                            className="mt-1 w-full rounded-xl border border-slate-200 dark:border-gray-700 bg-white/90 dark:bg-gray-900/40 px-3 py-2 text-sm text-slate-900 dark:text-white h-24"
                            placeholder="Observações / instruções adicionais"
                            disabled={!editMode}
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-3 mt-6 justify-center">
                        {editMode ? (
                          <button
                            onClick={() => { void onSave(); setEditMode(false); setShowModal(false); }}
                            disabled={saving}
                            className="rounded-xl bg-slate-900 dark:bg-white text-slate-900 dark:text-white dark:text-slate-900 px-6 py-2 text-lg font-bold disabled:opacity-60"
                          >
                            {saving ? 'Salvando…' : 'Salvar Projeto'}
                          </button>
                        ) : (
                          <button
                            onClick={() => setEditMode(true)}
                            className="rounded-xl bg-blue-600 text-slate-900 dark:text-white px-6 py-2 text-lg font-bold"
                          >
                            Solicitar projeto
                          </button>
                        )}
                        {saveMessage ? (
                          <p
                            className={
                              saveMessage === 'Dados salvos com sucesso.' || saveMessage === 'Novo projeto criado com sucesso!'
                                ? 'text-lg text-emerald-700 dark:text-emerald-400'
                                : 'text-lg text-red-600 dark:text-red-400'
                            }
                          >
                            {saveMessage}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </div>
                )}

                {/* Popup de sucesso ao enviar para desenvolvedor */}
                {showSuccessPopup && (
                  <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/80">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl px-8 py-6 flex flex-col items-center border border-blue-400 dark:border-blue-600">
                      <span className="text-4xl mb-2">✅</span>
                      <span className="text-lg font-semibold text-blue-700 dark:text-blue-300 mb-1">Projeto enviado com sucesso!</span>
                      <span className="text-sm text-slate-600 dark:text-slate-300">Você será redirecionado para o planejamento...</span>
                    </div>
                  </div>
                )}

                {/* Quadrado com todos os projetos solicitados */}
                <div className="rounded-3xl border border-blue-400 dark:border-blue-600 bg-white/90 dark:bg-gray-900/80 shadow-2xl p-6 mt-2">
                  <h2 className="text-2xl font-bold text-blue-700 dark:text-blue-300 mb-6">Meus Projetos Solicitados</h2>
                  <div className="space-y-8">
                    {projectsList.length > 0 ? (
                      projectsList.map((project) => (
                        <div key={project.id} className="rounded-2xl border border-blue-200 dark:border-blue-700 bg-white/80 dark:bg-gray-900/60 shadow p-6 flex flex-col justify-between">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-sm text-slate-700 dark:text-slate-200 mb-4">
                            <div><span className="font-semibold">Título:</span> {project.title}</div>
                            <div><span className="font-semibold">Status:</span> {project.status}</div>
                            <div><span className="font-semibold">Progresso:</span> {project.progress}%</div>
                            <div><span className="font-semibold">Última atualização:</span> {new Date(project.updated_at).toLocaleString()}</div>
                            <div><span className="font-semibold">Nome:</span> {project.client_name || '-'}</div>
                            <div><span className="font-semibold">E-mail:</span> {project.client_email || '-'}</div>
                            <div><span className="font-semibold">Telefone:</span> {project.client_phone || '-'}</div>
                            <div><span className="font-semibold">Tipo:</span> {project.project_type || '-'}</div>
                            <div><span className="font-semibold">Data final:</span> {project.final_date ? String(project.final_date).slice(0, 10) : '-'}</div>
                            <div><span className="font-semibold">Linguagem:</span> {project.language || '-'}</div>
                            <div><span className="font-semibold">Framework:</span> {project.framework || '-'}</div>
                            <div><span className="font-semibold">Integrações:</span> {project.integrations || '-'}</div>
                          </div>
                          <div className="flex gap-3 mt-2 items-center justify-between">
                            <div className="flex items-center gap-2">
                              {project.status === 'enviado' && (
                                <span className="inline-flex items-center bg-gradient-to-r from-green-500 to-green-700 text-slate-900 dark:text-white text-xs px-3 py-1 rounded-full animate-pulse shadow-lg border border-white/20">
                                  <svg className="inline w-4 h-4 mr-1 -mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                                  Enviado ao Desenvolvedor
                                </span>
                              )}
                              <button
                                disabled={project.status === 'enviado'}
                                onClick={() => handleSendToDev(project.id, project.status)}
                                className={`rounded-xl px-4 py-2 text-sm font-medium transition font-semibold ${
                                  project.status === 'enviado'
                                    ? 'bg-gray-400 cursor-not-allowed text-slate-900 dark:text-white'
                                    : 'bg-green-600 hover:bg-green-700 text-slate-900 dark:text-white'
                                }`}
                              >
                                Enviar para desenvolvedor
                              </button>
                            </div>
                            <div className="flex gap-2">
                              <button
                                title="Editar projeto"
                                onClick={() => {
                                  setEditMode(true);
                                  setShowModal(true);
                                  setEditProjectId(project.id);
                                  setProjectName(project.title || '');
                                  setClientName(project.client_name || '');
                                  setClientEmail(project.client_email || '');
                                  setClientPhone(project.client_phone || '');
                                  setProjectType(project.project_type || '');
                                  setFinalDate(project.final_date ? String(project.final_date).slice(0, 10) : '');
                                  setLanguage(project.language || '');
                                  setFramework(project.framework || '');
                                  setIntegrationsField(project.integrations || '');
                                  setObservations('');
                                }}
                                className="p-2 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900 transition"
                              >
                                <FaEdit className="text-blue-600 dark:text-blue-300 text-lg" />
                              </button>
                              <button
                                title="Excluir projeto"
                                onClick={() => handleDeleteProject(project.id)}
                                className="p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900 transition"
                              >
                                <FaTrash className="text-red-600 dark:text-red-400 text-lg" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-slate-600 dark:text-slate-300">Nenhum projeto em desenvolvimento.</p>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
