'use client';
import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
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
  FiChevronLeft,
  FiExternalLink,
} from 'react-icons/fi';
import { useIAAgentChat, timeAgo } from '@/lib/hooks/useIAAgentChat';
import MarkdownMessage from '@/component/MarkdownMessage';

/**
 * Popup compacto do Agente de IA, aberto pelo botão flutuante
 * (IAAgentButton) em qualquer página do site. Reaproveita toda a lógica
 * de estado/API do hook useIAAgentChat (a mesma usada pela página
 * completa /iaagent) — comportamento idêntico, só o layout é mais
 * compacto (janela flutuante em vez de página cheia).
 */
export default function IAAgentPopup({ onClose }: { onClose: () => void }) {
  const {
    sessions, selected, messages, input, attachedImage, sending, loadingMsgs,
    authed, checkingAuth, visitor, projects, selectedProjectId,
    setSelected, setInput, setAttachedImage, setSelectedProjectId,
    handleImageUpload, submitVisitor, handleSend, handleNewSession,
  } = useIAAgentChat();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<Element | null>(null);

  const [visitorNameInput, setVisitorNameInput] = useState('');
  const [visitorEmailInput, setVisitorEmailInput] = useState('');
  const [visitorError, setVisitorError] = useState('');
  const [showSessionList, setShowSessionList] = useState(false);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  // Ao abrir, se não houver conversa selecionada mas já existirem sessões
  // (visitante recorrente ou cliente autenticado), mostra a lista em vez
  // do vazio — evita o usuário clicar duas vezes pra achar a conversa.
  useEffect(() => {
    if (!checkingAuth && !selected && sessions.length > 0) {
      setShowSessionList(true);
    }
  }, [checkingAuth, selected, sessions.length]);

  useEffect(() => {
    // Fecha o popup com ESC.
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  // Foco inicial no diálogo ao abrir; devolve o foco ao gatilho ao fechar.
  useEffect(() => {
    triggerRef.current = document.activeElement;
    const focusable = dialogRef.current?.querySelector<HTMLElement>(
      'input, textarea, button, [href], [tabindex]:not([tabindex="-1"])'
    );
    (focusable ?? dialogRef.current)?.focus();
    return () => {
      if (triggerRef.current instanceof HTMLElement) {
        triggerRef.current.focus();
      }
    };
  }, []);

  const handleVisitorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setVisitorError('');
    const err = submitVisitor(visitorNameInput, visitorEmailInput);
    if (err) setVisitorError(err);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
      inputRef.current?.focus();
    }
  };

  const onStartNewSession = async () => {
    await handleNewSession('');
    setShowSessionList(false);
  };

  return (
    <div
      className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center sm:justify-end p-0 sm:p-6 bg-slate-950/40 sm:bg-transparent backdrop-blur-sm sm:backdrop-blur-none"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Agente de IA EasyDev"
        ref={dialogRef}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:w-[400px] h-[85vh] sm:h-[600px] max-h-[85vh] rounded-t-[2rem] sm:rounded-[1.75rem] overflow-hidden flex flex-col bg-white dark:bg-[#0b1728] border border-slate-200 dark:border-white/15 shadow-2xl relative sm:mb-[4.5rem]"
      >
        {/* Header */}
        <div
          className="px-5 py-4 flex items-center gap-3 shrink-0 text-white relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #004aad, #00b09b)' }}
        >
          {showSessionList || (selected && sessions.length > 1) ? (
            <button
              onClick={() => (showSessionList ? setShowSessionList(false) : setShowSessionList(true))}
              className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-white/15 transition-colors shrink-0"
              title={showSessionList ? 'Voltar' : 'Ver conversas'}
              aria-label={showSessionList ? 'Voltar' : 'Ver conversas'}
            >
              {showSessionList ? <FiChevronLeft className="w-4 h-4" aria-hidden="true" /> : <FiMessageSquare className="w-4 h-4" aria-hidden="true" />}
            </button>
          ) : (
            <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-white/15 shrink-0">
              <FiCpu className="w-4 h-4" aria-hidden="true" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-black truncate">
              {showSessionList ? 'Suas conversas' : selected?.title || 'Agente de IA EasyDev'}
            </p>
            <p className="text-[11px] text-white/75">Atendimento inteligente 24/7</p>
          </div>
          {!showSessionList && (
            <button
              onClick={() => void onStartNewSession()}
              className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-white/15 transition-colors shrink-0"
              title="Nova conversa"
              aria-label="Nova conversa"
            >
              <FiPlus className="w-4 h-4" aria-hidden="true" />
            </button>
          )}
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-white/15 transition-colors shrink-0"
            title="Fechar"
            aria-label="Fechar chat do Agente de IA"
          >
            <FiX className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        {checkingAuth ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="w-7 h-7 rounded-full border-[3px] animate-spin border-[#00b09b] border-t-transparent" />
          </div>
        ) : !authed && !visitor ? (
          /* ── Onboarding do visitante (nome + e-mail) ── */
          <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col justify-center">
            <div className="text-center mb-5">
              <div
                className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-3 shadow-md"
                style={{ background: 'linear-gradient(135deg, #004aad, #00b09b)' }}
              >
                <FiCpu className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-base font-black text-slate-900 dark:text-white">Vamos começar seu briefing</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                Sem senha — só seu nome e e-mail para eu te ajudar com dúvidas ou estruturar seu projeto.
              </p>
            </div>

            {visitorError && (
              <div className="mb-4 p-2.5 rounded-xl bg-red-500/10 border border-red-500/25 text-red-600 dark:text-red-400 text-xs font-semibold">
                {visitorError}
              </div>
            )}

            <form onSubmit={handleVisitorSubmit} className="space-y-3">
              <input
                type="text"
                required
                autoFocus
                value={visitorNameInput}
                onChange={(e) => setVisitorNameInput(e.target.value)}
                placeholder="Seu nome completo"
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
              />
              <input
                type="email"
                required
                value={visitorEmailInput}
                onChange={(e) => setVisitorEmailInput(e.target.value)}
                placeholder="seu@email.com"
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
              />
              <button
                type="submit"
                className="w-full py-3 rounded-xl font-bold text-sm text-white shadow-md transition-all hover:opacity-90 flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, #004aad 0%, #00b09b 60%, #00d4aa 100%)' }}
              >
                Iniciar Conversa <FiArrowRight className="w-4 h-4" />
              </button>
            </form>

            <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-4">
              Já tem conta?{' '}
              <Link href="/login" className="font-bold text-[var(--color-accent)] hover:underline inline-flex items-center gap-1">
                Entrar <FiLogIn className="w-3 h-3" />
              </Link>
            </p>
          </div>
        ) : showSessionList ? (
          /* ── Lista de conversas ── */
          <div className="flex-1 overflow-y-auto p-3">
            <button
              onClick={() => void onStartNewSession()}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-bold text-white mb-3 shadow-sm"
              style={{ background: 'linear-gradient(135deg, #004aad, #00b09b)' }}
            >
              <FiPlus className="w-3.5 h-3.5" /> Nova conversa
            </button>
            {sessions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-2 text-center">
                <FiMessageSquare className="w-7 h-7 text-slate-300 dark:text-slate-700" />
                <p className="text-xs text-slate-400">Nenhuma conversa ainda</p>
              </div>
            ) : (
              sessions.map((s) => (
                <button
                  key={s.id}
                  onClick={() => { setSelected(s); setShowSessionList(false); }}
                  className={`w-full text-left px-4 py-3 rounded-xl mb-1.5 transition-colors border ${
                    selected?.id === s.id
                      ? 'bg-[var(--color-accent-dim)] border-[var(--color-accent)]/30'
                      : 'bg-slate-50 dark:bg-white/5 border-transparent hover:bg-slate-100 dark:hover:bg-white/10'
                  }`}
                >
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{s.title}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{timeAgo(s.updatedAt)}</p>
                </button>
              ))
            )}
          </div>
        ) : !selected ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6 text-center">
            <FiCpu className="w-10 h-10 text-slate-300 dark:text-slate-700" />
            <p className="text-sm text-slate-500 dark:text-slate-400">Comece uma nova conversa para falar com o Agente de IA.</p>
            <button
              onClick={() => void onStartNewSession()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-md"
              style={{ background: 'linear-gradient(135deg, #004aad, #00b09b)' }}
            >
              <FiPlus className="w-4 h-4" /> Nova conversa
            </button>
          </div>
        ) : (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4 scrollbar-thin scrollbar-thumb-white/10">
              {loadingMsgs ? (
                <div className="flex items-center justify-center py-10">
                  <div className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin border-[#00b09b]" />
                </div>
              ) : (
                messages.map((m) => {
                  const isIncoming = m.from === 'agent' || m.from === 'admin';
                  const isAdmin = m.from === 'admin';
                  return (
                    <div key={m.id} className={`flex gap-2.5 max-w-[88%] ${isIncoming ? '' : 'ml-auto flex-row-reverse'}`}>
                      <div
                        className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center mt-0.5 ${
                          isAdmin ? 'bg-amber-100 dark:bg-amber-500/15' : isIncoming ? 'bg-cyan-50 dark:bg-cyan-500/15' : 'bg-indigo-50 dark:bg-indigo-500/15'
                        }`}
                      >
                        {isAdmin ? (
                          <FiUser className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                        ) : isIncoming ? (
                          <FiCpu className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                        ) : (
                          <FiUser className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                        )}
                      </div>
                      <div
                        className={`px-3.5 py-2.5 break-words ${
                          isIncoming
                            ? 'bg-slate-100 dark:bg-white/5 text-slate-800 dark:text-slate-100 rounded-2xl rounded-tl-sm'
                            : 'text-white rounded-2xl rounded-tr-sm'
                        }`}
                        style={!isIncoming ? { background: 'linear-gradient(135deg, #004aad, #00b09b)' } : undefined}
                      >
                        {m.imageUrl && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={m.imageUrl} alt="Anexo" className="max-w-full max-h-40 rounded-lg mb-2 object-contain" />
                        )}
                        <MarkdownMessage text={m.text} inverted={!isIncoming} compact />
                      </div>
                    </div>
                  );
                })
              )}
              {sending && (
                <div className="flex gap-2.5">
                  <div className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center bg-cyan-50 dark:bg-cyan-500/15">
                    <FiCpu className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                  </div>
                  <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-slate-100 dark:bg-white/5 flex items-center gap-1.5">
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="w-1.5 h-1.5 rounded-full bg-cyan-400/60 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="px-3 py-3 shrink-0 border-t border-slate-100 dark:border-white/10">
              {attachedImage && (
                <div className="mb-2 relative inline-block">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={attachedImage} alt="Anexo" className="h-14 w-auto rounded-lg border border-slate-200 dark:border-slate-700 object-cover" />
                  <button onClick={() => setAttachedImage(null)} aria-label="Remover anexo" className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5 shadow">
                    <FiX className="w-2.5 h-2.5" aria-hidden="true" />
                  </button>
                </div>
              )}
              <div className="flex items-end gap-1.5 rounded-2xl px-3 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageUpload} />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={sending}
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors"
                  title="Anexar imagem"
                  aria-label="Anexar imagem"
                >
                  <FiImage className="w-4 h-4" aria-hidden="true" />
                </button>
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value);
                    e.target.style.height = '36px';
                    e.target.style.height = `${e.target.scrollHeight}px`;
                  }}
                  onKeyDown={handleKeyDown}
                  disabled={sending}
                  rows={1}
                  placeholder="Escreva sua mensagem..."
                  className="flex-1 bg-transparent text-sm text-slate-900 dark:text-white placeholder:text-slate-400 outline-none resize-none max-h-24 py-1.5"
                  style={{ minHeight: '36px', height: '36px' }}
                />
                <button
                  onClick={() => void handleSend()}
                  disabled={sending || (!input.trim() && !attachedImage)}
                  aria-label="Enviar mensagem"
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-white transition-all disabled:opacity-40"
                  style={{ background: 'linear-gradient(135deg, #004aad, #00b09b)' }}
                >
                  {sending ? <FiLoader className="w-4 h-4 animate-spin" aria-hidden="true" /> : <FiSend className="w-4 h-4" aria-hidden="true" />}
                </button>
              </div>
            </div>
          </>
        )}

        {/* Footer link to full page */}
        {!checkingAuth && (authed || visitor) && !showSessionList && (
          <Link
            href="/iaagent"
            className="px-4 py-2 text-[11px] text-center text-slate-400 hover:text-[var(--color-accent)] transition-colors border-t border-slate-100 dark:border-white/5 flex items-center justify-center gap-1 shrink-0"
          >
            Abrir conversa completa <FiExternalLink className="w-2.5 h-2.5" />
          </Link>
        )}
      </div>
    </div>
  );
}
