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
    <div style={{ minHeight: '100vh', background: '#0a0f1e' }}>
      <Sidebar />
      <div className="md:pl-64 flex flex-col min-h-screen">
        <DashboardNav />

        <main className="px-4 md:px-8 pt-[81px] pb-20">

          {/* ── Hero ── */}
          <div
            className="relative overflow-hidden rounded-2xl mt-6 px-7 py-6"
            style={{ background: 'linear-gradient(130deg, rgba(0,74,173,0.18) 0%, rgba(0,176,155,0.12) 100%)', border: '1px solid rgba(0,176,155,0.2)' }}
          >
            <div className="absolute -top-12 -right-12 w-52 h-52 rounded-full blur-3xl opacity-15 pointer-events-none" style={{ background: 'radial-gradient(circle,#004aad,transparent)' }} />
            <div className="absolute top-4 right-36 w-24 h-24 rounded-full blur-2xl opacity-10 pointer-events-none" style={{ background: 'radial-gradient(circle,#00b09b,transparent)' }} />
            <FiFileText className="w-7 h-7 mb-3" style={{ color: '#00b09b' }} />
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Faturas</h1>
            <p className="mt-1 text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>Histórico de cobranças e pagamentos de serviços prestados.</p>

            {/* KPI cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">
              {[
                { label: 'Total faturado', value: fmt(total), sub: `${MOCK_INVOICES.length} faturas`, color: '#6366f1' },
                { label: 'Recebido', value: fmt(pago), sub: `${pagoCount} pagas`, color: '#00b09b' },
                { label: 'A receber', value: fmt(pendente), sub: 'pendentes', color: '#f59e0b' },
                { label: 'Em atraso', value: fmt(vencido), sub: 'vencidas', color: '#ef4444' },
              ].map(({ label, value, sub, color }) => (
                <div key={label} className="rounded-xl px-4 py-3" style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${color}22` }}>
                  <div className="w-2 h-2 rounded-full mb-2 animate-pulse" style={{ background: color }} />
                  <p className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.38)' }}>{label}</p>
                  <p className="text-lg font-extrabold text-white mt-0.5 tabular-nums">{value}</p>
                  <p className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.28)' }}>{sub}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Filters ── */}
          <div className="mt-5 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            {/* Tabs */}
            <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
              {TABS.map(t => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all"
                  style={tab === t
                    ? { background: 'linear-gradient(135deg,#004aad,#00b09b)', color: 'white', boxShadow: '0 0 12px rgba(0,176,155,0.25)' }
                    : { color: 'rgba(255,255,255,0.4)' }}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: 'rgba(255,255,255,0.3)' }} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar fatura, projeto..."
                className="pl-8 pr-4 py-2 rounded-xl text-xs text-white outline-none transition focus:ring-1 focus:ring-[#00b09b] w-56"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', color: 'white' }}
              />
            </div>
          </div>

          {/* ── Invoice list ── */}
          <div className="mt-4 flex flex-col gap-3">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(99,102,241,0.1)' }}>
                  <FiFilter className="w-6 h-6" style={{ color: '#818cf8' }} />
                </div>
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>Nenhuma fatura encontrada.</p>
              </div>
            ) : filtered.map(inv => {
              const st = STATUS_CONFIG[inv.status];
              const isOpen = expanded === inv.id;
              return (
                <div
                  key={inv.id}
                  className="rounded-2xl overflow-hidden transition-all duration-200"
                  style={{ background: 'rgba(255,255,255,0.035)', border: '1px solid rgba(255,255,255,0.08)', borderLeft: `3px solid ${st.dot}` }}
                >
                  {/* Row */}
                  <div
                    className="px-5 py-4 flex items-center gap-4 cursor-pointer hover:bg-white/[0.02] transition-colors flex-wrap"
                    onClick={() => setExpanded(isOpen ? null : inv.id)}
                  >
                    {/* Icon */}
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: st.bg }}>
                      <span style={{ color: st.text }}>{st.icon}</span>
                    </div>

                    {/* ID + project */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono font-bold" style={{ color: 'rgba(255,255,255,0.35)' }}>{inv.id}</span>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold" style={{ background: st.bg, color: st.text }}>
                          <span className="w-1.5 h-1.5 rounded-full" style={{ background: st.dot }} />
                          {st.label}
                        </span>
                      </div>
                      <p className="text-sm font-bold text-white mt-0.5 truncate">{inv.projeto}</p>
                      <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>{inv.cliente}</p>
                    </div>

                    {/* Dates */}
                    <div className="hidden md:flex flex-col items-end gap-1 text-xs shrink-0" style={{ color: 'rgba(255,255,255,0.3)' }}>
                      <span>Emissão: <span className="text-white/50">{fmtDate(inv.emissao)}</span></span>
                      <span>Vencimento: <span style={{ color: inv.status === 'vencido' ? '#fca5a5' : 'rgba(255,255,255,0.5)' }}>{fmtDate(inv.vencimento)}</span></span>
                    </div>

                    {/* Value */}
                    <div className="text-right shrink-0">
                      <p className="text-base font-extrabold tabular-nums" style={{ color: inv.status === 'pago' ? '#00d4aa' : inv.status === 'vencido' ? '#fca5a5' : 'white' }}>
                        {fmt(inv.valor)}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 shrink-0" onClick={e => e.stopPropagation()}>
                      <button
                        title="Visualizar"
                        className="w-8 h-8 rounded-xl flex items-center justify-center transition hover:bg-white/10"
                        style={{ background: 'rgba(255,255,255,0.06)' }}
                      >
                        <FiEye className="w-3.5 h-3.5" style={{ color: '#818cf8' }} />
                      </button>
                      <button
                        title="Baixar PDF"
                        className="w-8 h-8 rounded-xl flex items-center justify-center transition hover:bg-white/10"
                        style={{ background: 'rgba(255,255,255,0.06)' }}
                      >
                        <FiDownload className="w-3.5 h-3.5" style={{ color: '#00b09b' }} />
                      </button>
                    </div>
                  </div>

                  {/* Expanded detail */}
                  {isOpen && (
                    <div className="px-5 pb-5 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                      <p className="text-xs mt-4 mb-3 font-semibold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.28)' }}>Detalhes da fatura</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                        {[
                          { label: 'Número', value: inv.id },
                          { label: 'Cliente', value: inv.cliente },
                          { label: 'Emissão', value: fmtDate(inv.emissao) },
                          { label: 'Vencimento', value: fmtDate(inv.vencimento) },
                        ].map(({ label, value }) => (
                          <div key={label}>
                            <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: 'rgba(255,255,255,0.25)' }}>{label}</p>
                            <p className="font-medium text-white/70">{value}</p>
                          </div>
                        ))}
                      </div>
                      <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                        <p className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.3)' }}>Descrição do serviço</p>
                        <p className="text-sm mt-1 text-white/65">{inv.descricao}</p>
                      </div>
                      {/* Total row */}
                      <div className="mt-3 flex items-center justify-between py-3 px-4 rounded-xl" style={{ background: 'rgba(0,176,155,0.07)', border: '1px solid rgba(0,176,155,0.15)' }}>
                        <span className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.45)' }}>Total da fatura</span>
                        <span className="text-xl font-extrabold tabular-nums" style={{ color: '#00d4aa' }}>{fmt(inv.valor)}</span>
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
