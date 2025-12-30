'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { useAuthStore } from '@/lib/store';
import { processosAPI, setoresAPI, tiposProcessoAPI } from '@/lib/api';
import { FiSave, FiX, FiAlertCircle } from 'react-icons/fi';

export default function NovoProcessoPage() {
  const router = useRouter();
  const { isAuthenticated, initAuth, usuario } = useAuthStore();
  
  const [loading, setLoading] = useState(false);
  const [setores, setSetores] = useState<any[]>([]);
  const [tiposProcesso, setTiposProcesso] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    tipo_processo_id: '',
    assunto: '',
    descricao: '',
    prioridade: 'normal',
    setor_destino_id: '',
  });
  
  useEffect(() => {
    initAuth();
  }, [initAuth]);
  
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    loadData();
  }, [isAuthenticated, router]);
  
  const loadData = async () => {
    try {
      const [setoresData, tiposData] = await Promise.all([
        setoresAPI.listar(),
        tiposProcessoAPI.listar(),
      ]);
      setSetores(setoresData);
      setTiposProcesso(tiposData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await processosAPI.criar({
        ...formData,
        tipo_processo_id: parseInt(formData.tipo_processo_id),
        setor_destino_id: parseInt(formData.setor_destino_id),
      });
      
      alert('Processo criado com sucesso!');
      router.push('/processos');
    } catch (error) {
      console.error('Erro ao criar processo:', error);
      alert('Erro ao criar processo. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-800 mb-2">Novo Processo</h1>
              <p className="text-gray-600 text-lg">Preencha os dados para criar um novo processo eletrônico</p>
            </div>
            
            {/* Form Card */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Tipo de Processo */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Tipo de Processo <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="tipo_processo_id"
                    value={formData.tipo_processo_id}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                  >
                    <option value="">Selecione o tipo de processo</option>
                    {tiposProcesso.map(tipo => (
                      <option key={tipo.id} value={tipo.id}>{tipo.nome}</option>
                    ))}
                  </select>
                </div>
                
                {/* Assunto */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Assunto <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="assunto"
                    value={formData.assunto}
                    onChange={handleChange}
                    required
                    maxLength={200}
                    placeholder="Digite o assunto do processo"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                  />
                </div>
                
                {/* Descrição */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Descrição
                  </label>
                  <textarea
                    name="descricao"
                    value={formData.descricao}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Descreva os detalhes do processo..."
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all resize-none"
                  />
                </div>
                
                {/* Prioridade */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Prioridade <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="prioridade"
                    value={formData.prioridade}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                  >
                    <option value="baixa">Baixa</option>
                    <option value="normal">Normal</option>
                    <option value="alta">Alta</option>
                    <option value="urgente">Urgente</option>
                  </select>
                </div>
                
                {/* Setor Destino */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Setor Destino <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="setor_destino_id"
                    value={formData.setor_destino_id}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                  >
                    <option value="">Selecione o setor de destino</option>
                    {setores.map(setor => (
                      <option key={setor.id} value={setor.id}>{setor.nome}</option>
                    ))}
                  </select>
                </div>
                
                {/* Info Box */}
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
                  <div className="flex items-start">
                    <FiAlertCircle className="text-blue-500 mt-0.5 mr-3 flex-shrink-0" size={20} />
                    <div className="text-sm text-blue-700">
                      <p className="font-semibold mb-1">Informações importantes:</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>O processo será criado no seu setor atual</li>
                        <li>Após a criação, o processo será tramitado para o setor destino</li>
                        <li>Você poderá adicionar documentos após criar o processo</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                {/* Botões */}
                <div className="flex items-center justify-end space-x-4 pt-6 border-t">
                  <button
                    type="button"
                    onClick={() => router.push('/processos')}
                    className="flex items-center space-x-2 px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all shadow-md hover:shadow-lg"
                  >
                    <FiX />
                    <span>Cancelar</span>
                  </button>
                  
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 transition-all shadow-lg hover:shadow-xl"
                  >
                    <FiSave />
                    <span>{loading ? 'Criando...' : 'Criar Processo'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
