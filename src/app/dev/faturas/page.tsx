'use client';

import React, { useState, useEffect } from 'react';
import { FiPlus, FiDownload, FiEye, FiFileText, FiCheckCircle, FiClock, FiAlertCircle, FiTrendingUp } from 'react-icons/fi';
import DashboardNav from '../../../component/DashboardNav';
import DevSidebar from '../../../component/DevSidebar';

type InvoiceStatus = 'pago' | 'pendente' | 'vencido' | 'processando';

type Invoice = {
  id: string;
  projeto: string | null;
  cliente: string;
  valor: number;
  emissao: string;
  vencimento: string;
  status: InvoiceStatus;
  descricao: string;
  asaas_url: string | null;
  project_id: number | null;
};

type Project = { id: number; title: string; client_name: string };

const STATUS_CONFIG: Record<InvoiceStatus, { label: string; bg: string; text: string; dot: string; icon: React.ReactNode }> = {
  pago:         { label: 'Pago',         bg: 'rgba(0,176,155,0.14)',  text: '#00d4aa', dot: '#00b09b', icon: <FiCheckCircle className="w-3.5 h-3.5" /> },
  pendente:     { label: 'Pendente',     bg: 'rgba(245,158,11,0.14)', text: '#fcd34d', dot: '#f59e0b', icon: <FiClock className="w-3.5 h-3.5" /> },
  vencido:      { label: 'Vencido',      bg: 'rgba(239,68,68,0.14)',  text: '#fca5a5', dot: '#ef4444', icon: <FiAlertCircle className="w-3.5 h-3.5" /> },
  processando:  { label: 'Processando',  bg: 'rgba(99,102,241,0.14)', text: '#a5b4fc', dot: '#6366f1', icon: <FiTrendingUp className="w-3.5 h-3.5" /> },
};

function fmt(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
function fmtDate(d: string) {
  return new Date(d + 'T12:00:00').toLocaleDateString('pt-BR');
}

export default function DevFaturasPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [projectId, setProjectId] = useState<string>('');
  const [clientName, setClientName] = useState('');
  const [value, setValue] = useState('');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState<InvoiceStatus>('pendente');
  const [description, setDescription] = useState('');
  const [asaasUrl, setAsaasUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [invRes, projRes] = await Promise.all([
        fetch('/api/invoices', { credentials: 'include' }),
        fetch('/api/projects?all=1', { credentials: 'include' })
      ]);
      const invData = await invRes.json();
      const projData = await projRes.json();
      setInvoices(invData.invoices || []);
      setProjects(projData.projects || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  // Auto-fill client name if a project is selected
  useEffect(() => {
    if (projectId) {
      const p = projects.find(x => x.id === Number(projectId));
      if (p && p.client_name) {
        setClientName(p.client_name);
      }
    }
  }, [projectId, projects]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!clientName || !value || !issueDate || !dueDate) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: projectId || null,
          client_name: clientName,
          value: Number(value),
          issue_date: issueDate,
          due_date: dueDate,
          status,
          description,
          asaas_url: asaasUrl || null
        })
      });
      if (res.ok) {
        setIsModalOpen(false);
        // Reset form
        setProjectId(''); setClientName(''); setValue(''); setDueDate(''); setDescription(''); setAsaasUrl(''); setStatus('pendente');
        await loadData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-[#0a0f1e]">
      <DevSidebar />
      <div className="flex-1 flex flex-col min-w-0 md:pl-sidebar transition-[padding] duration-300">
        <DashboardNav />
        <main className="flex-1 overflow-auto px-6 md:px-8 pt-[85px] pb-8">
          <div className="w-full mx-auto flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Gerenciar Faturas</h1>
                <p className="text-slate-500 dark:text-gray-400 text-sm mt-1">Crie e acompanhe as faturas dos projetos.</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 bg-[#00b09b] hover:bg-[#00d4aa] text-white px-4 py-2.5 rounded-xl font-bold text-sm transition-colors"
              >
                <FiPlus className="w-4 h-4" /> Nova Fatura
              </button>
            </div>

            {loading ? (
              <div className="flex justify-center p-10"><div className="animate-spin rounded-full h-8 w-8 border-2 border-t-transparent border-[#00b09b]" /></div>
            ) : (
              <div className="flex flex-col gap-4">
                {invoices.length === 0 ? (
                  <p className="text-slate-500">Nenhuma fatura encontrada no sistema.</p>
                ) : invoices.map(inv => {
                  const st = STATUS_CONFIG[inv.status] || STATUS_CONFIG.pendente;
                  return (
                    <div key={inv.id} className="rounded-2xl p-5 bg-white dark:bg-[#0d1224] border border-slate-200 dark:border-white/5 shadow-sm flex items-center flex-wrap gap-4">
                      <div className="flex-1 min-w-[200px]">
                        <div className="flex gap-2 items-center mb-1">
                          <span className="font-bold text-slate-800 dark:text-white">{inv.id}</span>
                          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full" style={{ background: st.bg, color: st.text }}>{st.label}</span>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{inv.projeto || 'Projeto não vinculado'} - {inv.cliente}</p>
                      </div>
                      <div className="text-sm font-medium text-slate-500 dark:text-slate-400">
                        Venc: <span className={inv.status === 'vencido' ? 'text-red-500' : 'text-slate-800 dark:text-slate-300'}>{fmtDate(inv.vencimento)}</span>
                      </div>
                      <div className="text-lg font-black text-slate-900 dark:text-white w-32 text-right">
                        {fmt(inv.valor)}
                      </div>
                      <div className="flex gap-2">
                         {inv.asaas_url && (
                           <a href={inv.asaas_url} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-50 text-blue-500 hover:bg-blue-100" title="Link de Pagamento">
                             <FiFileText />
                           </a>
                         )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-[#0d1224] w-full max-w-2xl rounded-2xl shadow-xl p-6 border border-slate-200 dark:border-[#1e2a4a] max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Nova Fatura</h2>
            <form onSubmit={handleCreate} className="flex flex-col gap-4">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-500">Vincular a Projeto (Opcional)</label>
                  <select value={projectId} onChange={(e) => setProjectId(e.target.value)} className="rounded-lg p-2.5 text-sm border bg-slate-50 dark:bg-[#1a2035] dark:border-[#2a3555] dark:text-white">
                    <option value="">Sem projeto / Avulsa</option>
                    {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-500">Nome do Cliente *</label>
                  <input required value={clientName} onChange={e => setClientName(e.target.value)} className="rounded-lg p-2.5 text-sm border bg-slate-50 dark:bg-[#1a2035] dark:border-[#2a3555] dark:text-white" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-500">Valor (R$) *</label>
                  <input required type="number" step="0.01" value={value} onChange={e => setValue(e.target.value)} placeholder="Ex: 5000" className="rounded-lg p-2.5 text-sm border bg-slate-50 dark:bg-[#1a2035] dark:border-[#2a3555] dark:text-white" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-500">Status Inicial</label>
                  <select value={status} onChange={(e) => setStatus(e.target.value as InvoiceStatus)} className="rounded-lg p-2.5 text-sm border bg-slate-50 dark:bg-[#1a2035] dark:border-[#2a3555] dark:text-white">
                    <option value="pendente">Pendente</option>
                    <option value="pago">Pago</option>
                    <option value="vencido">Vencido</option>
                    <option value="processando">Processando</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-500">Data Emissão *</label>
                  <input required type="date" value={issueDate} onChange={e => setIssueDate(e.target.value)} className="rounded-lg p-2.5 text-sm border bg-slate-50 dark:bg-[#1a2035] dark:border-[#2a3555] dark:text-white" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-500">Data Vencimento *</label>
                  <input required type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="rounded-lg p-2.5 text-sm border bg-slate-50 dark:bg-[#1a2035] dark:border-[#2a3555] dark:text-white" />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-500">Descrição do Serviço (Opcional)</label>
                <textarea rows={3} value={description} onChange={e => setDescription(e.target.value)} className="rounded-lg p-2.5 text-sm border bg-slate-50 dark:bg-[#1a2035] dark:border-[#2a3555] dark:text-white" />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-500">Link Asaas (Opcional, preenchimento manual por enquanto)</label>
                <input value={asaasUrl} onChange={e => setAsaasUrl(e.target.value)} placeholder="https://asaas.com/..." className="rounded-lg p-2.5 text-sm border bg-slate-50 dark:bg-[#1a2035] dark:border-[#2a3555] dark:text-white" />
              </div>

              <div className="mt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">Cancelar</button>
                <button type="submit" disabled={submitting} className="px-5 py-2 rounded-xl text-sm font-bold text-white bg-[#00b09b] hover:bg-[#00d4aa] disabled:opacity-50">
                  {submitting ? 'Salvando...' : 'Salvar Fatura'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
