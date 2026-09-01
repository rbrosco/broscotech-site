'use client';

import React, { useEffect, useRef, useState } from 'react';

export type LeadInterest = {
  /** 'service' (cards de Serviços) ou 'portfolio' (cards de Portfólio). */
  type: 'service' | 'portfolio';
  /** id estável do item (ex: service.id ou project.id), para relatórios. */
  id: string;
  /** título legível exibido ao usuário e salvo no lead (ex: nome do serviço/projeto). */
  label: string;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  /** Serviço ou projeto que o usuário escolheu ao abrir o modal. */
  interest: LeadInterest | null;
};

type Status = 'idle' | 'submitting' | 'success' | 'error';

const ContactFormModal: React.FC<Props> = ({ isOpen, onClose, interest }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const nameInputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<Element | null>(null);

  // Reseta o formulário toda vez que o modal é reaberto para um novo interesse.
  useEffect(() => {
    if (isOpen) {
      setName('');
      setPhone('');
      setEmail('');
      setMessage('');
      setStatus('idle');
      setErrorMsg('');
    }
  }, [isOpen, interest?.id]);

  // Foco inicial no primeiro campo e devolução de foco ao fechar.
  useEffect(() => {
    if (isOpen) {
      triggerRef.current = document.activeElement;
      setTimeout(() => nameInputRef.current?.focus(), 50);
    } else if (triggerRef.current instanceof HTMLElement) {
      triggerRef.current.focus();
    }
  }, [isOpen]);

  // Fecha com Escape.
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    setStatus('submitting');
    setErrorMsg('');

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim() || undefined,
          message: message.trim() || undefined,
          interest_type: interest?.type ?? 'service',
          interest_id: interest?.id,
          interest_label: interest?.label,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.message || 'Não foi possível enviar sua solicitação.');
      }

      setStatus('success');
    } catch (err) {
      setStatus('error');
      setErrorMsg(err instanceof Error ? err.message : 'Erro inesperado. Tente novamente.');
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[200] overflow-y-auto px-4 py-10"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="contact-form-modal-title"
        className="bg-white p-6 sm:p-8 rounded-2xl shadow-2xl w-full max-w-md dark:bg-slate-900 dark:text-white border border-black/5 dark:border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        {status === 'success' ? (
          <div className="text-center py-6">
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-2xl mb-4" aria-hidden="true">
              ✓
            </div>
            <h3 id="contact-form-modal-title" className="text-xl font-bold mb-2">Solicitação enviada!</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Recebemos seu interesse em{' '}
              <strong className="text-slate-700 dark:text-slate-200">{interest?.label ?? 'um projeto'}</strong>.
              Nossa equipe vai entrar em contato em breve pelo telefone informado.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-6 w-full bg-[#00b09b] hover:bg-[#009b88] text-white px-6 py-2.5 rounded-lg font-semibold transition-all"
            >
              Fechar
            </button>
          </div>
        ) : (
          <>
            <h3 id="contact-form-modal-title" className="text-2xl font-bold text-center mb-1 text-slate-900 dark:text-white">
              Solicitar Proposta
            </h3>
            {interest?.label && (
              <p className="text-center text-sm text-[#00b09b] font-semibold mb-6">
                Interesse: {interest.label}
              </p>
            )}
            {!interest?.label && <div className="mb-6" />}

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="lead-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Nome
                </label>
                <input
                  type="text"
                  id="lead-name"
                  name="name"
                  required
                  ref={nameInputRef}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all"
                  placeholder="Digite seu nome completo"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="lead-phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Telefone (WhatsApp)
                </label>
                <input
                  type="tel"
                  id="lead-phone"
                  name="phone"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all"
                  placeholder="(00) 00000-0000"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="lead-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  E-mail (opcional)
                </label>
                <input
                  type="email"
                  id="lead-email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all"
                  placeholder="exemplo@dominio.com"
                />
              </div>
              <div className="mb-2">
                <label htmlFor="lead-message" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Conte um pouco mais (opcional)
                </label>
                <textarea
                  id="lead-message"
                  name="message"
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all"
                  placeholder="Descreva seu projeto, necessidades, prazos..."
                />
              </div>

              {status === 'error' && (
                <p className="text-sm text-red-500 mt-2">{errorMsg}</p>
              )}

              <div className="flex flex-col sm:flex-row justify-between gap-3 mt-6">
                <button
                  type="submit"
                  disabled={status === 'submitting'}
                  className="w-full sm:w-auto bg-[#00b09b] text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-[#009b88] focus:outline-none focus:ring-2 focus:ring-[#00b09b] focus:ring-offset-2 dark:focus:ring-offset-slate-900 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {status === 'submitting' ? 'Enviando...' : 'Enviar Solicitação'}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto bg-gray-100 text-gray-700 px-6 py-2.5 rounded-lg font-medium hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-all"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ContactFormModal;
