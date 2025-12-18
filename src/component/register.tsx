'use client'; // Certifique-se de que este arquivo seja tratado no lado do cliente
import { useState, useEffect } from 'react';
import Link from 'next/link'; // Importar Link
import { useRouter } from 'next/navigation'; // Alterado para next/navigation

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    login: '',
    email: '',
    password: '',
    phone: '', // Novo campo: telefone
  });
  const [termsAccepted, setTermsAccepted] = useState(false); // Novo estado para termos
  const [error, setError] = useState('');
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleTermsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTermsAccepted(e.target.checked);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { name, login, email, password } = formData;
    if (!name || !login || !email || !password) {
      setError('Nome, Login, E-mail e Senha são obrigatórios!');
      return;
    }

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        router.push('/login'); // router.push pode ser chamado diretamente
      } else {
        setError(data.message || 'Erro ao criar usuário');
      }
    } catch (error) {
      setError('Erro ao conectar com o servidor');
    }
  };

  // Função placeholder para login com Google
  const handleGoogleLogin = () => {
    // Aqui iria a lógica de autenticação com o Google OAuth
    // Por exemplo, redirecionar para a página de autenticação do Google
    // ou usar uma biblioteca como next-auth
    setError('Login com Google ainda não implementado.');
    console.log('Tentativa de login com Google');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 text-white pt-24 pb-12 px-4">
      <div className="w-full max-w-md p-6 sm:p-8 bg-white rounded-xl shadow-2xl dark:bg-gray-900">
        <h2 className="text-3xl font-semibold mb-6 text-center text-blue-600 dark:text-blue-400">
          Criar Nova Conta
        </h2>
        {error && <p className="text-red-500 dark:text-red-400 text-sm mb-4 p-2 bg-red-100 dark:bg-red-900/30 rounded-md text-center">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Nome Completo
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 transition-all duration-150 ease-in-out"
              placeholder="Seu nome completo"
            />
          </div>

          <div>
            <label htmlFor="login" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Nome de Usuário (Login)
            </label>
            <input
              type="text"
              id="login"
              name="login"
              value={formData.login}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 transition-all duration-150 ease-in-out"
              placeholder="Escolha um nome de usuário"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              E-mail
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 transition-all duration-150 ease-in-out"
              placeholder="seuemail@exemplo.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Senha
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 transition-all duration-150 ease-in-out"
              placeholder="Crie uma senha segura"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Telefone <span className="text-xs text-gray-500 dark:text-gray-400">(Opcional)</span>
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 transition-all duration-150 ease-in-out"
              placeholder="(XX) XXXXX-XXXX"
            />
          </div>

          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                checked={termsAccepted}
                onChange={handleTermsChange}
                required
                className="focus:ring-blue-500 dark:focus:ring-blue-400 h-4 w-4 text-blue-600 border-gray-300 rounded bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-blue-500"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="terms" className="font-medium text-gray-700 dark:text-gray-300">
                Eu li e aceito os{' '}
                <Link href="/termos" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-500 underline">
                  Termos de Serviço
                </Link>
                {' '}e a{' '}
                <Link href="/privacidade" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-500 underline">
                  Política de Privacidade
                </Link>
                .
              </label>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={!termsAccepted}
              className="w-full bg-blue-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-blue-400 dark:focus:ring-offset-gray-900 transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Criar Conta
            </button>
          </div>
        </form>

        <div className="my-6 flex items-center justify-center">
          <span className="h-px flex-grow bg-gray-300 dark:bg-gray-600"></span>
          <span className="mx-4 text-sm font-medium text-gray-500 dark:text-gray-400">OU</span>
          <span className="h-px flex-grow bg-gray-300 dark:bg-gray-600"></span>
        </div>

        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center px-6 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-blue-400 dark:focus:ring-offset-gray-900 transition-all duration-200 ease-in-out"
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            <path d="M1 1h22v22H1z" fill="none"/>
          </svg>
          Entrar com Google
        </button>

        <p className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
          Já tem uma conta?{' '}
          <Link href="/login" className="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-500 underline">
            Faça login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
