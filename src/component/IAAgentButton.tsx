"use client";
import { useState } from "react";
import { FiMessageCircle } from "react-icons/fi";
import IAAgentPopup from "./IAAgentPopup";

type Props = {
  pulse?: boolean;
  badge?: number;
};

export default function IAAgentButton({ pulse = true, badge = 0 }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="fixed right-6 bottom-6 z-60">
        <button
          onClick={() => setOpen((v) => !v)}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen((v) => !v); } }}
          aria-label={open ? "Fechar IA Agent" : "Abrir IA Agent"}
          aria-expanded={open}
          title="Conversar com a IA"
          className={`iaagent-bubble ${pulse && !open ? 'pulse' : ''}`}
        >
          <span className="sr-only">{open ? 'Fechar IA Agent' : 'Abrir IA Agent'}</span>
          <FiMessageCircle className="w-6 h-6" aria-hidden />
        </button>

        {badge > 0 && !open && (
          <span className="absolute -top-2 -right-2 inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-500 text-slate-900 dark:text-white text-xs font-semibold shadow">{badge > 99 ? '99+' : badge}</span>
        )}
      </div>

      {open && <IAAgentPopup onClose={() => setOpen(false)} />}
    </>
  );
}
