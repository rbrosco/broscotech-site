"use client";
import React, { useEffect, useState } from "react";
import { FiSave, FiKey, FiGlobe, FiUser, FiBell, FiShield, FiCheckCircle, FiEye, FiEyeOff, FiCpu, FiSliders } from "react-icons/fi";
import DashboardNav from "@/component/DashboardNav";
import Sidebar from "@/component/Sidebar";

type Section = 'iaagent' | 'api' | 'perfil' | 'notificacoes' | 'seguranca';

const SECTIONS: { id: Section; label: string; icon: React.ReactNode; desc: string }[] = [
  { id: 'iaagent',       label: 'IA Agent',          icon: <FiCpu />,     desc: 'Modelo, chave Groq e comportamento do agente' },
  { id: 'api',           label: 'API & Integrações', icon: <FiKey />,     desc: 'Chaves de API e webhooks do sistema' },
  { id: 'perfil',        label: 'Perfil',            icon: <FiUser />,    desc: 'Informações da conta e preferências' },
  { id: 'notificacoes',  label: 'Notificações',      icon: <FiBell />,    desc: 'Configurar alertas e notificações' },
  { id: 'seguranca',     label: 'Segurança',         icon: <FiShield />,  desc: 'Senha, sessões e 2FA' },
];

const FIELD_STYLE = "w-full rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-white/25 outline-none transition focus:ring-1 focus:ring-[#00b09b]";
const FIELD_BG = { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' };

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.35)' }}>{label}</label>
      {children}
      {hint && <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.22)' }}>{hint}</p>}
    </div>
  );
}

export default function ConfiguracoesPage() {
  const [activeSection, setActiveSection] = useState<Section>('iaagent');
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [saved, setSaved] = useState(false);

  // IA Agent section
  const [groqKey, setGroqKey] = useState('');
  const [groqModel, setGroqModel] = useState('');
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
          setIsAdmin(me.role === 'admin');
          setProfileName(me.name ?? '');
          setProfileEmail(me.email ?? '');
        }
      } catch {}
      setCheckingAuth(false);
    })();
    // Load persisted IA settings
    try {
      setGroqKey(localStorage.getItem('GROQ_API_KEY') ?? '');
      setGroqModel(localStorage.getItem('GROQ_MODEL') ?? '');
      setWebhook(localStorage.getItem('WEBHOOK_URL') ?? '');
      setSystemPrompt(localStorage.getItem('IA_SYSTEM_PROMPT') ?? '');
    } catch {}
  }, []);

  const handleSave = () => {
    try {
      if (activeSection === 'iaagent') {
        localStorage.setItem('GROQ_API_KEY', groqKey);
        localStorage.setItem('GROQ_MODEL', groqModel);
        localStorage.setItem('WEBHOOK_URL', webhook);
        localStorage.setItem('IA_SYSTEM_PROMPT', systemPrompt);
      }
    } catch {}
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  if (checkingAuth) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0f1e' }}>
        <Sidebar />
        <div className="md:pl-64 flex items-center justify-center min-h-screen">
          <div className="w-6 h-6 rounded-full border-2 animate-spin" style={{ borderColor: '#00b09b', borderTopColor: 'transparent' }} />
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0f1e' }}>
        <Sidebar />
        <div className="md:pl-64 flex flex-col min-h-screen">
          <DashboardNav />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(239,68,68,0.1)' }}>
                <FiShield className="w-8 h-8 text-red-400" />
              </div>
              <h2 className="text-lg font-bold text-white">Acesso restrito</h2>
              <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>Área exclusiva para administradores.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentSectionMeta = SECTIONS.find(s => s.id === activeSection)!;

  return (
    <div style={{ minHeight: '100vh', background: '#0a0f1e' }}>
      <Sidebar />
      <div className="md:pl-64 flex flex-col min-h-screen">
        <DashboardNav />

        <main className="px-4 md:px-8 pt-[81px] pb-20">
          {/* Header */}
          <div
            className="relative overflow-hidden rounded-2xl mt-6 px-7 py-6"
            style={{ background: 'linear-gradient(130deg, rgba(0,74,173,0.18) 0%, rgba(0,176,155,0.12) 100%)', border: '1px solid rgba(0,176,155,0.2)' }}
          >
            <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full blur-3xl opacity-15 pointer-events-none" style={{ background: 'radial-gradient(circle,#004aad,transparent)' }} />
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Configurações</h1>
            <p className="mt-1 text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>Gerencie preferências, integrações e segurança do sistema.</p>
          </div>

          <div className="mt-5 flex flex-col md:flex-row gap-5">
            {/* ── Sidebar nav ── */}
            <nav
              className="md:w-60 shrink-0 rounded-2xl overflow-hidden p-2 flex flex-row md:flex-col gap-1 flex-wrap"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              {SECTIONS.map(s => (
                <button
                  key={s.id}
                  onClick={() => setActiveSection(s.id)}
                  className="group flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left transition-all w-full"
                  style={activeSection === s.id
                    ? { background: 'rgba(0,176,155,0.12)', borderLeft: '3px solid #00b09b' }
                    : { borderLeft: '3px solid transparent' }
                  }
                >
                  <span className="text-base shrink-0" style={{ color: activeSection === s.id ? '#00b09b' : 'rgba(255,255,255,0.3)' }}>
                    {s.icon}
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-bold" style={{ color: activeSection === s.id ? 'white' : 'rgba(255,255,255,0.5)' }}>{s.label}</p>
                  </div>
                </button>
              ))}
            </nav>

            {/* ── Content panel ── */}
            <div className="flex-1 rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              {/* Panel header */}
              <div className="px-6 py-5 flex items-center gap-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(0,176,155,0.12)' }}>
                  <span style={{ color: '#00b09b' }}>{currentSectionMeta.icon}</span>
                </div>
                <div>
                  <h2 className="text-sm font-extrabold text-white">{currentSectionMeta.label}</h2>
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>{currentSectionMeta.desc}</p>
                </div>
              </div>

              {/* Panel body */}
              <div className="px-6 py-6">

                {/* IA Agent */}
                {activeSection === 'iaagent' && (
                  <div className="flex flex-col gap-5 max-w-lg">

                    {/* Model */}
                    <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' }}>
                      <div className="px-4 py-3 flex items-center gap-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                        <FiSliders className="w-4 h-4" style={{ color: '#00b09b' }} />
                        <p className="text-xs font-bold text-white">Modelo de IA</p>
                      </div>
                      <div className="px-4 py-4 flex flex-col gap-3">
                        <Field label="Modelo Groq" hint="Ex: llama-3.3-70b-versatile, mixtral-8x7b-32768">
                          <input className={FIELD_STYLE} style={FIELD_BG} value={groqModel} onChange={e => setGroqModel(e.target.value)} placeholder="llama-3.3-70b-versatile" />
                        </Field>
                        <div className="flex flex-wrap gap-2">
                          {['llama-3.3-70b-versatile', 'mixtral-8x7b-32768', 'gemma2-9b-it'].map(m => (
                            <button key={m} onClick={() => setGroqModel(m)} className="px-2.5 py-1 rounded-lg text-[10px] font-semibold transition"
                              style={groqModel === m
                                ? { background: 'rgba(0,176,155,0.2)', color: '#00d4aa', border: '1px solid rgba(0,176,155,0.3)' }
                                : { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.08)' }
                              }>{m}</button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* API Key & Webhook */}
                    <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' }}>
                      <div className="px-4 py-3 flex items-center gap-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                        <FiKey className="w-4 h-4" style={{ color: '#818cf8' }} />
                        <p className="text-xs font-bold text-white">API & Integrações</p>
                      </div>
                      <div className="px-4 py-4 flex flex-col gap-4">
                        <Field label="GROQ API Key" hint="Sua chave privada da plataforma Groq">
                          <div className="relative">
                            <input
                              type={showKey ? 'text' : 'password'}
                              className={`${FIELD_STYLE} pr-10`}
                              style={FIELD_BG}
                              value={groqKey}
                              onChange={e => setGroqKey(e.target.value)}
                              placeholder="gsk_••••••••••••••••••••••"
                            />
                            <button type="button" onClick={() => setShowKey(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'rgba(255,255,255,0.3)' }}>
                              {showKey ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                            </button>
                          </div>
                        </Field>
                        <Field label="Webhook URL" hint="URL para receber notificações de eventos">
                          <div className="relative">
                            <FiGlobe className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: 'rgba(255,255,255,0.3)' }} />
                            <input className={`${FIELD_STYLE} pl-8`} style={FIELD_BG} value={webhook} onChange={e => setWebhook(e.target.value)} placeholder="https://..." />
                          </div>
                        </Field>
                      </div>
                    </div>

                    {/* System Prompt */}
                    <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' }}>
                      <div className="px-4 py-3 flex items-center gap-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                        <FiCpu className="w-4 h-4" style={{ color: '#fbbf24' }} />
                        <p className="text-xs font-bold text-white">System Prompt</p>
                      </div>
                      <div className="px-4 py-4">
                        <textarea
                          className="w-full rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-white/25 outline-none transition focus:ring-1 focus:ring-[#00b09b] resize-none h-36"
                          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                          value={systemPrompt}
                          onChange={e => setSystemPrompt(e.target.value)}
                          placeholder="Você é um assistente especializado em desenvolvimento de software da EasyDev. Responda sempre em português..."
                        />
                        <p className="text-[11px] mt-1" style={{ color: 'rgba(255,255,255,0.2)' }}>Instrução base que define o comportamento do agente em cada conversa.</p>
                      </div>
                    </div>

                  </div>
                )}

                {/* API & Integrações */}
                {activeSection === 'api' && (
                  <div className="flex flex-col gap-5 max-w-lg">
                    <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl" style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}>
                      <FiCpu className="w-4 h-4 shrink-0" style={{ color: '#818cf8' }} />
                      <p className="text-xs" style={{ color: 'rgba(255,255,255,0.55)' }}>
                        Configure a chave da API Groq e o modelo de linguagem para o agente de IA.
                      </p>
                    </div>
                    <Field label="GROQ API Key" hint="Sua chave privada da plataforma Groq">
                      <div className="relative">
                        <input
                          type={showKey ? 'text' : 'password'}
                          className={`${FIELD_STYLE} pr-10`}
                          style={FIELD_BG}
                          value={groqKey}
                          onChange={e => setGroqKey(e.target.value)}
                          placeholder="gsk_••••••••••••••••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowKey(v => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2"
                          style={{ color: 'rgba(255,255,255,0.3)' }}
                        >
                          {showKey ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                        </button>
                      </div>
                    </Field>
                    <Field label="Modelo Groq" hint="Ex: llama-3.3-70b-versatile, mixtral-8x7b-32768">
                      <input className={FIELD_STYLE} style={FIELD_BG} value={groqModel} onChange={e => setGroqModel(e.target.value)} placeholder="llama-3.3-70b-versatile" />
                    </Field>
                    <div className="pt-1" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }} />
                    <Field label="Webhook URL" hint="URL para receber notificações de eventos do sistema">
                      <div className="relative">
                        <FiGlobe className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: 'rgba(255,255,255,0.3)' }} />
                        <input className={`${FIELD_STYLE} pl-8`} style={FIELD_BG} value={webhook} onChange={e => setWebhook(e.target.value)} placeholder="https://..." />
                      </div>
                    </Field>
                  </div>
                )}

                {/* Perfil */}
                {activeSection === 'perfil' && (
                  <div className="flex flex-col gap-5 max-w-lg">
                    <div className="flex items-center gap-4 p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-extrabold text-white shrink-0" style={{ background: 'linear-gradient(135deg,#004aad,#00b09b)' }}>
                        {profileName ? profileName[0].toUpperCase() : 'A'}
                      </div>
                      <div>
                        <p className="font-bold text-white">{profileName || 'Admin'}</p>
                        <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>Administrador do sistema</p>
                      </div>
                    </div>
                    <Field label="Nome de exibição">
                      <input className={FIELD_STYLE} style={FIELD_BG} value={profileName} onChange={e => setProfileName(e.target.value)} placeholder="Seu nome" />
                    </Field>
                    <Field label="E-mail">
                      <input type="email" className={FIELD_STYLE} style={FIELD_BG} value={profileEmail} onChange={e => setProfileEmail(e.target.value)} placeholder="seu@email.com" />
                    </Field>
                  </div>
                )}

                {/* Notificações */}
                {activeSection === 'notificacoes' && (
                  <div className="flex flex-col gap-3 max-w-lg">
                    {[
                      { label: 'Notificações por e-mail', desc: 'Receba atualizações importantes no e-mail', state: notifEmail, set: setNotifEmail },
                      { label: 'Atualizações de projeto', desc: 'Alertas quando um projeto mudar de status', state: notifProject, set: setNotifProject },
                      { label: 'Alertas do sistema', desc: 'Notificações sobre erros e manutenção', state: notifSystem, set: setNotifSystem },
                    ].map(({ label, desc, state, set }) => (
                      <div key={label} className="flex items-center justify-between px-4 py-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                        <div>
                          <p className="text-sm font-semibold text-white">{label}</p>
                          <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>{desc}</p>
                        </div>
                        <button
                          onClick={() => set(v => !v)}
                          className="w-11 h-6 rounded-full transition-all shrink-0 relative"
                          style={{ background: state ? 'linear-gradient(135deg,#004aad,#00b09b)' : 'rgba(255,255,255,0.1)' }}
                        >
                          <span
                            className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all"
                            style={{ left: state ? '22px' : '2px', boxShadow: '0 1px 4px rgba(0,0,0,0.3)' }}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Segurança */}
                {activeSection === 'seguranca' && (
                  <div className="flex flex-col gap-5 max-w-lg">
                    <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl" style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}>
                      <FiShield className="w-4 h-4 shrink-0 text-amber-400" />
                      <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>Altere sua senha periodicamente para manter a conta segura.</p>
                    </div>
                    <Field label="Senha atual">
                      <input type="password" className={FIELD_STYLE} style={FIELD_BG} value={currentPass} onChange={e => setCurrentPass(e.target.value)} placeholder="••••••••" />
                    </Field>
                    <Field label="Nova senha">
                      <input type="password" className={FIELD_STYLE} style={FIELD_BG} value={newPass} onChange={e => setNewPass(e.target.value)} placeholder="••••••••" />
                    </Field>
                    <Field label="Confirmar nova senha">
                      <input type="password" className={FIELD_STYLE} style={FIELD_BG} value={confirmPass} onChange={e => setConfirmPass(e.target.value)} placeholder="••••••••" />
                    </Field>
                  </div>
                )}

              </div>

              {/* Panel footer */}
              <div className="px-6 py-4 flex items-center justify-between" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                {saved ? (
                  <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: '#00d4aa' }}>
                    <FiCheckCircle className="w-4 h-4" /> Salvo com sucesso!
                  </div>
                ) : <span />}
                <button
                  onClick={handleSave}
                  className="ml-auto flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition hover:opacity-90"
                  style={{ background: 'linear-gradient(135deg,#004aad,#00b09b)' }}
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
