"use client";
import React, { useEffect, useState } from "react";
import {
  FiSave,
  FiKey,
  FiGlobe,
  FiUser,
  FiBell,
  FiShield,
  FiCheckCircle,
  FiEye,
  FiEyeOff,
  FiCpu,
  FiSliders,
  FiUsers,
  FiBriefcase,
} from "react-icons/fi";
import DashboardNav from "@/component/DashboardNav";
import Sidebar from "@/component/Sidebar";
import UserManagement from "./UserManagement";

type Section = 'iaagent' | 'api' | 'perfil' | 'notificacoes' | 'seguranca' | 'clientes' | 'equipe';

const SECTIONS: { id: Section; label: string; icon: React.ReactNode; desc: string }[] = [
  { id: 'iaagent', label: 'IA Agent', icon: <FiCpu />, desc: 'Modelo, chave Groq e comportamento do agente' },
  { id: 'api', label: 'API & Integrações', icon: <FiKey />, desc: 'Chaves de API e webhooks do sistema' },
  { id: 'clientes', label: 'Clientes', icon: <FiUsers />, desc: 'Gerenciamento de contas de clientes' },
  { id: 'equipe', label: 'Equipe', icon: <FiBriefcase />, desc: 'Gerenciamento de membros da equipe' },
  { id: 'perfil', label: 'Perfil', icon: <FiUser />, desc: 'Informações da conta e preferências' },
  { id: 'notificacoes', label: 'Notificações', icon: <FiBell />, desc: 'Configurar alertas e notificações' },
  { id: 'seguranca', label: 'Segurança', icon: <FiShield />, desc: 'Senha, sessões e 2FA' },
];

const FIELD_STYLE =
  "w-full rounded-xl px-4 py-2.5 text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none transition bg-white dark:bg-[#071324] border border-slate-200 dark:border-white/15 focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent [&>option]:bg-white [&>option]:text-slate-900 dark:[&>option]:bg-[#071324] dark:[&>option]:text-white shadow-sm";

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">{label}</label>
      {children}
      {hint && <p className="text-[11px] text-slate-500 dark:text-slate-400">{hint}</p>}
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
          const me = (await res.json()) as { role?: string; name?: string; email?: string };
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
      setProvider(['google', 'openai', 'anthropic', 'groq', 'lmstudio'].includes(savedProvider) ? savedProvider : 'groq');
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
      <div className="min-h-screen bg-slate-50 dark:bg-[#040d1a] text-slate-900 dark:text-slate-200 flex items-center justify-center">
        <Sidebar />
        <div className="w-8 h-8 rounded-full border-[3px] animate-spin border-[var(--color-accent)] border-t-transparent shadow-lg" />
      </div>
    );
  }

  const VISIBLE_SECTIONS = SECTIONS.filter((s) => isAdmin || ['perfil', 'notificacoes', 'seguranca'].includes(s.id));
  const currentSectionMeta = SECTIONS.find((s) => s.id === activeSection)!;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#040d1a] text-slate-900 dark:text-slate-200 selection:bg-cyan-500/30">
      <Sidebar />
      <div className="md:pl-sidebar transition-[padding] duration-300 flex flex-col min-h-screen">
        <DashboardNav />

        <main className="flex-1 px-4 md:px-8 pt-[70px] pb-12">
          {/* Header */}
          <div className="relative overflow-hidden rounded-[2rem] mt-4 px-7 sm:px-9 py-8 bg-white/90 dark:bg-[#071324]/90 border border-black/10 dark:border-white/10 shadow-2xl backdrop-blur-2xl group">
            <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-cyan-500/20 blur-[90px] pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-indigo-500/20 blur-[90px] pointer-events-none" />

            <div className="flex items-center gap-4 relative z-10">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md"
                style={{ background: 'linear-gradient(135deg, #004aad, #00b09b)' }}
              >
                <FiSliders className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-pixel text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-500 dark:bg-cyan-400/20 dark:text-cyan-300 border border-cyan-500/30 uppercase">
                    EASYDEV CRM
                  </span>
                  <span className="text-xs font-semibold text-slate-400">•</span>
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Preferências do Sistema
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  Configurações
                </h1>
                <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  Gerencie modelos de IA, integrações de APIs, perfis e segurança da plataforma.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col md:flex-row gap-6">
            {/* Sidebar Nav */}
            <nav className="md:w-64 shrink-0 rounded-[2rem] p-3 flex flex-row md:flex-col gap-1.5 flex-wrap bg-white/80 dark:bg-[#071324]/85 border border-slate-200 dark:border-white/10 shadow-sm backdrop-blur-xl h-fit">
              {VISIBLE_SECTIONS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setActiveSection(s.id)}
                  className={`group flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all w-full border-l-2 ${
                    activeSection === s.id
                      ? 'bg-[var(--color-accent-dim)] text-[var(--color-accent)] border-[var(--color-accent)] font-bold shadow-sm'
                      : 'border-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <span
                    className={`text-base shrink-0 transition-transform group-hover:scale-110 ${
                      activeSection === s.id ? 'text-[var(--color-accent)]' : 'text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    {s.icon}
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-bold truncate">{s.label}</p>
                  </div>
                </button>
              ))}
            </nav>

            {/* Content Panel */}
            <div className="flex-1 rounded-[2rem] overflow-hidden bg-white/80 dark:bg-[#071324]/85 border border-slate-200 dark:border-white/10 shadow-xl backdrop-blur-2xl">
              {/* Panel Header */}
              <div className="px-7 py-5 flex items-center gap-3.5 border-b border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02]">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-[var(--color-accent-dim)] border border-[var(--color-accent)]/30 text-[var(--color-accent)] shadow-sm">
                  {currentSectionMeta.icon}
                </div>
                <div>
                  <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
                    {currentSectionMeta.label}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{currentSectionMeta.desc}</p>
                </div>
              </div>

              {/* Panel Body */}
              <div className="p-7">
                {/* IA Agent */}
                {activeSection === 'iaagent' && (
                  <div className="flex flex-col gap-6 w-full">
                    {/* Model */}
                    <div className="rounded-2xl p-6 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-200 dark:border-white/10">
                        <FiSliders className="w-4 h-4 text-[var(--color-accent)]" />
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                          Modelo & Provedor de Inteligência Artificial
                        </p>
                      </div>

                      <div className="flex flex-col gap-4">
                        <Field label="Provedor de IA">
                          <select
                            className={FIELD_STYLE}
                            value={provider}
                            onChange={(e) => setProvider(e.target.value as ProviderType)}
                          >
                            <option value="groq">Groq (Recomendado - Ultrarrápido)</option>
                            <option value="openai">OpenAI (ChatGPT / GPT-4o)</option>
                            <option value="anthropic">Anthropic (Claude 3.5)</option>
                            <option value="google">Google (Gemini 1.5/2.0)</option>
                            <option value="lmstudio">LM Studio (Local Host)</option>
                          </select>
                        </Field>

                        {provider === 'groq' && (
                          <>
                            <Field label="Modelo Groq" hint="Ex: llama-3.3-70b-versatile, mixtral-8x7b-32768">
                              <input
                                className={FIELD_STYLE}
                                value={groqModel}
                                onChange={(e) => setGroqModel(e.target.value)}
                                placeholder="llama-3.3-70b-versatile"
                              />
                            </Field>
                            <div className="flex flex-wrap gap-2 pt-1">
                              {['llama-3.3-70b-versatile', 'mixtral-8x7b-32768', 'gemma2-9b-it'].map((m) => (
                                <button
                                  key={m}
                                  type="button"
                                  onClick={() => setGroqModel(m)}
                                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition border ${
                                    groqModel === m
                                      ? 'bg-[var(--color-accent-dim)] text-[var(--color-accent)] border-[var(--color-accent)]/50'
                                      : 'bg-white dark:bg-white/5 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10'
                                  }`}
                                >
                                  {m}
                                </button>
                              ))}
                            </div>
                          </>
                        )}

                        {provider === 'openai' && (
                          <>
                            <Field label="OpenAI API Key" hint="Sua chave privada da OpenAI (sk-...)">
                              <input
                                className={FIELD_STYLE}
                                value={openAiKey}
                                onChange={(e) => setOpenAiKey(e.target.value)}
                                placeholder="sk-proj-••••••••••••••••"
                              />
                            </Field>
                            <Field label="Modelo OpenAI" hint="Ex: gpt-4o-mini, gpt-4o">
                              <input
                                className={FIELD_STYLE}
                                value={openAiModel}
                                onChange={(e) => setOpenAiModel(e.target.value)}
                                placeholder="gpt-4o-mini"
                              />
                            </Field>
                          </>
                        )}

                        {provider === 'anthropic' && (
                          <>
                            <Field label="Anthropic API Key" hint="Sua chave da Anthropic (sk-ant-...)">
                              <input
                                className={FIELD_STYLE}
                                value={anthropicKey}
                                onChange={(e) => setAnthropicKey(e.target.value)}
                                placeholder="sk-ant-••••••••••••••••"
                              />
                            </Field>
                            <Field label="Modelo Anthropic" hint="Ex: claude-3-5-sonnet-20241022">
                              <input
                                className={FIELD_STYLE}
                                value={anthropicModel}
                                onChange={(e) => setAnthropicModel(e.target.value)}
                                placeholder="claude-3-5-sonnet-20241022"
                              />
                            </Field>
                          </>
                        )}

                        {provider === 'google' && (
                          <>
                            <Field label="API Key do Google AI" hint="Sua chave da Google Gemini API">
                              <input
                                className={FIELD_STYLE}
                                value={googleKey}
                                onChange={(e) => setGoogleKey(e.target.value)}
                                placeholder="AIza••••••••••••••••"
                              />
                            </Field>
                            <Field label="Modelo do Google" hint="Ex: gemini-1.5-flash, gemini-2.0-flash">
                              <input
                                className={FIELD_STYLE}
                                value={googleModel}
                                onChange={(e) => setGoogleModel(e.target.value)}
                                placeholder="gemini-1.5-flash"
                              />
                            </Field>
                          </>
                        )}

                        {provider === 'lmstudio' && (
                          <>
                            <Field label="API Key do LM Studio" hint="Opcional em ambiente local; geralmente 'lm-studio'">
                              <input
                                className={FIELD_STYLE}
                                value={lmStudioApiKey}
                                onChange={(e) => setLmStudioApiKey(e.target.value)}
                                placeholder="lm-studio"
                              />
                            </Field>
                            <Field label="URL do LM Studio" hint="Ex: http://127.0.0.1:1234/v1">
                              <input
                                className={FIELD_STYLE}
                                value={lmStudioUrl}
                                onChange={(e) => setLmStudioUrl(e.target.value)}
                                placeholder="http://127.0.0.1:1234/v1"
                              />
                            </Field>
                            <Field label="Modelo local do LM Studio" hint="Nome do modelo carregado">
                              <input
                                className={FIELD_STYLE}
                                value={lmStudioModel}
                                onChange={(e) => setLmStudioModel(e.target.value)}
                                placeholder="local-model"
                              />
                            </Field>
                          </>
                        )}
                      </div>
                    </div>

                    {/* API Key & Webhook */}
                    <div className="rounded-2xl p-6 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-200 dark:border-white/10">
                        <FiKey className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                          Chaves & Integrações
                        </p>
                      </div>

                      <div className="flex flex-col gap-4">
                        <Field label="GROQ API Key" hint="Sua chave privada da plataforma Groq">
                          <div className="relative">
                            <input
                              type={showKey ? 'text' : 'password'}
                              className={`${FIELD_STYLE} pr-11`}
                              value={groqKey}
                              onChange={(e) => setGroqKey(e.target.value)}
                              placeholder="gsk_••••••••••••••••••••••"
                            />
                            <button
                              type="button"
                              onClick={() => setShowKey((v) => !v)}
                              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                            >
                              {showKey ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                            </button>
                          </div>
                        </Field>

                        <Field label="Webhook URL" hint="URL para receber notificações e eventos do sistema">
                          <div className="relative">
                            <FiGlobe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                              className={`${FIELD_STYLE} pl-10`}
                              value={webhook}
                              onChange={(e) => setWebhook(e.target.value)}
                              placeholder="https://sua-empresa.com/api/webhook"
                            />
                          </div>
                        </Field>
                      </div>
                    </div>

                    {/* System Prompt */}
                    <div className="rounded-2xl p-6 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-200 dark:border-white/10">
                        <FiCpu className="w-4 h-4 text-amber-500" />
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                          System Prompt (Comportamento do Agente)
                        </p>
                      </div>
                      <div>
                        <textarea
                          className="w-full rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 outline-none transition focus:ring-2 focus:ring-[var(--color-accent)] resize-none h-36 bg-white dark:bg-[#071324] border border-slate-200 dark:border-white/15"
                          value={systemPrompt}
                          onChange={(e) => setSystemPrompt(e.target.value)}
                          placeholder="Você é um assistente especializado em desenvolvimento de software da EasyDev..."
                        />
                        <p className="text-[11px] mt-1.5 text-slate-500 dark:text-slate-400">
                          Instrução base que define o tom de voz e as diretrizes do Agente IA.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* API & Integrações */}
                {activeSection === 'api' && (
                  <div className="flex flex-col gap-5 w-full">
                    <Field label="GROQ API Key" hint="Sua chave privada da plataforma Groq">
                      <div className="relative">
                        <input
                          type={showKey ? 'text' : 'password'}
                          className={`${FIELD_STYLE} pr-11`}
                          value={groqKey}
                          onChange={(e) => setGroqKey(e.target.value)}
                          placeholder="gsk_••••••••••••••••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowKey((v) => !v)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                        >
                          {showKey ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                        </button>
                      </div>
                    </Field>

                    <Field label="Modelo Groq Padrão" hint="Ex: llama-3.3-70b-versatile">
                      <input
                        className={FIELD_STYLE}
                        value={groqModel}
                        onChange={(e) => setGroqModel(e.target.value)}
                        placeholder="llama-3.3-70b-versatile"
                      />
                    </Field>

                    <Field label="Webhook de Notificações" hint="Endpoint externo para webhooks">
                      <div className="relative">
                        <FiGlobe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          className={`${FIELD_STYLE} pl-10`}
                          value={webhook}
                          onChange={(e) => setWebhook(e.target.value)}
                          placeholder="https://..."
                        />
                      </div>
                    </Field>
                  </div>
                )}

                {/* Clientes */}
                {activeSection === 'clientes' && <UserManagement type="client" />}

                {/* Equipe */}
                {activeSection === 'equipe' && <UserManagement type="team" />}

                {/* Perfil */}
                {activeSection === 'perfil' && (
                  <div className="flex flex-col gap-5 w-full">
                    <div className="flex items-center gap-4 p-5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                      <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black text-white shrink-0 shadow-md"
                        style={{ background: 'linear-gradient(135deg, #004aad, #00b09b)' }}
                      >
                        {profileName ? profileName[0].toUpperCase() : 'A'}
                      </div>
                      <div>
                        <p className="font-bold text-base text-slate-900 dark:text-white">{profileName || 'Usuário'}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {isAdmin ? 'Administrador do Sistema' : 'Conta de Cliente'}
                        </p>
                      </div>
                    </div>

                    <Field label="Nome de Exibição">
                      <input
                        className={FIELD_STYLE}
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                        placeholder="Seu nome"
                      />
                    </Field>
                    <Field label="E-mail">
                      <input
                        type="email"
                        className={FIELD_STYLE}
                        value={profileEmail}
                        onChange={(e) => setProfileEmail(e.target.value)}
                        placeholder="seu@email.com"
                      />
                    </Field>
                  </div>
                )}

                {/* Notificações */}
                {activeSection === 'notificacoes' && (
                  <div className="flex flex-col gap-3.5 w-full">
                    {[
                      {
                        label: 'Notificações por E-mail',
                        desc: 'Receba alertas importantes sobre mudanças de projeto',
                        state: notifEmail,
                        set: setNotifEmail,
                      },
                      {
                        label: 'Atualizações no Kanban',
                        desc: 'Notificações quando cards forem movidos ou concluídos',
                        state: notifProject,
                        set: setNotifProject,
                      },
                      {
                        label: 'Alertas do Sistema',
                        desc: 'Status de servidores, backups e novas versões',
                        state: notifSystem,
                        set: setNotifSystem,
                      },
                    ].map(({ label, desc, state, set }) => (
                      <div
                        key={label}
                        className="flex items-center justify-between p-5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10"
                      >
                        <div>
                          <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">{label}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{desc}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => set((v) => !v)}
                          className={`w-12 h-6 rounded-full transition-all shrink-0 relative ${
                            state
                              ? 'bg-gradient-to-r from-[#004aad] to-[#00b09b]'
                              : 'bg-slate-300 dark:bg-slate-700'
                          }`}
                        >
                          <span
                            className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all shadow-sm ${
                              state ? 'left-[26px]' : 'left-[2px]'
                            }`}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Segurança */}
                {activeSection === 'seguranca' && (
                  <div className="flex flex-col gap-5 w-full">
                    <div className="flex items-center gap-2.5 p-4 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20">
                      <FiShield className="w-5 h-5 shrink-0 text-amber-600 dark:text-amber-400" />
                      <p className="text-xs text-amber-800 dark:text-amber-200/80">
                        Altere sua senha de acesso periodicamente para manter a conta protegida.
                      </p>
                    </div>
                    <Field label="Senha Atual">
                      <input
                        type="password"
                        className={FIELD_STYLE}
                        value={currentPass}
                        onChange={(e) => setCurrentPass(e.target.value)}
                        placeholder="••••••••"
                      />
                    </Field>
                    <Field label="Nova Senha">
                      <input
                        type="password"
                        className={FIELD_STYLE}
                        value={newPass}
                        onChange={(e) => setNewPass(e.target.value)}
                        placeholder="••••••••"
                      />
                    </Field>
                    <Field label="Confirmar Nova Senha">
                      <input
                        type="password"
                        className={FIELD_STYLE}
                        value={confirmPass}
                        onChange={(e) => setConfirmPass(e.target.value)}
                        placeholder="••••••••"
                      />
                    </Field>
                  </div>
                )}
              </div>

              {/* Panel Footer */}
              <div className="px-7 py-4 flex items-center justify-between border-t border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02]">
                {saved ? (
                  <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400">
                    <FiCheckCircle className="w-4 h-4" /> Alterações salvas com sucesso!
                  </div>
                ) : (
                  <span />
                )}
                <button
                  type="button"
                  onClick={handleSave}
                  className="ml-auto flex items-center gap-2 px-6 py-3 rounded-xl text-xs sm:text-sm font-bold text-white transition hover:scale-[1.01] hover:opacity-95 shadow-md"
                  style={{ background: 'linear-gradient(135deg, #004aad, #00b09b)' }}
                >
                  <FiSave className="w-4 h-4" /> Salvar Alterações
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
