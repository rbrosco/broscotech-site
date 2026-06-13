"use client";
import React, { useEffect, useState } from "react";
import { FiEdit2, FiTrash2, FiPlus, FiX } from "react-icons/fi";

type User = {
  id: number;
  name: string;
  login: string;
  email: string;
  phone: string | null;
  role: string;
  created_at: string;
};

export default function UserManagement({ type }: { type: 'client' | 'team' }) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [login, setLogin] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState(type === 'client' ? 'client' : 'admin');

  useEffect(() => {
    loadUsers();
  }, [type]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/users?role=${type}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const openModal = (u?: User) => {
    if (u) {
      setEditingUser(u);
      setName(u.name);
      setLogin(u.login);
      setEmail(u.email);
      setPhone(u.phone || '');
      setRole(u.role);
      setPassword('');
    } else {
      setEditingUser(null);
      setName('');
      setLogin('');
      setEmail('');
      setPhone('');
      setRole(type === 'client' ? 'client' : 'admin');
      setPassword('');
    }
    setModalOpen(true);
  };

  const saveUser = async () => {
    try {
      if (editingUser) {
        const res = await fetch(`/api/users/${editingUser.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, login, email, phone, role, password })
        });
        if (res.ok) await loadUsers();
      } else {
        const res = await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, login, email, phone, role, password })
        });
        if (res.ok) await loadUsers();
      }
      setModalOpen(false);
    } catch (e) {
      console.error(e);
      alert('Erro ao salvar usuário');
    }
  };

  const deleteUser = async (id: number) => {
    if (!confirm('Deseja realmente excluir este usuário?')) return;
    try {
      const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
      if (res.ok) await loadUsers();
      else alert('Erro ao excluir: ' + (await res.json()).message);
    } catch (e) {
      console.error(e);
    }
  };

  const inputClass = "w-full rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/25 outline-none transition focus:ring-1 focus:ring-[#00b09b] bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10";

  return (
    <div className="flex flex-col gap-5 w-full">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            {type === 'client' ? 'Clientes' : 'Equipe'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {type === 'client' ? 'Gerencie as contas de clientes do sistema' : 'Gerencie administradores e membros da equipe'}
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 px-4 py-2 bg-[#00b09b] hover:bg-[#009b88] text-white text-sm font-semibold rounded-xl transition"
        >
          <FiPlus className="w-4 h-4" /> Novo
        </button>
      </div>

      <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-slate-400 text-xs uppercase">
                <th className="px-4 py-3 font-semibold">Nome</th>
                <th className="px-4 py-3 font-semibold">Login</th>
                <th className="px-4 py-3 font-semibold">E-mail</th>
                {type === 'team' && <th className="px-4 py-3 font-semibold">Função</th>}
                <th className="px-4 py-3 font-semibold text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-white/10">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-500">Carregando...</td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-500">Nenhum registro encontrado.</td>
                </tr>
              ) : (
                users.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition">
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{u.name}</td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{u.login}</td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{u.email}</td>
                    {type === 'team' && (
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${u.role === 'admin' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400' : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'}`}>
                          {u.role}
                        </span>
                      </td>
                    )}
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openModal(u)} className="p-1.5 text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400 transition" title="Editar">
                          <FiEdit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => deleteUser(u.id)} className="p-1.5 text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition" title="Excluir">
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

      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-white/10 shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 flex items-center justify-between border-b border-slate-200 dark:border-white/10">
              <h3 className="font-bold text-slate-900 dark:text-white">
                {editingUser ? 'Editar Usuário' : 'Novo Cadastro'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                <FiX className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 flex flex-col gap-4 overflow-y-auto">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Nome Completo</label>
                <input value={name} onChange={e => setName(e.target.value)} className={inputClass} placeholder="João Silva" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Login</label>
                  <input value={login} onChange={e => setLogin(e.target.value)} className={inputClass} placeholder="joaosilva" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Telefone</label>
                  <input value={phone} onChange={e => setPhone(e.target.value)} className={inputClass} placeholder="(11) 90000-0000" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">E-mail</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} className={inputClass} placeholder="joao@email.com" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                  {editingUser ? 'Nova Senha (deixe em branco para manter)' : 'Senha'}
                </label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} className={inputClass} placeholder="••••••••" />
              </div>
              {type === 'team' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Função</label>
                  <select value={role} onChange={e => setRole(e.target.value)} className={inputClass}>
                    <option value="admin">Administrador</option>
                    <option value="employee">Funcionário</option>
                  </select>
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-slate-200 dark:border-white/10 flex justify-end gap-3 bg-slate-50 dark:bg-white/[0.02]">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 rounded-xl transition">
                Cancelar
              </button>
              <button onClick={saveUser} className="px-4 py-2 bg-[#00b09b] hover:bg-[#009b88] text-white text-sm font-semibold rounded-xl transition shadow-md">
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
