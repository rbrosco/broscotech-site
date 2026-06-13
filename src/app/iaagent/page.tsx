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
      <div style={{ minHeight: '100vh', background: '#0a0f1e' }}>
        <Sidebar />
        <div className="md:pl-64 flex items-center justify-center min-h-screen">
          <div className="w-6 h-6 rounded-full border-2 animate-spin" style={{ borderColor: '#00b09b', borderTopColor: 'transparent' }} />
        </div>
      </div>
    );
  }

  if (!authed) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0f1e' }}>
        <Sidebar />
        <div className="md:pl-64 flex flex-col min-h-screen">
          <DashboardNav />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(239,68,68,0.1)' }}>
                <FiCpu className="w-8 h-8 text-red-400" />
              </div>
              <h2 className="text-lg font-bold text-white">Faça login para continuar</h2>
              <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>Você precisa estar autenticado.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0f1e' }}>
      <Sidebar />
      <div className="md:pl-64 flex flex-col" style={{ minHeight: '100vh' }}>
        <DashboardNav />

        <div className="flex flex-1 overflow-hidden" style={{ height: 'calc(100vh - 73px)', paddingTop: '73px' }}>

            {/* Sessions sidebar */}
            <aside
              className="w-72 shrink-0 flex-col overflow-hidden hidden md:flex"
              style={{ background: 'rgba(255,255,255,0.025)', borderRight: '1px solid rgba(255,255,255,0.07)' }}
            >
              <div className="px-4 py-4 flex items-center justify-between shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(0,176,155,0.15)' }}>
                    <FiCpu className="w-4 h-4" style={{ color: '#00b09b' }} />
                  </div>
                  <span className="text-sm font-bold text-white">IA Agent</span>
                </div>
                <button
                  onClick={() => setShowNewModal(true)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center transition hover:bg-white/10"
                  style={{ background: 'rgba(0,176,155,0.12)', color: '#00b09b' }}
                  title="Nova sessão"
                >
                  <FiPlus className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto py-2 px-2">
                {sessions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-32 gap-2">
                    <FiMessageSquare className="w-6 h-6" style={{ color: 'rgba(255,255,255,0.15)' }} />
                    <p className="text-xs text-center" style={{ color: 'rgba(255,255,255,0.25)' }}>Nenhuma sessão ainda</p>
                  </div>
                ) : sessions.map(s => (
                  <button
                    key={s.id}
                    onClick={() => setSelected(s)}
                    className="w-full text-left px-3 py-2.5 rounded-xl mb-1 transition-all"
                    style={{
                      background: selected?.id === s.id ? 'rgba(0,176,155,0.12)' : 'transparent',
                      border: `1px solid ${selected?.id === s.id ? 'rgba(0,176,155,0.2)' : 'transparent'}`,
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <FiMessageSquare className="w-3.5 h-3.5 shrink-0" style={{ color: selected?.id === s.id ? '#00b09b' : 'rgba(255,255,255,0.3)' }} />
                      <span className="text-xs font-semibold truncate" style={{ color: selected?.id === s.id ? 'white' : 'rgba(255,255,255,0.65)' }}>{s.title}</span>
                    </div>
                    <p className="text-[10px] mt-0.5 pl-[22px]" style={{ color: 'rgba(255,255,255,0.25)' }}>{timeAgo(s.updatedAt)}</p>
                  </button>
                ))}
              </div>
            </aside>

            {/* Chat area */}
            <div className="flex-1 flex flex-col overflow-hidden min-w-0">
              {!selected ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-5 px-4">
                  <div
                    className="w-20 h-20 rounded-3xl flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, rgba(0,74,173,0.2), rgba(0,176,155,0.2))', border: '1px solid rgba(0,176,155,0.2)' }}
                  >
                    <FiCpu className="w-10 h-10" style={{ color: '#00b09b' }} />
                  </div>
                  <div className="text-center">
                    <h2 className="text-xl font-extrabold text-white">Assistente IA</h2>
                    <p className="text-sm mt-1.5 max-w-xs" style={{ color: 'rgba(255,255,255,0.38)' }}>
                      Selecione uma sessão ou crie uma nova para começar.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowNewModal(true)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition hover:opacity-90"
                    style={{ background: 'linear-gradient(135deg,#004aad,#00b09b)', boxShadow: '0 0 20px rgba(0,176,155,0.2)' }}
                  >
                    <FiPlus className="w-4 h-4" /> Nova sessão
                  </button>
                </div>
              ) : (
                <>
                  {/* Chat header */}
                  <div
                    className="px-5 py-3.5 flex items-center gap-3 shrink-0"
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)' }}
                  >
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(0,176,155,0.15)' }}>
                      <FiMessageSquare className="w-4 h-4" style={{ color: '#00b09b' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white truncate">{selected.title}</p>
                      <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.3)' }}>{messages.length} mensagens</p>
                    </div>
                    <button
                      onClick={() => setSelected(null)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center transition hover:bg-white/10 shrink-0"
                      style={{ color: 'rgba(255,255,255,0.3)' }}
                    >
                      <FiX className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto px-4 md:px-8 py-5 flex flex-col gap-3">
                    {loadingMsgs ? (
                      <div className="flex items-center justify-center py-12 gap-2">
                        <div className="w-5 h-5 rounded-full border-2 animate-spin" style={{ borderColor: '#00b09b', borderTopColor: 'transparent' }} />
                        <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>Carregando...</span>
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center flex-1 gap-2 py-12">
                        <FiMessageSquare className="w-8 h-8" style={{ color: 'rgba(255,255,255,0.1)' }} />
                        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.25)' }}>Nenhuma mensagem. Diga olá!</p>
                      </div>
                    ) : messages.map(m => {
                      const isAgent = m.from === 'agent';
                      return (
                        <div key={m.id} className={`flex gap-2.5 max-w-2xl ${isAgent ? '' : 'ml-auto flex-row-reverse'}`}>
                          <div
                            className="w-7 h-7 rounded-xl shrink-0 flex items-center justify-center mt-0.5"
                            style={{ background: isAgent ? 'rgba(0,176,155,0.15)' : 'rgba(0,74,173,0.2)' }}
                          >
                            {isAgent
                              ? <FiCpu className="w-3.5 h-3.5" style={{ color: '#00b09b' }} />
                              : <FiUser className="w-3.5 h-3.5" style={{ color: '#60a5fa' }} />
                            }
                          </div>
                          <div>
                            <div
                              className="rounded-2xl px-4 py-3 text-sm leading-relaxed"
                              style={isAgent
                                ? { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.85)' }
                                : { background: 'linear-gradient(135deg,rgba(0,74,173,0.4),rgba(0,176,155,0.3))', border: '1px solid rgba(0,176,155,0.2)', color: 'white' }
                              }
                            >
                              {m.text}
                            </div>
                            <p className={`text-[10px] mt-1 ${isAgent ? '' : 'text-right'}`} style={{ color: 'rgba(255,255,255,0.2)' }}>
                              {new Date(m.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    {sending && (
                      <div className="flex gap-2.5 max-w-2xl">
                        <div className="w-7 h-7 rounded-xl shrink-0 flex items-center justify-center" style={{ background: 'rgba(0,176,155,0.15)' }}>
                          <FiCpu className="w-3.5 h-3.5" style={{ color: '#00b09b' }} />
                        </div>
                        <div className="rounded-2xl px-4 py-3 flex items-center gap-1.5" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                          {[0, 1, 2].map(i => (
                            <div key={i} className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: '#00b09b', animationDelay: `${i * 0.15}s` }} />
                          ))}
                        </div>
                      </div>
                    )}
                    <div ref={bottomRef} />
                  </div>

                  {/* Input */}
                  <div className="px-4 md:px-8 py-4 shrink-0" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                    <div
                      className="flex items-end gap-3 rounded-2xl px-4 py-3"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                    >
                      <textarea
                        ref={inputRef}
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={sending}
                        rows={1}
                        placeholder="Escreva uma mensagem... (Enter para enviar)"
                        className="flex-1 bg-transparent text-sm text-white placeholder:text-white/25 outline-none resize-none max-h-32"
                        style={{ lineHeight: '1.5' }}
                      />
                      <button
                        onClick={() => void handleSend()}
                        disabled={sending || !input.trim()}
                        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition hover:opacity-90 disabled:opacity-30"
                        style={{ background: 'linear-gradient(135deg,#004aad,#00b09b)' }}
                      >
                        {sending ? <FiLoader className="w-4 h-4 text-white animate-spin" /> : <FiSend className="w-4 h-4 text-white" />}
                      </button>
                    </div>
                    <p className="text-[10px] text-center mt-2" style={{ color: 'rgba(255,255,255,0.15)' }}>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}>
          <div className="w-full max-w-sm rounded-2xl p-6" style={{ background: '#111827', border: '1px solid rgba(0,176,155,0.25)', boxShadow: '0 0 40px rgba(0,74,173,0.2)' }}>
            <h3 className="text-base font-extrabold text-white mb-1">Nova sessão</h3>
            <p className="text-xs mb-4" style={{ color: 'rgba(255,255,255,0.35)' }}>Dê um nome para identificar esta conversa</p>
            <input
              autoFocus
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') void handleNewSession(); }}
              placeholder="Ex: Suporte cliente João"
              className="w-full rounded-xl px-3 py-2.5 text-sm text-white outline-none transition focus:ring-1 focus:ring-[#00b09b]"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
            />
            <div className="flex gap-2 mt-4">
              <button onClick={() => setShowNewModal(false)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition hover:bg-white/10" style={{ color: 'rgba(255,255,255,0.45)' }}>
                Cancelar
              </button>
              <button
                onClick={() => void handleNewSession()}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition hover:opacity-90"
                style={{ background: 'linear-gradient(135deg,#004aad,#00b09b)' }}
              >
                Criar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

