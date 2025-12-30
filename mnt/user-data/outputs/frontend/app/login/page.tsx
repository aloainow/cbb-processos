'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authAPI } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { FiUser, FiLock } from 'react-icons/fi';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const data = await authAPI.login(email, senha);
      login(data.access_token, data.usuario);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erro ao fazer login. Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-sei-header to-sei-blue flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo e Título */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-white rounded-full mx-auto flex items-center justify-center shadow-lg mb-4">
            <span className="text-6xl">🏀</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">CBB</h1>
          <p className="text-blue-100">Sistema de Processos Eletrônicos</p>
        </div>
        
        {/* Card de Login */}
        <div className="bg-white rounded-lg shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
            Acessar o Sistema
          </h2>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="form-label">E-mail</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiUser className="text-gray-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-control pl-10"
                  placeholder="seu.email@cbb.com.br"
                  required
                  autoFocus
                />
              </div>
            </div>
            
            <div>
              <label className="form-label">Senha</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="text-gray-400" />
                </div>
                <input
                  type="password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className="form-control pl-10"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-lg font-semibold"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Problemas para acessar? Entre em contato com o suporte.
            </p>
          </div>
        </div>
        
        {/* Informações de Teste */}
        <div className="mt-6 bg-blue-900 bg-opacity-50 text-white rounded-lg p-4 text-sm">
          <p className="font-semibold mb-2">🔑 Usuários de Teste:</p>
          <p>• roberto@cbb.com.br / senha123</p>
          <p>• compras@cbb.com.br / senha123</p>
          <p>• financeiro@cbb.com.br / senha123</p>
        </div>
        
        <div className="mt-6 text-center text-white text-sm">
          <p>© 2024 Confederação Brasileira de Basketball</p>
          <p className="text-blue-200">Todos os direitos reservados</p>
        </div>
      </div>
    </div>
  );
}
