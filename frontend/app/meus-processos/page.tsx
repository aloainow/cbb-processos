'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { useAuthStore } from '@/lib/store';
import { FiFile, FiClock, FiUser, FiSearch } from 'react-icons/fi';

export default function MeusProcessosPage() {
  const router = useRouter();
  const { isAuthenticated, initAuth } = useAuthStore();
  const [processos, setProcessos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('');

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    loadProcessos();
  }, [isAuthenticated]);

  const loadProcessos = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/processos-meus', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setProcessos(data);
    } catch (error) {
      console.error('Erro ao carregar processos:', error);
    } finally {
      setLoading(false);
    }
  };

  const processosFiltrados = processos.filter(p => 
    p.numero_protocolo.toLowerCase().includes(filtro.toLowerCase()) ||
    p.assunto.toLowerCase().includes(filtro.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const badges: any = {
      'aberto': { bg: 'bg-blue-500', label: 'Aberto' },
      'em_tramite': { bg: 'bg-yellow-500', label: 'Em Tramitação' },
      'concluido': { bg: 'bg-green-500', label: 'Concluído' },
      'arquivado': { bg: 'bg-gray-500', label: 'Arquivado' },
    };
    const badge = badges[status] || badges['aberto'];
    return <span className={`px-3 py-1 rounded-full text-white text-sm font-semibold ${badge.bg}`}>{badge.label}</span>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Meus Processos</h1>
            <p className="text-gray-600">Processos criados por você</p>
          </div>

          <div className="mb-6">
            <div className="relative">
              <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buscar por protocolo ou assunto..."
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Carregando...</p>
            </div>
          ) : processosFiltrados.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
              <FiFile className="mx-auto text-gray-400 mb-4" size={64} />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                {filtro ? 'Nenhum processo encontrado' : 'Você ainda não criou nenhum processo'}
              </h3>
              <p className="text-gray-500 mb-6">
                {filtro ? 'Tente ajustar os filtros de busca' : 'Crie um novo processo para começar'}
              </p>
              {!filtro && (
                <button
                  onClick={() => router.push('/processos/novo')}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-lg"
                >
                  Criar Novo Processo
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {processosFiltrados.map((processo) => (
                <div
                  key={processo.id}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all p-6 cursor-pointer border-l-4 border-blue-500"
                  onClick={() => router.push(`/processos/${processo.id}`)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-800 mb-1">{processo.numero_protocolo}</h3>
                      <p className="text-gray-600 mb-3">{processo.assunto}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <FiClock size={16} />
                          <span>{new Date(processo.data_autuacao).toLocaleDateString('pt-BR')}</span>
                        </div>
                        <div className="capitalize">Prioridade: {processo.prioridade}</div>
                      </div>
                    </div>
                    <div>{getStatusBadge(processo.status)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
