'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { useAuthStore } from '@/lib/store';
import { processosAPI } from '@/lib/api';
import { FiFolder, FiSearch, FiEye } from 'react-icons/fi';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function ProcessosPage() {
  const router = useRouter();
  const { isAuthenticated, initAuth } = useAuthStore();
  const [processos, setProcessos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  
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
  
  const processosFiltrados = processos.filter(p => 
    p.numero_protocolo.toLowerCase().includes(busca.toLowerCase()) ||
    p.assunto.toLowerCase().includes(busca.toLowerCase()) ||
    (p.interessado && p.interessado.toLowerCase().includes(busca.toLowerCase()))
  );
  
  const getStatusBadge = (status: string) => {
    const badges: any = {
      'aberto': 'badge-aberto',
      'em_tramite': 'badge-em-tramite',
      'concluido': 'badge-concluido',
      'arquivado': 'badge-arquivado',
    };
    
    return badges[status] || 'badge';
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sei-blue mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando processos...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 p-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Processos</h1>
            
            {/* Barra de Busca */}
            <div className="flex items-center space-x-4">
              <div className="flex-1 relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  placeholder="Buscar por protocolo, assunto ou interessado..."
                  className="form-control pl-10 w-full"
                />
              </div>
              
              <button
                onClick={() => router.push('/processos/novo')}
                className="btn-primary whitespace-nowrap"
              >
                Novo Processo
              </button>
            </div>
          </div>
          
          {/* Tabela de Processos */}
          <div className="card overflow-hidden">
            <table className="table-sei">
              <thead>
                <tr>
                  <th>Protocolo</th>
                  <th>Assunto</th>
                  <th>Interessado</th>
                  <th>Status</th>
                  <th>Data de Autuação</th>
                  <th className="text-center">Ações</th>
                </tr>
              </thead>
              <tbody>
                {processosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-500">
                      <FiFolder size={48} className="mx-auto mb-2 text-gray-400" />
                      <p>Nenhum processo encontrado</p>
                    </td>
                  </tr>
                ) : (
                  processosFiltrados.map((processo) => (
                    <tr key={processo.id}>
                      <td>
                        <span className="font-mono text-sei-blue font-semibold">
                          {processo.numero_protocolo}
                        </span>
                      </td>
                      <td>
                        <div className="max-w-md truncate" title={processo.assunto}>
                          {processo.assunto}
                        </div>
                      </td>
                      <td>{processo.interessado || '-'}</td>
                      <td>
                        <span className={`badge ${getStatusBadge(processo.status)}`}>
                          {processo.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td>
                        {format(new Date(processo.data_autuacao), 'dd/MM/yyyy', { locale: ptBR })}
                      </td>
                      <td className="text-center">
                        <button
                          onClick={() => router.push(`/processos/${processo.id}`)}
                          className="text-sei-blue hover:text-sei-blue-dark"
                          title="Visualizar processo"
                        >
                          <FiEye size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Informações */}
          <div className="mt-4 text-sm text-gray-600">
            <p>Total de processos: {processosFiltrados.length}</p>
          </div>
        </main>
      </div>
    </div>
  );
}
