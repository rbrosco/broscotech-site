'use client';

import { useState } from 'react';
import { FiDownload, FiEye, FiFileText, FiTrendingUp, FiClock, FiCheckCircle, FiAlertCircle, FiSearch, FiFilter } from 'react-icons/fi';
import DashboardNav from '../../component/DashboardNav';
import Sidebar from '../../component/Sidebar';

type InvoiceStatus = 'pago' | 'pendente' | 'vencido' | 'processando';

type Invoice = {
  id: string;
  projeto: string;
  cliente: string;
  valor: number;
  emissao: string;
  vencimento: string;
  status: InvoiceStatus;
  descricao: string;
};

const MOCK_INVOICES: Invoice[] = [
  { id: 'FAT-2026-001', projeto: 'Site Institucional EasyDev', cliente: 'EasyDev Ltda', valor: 4800, emissao: '2026-03-01', vencimento: '2026-03-15', status: 'pago', descricao: 'Desenvolvimento de site institucional completo com CMS.' },
  { id: 'FAT-2026-002', projeto: 'App Mobile Delivery', cliente: 'FoodFast S.A.', valor: 12500, emissao: '2026-03-20', vencimento: '2026-04-05', status: 'pago', descricao: 'App Android/iOS para sistema de delivery com rastreamento.' },
  { id: 'FAT-2026-003', projeto: 'Dashboard Analytics', cliente: 'DataViz Corp', valor: 7200, emissao: '2026-04-01', vencimento: '2026-04-20', status: 'pendente', descricao: 'Painel de analytics com gráficos em tempo real e exportação.' },
  { id: 'FAT-2026-004', projeto: 'E-commerce Premium', cliente: 'Modas Silva', valor: 9900, emissao: '2026-04-10', vencimento: '2026-04-25', status: 'pendente', descricao: 'Loja virtual completa com integração PagSeguro e estoque.' },
  { id: 'FAT-2026-005', projeto: 'Sistema ERP', cliente: 'Constru Max', valor: 18000, emissao: '2026-02-15', vencimento: '2026-03-01', status: 'vencido', descricao: 'Sistema de gestão integrado com módulo financeiro e RH.' },
  { id: 'FAT-2026-006', projeto: 'API de Integração', cliente: 'TechBridge Inc', valor: 3600, emissao: '2026-04-18', vencimento: '2026-05-03', status: 'processando', descricao: 'Desenvolvimento de API REST com documentação Swagger.' },
];

const STATUS_CONFIG: Record<InvoiceStatus, { label: string; bg: string; text: string; dot: string; icon: React.ReactNode }> = {
  pago:         { label: 'Pago',         bg: 'rgba(0,176,155,0.14)',  text: '#00d4aa', dot: '#00b09b', icon: <FiCheckCircle className="w-3.5 h-3.5" /> },
  pendente:     { label: 'Pendente',     bg: 'rgba(245,158,11,0.14)', text: '#fcd34d', dot: '#f59e0b', icon: <FiClock className="w-3.5 h-3.5" /> },
  vencido:      { label: 'Vencido',      bg: 'rgba(239,68,68,0.14)',  text: '#fca5a5', dot: '#ef4444', icon: <FiAlertCircle className="w-3.5 h-3.5" /> },
  processando:  { label: 'Processando',  bg: 'rgba(99,102,241,0.14)', text: '#a5b4fc', dot: '#6366f1', icon: <FiTrendingUp className="w-3.5 h-3.5" /> },
};

const TABS = ['Todas', 'Pago', 'Pendente', 'Vencido', 'Processando'] as const;
type Tab = typeof TABS[number];

function fmt(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
function fmtDate(d: string) {
  return new Date(d + 'T12:00:00').toLocaleDateString('pt-BR');
}

export default function FaturasPage() {
  const [tab, setTab] = useState<Tab>('Todas');
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = MOCK_INVOICES.filter(inv => {
    const matchTab = tab === 'Todas' || inv.status === tab.toLowerCase();
    const matchSearch = search.trim() === '' || inv.id.toLowerCase().includes(search.toLowerCase()) || inv.projeto.toLowerCase().includes(search.toLowerCase()) || inv.cliente.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  const total = MOCK_INVOICES.reduce((s, i) => s + i.valor, 0);
  const pago = MOCK_INVOICES.filter(i => i.status === 'pago').reduce((s, i) => s + i.valor, 0);
  const pendente = MOCK_INVOICES.filter(i => i.status === 'pendente').reduce((s, i) => s + i.valor, 0);
  const vencido = MOCK_INVOICES.filter(i => i.status === 'vencido').reduce((s, i) => s + i.valor, 0);
  const pagoCount = MOCK_INVOICES.filter(i => i.status === 'pago').length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-200 selection:bg-cyan-500/30">
      <Sidebar />
      <div className="md:pl-[var(--sidebar-width,5rem)] transition-[padding] duration-300 flex flex-col min-h-screen">
        <DashboardNav />

        <main className="flex-1 px-4 md:px-8 pt-[65px] pb-8">

          {/* ── Hero ── */}
          <div className="relative overflow-hidden rounded-3xl mt-4 px-8 py-8 bg-white dark:bg-transparent bg-gradient-to-br from-indigo-50 via-cyan-50 to-emerald-50 dark:from-indigo-600/10 dark:via-cyan-500/5 dark:to-emerald-500/10 border border-slate-200 dark:border-white/5 shadow-xl dark:shadow-2xl group">
            <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-cyan-500/20 blur-[80px] pointer-events-none group-hover:bg-cyan-400/20 transition-colors duration-700" />
            <div className="absolute -bottom-20 left-20 w-72 h-72 rounded-full bg-indigo-500/20 blur-[80px] pointer-events-none group-hover:bg-indigo-400/20 transition-colors duration-700" />
            
            <div className="relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-cyan-50 dark:bg-cyan-500/10 flex items-center justify-center border border-cyan-200 dark:border-cyan-500/20 shadow-sm dark:shadow-[0_0_15px_rgba(34,211,238,0.15)] mb-4">
                <FiFileText className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">Faturas</h1>
              <p className="mt-2 text-sm md:text-base text-slate-500 dark:text-slate-400 max-w-md leading-relaxed">
                Histórico de cobranças e pagamentos de serviços prestados.
              </p>
            </div>

            {/* KPI cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 relative z-10">
              {[
                { label: 'Total faturado', value: fmt(total), sub: `${MOCK_INVOICES.length} faturas`, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-400/10', border: 'border-indigo-100 dark:border-indigo-400/20' },
                { label: 'Recebido', value: fmt(pago), sub: `${pagoCount} pagas`, color: 'text-cyan-600 dark:text-cyan-400', bg: 'bg-cyan-50 dark:bg-cyan-400/10', border: 'border-cyan-100 dark:border-cyan-400/20' },
                { label: 'A receber', value: fmt(pendente), sub: 'pendentes', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-400/10', border: 'border-amber-100 dark:border-amber-400/20' },
                { label: 'Em atraso', value: fmt(vencido), sub: 'vencidas', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-400/10', border: 'border-red-100 dark:border-red-400/20' },
              ].map(({ label, value, sub, color, bg, border }) => (
                <div key={label} className={`rounded-2xl px-5 py-4 border ${bg} ${border} bg-white/50 dark:bg-transparent shadow-sm dark:shadow-lg backdrop-blur-sm transition-transform hover:-translate-y-1 duration-300`}>
                  <div className={`w-2.5 h-2.5 rounded-full mb-3 shadow-[0_0_8px_currentColor] animate-pulse ${color}`} />
                  <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">{label}</p>
                  <p className="text-2xl font-black text-slate-900 dark:text-white mt-1 tabular-nums tracking-tight">{value}</p>
                  <p className="text-xs font-medium text-slate-500 mt-1">{sub}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Filters ── */}
          <div className="mt-8 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            {/* Tabs */}
            <div className="flex flex-wrap gap-1 p-1.5 rounded-2xl bg-slate-200/50 dark:bg-white/5 border border-slate-200 dark:border-white/5">
              {TABS.map(t => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-5 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${tab === t ? 'bg-white text-slate-900 dark:bg-cyan-500 dark:text-slate-950 shadow-sm dark:shadow-[0_0_15px_rgba(34,211,238,0.4)]' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/5'}`}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative w-full md:w-auto">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar fatura, projeto..."
                className="w-full md:w-64 pl-11 pr-4 py-3 rounded-2xl text-sm text-slate-900 dark:text-white bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 placeholder-slate-400 dark:placeholder-slate-500 outline-none transition-all focus:ring-2 focus:ring-cyan-500 focus:bg-white dark:focus:bg-white/10"
              />
            </div>
          </div>

          {/* ── Invoice list ── */}
          <div className="mt-6 flex flex-col gap-4">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="w-16 h-16 rounded-3xl flex items-center justify-center bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 shadow-sm dark:shadow-[0_0_30px_rgba(99,102,241,0.15)] relative">
                  <div className="absolute inset-0 bg-indigo-400 blur-xl opacity-20 rounded-3xl animate-pulse" />
                  <FiFilter className="w-8 h-8 text-indigo-600 dark:text-indigo-400 relative z-10" />
                </div>
                <p className="text-slate-500 dark:text-slate-400 font-medium">Nenhuma fatura encontrada com esses filtros.</p>
              </div>
            ) : filtered.map(inv => {
              const st = STATUS_CONFIG[inv.status];
              const isOpen = expanded === inv.id;
              return (
                <div
                  key={inv.id}
                  className="rounded-3xl overflow-hidden transition-all duration-300 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10 hover:bg-slate-50 dark:hover:bg-white/[0.07] shadow-sm dark:shadow-lg group"
                  style={{ borderLeft: `4px solid ${st.dot}` }}
                >
                  {/* Row */}
                  <div
                    className="px-6 py-5 flex items-center gap-5 cursor-pointer flex-wrap"
                    onClick={() => setExpanded(isOpen ? null : inv.id)}
                  >
                    {/* Icon */}
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border" style={{ background: st.bg, borderColor: st.dot + '30' }}>
                      <span style={{ color: st.text }}>{st.icon}</span>
                    </div>

                    {/* ID + project */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-sm font-mono font-bold text-slate-500 dark:text-slate-400">{inv.id}</span>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold border" style={{ background: st.bg, color: st.text, borderColor: st.dot + '30' }}>
                          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: st.dot }} />
                          {st.label}
                        </span>
                      </div>
                      <p className="text-base font-black text-slate-900 dark:text-white mt-1 truncate group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">{inv.projeto}</p>
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-500 mt-0.5">{inv.cliente}</p>
                    </div>

                    {/* Dates */}
                    <div className="hidden md:flex flex-col items-end gap-1.5 text-sm shrink-0 mr-4 font-medium">
                      <span className="text-slate-500 dark:text-slate-500">Emissão: <span className="text-slate-900 dark:text-slate-300">{fmtDate(inv.emissao)}</span></span>
                      <span className="text-slate-500 dark:text-slate-500">Vencimento: <span style={{ color: inv.status === 'vencido' ? '#f87171' : 'currentColor' }} className={inv.status !== 'vencido' ? 'text-slate-900 dark:text-slate-300' : ''}>{fmtDate(inv.vencimento)}</span></span>
                    </div>

                    {/* Value */}
                    <div className="text-right shrink-0">
                      <p className={`text-xl font-black tabular-nums tracking-tight ${inv.status !== 'pago' && inv.status !== 'vencido' ? 'text-slate-900 dark:text-white' : ''}`} style={{ color: inv.status === 'pago' ? '#34d399' : inv.status === 'vencido' ? '#f87171' : undefined }}>
                        {fmt(inv.valor)}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 shrink-0 ml-4" onClick={e => e.stopPropagation()}>
                      <button
                        title="Visualizar"
                        className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-110 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-500/20"
                      >
                        <FiEye className="w-4 h-4" />
                      </button>
                      <button
                        title="Baixar PDF"
                        className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-110 bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-100 dark:hover:bg-cyan-500/20"
                      >
                        <FiDownload className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Expanded detail */}
                  {isOpen && (
                    <div className="px-6 pb-6 border-t border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900/50">
                      <p className="text-[11px] mt-6 mb-4 font-bold uppercase tracking-widest text-slate-500 dark:text-slate-500">Detalhes da fatura</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm mb-6">
                        {[
                          { label: 'Número', value: inv.id },
                          { label: 'Cliente', value: inv.cliente },
                          { label: 'Emissão', value: fmtDate(inv.emissao) },
                          { label: 'Vencimento', value: fmtDate(inv.vencimento) },
                        ].map(({ label, value }) => (
                          <div key={label}>
                            <p className="text-[11px] font-bold uppercase tracking-wider mb-1 text-slate-500 dark:text-slate-500">{label}</p>
                            <p className="font-semibold text-slate-900 dark:text-slate-200">{value}</p>
                          </div>
                        ))}
                      </div>
                      <div className="rounded-2xl p-5 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5">
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Descrição do serviço</p>
                        <p className="text-sm mt-2 text-slate-700 dark:text-slate-300 leading-relaxed">{inv.descricao}</p>
                      </div>
                      {/* Total row */}
                      <div className="mt-4 flex items-center justify-between py-4 px-6 rounded-2xl bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-200 dark:border-cyan-500/20 shadow-sm dark:shadow-inner">
                        <span className="text-sm font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-widest">Total da fatura</span>
                        <span className="text-2xl font-black tabular-nums text-cyan-600 dark:text-cyan-400">{fmt(inv.valor)}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </main>
      </div>
    </div>
  );
}
