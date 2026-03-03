"use client";
import { useRouter } from "next/navigation";
import { FiMessageCircle } from "react-icons/fi";

type Props = {
  pulse?: boolean;
  badge?: number;
};

export default function IAAgentButton({ pulse = true, badge = 0 }: Props) {
  const router = useRouter();

  function openAgent() {
    router.push('/iaagent');
  }

  return (
    <div className="fixed right-6 bottom-6 z-60">
      <button
        onClick={openAgent}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openAgent(); } }}
        aria-label="Abrir IA Agent"
        title="Conversar com a IA"
        className={`iaagent-bubble ${pulse ? 'pulse' : ''}`}
      >
        <span className="sr-only">Abrir IA Agent</span>
        <FiMessageCircle className="w-6 h-6" aria-hidden />
      </button>

      {badge > 0 && (
        <span className="absolute -top-2 -right-2 inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-500 text-slate-900 dark:text-white text-xs font-semibold shadow">{badge > 99 ? '99+' : badge}</span>
      )}
    </div>
  );
}
