'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { useAuthStore } from '@/lib/store';
import { dashboardAPI } from '@/lib/api';
import { 
  FiFolder, 
  FiFolderPlus, 
  FiCheckCircle, 
  FiClock,
  FiFileText,
  FiSend
} from 'react-icons/fi';

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, initAuth, usuario } = useAuthStore();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    initAuth();
  }, [initAuth]);
  
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    
    loadStats();
  }, [isAuthenticated, router]);
  
  const loadStats = async () => {
    try {
      const data = await dashboardAPI.stats();
      setStats(data);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const StatCard = ({ title, value, icon: Icon, color, onClick }: any) => (
    <div 
      className={`card p-6 hover:shadow-md transition-shadow cursor-pointer border-l-4 ${color}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-600 text-sm font-semibold mb-2">{title}</p>
          <p className="text-3xl font-bold text-gray-800">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${color.replace('border-l', 'bg').replace('600', '100')}`}>
          <Icon size={24} className={color.replace('border-l-', 'text-')} />
        </div>
      </div>
    </div>
  );
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sei-blue mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
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
          {/* Boas-vindas */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Bem-vindo, {usuario?.nome}!
            </h1>
            <p className="text-gray-600">
              Confira o resumo dos processos e documentos do sistema.
            </p>
          </div>
          
          {/* Cards de Estatísticas */}
          {stats && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                  title="Total de Processos"
                  value={stats.total_processos}
                  icon={FiFolder}
                  color="border-l-blue-600"
                  onClick={() => router.push('/processos')}
                />
                
                <StatCard
                  title="Processos Abertos"
                  value={stats.processos_abertos}
                  icon={FiFolderPlus}
                  color="border-l-green-600"
                  onClick={() => router.push('/processos?status=aberto')}
                />
                
                <StatCard
                  title="Em Tramitação"
                  value={stats.processos_em_tramite}
                  icon={FiSend}
                  color="border-l-yellow-600"
                  onClick={() => router.push('/processos?status=em_tramite')}
                />
                
                <StatCard
                  title="Concluídos"
                  value={stats.processos_concluidos}
                  icon={FiCheckCircle}
                  color="border-l-gray-600"
                  onClick={() => router.push('/processos?status=concluido')}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                  title="Meus Processos"
                  value={stats.meus_processos}
                  icon={FiFileText}
                  color="border-l-purple-600"
                  onClick={() => router.push('/processos/meus')}
                />
                
                <StatCard
                  title="Processos do Setor"
                  value={stats.processos_meu_setor}
                  icon={FiFolder}
                  color="border-l-indigo-600"
                  onClick={() => router.push('/processos/setor')}
                />
                
                <StatCard
                  title="Pendentes de Aprovação"
                  value={stats.pendentes_aprovacao}
                  icon={FiClock}
                  color="border-l-orange-600"
                  onClick={() => router.push('/processos?pendentes=aprovacao')}
                />
                
                <StatCard
                  title="Pendentes de Assinatura"
                  value={stats.pendentes_assinatura}
                  icon={FiFileText}
                  color="border-l-red-600"
                  onClick={() => router.push('/processos?pendentes=assinatura')}
                />
              </div>
            </>
          )}
          
          {/* Ações Rápidas */}
          <div className="card p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Ações Rápidas</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => router.push('/processos/novo')}
                className="btn-primary py-4 flex items-center justify-center space-x-2"
              >
                <FiFolderPlus size={20} />
                <span>Novo Processo</span>
              </button>
              
              <button
                onClick={() => router.push('/processos/buscar')}
                className="btn-secondary py-4 flex items-center justify-center space-x-2"
              >
                <FiFolder size={20} />
                <span>Pesquisar Processo</span>
              </button>
              
              <button
                onClick={() => router.push('/processos/meus')}
                className="bg-purple-600 text-white hover:bg-purple-700 py-4 flex items-center justify-center space-x-2 px-4 rounded transition-colors"
              >
                <FiFileText size={20} />
                <span>Meus Processos</span>
              </button>
            </div>
          </div>
          
          {/* Informações do Sistema */}
          <div className="mt-8 card p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Sobre o Sistema</h2>
            <div className="text-sm text-gray-600 space-y-2">
              <p>
                <strong>Sistema:</strong> CBB - Gestão de Processos Eletrônicos
              </p>
              <p>
                <strong>Versão:</strong> 1.0.0
              </p>
              <p>
                <strong>Usuário:</strong> {usuario?.nome} ({usuario?.email})
              </p>
              <p>
                <strong>Cargo:</strong> {usuario?.cargo || 'N/A'}
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
