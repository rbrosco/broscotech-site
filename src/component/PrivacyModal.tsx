'use client';
import React, { useEffect, useRef } from 'react';
import { FiX } from 'react-icons/fi';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
}

const PrivacyModal: React.FC<PrivacyModalProps> = ({ isOpen, onClose, onAccept }) => {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<Element | null>(null);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      triggerRef.current = document.activeElement;
      document.body.style.overflow = 'hidden'; // Impede o scroll da página ao fundo
      window.addEventListener('keydown', handleEsc);
      setTimeout(() => closeButtonRef.current?.focus(), 0);
    } else {
      document.body.style.overflow = 'auto';
      if (triggerRef.current instanceof HTMLElement) {
        triggerRef.current.focus();
      }
    }
    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      id="privacy-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="privacy-modal-title"
      className="fixed top-0 right-0 left-0 z-50 flex justify-center items-center w-full md:inset-0 h-screen max-h-full bg-gray-200 bg-opacity-60 dark:bg-gray-900 dark:bg-opacity-75"
      onClick={onClose} // Fecha o modal ao clicar fora
    >
      <div 
        className="relative p-4 w-full max-w-2xl max-h-full"
        onClick={(e) => e.stopPropagation()} // Impede que o clique dentro do modal o feche
      >
        {/* Modal content */}
        <div className="relative bg-white rounded-lg shadow-sm dark:bg-gray-700">
          {/* Modal header */}
          <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600 border-gray-200">
            <h3 id="privacy-modal-title" className="text-xl font-semibold text-gray-900 dark:text-white">
              Política de Privacidade
            </h3>
            <button
              ref={closeButtonRef}
              type="button"
              className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-slate-900 dark:text-white focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
              onClick={onClose}
              aria-label="Fechar modal de política de privacidade"
            >
              <FiX className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
          {/* Modal body */}
          <div className="p-4 md:p-5 space-y-4 max-h-[60vh] overflow-y-auto">
            <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
              Sua privacidade é importante para nós. É política da EASYDEV respeitar a sua privacidade em relação a qualquer informação sua que possamos coletar no site EASYDEV, e outros sites que possuímos e operamos.
            </p>
            <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
              Solicitamos informações pessoais apenas quando realmente precisamos delas para lhe fornecer um serviço. Fazemo-lo por meios justos e legais, com o seu conhecimento e consentimento. Também informamos por que estamos coletando e como será usado.
            </p>
            {/* Adicione mais parágrafos da sua política de privacidade aqui */}
            <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
              O uso continuado de nosso site será considerado como aceitação de nossas práticas em torno de privacidade e informações pessoais. Se você tiver alguma dúvida sobre como lidamos com dados do usuário e informações pessoais, entre em contato conosco.
            </p>
          </div>
          {/* Modal footer */}
          <div className="flex items-center p-4 md:p-5 border-t border-gray-200 rounded-b dark:border-gray-600">
            <button
              onClick={() => { onAccept(); onClose(); }}
              type="button"
              className="text-slate-900 dark:text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            >
              Eu aceito
            </button>
            <button
              onClick={onClose}
              type="button"
              className="py-2.5 px-5 ms-3 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-slate-900 dark:text-white dark:hover:bg-gray-700"
            >
              Recusar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyModal;