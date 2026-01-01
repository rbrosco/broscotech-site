"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardNav from "@/component/DashboardNav";
import DashboardSidebar from "@/component/DashboardSidebar";

export default function ConfiguracoesPage() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [groqKey, setGroqKey] = useState("");
  const [groqModel, setGroqModel] = useState("");
  const [webhook, setWebhook] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem("userData") : null;
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.role && String(parsed.role).toLowerCase() === "admin") {
          setIsAdmin(true);
        }
      }
    } catch {}
  }, []);

  useEffect(() => {
    // Carrega configs salvas
    try {
      setGroqKey(localStorage.getItem("GROQ_API_KEY") || "");
      setGroqModel(localStorage.getItem("GROQ_MODEL") || "");
      setWebhook(localStorage.getItem("WEBHOOK_URL") || "");
    } catch {}
  }, [isAdmin]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      localStorage.setItem("GROQ_API_KEY", groqKey);
      localStorage.setItem("GROQ_MODEL", groqModel);
      localStorage.setItem("WEBHOOK_URL", webhook);
      setMsg("Configurações salvas com sucesso!");
      setTimeout(() => setMsg(""), 3000);
    } catch {
      setMsg("Erro ao salvar configurações.");
    }
  };

  if (!isAdmin) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-semibold mb-2 text-slate-900 dark:text-white">Acesso restrito</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">Esta área é visível apenas para administradores.</p>
        <button onClick={() => router.push("/dashboard")} className="px-4 py-2 rounded-lg bg-slate-900 text-white">Voltar ao Dashboard</button>
      </div>
    );
  }

  return (
    <div className="w-full relative flex bg-blueGray-100 dark:bg-gray-900 min-h-screen">
      <DashboardSidebar />
      <div className="relative md:ml-64 bg-blueGray-100 dark:bg-gray-900 w-full min-w-0 flex-1">
        <DashboardNav />
        <div className="px-4 md:px-6 mx-auto w-full pt-24 pb-10 min-w-0">
          <div className="rounded-3xl bg-white/90 dark:bg-gray-800/80 backdrop-blur-md border border-white/20 dark:border-gray-700/50 shadow-2xl p-5 sm:p-6 min-w-0 max-w-xl mx-auto">
            <h1 className="text-2xl font-semibold mb-4 text-slate-900 dark:text-white">Configurações de API & Webhook</h1>
            <form onSubmit={handleSave} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-1">GROQ_API_KEY</label>
                <input type="text" value={groqKey} onChange={e => setGroqKey(e.target.value)} className="w-full rounded-lg border px-3 py-2 bg-white dark:bg-gray-800" placeholder="Chave da API Groq" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">GROQ_MODEL</label>
                <input type="text" value={groqModel} onChange={e => setGroqModel(e.target.value)} className="w-full rounded-lg border px-3 py-2 bg-white dark:bg-gray-800" placeholder="Modelo ex: llama-3.3-70b-versatile" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Webhook URL</label>
                <input type="text" value={webhook} onChange={e => setWebhook(e.target.value)} className="w-full rounded-lg border px-3 py-2 bg-white dark:bg-gray-800" placeholder="https://exemplo.com/webhook" />
              </div>
              <button type="submit" className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold">Salvar</button>
              {msg && <div className="mt-2 text-green-600 text-sm">{msg}</div>}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
