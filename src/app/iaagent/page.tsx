"use client";
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { FiSend, FiPlus, FiMessageSquare, FiX, FiCpu, FiUser, FiLoader, FiCheckCircle } from 'react-icons/fi';
import DashboardNav from '@/component/DashboardNav';
import Sidebar from '@/component/Sidebar';

type Session = { id: string; title: string; updatedAt: string };
type Message = { id: string; text: string; from: 'client' | 'agent'; timestamp: string };

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
  const [sending, setSending] = useState(false);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auth check via /api/me
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/me', { credentials: 'include' });
        if (res.ok) setAuthed(true);
      } catch {}
      setCheckingAuth(false);
    })();
  }, []);

  // Load sessions
  const loadSessions = useCallback(async () => {
    try {
      const res = await fetch('/api/iaagent/sessions', { credentials: 'include' });
      if (res.ok) {
        const p = await res.json() as { sessions?: Session[] };
        setSessions(p.sessions ?? []);
      }
    } catch {}
  }, []);

  useEffect(() => { if (authed) void loadSessions(); }, [authed, loadSessions]);

  const [newTitle, setNewTitle] = useState('');
  const [showNewModal, setShowNewModal] = useState(false);

  // Load messages for selected session
  useEffect(() => {
    if (!selected) { setMessages([]); return; }
    setLoadingMsgs(true);
    (async () => {
      try {
        const res = await fetch(`/api/iaagent/sessions/${selected.id}/messages`, { credentials: 'include' });
        if (res.ok) {
          const p = await res.json() as { messages?: Message[] };
          setMessages(p.messages ?? []);
        }
      } catch {}
      setLoadingMsgs(false);
    })();
  }, [selected]);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || !selected || sending) return;
    setInput('');
    setSending(true);

    // Optimistic: add client message
    const clientMsg: Message = { id: crypto.randomUUID(), text, from: 'client', timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, clientMsg]);

    try {
      // Save client message to session
      await fetch(`/api/iaagent/sessions/${selected.id}/messages`, {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, from: 'client' }),
      });

      // Get AI response
      const historyForAI = [...messages, clientMsg].map(m => ({
        role: m.from === 'client' ? 'user' : 'assistant',
        content: m.text,
      }));

      const aiRes = await fetch('/api/iaagent', {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: historyForAI,
          apiKey: localStorage.getItem('GROQ_API_KEY') ?? undefined,
          model: localStorage.getItem('GROQ_MODEL') ?? undefined,
          systemPrompt: localStorage.getItem('IA_SYSTEM_PROMPT') ?? undefined,
        }),
      });

      const aiPayload = await aiRes.json() as { reply?: string };
      const replyText = aiPayload.reply ?? 'Desculpe, não consegui processar sua mensagem.';

      // Save agent response
      await fetch(`/api/iaagent/sessions/${selected.id}/messages`, {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: replyText, from: 'agent' }),
      });

      const agentMsg: Message = { id: crypto.randomUUID(), text: replyText, from: 'agent', timestamp: new Date().toISOString() };
      setMessages(prev => [...prev, agentMsg]);
      await loadSessions(); // refresh updatedAt
    } catch {
      const errMsg: Message = { id: crypto.randomUUID(), text: 'Erro ao conectar com o agente.', from: 'agent', timestamp: new Date().toISOString() };
      setMessages(prev => [...prev, errMsg]);
    }
    setSending(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void handleSend(); }
  };

  const handleNewSession = async () => {
    const title = newTitle.trim() || `Sessão ${new Date().toLocaleString('pt-BR')}`;
    try {
      const res = await fetch('/api/iaagent/sessions', {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      });
      if (res.ok) {
        const p = await res.json() as { session?: Session };
        if (p.session) { setSessions(prev => [p.session!, ...prev]); setSelected(p.session!); }
      }
    } catch {}
    setNewTitle('');
    setShowNewModal(false);
  };

  if (checkingAuth) {
    return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-200 selection:bg-cyan-500/30">
      <Sidebar />
      <div className="md:pl-sidebar transition-[padding] duration-300 flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 rounded-full border-[3px] animate-spin border-cyan-500/30 border-t-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.5)]" />
      </div>
    </div>
    );
  }

  if (!authed) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-200 selection:bg-cyan-500/30">
        <Sidebar />
        <div className="md:pl-sidebar transition-[padding] duration-300 flex flex-col min-h-screen">
          <DashboardNav />
          <div className="flex-1 flex items-center justify-center relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-500/10 blur-[100px] rounded-full pointer-events-none" />
            <div className="text-center relative z-10 p-8 rounded-3xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 shadow-2xl backdrop-blur-sm">
              <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.15)]">
                <FiCpu className="w-10 h-10 text-red-600 dark:text-red-400" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Faça login para continuar</h2>
              <p className="text-sm font-medium mt-2 text-slate-500 dark:text-slate-400">Você precisa estar autenticado para usar o Agente IA.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-200 selection:bg-cyan-500/30 flex overflow-hidden">
      <Sidebar />
      <div className="md:pl-sidebar transition-[padding] duration-300 flex flex-col w-full h-screen">
        <DashboardNav />

        <div className="flex flex-1 overflow-hidden pt-[65px]">

            {/* Sessions sidebar */}
            <aside className="w-80 shrink-0 flex-col overflow-hidden hidden md:flex bg-white/50 dark:bg-slate-900/40 border-r border-slate-200 dark:border-white/5 backdrop-blur-xl relative z-10">
              <div className="px-6 py-5 flex items-center justify-between shrink-0 border-b border-slate-200 dark:border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-200 dark:border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.15)] relative overflow-hidden group">
                     <div className="absolute inset-0 bg-cyan-400/20 blur-md group-hover:bg-cyan-400/30 transition-colors" />
                     <FiCpu className="w-4 h-4 text-cyan-600 dark:text-cyan-400 relative z-10" />
                  </div>
                  <span className="text-base font-black text-slate-900 dark:text-white tracking-tight">IA Agent</span>
                </div>
                <button
                  onClick={() => setShowNewModal(true)}
                  className="w-9 h-9 rounded-xl flex items-center justify-center transition-all bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 hover:scale-105 shadow-sm"
                  title="Nova sessão"
                >
                  <FiPlus className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto py-3 px-3 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                {sessions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-40 gap-3">
                    <FiMessageSquare className="w-8 h-8 text-slate-400 dark:text-slate-700" />
                    <p className="text-sm font-medium text-slate-500">Nenhuma sessão ainda</p>
                  </div>
                ) : sessions.map(s => {
                  const isSelected = selected?.id === s.id;
                  return (
                  <button
                    key={s.id}
                    onClick={() => setSelected(s)}
                    className={`w-full text-left px-4 py-3.5 rounded-2xl mb-2 transition-all duration-300 border ${isSelected ? 'bg-cyan-50 dark:bg-cyan-500/10 border-cyan-200 dark:border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.05)]' : 'bg-transparent border-transparent hover:bg-slate-100 dark:hover:bg-white/5 hover:border-slate-200 dark:hover:border-white/5'}`}
                  >
                    <div className="flex items-center gap-3">
                      <FiMessageSquare className={`w-4 h-4 shrink-0 transition-colors ${isSelected ? 'text-cyan-600 dark:text-cyan-400' : 'text-slate-400 dark:text-slate-600'}`} />
                      <span className={`text-sm font-bold truncate transition-colors ${isSelected ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>{s.title}</span>
                    </div>
                    <p className={`text-[11px] font-medium mt-1 pl-7 transition-colors ${isSelected ? 'text-cyan-600/80 dark:text-cyan-400/60' : 'text-slate-500 dark:text-slate-600'}`}>{timeAgo(s.updatedAt)}</p>
                  </button>
                )})}
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
                    <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Assistente IA</h2>
                    <p className="text-base font-medium mt-2 max-w-sm text-slate-500 dark:text-slate-400">
                      Selecione uma sessão ou crie uma nova para começar.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowNewModal(true)}
                    className="flex items-center gap-3 px-6 py-3.5 rounded-2xl text-sm font-bold text-white transition-all hover:scale-105 bg-gradient-to-r from-indigo-500 to-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.4)]"
                  >
                    <FiPlus className="w-5 h-5" /> Nova sessão
                  </button>
                </div>
              ) : (
                <>
                  {/* Chat header */}
                  <div className="px-6 py-5 flex items-center gap-4 shrink-0 bg-white/40 dark:bg-slate-900/40 border-b border-slate-200 dark:border-white/5 backdrop-blur-md relative z-10">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-200 dark:border-cyan-500/20 shadow-inner">
                      <FiMessageSquare className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-base font-black text-slate-900 dark:text-white truncate tracking-tight">{selected.title}</p>
                      <p className="text-xs font-medium text-slate-500 mt-0.5">{messages.length} mensagens</p>
                    </div>
                    <button
                      onClick={() => setSelected(null)}
                      className="w-10 h-10 rounded-xl flex items-center justify-center transition-all text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10 shrink-0"
                    >
                      <FiX className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto px-4 md:px-10 py-8 flex flex-col gap-6 relative z-10 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                    {loadingMsgs ? (
                      <div className="flex items-center justify-center py-16 gap-3">
                        <div className="w-6 h-6 rounded-full border-[3px] border-cyan-500/30 border-t-cyan-500 animate-spin" />
                        <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Carregando histórico...</span>
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center flex-1 gap-4 py-16">
                        <div className="w-16 h-16 rounded-3xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 flex items-center justify-center">
                          <FiMessageSquare className="w-8 h-8 text-slate-400 dark:text-slate-600" />
                        </div>
                        <p className="text-base font-medium text-slate-500">Nenhuma mensagem. Diga olá!</p>
                      </div>
                    ) : messages.map(m => {
                      const isAgent = m.from === 'agent';
                      return (
                        <div key={m.id} className={`flex gap-4 max-w-3xl ${isAgent ? '' : 'ml-auto flex-row-reverse'}`}>
                          <div
                            className={`w-10 h-10 rounded-2xl shrink-0 flex items-center justify-center mt-1 border shadow-sm ${isAgent ? 'bg-cyan-50 dark:bg-cyan-500/10 border-cyan-200 dark:border-cyan-500/20' : 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/20'}`}
                          >
                            {isAgent
                              ? <FiCpu className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                              : <FiUser className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                            }
                          </div>
                          <div className="flex flex-col">
                            <div
                              className={`rounded-3xl px-6 py-4 text-[15px] leading-relaxed shadow-lg ${isAgent ? 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 text-slate-900 dark:text-slate-200 rounded-tl-none' : 'bg-gradient-to-br from-indigo-500 to-cyan-500 dark:from-indigo-600 dark:to-cyan-600 border border-indigo-400 dark:border-white/10 text-white rounded-tr-none'}`}
                            >
                              {m.text}
                            </div>
                            <p className={`text-xs font-medium mt-2 text-slate-400 dark:text-slate-500 ${isAgent ? 'ml-2' : 'mr-2 text-right'}`}>
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
                          {[0, 1, 2].map(i => (
                            <div key={i} className="w-2 h-2 rounded-full bg-cyan-400/60 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                          ))}
                        </div>
                      </div>
                    )}
                    <div ref={bottomRef} />
                  </div>

                  {/* Input */}
                  <div className="px-4 md:px-10 py-6 shrink-0 bg-white/60 dark:bg-slate-900/60 border-t border-slate-200 dark:border-white/5 backdrop-blur-md relative z-10">
                    <div className="max-w-4xl mx-auto relative group">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-3xl blur opacity-20 group-hover:opacity-30 transition duration-500"></div>
                      <div className="relative flex items-end gap-3 rounded-3xl px-5 py-4 bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 shadow-xl">
                        <textarea
                          ref={inputRef}
                          value={input}
                          onChange={e => setInput(e.target.value)}
                          onKeyDown={handleKeyDown}
                          disabled={sending}
                          rows={1}
                          placeholder="Escreva uma mensagem... (Enter para enviar)"
                          className="flex-1 bg-transparent text-[15px] font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none resize-none max-h-40 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent py-1"
                          style={{ lineHeight: '1.6' }}
                        />
                        <button
                          onClick={() => void handleSend()}
                          disabled={sending || !input.trim()}
                          className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-300 disabled:opacity-50 disabled:scale-100 disabled:hover:shadow-none hover:scale-105 bg-gradient-to-br from-indigo-500 to-cyan-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)]"
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

      {/* ── New session modal ── */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-xl dark:shadow-[0_0_50px_rgba(6,182,212,0.15)] relative overflow-hidden">
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-cyan-500/20 blur-[50px] rounded-full pointer-events-none" />
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2 relative z-10 tracking-tight">Nova sessão</h3>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-6 relative z-10">Dê um nome para identificar esta conversa no histórico.</p>
            <input
              autoFocus
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') void handleNewSession(); }}
              placeholder="Ex: Análise do projeto Alpha"
              className="w-full rounded-2xl px-5 py-4 text-sm font-medium text-slate-900 dark:text-white bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 outline-none transition-all focus:ring-2 focus:ring-cyan-500 focus:bg-white dark:focus:bg-white/10 placeholder-slate-400 dark:placeholder-slate-500 relative z-10 shadow-inner"
            />
            <div className="flex gap-3 mt-8 relative z-10">
              <button 
                onClick={() => setShowNewModal(false)} 
                className="flex-1 py-3.5 rounded-2xl text-sm font-bold transition-colors text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 border border-transparent hover:border-slate-300 dark:hover:border-white/10"
              >
                Cancelar
              </button>
              <button
                onClick={() => void handleNewSession()}
                className="flex-1 py-3.5 rounded-2xl text-sm font-bold text-white transition-all hover:scale-[1.02] bg-gradient-to-r from-indigo-500 to-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.3)]"
              >
                Criar sessão
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

