'use client';
import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FiX, FiLock, FiMail, FiEye, FiEyeOff, FiArrowRight, FiCpu } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { safeJson } from "@/lib/apiResponse";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export default function LoginModal({ isOpen, onClose }: Props) {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<Element | null>(null);

  useEffect(() => {
    if (isOpen) {
      triggerRef.current = document.activeElement;
      setTimeout(() => inputRef.current?.focus(), 100);
    } else if (triggerRef.current instanceof HTMLElement) {
      triggerRef.current.focus();
    }
  }, [isOpen]);

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
    setError("");
    const idTrim = (identifier ?? '').trim();
    const pwTrim = (password ?? '').trim();
    if (!idTrim || !pwTrim) {
      setError("Preencha todos os campos.");
      return;
    }
    const identifierToSend = idTrim.includes('@') ? idTrim.toLowerCase() : idTrim;
    setIsLoading(true);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify({ identifier: identifierToSend, password: pwTrim }),
      });

      const data = await safeJson<{ message?: string; user?: unknown }>(res);
      if (!res.ok) {
        setError(data?.message || "Usuário ou senha inválidos.");
        setIsLoading(false);
        return;
      }
      if (!data) {
        setError("O servidor retornou uma resposta inesperada. Tente novamente em instantes.");
        setIsLoading(false);
        return;
      }

      if (data.user) {
        try { localStorage.setItem('isLoggedIn', 'true'); } catch {}
        try { localStorage.setItem('userData', JSON.stringify(data.user)); } catch {}
      }

      onClose();
      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Box */}
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 16 }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-modal-title"
        className="relative w-full max-w-md bg-white/95 dark:bg-[#071324]/95 rounded-[2rem] shadow-2xl border border-black/10 dark:border-white/15 p-6 sm:p-8 backdrop-blur-2xl z-10 overflow-hidden"
      >
        {/* Decorative corner */}
        <div className="absolute top-4 left-4 text-[10px] font-mono text-[var(--color-accent)]/60 select-none">AUTH.SYS</div>

        <button
          aria-label="Fechar"
          className="absolute right-4 top-4 p-2 rounded-full text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-white/10 transition-colors"
          onClick={onClose}
        >
          <FiX className="w-4 h-4" />
        </button>

        {/* Brand */}
        <div className="text-center mb-6 pt-2">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <span className="font-pixel text-xs sm:text-sm tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-accent-600)] to-[var(--color-accent)]">
              EasyDev
            </span>
            <span className="font-pixel text-[9px] px-1 py-0.5 rounded bg-cyan-500/10 text-cyan-500 dark:bg-cyan-400/20 dark:text-cyan-300 border border-cyan-500/30 uppercase">
              CRM
            </span>
          </div>
          <h3 id="login-modal-title" className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Acessar Conta
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Entre para acompanhar seus projetos e Kanban.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 text-xs font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-500/20 rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
              Usuário ou E-mail
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <FiMail className="w-4 h-4" />
              </div>
              <input
                ref={inputRef}
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                placeholder="seu_usuario ou email@exemplo.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
              Senha
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <FiLock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                placeholder="Sua senha"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                aria-pressed={showPassword}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:text-slate-300"
              >
                {showPassword ? <FiEyeOff className="w-4 h-4" aria-hidden="true" /> : <FiEye className="w-4 h-4" aria-hidden="true" />}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl font-bold text-sm text-white shadow-lg transition-all hover:scale-[1.01] hover:opacity-95 disabled:opacity-50 flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg, #004aad 0%, #00b09b 60%, #00d4aa 100%)' }}
            >
              {isLoading ? "Autenticando..." : "Entrar no Sistema"}
            </button>
          </div>
        </form>

        <div className="mt-5 pt-4 border-t border-slate-200 dark:border-white/10 text-center space-y-2.5">
          <button
            type="button"
            onClick={() => {
              onClose();
              router.push('/register');
            }}
            className="text-xs text-slate-600 dark:text-slate-400 hover:text-[var(--color-accent)] font-medium"
          >
            Não tem uma conta? <span className="font-bold text-[var(--color-accent)] underline">Criar conta</span>
          </button>

          <div>
            <button
              type="button"
              onClick={() => {
                onClose();
                router.push('/iaagent');
              }}
              className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold bg-[var(--color-accent-dim)] text-[var(--color-accent)] hover:bg-[var(--color-accent)]/20 transition-all"
            >
              <FiCpu className="w-3.5 h-3.5" />
              Falar com a IA sem senha
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
