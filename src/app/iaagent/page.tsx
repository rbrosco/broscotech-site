'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Header from '../../component/Header';
import Chatbot from '../../component/ChatBot';
import { FiArrowUpRight, FiCpu, FiTrash2, FiZap } from 'react-icons/fi';

type ChatRole = 'user' | 'assistant' | 'system';

type ChatMessage = {
  role: ChatRole;
  content: string;
};

const STARTER_PROMPTS: ReadonlyArray<{ title: string; prompt: string }> = [
  {
    title: 'Quero um site + dashboard',
    prompt:
      'Quero um site moderno com login/cadastro e um dashboard para acompanhar o projeto. Me faça as perguntas necessárias.',
  },
  {
    title: 'Automatizar atendimento',
    prompt:
      'Quero um atendimento automatizado com IA + chatbot. Como seria a arquitetura e o fluxo ideal?',
  },
  {
    title: 'Orçamento rápido',
    prompt:
      'Me ajude a montar um briefing completo para orçamento: objetivos, páginas, integrações e prazos.',
  },
];

export default function IAAAgentPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content:
        'Sou o IA Agent da BROSCOTECH. Me diga o que você quer construir e eu organizo o briefing + próximos passos.',
    },
  ]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const canSend = useMemo(() => input.trim().length > 0 && !isSending, [input, isSending]);

  const send = async (content: string) => {
    const text = content.trim();
    if (!text) return;

    setError(null);
    setIsSending(true);

    const nextMessages: ChatMessage[] = [...messages, { role: 'user', content: text }];
    setMessages(nextMessages);
    setInput('');

    try {
      const res = await fetch('/api/iaagent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: nextMessages }),
      });

      const data = (await res.json()) as { message?: string; assistant?: string };
      if (!res.ok) {
        throw new Error(data?.message || 'Falha ao responder.');
      }

      setMessages((prev: ChatMessage[]) => [...prev, { role: 'assistant', content: data.assistant || '' }]);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Erro desconhecido.';
      setError(msg);
      setMessages((prev: ChatMessage[]) => [
        ...prev,
        {
          role: 'assistant',
          content:
            'Não consegui responder agora. Se você ainda não configurou a chave da API, configure e tente novamente.',
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div>
      <Header />

      <main className="pt-[var(--header-height)]">
        <section className="container mx-auto px-4 sm:px-6 py-10 md:py-14">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <div className="rounded-3xl bg-white/10 border border-white/15 backdrop-blur-md p-5 text-white">
                <div className="flex items-center gap-2">
                  <FiCpu className="h-5 w-5 text-white/90" aria-hidden="true" />
                  <h1 className="text-xl sm:text-2xl font-semibold">IA Agent</h1>
                </div>
                <p className="mt-2 text-sm text-white/85">
                  Um chat direto para transformar ideias em escopo: páginas, integrações, automações, prazos e prioridades.
                </p>

                <div className="mt-5 grid gap-3">
                  {STARTER_PROMPTS.map((item) => (
                    <button
                      key={item.title}
                      type="button"
                      onClick={() => send(item.prompt)}
                      className="text-left rounded-2xl bg-white/10 border border-white/15 px-4 py-3 hover:bg-white/15 transition"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-semibold">{item.title}</span>
                        <FiArrowUpRight className="h-4 w-4 text-white/80" aria-hidden="true" />
                      </div>
                      <p className="mt-1 text-xs text-white/70 line-clamp-2">{item.prompt}</p>
                    </button>
                  ))}
                </div>

                <div className="mt-5 rounded-2xl bg-black/10 border border-white/10 p-4">
                  <div className="flex items-start gap-2">
                    <FiZap className="h-5 w-5 text-white/80 mt-0.5" aria-hidden="true" />
                    <p className="text-xs text-white/80">
                      Dica: depois do briefing, cadastre-se para acompanhar o projeto no dashboard.
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex gap-2">
                  <a
                    href="/register"
                    className="flex-1 inline-flex items-center justify-center rounded-xl bg-white/90 text-slate-900 px-4 py-2.5 font-semibold hover:bg-white transition"
                  >
                    Cadastrar
                  </a>
                  <button
                    type="button"
                    onClick={() => setMessages(messages.slice(0, 1))}
                    className="inline-flex items-center justify-center rounded-xl bg-white/10 border border-white/20 px-3 py-2.5 font-semibold text-white hover:bg-white/15 transition"
                    aria-label="Limpar conversa"
                  >
                    <FiTrash2 className="h-5 w-5" aria-hidden="true" />
                  </button>
                </div>

                {error && (
                  <p className="mt-3 text-xs text-red-200 bg-red-900/20 border border-red-500/30 rounded-xl p-3">
                    {error}
                  </p>
                )}
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="rounded-3xl bg-white/10 border border-white/15 backdrop-blur-md overflow-hidden">
                <div className="px-5 py-4 border-b border-white/10 text-white">
                  <p className="text-sm font-semibold">Chat</p>
                  <p className="text-xs text-white/70">Responda com o máximo de detalhes para acelerar.</p>
                </div>

                <div className="h-[60vh] md:h-[65vh] overflow-y-auto p-4 sm:p-5 space-y-3">
                  {messages.map((m, idx) => (
                    <div
                      key={idx}
                      className={
                        m.role === 'user'
                          ? 'flex justify-end'
                          : 'flex justify-start'
                      }
                    >
                      <div
                        className={
                          m.role === 'user'
                            ? 'max-w-[85%] rounded-2xl bg-white/90 text-slate-900 px-4 py-3'
                            : 'max-w-[85%] rounded-2xl bg-white/10 border border-white/15 text-white px-4 py-3'
                        }
                      >
                        <p className="text-sm whitespace-pre-wrap leading-relaxed">{m.content}</p>
                      </div>
                    </div>
                  ))}
                  <div ref={bottomRef} />
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (canSend) void send(input);
                  }}
                  className="p-4 sm:p-5 border-t border-white/10"
                >
                  <div className="flex gap-2">
                    <input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Escreva seu objetivo, escopo, prazo, integrações…"
                      className="flex-1 rounded-xl bg-white/10 border border-white/15 text-white placeholder:text-white/50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white/20"
                    />
                    <button
                      type="submit"
                      disabled={!canSend}
                      className="rounded-xl bg-white/90 text-slate-900 px-5 py-3 font-semibold hover:bg-white transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Enviar
                    </button>
                  </div>
                  <p className="mt-2 text-xs text-white/60">
                    
                  </p>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Chatbot />
    </div>
  );
}
