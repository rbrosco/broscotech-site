'use client';

import Image from "next/image";
import Link from "next/link";

const Footer: React.FC = () => {
  return (
    <footer className="bg-white shadow-sm dark:bg-gray-900">
      <div className="w-full max-w-screen-xl mx-auto p-4 md:py-8">
        <div className="sm:flex sm:items-center sm:justify-between">
          <Link href="/" passHref>
            <span className="flex items-center mb-4 sm:mb-0 space-x-3 rtl:space-x-reverse cursor-pointer">
              <Image
                src="/images/BROSCOTECHLOGO.png" // Certifique-se que o caminho está correto
                alt="BROSCOTECH Logo"
                width={32} // Corresponde a h-8 do exemplo
                height={32}
              />
              <span className="self-center text-2xl font-semibold whitespace-nowrap text-gray-900 dark:text-white">
                BROSCOTECH
              </span>
            </span>
          </Link>
          <ul className="flex flex-wrap items-center mb-6 text-sm font-medium text-gray-500 sm:mb-0 dark:text-gray-400">
            <li>
              <Link href="/sobre" className="hover:underline me-4 md:me-6">
                Sobre
              </Link>
            </li>
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
        <hr className="my-6 border-gray-200 sm:mx-auto dark:border-gray-700 lg:my-8" />
        <span className="block text-sm text-gray-500 sm:text-center dark:text-gray-400">
          © 2025{" "}
          <Link href="/" passHref>
            <span className="hover:underline cursor-pointer">BROSCOTECH™</span>
          </Link>
          . Todos os direitos reservados.
        </span>
      </div>
    </footer>
  );
};

export default Footer;
