"use client";
import React, { useEffect, useState } from "react";
import { FiSave, FiKey, FiGlobe, FiUser, FiBell, FiShield, FiCheckCircle, FiEye, FiEyeOff, FiCpu, FiSliders, FiUsers, FiBriefcase } from "react-icons/fi";
import DashboardNav from "@/component/DashboardNav";
import Sidebar from "@/component/Sidebar";
import UserManagement from "./UserManagement";

type Section = 'iaagent' | 'api' | 'perfil' | 'notificacoes' | 'seguranca' | 'clientes' | 'equipe';

const SECTIONS: { id: Section; label: string; icon: React.ReactNode; desc: string }[] = [
  { id: 'iaagent',       label: 'IA Agent',          icon: <FiCpu />,     desc: 'Modelo, chave Groq e comportamento do agente' },
  { id: 'api',           label: 'API & Integrações', icon: <FiKey />,     desc: 'Chaves de API e webhooks do sistema' },
  { id: 'clientes',      label: 'Clientes',          icon: <FiUsers />,   desc: 'Gerenciamento de contas de clientes' },
  { id: 'equipe',        label: 'Equipe',            icon: <FiBriefcase />, desc: 'Gerenciamento de membros da equipe' },
  { id: 'perfil',        label: 'Perfil',            icon: <FiUser />,    desc: 'Informações da conta e preferências' },
  { id: 'notificacoes',  label: 'Notificações',      icon: <FiBell />,    desc: 'Configurar alertas e notificações' },
  { id: 'seguranca',     label: 'Segurança',         icon: <FiShield />,  desc: 'Senha, sessões e 2FA' },
];

const FIELD_STYLE = "w-full rounded-xl px-3 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/25 outline-none transition focus:ring-1 focus:ring-[#00b09b] bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:bg-white dark:focus:bg-white/10";

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-semibold uppercase tracking-widest text-slate-500 dark:text-white/35">{label}</label>
      {children}
      {hint && <p className="text-[11px] text-slate-400 dark:text-white/20">{hint}</p>}
    </div>
  );
}

export default function ConfiguracoesPage() {
  const [activeSection, setActiveSection] = useState<Section>('iaagent');
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [saved, setSaved] = useState(false);

  // IA Agent section
  type ProviderType = 'google' | 'openai' | 'anthropic' | 'groq' | 'lmstudio';
  const [provider, setProvider] = useState<ProviderType>('groq');
  const [groqKey, setGroqKey] = useState('');
  const [groqModel, setGroqModel] = useState('');
  const [openAiKey, setOpenAiKey] = useState('');
  const [openAiModel, setOpenAiModel] = useState('gpt-4o-mini');
  const [anthropicKey, setAnthropicKey] = useState('');
  const [anthropicModel, setAnthropicModel] = useState('claude-3-5-sonnet-20241022');
  const [googleKey, setGoogleKey] = useState('');
  const [googleModel, setGoogleModel] = useState('gemini-1.5-flash');
  const [lmStudioUrl, setLmStudioUrl] = useState('http://127.0.0.1:1234/v1');
  const [lmStudioModel, setLmStudioModel] = useState('local-model');
  const [lmStudioApiKey, setLmStudioApiKey] = useState('lm-studio');
  const [webhook, setWebhook] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [showKey, setShowKey] = useState(false);

  // Profile section
  const [profileName, setProfileName] = useState('');
  const [profileEmail, setProfileEmail] = useState('');

  // Notifications section
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifProject, setNotifProject] = useState(true);
  const [notifSystem, setNotifSystem] = useState(false);

  // Security section
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/me', { credentials: 'include' });
        if (res.ok) {
          const me = await res.json() as { role?: string; name?: string; email?: string };
          const isAdminUser = me.role === 'admin';
          setIsAdmin(isAdminUser);
          if (!isAdminUser && (activeSection === 'iaagent' || activeSection === 'api')) {
            setActiveSection('perfil');
          }
          setProfileName(me.name ?? '');
          setProfileEmail(me.email ?? '');
        }
      } catch {}
      setCheckingAuth(false);
    })();
    // Load persisted IA settings
    try {
      const savedProvider = (localStorage.getItem('IA_PROVIDER') as ProviderType) || 'groq';
      setProvider(['google','openai','anthropic','groq','lmstudio'].includes(savedProvider) ? savedProvider : 'groq');
      setGroqKey(localStorage.getItem('GROQ_API_KEY') ?? '');
      setGroqModel(localStorage.getItem('GROQ_MODEL') ?? '');
      setOpenAiKey(localStorage.getItem('OPENAI_API_KEY') ?? '');
      setOpenAiModel(localStorage.getItem('OPENAI_MODEL') ?? 'gpt-4o-mini');
      setAnthropicKey(localStorage.getItem('ANTHROPIC_API_KEY') ?? '');
      setAnthropicModel(localStorage.getItem('ANTHROPIC_MODEL') ?? 'claude-3-5-sonnet-20241022');
      setGoogleKey(localStorage.getItem('GOOGLE_API_KEY') ?? '');
      setGoogleModel(localStorage.getItem('GOOGLE_MODEL') ?? 'gemini-1.5-flash');
      setLmStudioUrl(localStorage.getItem('LMSTUDIO_BASE_URL') ?? 'http://127.0.0.1:1234/v1');
      setLmStudioModel(localStorage.getItem('LMSTUDIO_MODEL') ?? 'local-model');
      setLmStudioApiKey(localStorage.getItem('LMSTUDIO_API_KEY') ?? 'lm-studio');
      setWebhook(localStorage.getItem('WEBHOOK_URL') ?? '');
      setSystemPrompt(localStorage.getItem('IA_SYSTEM_PROMPT') ?? '');
    } catch {}
  }, []);

  const handleSave = () => {
    try {
      if (activeSection === 'iaagent') {
        localStorage.setItem('IA_PROVIDER', provider);
        localStorage.setItem('GROQ_API_KEY', groqKey);
        localStorage.setItem('GROQ_MODEL', groqModel);
        localStorage.setItem('OPENAI_API_KEY', openAiKey);
        localStorage.setItem('OPENAI_MODEL', openAiModel);
        localStorage.setItem('ANTHROPIC_API_KEY', anthropicKey);
        localStorage.setItem('ANTHROPIC_MODEL', anthropicModel);
        localStorage.setItem('GOOGLE_API_KEY', googleKey);
        localStorage.setItem('GOOGLE_MODEL', googleModel);
        localStorage.setItem('LMSTUDIO_BASE_URL', lmStudioUrl);
        localStorage.setItem('LMSTUDIO_MODEL', lmStudioModel);
        localStorage.setItem('LMSTUDIO_API_KEY', lmStudioApiKey);
        localStorage.setItem('WEBHOOK_URL', webhook);
        localStorage.setItem('IA_SYSTEM_PROMPT', systemPrompt);
      }
    } catch {}
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-200">
        <Sidebar />
        <div className="md:pl-sidebar transition-[padding] duration-300 flex items-center justify-center min-h-screen">
          <div className="w-6 h-6 rounded-full border-2 animate-spin" style={{ borderColor: '#00b09b', borderTopColor: 'transparent' }} />
        </div>
      </div>
    );
  }

  const VISIBLE_SECTIONS = SECTIONS.filter(s => isAdmin || ['perfil', 'notificacoes', 'seguranca'].includes(s.id));
  const currentSectionMeta = SECTIONS.find(s => s.id === activeSection)!;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-200 selection:bg-cyan-500/30">
      <Sidebar />
      <div className="md:pl-sidebar transition-[padding] duration-300 flex flex-col min-h-screen">
        <DashboardNav />

        <main className="flex-1 px-4 md:px-8 pt-[65px] pb-8">
          {/* Header */}
          <div
            className="relative overflow-hidden rounded-3xl mt-4 px-8 py-8 bg-white dark:bg-transparent bg-gradient-to-br from-indigo-50 via-cyan-50 to-emerald-50 dark:from-indigo-600/10 dark:via-cyan-500/5 dark:to-emerald-500/10 border border-slate-200 dark:border-white/5 shadow-xl dark:shadow-2xl group"
          >
            <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-cyan-500/20 blur-[80px] pointer-events-none group-hover:bg-cyan-400/20 transition-colors duration-700" />
            <div className="absolute -bottom-20 left-20 w-72 h-72 rounded-full bg-indigo-500/20 blur-[80px] pointer-events-none group-hover:bg-indigo-400/20 transition-colors duration-700" />
            
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight relative z-10">Configurações</h1>
            <p className="mt-2 text-sm md:text-base text-slate-500 dark:text-slate-400 max-w-md leading-relaxed relative z-10">Gerencie preferências, integrações e segurança do sistema.</p>
          </div>

          <div className="mt-5 flex flex-col md:flex-row gap-5">
            {/* ── Sidebar nav ── */}
            <nav
              className="md:w-60 shrink-0 rounded-2xl overflow-hidden p-2 flex flex-row md:flex-col gap-1 flex-wrap bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-lg"
            >
              {VISIBLE_SECTIONS.map(s => (
                <button
                  key={s.id}
                  onClick={() => setActiveSection(s.id)}
                  className={`group flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left transition-all w-full border-l-[3px] ${
                    activeSection === s.id
                      ? 'bg-cyan-50 dark:bg-cyan-500/10 border-cyan-500'
                      : 'border-transparent hover:bg-slate-50 dark:hover:bg-white/5'
                  }`}
                >
                  <span className={`text-base shrink-0 ${activeSection === s.id ? 'text-cyan-600 dark:text-cyan-400' : 'text-slate-400 dark:text-slate-500'}`}>
                    {s.icon}
                  </span>
                  <div className="min-w-0">
                    <p className={`text-xs font-bold ${activeSection === s.id ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>{s.label}</p>
                  </div>
                </button>
              ))}
            </nav>

            {/* ── Content panel ── */}
            <div className="flex-1 rounded-2xl overflow-hidden bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-lg">
              {/* Panel header */}
              <div className="px-6 py-5 flex items-center gap-3 border-b border-slate-200 dark:border-white/5">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-200 dark:border-cyan-500/20">
                  <span className="text-cyan-600 dark:text-cyan-400">{currentSectionMeta.icon}</span>
                </div>
                <div>
                  <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">{currentSectionMeta.label}</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{currentSectionMeta.desc}</p>
                </div>
              </div>

              {/* Panel body */}
              <div className="px-6 py-6">

                {/* IA Agent */}
                {activeSection === 'iaagent' && (
                  <div className="flex flex-col gap-5 w-full">

                    {/* Model */}
                    <div className="rounded-2xl overflow-hidden bg-slate-50 dark:bg-white/[0.025] border border-slate-200 dark:border-white/5">
                      <div className="px-4 py-3 flex items-center gap-2 border-b border-slate-200 dark:border-white/5">
                        <FiSliders className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                        <p className="text-xs font-bold text-slate-900 dark:text-white">Modelo de IA</p>
                      </div>
                      <div className="px-4 py-4 flex flex-col gap-4">
                        <Field label="Provedor de IA">
                          <select className={FIELD_STYLE} value={provider} onChange={e => setProvider(e.target.value as ProviderType)}>
                            <option value="google">Google</option>
                            <option value="openai">OpenAI</option>
                            <option value="anthropic">Anthropic</option>
                            <option value="groq">Groq</option>
                            <option value="lmstudio">LM Studio</option>
                          </select>
                        </Field>

                        {provider === 'google' && (
                          <>
                            <Field label="API Key do Google AI" hint="Sua chave da Google Gemini API">
                              <input className={FIELD_STYLE} value={googleKey} onChange={e => setGoogleKey(e.target.value)} placeholder="AIza..." />
                            </Field>
                            <Field label="Modelo do Google" hint="Ex: gemini-1.5-flash, gemini-2.0-flash">
                              <input className={FIELD_STYLE} value={googleModel} onChange={e => setGoogleModel(e.target.value)} placeholder="gemini-1.5-flash" />
                            </Field>
                          </>
                        )}

                        {provider === 'openai' && (
                          <>
                            <Field label="OpenAI API Key" hint="Sua chave da OpenAI">
                              <input className={FIELD_STYLE} value={openAiKey} onChange={e => setOpenAiKey(e.target.value)} placeholder="sk-..." />
                            </Field>
                            <Field label="Modelo OpenAI" hint="Ex: gpt-4o-mini, gpt-4.1-mini">
                              <input className={FIELD_STYLE} value={openAiModel} onChange={e => setOpenAiModel(e.target.value)} placeholder="gpt-4o-mini" />
                            </Field>
                          </>
                        )}

                        {provider === 'anthropic' && (
                          <>
                            <Field label="Anthropic API Key" hint="Sua chave da Anthropic">
                              <input className={FIELD_STYLE} value={anthropicKey} onChange={e => setAnthropicKey(e.target.value)} placeholder="sk-ant-..." />
                            </Field>
                            <Field label="Modelo Anthropic" hint="Ex: claude-3-5-sonnet-20241022">
                              <input className={FIELD_STYLE} value={anthropicModel} onChange={e => setAnthropicModel(e.target.value)} placeholder="claude-3-5-sonnet-20241022" />
                            </Field>
                          </>
                        )}

                        {provider === 'groq' && (
                          <>
                            <Field label="Modelo Groq" hint="Ex: llama-3.3-70b-versatile, mixtral-8x7b-32768">
                              <input className={FIELD_STYLE} value={groqModel} onChange={e => setGroqModel(e.target.value)} placeholder="llama-3.3-70b-versatile" />
                            </Field>
                            <div className="flex flex-wrap gap-2">
                              {['llama-3.3-70b-versatile', 'mixtral-8x7b-32768', 'gemma2-9b-it'].map(m => (
                                <button key={m} onClick={() => setGroqModel(m)} className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition border ${
                                    groqModel === m
                                      ? 'bg-cyan-50 dark:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border-cyan-200 dark:border-cyan-500/30'
                                      : 'bg-white dark:bg-white/5 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10'
                                  }`}>{m}</button>
                              ))}
                            </div>
                          </>
                        )}

                        {provider === 'lmstudio' && (
                          <>
                            <Field label="API Key do LM Studio" hint="Opcional em ambiente local; geralmente use 'lm-studio'">
                              <input className={FIELD_STYLE} value={lmStudioApiKey} onChange={e => setLmStudioApiKey(e.target.value)} placeholder="lm-studio" />
                            </Field>
                            <Field label="URL do LM Studio" hint="Ex: http://127.0.0.1:1234/v1">
                              <input className={FIELD_STYLE} value={lmStudioUrl} onChange={e => setLmStudioUrl(e.target.value)} placeholder="http://127.0.0.1:1234/v1" />
                            </Field>
                            <Field label="Modelo local do LM Studio" hint="Nome do modelo carregado no LM Studio">
                              <input className={FIELD_STYLE} value={lmStudioModel} onChange={e => setLmStudioModel(e.target.value)} placeholder="local-model" />
                            </Field>
                          </>
                        )}
                      </div>
                    </div>

                    {/* API Key & Webhook */}
                    <div className="rounded-2xl overflow-hidden bg-slate-50 dark:bg-white/[0.025] border border-slate-200 dark:border-white/5">
                      <div className="px-4 py-3 flex items-center gap-2 border-b border-slate-200 dark:border-white/5">
                        <FiKey className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                        <p className="text-xs font-bold text-slate-900 dark:text-white">API & Integrações</p>
                      </div>
                      <div className="px-4 py-4 flex flex-col gap-4">
                        <Field label="GROQ API Key" hint="Sua chave privada da plataforma Groq">
                          <div className="relative">
                            <input
                              type={showKey ? 'text' : 'password'}
                              className={`${FIELD_STYLE} pr-10`}
                              value={groqKey}
                              onChange={e => setGroqKey(e.target.value)}
                              placeholder="gsk_••••••••••••••••••••••"
                            />
                            <button type="button" onClick={() => setShowKey(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                              {showKey ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                            </button>
                          </div>
                        </Field>
                        <Field label="Webhook URL" hint="URL para receber notificações de eventos">
                          <div className="relative">
                            <FiGlobe className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                            <input className={`${FIELD_STYLE} pl-8`} value={webhook} onChange={e => setWebhook(e.target.value)} placeholder="https://..." />
                          </div>
                        </Field>
                      </div>
                    </div>

                    {/* System Prompt */}
                    <div className="rounded-2xl overflow-hidden bg-slate-50 dark:bg-white/[0.025] border border-slate-200 dark:border-white/5">
                      <div className="px-4 py-3 flex items-center gap-2 border-b border-slate-200 dark:border-white/5">
                        <FiCpu className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                        <p className="text-xs font-bold text-slate-900 dark:text-white">System Prompt</p>
                      </div>
                      <div className="px-4 py-4">
                        <textarea
                          className="w-full rounded-xl px-3 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/25 outline-none transition focus:ring-1 focus:ring-[#00b09b] resize-none h-36 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:bg-white dark:focus:bg-white/10"
                          value={systemPrompt}
                          onChange={e => setSystemPrompt(e.target.value)}
                          placeholder="Você é um assistente especializado em desenvolvimento de software da EasyDev. Responda sempre em português..."
                        />
                        <p className="text-[11px] mt-1 text-slate-500 dark:text-slate-400">Instrução base que define o comportamento do agente em cada conversa.</p>
                      </div>
                    </div>

                  </div>
                )}

                {/* API & Integrações */}
                {activeSection === 'api' && (
                  <div className="flex flex-col gap-5 w-full">
                    <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20">
                      <FiCpu className="w-4 h-4 shrink-0 text-indigo-600 dark:text-indigo-400" />
                      <p className="text-xs text-indigo-800 dark:text-indigo-200/70">
                        Configure a chave da API Groq e o modelo de linguagem para o agente de IA.
                      </p>
                    </div>
                    {provider === 'groq' && (
                      <>
                        <Field label="GROQ API Key" hint="Sua chave privada da plataforma Groq">
                          <div className="relative">
                            <input
                              type={showKey ? 'text' : 'password'}
                              className={`${FIELD_STYLE} pr-10`}
                              value={groqKey}
                              onChange={e => setGroqKey(e.target.value)}
                              placeholder="gsk_••••••••••••••••••••••"
                            />
                            <button
                              type="button"
                              onClick={() => setShowKey(v => !v)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                            >
                              {showKey ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                            </button>
                          </div>
                        </Field>
                        <Field label="Modelo Groq" hint="Ex: llama-3.3-70b-versatile, mixtral-8x7b-32768">
                          <input className={FIELD_STYLE} value={groqModel} onChange={e => setGroqModel(e.target.value)} placeholder="llama-3.3-70b-versatile" />
                        </Field>
                      </>
                    )}

                    {(provider === 'google' || provider === 'openai' || provider === 'anthropic') && (
                      <div className="rounded-xl border border-amber-200 dark:border-amber-500/20 bg-amber-50 dark:bg-amber-500/10 p-3 text-xs text-amber-800 dark:text-amber-200">
                        Configure a chave e o modelo do provedor selecionado acima. O envio para a API real será feito no backend quando esta opção estiver ativa.
                      </div>
                    )}

                    {provider === 'lmstudio' && (
                      <>
                        <Field label="API Key do LM Studio" hint="Opcional em ambiente local; geralmente use 'lm-studio'">
                          <input className={FIELD_STYLE} value={lmStudioApiKey} onChange={e => setLmStudioApiKey(e.target.value)} placeholder="lm-studio" />
                        </Field>
                        <Field label="URL do LM Studio" hint="Ex: http://127.0.0.1:1234/v1">
                          <input className={FIELD_STYLE} value={lmStudioUrl} onChange={e => setLmStudioUrl(e.target.value)} placeholder="http://127.0.0.1:1234/v1" />
                        </Field>
                        <Field label="Modelo local do LM Studio" hint="Nome do modelo carregado no LM Studio">
                          <input className={FIELD_STYLE} value={lmStudioModel} onChange={e => setLmStudioModel(e.target.value)} placeholder="local-model" />
                        </Field>
                      </>
                    )}
                    <div className="pt-1 border-t border-slate-200 dark:border-white/5" />
                    <Field label="Webhook URL" hint="URL para receber notificações de eventos do sistema">
                      <div className="relative">
                        <FiGlobe className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                        <input className={`${FIELD_STYLE} pl-8`} value={webhook} onChange={e => setWebhook(e.target.value)} placeholder="https://..." />
                      </div>
                    </Field>
                  </div>
                )}

                {/* Clientes */}
                {activeSection === 'clientes' && (
                  <UserManagement type="client" />
                )}

                {/* Equipe */}
                {activeSection === 'equipe' && (
                  <UserManagement type="team" />
                )}

                {/* Perfil */}
                {activeSection === 'perfil' && (
                  <div className="flex flex-col gap-5 w-full">
                    <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                      <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-extrabold text-white shrink-0 bg-gradient-to-br from-[var(--color-accent-600)] to-[var(--color-accent)] shadow-sm">
                        {profileName ? profileName[0].toUpperCase() : 'A'}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">{profileName || 'Admin'}</p>
                        <p className="text-xs mt-0.5 text-slate-500 dark:text-slate-400">Administrador do sistema</p>
                      </div>
                    </div>
                    <Field label="Nome de exibição">
                      <input className={FIELD_STYLE} value={profileName} onChange={e => setProfileName(e.target.value)} placeholder="Seu nome" />
                    </Field>
                    <Field label="E-mail">
                      <input type="email" className={FIELD_STYLE} value={profileEmail} onChange={e => setProfileEmail(e.target.value)} placeholder="seu@email.com" />
                    </Field>
                  </div>
                )}

                {/* Notificações */}
                {activeSection === 'notificacoes' && (
                  <div className="flex flex-col gap-3 w-full">
                    {[
                      { label: 'Notificações por e-mail', desc: 'Receba atualizações importantes no e-mail', state: notifEmail, set: setNotifEmail },
                      { label: 'Atualizações de projeto', desc: 'Alertas quando um projeto mudar de status', state: notifProject, set: setNotifProject },
                      { label: 'Alertas do sistema', desc: 'Notificações sobre erros e manutenção', state: notifSystem, set: setNotifSystem },
                    ].map(({ label, desc, state, set }) => (
                      <div key={label} className="flex items-center justify-between px-4 py-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                        <div>
                          <p className="text-sm font-semibold text-slate-900 dark:text-white">{label}</p>
                          <p className="text-xs mt-0.5 text-slate-500 dark:text-slate-400">{desc}</p>
                        </div>
                        <button
                          onClick={() => set(v => !v)}
                          className={`w-11 h-6 rounded-full transition-all shrink-0 relative ${state ? 'bg-gradient-to-r from-[var(--color-accent-600)] to-[var(--color-accent)]' : 'bg-slate-200 dark:bg-slate-700'}`}
                        >
                          <span
                            className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all shadow-sm ${state ? 'left-[22px]' : 'left-[2px]'}`}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Segurança */}
                {activeSection === 'seguranca' && (
                  <div className="flex flex-col gap-5 w-full">
                    <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20">
                      <FiShield className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
                      <p className="text-xs text-amber-800 dark:text-amber-200/70">Altere sua senha periodicamente para manter a conta segura.</p>
                    </div>
                    <Field label="Senha atual">
                      <input type="password" className={FIELD_STYLE} value={currentPass} onChange={e => setCurrentPass(e.target.value)} placeholder="••••••••" />
                    </Field>
                    <Field label="Nova senha">
                      <input type="password" className={FIELD_STYLE} value={newPass} onChange={e => setNewPass(e.target.value)} placeholder="••••••••" />
                    </Field>
                    <Field label="Confirmar nova senha">
                      <input type="password" className={FIELD_STYLE} value={confirmPass} onChange={e => setConfirmPass(e.target.value)} placeholder="••••••••" />
                    </Field>
                  </div>
                )}

              </div>

              {/* Panel footer */}
              <div className="px-6 py-4 flex items-center justify-between border-t border-slate-200 dark:border-white/5">
                {saved ? (
                  <div className="flex items-center gap-2 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                    <FiCheckCircle className="w-4 h-4" /> Salvo com sucesso!
                  </div>
                ) : <span />}
                <button
                  onClick={handleSave}
                  className="ml-auto flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition hover:opacity-90 bg-gradient-to-br from-[var(--color-accent-600)] to-[var(--color-accent)] shadow-md"
                >
                  <FiSave className="w-4 h-4" /> Salvar alterações
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
