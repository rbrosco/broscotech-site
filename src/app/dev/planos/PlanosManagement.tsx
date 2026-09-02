"use client";
import React, { useEffect, useState } from "react";
import { FiSave, FiPlus, FiX, FiStar, FiCheck } from "react-icons/fi";

type Plan = {
  id: string;
  name: string;
  tagline: string;
  price: string | null;
  price_note: string | null;
  featured: boolean;
  features: string[];
  sort_order: number;
};

export default function PlanosManagement() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [newFeature, setNewFeature] = useState<Record<string, string>>({});

  useEffect(() => {
    loadPlans();
  }, []);

  async function loadPlans() {
    setLoading(true);
    try {
      const res = await fetch('/api/plans');
      if (res.ok) {
        const data = await res.json();
        setPlans((data.plans || []).sort((a: Plan, b: Plan) => a.sort_order - b.sort_order));
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }

  function updateLocal(id: string, patch: Partial<Plan>) {
    setPlans((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  }

  async function save(plan: Plan) {
    setSavingId(plan.id);
    try {
      const res = await fetch(`/api/plans/${plan.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: plan.name,
          tagline: plan.tagline,
          price: plan.price,
          price_note: plan.price_note,
          featured: plan.featured,
          features: plan.features,
        }),
      });
      if (res.ok) {
        setSavedId(plan.id);
        setTimeout(() => setSavedId(null), 2000);
      }
    } catch (e) {
      console.error(e);
    }
    setSavingId(null);
  }

  function addFeature(id: string) {
    const text = (newFeature[id] || '').trim();
    if (!text) return;
    const plan = plans.find((p) => p.id === id);
    if (!plan) return;
    updateLocal(id, { features: [...plan.features, text] });
    setNewFeature((f) => ({ ...f, [id]: '' }));
  }

  function removeFeature(id: string, index: number) {
    const plan = plans.find((p) => p.id === id);
    if (!plan) return;
    updateLocal(id, { features: plan.features.filter((_, i) => i !== index) });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-8 h-8 rounded-full border-[3px] animate-spin border-cyan-500/30 border-t-cyan-500" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {plans.map((plan) => (
        <div
          key={plan.id}
          className="flex flex-col rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#0b1526] p-5 gap-4"
        >
          <div className="flex items-center justify-between">
            <input
              value={plan.name}
              onChange={(e) => updateLocal(plan.id, { name: e.target.value })}
              className="text-base font-bold bg-transparent border-b border-transparent hover:border-slate-200 dark:hover:border-white/10 focus:border-[var(--color-accent)] outline-none text-slate-900 dark:text-white flex-1"
            />
            <button
              type="button"
              onClick={() => updateLocal(plan.id, { featured: !plan.featured })}
              className={`flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-full border transition-colors ${
                plan.featured
                  ? 'bg-[var(--color-accent-dim)] text-[var(--color-accent)] border-[var(--color-accent)]/40'
                  : 'text-slate-400 border-slate-200 dark:border-white/10 hover:text-slate-600 dark:hover:text-white/70'
              }`}
              title="Marcar como 'Mais escolhido'"
            >
              <FiStar className="w-3 h-3" aria-hidden="true" />
              Destaque
            </button>
          </div>

          <textarea
            value={plan.tagline}
            onChange={(e) => updateLocal(plan.id, { tagline: e.target.value })}
            rows={2}
            className="text-sm text-slate-600 dark:text-white/70 bg-slate-50 dark:bg-white/5 rounded-lg p-2 outline-none focus:ring-2 focus:ring-[var(--color-accent)] resize-none"
          />

          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                Preço (vazio = &quot;Sob consulta&quot;)
              </label>
              <input
                value={plan.price ?? ''}
                onChange={(e) => updateLocal(plan.id, { price: e.target.value || null })}
                placeholder="Sob consulta"
                className="w-full text-sm rounded-lg px-2.5 py-1.5 bg-slate-50 dark:bg-white/5 outline-none focus:ring-2 focus:ring-[var(--color-accent)] text-slate-900 dark:text-white"
              />
            </div>
            <div className="w-20">
              <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                Período
              </label>
              <input
                value={plan.price_note ?? ''}
                onChange={(e) => updateLocal(plan.id, { price_note: e.target.value || null })}
                placeholder="/mês"
                className="w-full text-sm rounded-lg px-2.5 py-1.5 bg-slate-50 dark:bg-white/5 outline-none focus:ring-2 focus:ring-[var(--color-accent)] text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">
              O que inclui
            </label>
            <ul className="space-y-1.5">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-white/80 group">
                  <FiCheck className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--color-accent)' }} aria-hidden="true" />
                  <span className="flex-1">{feature}</span>
                  <button
                    type="button"
                    onClick={() => removeFeature(plan.id, i)}
                    className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-opacity"
                  >
                    <FiX className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
            <div className="flex gap-1.5 mt-2">
              <input
                value={newFeature[plan.id] || ''}
                onChange={(e) => setNewFeature((f) => ({ ...f, [plan.id]: e.target.value }))}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature(plan.id))}
                placeholder="Adicionar item..."
                className="flex-1 text-xs rounded-lg px-2.5 py-1.5 bg-slate-50 dark:bg-white/5 outline-none focus:ring-2 focus:ring-[var(--color-accent)] text-slate-900 dark:text-white"
              />
              <button
                type="button"
                onClick={() => addFeature(plan.id)}
                className="w-7 h-7 shrink-0 rounded-lg flex items-center justify-center bg-slate-100 dark:bg-white/10 text-slate-500 hover:text-slate-900 dark:hover:text-white"
              >
                <FiPlus className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={() => save(plan)}
            disabled={savingId === plan.id}
            className="mt-auto w-full flex items-center justify-center gap-1.5 rounded-xl py-2 text-sm font-semibold text-white disabled:opacity-60 transition-opacity"
            style={{ background: 'linear-gradient(135deg, var(--color-accent-600), var(--color-accent))' }}
          >
            {savedId === plan.id ? (
              <>
                <FiCheck className="w-4 h-4" aria-hidden="true" /> Salvo
              </>
            ) : (
              <>
                <FiSave className="w-4 h-4" aria-hidden="true" />
                {savingId === plan.id ? 'Salvando...' : 'Salvar plano'}
              </>
            )}
          </button>
        </div>
      ))}
    </div>
  );
}
