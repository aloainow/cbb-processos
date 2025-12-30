'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { useAuthStore } from '@/lib/store';
import { processosAPI } from '@/lib/api';
import { FiSearch, FiFilter, FiEye, FiClock, FiCheckCircle, FiFolder } from 'react-icons/fi';

export default function ListarProcessosPage() {
  const router = useRouter();
  const { isAuthenticated, initAuth } = useAuthStore();
  const [processos, setProcessos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  
  useEffect(() => {
    initAuth();
  }, [initAuth]);
  
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    loadProcessos();
  }, [isAuthenticated, router]);
  
  const loadProcessos = async () => {
    try {
      const data = await processosAPI.listar();
      setProcessos(data);
    } catch (error) {
      console.error('Erro ao carregar processos:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const getStatusBadge = (status: string) => {
    const badges: any = {
      'aberto': { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Aberto' },
      'em_tramite': { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Em Tramitação' },
      'concluido': { bg: 'bg-green-100', text: 'text-green-800', label: 'Concluído' },
      'arquivado': { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Arquivado' },
    };
    const badge = badges[status] || badges['aberto'];
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };
  
  const getPrioridadeBadge = (prioridade: string) => {
    const badges: any = {
      'urgente': { bg: 'bg-red-100', text: 'text-red-800', label: 'Urgente' },
      'alta': { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Alta' },
      'normal': { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Normal' },
      'baixa': { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Baixa' },
    };
    const badge = badges[prioridade] || badges['normal'];
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };
  
  const processosFiltrados = processos
    .filter(p => {
      const matchSearch = p.numero_protocolo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         p.assunto?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = filtroStatus === 'todos' || p.status === filtroStatus;
      return matchSearch && matchStatus;
    });
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Carregando processos...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Processos</h1>
            <p className="text-gray-600 text-lg">Gerencie todos os processos do sistema</p>
          </div>
          
          {/* Filtros */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Buscar por protocolo ou assunto..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
              </div>
              
              <div className="relative">
                <FiFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <select
                  value={filtroStatus}
                  onChange={(e) => setFiltroStatus(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                >
                  <option value="todos">Todos os Status</option>
                  <option value="aberto">Aberto</option>
                  <option value="em_tramite">Em Tramitação</option>
                  <option value="concluido">Concluído</option>
                  <option value="arquivado">Arquivado</option>
                </select>
              </div>
            </div>
          </div>
          
          {/* Lista de Processos */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Protocolo</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Assunto</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Prioridade</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Criado em</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {processosFiltrados.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center">
                        <FiFolder className="mx-auto text-gray-400 mb-4" size={48} />
                        <p className="text-gray-500 text-lg">Nenhum processo encontrado</p>
                        <p className="text-gray-400 text-sm mt-2">Tente ajustar os filtros ou criar um novo processo</p>
                      </td>
                    </tr>
                  ) : (
                    processosFiltrados.map((processo) => (
                      <tr 
                        key={processo.id} 
                        className="hover:bg-blue-50 transition-colors cursor-pointer"
                        onClick={() => router.push(`/processos/${processo.id}`)}
                      >
                        <td className="px-6 py-4">
                          <span className="font-mono text-sm font-semibold text-blue-600">
                            {processo.numero_protocolo}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-medium text-gray-900">{processo.assunto}</p>
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(processo.status)}
                        </td>
                        <td className="px-6 py-4">
                          {getPrioridadeBadge(processo.prioridade)}
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-600">
                            {new Date(processo.criado_em).toLocaleDateString('pt-BR')}
                          </p>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/processos/${processo.id}`);
                            }}
                            className="inline-flex items-center space-x-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            <FiEye size={16} />
                            <span className="text-sm">Ver</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Estatísticas */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-gray-900">{processos.length}</p>
                </div>
                <FiFolder className="text-blue-600" size={32} />
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Filtrados</p>
                  <p className="text-2xl font-bold text-gray-900">{processosFiltrados.length}</p>
                </div>
                <FiFilter className="text-green-600" size={32} />
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Em Tramitação</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {processos.filter(p => p.status === 'em_tramite').length}
                  </p>
                </div>
                <FiClock className="text-yellow-600" size={32} />
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Concluídos</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {processos.filter(p => p.status === 'concluido').length}
                  </p>
                </div>
                <FiCheckCircle className="text-green-600" size={32} />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
