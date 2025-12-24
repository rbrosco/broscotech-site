"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardNav from '@/component/DashboardNav';
import DashboardSidebar from '@/component/DashboardSidebar';

type Session = {
  id: string;
  title: string;
  updatedAt: string;
};

type Message = {
  id: string;
  text: string;
  from: 'client' | 'agent';
  timestamp: string;
};

export default function IAAgentPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // placeholder: load sessions
    void (async () => {
      try {
        const res = await fetch('/api/iaagent/sessions', { credentials: 'include' });
        if (!res.ok) {
          // fallback demo data
          setSessions([{ id: 'demo-1', title: 'Sessão Cliente A', updatedAt: new Date().toISOString() }]);
          return;
        }
        const payload = await res.json();
        setSessions(payload.sessions || []);
      } catch {
        setSessions([{ id: 'demo-1', title: 'Sessão Cliente A', updatedAt: new Date().toISOString() }]);
      }
    })();
  }, []);

  useEffect(() => {
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem('userData') : null;
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.role && String(parsed.role).toLowerCase() === 'admin') {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      }
    } catch {
      setIsAdmin(false);
    }
  }, []);

  useEffect(() => {
    if (!selectedSession) return;
    // load messages for selected session
    void (async () => {
      try {
        const res = await fetch(`/api/iaagent/sessions/${selectedSession.id}/messages`, { credentials: 'include' });
        if (!res.ok) {
          setMessages([
            { id: 'm1', text: 'Olá, como posso ajudar?', from: 'agent', timestamp: new Date().toISOString() },
            { id: 'm2', text: 'Tenho um problema com o login', from: 'client', timestamp: new Date().toISOString() },
          ]);
          return;
        }
        const payload = await res.json();
        setMessages(payload.messages || []);
      } catch {
        setMessages([
          { id: 'm1', text: 'Olá, como posso ajudar?', from: 'agent', timestamp: new Date().toISOString() },
          { id: 'm2', text: 'Tenho um problema com o login', from: 'client', timestamp: new Date().toISOString() },
        ]);
      }
    })();
  }, [selectedSession]);

  return (
    <div className="w-full relative flex bg-blueGray-100 dark:bg-gray-900 min-h-screen">
      <DashboardSidebar />
      <div className="relative md:ml-64 bg-blueGray-100 dark:bg-gray-900 w-full min-w-0 flex-1">
        <DashboardNav />
        <div className="px-4 md:px-6 mx-auto w-full pt-24 pb-10 min-w-0">
          <div className="rounded-3xl bg-white/90 dark:bg-gray-800/80 backdrop-blur-md border border-white/20 dark:border-gray-700/50 shadow-2xl p-5 sm:p-6 min-w-0">
            {!isAdmin ? (
              <div className="p-8 text-center">
                <h2 className="text-xl font-semibold mb-2 text-slate-900 dark:text-white">Acesso restrito</h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">Esta área é visível apenas para usuários administradores.</p>
                <div className="flex items-center justify-center gap-3">
                  <button onClick={() => router.push('/dashboard')} className="px-4 py-2 rounded-lg bg-slate-900 text-white">Voltar ao Dashboard</button>
                </div>
              </div>
            ) : (
              <>
                <h1 className="text-2xl font-semibold mb-4 text-slate-900 dark:text-white">IA Agent — Sessões</h1>
                <div className="flex gap-4">
                  <aside className="w-72 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-lg p-3">
                    <div className="mb-3 flex items-center justify-between">
                      <strong className="text-sm">Sessões</strong>
                      <button className="text-xs text-slate-500">Novo</button>
                    </div>
                    <div className="space-y-2 overflow-y-auto max-h-[60vh]">
                      {sessions.map((s) => (
                        <div key={s.id} onClick={() => setSelectedSession(s)} className={`p-3 rounded-md cursor-pointer ${selectedSession?.id === s.id ? 'bg-slate-100 dark:bg-gray-800' : ''}`}>
                          <div className="text-sm font-medium text-slate-800 dark:text-white">{s.title}</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">{new Date(s.updatedAt).toLocaleString()}</div>
                        </div>
                      ))}
                      {sessions.length === 0 && <div className="text-sm text-slate-500">Nenhuma sessão</div>}
                    </div>
                  </aside>

                  <main className="flex-1 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-lg p-4 flex flex-col">
                    <div className="flex-1 overflow-y-auto mb-3">
                      {!selectedSession ? (
                        <div className="text-slate-500">Selecione uma sessão à esquerda para ver as conversas.</div>
                      ) : (
                        <div className="space-y-3">
                          {messages.map((m) => (
                            <div key={m.id} className={`p-3 rounded-lg ${m.from === 'agent' ? 'bg-slate-100 self-start' : 'bg-blue-50 self-end'} max-w-xl`}> 
                              <div className="text-sm text-slate-800 dark:text-white">{m.text}</div>
                              <div className="text-xs text-slate-400 mt-1">{new Date(m.timestamp).toLocaleString()}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="mt-auto">
                      <div className="flex gap-2">
                        <input className="flex-1 rounded-lg border px-3 py-2 bg-white dark:bg-gray-800" placeholder="Digite mensagem..." />
                        <button className="px-4 py-2 rounded-lg bg-slate-900 text-white">Enviar</button>
                      </div>
                    </div>
                  </main>
                </div>
              </>
            )}
            </div>
          </div>
        </div>
      </div>
  );          
}   
