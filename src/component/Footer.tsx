'use client';

import Image from "next/image";
import Link from "next/link";

const Footer: React.FC = () => {
  return (
    <footer className="mt-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 pb-8">
        <div className="rounded-3xl border border-black/10 bg-white/70 backdrop-blur-xl shadow-sm dark:border-white/15 dark:bg-black/30">
          <div className="p-4 md:p-6">
        <div className="sm:flex sm:items-center sm:justify-between">
          <Link href="/" passHref>
            <span className="flex items-center mb-4 sm:mb-0 space-x-3 rtl:space-x-reverse cursor-pointer">
              <Image
                src="/images/EASYDEVLOGO.png" // Usar logotipo EASYDEV (se existir)
                alt="EASYDEV Logo"
                width={32}
                height={32}
              />
              <span className="self-center text-2xl font-semibold whitespace-nowrap text-slate-900 dark:text-white">
                EASYDEV
              </span>
            </span>
          </Link>
          <ul className="flex flex-wrap items-center mb-6 text-sm font-semibold text-slate-600 sm:mb-0 dark:text-white/70">
            
            <li>
              <Link href="/privacidade" className="hover:underline me-4 md:me-6">
                Política de Privacidade
              </Link>
            </li>
            <li>
              <Link href="/licenca" className="hover:underline me-4 md:me-6">
                Licença
              </Link>
            </li>
            <li>
              <Link href="/contato" className="hover:underline">
                Contato
              </Link>
            </li>
          </ul>
        </div>
        <hr className="my-6 border-black/10 sm:mx-auto dark:border-white/10" />
          <span className="block text-sm text-slate-600 sm:text-center dark:text-white/60">
          © 2025{" "}
          <Link href="/" passHref>
            <span className="hover:underline cursor-pointer">EASYDEV™</span>
          </Link>
          . Todos os direitos reservados.
        </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
