'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { FiEdit2, FiTrash2, FiSend, FiPlus, FiCheckCircle, FiClock, FiFolder, FiX, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import DashboardNav from '../../../component/DashboardNav';
import Sidebar from '../../../component/Sidebar';

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
  'w-full rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-white/25 outline-none transition focus:ring-1 focus:ring-[#00b09b] disabled:opacity-40';
const FIELD_BG = { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' };

function InputField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.35)' }}>
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

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(o => !o)}
        className="w-full rounded-xl px-3 py-2.5 text-sm text-left flex items-center justify-between outline-none transition focus:ring-1 focus:ring-[#00b09b] disabled:opacity-40"
        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: value ? 'white' : 'rgba(255,255,255,0.25)' }}
      >
        <span>{value || placeholder || 'Selecione'}</span>
        <FiChevronDown className="w-3.5 h-3.5 shrink-0 transition-transform" style={{ transform: open ? 'rotate(180deg)' : 'none', color: 'rgba(255,255,255,0.35)' }} />
      </button>
      {open && (
        <div
          className="absolute z-50 left-0 right-0 mt-1 rounded-xl overflow-hidden py-1"
          style={{ background: '#1a2235', border: '1px solid rgba(255,255,255,0.12)', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}
        >
          {['', ...options].map(opt => (
            <button
              key={opt}
              type="button"
              onClick={() => { onChange(opt); setOpen(false); }}
              className="w-full text-left px-4 py-2 text-sm transition"
              style={{
                color: opt === value ? '#00d4aa' : opt ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.3)',
                background: opt === value ? 'rgba(0,176,155,0.12)' : 'transparent',
              }}
              onMouseEnter={e => { if (opt !== value) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.05)'; }}
              onMouseLeave={e => { if (opt !== value) (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
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

  // ── Auth ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/me', { credentials: 'include' });
        if (!res.ok) { router.replace('/login'); return; }
        const user = await res.json() as { role?: string; id?: unknown };
        setUserId(Number(user.id ?? NaN));
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
  const [, setEditProjectId] = useState<number | null>(null);
  const [, setLastSavedProject] = useState<Project | null>(null);
  const [, setAdminStatus] = useState<'accepted' | 'rejected' | null>(null);
  const [, setCollapsedView] = useState(false);
  const [expandedCard, setExpandedCard] = useState<number | null>(null);

  const [userId, setUserId] = useState<number | null>(null);
  const [projectsList, setProjectsList] = useState<Project[]>([]);

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
      const res = await fetch('/api/projects', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          userId, title: projectName?.trim() || null, clientName, clientEmail,
          clientPhone, projectType, language: language || null, framework: framework || null,
          integrations: integrationsField || null, observations: observations || null,
          finalDate: finalDate || null,
        }),
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
      if (!Number.isFinite(userId ?? NaN)) {
        try {
          const resMe = await fetch('/api/me', { credentials: 'include' });
          if (resMe.ok) { const me = await resMe.json() as { id?: unknown }; setUserId(Number(me.id ?? NaN)); }
          else return;
        } catch { return; }
      }
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
      await fetch(`/api/projects?projectId=${projectId}`, { method: 'DELETE', credentials: 'include' });
      setProjectsList(prev => prev.filter(p => p.id !== projectId));
      setSaveMessage('Projeto apagado com sucesso.');
    } catch { setSaveMessage('Erro ao apagar projeto.'); }
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
    setProjectName(''); setClientName(''); setClientEmail(''); setClientPhone('');
    setProjectType(''); setFinalDate(''); setLanguage(''); setFramework('');
    setIntegrationsField(''); setObservations('');
    setEditProjectId(null); setEditMode(true); setSaveMessage(null);
    setShowModal(true);
  }

  // ── Render ────────────────────────────────────────────────────────────────
  const sentCount = projectsList.filter(p => p.status === 'enviado').length;
  const activeCount = projectsList.filter(p => p.status !== 'enviado' && p.status !== 'concluido').length;

  return (
    <div style={{ minHeight: '100vh', background: '#0a0f1e' }}>
      <Sidebar />
      <div className="md:pl-[var(--sidebar-width,5rem)] transition-[padding] duration-300 flex flex-col min-h-screen">
        <DashboardNav />

        <main className="px-4 md:px-8 pt-[81px] pb-20">

          {/* ── Hero Header ─────────────────────────────────────── */}
          <div
            className="relative overflow-hidden rounded-2xl mt-6 px-7 py-6"
            style={{ background: 'linear-gradient(130deg, rgba(0,74,173,0.18) 0%, rgba(0,176,155,0.12) 100%)', border: '1px solid rgba(0,176,155,0.2)' }}
          >
            <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full blur-3xl opacity-15 pointer-events-none" style={{ background: 'radial-gradient(circle,#004aad,transparent)' }} />
            <div className="absolute -bottom-8 right-24 w-32 h-32 rounded-full blur-3xl opacity-10 pointer-events-none" style={{ background: 'radial-gradient(circle,#00b09b,transparent)' }} />
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h1 className="text-2xl font-extrabold text-white tracking-tight">Meus Projetos</h1>
                <p className="mt-1 text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  Gerencie solicitações e acompanhe o desenvolvimento.
                </p>
                {!loading && (
                  <div className="flex flex-wrap gap-3 mt-4">
                    {[
                      { label: 'Total', value: projectsList.length, icon: FiFolder, color: '#6366f1' },
                      { label: 'Em andamento', value: activeCount, icon: FiClock, color: '#f59e0b' },
                      { label: 'Enviados', value: sentCount, icon: FiCheckCircle, color: '#00b09b' },
                    ].map(({ label, value, icon: Icon, color }) => (
                      <div key={label} className="flex items-center gap-2 px-4 py-2 rounded-xl" style={{ background: color + '18', border: `1px solid ${color}28` }}>
                        <Icon className="w-4 h-4 shrink-0" style={{ color }} />
                        <span className="text-white font-bold tabular-nums text-sm">{value}</span>
                        <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={openNewModal}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white transition hover:opacity-90 active:scale-95 shrink-0"
                style={{ background: 'linear-gradient(135deg,#004aad,#00b09b)', boxShadow: '0 0 20px rgba(0,176,155,0.25)' }}
              >
                <FiPlus className="w-4 h-4" />
                Novo Projeto
              </button>
            </div>
          </div>

          {/* ── Content ─────────────────────────────────────────── */}
          <div className="mt-5">
            {loading ? (
              <div className="flex items-center justify-center py-24 gap-3">
                <div className="w-6 h-6 rounded-full border-2 animate-spin" style={{ borderColor: '#00b09b', borderTopColor: 'transparent' }} />
                <span className="text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>Carregando projetos...</span>
              </div>
            ) : projectsList.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 gap-4">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(0,74,173,0.12)', border: '1px solid rgba(0,74,173,0.2)' }}>
                  <FiFolder className="w-8 h-8" style={{ color: '#6366f1' }} />
                </div>
                <p className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.35)' }}>Nenhum projeto encontrado.</p>
                <button
                  onClick={openNewModal}
                  className="mt-1 flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white transition hover:opacity-90"
                  style={{ background: 'linear-gradient(135deg,#004aad,#00b09b)' }}
                >
                  <FiPlus className="w-4 h-4" /> Criar primeiro projeto
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
                      className="rounded-2xl overflow-hidden transition-all duration-200"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderLeft: `3px solid ${st.dot}` }}
                    >
                      {/* Card header */}
                      <div className="px-5 py-4 flex items-center gap-3 flex-wrap">
                        {/* Title + status */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <h3 className="font-extrabold text-white text-base truncate">{project.title || 'Projeto sem nome'}</h3>
                            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: st.bg, color: st.text }}>
                              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: st.dot }} />
                              {project.status}
                            </span>
                          </div>
                          <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.28)' }}>
                            Atualizado em {new Date(project.updated_at).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>

                        {/* Progress ring + pct */}
                        <div className="flex items-center gap-1.5 mr-1">
                          <svg width="36" height="36" viewBox="0 0 36 36" className="shrink-0">
                            <circle cx="18" cy="18" r="14" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3.5" />
                            <circle
                              cx="18" cy="18" r="14" fill="none"
                              stroke={st.dot} strokeWidth="3.5"
                              strokeDasharray={`${(project.progress / 100) * 87.96} 87.96`}
                              strokeLinecap="round"
                              transform="rotate(-90 18 18)"
                              style={{ transition: 'stroke-dasharray 0.6s ease' }}
                            />
                            <text x="18" y="22" textAnchor="middle" fontSize="8" fontWeight="800" fill="white">{project.progress}%</text>
                          </svg>
                        </div>

                        {/* Expand toggle */}
                        <button
                          onClick={() => setExpandedCard(isExpanded ? null : project.id)}
                          className="p-1.5 rounded-lg transition hover:bg-white/10"
                          style={{ color: 'rgba(255,255,255,0.35)' }}
                        >
                          {isExpanded ? <FiChevronUp className="w-4 h-4" /> : <FiChevronDown className="w-4 h-4" />}
                        </button>
                      </div>

                      {/* Progress bar */}
                      <div className="px-5 pb-3">
                        <div className="h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${project.progress}%`, background: `linear-gradient(90deg,#004aad,${st.dot})` }}
                          />
                        </div>
                      </div>

                      {/* Expanded details */}
                      {isExpanded && (
                        <div className="px-5 pb-5 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-3 mt-4 text-sm">
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
                                <p className="text-[10px] font-semibold uppercase tracking-wider mb-0.5" style={{ color: 'rgba(255,255,255,0.28)' }}>{label}</p>
                                <p className="font-medium text-white/70 truncate">{value || '—'}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Actions footer */}
                      <div className="px-5 py-3 flex items-center justify-between gap-3 flex-wrap border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                        <div className="flex items-center gap-2">
                          {sent ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold" style={{ background: 'rgba(0,176,155,0.15)', color: '#00d4aa' }}>
                              <FiCheckCircle className="w-3.5 h-3.5" /> Enviado ao desenvolvedor
                            </span>
                          ) : (
                            <button
                              onClick={() => handleSendToDev(project.id, project.status)}
                              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white transition hover:opacity-80 active:scale-95"
                              style={{ background: 'linear-gradient(135deg,#16a34a,#059669)', boxShadow: '0 0 12px rgba(22,163,74,0.2)' }}
                            >
                              <FiSend className="w-3.5 h-3.5" /> Enviar para desenvolvedor
                            </button>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            title="Editar projeto"
                            onClick={() => {
                              setEditMode(true); setEditProjectId(project.id);
                              setProjectName(project.title || ''); setClientName(project.client_name || '');
                              setClientEmail(project.client_email || ''); setClientPhone(project.client_phone || '');
                              setProjectType(project.project_type || ''); setFinalDate(project.final_date ? String(project.final_date).slice(0, 10) : '');
                              setLanguage(project.language || ''); setFramework(project.framework || '');
                              setIntegrationsField(project.integrations || ''); setObservations('');
                              setSaveMessage(null); setShowModal(true);
                            }}
                            className="w-8 h-8 rounded-xl flex items-center justify-center transition hover:bg-blue-500/20"
                            style={{ background: 'rgba(99,102,241,0.12)' }}
                          >
                            <FiEdit2 className="w-3.5 h-3.5" style={{ color: '#818cf8' }} />
                          </button>
                          <button
                            title="Excluir projeto"
                            onClick={() => handleDeleteProject(project.id)}
                            className="w-8 h-8 rounded-xl flex items-center justify-center transition hover:bg-red-500/20"
                            style={{ background: 'rgba(239,68,68,0.1)' }}
                          >
                            <FiTrash2 className="w-3.5 h-3.5" style={{ color: '#f87171' }} />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}>
          <div
            className="relative w-full max-w-2xl rounded-2xl overflow-hidden max-h-[92vh] flex flex-col"
            style={{ background: '#111827', border: '1px solid rgba(0,176,155,0.25)', boxShadow: '0 0 60px rgba(0,74,173,0.2)' }}
          >
            {/* Modal header */}
            <div className="px-6 py-5 flex items-center justify-between shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              <div>
                <h2 className="text-base font-extrabold text-white">Solicitar novo projeto</h2>
                <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>Preencha as informações básicas</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-xl flex items-center justify-center transition hover:bg-white/10"
                style={{ color: 'rgba(255,255,255,0.4)' }}
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>

            {/* Modal body */}
            <div className="overflow-y-auto px-6 py-5 flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                <div className="sm:col-span-2">
                  <InputField label="Observações">
                    <textarea className={`${FIELD_STYLE} resize-none h-24`} style={FIELD_BG} value={observations} onChange={e => setObservations(e.target.value)} placeholder="Descreva requisitos, referências ou particularidades..." disabled={!editMode} />
                  </InputField>
                </div>
              </div>
            </div>

            {/* Modal footer */}
            <div className="px-6 py-4 flex items-center justify-between gap-3 shrink-0" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
              {saveMessage ? (
                <p className={`text-sm font-medium ${saveMessage.includes('sucesso') ? 'text-emerald-400' : 'text-red-400'}`}>{saveMessage}</p>
              ) : <span />}
              <div className="flex gap-2 ml-auto">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold transition hover:bg-white/10"
                  style={{ color: 'rgba(255,255,255,0.5)' }}
                >
                  Cancelar
                </button>
                {editMode ? (
                  <button
                    onClick={() => { void onSave(); setEditMode(false); setShowModal(false); }}
                    disabled={saving}
                    className="px-5 py-2 rounded-xl text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-50"
                    style={{ background: 'linear-gradient(135deg,#004aad,#00b09b)' }}
                  >
                    {saving ? 'Salvando…' : 'Salvar Projeto'}
                  </button>
                ) : (
                  <button
                    onClick={() => setEditMode(true)}
                    className="px-5 py-2 rounded-xl text-sm font-bold text-white transition hover:opacity-90"
                    style={{ background: 'linear-gradient(135deg,#004aad,#00b09b)' }}
                  >
                    Solicitar projeto
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
            className="flex flex-col items-center gap-3 px-8 py-6 rounded-2xl"
            style={{ background: 'rgba(0,20,40,0.95)', border: '1px solid rgba(0,176,155,0.35)', backdropFilter: 'blur(12px)', boxShadow: '0 0 40px rgba(0,176,155,0.2)' }}
          >
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'rgba(0,176,155,0.15)' }}>
              <FiCheckCircle className="w-6 h-6" style={{ color: '#00d4aa' }} />
            </div>
            <p className="font-bold text-white text-sm">Projeto enviado com sucesso!</p>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>O desenvolvedor foi notificado.</p>
          </div>
        </div>
      )}
    </div>
  );
}
