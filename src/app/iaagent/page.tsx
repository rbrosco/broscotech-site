"use client";
import React, { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  FiSend,
  FiPlus,
  FiMessageSquare,
  FiX,
  FiCpu,
  FiUser,
  FiLoader,
  FiImage,
  FiArrowRight,
  FiLogIn,
  FiTrash2,
} from 'react-icons/fi';
import DashboardNav from '@/component/DashboardNav';
import Sidebar from '@/component/Sidebar';
import Header from '@/component/Header';

type Session = { id: string; title: string; updatedAt: string };
type Message = { id: string; text: string; from: 'client' | 'agent' | 'admin'; timestamp: string; imageUrl?: string };
type VisitorData = { name: string; email: string };

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'agora';
  if (m < 60) return `${m}m atrás`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h atrás`;
  return new Date(iso).toLocaleDateString('pt-BR');
}

export default function IAAgentPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selected, setSelected] = useState<Session | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [sending, setSending] = useState(false);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Visitor state
  const [visitor, setVisitor] = useState<VisitorData | null>(null);
  const [visitorNameInput, setVisitorNameInput] = useState('');
  const [visitorEmailInput, setVisitorEmailInput] = useState('');
  const [visitorError, setVisitorError] = useState('');

  const [projects, setProjects] = useState<{ id: number; title: string }[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);

  // Auth check & load visitor info
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/me', { credentials: 'include' });
        if (res.ok) {
          setAuthed(true);
        } else {
          // Check local visitor cache
          const cached = localStorage.getItem('easydev_visitor_data');
          if (cached) {
            try {
              const parsed = JSON.parse(cached);
              if (parsed.name && parsed.email) setVisitor(parsed);
            } catch {}
          }
        }
      } catch {
        const cached = localStorage.getItem('easydev_visitor_data');
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            if (parsed.name && parsed.email) setVisitor(parsed);
          } catch {}
        }
      }
      setCheckingAuth(false);
    })();
  }, []);

  // Load projects if authed
  useEffect(() => {
    if (!authed) return;
    (async () => {
      try {
        const res = await fetch('/api/projects?all=1', { credentials: 'include' });
        if (res.ok) {
          const p = (await res.json()) as { projects?: { id: number; title: string }[]; project?: { id: number; title: string } };
          const list = p.projects ?? (p.project ? [p.project] : []);
          setProjects(list);
          if (list.length > 0) setSelectedProjectId(Number(list[0].id));
        }
      } catch {}
    })();
  }, [authed]);

  // Load sessions (Authed vs Visitor)
  const loadSessions = useCallback(async () => {
    if (authed) {
      try {
        const url = selectedProjectId ? `/api/iaagent/sessions?projectId=${selectedProjectId}` : '/api/iaagent/sessions';
        const res = await fetch(url, { credentials: 'include' });
        if (res.ok) {
          const p = (await res.json()) as { sessions?: Session[] };
          const newSessions = p.sessions ?? [];
          setSessions(newSessions);
          setSelected((prev) => {
            if (!prev) return null;
            if (!newSessions.some((s) => s.id === prev.id)) return null;
            return prev;
          });
        }
      } catch {}
    } else {
      // Visitor sessions from localStorage
      try {
        const raw = localStorage.getItem('easydev_visitor_sessions');
        const localSessions: Session[] = raw ? JSON.parse(raw) : [];
        setSessions(localSessions);
        if (localSessions.length > 0 && !selected) {
          setSelected(localSessions[0]);
        }
      } catch {}
    }
  }, [authed, selectedProjectId, selected]);

  useEffect(() => {
    if (!checkingAuth) {
      void loadSessions();
    }
  }, [checkingAuth, authed, loadSessions]);

  const [newTitle, setNewTitle] = useState('');
  const [showNewModal, setShowNewModal] = useState(false);

  // Load messages for selected session
  useEffect(() => {
    if (!selected) {
      setMessages([]);
      return;
    }
    setLoadingMsgs(true);

    if (authed) {
      (async () => {
        try {
          const res = await fetch(`/api/iaagent/sessions/${selected.id}/messages`, { credentials: 'include' });
          if (res.ok) {
            const p = (await res.json()) as { messages?: Message[] };
            setMessages(p.messages ?? []);
          }
        } catch {}
        setLoadingMsgs(false);
      })();
    } else {
      // Load visitor messages from localStorage
      try {
        const key = `easydev_visitor_msgs_${selected.id}`;
        const raw = localStorage.getItem(key);
        if (raw) {
          setMessages(JSON.parse(raw));
        } else {
          // Welcome greeting
          const vName = visitor?.name?.split(' ')[0] || 'visitante';
          const welcomeMsg: Message = {
            id: 'welcome-1',
            from: 'agent',
            text: `Olá, ${vName}! Sou o Agente de Inteligência Artificial da EasyDev. 👋\n\nComo posso te ajudar hoje? Posso tirar dúvidas sobre nossos serviços (Web Apps, SaaS, APIs, Automações com n8n), estimar escopos ou estruturar o briefing do seu projeto!`,
            timestamp: new Date().toISOString(),
          };
          setMessages([welcomeMsg]);
          localStorage.setItem(key, JSON.stringify([welcomeMsg]));
        }
      } catch {}
      setLoadingMsgs(false);
    }
  }, [selected, authed, visitor]);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setAttachedImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleVisitorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setVisitorError('');
    const nameTrim = visitorNameInput.trim();
    const emailTrim = visitorEmailInput.trim();

    if (!nameTrim || !emailTrim) {
      setVisitorError('Por favor, informe seu nome completo e e-mail.');
      return;
    }
    if (!emailTrim.includes('@')) {
      setVisitorError('Por favor, insira um e-mail válido.');
      return;
    }

    const vData: VisitorData = { name: nameTrim, email: emailTrim.toLowerCase() };
    setVisitor(vData);
    localStorage.setItem('easydev_visitor_data', JSON.stringify(vData));

    // Create first visitor session
    const newSessionId = crypto.randomUUID();
    const firstSession: Session = {
      id: newSessionId,
      title: `Briefing Inicial (${nameTrim.split(' ')[0]})`,
      updatedAt: new Date().toISOString(),
    };
    const updatedSessions = [firstSession];
    setSessions(updatedSessions);
    setSelected(firstSession);
    localStorage.setItem('easydev_visitor_sessions', JSON.stringify(updatedSessions));
  };

  const handleSend = async () => {
    const text = input.trim();
    if ((!text && !attachedImage) || !selected || sending) return;
    setInput('');
    const currentImage = attachedImage;
    setAttachedImage(null);
    setSending(true);

    const clientMsg: Message = {
      id: crypto.randomUUID(),
      text,
      from: 'client',
      imageUrl: currentImage || undefined,
      timestamp: new Date().toISOString(),
    };
    const updatedMessages = [...messages, clientMsg];
    setMessages(updatedMessages);

    // Save client message
    if (authed) {
      try {
        await fetch(`/api/iaagent/sessions/${selected.id}/messages`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, from: 'client', imageUrl: currentImage || undefined }),
        });
      } catch {}
    } else {
      localStorage.setItem(`easydev_visitor_msgs_${selected.id}`, JSON.stringify(updatedMessages));
    }

    try {
      const historyForAI = updatedMessages.map((m) => ({
        role: m.from === 'client' ? 'user' : 'assistant',
        content: m.text,
        imageUrl: m.imageUrl,
      }));

      const baseSystemPrompt =
        localStorage.getItem('IA_SYSTEM_PROMPT') ??
        'Você é o Agente de Inteligência Artificial oficial da EasyDev (easydev.com.br). Você é prestativo, técnico, objetivo e amigável. Seu papel é explicar os serviços da EasyDev (Next.js, React, Node.js, PostgreSQL, Automações n8n, IA), coletar briefings de projetos e ajudar clientes e visitantes a estruturarem suas ideias em soluções digitais de alto impacto.';

      const clientName = authed ? 'Cliente Cadastrado' : visitor?.name || 'Visitante';
      const clientEmail = visitor?.email ? ` | E-mail: ${visitor.email}` : '';
      const projTitle = projects.find((p) => p.id === selectedProjectId)?.title;

      const systemPromptWithContext = `[Informações do Usuário Atual]: Nome: "${clientName}"${clientEmail}. ${
        projTitle ? `O usuário está falando sobre o projeto: "${projTitle}".` : 'Este é um visitante interessado em criar ou tirar dúvidas sobre soluções digitais.'
      }\n\n${baseSystemPrompt}`;

      const savedProvider = localStorage.getItem('IA_PROVIDER') || 'groq';
      const savedCustomUrl = localStorage.getItem('IA_CUSTOM_BASE_URL') || '';
      const savedApiKey =
        localStorage.getItem('IA_API_KEY') ||
        localStorage.getItem(`${savedProvider.toUpperCase()}_API_KEY`) ||
        '';
      const savedModel =
        localStorage.getItem('IA_MODEL') ||
        localStorage.getItem(`${savedProvider.toUpperCase()}_MODEL`) ||
        '';
      const savedTemp = parseFloat(localStorage.getItem('IA_TEMPERATURE') || '0.7');
      const savedMaxTokens = parseInt(localStorage.getItem('IA_MAX_TOKENS') || '2048', 10);
      const savedTopP = parseFloat(localStorage.getItem('IA_TOP_P') || '1.0');

      const aiRes = await fetch('/api/iaagent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: historyForAI,
          provider: savedProvider,
          customBaseUrl: savedCustomUrl || undefined,
          apiKey: savedApiKey || undefined,
          model: savedModel || undefined,
          temperature: isNaN(savedTemp) ? 0.7 : savedTemp,
          maxTokens: isNaN(savedMaxTokens) ? 2048 : savedMaxTokens,
          topP: isNaN(savedTopP) ? 1.0 : savedTopP,
          systemPrompt: systemPromptWithContext,
        }),
      });

      const aiPayload = (await aiRes.json()) as { reply?: string };
      const replyText = aiPayload.reply ?? 'Desculpe, não consegui processar sua mensagem no momento.';

      const agentMsg: Message = {
        id: crypto.randomUUID(),
        text: replyText,
        from: 'agent',
        timestamp: new Date().toISOString(),
      };

      const finalMessages = [...updatedMessages, agentMsg];
      setMessages(finalMessages);

      if (authed) {
        await fetch(`/api/iaagent/sessions/${selected.id}/messages`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: replyText, from: 'agent' }),
        });
      } else {
        localStorage.setItem(`easydev_visitor_msgs_${selected.id}`, JSON.stringify(finalMessages));
      }
    } catch {
      const errMsg: Message = {
        id: crypto.randomUUID(),
        text: 'Erro de conexão com o agente. Tente novamente em alguns instantes.',
        from: 'agent',
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errMsg]);
    }
    setSending(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  const handleNewSession = async () => {
    const title = newTitle.trim() || `Sessão ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;

    if (authed) {
      let projectId = selectedProjectId;
      if (!projectId) {
        try {
          const projectRes = await fetch('/api/projects', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: 'Meu Projeto' }),
          });
          if (projectRes.ok) {
            const projectPayload = (await projectRes.json()) as { project?: { id: number; title: string } };
            if (projectPayload.project) {
              setProjects((prev) => [projectPayload.project!, ...prev]);
              projectId = projectPayload.project.id;
              setSelectedProjectId(projectId);
            }
          }
        } catch {}
      }
      if (!projectId) return;

      try {
        const res = await fetch('/api/iaagent/sessions', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, projectId }),
        });
        if (res.ok) {
          const p = (await res.json()) as { session?: Session };
          if (p.session) {
            setSessions((prev) => [p.session!, ...prev]);
            setSelected(p.session!);
          }
        }
      } catch {}
    } else {
      // Visitor new session
      const newSession: Session = {
        id: crypto.randomUUID(),
        title,
        updatedAt: new Date().toISOString(),
      };
      const updated = [newSession, ...sessions];
      setSessions(updated);
      setSelected(newSession);
      localStorage.setItem('easydev_visitor_sessions', JSON.stringify(updated));
    }
    setNewTitle('');
    setShowNewModal(false);
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-200 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-[3px] animate-spin border-cyan-500/30 border-t-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.5)]" />
      </div>
    );
  }

  // If visitor has not provided Name and Email yet, show the sleek Visitor Onboarding Screen!
  if (!authed && !visitor) {
    return (
      <>
        <Header />
        <main className="min-h-screen pt-[calc(var(--header-height)+1.5rem)] pb-16 px-4 flex items-center justify-center relative overflow-hidden">
          {/* Ambient Glow Aura */}
          <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-gradient-to-b from-[#00b09b]/20 via-[#004aad]/15 to-transparent blur-[140px] -z-10" />

          <div className="w-full max-w-lg relative">
            <div className="absolute -inset-[1px] rounded-[2rem] bg-gradient-to-r from-indigo-500 via-[var(--color-accent)] to-cyan-400 opacity-35 blur-sm" />

            <div className="relative rounded-[1.9rem] bg-white/90 dark:bg-[#071324]/90 border border-black/10 dark:border-white/15 backdrop-blur-2xl p-7 sm:p-9 shadow-2xl overflow-hidden">
              <div className="text-center mb-6">
                <div
                  className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-3 shadow-lg relative group"
                  style={{ background: 'linear-gradient(135deg, #004aad, #00b09b)' }}
                >
                  <FiCpu className="w-8 h-8 text-white relative z-10 animate-pulse" />
                  <div className="absolute inset-0 rounded-2xl bg-cyan-400/40 blur-md" />
                </div>

                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <span className="font-pixel text-sm tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-400 to-cyan-400 dark:from-indigo-400 dark:via-purple-300 dark:to-cyan-300">
                    EasyDev
                  </span>
                  <span className="font-pixel text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-500 dark:bg-cyan-400/20 dark:text-cyan-300 border border-cyan-500/30 uppercase">
                    IA Agent
                  </span>
                </div>

                <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  Briefing Inteligente com IA
                </h1>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  Não é necessário criar senha! Informe apenas seu nome e e-mail para iniciar o atendimento e tirar dúvidas sobre seu projeto.
                </p>
              </div>

              {visitorError && (
                <div className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-600 dark:text-red-400 text-xs font-semibold">
                  {visitorError}
                </div>
              )}

              <form onSubmit={handleVisitorSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Nome Completo
                  </label>
                  <input
                    type="text"
                    required
                    value={visitorNameInput}
                    onChange={(e) => setVisitorNameInput(e.target.value)}
                    placeholder="Ex: João da Silva"
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-[var(--color-accent)] shadow-inner"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Seu Melhor E-mail
                  </label>
                  <input
                    type="email"
                    required
                    value={visitorEmailInput}
                    onChange={(e) => setVisitorEmailInput(e.target.value)}
                    placeholder="seuemail@exemplo.com"
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-[var(--color-accent)] shadow-inner"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3.5 px-6 rounded-xl font-bold text-sm text-white shadow-lg transition-all duration-200 hover:scale-[1.01] hover:opacity-95 flex items-center justify-center gap-2 cursor-pointer"
                    style={{ background: 'linear-gradient(135deg, #004aad 0%, #00b09b 60%, #00d4aa 100%)' }}
                  >
                    <span>Iniciar Conversa com a IA</span>
                    <FiArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>

              <div className="mt-6 pt-5 border-t border-slate-200 dark:border-white/10 text-center">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Já possui conta no portal?{' '}
                  <Link href="/login" className="font-bold text-[var(--color-accent)] hover:underline inline-flex items-center gap-1">
                    Acessar Conta <FiLogIn className="w-3 h-3" />
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-200 selection:bg-cyan-500/30 flex overflow-hidden">
      {authed && <Sidebar />}
      <div className={`${authed ? 'md:pl-sidebar' : ''} transition-[padding] duration-300 flex flex-col w-full h-screen`}>
        {authed ? (
          <DashboardNav />
        ) : (
          <div className="h-[60px] px-4 sm:px-6 flex items-center justify-between border-b border-slate-200 dark:border-white/10 bg-white/80 dark:bg-[#071324]/80 backdrop-blur-md shrink-0">
            <Link href="/" className="flex items-center gap-2">
              <span className="font-pixel text-xs sm:text-sm tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-400 to-cyan-400 dark:from-indigo-400 dark:via-purple-300 dark:to-cyan-300">
                EasyDev
              </span>
              <span className="font-pixel text-[9px] px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-500 dark:bg-cyan-400/20 dark:text-cyan-300 border border-cyan-500/30 uppercase">
                IA Agent
              </span>
            </Link>

            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500 dark:text-slate-400 hidden sm:inline">
                Olá, <strong className="text-slate-800 dark:text-white">{visitor?.name}</strong>
              </span>
              <Link
                href="/login"
                className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-black/10 dark:border-white/15 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
              >
                Acessar Conta
              </Link>
            </div>
          </div>
        )}

        <div className={`flex flex-1 overflow-hidden ${authed ? 'pt-[65px]' : ''}`}>
          {/* Sessions sidebar */}
          <aside className="w-80 shrink-0 flex-col overflow-hidden hidden md:flex bg-white/50 dark:bg-slate-900/40 border-r border-slate-200 dark:border-white/5 backdrop-blur-xl relative z-10">
            <div className="px-6 py-5 flex items-center justify-between shrink-0 border-b border-slate-200 dark:border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-200 dark:border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.15)] relative overflow-hidden group">
                  <div className="absolute inset-0 bg-cyan-400/20 blur-md group-hover:bg-cyan-400/30 transition-colors" />
                  <FiCpu className="w-4 h-4 text-cyan-600 dark:text-cyan-400 relative z-10" />
                </div>
                <span className="text-base font-black text-slate-900 dark:text-white tracking-tight">Conversas</span>
              </div>
              <button
                onClick={() => setShowNewModal(true)}
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-all bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 hover:scale-105 shadow-sm"
                title="Nova conversa"
              >
                <FiPlus className="w-4 h-4" />
              </button>
            </div>

            {authed && projects.length > 0 && (
              <div className="px-4 py-3 border-b border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900/50 relative">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 block">Projeto Atual</label>
                <select
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm rounded-lg px-3 py-2 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-cyan-500/50 appearance-none cursor-pointer"
                  value={selectedProjectId || ''}
                  onChange={(e) => setSelectedProjectId(Number(e.target.value))}
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex-1 overflow-y-auto py-3 px-3 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
              {sessions.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 gap-3">
                  <FiMessageSquare className="w-8 h-8 text-slate-400 dark:text-slate-700" />
                  <p className="text-sm font-medium text-slate-500">Nenhuma conversa ainda</p>
                </div>
              ) : (
                sessions.map((s) => {
                  const isSelected = selected?.id === s.id;
                  return (
                    <button
                      key={s.id}
                      onClick={() => setSelected(s)}
                      className={`w-full text-left px-4 py-3.5 rounded-2xl mb-2 transition-all duration-300 border ${
                        isSelected
                          ? 'bg-cyan-50 dark:bg-cyan-500/10 border-cyan-200 dark:border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.05)]'
                          : 'bg-transparent border-transparent hover:bg-slate-100 dark:hover:bg-white/5 hover:border-slate-200 dark:hover:border-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <FiMessageSquare
                          className={`w-4 h-4 shrink-0 transition-colors ${
                            isSelected ? 'text-cyan-600 dark:text-cyan-400' : 'text-slate-400 dark:text-slate-600'
                          }`}
                        />
                        <span
                          className={`text-sm font-bold truncate transition-colors ${
                            isSelected ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {s.title}
                        </span>
                      </div>
                      <p
                        className={`text-[11px] font-medium mt-1 pl-7 transition-colors ${
                          isSelected ? 'text-cyan-600/80 dark:text-cyan-400/60' : 'text-slate-500 dark:text-slate-600'
                        }`}
                      >
                        {timeAgo(s.updatedAt)}
                      </p>
                    </button>
                  );
                })
              )}
            </div>
          </aside>

          {/* Chat area */}
          <div className="flex-1 flex flex-col overflow-hidden min-w-0 bg-slate-50/50 dark:bg-slate-950/50 relative">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/10 via-slate-950/0 to-cyan-900/5 pointer-events-none" />

            {!selected ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-6 px-6 relative z-10">
                <div className="w-24 h-24 rounded-[2rem] flex items-center justify-center bg-gradient-to-br from-indigo-600/20 to-cyan-500/20 border border-slate-200 dark:border-white/5 shadow-[0_0_40px_rgba(6,182,212,0.15)] relative group">
                  <div className="absolute inset-0 bg-cyan-400/20 blur-xl rounded-[2rem] group-hover:bg-cyan-400/30 transition-colors duration-500" />
                  <FiCpu className="w-10 h-10 text-cyan-600 dark:text-cyan-400 relative z-10" />
                </div>
                <div className="text-center">
                  <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                    Agente IA EasyDev
                  </h2>
                  <p className="text-base font-medium mt-2 max-w-sm text-slate-500 dark:text-slate-400">
                    Selecione uma conversa ou crie uma nova para começar seu briefing.
                  </p>
                </div>
                <button
                  onClick={() => setShowNewModal(true)}
                  className="flex items-center gap-3 px-6 py-3.5 rounded-2xl text-sm font-bold text-white transition-all hover:scale-105 bg-gradient-to-r from-[var(--color-accent-600)] to-[var(--color-accent)] shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.4)]"
                >
                  <FiPlus className="w-5 h-5" /> Nova conversa
                </button>
              </div>
            ) : (
              <>
                {/* Chat header */}
                <div className="px-6 py-4 flex items-center gap-4 shrink-0 bg-white/40 dark:bg-slate-900/40 border-b border-slate-200 dark:border-white/5 backdrop-blur-md relative z-10">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-200 dark:border-cyan-500/20 shadow-inner">
                    <FiCpu className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-black text-slate-900 dark:text-white truncate tracking-tight">
                      {selected.title}
                    </p>
                    <p className="text-xs font-medium text-slate-500 mt-0.5">
                      {messages.length} mensagens · Atendimento inteligente
                    </p>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-4 md:px-10 py-8 flex flex-col gap-6 relative z-10 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                  {loadingMsgs ? (
                    <div className="flex items-center justify-center py-16 gap-3">
                      <div className="w-6 h-6 rounded-full border-[3px] border-cyan-500/30 border-t-cyan-500 animate-spin" />
                      <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Carregando histórico...</span>
                    </div>
                  ) : messages.map((m) => {
                    const isIncoming = m.from === 'agent' || m.from === 'admin';
                    const isAdmin = m.from === 'admin';

                    return (
                      <div key={m.id} className={`flex gap-4 max-w-3xl ${isIncoming ? '' : 'ml-auto flex-row-reverse'}`}>
                        <div
                          className={`w-10 h-10 rounded-2xl shrink-0 flex items-center justify-center mt-1 border shadow-sm ${
                            isAdmin
                              ? 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20'
                              : isIncoming
                              ? 'bg-cyan-50 dark:bg-cyan-500/10 border-cyan-200 dark:border-cyan-500/20'
                              : 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/20'
                          }`}
                        >
                          {isAdmin ? (
                            <FiUser className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                          ) : isIncoming ? (
                            <FiCpu className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                          ) : (
                            <FiUser className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                          )}
                        </div>
                        <div
                          className={`relative px-6 py-4 max-w-full lg:max-w-3xl ${
                            isIncoming
                              ? 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-3xl rounded-tl-none shadow-sm'
                              : 'bg-gradient-to-br from-[var(--color-accent-600)] to-[var(--color-accent)] text-white rounded-3xl rounded-tr-none shadow-md'
                          }`}
                        >
                          {m.imageUrl && (
                            <div className="mb-3">
                              <img
                                src={m.imageUrl}
                                alt="Anexo"
                                className="max-w-full max-h-64 rounded-xl border border-white/20 object-contain bg-black/10"
                              />
                            </div>
                          )}
                          <div className="text-[15px] leading-relaxed whitespace-pre-wrap break-words">{m.text}</div>
                          <p
                            className={`text-xs font-medium mt-2 text-slate-400 dark:text-slate-500 ${
                              isIncoming ? 'ml-2' : 'mr-2 text-right'
                            }`}
                          >
                            {isAdmin && <span className="font-bold text-amber-500 dark:text-amber-400 mr-2">Equipe EasyDev</span>}
                            {new Date(m.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  {sending && (
                    <div className="flex gap-4 max-w-3xl">
                      <div className="w-10 h-10 rounded-2xl shrink-0 flex items-center justify-center mt-1 bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-200 dark:border-cyan-500/20 shadow-sm">
                        <FiCpu className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                      </div>
                      <div className="rounded-3xl rounded-tl-none px-6 py-5 flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 shadow-lg">
                        {[0, 1, 2].map((i) => (
                          <div
                            key={i}
                            className="w-2 h-2 rounded-full bg-cyan-400/60 animate-bounce"
                            style={{ animationDelay: `${i * 0.15}s` }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  <div ref={bottomRef} />
                </div>

                {/* Input area */}
                <div className="px-4 md:px-10 py-6 shrink-0 bg-white/60 dark:bg-slate-900/60 border-t border-slate-200 dark:border-white/5 backdrop-blur-md relative z-10">
                  <div className="max-w-4xl mx-auto relative group">
                    {attachedImage && (
                      <div className="mb-3 relative inline-block">
                        <img
                          src={attachedImage}
                          alt="Anexo"
                          className="h-20 w-auto rounded-xl border border-slate-200 dark:border-slate-700 object-cover"
                        />
                        <button
                          onClick={() => setAttachedImage(null)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow hover:bg-red-600"
                        >
                          <FiX className="w-3 h-3" />
                        </button>
                      </div>
                    )}

                    <div className="absolute -inset-0.5 bg-gradient-to-r from-[var(--color-accent-600)] to-[var(--color-accent)] rounded-3xl blur opacity-20 group-hover:opacity-30 transition duration-500" />
                    <div className="relative flex items-end gap-3 rounded-3xl px-5 py-4 bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 shadow-xl">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleImageUpload}
                      />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={sending}
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 mb-1"
                        title="Anexar imagem ou diagrama"
                      >
                        <FiImage className="w-5 h-5" />
                      </button>

                      <textarea
                        ref={inputRef}
                        value={input}
                        onChange={(e) => {
                          setInput(e.target.value);
                          e.target.style.height = '44px';
                          e.target.style.height = `${e.target.scrollHeight}px`;
                        }}
                        onKeyDown={handleKeyDown}
                        disabled={sending}
                        rows={1}
                        placeholder="Escreva sua mensagem... (Enter para enviar)"
                        className="flex-1 bg-transparent text-[15px] font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none resize-none max-h-40 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent py-3"
                        style={{ minHeight: '44px', height: '44px' }}
                      />
                      <button
                        onClick={() => void handleSend()}
                        disabled={sending || (!input.trim() && !attachedImage)}
                        className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-300 disabled:opacity-50 disabled:scale-100 disabled:hover:shadow-none hover:scale-105 bg-gradient-to-br from-[var(--color-accent-600)] to-[var(--color-accent)] text-white shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] mb-0"
                      >
                        {sending ? <FiLoader className="w-5 h-5 animate-spin" /> : <FiSend className="w-5 h-5 ml-1" />}
                      </button>
                    </div>
                  </div>
                  <p className="text-xs font-semibold text-center mt-3 text-slate-500">
                    Shift+Enter para nova linha · Enter para enviar
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* New session modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-xl relative overflow-hidden">
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-cyan-500/20 blur-[50px] rounded-full pointer-events-none" />
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2 relative z-10 tracking-tight">Nova conversa</h3>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-6 relative z-10">Dê um nome para identificar este tópico.</p>
            <input
              autoFocus
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') void handleNewSession();
              }}
              placeholder="Ex: Briefing de E-commerce / Dúvidas de API"
              className="w-full rounded-2xl px-5 py-4 text-sm font-medium text-slate-900 dark:text-white bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 outline-none transition-all focus:ring-2 focus:ring-cyan-500 relative z-10 shadow-inner"
            />
            <div className="flex gap-3 mt-8 relative z-10">
              <button
                onClick={() => setShowNewModal(false)}
                className="flex-1 py-3.5 rounded-2xl text-sm font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5"
              >
                Cancelar
              </button>
              <button
                onClick={() => void handleNewSession()}
                className="flex-1 py-3.5 rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-[var(--color-accent-600)] to-[var(--color-accent)] shadow-md"
              >
                Criar conversa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
