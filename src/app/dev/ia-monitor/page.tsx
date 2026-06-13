'use client';
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { FiSend, FiMessageSquare, FiX, FiCpu, FiUser, FiLoader, FiCheckCircle } from 'react-icons/fi';
import DevSidebar from '@/component/DevSidebar';
import DashboardNav from '@/component/DashboardNav';

type Session = { id: string; title: string; updatedAt: string };
type Message = { id: string; text: string; from: 'client' | 'agent' | 'admin'; timestamp: string };

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'agora';
  if (m < 60) return `${m}m atrás`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h atrás`;
  return new Date(iso).toLocaleDateString('pt-BR');
}

export default function IAMonitorPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selected, setSelected] = useState<Session | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const loadSessions = useCallback(async () => {
    try {
      const res = await fetch('/api/iaagent/sessions', { credentials: 'include' });
      if (res.ok) {
        const p = await res.json() as { sessions?: Session[] };
        setSessions(p.sessions ?? []);
      }
    } catch {}
  }, []);

  useEffect(() => { void loadSessions(); }, [loadSessions]);

  // Load messages for selected session
  const loadMessages = useCallback(async () => {
    if (!selected) { setMessages([]); return; }
    setLoadingMsgs(true);
    try {
      const res = await fetch(`/api/iaagent/sessions/${selected.id}/messages`, { credentials: 'include' });
      if (res.ok) {
        const p = await res.json() as { messages?: Message[] };
        setMessages(p.messages ?? []);
      }
    } catch {}
    setLoadingMsgs(false);
  }, [selected]);

  useEffect(() => { void loadMessages(); }, [loadMessages]);

  // Polling for real-time updates (since we are monitoring)
  useEffect(() => {
    if (!selected) return;
    const interval = setInterval(() => {
      fetch(`/api/iaagent/sessions/${selected.id}/messages`, { credentials: 'include' })
        .then(res => res.json())
        .then(p => setMessages(p.messages ?? []))
        .catch(() => {});
    }, 5000);
    return () => clearInterval(interval);
  }, [selected]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || !selected || sending) return;
    setInput('');
    setSending(true);

    const adminMsg: Message = { id: crypto.randomUUID(), text, from: 'admin', timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, adminMsg]);

    try {
      await fetch(`/api/iaagent/sessions/${selected.id}/messages`, {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, from: 'admin' }),
      });
      await loadSessions(); 
    } catch {
      // Revert optimistic update on failure could be implemented here
    }
    setSending(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void handleSend(); }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-200 selection:bg-cyan-500/30 flex overflow-hidden">
      <DevSidebar />
      <div className="md:pl-sidebar transition-[padding] duration-300 flex flex-col w-full h-screen">
        <DashboardNav />

        <div className="flex flex-1 overflow-hidden pt-[65px]">

            {/* Sessions sidebar */}
            <aside className="w-80 shrink-0 flex-col overflow-hidden hidden md:flex bg-white/50 dark:bg-slate-900/40 border-r border-slate-200 dark:border-white/5 backdrop-blur-xl relative z-10">
              <div className="px-6 py-5 flex items-center justify-between shrink-0 border-b border-slate-200 dark:border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.15)] relative overflow-hidden group">
                     <div className="absolute inset-0 bg-amber-400/20 blur-md group-hover:bg-amber-400/30 transition-colors" />
                     <FiMessageSquare className="w-4 h-4 text-amber-600 dark:text-amber-400 relative z-10" />
                  </div>
                  <span className="text-base font-black text-slate-900 dark:text-white tracking-tight">Monitor IA</span>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto py-3 px-3 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                {sessions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-40 gap-3">
                    <FiMessageSquare className="w-8 h-8 text-slate-400 dark:text-slate-700" />
                    <p className="text-sm font-medium text-slate-500">Nenhuma sessão ativa</p>
                  </div>
                ) : sessions.map(s => {
                  const isSelected = selected?.id === s.id;
                  return (
                  <button
                    key={s.id}
                    onClick={() => setSelected(s)}
                    className={`w-full text-left px-4 py-3.5 rounded-2xl mb-2 transition-all duration-300 border ${isSelected ? 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.05)]' : 'bg-transparent border-transparent hover:bg-slate-100 dark:hover:bg-white/5 hover:border-slate-200 dark:hover:border-white/5'}`}
                  >
                    <div className="flex items-center gap-3">
                      <FiUser className={`w-4 h-4 shrink-0 transition-colors ${isSelected ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400 dark:text-slate-600'}`} />
                      <span className={`text-sm font-bold truncate transition-colors ${isSelected ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>{s.title}</span>
                    </div>
                    <p className={`text-[11px] font-medium mt-1 pl-7 transition-colors ${isSelected ? 'text-amber-600/80 dark:text-amber-400/60' : 'text-slate-500 dark:text-slate-600'}`}>{timeAgo(s.updatedAt)}</p>
                  </button>
                )})}
              </div>
            </aside>

            {/* Chat area */}
            <div className="flex-1 flex flex-col overflow-hidden min-w-0 bg-slate-50/50 dark:bg-slate-950/50 relative">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-900/10 via-slate-950/0 to-cyan-900/5 pointer-events-none" />
              
              {!selected ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-6 px-6 relative z-10">
                  <div className="w-24 h-24 rounded-[2rem] flex items-center justify-center bg-gradient-to-br from-amber-600/20 to-orange-500/20 border border-slate-200 dark:border-white/5 shadow-[0_0_40px_rgba(245,158,11,0.15)] relative group">
                    <div className="absolute inset-0 bg-amber-400/20 blur-xl rounded-[2rem] group-hover:bg-amber-400/30 transition-colors duration-500" />
                    <FiMessageSquare className="w-10 h-10 text-amber-600 dark:text-amber-400 relative z-10" />
                  </div>
                  <div className="text-center">
                    <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Monitor IA</h2>
                    <p className="text-base font-medium mt-2 max-w-sm text-slate-500 dark:text-slate-400">
                      Selecione uma sessão para acompanhar as conversas e intervir se necessário.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Chat header */}
                  <div className="px-6 py-5 flex items-center gap-4 shrink-0 bg-white/40 dark:bg-slate-900/40 border-b border-slate-200 dark:border-white/5 backdrop-blur-md relative z-10">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 shadow-inner">
                      <FiUser className="w-5 h-5 text-amber-600 dark:text-amber-400" />
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
                        <div className="w-6 h-6 rounded-full border-[3px] border-amber-500/30 border-t-amber-500 animate-spin" />
                        <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Carregando histórico...</span>
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center flex-1 gap-4 py-16">
                        <div className="w-16 h-16 rounded-3xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 flex items-center justify-center">
                          <FiMessageSquare className="w-8 h-8 text-slate-400 dark:text-slate-600" />
                        </div>
                        <p className="text-base font-medium text-slate-500">Nenhuma mensagem nesta sessão.</p>
                      </div>
                    ) : messages.map(m => {
                      // No monitor, o admin vê as mensagens do cliente na esquerda (ou direita) e do agente na outra
                      // Vamos colocar as mensagens do CLIENTE na esquerda (pois o admin está monitorando o cliente)
                      // E as mensagens do AGENTE na direita (como se fossem as respostas enviadas pelo admin/agente)
                      const isAgent = m.from === 'agent';
                      return (
                        <div key={m.id} className={`flex gap-4 max-w-3xl ${isAgent ? 'ml-auto flex-row-reverse' : ''}`}>
                          <div
                            className={`w-10 h-10 rounded-2xl shrink-0 flex items-center justify-center mt-1 border shadow-sm ${!isAgent ? 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/20' : 'bg-cyan-50 dark:bg-cyan-500/10 border-cyan-200 dark:border-cyan-500/20'}`}
                          >
                            {!isAgent
                              ? <FiUser className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                              : <FiCpu className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                            }
                          </div>
                          <div className="flex flex-col">
                            <div
                              className={`rounded-3xl px-6 py-4 text-[15px] leading-relaxed shadow-lg ${!isAgent ? 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 text-slate-900 dark:text-slate-200 rounded-tl-none' : 'bg-gradient-to-br from-indigo-500 to-cyan-500 dark:from-indigo-600 dark:to-cyan-600 border border-indigo-400 dark:border-white/10 text-white rounded-tr-none'}`}
                            >
                              {m.text}
                            </div>
                            <p className={`text-xs font-medium mt-2 text-slate-400 dark:text-slate-500 ${!isAgent ? 'ml-2' : 'mr-2 text-right'}`}>
                              {new Date(m.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} {isAgent ? '(Agente/Admin)' : '(Cliente)'}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    {sending && (
                      <div className="flex gap-4 max-w-3xl ml-auto flex-row-reverse">
                        <div className="w-10 h-10 rounded-2xl shrink-0 flex items-center justify-center mt-1 bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-200 dark:border-cyan-500/20 shadow-sm">
                          <FiCpu className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                        </div>
                        <div className="rounded-3xl rounded-tr-none px-6 py-5 flex items-center gap-2 bg-gradient-to-br from-indigo-500 to-cyan-500 dark:from-indigo-600 dark:to-cyan-600 border border-indigo-400 dark:border-white/10 shadow-lg">
                          {[0, 1, 2].map(i => (
                            <div key={i} className="w-2 h-2 rounded-full bg-white animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                          ))}
                        </div>
                      </div>
                    )}
                    <div ref={bottomRef} />
                  </div>

                  {/* Input */}
                  <div className="px-4 md:px-10 py-6 shrink-0 bg-white/60 dark:bg-slate-900/60 border-t border-slate-200 dark:border-white/5 backdrop-blur-md relative z-10">
                    <div className="max-w-4xl mx-auto relative group">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500 to-orange-500 rounded-3xl blur opacity-20 group-hover:opacity-30 transition duration-500"></div>
                      <div className="relative flex items-end gap-3 rounded-3xl px-5 py-4 bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 shadow-xl">
                        <textarea
                          ref={inputRef}
                          value={input}
                          onChange={e => setInput(e.target.value)}
                          onKeyDown={handleKeyDown}
                          disabled={sending}
                          rows={1}
                          placeholder="Assuma o controle e responda como IA... (Enter para enviar)"
                          className="flex-1 bg-transparent text-[15px] font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none resize-none max-h-40 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent py-1"
                          style={{ lineHeight: '1.6' }}
                        />
                        <button
                          onClick={() => void handleSend()}
                          disabled={sending || !input.trim()}
                          className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-300 disabled:opacity-50 disabled:scale-100 disabled:hover:shadow-none hover:scale-105 bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_30px_rgba(245,158,11,0.5)]"
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
    </div>
  );
}
