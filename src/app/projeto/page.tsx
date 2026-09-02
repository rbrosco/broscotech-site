'use client';

import { useEffect, useState, useCallback, useRef, useId } from 'react';
import { useRouter } from 'next/navigation';
import { FiEdit2, FiTrash2, FiSend, FiPlus, FiCheckCircle, FiClock, FiFolder, FiX, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import DashboardNav from '../../component/DashboardNav';
import Sidebar from '../../component/Sidebar';

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

const STATUS_COLOR: Record<string, { bg: string; text: string; dot: string }> = {
  enviado:       { bg: 'rgba(0,176,155,0.15)', text: '#00d4aa', dot: '#00b09b' },
  'em planejamento': { bg: 'rgba(99,102,241,0.15)', text: '#a5b4fc', dot: '#6366f1' },
  'em andamento':    { bg: 'rgba(245,158,11,0.15)', text: '#fcd34d', dot: '#f59e0b' },
  concluido:     { bg: 'rgba(34,197,94,0.15)', text: '#86efac', dot: '#22c55e' },
};

function statusStyle(status: string) {
  const key = status?.toLowerCase() ?? '';
  return STATUS_COLOR[key] ?? { bg: 'rgba(255,255,255,0.08)', text: 'rgba(255,255,255,0.5)', dot: 'rgba(255,255,255,0.3)' };
}

const FIELD_STYLE =
  'w-full rounded-2xl px-4 py-3.5 text-sm text-slate-900 dark:text-white bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 placeholder:text-slate-400 dark:placeholder:text-white/45 outline-none transition-all focus:ring-2 focus:ring-cyan-500 focus:bg-white dark:focus:bg-white/10 disabled:opacity-40';
const FIELD_BG = {}; // Handled by Tailwind classes

function InputField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        {label}
      </label>
      {children}
    </div>
  );
}

function DarkSelect({ value, onChange, options, placeholder, disabled }: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder?: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listboxId = useId();

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Fecha com Escape e devolve o foco ao botão que abriu a lista
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        ref={triggerRef}
        disabled={disabled}
        onClick={() => setOpen(o => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`w-full rounded-2xl px-4 py-3.5 text-sm text-left flex items-center justify-between outline-none transition-all focus:ring-2 focus:ring-cyan-500 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 disabled:opacity-40 ${value ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-white/45'}`}
      >
        <span>{value || placeholder || 'Selecione'}</span>
        <FiChevronDown className={`w-4 h-4 shrink-0 transition-transform ${open ? 'rotate-180' : ''} text-slate-400 dark:text-white/40`} aria-hidden="true" />
      </button>
      {open && (
        <div
          id={listboxId}
          role="listbox"
          aria-label={placeholder || 'Opções'}
          className="absolute z-50 left-0 right-0 mt-2 rounded-2xl overflow-hidden py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.1)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.5)]"
        >
          {['', ...options].map(opt => (
            <button
              key={opt}
              type="button"
              role="option"
              aria-selected={opt === value}
              onClick={() => { onChange(opt); setOpen(false); triggerRef.current?.focus(); }}
              className={`w-full text-left px-5 py-2.5 text-sm transition-colors ${opt === value ? 'text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-500/10' : opt ? 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5'}`}
            >
              {opt || placeholder || 'Selecione'}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ProjetoPage() {
  const router = useRouter();

  const [userData, setUserData] = useState<{ name?: string; email?: string; phone?: string } | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [projectsList, setProjectsList] = useState<Project[]>([]);

  // ── Auth ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/me', { credentials: 'include' });
        if (!res.ok) { router.replace('/login'); return; }
        const user = await res.json() as { role?: string; id?: unknown; name?: string; email?: string; phone?: string };
        setUserId(Number(user.id ?? NaN));
        setUserData(user);
        setClientName(prev => prev || user.name || '');
        setClientEmail(prev => prev || user.email || '');
        setClientPhone(prev => prev || user.phone || '');
      } catch { router.replace('/login'); }
    })();
  }, [router]);

  // ── State ─────────────────────────────────────────────────────────────────
  const [, setData] = useState<ProjectsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editProjectId, setEditProjectId] = useState<number | null>(null);
  const [, setLastSavedProject] = useState<Project | null>(null);
  const [, setAdminStatus] = useState<'accepted' | 'rejected' | null>(null);
  const [, setCollapsedView] = useState(false);
  const [expandedCard, setExpandedCard] = useState<number | null>(null);

  // form fields
  const [projectName, setProjectName] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [projectType, setProjectType] = useState('');
  const [finalDate, setFinalDate] = useState('');
  const [observations, setObservations] = useState('');
  const [language, setLanguage] = useState('');
  const [framework, setFramework] = useState('');
  const [integrationsField, setIntegrationsField] = useState('');

  // ── Save ──────────────────────────────────────────────────────────────────
  const onSave = async () => {
    setSaveMessage(null);
    setSaving(true);
    try {
      if (!Number.isFinite(userId)) throw new Error('Faça login para salvar seu projeto.');
      const method = editProjectId ? 'PATCH' : 'POST';
      const payloadBody: any = {
          userId, title: projectName?.trim() || null, clientName, clientEmail,
          clientPhone, projectType, language: language || null, framework: framework || null,
          integrations: integrationsField || null, observations: observations || null,
          finalDate: finalDate || null,
      };
      if (editProjectId) payloadBody.id = editProjectId;

      const res = await fetch('/api/projects', {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payloadBody),
      });
      const payload = (await res.json()) as { project?: Project; message?: string };
      if (!res.ok) throw new Error(payload.message || 'Falha ao salvar.');
      if (payload.project) {
        setLastSavedProject(payload.project);
        try {
          const resStatus = await fetch(`/api/project_admin_status?projectId=${payload.project.id}`, { credentials: 'include' });
          if (resStatus.ok) {
            const sp = (await resStatus.json()) as { admin_status?: unknown };
            const raw = sp?.admin_status;
            setAdminStatus(raw === 'accepted' || raw === 'rejected' ? raw : null);
          } else setAdminStatus(null);
        } catch { setAdminStatus(null); }
      }
      setData((prev) => (prev ? { ...prev, project: payload.project ?? prev.project } : prev));
      if (payload.project?.id) {
        await fetch('/api/project_updates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            projectId: payload.project.id, userId, kind: 'planejamento',
            message: JSON.stringify({ texto: 'Informações do projeto atualizadas.', projeto: payload.project, observacoes: observations || undefined }),
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
      setShowModal(false);
    }
  };

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchProjectsList = useCallback(async () => {
    try {
      const uid = userId ?? NaN;
      if (!Number.isFinite(uid)) return;
      const res = await fetch(`/api/projects?userId=${uid}&all=1`, { credentials: 'include' });
      if (!res.ok) return;
      const payload = await res.json() as { projects?: unknown[] };
      const list: Project[] = (payload.projects ?? []).map((item) => {
        const typed = item as { project?: Project } & Project;
        return typed.project ?? typed;
      });
      setProjectsList(list);
      if (list.length > 0) setCollapsedView(true);
    } catch {}
  }, [userId]);

  useEffect(() => {
    const init = async () => {
      // userId é resolvido pelo efeito de "Auth" acima (única chamada a
      // /api/me da página). Evita refazer o mesmo fetch aqui.
      if (!Number.isFinite(userId ?? NaN)) return;
      setLoading(true);
      try {
        const uid = userId ?? NaN;
        if (!Number.isFinite(uid)) throw new Error('Faça login para ver seu projeto.');
        const res = await fetch(`/api/projects?userId=${uid}&all=1`, { credentials: 'include' });
        const payload = await res.json() as { projects?: unknown[]; message?: string };
        if (!res.ok) throw new Error(payload.message || 'Falha ao carregar seus projetos.');
        // API returns flat Project[] for clients, {project,updates}[] for admins — normalize:
        const list: Project[] = (payload.projects ?? []).map((item) => {
          const typed = item as { project?: Project } & Project;
          return typed.project ?? typed;
        });
        setProjectsList(list);
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
      } catch {}
      finally { setLoading(false); }
    };
    void init();
  }, [userId]);

  // ── Actions ───────────────────────────────────────────────────────────────
  const handleDeleteProject = async (projectId: number) => {
    if (!window.confirm('Tem certeza que deseja apagar este projeto?')) return;
    try {
      const res = await fetch(`/api/projects?projectId=${projectId}`, { method: 'DELETE', credentials: 'include' });
      if (!res.ok) {
        const payload = (await res.json().catch(() => ({}))) as { message?: string };
        throw new Error(payload.message || 'Falha ao apagar projeto.');
      }
      setProjectsList(prev => prev.filter(p => p.id !== projectId));
      setSaveMessage('Projeto apagado com sucesso.');
    } catch (e) {
      setSaveMessage(e instanceof Error ? e.message : 'Erro ao apagar projeto.');
    }
  };

  const handleSendToDev = async (projectId: number, projectStatus: string) => {
    if (projectStatus === 'enviado') { alert('Este projeto já foi enviado para o desenvolvedor!'); return; }
    let projectData: Record<string, unknown> = {};
    try {
      const res = await fetch(`/api/projects?projectId=${projectId}`, { credentials: 'include' });
      if (res.ok) { const payload = await res.json() as { project?: Record<string, unknown> }; projectData = payload?.project || {}; }
    } catch {}
    try {
      await fetch(`/api/projects/send_to_dev?projectId=${projectId}`, { method: 'POST', credentials: 'include' });
      try {
        const resKanban = await fetch('/api/kanban', { credentials: 'include' });
        if (resKanban.ok) {
          const kanbanData = await resKanban.json() as { columns?: Array<{ id: number; cards: Array<{ title?: string; description?: string }> }> };
          const firstColumn = Array.isArray(kanbanData.columns) ? kanbanData.columns[0] : null;
          if (firstColumn?.id) {
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
            const alreadyExists = firstColumn.cards.some(c => c.title === projectData.title && c.description === description);
            if (!alreadyExists) {
              await fetch('/api/kanban', {
                method: 'POST', credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'card', columnId: firstColumn.id, title: projectData.title || 'Novo Projeto', description }),
              });
            }
          }
        }
      } catch {}
      await fetch('/api/project_updates', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({
          projectId, kind: 'planejamento',
          message: JSON.stringify({
            texto: 'Projeto enviado para análise do admin.',
            projeto: { id: projectData.id, title: projectData.title, status: 'enviado', progress: projectData.progress, client_name: projectData.client_name, client_email: projectData.client_email, client_phone: projectData.client_phone, project_type: projectData.project_type, final_date: projectData.final_date, language: projectData.language, framework: projectData.framework, integrations: projectData.integrations },
          }),
        }),
      });
      await fetch('/api/project_updates', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ projectId, kind: 'kanban', message: JSON.stringify({ status: 'inicio', texto: 'Projeto iniciado no Kanban.' }) }),
      });
      setShowSuccessPopup(true);
      setTimeout(() => setShowSuccessPopup(false), 1800);
      setProjectsList(prev => prev.map(p => p.id === projectId ? { ...p, status: 'enviado' } : p));
    } catch { setSaveMessage('Erro ao enviar para o desenvolvedor.'); }
  };

  function openNewModal() {
    setProjectName(''); setClientName(userData?.name || ''); setClientEmail(userData?.email || ''); setClientPhone(userData?.phone || '');
    setProjectType(''); setFinalDate(''); setLanguage(''); setFramework('');
    setIntegrationsField(''); setObservations('');
    setEditProjectId(null); setEditMode(true); setSaveMessage(null);
    setShowModal(true);
  }

  // ── Render ────────────────────────────────────────────────────────────────
  const sentCount = projectsList.filter(p => p.status === 'enviado').length;
  const activeCount = projectsList.filter(p => p.status !== 'enviado' && p.status !== 'concluido').length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-200 selection:bg-cyan-500/30">
      <Sidebar />
      <div className="md:pl-sidebar transition-[padding] duration-300 flex flex-col min-h-screen">
        <DashboardNav />

        <main className="flex-1 px-4 md:px-8 pt-[65px] pb-8">

          {/* ── Hero Header ─────────────────────────────────────── */}
          <div
            className="relative overflow-hidden rounded-3xl mt-4 px-8 py-8 bg-white dark:bg-transparent bg-gradient-to-br from-indigo-50 via-cyan-50 to-emerald-50 dark:from-indigo-600/10 dark:via-cyan-500/5 dark:to-emerald-500/10 border border-slate-200 dark:border-white/5 shadow-xl dark:shadow-2xl group"
          >
            <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-cyan-500/20 blur-[80px] pointer-events-none group-hover:bg-cyan-400/20 transition-colors duration-700" />
            <div className="absolute -bottom-20 left-20 w-72 h-72 rounded-full bg-indigo-500/20 blur-[80px] pointer-events-none group-hover:bg-indigo-400/20 transition-colors duration-700" />
            <div className="relative flex items-start justify-between gap-5 flex-wrap">
              <div>
                <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">Meus Projetos</h1>
                <p className="mt-2 text-sm md:text-base text-slate-500 dark:text-slate-400 max-w-md leading-relaxed">
                  Gerencie solicitações e acompanhe o desenvolvimento.
                </p>
                {!loading && (
                  <div className="flex flex-wrap gap-3 mt-4">
                    {[
                      { label: 'Total', value: projectsList.length, icon: FiFolder, color: 'text-indigo-400', bg: 'bg-indigo-400/10', border: 'border-[var(--color-accent)]/40/20' },
                      { label: 'Em andamento', value: activeCount, icon: FiClock, color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/20' },
                      { label: 'Enviados', value: sentCount, icon: FiCheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20' },
                    ].map(({ label, value, icon: Icon, color, bg, border }) => (
                      <div key={label} className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl border ${bg} ${border}`}>
                        <Icon className={`w-4 h-4 shrink-0 ${color}`} />
                        <span className="text-white font-black tabular-nums text-sm">{value}</span>
                        <span className="text-xs font-medium text-slate-400 uppercase tracking-widest">{label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={openNewModal}
                aria-label="Criar novo projeto"
                className="group relative flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_-5px_rgba(6,182,212,0.4)] shrink-0"
                style={{ background: 'linear-gradient(135deg,#004aad 0%,#00b09b 60%,#00d4aa 100%)' }}
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out" />
                <FiPlus className="w-4 h-4 relative z-10" />
                <span className="relative z-10">Novo Projeto</span>
              </button>
            </div>
          </div>

          {/* ── Content ─────────────────────────────────────────── */}
          <div className="mt-5">
            {loading ? (
              <div className="flex items-center justify-center py-24 gap-3">
                <div className="w-6 h-6 rounded-full border-2 animate-spin" style={{ borderColor: '#00b09b', borderTopColor: 'transparent' }} />
                <span className="text-sm text-slate-500 dark:text-white/50">Carregando projetos...</span>
              </div>
            ) : projectsList.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 gap-4">
                <div className="w-20 h-20 rounded-3xl flex items-center justify-center bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 shadow-sm dark:shadow-[0_0_30px_rgba(99,102,241,0.15)] relative">
                  <div className="absolute inset-0 bg-indigo-400 blur-xl opacity-20 rounded-3xl animate-pulse" />
                  <FiFolder className="w-10 h-10 text-indigo-400 relative z-10" />
                </div>
                <p className="text-slate-500 dark:text-slate-400 font-medium">Nenhum projeto encontrado.</p>
                <button
                  onClick={openNewModal}
                  className="group flex items-center gap-2 text-sm font-bold text-indigo-400 hover:text-indigo-300 transition-colors mt-2"
                >
                  <FiPlus className="w-4 h-4 transition-transform group-hover:scale-110" /> 
                  Criar primeiro projeto
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {projectsList.map((project) => {
                  const st = statusStyle(project.status);
                  const isExpanded = expandedCard === project.id;
                  const sent = project.status === 'enviado';
                  return (
                    <div
                      key={project.id}
                      className="rounded-3xl overflow-hidden transition-all duration-300 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10 hover:bg-slate-50 dark:hover:bg-white/[0.07] shadow-sm dark:shadow-lg group"
                      style={{ borderLeft: `4px solid ${st.dot}` }}
                    >
                      {/* Card header */}
                      <div className="px-6 py-5 flex items-center gap-4 flex-wrap">
                        {/* Title + status */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 flex-wrap">
                            <h3 className="font-black text-slate-900 dark:text-white text-xl tracking-tight truncate">{project.title || 'Projeto sem nome'}</h3>
                            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: st.bg, color: st.text }}>
                              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: st.dot }} />
                              {project.status}
                            </span>
                          </div>
                          <p className="text-sm mt-1 text-slate-500 dark:text-slate-400">
                            Atualizado em <span className="text-slate-700 dark:text-slate-300">{new Date(project.updated_at).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                          </p>
                        </div>

                        {/* Progress ring + pct */}
                        <div className="flex items-center gap-2 mr-2">
                          <svg width="44" height="44" viewBox="0 0 44 44" className="shrink-0 drop-shadow-md">
                            <circle cx="22" cy="22" r="18" fill="none" className="stroke-slate-200 dark:stroke-white/10" strokeWidth="4" />
                            <circle
                              cx="22" cy="22" r="18" fill="none"
                              stroke={st.dot} strokeWidth="4"
                              strokeDasharray={`${(project.progress / 100) * 113.09} 113.09`}
                              strokeLinecap="round"
                              transform="rotate(-90 22 22)"
                              style={{ transition: 'stroke-dasharray 1s ease-out' }}
                            />
                            <text x="22" y="26" textAnchor="middle" fontSize="10" fontWeight="900" fill="currentColor" className="text-slate-900 dark:text-white">{project.progress}%</text>
                          </svg>
                        </div>

                        {/* Expand toggle */}
                        <button
                          onClick={() => setExpandedCard(isExpanded ? null : project.id)}
                          className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white"
                        >
                          <FiChevronDown className={`w-5 h-5 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                        </button>
                      </div>

                      {/* Progress bar */}
                      <div className="px-6 pb-4">
                        <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-900 shadow-inner overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-1000 ease-out relative"
                            style={{ width: `${project.progress}%`, background: `linear-gradient(90deg,#004aad,${st.dot})` }}
                          >
                            <div className="absolute inset-0 bg-white/20 mix-blend-overlay animate-pulse" />
                          </div>
                        </div>
                      </div>

                      {/* Expanded details */}
                      {isExpanded && (
                        <div className="px-6 pb-6 border-t border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900/50">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-6 mt-6">
                            {[
                              { label: 'Cliente', value: project.client_name },
                              { label: 'E-mail', value: project.client_email },
                              { label: 'Telefone', value: project.client_phone },
                              { label: 'Tipo', value: project.project_type },
                              { label: 'Linguagem', value: project.language },
                              { label: 'Framework', value: project.framework },
                              { label: 'Integrações', value: project.integrations },
                              { label: 'Data final', value: project.final_date ? String(project.final_date).slice(0, 10) : null },
                            ].map(({ label, value }) => (
                              <div key={label}>
                                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-1">{label}</p>
                                <p className="font-semibold text-slate-900 dark:text-slate-200 truncate" title={value || undefined}>{value || '—'}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Actions footer */}
                      <div className="px-6 py-4 flex items-center justify-between gap-3 flex-wrap border-t border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900/30">
                        <div className="flex items-center gap-3">
                          {sent ? (
                            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                              <FiCheckCircle className="w-4 h-4" /> Enviado ao desenvolvedor
                            </span>
                          ) : (
                            <button
                              onClick={() => handleSendToDev(project.id, project.status)}
                              className="group relative inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                              style={{ background: 'linear-gradient(135deg,#10b981,#059669)' }}
                            >
                              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out" />
                              <FiSend className="w-4 h-4 relative z-10" /> 
                              <span className="relative z-10">Enviar para desenvolvedor</span>
                            </button>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            title="Editar projeto"
                            aria-label="Editar projeto"
                            onClick={() => {
                              setEditMode(true); setEditProjectId(project.id);
                              setProjectName(project.title || ''); setClientName(project.client_name || '');
                              setClientEmail(project.client_email || ''); setClientPhone(project.client_phone || '');
                              setProjectType(project.project_type || ''); setFinalDate(project.final_date ? String(project.final_date).slice(0, 10) : '');
                              setLanguage(project.language || ''); setFramework(project.framework || '');
                              setIntegrationsField(project.integrations || ''); setObservations('');
                              setSaveMessage(null); setShowModal(true);
                            }}
                            className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-110 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-500/20"
                          >
                            <FiEdit2 className="w-4 h-4" />
                          </button>
                          <button
                            title="Excluir projeto"
                            aria-label="Excluir projeto"
                            onClick={() => handleDeleteProject(project.id)}
                            className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-110 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ── Create / Edit Modal ──────────────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-md">
          <div
            className="relative w-full max-w-3xl rounded-3xl overflow-hidden max-h-[92vh] flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-xl dark:shadow-[0_0_60px_rgba(0,0,0,0.6)]"
          >
            {/* Modal header */}
            <div className="px-8 py-6 flex items-center justify-between shrink-0 border-b border-slate-200 dark:border-white/10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br from-[var(--color-accent-600)] to-[var(--color-accent)] shadow-lg shadow-cyan-500/20">
                  <FiFolder className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Solicitar novo projeto</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Preencha as informações detalhadas abaixo</p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-10 h-10 rounded-full flex items-center justify-center transition-colors text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {/* Modal body */}
            <div className="overflow-y-auto px-8 py-6 flex-1 custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                <InputField label="Nome do projeto">
                  <input className={FIELD_STYLE} style={FIELD_BG} value={projectName} onChange={e => setProjectName(e.target.value)} placeholder="Ex: Site institucional" disabled={!editMode} />
                </InputField>
                <InputField label="Seu nome">
                  <input className={FIELD_STYLE} style={FIELD_BG} value={clientName} onChange={e => setClientName(e.target.value)} placeholder="Nome completo" disabled={!editMode} />
                </InputField>
                <InputField label="E-mail">
                  <input className={FIELD_STYLE} style={FIELD_BG} value={clientEmail} onChange={e => setClientEmail(e.target.value)} placeholder="seu@email.com" type="email" disabled={!editMode} />
                </InputField>
                <InputField label="Telefone">
                  <input className={FIELD_STYLE} style={FIELD_BG} value={clientPhone} onChange={e => setClientPhone(e.target.value)} placeholder="(00) 00000-0000" disabled={!editMode} />
                </InputField>
                <InputField label="Tipo de projeto">
                  <DarkSelect value={projectType} onChange={setProjectType} options={['Site', 'App', 'Landing Page', 'E-commerce', 'Sistema Web', 'Outro']} placeholder="Selecione" disabled={!editMode} />
                </InputField>
                <InputField label="Linguagem / Stack">
                  <DarkSelect value={language} onChange={setLanguage} options={['TypeScript', 'JavaScript', 'Python', 'PHP', 'Java', 'C#', 'Outro']} placeholder="Selecione" disabled={!editMode} />
                </InputField>
                <InputField label="Framework">
                  <DarkSelect value={framework} onChange={setFramework} options={['Next.js', 'React', 'Vue.js', 'Angular', 'Laravel', 'Django', 'Outro']} placeholder="Selecione" disabled={!editMode} />
                </InputField>
                <InputField label="Integrações">
                  <input className={FIELD_STYLE} style={FIELD_BG} value={integrationsField} onChange={e => setIntegrationsField(e.target.value)} placeholder="PagSeguro, WhatsApp, etc." disabled={!editMode} />
                </InputField>
                <InputField label="Data final">
                  <input className={FIELD_STYLE} style={FIELD_BG} value={finalDate} onChange={e => setFinalDate(e.target.value)} type="date" disabled={!editMode} />
                </InputField>
                <div className="md:col-span-2">
                  <InputField label="Observações">
                    <textarea className={`${FIELD_STYLE} resize-none h-32`} style={FIELD_BG} value={observations} onChange={e => setObservations(e.target.value)} placeholder="Descreva requisitos, referências ou particularidades..." disabled={!editMode} />
                  </InputField>
                </div>
              </div>
            </div>

            {/* Modal footer */}
            <div className="px-8 py-5 flex items-center justify-between gap-3 shrink-0 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900/50">
              {saveMessage ? (
                <p className={`text-sm font-bold ${saveMessage.includes('sucesso') ? 'text-emerald-500 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>{saveMessage}</p>
              ) : <span />}
              <div className="flex gap-3 ml-auto">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-6 py-3 rounded-xl text-sm font-bold transition-colors text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10"
                >
                  Cancelar
                </button>
                {editMode ? (
                  <button
                    onClick={() => { void onSave(); setEditMode(false); setShowModal(false); }}
                    disabled={saving}
                    className="group relative overflow-hidden px-8 py-3 rounded-xl text-sm font-black text-white transition-all hover:scale-105 active:scale-95 disabled:opacity-50 shadow-[0_0_20px_rgba(6,182,212,0.3)]"
                    style={{ background: 'linear-gradient(135deg,#004aad 0%,#00b09b 60%,#00d4aa 100%)' }}
                  >
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out" />
                    <span className="relative z-10">{saving ? 'Salvando…' : 'Salvar Projeto'}</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setEditMode(true)}
                    className="group relative overflow-hidden px-8 py-3 rounded-xl text-sm font-black text-white transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(6,182,212,0.3)]"
                    style={{ background: 'linear-gradient(135deg,#004aad 0%,#00b09b 60%,#00d4aa 100%)' }}
                  >
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out" />
                    <span className="relative z-10">Solicitar projeto</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Success popup ────────────────────────────────────────────────────── */}
      {showSuccessPopup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
          <div
            className="flex flex-col items-center gap-3 px-10 py-8 rounded-3xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-500/30 backdrop-blur-xl shadow-[0_0_40px_rgba(16,185,129,0.1)] dark:shadow-[0_0_60px_rgba(16,185,129,0.2)] animate-in fade-in zoom-in duration-300"
          >
            <div className="w-16 h-16 rounded-full flex items-center justify-center bg-emerald-100 dark:bg-emerald-500/20 relative">
              <div className="absolute inset-0 bg-emerald-400 blur-md opacity-20 rounded-full animate-pulse" />
              <FiCheckCircle className="w-8 h-8 text-emerald-500 dark:text-emerald-400 relative z-10" />
            </div>
            <p className="font-black text-slate-900 dark:text-white text-lg mt-2">Projeto enviado com sucesso!</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">O desenvolvedor foi notificado.</p>
          </div>
        </div>
      )}
    </div>
  );
}
