"use client";
import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { FiTrash2, FiExternalLink, FiPhone, FiMail, FiEye, FiX, FiUser, FiCalendar, FiTag, FiMessageSquare } from "react-icons/fi";

type Lead = {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  message: string | null;
  interest_type: 'service' | 'portfolio';
  interest_id: string | null;
  interest_label: string | null;
  status: string;
  created_at: string;
};

const STATUS_OPTIONS = [
  { value: 'new', label: 'Novo', color: 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400' },
  { value: 'contacted', label: 'Contatado', color: 'bg-amber-500/15 text-amber-600 dark:text-amber-400' },
  { value: 'won', label: 'Ganho', color: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' },
  { value: 'lost', label: 'Perdido', color: 'bg-slate-500/15 text-slate-500 dark:text-slate-400' },
];

function statusMeta(status: string) {
  return STATUS_OPTIONS.find((s) => s.value === status) || STATUS_OPTIONS[0];
}

function whatsappLink(phone: string) {
  const digits = phone.replace(/\D/g, '');
  const withDdi = digits.startsWith('55') ? digits : `55${digits}`;
  return `https://wa.me/${withDdi}`;
}

export default function LeadsManagement() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'service' | 'portfolio'>('all');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    loadLeads();
  }, []);

  const loadLeads = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/leads');
      if (res.ok) {
        const data = await res.json();
        setLeads(data.leads || []);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const updateStatus = async (id: number, status: string) => {
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
    setSelectedLead((prev) => (prev && prev.id === id ? { ...prev, status } : prev));
    try {
      await fetch(`/api/leads/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
    } catch (e) {
      console.error(e);
    }
  };

  const deleteLead = async (id: number) => {
    if (!confirm('Deseja realmente excluir este lead?')) return;
    try {
      const res = await fetch(`/api/leads/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setLeads((prev) => prev.filter((l) => l.id !== id));
        setSelectedLead((prev) => (prev && prev.id === id ? null : prev));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filteredLeads = leads.filter((l) => filter === 'all' || l.interest_type === filter);

  return (
    <div className="flex flex-col gap-5 w-full">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Leads do Site</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Solicitações recebidas pelos botões de Serviços e Portfólio, com o interesse exato de cada pessoa
          </p>
        </div>
        <div className="flex gap-2">
          {[
            { id: 'all', label: 'Todos' },
            { id: 'service', label: 'Serviços' },
            { id: 'portfolio', label: 'Portfólio' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                filter === f.id
                  ? 'bg-[var(--color-accent)] text-white'
                  : 'bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/15'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead>
              <tr className="border-b border-slate-200 dark:border-white/10 text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="px-4 py-3 font-semibold">Nome</th>
                <th className="px-4 py-3 font-semibold">Contato</th>
                <th className="px-4 py-3 font-semibold">Interesse</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Recebido em</th>
                <th className="px-4 py-3 font-semibold text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400 text-sm">
                    Carregando...
                  </td>
                </tr>
              ) : filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400 text-sm">
                    Nenhum lead encontrado.
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => (
                  <tr
                    key={lead.id}
                    onClick={() => setSelectedLead(lead)}
                    className="border-b border-slate-100 dark:border-white/5 last:border-0 align-top cursor-pointer hover:bg-slate-50 dark:hover:bg-white/[0.04] transition"
                  >
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900 dark:text-white">{lead.name}</div>
                      {lead.message && (
                        <div className="text-xs text-slate-500 dark:text-slate-400 max-w-xs truncate mt-0.5">
                          {lead.message}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <a
                        href={whatsappLink(lead.phone)}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 hover:underline text-xs font-medium"
                      >
                        <FiPhone className="w-3.5 h-3.5" /> {lead.phone}
                      </a>
                      {lead.email && (
                        <a
                          href={`mailto:${lead.email}`}
                          className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 hover:underline text-xs mt-1"
                        >
                          <FiMail className="w-3.5 h-3.5" /> {lead.email}
                        </a>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="block text-xs font-bold uppercase tracking-wide text-[var(--color-accent)]">
                        {lead.interest_type === 'portfolio' ? 'Portfólio' : 'Serviço'}
                      </span>
                      <span className="text-slate-700 dark:text-slate-200 text-sm">
                        {lead.interest_label || '-'}
                      </span>
                    </td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={lead.status}
                        onChange={(e) => updateStatus(lead.id, e.target.value)}
                        className={`text-xs font-semibold rounded-lg px-2.5 py-1.5 border-0 outline-none cursor-pointer ${statusMeta(lead.status).color}`}
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s.value} value={s.value} className="bg-white dark:bg-[#071324] text-slate-900 dark:text-white">
                            {s.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400">
                      {lead.created_at ? new Date(lead.created_at).toLocaleString('pt-BR') : '-'}
                    </td>
                    <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedLead(lead)}
                          className="p-2 rounded-lg text-slate-500 hover:text-[var(--color-accent)] hover:bg-slate-100 dark:hover:bg-white/10 transition"
                          title="Ver detalhes da solicitação"
                        >
                          <FiEye className="w-4 h-4" />
                        </button>
                        <a
                          href={whatsappLink(lead.phone)}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 rounded-lg text-slate-500 hover:text-[var(--color-accent)] hover:bg-slate-100 dark:hover:bg-white/10 transition"
                          title="Abrir WhatsApp"
                        >
                          <FiExternalLink className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => deleteLead(lead.id)}
                          className="p-2 rounded-lg text-slate-500 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-white/10 transition"
                          title="Excluir"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── MODAL DE DETALHES DA SOLICITAÇÃO ─── */}
      {mounted && selectedLead && createPortal(
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={() => setSelectedLead(null)}
        >
          <div
            className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-white/10 shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 py-4 flex items-center justify-between border-b border-slate-200 dark:border-white/10">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white">Solicitação de {selectedLead.name}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Recebida em {selectedLead.created_at ? new Date(selectedLead.created_at).toLocaleString('pt-BR') : '-'}
                </p>
              </div>
              <button onClick={() => setSelectedLead(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {/* Body: campos do form tal como o cliente preencheu */}
            <div className="p-6 flex flex-col gap-4 overflow-y-auto">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-semibold rounded-lg px-2.5 py-1 ${statusMeta(selectedLead.status).color}`}>
                  {statusMeta(selectedLead.status).label}
                </span>
                <span className="text-xs font-bold uppercase tracking-wide text-[var(--color-accent)]">
                  {selectedLead.interest_type === 'portfolio' ? 'Via Portfólio' : 'Via Serviços'}
                </span>
              </div>

              <div className="rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 p-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  <FiTag className="w-3.5 h-3.5" /> Interesse selecionado
                </div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  {selectedLead.interest_label || 'Não informado'}
                </p>
              </div>

              <div>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  <FiUser className="w-3.5 h-3.5" /> Nome completo
                </div>
                <p className="text-sm text-slate-900 dark:text-white">{selectedLead.name}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                    <FiPhone className="w-3.5 h-3.5" /> Telefone
                  </div>
                  <a
                    href={whatsappLink(selectedLead.phone)}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
                  >
                    {selectedLead.phone}
                  </a>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                    <FiMail className="w-3.5 h-3.5" /> E-mail
                  </div>
                  {selectedLead.email ? (
                    <a href={`mailto:${selectedLead.email}`} className="text-sm text-slate-700 dark:text-slate-200 hover:underline">
                      {selectedLead.email}
                    </a>
                  ) : (
                    <p className="text-sm text-slate-400">Não informado</p>
                  )}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  <FiMessageSquare className="w-3.5 h-3.5" /> Mensagem do cliente
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-200 whitespace-pre-wrap leading-relaxed rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 p-3">
                  {selectedLead.message || 'O cliente não escreveu uma mensagem adicional.'}
                </p>
              </div>

              <div>
                <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  <FiCalendar className="w-3.5 h-3.5" /> Status do atendimento
                </label>
                <select
                  value={selectedLead.status}
                  onChange={(e) => updateStatus(selectedLead.id, e.target.value)}
                  className="w-full bg-white dark:bg-[#071324] border border-slate-200 dark:border-white/15 text-sm rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Footer: ações rápidas */}
            <div className="px-6 py-4 border-t border-slate-200 dark:border-white/10 flex justify-between gap-3 bg-slate-50 dark:bg-white/[0.02]">
              <button
                onClick={() => deleteLead(selectedLead.id)}
                className="px-4 py-2 text-sm font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition flex items-center gap-2"
              >
                <FiTrash2 className="w-4 h-4" /> Excluir
              </button>
              <a
                href={whatsappLink(selectedLead.phone)}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-[#00b09b] hover:bg-[#009b88] text-white text-sm font-semibold rounded-xl transition shadow-md flex items-center gap-2"
              >
                <FiPhone className="w-4 h-4" /> Responder no WhatsApp
              </a>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
