'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { useAuthStore } from '@/lib/store';
import { dashboardAPI } from '@/lib/api';
import { FiFolder, FiFolderPlus, FiCheckCircle, FiClock, FiFileText, FiSend, FiTrendingUp, FiUsers } from 'react-icons/fi';

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
  
  const StatCard = ({ title, value, icon: Icon, gradient, onClick }: any) => (
    <div 
      className={`relative overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1 ${gradient} p-6`}
      onClick={onClick}
    >
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <div className="p-3 bg-white bg-opacity-20 rounded-lg backdrop-blur-sm">
            <Icon className="text-white" size={28} />
          </div>
          <div className="text-white text-opacity-80">
            <FiTrendingUp size={20} />
          </div>
        </div>
        <p className="text-white text-opacity-90 text-sm font-medium mb-1">{title}</p>
        <p className="text-white text-4xl font-bold">{value}</p>
      </div>
      <div className="absolute top-0 right-0 w-32 h-32 bg-white bg-opacity-10 rounded-full -mr-16 -mt-16"></div>
    </div>
  );
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Carregando dashboard...</p>
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
          {/* Header Section */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              Olá, {usuario?.nome?.split(' ')[0]}! 👋
            </h1>
            <p className="text-gray-600 text-lg">Aqui está o resumo do seu sistema de processos</p>
          </div>
          
          {stats && (
            <>
              {/* Main Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard 
                  title="Total de Processos" 
                  value={stats.total_processos} 
                  icon={FiFolder} 
                  gradient="bg-gradient-to-br from-blue-500 to-blue-600"
                  onClick={() => router.push('/processos')} 
                />
                <StatCard 
                  title="Processos Abertos" 
                  value={stats.processos_abertos} 
                  icon={FiFolderPlus} 
                  gradient="bg-gradient-to-br from-green-500 to-green-600"
                  onClick={() => router.push('/processos')} 
                />
                <StatCard 
                  title="Em Tramitação" 
                  value={stats.processos_em_tramite} 
                  icon={FiSend} 
                  gradient="bg-gradient-to-br from-yellow-500 to-orange-500"
                  onClick={() => router.push('/processos')} 
                />
                <StatCard 
                  title="Concluídos" 
                  value={stats.processos_concluidos} 
                  icon={FiCheckCircle} 
                  gradient="bg-gradient-to-br from-purple-500 to-purple-600"
                  onClick={() => router.push('/processos')} 
                />
              </div>
              
              {/* Secondary Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard 
                  title="Meus Processos" 
                  value={stats.meus_processos} 
                  icon={FiFileText} 
                  gradient="bg-gradient-to-br from-indigo-500 to-indigo-600"
                  onClick={() => router.push('/processos')} 
                />
                <StatCard 
                  title="Processos do Setor" 
                  value={stats.processos_meu_setor} 
                  icon={FiUsers} 
                  gradient="bg-gradient-to-br from-pink-500 to-pink-600"
                  onClick={() => router.push('/processos')} 
                />
                <StatCard 
                  title="Pendentes de Aprovação" 
                  value={stats.pendentes_aprovacao} 
                  icon={FiClock} 
                  gradient="bg-gradient-to-br from-orange-500 to-red-500"
                  onClick={() => {}} 
                />
                <StatCard 
                  title="Pendentes de Assinatura" 
                  value={stats.pendentes_assinatura} 
                  icon={FiFileText} 
                  gradient="bg-gradient-to-br from-red-500 to-red-600"
                  onClick={() => {}} 
                />
              </div>
            </>
          )}
          
          {/* Quick Actions Section */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center mb-6">
              <div className="p-3 bg-blue-100 rounded-lg mr-4">
                <FiFolder className="text-blue-600" size={28} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Ações Rápidas</h2>
                <p className="text-gray-600">Acesse rapidamente as funcionalidades principais</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button 
                onClick={() => router.push('/processos/novo')} 
                className="group relative overflow-hidden bg-gradient-to-br from-blue-600 to-blue-700 text-white py-6 px-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="flex items-center justify-center space-x-3">
                  <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                    <FiFolderPlus size={24} />
                  </div>
                  <span className="text-lg font-semibold">Novo Processo</span>
                </div>
                <div className="absolute top-0 right-0 w-24 h-24 bg-white bg-opacity-10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-300"></div>
              </button>
              
              <button 
                onClick={() => router.push('/processos')} 
                className="group relative overflow-hidden bg-gradient-to-br from-gray-600 to-gray-700 text-white py-6 px-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="flex items-center justify-center space-x-3">
                  <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                    <FiFolder size={24} />
                  </div>
                  <span className="text-lg font-semibold">Pesquisar Processo</span>
                </div>
                <div className="absolute top-0 right-0 w-24 h-24 bg-white bg-opacity-10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-300"></div>
              </button>
              
              <button 
                onClick={() => router.push('/processos')} 
                className="group relative overflow-hidden bg-gradient-to-br from-purple-600 to-purple-700 text-white py-6 px-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="flex items-center justify-center space-x-3">
                  <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                    <FiFileText size={24} />
                  </div>
                  <span className="text-lg font-semibold">Meus Processos</span>
                </div>
                <div className="absolute top-0 right-0 w-24 h-24 bg-white bg-opacity-10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-300"></div>
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
