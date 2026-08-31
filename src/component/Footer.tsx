'use client';
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { FiMail, FiGithub, FiLinkedin, FiInstagram } from "react-icons/fi";

const Footer: React.FC = () => {
  return (
    <footer className="mt-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 pb-8">
        <div className="rounded-3xl border border-black/8 bg-white/70 backdrop-blur-xl shadow-sm dark:border-white/10 dark:bg-white/5">
          <div className="p-6 md:p-10">

            {/* Main grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

              {/* Brand column */}
              <div className="lg:col-span-2">
                <Link href="/" className="inline-flex items-center gap-3 group">
                  <Image
                    src="/images/EASYDEVLOGO.png"
                    alt="EASYDEV Logo"
                    width={36}
                    height={36}
                    className="opacity-90 group-hover:opacity-100 transition"
                  />
                  <span className="font-pixel text-sm sm:text-base tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-400 to-cyan-400 dark:from-indigo-400 dark:via-purple-300 dark:to-cyan-300">
                    EasyDev <span className="text-cyan-500 dark:text-cyan-300 text-xs">CRM</span>
                  </span>
                </Link>
                <p className="mt-4 text-sm text-slate-600 dark:text-white/60 max-w-xs leading-relaxed">
                  Transformamos ideias em produto: site, sistema, automação e integração —
                  com arquitetura moderna e acompanhamento real.
                </p>
                <div className="mt-5 flex items-center gap-3">
                  <a
                    href="mailto:contato@easydev.com.br"
                    aria-label="E-mail"
                    className="inline-flex items-center justify-center w-9 h-9 rounded-xl border border-black/8 bg-white/60 text-slate-700 hover:text-[var(--color-accent)] hover:border-[var(--color-accent)] transition dark:border-white/10 dark:bg-white/5 dark:text-white/70 dark:hover:text-[var(--color-accent)]"
                  >
                    <FiMail className="w-4 h-4" />
                  </a>
                  <a
                    href="https://github.com/rbrosco"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="GitHub"
                    className="inline-flex items-center justify-center w-9 h-9 rounded-xl border border-black/8 bg-white/60 text-slate-700 hover:text-[var(--color-accent)] hover:border-[var(--color-accent)] transition dark:border-white/10 dark:bg-white/5 dark:text-white/70 dark:hover:text-[var(--color-accent)]"
                  >
                    <FiGithub className="w-4 h-4" />
                  </a>
                  <a
                    href="https://linkedin.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="LinkedIn"
                    className="inline-flex items-center justify-center w-9 h-9 rounded-xl border border-black/8 bg-white/60 text-slate-700 hover:text-[var(--color-accent)] hover:border-[var(--color-accent)] transition dark:border-white/10 dark:bg-white/5 dark:text-white/70 dark:hover:text-[var(--color-accent)]"
                  >
                    <FiLinkedin className="w-4 h-4" />
                  </a>
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram"
                    className="inline-flex items-center justify-center w-9 h-9 rounded-xl border border-black/8 bg-white/60 text-slate-700 hover:text-[var(--color-accent)] hover:border-[var(--color-accent)] transition dark:border-white/10 dark:bg-white/5 dark:text-white/70 dark:hover:text-[var(--color-accent)]"
                  >
                    <FiInstagram className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {/* Produto column */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-white/40 mb-4">
                  Produto
                </p>
                <ul className="space-y-2.5 text-sm">
                  {[
                    { label: 'Serviços', href: '/#Servicos' },
                    { label: 'Planos', href: '/#Planos' },
                    { label: 'Portfólio', href: '/#Portfolio' },
                    { label: 'Sobre', href: '/#Sobre' },
                    { label: 'Depoimentos', href: '/#Depoimentos' },
                    { label: 'Dashboard', href: '/dashboard' },
                    { label: 'IA Agent', href: '/iaagent' },
                  ].map(({ label, href }) => (
                    <li key={label}>
                      <Link
                        href={href}
                        className="text-slate-600 hover:text-[var(--color-accent)] transition dark:text-white/60 dark:hover:text-[var(--color-accent)]"
                      >
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Legal column */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-white/40 mb-4">
                  Legal
                </p>
                <ul className="space-y-2.5 text-sm">
                  {[
                    { label: 'Política de Privacidade', href: '/privacidade' },
                    { label: 'Licença', href: '/licenca' },
                    { label: 'Contato', href: '/contato' },
                  ].map(({ label, href }) => (
                    <li key={label}>
                      <Link
                        href={href}
                        className="text-slate-600 hover:text-[var(--color-accent)] transition dark:text-white/60 dark:hover:text-[var(--color-accent)]"
                      >
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Bottom bar */}
            <div className="mt-10 pt-6 border-t border-black/8 dark:border-white/8 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-xs text-slate-500 dark:text-white/40">
                © 2025{' '}
                <Link href="/" className="hover:text-[var(--color-accent)] transition">
                  EASYDEV™
                </Link>
                . Todos os direitos reservados.
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-white/40">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] inline-block" />
                Feito com cuidado no Brasil
              </span>
            </div>

          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
