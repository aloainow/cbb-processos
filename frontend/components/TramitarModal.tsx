'use client';

import { useState, useEffect } from 'react';
import { FiX, FiSend, FiInfo, FiFileText, FiCheckCircle } from 'react-icons/fi';

interface TramitarModalProps {
  processoId: number;
  processoProtocolo: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function TramitarModal({ 
  processoId, 
  processoProtocolo,
  isOpen, 
  onClose, 
  onSuccess 
}: TramitarModalProps) {
  const [setores, setSetores] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [tipoTramitacao, setTipoTramitacao] = useState('despacho');
  const [formData, setFormData] = useState({
    setor_destino_id: '',
    observacao: ''
  });
  
  useEffect(() => {
    if (isOpen) {
      loadSetores();
    }
  }, [isOpen]);
  
  const loadSetores = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/setores', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setSetores(data);
    } catch (error) {
      console.error('Erro ao carregar setores:', error);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.setor_destino_id) {
      alert('Selecione um setor de destino');
      return;
    }
    
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/processos/${processoId}/tramitar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          setor_destino_id: parseInt(formData.setor_destino_id),
          tipo_tramitacao: tipoTramitacao
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Erro ao tramitar');
      }
      
      alert('✅ Processo tramitado com sucesso!');
      onSuccess();
      onClose();
      setFormData({ setor_destino_id: '', observacao: '' });
      setTipoTramitacao('despacho');
    } catch (error: any) {
      console.error('Erro:', error);
      alert(`❌ Erro: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  if (!isOpen) return null;
  
  const getTipoInfo = () => {
    const tipos: any = {
      despacho: {
        icon: FiInfo,
        color: 'blue',
        titulo: 'Despacho Informativo',
        desc: 'Envia o processo para conhecimento/ciência. Não requer aprovação.'
      },
      parecer: {
        icon: FiFileText,
        color: 'purple',
        titulo: 'Solicitação de Parecer',
        desc: 'Solicita opinião técnica do setor. O processo pode continuar mesmo sem parecer.'
      },
      aprovacao: {
        icon: FiCheckCircle,
        color: 'green',
        titulo: 'Solicitação de Aprovação',
        desc: 'Requer decisão formal (aprovar/rejeitar). O processo fica bloqueado até decisão.'
      }
    };
    return tipos[tipoTramitacao] || tipos.despacho;
  };
  
  const info = getTipoInfo();
  const Icon = info.icon;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 flex items-center justify-between rounded-t-2xl">
          <div>
            <h2 className="text-2xl font-bold mb-1">Tramitar Processo</h2>
            <p className="text-blue-100">{processoProtocolo}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
          >
            <FiX size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Tipo de Tramitação */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Tipo de Tramitação <span className="text-red-500">*</span>
            </label>
            
            <div className="space-y-3">
              {/* Despacho */}
              <label className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
                tipoTramitacao === 'despacho' 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-300 hover:border-blue-300'
              }`}>
                <input
                  type="radio"
                  name="tipo"
                  value="despacho"
                  checked={tipoTramitacao === 'despacho'}
                  onChange={(e) => setTipoTramitacao(e.target.value)}
                  className="mt-1 mr-3"
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <FiInfo className="text-blue-600" size={20} />
                    <span className="font-semibold text-gray-900">Despacho Informativo</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Envia para conhecimento. Não requer aprovação.
                  </p>
                </div>
              </label>
              
              {/* Parecer */}
              <label className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
                tipoTramitacao === 'parecer' 
                  ? 'border-purple-500 bg-purple-50' 
                  : 'border-gray-300 hover:border-purple-300'
              }`}>
                <input
                  type="radio"
                  name="tipo"
                  value="parecer"
                  checked={tipoTramitacao === 'parecer'}
                  onChange={(e) => setTipoTramitacao(e.target.value)}
                  className="mt-1 mr-3"
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <FiFileText className="text-purple-600" size={20} />
                    <span className="font-semibold text-gray-900">Solicitação de Parecer</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Solicita opinião técnica. Pode continuar sem parecer.
                  </p>
                </div>
              </label>
              
              {/* Aprovação */}
              <label className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
                tipoTramitacao === 'aprovacao' 
                  ? 'border-green-500 bg-green-50' 
                  : 'border-gray-300 hover:border-green-300'
              }`}>
                <input
                  type="radio"
                  name="tipo"
                  value="aprovacao"
                  checked={tipoTramitacao === 'aprovacao'}
                  onChange={(e) => setTipoTramitacao(e.target.value)}
                  className="mt-1 mr-3"
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <FiCheckCircle className="text-green-600" size={20} />
                    <span className="font-semibold text-gray-900">Solicitação de Aprovação</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Requer decisão formal. Bloqueia até aprovação/rejeição.
                  </p>
                </div>
              </label>
            </div>
          </div>
          
          {/* Setor Destino */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Para qual setor? <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.setor_destino_id}
              onChange={(e) => setFormData({ ...formData, setor_destino_id: e.target.value })}
              required
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
            >
              <option value="">Selecione um setor</option>
              {setores.map((setor) => (
                <option key={setor.id} value={setor.id}>
                  {setor.sigla} - {setor.nome}
                </option>
              ))}
            </select>
          </div>
          
          {/* Observação */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Observações
            </label>
            <textarea
              value={formData.observacao}
              onChange={(e) => setFormData({ ...formData, observacao: e.target.value })}
              rows={4}
              placeholder="Adicione informações relevantes sobre esta tramitação..."
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all resize-none"
            />
          </div>
          
          {/* Info Box */}
          <div className={`bg-${info.color}-50 border-l-4 border-${info.color}-500 p-4 rounded-lg`}>
            <div className="flex items-start">
              <Icon className={`text-${info.color}-600 mt-0.5 mr-3 flex-shrink-0`} size={20} />
              <div className={`text-sm text-${info.color}-700`}>
                <p className="font-semibold mb-1">{info.titulo}</p>
                <p>{info.desc}</p>
              </div>
            </div>
          </div>
          
          {/* Botões */}
          <div className="flex items-center justify-end space-x-4 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all shadow-md hover:shadow-lg font-semibold"
            >
              Cancelar
            </button>
            
            <button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 transition-all shadow-lg hover:shadow-xl font-semibold"
            >
              <FiSend />
              <span>{loading ? 'Tramitando...' : 'Tramitar Processo'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
