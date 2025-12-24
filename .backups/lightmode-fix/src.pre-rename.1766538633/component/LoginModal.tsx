"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { FiX } from "react-icons/fi";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export default function LoginModal({ isOpen, onClose }: Props) {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!identifier || !password) {
      setError("Preencha todos os campos.");
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Erro ao autenticar.");
        setIsLoading(false);
        return;
      }

      // Define cookie de token e armazena dados locais
      try {
        // server should set session cookie; client-side token fallback when provided
        if (data.token) {
          document.cookie = `token=${data.token}; path=/; max-age=604800; secure; samesite=strict`;
        }
      } catch {
        // ignore
      }

      onClose();
      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center">
      <div className="absolute inset-0 bg-white/600" onClick={onClose} />

      <div className="relative w-full max-w-md mx-4 bg-white/95 dark:bg-gray-900/95 rounded-2xl shadow-2xl border border-black/10 dark:border-white/10 p-6">
        <button
          aria-label="Fechar"
          className="absolute right-3 top-3 p-2 rounded-md hover:bg-white/60 dark:hover:bg-white/5"
          onClick={onClose}
        >
          <FiX className="w-5 h-5 text-slate-700 dark:text-white/80" />
        </button>

        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Entrar na sua conta</h3>
        <p className="text-sm text-slate-600 dark:text-white/75 mb-4">Use seu login ou e-mail para acessar.</p>

        {error && <div className="mb-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 p-2 rounded">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-700 dark:text-white/80">Usuário ou E-mail</label>
            <input
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-slate-900 dark:text-white"
              placeholder="seu_usuario ou email@exemplo.com"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-700 dark:text-white/80">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-slate-900 dark:text-white"
              placeholder="Sua senha"
            />
          </div>

          <div className="flex items-center justify-between">
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-slate-900 dark:text-white font-semibold hover:bg-slate-800 disabled:opacity-60"
            >
              {isLoading ? "Entrando..." : "Entrar"}
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                // abrir página de cadastro separada
                router.push('/register');
              }}
              className="text-sm text-slate-700 dark:text-white/80 underline"
            >
              Criar conta
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
