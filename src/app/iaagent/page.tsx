"use client";
import { useMemo, useRef, useState } from 'react';
import Header from '../../component/Header';
import Chatbot from '../../component/ChatBot';
import { FiCpu, FiTrash2, FiZap } from 'react-icons/fi';

type ChatRole = 'user' | 'assistant' | 'system';

type ChatMessage = {
  role: ChatRole;
  content: string;
};

const STARTER_QUESTIONS: { title: string; prompt: string }[] = [
  { title: 'Landing page', prompt: 'Preciso de uma landing page para meu produto — objetivo, público-alvo e CTA.' },
  { title: 'E-commerce', prompt: 'Quero uma loja online com carrinho, pagamentos e gerenciamento de produtos.' },
  { title: 'MVP', prompt: 'Ajude-me a definir o MVP para validar a ideia com o mínimo de esforço.' },
  { title: 'Integração API', prompt: 'Preciso integrar uma API externa (ex: pagamento, CRM). Quais endpoints e dados?' },
  { title: 'Automação', prompt: 'Quero automatizar tarefas repetitivas (envio de e-mails, backups, deploys). Como começar?' },
  { title: 'Design responsivo', prompt: 'Como tornar meu site bonito e funcional em mobile e desktop?' },
  { title: 'SEO básico', prompt: 'O que preciso para melhorar o SEO técnico e on-page do site?' },
  { title: 'Orçamento e prioridades', prompt: 'Como priorizar funcionalidades e estimar custo/prazo para o projeto?' },
];

export default function IAAAgentPage() {
                const [messages, setMessages] = useState<ChatMessage[]>([
                  { role: 'system', content: 'Você é um assistente de IA que ajuda a criar escopos de projetos de desenvolvimento web com base nas entradas do usuário.' },
                ]);
                const [input, setInput] = useState('');
                const [isSending, setIsSending] = useState(false);
                const [error, setError] = useState<string | null>(null);
                const bottomRef = useRef<HTMLDivElement | null>(null);  
                const canSend = useMemo(() => input.trim().length > 0 && !isSending, [input, isSending]);

                const send = async (messageContent: string) => {
                  setIsSending(true);
                  setError(null); 
                  const newMessages = [...messages, { role: 'user', content: messageContent }];
                  setMessages(newMessages);
                  setInput(''); 
                  try {
                    const response = await fetch('/api/iaagent', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ messages: newMessages }),
                    });     
                    if (!response.ok) {
                      throw new Error(`Erro na resposta: ${response.statusText}`);
                    } 
                    const data = await response.json();
                    setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
                  } catch (err) {
                    console.error('Erro ao enviar mensagem:', err);
                    setError('Houve um erro ao enviar sua mensagem. Por favor, tente novamente.');
                  } finally {
                    setIsSending(false);
                  }     
                };  
  return (
    <div className="relative">
      <Header />  
      <main className="pt-[var(--header-height)]">
        <section className="container mx-auto px-4 sm:px-6 py-10 md:py-14">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <div className="rounded-3xl bg-white border border-slate-200 dark:bg-black/10 dark:border-white/15 p-5 text-slate-900 dark:text-white shadow-sm">
                <div className="flex items-center gap-2">
                  <FiCpu className="h-5 w-5 text-slate-700 dark:text-white" aria-hidden="true" />
                  <div>
                    <h1 className="text-xl sm:text-2xl font-semibold">IA Agent</h1>
                    <p className="mt-1 text-sm text-slate-600 dark:text-white">Um chat para transformar ideias em escopos práticos de projeto.</p>
                  </div>
                </div>

                <div className="mt-4">
                  <p className="text-sm text-slate-600 mb-2">Não sabe por onde começar? Experimente uma destas perguntas:</p>
                  <div className="grid grid-cols-1 gap-2">
                    {STARTER_QUESTIONS.map((q) => (
                      <button
                        key={q.title}
                        type="button"
                        onClick={() => void send(q.prompt)}
                        className="text-left rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 px-3 py-2 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition"
                      >
                        <div>
                          <span className="text-sm font-medium">{q.title}</span>
                        </div>
                        <p className="mt-1 text-xs text-slate-500 dark:text-white/60">{q.prompt}</p>
                      </button>
                    ))}
                  </div>
                </div>

                  <div className="mt-5 rounded-2xl bg-slate-50 dark:bg-black/10 border border-slate-100 dark:border-white/10 p-4">
                  <div className="flex items-start gap-2">
                    <FiZap className="h-5 w-5 text-slate-600 dark:text-white mt-0.5" aria-hidden="true" />
                    <p className="text-xs text-slate-600 dark:text-white">
                      Dica: depois do briefing, cadastre-se para acompanhar o projeto no dashboard.
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex gap-2">
                  <a
                    href="/register"
                    className="flex-1 inline-flex items-center justify-center rounded-xl bg-indigo-600 text-white px-4 py-2.5 font-semibold hover:bg-indigo-700 transition-shadow shadow"
                  >
                    Cadastrar
                  </a>
                  <button
                    type="button"
                    onClick={() => setMessages(messages.slice(0, 1))}
                    className="inline-flex items-center justify-center rounded-xl bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/20 px-3 py-2.5 font-semibold text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-white/15 transition"
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
              <div className="rounded-3xl bg-white border border-slate-200 dark:bg-black/10 dark:border-white/15 overflow-hidden shadow-sm">
                <div className="px-5 py-4 border-b border-slate-100 dark:border-white/10 text-slate-900 dark:text-white">
                  <p className="text-sm font-semibold">Chat</p>
                  <p className="text-xs text-slate-600 dark:text-white/70">Responda com o máximo de detalhes para acelerar.</p>
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
                            ? 'max-w-[85%] rounded-2xl bg-white border border-slate-200 text-slate-900 px-4 py-3'
                            : 'max-w-[85%] rounded-2xl bg-white border border-slate-100 dark:bg-black/10 dark:border-white/15 text-slate-900 dark:text-white px-4 py-3'
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
                  className="p-4 sm:p-5 border-t border-slate-100 dark:border-white/10"
                >
                  <div className="flex gap-2">
                    <input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Escreva seu objetivo, escopo, prazo, integrações…"
                      className="flex-1 rounded-xl bg-slate-50 dark:bg-black/10 border border-slate-200 dark:border-white/15 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    />
                    <button
                      type="submit"
                      disabled={!canSend}
                      className="rounded-xl bg-indigo-600 text-white px-5 py-3 font-semibold hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Enviar
                    </button>
                  </div>
                  <p className="mt-2 text-xs text-slate-500 dark:text-white/60">
                    
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
