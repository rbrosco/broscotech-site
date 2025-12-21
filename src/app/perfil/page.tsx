'use client';

import { useEffect, useState } from 'react';
import DashboardNav from '../../component/DashboardNav';
import DashboardSidebar from '../../component/DashboardSidebar';

type Profile = {
  id: number;
  name: string;
  login: string;
  email: string;
  phone: string | null;
  role: string;
  created_at: string;
  updated_at: string;
};

type ProfileResponse = {
  profile: Profile;
};

export default function PerfilPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [login, setLogin] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const load = async () => {
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch('/api/profile', { credentials: 'include' });
      const payload = (await res.json()) as Partial<ProfileResponse> & { message?: string };
      if (!res.ok) throw new Error(payload.message || 'Falha ao carregar perfil.');
      if (!payload.profile) throw new Error('Resposta inválida do servidor.');

      const p = payload.profile as Profile;
      setProfile(p);
      setName(p.name ?? '');
      setLogin(p.login ?? '');
      setEmail(p.email ?? '');
      setPhone(p.phone ?? '');
    } catch (e) {
      setProfile(null);
      setError(e instanceof Error ? e.message : 'Erro desconhecido.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const onSave = async () => {
    setSaving(true);
    setError(null);
    setMessage(null);

    try {
      const body: Record<string, unknown> = {
        name,
        login,
        email,
        phone,
      };

      if (currentPassword || newPassword) {
        body.currentPassword = currentPassword;
        body.newPassword = newPassword;
      }

      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      });

      const payload = (await res.json()) as { message?: string; profile?: Profile };
      if (!res.ok) throw new Error(payload.message || 'Falha ao salvar perfil.');

      if (payload.profile) {
        setProfile(payload.profile);
        setName(payload.profile.name ?? '');
        setLogin(payload.profile.login ?? '');
        setEmail(payload.profile.email ?? '');
        setPhone(payload.profile.phone ?? '');
      }

      setCurrentPassword('');
      setNewPassword('');
      setMessage(payload.message || 'Salvo.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao salvar.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full relative flex ct-docs-disable-sidebar-content bg-blueGray-100 dark:bg-gray-900 min-h-screen min-w-0">
      <DashboardSidebar />
      <div className="relative md:ml-64 bg-blueGray-100 dark:bg-gray-900 w-full min-w-0 flex-1">
        <DashboardNav />

        <div className="px-4 md:px-6 mx-auto w-full pt-24 pb-10 min-w-0">
          <div className="rounded-3xl bg-white/90 dark:bg-gray-800/80 backdrop-blur-md border border-white/20 dark:border-gray-700/50 shadow-2xl p-5 sm:p-6 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white">Perfil</h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Altere seus dados quando quiser.</p>

            {loading ? (
              <p className="mt-6 text-sm text-slate-600 dark:text-slate-300">Carregando…</p>
            ) : error ? (
              <p className="mt-6 text-sm text-red-600 dark:text-red-400">{error}</p>
            ) : !profile ? (
              <p className="mt-6 text-sm text-slate-600 dark:text-slate-300">Perfil não encontrado.</p>
            ) : (
              <div className="mt-6 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Nome</label>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-200 dark:border-gray-700 bg-white/90 dark:bg-gray-900/40 px-3 py-2 text-sm text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Login</label>
                    <input
                      value={login}
                      onChange={(e) => setLogin(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-200 dark:border-gray-700 bg-white/90 dark:bg-gray-900/40 px-3 py-2 text-sm text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">E-mail</label>
                    <input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      type="email"
                      className="mt-1 w-full rounded-xl border border-slate-200 dark:border-gray-700 bg-white/90 dark:bg-gray-900/40 px-3 py-2 text-sm text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Telefone</label>
                    <input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="(00) 00000-0000"
                      className="mt-1 w-full rounded-xl border border-slate-200 dark:border-gray-700 bg-white/90 dark:bg-gray-900/40 px-3 py-2 text-sm text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Senha atual</label>
                    <input
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      type="password"
                      className="mt-1 w-full rounded-xl border border-slate-200 dark:border-gray-700 bg-white/90 dark:bg-gray-900/40 px-3 py-2 text-sm text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Nova senha</label>
                    <input
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      type="password"
                      className="mt-1 w-full rounded-xl border border-slate-200 dark:border-gray-700 bg-white/90 dark:bg-gray-900/40 px-3 py-2 text-sm text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => void onSave()}
                    disabled={saving}
                    className="rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2 text-sm font-medium disabled:opacity-60"
                  >
                    {saving ? 'Salvando…' : 'Salvar alterações'}
                  </button>
                  {message ? <p className="text-sm text-emerald-700 dark:text-emerald-400">{message}</p> : null}
                  {error ? <p className="text-sm text-red-600 dark:text-red-400">{error}</p> : null}
                </div>

                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Última atualização: {new Date(profile.updated_at).toLocaleString()}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
