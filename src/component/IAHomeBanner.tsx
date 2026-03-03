"use client";
import Link from "next/link";
import { FiMessageCircle } from "react-icons/fi";

export default function IAHomeBanner() {
  return (
    <div className="rounded-lg p-4 bg-white/60 border border-black/10 dark:bg-white/5 dark:border-white/15">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-semibold">Converse com a nossa IA</h4>
          <p className="text-xs text-slate-600 dark:text-white/80">Receba um briefing inicial e sugestões de arquitetura.</p>
        </div>
        <div>
          <Link href="/iaagent" className="inline-flex items-center gap-2 rounded-full bg-slate-900 text-slate-900 dark:text-white px-4 py-2 text-sm font-semibold hover:bg-slate-800 transition dark:bg-white/90 dark:text-slate-900">
            <FiMessageCircle className="w-4 h-4" /> Conversar
          </Link>
        </div>
      </div>
    </div>
  );
}
