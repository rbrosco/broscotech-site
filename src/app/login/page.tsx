'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Header from '../../component/Header';

export default function LoginPage() {
  const [identifier, setIdentifier] = useState(''); // Pode ser login ou email
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!identifier || !password) {
      setError('Por favor, preencha todos os campos.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Login bem-sucedido
        // Em uma aplicação real, você armazenaria o token/sessão aqui
        // e atualizaria o estado global de autenticação.
        console.log('Login bem-sucedido:', data.message);
        // Exemplo: Salvar dados do usuário no localStorage (simplificado)
        localStorage.setItem('userData', JSON.stringify(data.user));
        localStorage.setItem('isLoggedIn', 'true');
        
        router.push('/dashboard'); // Redireciona para o dashboard ou página principal
      } else {
        setError(data.message || 'Falha no login. Verifique suas credenciais.');
      }
    } catch (err) {
      console.error('Erro de conexão:', err);
      setError('Erro ao conectar com o servidor. Tente novamente mais tarde.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 text-white pt-24 pb-12 px-4">
      <div className="w-full max-w-md p-6 sm:p-8 bg-white rounded-xl shadow-2xl dark:bg-gray-900">
        <h2 className="text-3xl font-semibold mb-6 text-center text-blue-600 dark:text-blue-400">
          Acessar Conta
        </h2>
        {error && (
          <p className="text-red-500 dark:text-red-400 text-sm mb-4 p-2 bg-red-100 dark:bg-red-900/30 rounded-md text-center">
            {error}
          </p>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="identifier"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Nome de Usuário ou E-mail
            </label>
            <input
              type="text"
              id="identifier"
              name="identifier"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
              className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 transition-all duration-150 ease-in-out"
              placeholder="seu_usuario ou email@exemplo.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Senha
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 transition-all duration-150 ease-in-out"
              placeholder="Sua senha"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-blue-400 dark:focus:ring-offset-gray-900 transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Entrando...' : 'Entrar'}
            </button>
          </div>
        </form>

        <p className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
          Não tem uma conta?{' '}
          <Link href="/register" className="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-500 underline">
            Cadastre-se
          </Link>
        </p>
      </div>
    </div>
  );
}