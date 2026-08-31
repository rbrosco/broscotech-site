'use client';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  FiSmartphone,
  FiCheckCircle,
  FiAlertCircle,
  FiRefreshCw,
  FiLogOut,
  FiWifi,
  FiWifiOff,
  FiLoader,
} from 'react-icons/fi';

type InstanceStatus = {
  name: string;
  state: 'open' | 'connecting' | 'close' | 'unknown';
  error: string | null;
};

const STATE_CONFIG: Record<InstanceStatus['state'], { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  open: { label: 'Conectado', color: '#22c55e', bg: 'rgba(34,197,94,0.12)', icon: <FiWifi className="w-3.5 h-3.5" /> },
  connecting: { label: 'Aguardando leitura do QR', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', icon: <FiLoader className="w-3.5 h-3.5 animate-spin" /> },
  close: { label: 'Desconectado', color: '#94a3b8', bg: 'rgba(148,163,184,0.12)', icon: <FiWifiOff className="w-3.5 h-3.5" /> },
  unknown: { label: 'Status desconhecido', color: '#ef4444', bg: 'rgba(239,68,68,0.12)', icon: <FiAlertCircle className="w-3.5 h-3.5" /> },
};

export default function WhatsAppSettings() {
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [instances, setInstances] = useState<InstanceStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [qrModal, setQrModal] = useState<{ instance: string; base64: string | null; loading: boolean; error: string | null } | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/whatsapp/status', { credentials: 'include' });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Erro ao carregar status do WhatsApp.');
        setConfigured(false);
        return;
      }
      setConfigured(!!data.configured);
      setInstances(Array.isArray(data.instances) ? data.instances : []);
      setError(null);
    } catch {
      setError('Erro de rede ao consultar status do WhatsApp.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadStatus();
  }, [loadStatus]);

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const stopPolling = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };

  const openQrModal = async (instanceName: string) => {
    setQrModal({ instance: instanceName, base64: null, loading: true, error: null });
    await fetchQrAndMaybePoll(instanceName);
  };

  const fetchQrAndMaybePoll = async (instanceName: string) => {
    try {
      const res = await fetch(`/api/whatsapp/qrcode?instance=${encodeURIComponent(instanceName)}`, { credentials: 'include' });
      const data = await res.json();
      if (!res.ok) {
        setQrModal({ instance: instanceName, base64: null, loading: false, error: data.message || 'Erro ao gerar QR code.' });
        return;
      }

      if (data.state === 'open') {
        // Já estava conectado — fecha o modal e atualiza a lista.
        setQrModal(null);
        stopPolling();
        void loadStatus();
        return;
      }

      setQrModal({ instance: instanceName, base64: data.base64 || null, loading: false, error: null });

      // Poll de status a cada 3s até conectar; renova o QR a cada ~50s (expira em ~60s).
      stopPolling();
      let elapsed = 0;
      pollRef.current = setInterval(async () => {
        elapsed += 3;
        try {
          const statusRes = await fetch('/api/whatsapp/status', { credentials: 'include' });
          const statusData = await statusRes.json();
          const inst = (statusData.instances || []).find((i: InstanceStatus) => i.name === instanceName);
          if (inst?.state === 'open') {
            stopPolling();
            setQrModal(null);
            void loadStatus();
            return;
          }
        } catch {}

        if (elapsed >= 50) {
          elapsed = 0;
          void fetchQrAndMaybePoll(instanceName);
        }
      }, 3000);
    } catch {
      setQrModal({ instance: instanceName, base64: null, loading: false, error: 'Erro de rede ao gerar QR code.' });
    }
  };

  const closeQrModal = () => {
    stopPolling();
    setQrModal(null);
  };

  const handleLogout = async (instanceName: string) => {
    if (!window.confirm(`Desconectar o WhatsApp da instância "${instanceName}"? Você precisará escanear o QR code novamente.`)) return;
    try {
      await fetch('/api/whatsapp/logout', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ instance: instanceName }),
      });
      void loadStatus();
    } catch {}
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-7 h-7 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#00b09b', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  if (configured === false) {
    return (
      <div className="flex items-start gap-3 p-5 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20">
        <FiAlertCircle className="w-5 h-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
        <div>
          <p className="text-sm font-bold text-amber-800 dark:text-amber-200">Evolution API não configurada</p>
          <p className="text-xs text-amber-700 dark:text-amber-300/80 mt-1">
            Configure EVOLUTION_API_URL, EVOLUTION_API_KEY e EVOLUTION_INSTANCES no arquivo .env do servidor para habilitar a conexão do WhatsApp.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 w-full">
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Conecte o WhatsApp de cada desenvolvedor escaneando o QR code. As notificações de atualização de projeto são enviadas automaticamente pela instância vinculada a cada cliente.
        </p>
        <button
          onClick={() => void loadStatus()}
          className="shrink-0 p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
          title="Atualizar status"
        >
          <FiRefreshCw className="w-4 h-4" />
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-xs text-red-700 dark:text-red-300">
          <FiAlertCircle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      {instances.length === 0 ? (
        <div className="p-6 rounded-2xl text-center bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs text-slate-500 dark:text-slate-400">
          Nenhuma instância configurada. Defina EVOLUTION_INSTANCES no .env (nomes separados por vírgula, um por dev).
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {instances.map((inst) => {
            const cfg = STATE_CONFIG[inst.state];
            return (
              <div
                key={inst.name}
                className="rounded-2xl p-5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex flex-col gap-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-md shrink-0"
                      style={{ background: 'linear-gradient(135deg, #25D366, #128C7E)' }}
                    >
                      <FiSmartphone className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{inst.name}</p>
                      <span
                        className="inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full mt-1"
                        style={{ background: cfg.bg, color: cfg.color }}
                      >
                        {cfg.icon}
                        {cfg.label}
                      </span>
                    </div>
                  </div>
                </div>

                {inst.error && (
                  <p className="text-[11px] text-red-500 dark:text-red-400">{inst.error}</p>
                )}

                <div className="flex gap-2">
                  {inst.state === 'open' ? (
                    <button
                      onClick={() => handleLogout(inst.name)}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors"
                    >
                      <FiLogOut className="w-3.5 h-3.5" />
                      Desconectar
                    </button>
                  ) : (
                    <button
                      onClick={() => openQrModal(inst.name)}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white transition hover:opacity-90"
                      style={{ background: 'linear-gradient(135deg, #25D366, #128C7E)' }}
                    >
                      <FiSmartphone className="w-3.5 h-3.5" />
                      Conectar via QR Code
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* QR Code Modal */}
      {qrModal && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md"
          onClick={closeQrModal}
        >
          <div
            className="w-full max-w-sm rounded-2xl overflow-hidden bg-white dark:bg-[#0b1728] border border-slate-200 dark:border-white/15 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-5 border-b border-slate-100 dark:border-white/10 text-center">
              <h2 className="text-base font-black text-slate-900 dark:text-white">Conectar WhatsApp</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Instância: {qrModal.instance}</p>
            </div>

            <div className="p-8 flex flex-col items-center gap-4">
              {qrModal.loading ? (
                <div className="w-56 h-56 flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full border-[3px] animate-spin border-[#25D366] border-t-transparent" />
                </div>
              ) : qrModal.error ? (
                <div className="w-56 h-56 flex flex-col items-center justify-center gap-2 text-center">
                  <FiAlertCircle className="w-8 h-8 text-red-500" />
                  <p className="text-xs text-red-500">{qrModal.error}</p>
                </div>
              ) : qrModal.base64 ? (
                <div className="p-3 rounded-2xl bg-white shadow-inner border border-slate-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={qrModal.base64} alt="QR Code do WhatsApp" className="w-48 h-48" />
                </div>
              ) : (
                <div className="w-56 h-56 flex items-center justify-center text-center text-xs text-slate-400">
                  QR code indisponível no momento.
                </div>
              )}

              <div className="text-center">
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Abra o WhatsApp {'>'} Aparelhos conectados {'>'} Conectar aparelho
                </p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                  O QR code se renova automaticamente. Aguardando leitura...
                </p>
              </div>

              <button
                onClick={() => void fetchQrAndMaybePoll(qrModal.instance)}
                className="flex items-center gap-1.5 text-xs font-semibold text-[var(--color-accent)] hover:underline"
              >
                <FiRefreshCw className="w-3 h-3" /> Gerar novo QR code
              </button>
            </div>

            <div className="px-6 py-4 border-t border-slate-100 dark:border-white/10 flex justify-end">
              <button
                onClick={closeQrModal}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
