'use client'; // Certifique-se de que este arquivo seja tratado no lado do cliente
import { useState } from 'react';
import Link from 'next/link'; // Importar Link
import { useRouter } from 'next/navigation'; // Alterado para next/navigation
import { FcGoogle } from 'react-icons/fc';
import { motion } from 'framer-motion';

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
    } catch {
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
    <motion.div
      className="w-full max-w-md mx-auto"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div className="w-full p-6 sm:p-8 rounded-2xl bg-white/95 dark:bg-gray-900/80 border border-black/10 dark:border-white/10 shadow-2xl">
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
          <FcGoogle className="w-5 h-5 mr-2" aria-hidden="true" />
          Entrar com Google
        </button>

        <p className="mt-8 text-center text-sm text-slate-700 dark:text-slate-400">
          Já tem uma conta?{' '}
          <Link href="/login" className="font-medium text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300 underline">
            Faça login
          </Link>
        </p>
      </div>
    </motion.div>
  );
};

export default Register;
