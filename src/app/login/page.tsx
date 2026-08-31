'use client';

import { useState, FormEvent, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FiLock, FiMail, FiEye, FiEyeOff, FiArrowRight, FiCpu, FiShield, FiCheckCircle } from 'react-icons/fi';
import Header from '../../component/Header';

export default function LoginPage() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const identifierRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    identifierRef.current?.focus();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!identifier || !password) {
      setError('Por favor, preencha todos os campos.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await response.json();

      if (response.ok) {
        try {
          const meRes = await fetch('/api/me', { credentials: 'include' });
          if (meRes.ok) {
            const me = await meRes.json();
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('userData', JSON.stringify(me));
          }
        } catch {
          // ignore
        }
        router.push('/dashboard');
      } else {
        setError(data.message || 'Falha no login. Verifique suas credenciais.');
      }
    } catch (err) {
      console.error('Erro de conexão:', err);
      setError('Erro ao conectar com o servidor. Tente novamente mais tarde.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Header />
      <main className="min-h-screen pt-[calc(var(--header-height)+1.5rem)] pb-16 px-4 flex items-center justify-center relative overflow-hidden">
        {/* Glow ambient background aura */}
        <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-gradient-to-b from-[#00b09b]/20 via-[#004aad]/15 to-transparent blur-[140px] -z-10" />
        <div className="pointer-events-none absolute bottom-0 right-0 w-80 h-80 bg-cyan-500/10 blur-[100px] -z-10" />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="w-full max-w-md relative"
        >
          {/* Decorative Cyber Border Accent */}
          <div className="absolute -inset-[1px] rounded-[2rem] bg-gradient-to-r from-indigo-500 via-[var(--color-accent)] to-cyan-400 opacity-35 blur-sm" />

          {/* Main Card */}
          <div className="relative rounded-[1.9rem] bg-white/90 dark:bg-[#071324]/90 border border-black/10 dark:border-white/15 backdrop-blur-2xl p-7 sm:p-9 shadow-2xl overflow-hidden">
            {/* Tech Corner Crosshairs */}
            <div className="absolute top-4 left-4 text-[10px] font-mono text-[var(--color-accent)]/60 select-none">+01</div>
            <div className="absolute top-4 right-4 text-[10px] font-mono text-[var(--color-accent)]/60 select-none">SYS.AUTH</div>

            {/* Header / Logo Branding */}
            <div className="text-center mb-7 pt-2">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-3 shadow-lg relative group" style={{ background: 'linear-gradient(135deg, #004aad, #00b09b)' }}>
                <Image
                  src="/images/EASYDEVLOGO.png"
                  alt="EasyDev CRM"
                  width={38}
                  height={38}
                  className="rounded-full relative z-10"
                />
                <div className="absolute inset-0 rounded-2xl bg-cyan-400/40 blur-md group-hover:bg-cyan-400/60 transition-colors" />
              </div>

              <div className="flex items-center justify-center gap-1.5 mb-1">
                <span className="font-pixel text-sm sm:text-base tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-400 to-cyan-400 dark:from-indigo-400 dark:via-purple-300 dark:to-cyan-300">
                  EasyDev
                </span>
                <span className="font-pixel text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-500 dark:bg-cyan-400/20 dark:text-cyan-300 border border-cyan-500/30 uppercase shadow-[0_0_6px_rgba(6,182,212,0.25)]">
                  CRM
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Acessar Portal do Cliente
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Gerencie seus projetos, Kanban e faturas em tempo real.
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-600 dark:text-red-400 text-xs font-semibold flex items-center gap-2"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0 animate-ping" />
                <span>{error}</span>
              </motion.div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="identifier"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5"
                >
                  Usuário ou E-mail
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                    <FiMail className="w-4 h-4" />
                  </div>
                  <input
                    ref={identifierRef}
                    type="text"
                    id="identifier"
                    name="identifier"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    required
                    placeholder="seu_usuario ou email@exemplo.com"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent transition-all shadow-inner"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="password"
                    className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300"
                  >
                    Senha
                  </label>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                    <FiLock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-11 py-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent transition-all shadow-inner"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
                    aria-label={showPassword ? 'Esconder senha' : 'Ver senha'}
                  >
                    {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 px-6 rounded-xl font-bold text-sm text-white shadow-lg transition-all duration-200 hover:scale-[1.01] hover:opacity-95 disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2 cursor-pointer"
                  style={{ background: 'linear-gradient(135deg, #004aad 0%, #00b09b 60%, #00d4aa 100%)' }}
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Autenticando...</span>
                    </>
                  ) : (
                    <>
                      <span>Entrar no Sistema</span>
                      <FiArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Separator / Alternative Action */}
            <div className="mt-6 pt-5 border-t border-slate-200 dark:border-white/10 text-center space-y-3">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Ainda não tem acesso?{' '}
                <Link
                  href="/register"
                  className="font-bold text-[var(--color-accent)] hover:underline"
                >
                  Criar conta de cliente
                </Link>
              </p>

              {/* No password required IA Option */}
              <div className="pt-2">
                <Link
                  href="/iaagent"
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold border border-[var(--color-accent)]/30 bg-[var(--color-accent-dim)] text-[var(--color-accent)] hover:bg-[var(--color-accent)]/20 transition-all shadow-sm"
                >
                  <FiCpu className="w-4 h-4" />
                  Conversar com a IA sem senha (apenas Nome & E-mail)
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </>
  );
}