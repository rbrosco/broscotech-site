"use client";
import React, { useEffect, useState } from "react";
import {
  FiSave,
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
  FiPlay,
  FiZap,
  FiActivity,
  FiLayers,
  FiRefreshCw,
  FiAlertCircle,
} from "react-icons/fi";
import DashboardNav from "@/component/DashboardNav";
import Sidebar from "@/component/Sidebar";
import UserManagement from "./UserManagement";
import WhatsAppSettings from "./WhatsAppSettings";

type Section = 'iaagent' | 'clientes' | 'equipe' | 'perfil' | 'notificacoes' | 'seguranca' | 'whatsapp';

const SECTIONS: { id: Section; label: string; icon: React.ReactNode; desc: string }[] = [
  { id: 'iaagent', label: 'IA & LLM Gateway', icon: <FiCpu />, desc: 'Modelos, URLs customizadas, tokens e prompts' },
  { id: 'whatsapp', label: 'WhatsApp', icon: <FiZap />, desc: 'Conecte o WhatsApp via QR code e envie atualizações' },
  { id: 'clientes', label: 'Clientes', icon: <FiUsers />, desc: 'Gerenciamento de contas de clientes' },
  { id: 'equipe', label: 'Equipe', icon: <FiBriefcase />, desc: 'Gerenciamento de membros da equipe' },
  { id: 'perfil', label: 'Perfil', icon: <FiUser />, desc: 'Informações da conta e preferências' },
  { id: 'notificacoes', label: 'Notificações', icon: <FiBell />, desc: 'Configurar alertas e notificações' },
  { id: 'seguranca', label: 'Segurança', icon: <FiShield />, desc: 'Senha, sessões e 2FA' },
];

type ProviderType = 'groq' | 'deepseek' | 'openai' | 'anthropic' | 'google' | 'openrouter' | 'ollama' | 'lmstudio' | 'custom';

const PROVIDER_CONFIGS: Record<
  ProviderType,
  {
    name: string;
    badge: string;
    defaultUrl: string;
    defaultModel: string;
    placeholderKey: string;
    models: string[];
    description: string;
  }
> = {
  groq: {
    name: 'Groq Cloud',
    badge: '⚡ Ultrarrápido',
    defaultUrl: 'https://api.groq.com/openai/v1',
    defaultModel: 'llama-3.3-70b-versatile',
    placeholderKey: 'gsk_••••••••••••••••••••••••',
    models: ['llama-3.3-70b-versatile', 'mixtral-8x7b-32768', 'gemma2-9b-it', 'llama-3.2-11b-vision-preview'],
    description: 'Inferência de altíssima velocidade em hardware LPU dedicado.',
  },
  deepseek: {
    name: 'DeepSeek API',
    badge: '🐳 Raciocínio & Código',
    defaultUrl: 'https://api.deepseek.com/v1',
    defaultModel: 'deepseek-chat',
    placeholderKey: 'sk-••••••••••••••••••••••••',
    models: ['deepseek-chat', 'deepseek-reasoner'],
    description: 'Modelos de alta capacidade analítica (DeepSeek V3 e DeepSeek R1).',
  },
  openai: {
    name: 'OpenAI',
    badge: '🟢 GPT-4o / o3-mini',
    defaultUrl: 'https://api.openai.com/v1',
    defaultModel: 'gpt-4o-mini',
    placeholderKey: 'sk-proj-••••••••••••••••••••',
    models: ['gpt-4o-mini', 'gpt-4o', 'o1-mini', 'o3-mini'],
    description: 'Modelos emblemáticos da OpenAI com suporte a ferramentas e visão.',
  },
  anthropic: {
    name: 'Anthropic Claude',
    badge: '🟣 Claude 3.5 Sonnet',
    defaultUrl: 'https://api.anthropic.com/v1',
    defaultModel: 'claude-3-5-sonnet-20241022',
    placeholderKey: 'sk-ant-••••••••••••••••••••',
    models: ['claude-3-5-sonnet-20241022', 'claude-3-5-haiku-20241022', 'claude-3-opus-20240229'],
    description: 'Excelente para raciocínio complexo, síntese e geração de código refinado.',
  },
  google: {
    name: 'Google Gemini',
    badge: '🔵 Gemini 2.0 Flash',
    defaultUrl: 'https://generativelanguage.googleapis.com',
    defaultModel: 'gemini-2.0-flash',
    placeholderKey: 'AIza••••••••••••••••••••••••',
    models: ['gemini-2.0-flash', 'gemini-1.5-pro', 'gemini-1.5-flash'],
    description: 'Janela de contexto ultra ampla e velocidade através da API Gemini.',
  },
  openrouter: {
    name: 'OpenRouter',
    badge: '🌐 Multi-Model Gateway',
    defaultUrl: 'https://openrouter.ai/api/v1',
    defaultModel: 'meta-llama/llama-3.3-70b-instruct',
    placeholderKey: 'sk-or-v1-•••••••••••••••••••',
    models: [
      'meta-llama/llama-3.3-70b-instruct',
      'deepseek/deepseek-r1',
      'anthropic/claude-3.5-sonnet',
      'qwen/qwen-2.5-coder-32b-instruct',
    ],
    description: 'Acesso unificado a centenas de modelos abertos e proprietários via uma única chave.',
  },
  ollama: {
    name: 'Ollama (Local / VPS)',
    badge: '🦙 Auto-Hospedado',
    defaultUrl: 'http://127.0.0.1:11434/v1',
    defaultModel: 'llama3.3',
    placeholderKey: 'ollama (opcional)',
    models: ['llama3.3', 'qwen2.5-coder:32b', 'mistral', 'deepseek-r1:14b', 'phi4'],
    description: 'Rode modelos em seu próprio servidor ou máquina local sem custos por token.',
  },
  lmstudio: {
    name: 'LM Studio Desktop',
    badge: '💻 Local Host',
    defaultUrl: 'http://127.0.0.1:1234/v1',
    defaultModel: 'local-model',
    placeholderKey: 'lm-studio (opcional)',
    models: ['local-model'],
    description: 'Interface de execução local com servidor compatível com OpenAI.',
  },
  custom: {
    name: 'Endpoint Customizado (OpenAI Compatible)',
    badge: '⚙️ URL Personalizada',
    defaultUrl: 'https://api.openai.com/v1',
    defaultModel: 'gpt-4o-mini',
    placeholderKey: 'Sua chave de API ou Token',
    models: ['custom-model-1', 'deepseek-v3', 'llama-3.3-70b'],
    description: 'Conecte qualquer servidor vLLM, FastChat, TGI, LiteLLM ou proxy corporativo.',
  },
};

const PROMPT_PRESETS = [
  {
    title: '💼 Consultor Comercial & Vendas',
    desc: 'Focado em entender o briefing do cliente, apresentar soluções da EasyDev e qualificar leads.',
    prompt:
      'Você é o Especialista Comercial e Arquiteto de Negócios da EasyDev (easydev.com.br). Seu objetivo é entender as necessidades do cliente, explicar nossas soluções (Web Apps, SaaS, APIs, Automações com n8n, IA) com clareza e autoridade, e conduzir o contato para um fechamento ou proposta técnica sob medida. Responda em português com tom profissional, empático e focado em valor.',
  },
  {
    title: '🛠️ Tech Lead & Arquiteto Full Stack',
    desc: 'Profundidade técnica em Next.js 15, PostgreSQL, TypeORM, integrações n8n e cloud.',
    prompt:
      'Você é o Tech Lead Principal da EasyDev. Você domina arquitetura de software moderna: Next.js 15, React 19, TypeScript, PostgreSQL, TypeORM, Docker, automações com n8n e orquestração de IA. Suas respostas devem ser precisas, fornecendo recomendações de melhores práticas, segurança, escalabilidade e arquitetura limpa.',
  },
  {
    title: '🎯 Suporte Técnico & Acompanhamento',
    desc: 'Atendimento prestativo para clientes acompanhando projetos no CRM.',
    prompt:
      'Você é o Agente de Suporte e Acompanhamento de Projetos da EasyDev. Você ajuda clientes a entenderem o andamento de seus projetos, status de entregas no Kanban, faturas e detalhes operacionais com agilidade e clareza absoluta.',
  },
  {
    title: '⚡ Assistente Geral EasyDev CRM',
    desc: 'Equilíbrio entre atendimento comercial, suporte e explicações técnicas.',
    prompt:
      'Você é o Agente de Inteligência Artificial oficial da EasyDev (easydev.com.br). Você é prestativo, técnico, objetivo e amigável. Seu papel é explicar os serviços da EasyDev (Next.js, React, Node.js, PostgreSQL, Automações n8n, IA), coletar briefings de projetos e ajudar clientes e visitantes a estruturarem suas ideias em soluções digitais de alto impacto.',
  },
];

const FIELD_STYLE =
  "w-full rounded-xl px-4 py-3 text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none transition bg-white dark:bg-[#071324] border border-slate-200 dark:border-white/15 focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent [&>option]:bg-white [&>option]:text-slate-900 dark:[&>option]:bg-[#071324] dark:[&>option]:text-white shadow-sm";

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

  // IA Gateway States
  const [provider, setProvider] = useState<ProviderType>('groq');
  const [customBaseUrl, setCustomBaseUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('');
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(2048);
  const [topP, setTopP] = useState(1.0);
  const [systemPrompt, setSystemPrompt] = useState(PROMPT_PRESETS[3].prompt);
  const [showKey, setShowKey] = useState(false);

  // Webhook integration
  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhookSecret, setWebhookSecret] = useState('');

  // Dynamic models fetch states
  const [fetchedModels, setFetchedModels] = useState<string[]>([]);
  const [fetchingModels, setFetchingModels] = useState(false);
  const [fetchModelsStatus, setFetchModelsStatus] = useState<{ ok: boolean; message: string } | null>(null);

  // Live Test states
  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string; latencyMs?: number } | null>(null);

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
          if (!isAdminUser && activeSection === 'iaagent') {
            setActiveSection('perfil');
          }
          setProfileName(me.name ?? '');
          setProfileEmail(me.email ?? '');
        }
      } catch {}
      setCheckingAuth(false);
    })();

    // Load persisted settings
    try {
      const savedProvider = (localStorage.getItem('IA_PROVIDER') as ProviderType) || 'groq';
      const p = PROVIDER_CONFIGS[savedProvider] ? savedProvider : 'groq';
      setProvider(p);

      const savedUrl = localStorage.getItem('IA_CUSTOM_BASE_URL') || PROVIDER_CONFIGS[p].defaultUrl;
      setCustomBaseUrl(savedUrl);

      const savedApiKey =
        localStorage.getItem('IA_API_KEY') ||
        localStorage.getItem(`${p.toUpperCase()}_API_KEY`) ||
        '';
      setApiKey(savedApiKey);

      const savedModel =
        localStorage.getItem('IA_MODEL') ||
        localStorage.getItem(`${p.toUpperCase()}_MODEL`) ||
        PROVIDER_CONFIGS[p].defaultModel;
      setModel(savedModel);

      const savedTemp = parseFloat(localStorage.getItem('IA_TEMPERATURE') || '0.7');
      setTemperature(isNaN(savedTemp) ? 0.7 : savedTemp);

      const savedTokens = parseInt(localStorage.getItem('IA_MAX_TOKENS') || '2048', 10);
      setMaxTokens(isNaN(savedTokens) ? 2048 : savedTokens);

      const savedTopP = parseFloat(localStorage.getItem('IA_TOP_P') || '1.0');
      setTopP(isNaN(savedTopP) ? 1.0 : savedTopP);

      const savedPrompt = localStorage.getItem('IA_SYSTEM_PROMPT') || PROMPT_PRESETS[3].prompt;
      setSystemPrompt(savedPrompt);

      setWebhookUrl(localStorage.getItem('WEBHOOK_URL') || '');
      setWebhookSecret(localStorage.getItem('WEBHOOK_SECRET') || '');
    } catch {}
  }, []);

  const handleProviderChange = (newP: ProviderType) => {
    setProvider(newP);
    const cfg = PROVIDER_CONFIGS[newP];
    setCustomBaseUrl(cfg.defaultUrl);
    setModel(cfg.defaultModel);
    setFetchedModels([]);
    setFetchModelsStatus(null);

    // Recupera chave específica desse provedor se existir
    const existingKey = localStorage.getItem(`${newP.toUpperCase()}_API_KEY`) || '';
    setApiKey(existingKey);
    setTestResult(null);
  };

  const handleFetchModels = async () => {
    setFetchingModels(true);
    setFetchModelsStatus(null);

    try {
      const res = await fetch('/api/iaagent/models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          customBaseUrl: customBaseUrl.trim() || undefined,
          apiKey: apiKey.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (res.ok && data.ok && Array.isArray(data.models) && data.models.length > 0) {
        setFetchedModels(data.models);
        setFetchModelsStatus({
          ok: true,
          message: `${data.models.length} modelos encontrados e carregados com sucesso!`,
        });
        if (!model || !data.models.includes(model)) {
          setModel(data.models[0]);
        }
      } else {
        setFetchModelsStatus({
          ok: false,
          message: data.message || 'Nenhum modelo foi retornado por este endpoint.',
        });
      }
    } catch (e: any) {
      setFetchModelsStatus({
        ok: false,
        message: e?.message || 'Erro ao consultar a lista de modelos do servidor.',
      });
    } finally {
      setFetchingModels(false);
    }
  };

  const handleSave = () => {
    try {
      localStorage.setItem('IA_PROVIDER', provider);
      localStorage.setItem('IA_CUSTOM_BASE_URL', customBaseUrl);
      localStorage.setItem('IA_API_KEY', apiKey);
      localStorage.setItem(`${provider.toUpperCase()}_API_KEY`, apiKey);
      localStorage.setItem('IA_MODEL', model);
      localStorage.setItem(`${provider.toUpperCase()}_MODEL`, model);
      localStorage.setItem('IA_TEMPERATURE', String(temperature));
      localStorage.setItem('IA_MAX_TOKENS', String(maxTokens));
      localStorage.setItem('IA_TOP_P', String(topP));
      localStorage.setItem('IA_SYSTEM_PROMPT', systemPrompt);
      localStorage.setItem('WEBHOOK_URL', webhookUrl);
      localStorage.setItem('WEBHOOK_SECRET', webhookSecret);
    } catch {}
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleTestConnection = async () => {
    setTestingConnection(true);
    setTestResult(null);

    try {
      const res = await fetch('/api/iaagent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          customBaseUrl: customBaseUrl.trim() || undefined,
          apiKey: apiKey.trim() || undefined,
          model: model.trim() || undefined,
          temperature: 0.1,
          maxTokens: 50,
          testConnection: true,
        }),
      });

      const data = await res.json();

      if (res.ok && data.ok) {
        setTestResult({
          ok: true,
          message: `Conexão bem-sucedida! Resposta do modelo: "${data.reply?.slice(0, 80)}"`,
          latencyMs: data.latencyMs,
        });
      } else {
        setTestResult({
          ok: false,
          message: data.reply || 'Falha ao conectar com o endpoint de IA.',
          latencyMs: data.latencyMs,
        });
      }
    } catch (e: any) {
      setTestResult({
        ok: false,
        message: e?.message || 'Erro de rede ou URL inalcançável.',
      });
    } finally {
      setTestingConnection(false);
    }
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
  const currentProviderConfig = PROVIDER_CONFIGS[provider] || PROVIDER_CONFIGS.groq;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#040d1a] text-slate-900 dark:text-slate-200 selection:bg-cyan-500/30">
      <Sidebar />
      <div className="md:pl-sidebar transition-[padding] duration-300 flex flex-col min-h-screen">
        <DashboardNav />

        <main className="flex-1 px-4 md:px-8 pt-[70px] pb-12">
          {/* Header Banner */}
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
                    Painel de Inteligência & Configurações
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  Configurações do Sistema
                </h1>
                <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  Gerencie o Gateway de Inteligência Artificial, endpoints customizados, prompts e segurança.
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

            {/* Main Content Panel */}
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
                {/* ─── IA & LLM GATEWAY SECTION (UNIFIED) ─── */}
                {activeSection === 'iaagent' && (
                  <div className="flex flex-col gap-6 w-full">
                    {/* Bloco 1: Provedor, Endpoint e Chave */}
                    <div className="rounded-2xl p-6 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200 dark:border-white/10">
                        <div className="flex items-center gap-2">
                          <FiCpu className="w-5 h-5 text-[var(--color-accent)]" />
                          <p className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                            Provedor & Conexão Principal
                          </p>
                        </div>
                        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                          {currentProviderConfig.badge}
                        </span>
                      </div>

                      <div className="flex flex-col gap-4">
                        {/* Seletor de Provedores */}
                        <Field
                          label="Provedor de Inteligência Artificial"
                          hint={currentProviderConfig.description}
                        >
                          <select
                            className={FIELD_STYLE}
                            value={provider}
                            onChange={(e) => handleProviderChange(e.target.value as ProviderType)}
                          >
                            <option value="groq">⚡ Groq Cloud (Ultra Rápido - LPU)</option>
                            <option value="deepseek">🐳 DeepSeek (DeepSeek-V3 / DeepSeek-R1)</option>
                            <option value="openai">🟢 OpenAI (ChatGPT / GPT-4o / o3-mini)</option>
                            <option value="anthropic">🟣 Anthropic Claude (Claude 3.5 Sonnet / Haiku)</option>
                            <option value="google">🔵 Google Gemini (Gemini 2.0 Flash / 1.5 Pro)</option>
                            <option value="openrouter">🌐 OpenRouter (Multi-Model Gateway Unificado)</option>
                            <option value="ollama">🦙 Ollama (Servidor Local / VPS Auto-Hospedado)</option>
                            <option value="lmstudio">💻 LM Studio Desktop (Localhost)</option>
                            <option value="custom">⚙️ Endpoint Customizado (OpenAI Compatible)</option>
                          </select>
                        </Field>

                        {/* URL Customizada (Base URL) */}
                        <Field
                          label="Endpoint / Base URL da API"
                          hint="Insira a URL do provedor ou do seu servidor customizado (vLLM, FastChat, LiteLLM, Ollama em rede, etc.)"
                        >
                          <div className="relative">
                            <FiGlobe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                              className={`${FIELD_STYLE} pl-10`}
                              value={customBaseUrl}
                              onChange={(e) => setCustomBaseUrl(e.target.value)}
                              placeholder={currentProviderConfig.defaultUrl}
                            />
                          </div>
                          {/* Quick URL Presets */}
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            <span className="text-[10px] text-slate-400 self-center mr-1">Atalhos rápidos:</span>
                            {[
                              { label: 'DeepSeek', url: 'https://api.deepseek.com/v1' },
                              { label: 'OpenRouter', url: 'https://openrouter.ai/api/v1' },
                              { label: 'OpenAI', url: 'https://api.openai.com/v1' },
                              { label: 'Groq', url: 'https://api.groq.com/openai/v1' },
                              { label: 'Ollama Local', url: 'http://127.0.0.1:11434/v1' },
                              { label: 'LM Studio', url: 'http://127.0.0.1:1234/v1' },
                            ].map((preset) => (
                              <button
                                key={preset.label}
                                type="button"
                                onClick={() => setCustomBaseUrl(preset.url)}
                                className="px-2 py-0.5 rounded text-[10px] bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 text-slate-700 dark:text-slate-200 transition"
                              >
                                {preset.label}
                              </button>
                            ))}
                          </div>
                        </Field>

                        {/* API Key / Secret Token */}
                        <Field
                          label="Chave de API / Token de Acesso"
                          hint={`Chave de autenticação para o provedor ${currentProviderConfig.name}`}
                        >
                          <div className="relative">
                            <input
                              type={showKey ? 'text' : 'password'}
                              className={`${FIELD_STYLE} pr-11`}
                              value={apiKey}
                              onChange={(e) => setApiKey(e.target.value)}
                              placeholder={currentProviderConfig.placeholderKey}
                            />
                            <button
                              type="button"
                              onClick={() => setShowKey((v) => !v)}
                              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                              title={showKey ? 'Ocultar chave' : 'Exibir chave'}
                            >
                              {showKey ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                            </button>
                          </div>
                        </Field>

                        {/* Modelo de Linguagem (Model ID) com Botão de Carregamento */}
                        <div className="flex flex-col gap-2 p-4 rounded-xl bg-white/60 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200 dark:border-white/10">
                            <div>
                              <label className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                                <FiCpu className="w-4 h-4 text-[var(--color-accent)]" />
                                Modelo de Linguagem (Model ID)
                              </label>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                Escolha da lista carregada do servidor ou digite o nome do modelo.
                              </p>
                            </div>

                            {/* Botão para carregar modelos */}
                            <button
                              type="button"
                              onClick={handleFetchModels}
                              disabled={fetchingModels}
                              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-[var(--color-accent-dim)] text-[var(--color-accent)] border border-[var(--color-accent)]/40 hover:bg-[var(--color-accent)] hover:text-white transition shadow-sm shrink-0 disabled:opacity-50"
                              title="Consultar endpoint /v1/models para listar modelos disponíveis"
                            >
                              {fetchingModels ? (
                                <>
                                  <FiRefreshCw className="w-3.5 h-3.5 animate-spin" /> Buscando Modelos...
                                </>
                              ) : (
                                <>
                                  <FiRefreshCw className="w-3.5 h-3.5" /> Carregar Modelos da API
                                </>
                              )}
                            </button>
                          </div>

                          {/* Se houver modelos carregados dinamicamente, exibe o seletor */}
                          {fetchedModels.length > 0 && (
                            <div className="flex flex-col gap-1.5 pt-1">
                              <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-accent)] flex items-center justify-between">
                                <span>Modelos Disponíveis no Servidor ({fetchedModels.length}):</span>
                                <span className="text-[10px] text-slate-400 font-normal">Selecione para aplicar</span>
                              </label>
                              <select
                                className={FIELD_STYLE}
                                value={model}
                                onChange={(e) => setModel(e.target.value)}
                              >
                                {fetchedModels.map((m) => (
                                  <option key={m} value={m}>
                                    {m}
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}

                          {/* Input manual de Modelo */}
                          <div className="flex flex-col gap-1.5 pt-1">
                            <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                              Identificador do Modelo (Digitação Manual):
                            </label>
                            <input
                              className={FIELD_STYLE}
                              value={model}
                              onChange={(e) => setModel(e.target.value)}
                              placeholder={currentProviderConfig.defaultModel}
                            />
                          </div>

                          {/* Feedback de carregamento de modelos */}
                          {fetchModelsStatus && (
                            <div
                              className={`p-3 rounded-lg text-xs flex items-center gap-2 border ${
                                fetchModelsStatus.ok
                                  ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-300'
                                  : 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/30 text-amber-800 dark:text-amber-300'
                              }`}
                            >
                              {fetchModelsStatus.ok ? (
                                <FiCheckCircle className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                              ) : (
                                <FiAlertCircle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
                              )}
                              <span>{fetchModelsStatus.message}</span>
                            </div>
                          )}

                          {/* Quick Model Chips */}
                          <div className="pt-1">
                            <span className="text-[10px] text-slate-400 block mb-1">Modelos sugeridos:</span>
                            <div className="flex flex-wrap gap-2">
                              {currentProviderConfig.models.map((m) => (
                                <button
                                  key={m}
                                  type="button"
                                  onClick={() => setModel(m)}
                                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition border ${
                                    model === m
                                      ? 'bg-[var(--color-accent-dim)] text-[var(--color-accent)] border-[var(--color-accent)]/50 shadow-sm'
                                      : 'bg-white dark:bg-white/5 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10'
                                  }`}
                                >
                                  {m}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Live Ping & Test Connection Button */}
                        <div className="mt-2 p-4 rounded-xl bg-white dark:bg-[#071324] border border-slate-200 dark:border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                          <div>
                            <p className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                              <FiZap className="w-4 h-4 text-amber-500" /> Teste de Conectividade em Tempo Real
                            </p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                              Dispara uma mensagem de teste para validar a URL, API Key e latência do modelo.
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={handleTestConnection}
                            disabled={testingConnection}
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 transition shadow-sm shrink-0 disabled:opacity-50"
                          >
                            {testingConnection ? (
                              <>
                                <FiRefreshCw className="w-3.5 h-3.5 animate-spin" /> Testando...
                              </>
                            ) : (
                              <>
                                <FiPlay className="w-3.5 h-3.5" /> Testar Conexão com IA
                              </>
                            )}
                          </button>
                        </div>

                        {/* Test Result Banner */}
                        {testResult && (
                          <div
                            className={`p-4 rounded-xl text-xs flex items-start gap-3 border ${
                              testResult.ok
                                ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-300'
                                : 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/30 text-red-800 dark:text-red-300'
                            }`}
                          >
                            {testResult.ok ? (
                              <FiCheckCircle className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
                            ) : (
                              <FiAlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600 dark:text-red-400" />
                            )}
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <span className="font-bold">
                                  {testResult.ok ? 'Conexão Estabelecida com Sucesso!' : 'Falha na Conexão'}
                                </span>
                                {testResult.latencyMs && (
                                  <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                                    {testResult.latencyMs}ms
                                  </span>
                                )}
                              </div>
                              <p className="mt-1">{testResult.message}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bloco 2: Parâmetros de Geração (Temperatura, Max Tokens, Top P) */}
                    <div className="rounded-2xl p-6 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-200 dark:border-white/10">
                        <FiSliders className="w-5 h-5 text-cyan-500" />
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                          Parâmetros de Inferência & Criatividade
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Temperatura */}
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                              Temperatura
                            </label>
                            <span className="font-mono text-xs font-bold text-[var(--color-accent)]">
                              {temperature.toFixed(2)}
                            </span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="2"
                            step="0.05"
                            value={temperature}
                            onChange={(e) => setTemperature(parseFloat(e.target.value))}
                            className="w-full accent-[var(--color-accent)] cursor-pointer"
                          />
                          <div className="flex justify-between text-[10px] text-slate-400">
                            <span>0.0 (Preciso / Código)</span>
                            <span>2.0 (Criativo)</span>
                          </div>
                        </div>

                        {/* Max Tokens */}
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                              Max Tokens de Resposta
                            </label>
                            <span className="font-mono text-xs font-bold text-[var(--color-accent)]">
                              {maxTokens}
                            </span>
                          </div>
                          <input
                            type="number"
                            min="256"
                            max="16384"
                            step="256"
                            value={maxTokens}
                            onChange={(e) => setMaxTokens(parseInt(e.target.value, 10) || 2048)}
                            className={FIELD_STYLE}
                          />
                          <span className="text-[10px] text-slate-400">Limite de palavras geradas por resposta.</span>
                        </div>

                        {/* Top P */}
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                              Top P (Nucleus Sampling)
                            </label>
                            <span className="font-mono text-xs font-bold text-[var(--color-accent)]">
                              {topP.toFixed(2)}
                            </span>
                          </div>
                          <input
                            type="range"
                            min="0.1"
                            max="1"
                            step="0.05"
                            value={topP}
                            onChange={(e) => setTopP(parseFloat(e.target.value))}
                            className="w-full accent-[var(--color-accent)] cursor-pointer"
                          />
                          <div className="flex justify-between text-[10px] text-slate-400">
                            <span>0.1 (Focado)</span>
                            <span>1.0 (Amplo)</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bloco 3: Engenharia de Prompts (System Prompt) */}
                    <div className="rounded-2xl p-6 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200 dark:border-white/10">
                        <div className="flex items-center gap-2">
                          <FiActivity className="w-5 h-5 text-amber-500" />
                          <p className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                            System Prompt & Comportamento do Agente
                          </p>
                        </div>
                        <span className="text-[11px] text-slate-400">
                          {systemPrompt.length} caracteres
                        </span>
                      </div>

                      {/* Presets Rápidos */}
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                        Templates de Personalidade Prontos:
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-4">
                        {PROMPT_PRESETS.map((preset) => (
                          <button
                            key={preset.title}
                            type="button"
                            onClick={() => setSystemPrompt(preset.prompt)}
                            className="p-3 text-left rounded-xl bg-white dark:bg-[#071324] border border-slate-200 dark:border-white/10 hover:border-[var(--color-accent)]/50 transition group"
                          >
                            <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-[var(--color-accent)] transition-colors">
                              {preset.title}
                            </p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                              {preset.desc}
                            </p>
                          </button>
                        ))}
                      </div>

                      <Field
                        label="Instrução Base do Sistema (System Prompt)"
                        hint="Diretrizes gerais, tom de voz, regras de atendimento e regras de negócio."
                      >
                        <textarea
                          className="w-full rounded-xl px-4 py-3 text-xs sm:text-sm font-mono text-slate-900 dark:text-white placeholder:text-slate-400 outline-none transition focus:ring-2 focus:ring-[var(--color-accent)] resize-none h-44 bg-white dark:bg-[#071324] border border-slate-200 dark:border-white/15 leading-relaxed"
                          value={systemPrompt}
                          onChange={(e) => setSystemPrompt(e.target.value)}
                          placeholder="Você é o assistente oficial da EasyDev..."
                        />
                      </Field>
                    </div>

                    {/* Bloco 4: Webhooks & Integrações Externas */}
                    <div className="rounded-2xl p-6 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-200 dark:border-white/10">
                        <FiLayers className="w-5 h-5 text-indigo-500" />
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                          Webhooks & Integrações Externas (n8n / CRM)
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Field
                          label="Webhook URL (Disparo de Eventos)"
                          hint="URL que receberá notificações automáticas quando um novo lead ou mensagem for gerada"
                        >
                          <div className="relative">
                            <FiGlobe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                              className={`${FIELD_STYLE} pl-10`}
                              value={webhookUrl}
                              onChange={(e) => setWebhookUrl(e.target.value)}
                              placeholder="https://n8n.seuservidor.com/webhook/easydev-events"
                            />
                          </div>
                        </Field>

                        <Field
                          label="Secret Key do Webhook (Authorization Header)"
                          hint="Chave secreta enviada no cabeçalho para validar a autenticidade da requisição"
                        >
                          <input
                            type="password"
                            className={FIELD_STYLE}
                            value={webhookSecret}
                            onChange={(e) => setWebhookSecret(e.target.value)}
                            placeholder="secret_token_easydev_123"
                          />
                        </Field>
                      </div>
                    </div>
                  </div>
                )}

                {/* ─── CLIENTES ─── */}
                {activeSection === 'clientes' && <UserManagement type="client" />}

                {/* ─── WHATSAPP (EVOLUTION API) ─── */}
                {activeSection === 'whatsapp' && <WhatsAppSettings />}

                {/* ─── EQUIPE ─── */}
                {activeSection === 'equipe' && <UserManagement type="team" />}

                {/* ─── PERFIL ─── */}
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

                {/* ─── NOTIFICAÇÕES ─── */}
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

                {/* ─── SEGURANÇA ─── */}
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
              {activeSection !== 'whatsapp' && activeSection !== 'clientes' && activeSection !== 'equipe' && (
                <div className="px-7 py-4 flex items-center justify-between border-t border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02]">
                  {saved ? (
                    <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400">
                      <FiCheckCircle className="w-4 h-4" /> Configurações salvas com sucesso!
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
                    <FiSave className="w-4 h-4" /> Salvar Configurações
                  </button>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
