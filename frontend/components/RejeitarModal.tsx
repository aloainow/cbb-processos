'use client';

import { useState } from 'react';
import { FiX, FiAlertTriangle } from 'react-icons/fi';

interface RejeitarModalProps {
  tramitacaoId: number;
  processoProtocolo: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function RejeitarModal({ 
  tramitacaoId,
  processoProtocolo,
  isOpen, 
  onClose, 
  onSuccess 
}: RejeitarModalProps) {
  const [loading, setLoading] = useState(false);
  const [motivo, setMotivo] = useState('');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!motivo.trim()) {
      alert('Por favor, informe o motivo da rejeição');
      return;
    }
    
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/tramitacoes/${tramitacaoId}/rejeitar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          motivo: motivo
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Erro ao rejeitar');
      }
      
      alert('✅ Processo rejeitado e devolvido ao setor de origem!');
      onSuccess();
      onClose();
      setMotivo('');
    } catch (error: any) {
      console.error('Erro:', error);
      alert(`❌ Erro: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full">
        <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-6 flex items-center justify-between rounded-t-2xl">
          <div>
            <h2 className="text-2xl font-bold mb-1">Rejeitar Processo</h2>
            <p className="text-red-100">{processoProtocolo}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
          >
            <FiX size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
            <div className="flex items-start">
              <FiAlertTriangle className="text-red-500 mt-0.5 mr-3 flex-shrink-0" size={20} />
              <div className="text-sm text-red-700">
                <p className="font-semibold mb-1">Atenção:</p>
                <p>O processo será devolvido ao setor de origem com seu motivo de rejeição.</p>
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Motivo da Rejeição <span className="text-red-500">*</span>
            </label>
            <textarea
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              rows={5}
              required
              placeholder="Descreva detalhadamente o motivo da rejeição..."
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all resize-none"
            />
            <p className="text-sm text-gray-500 mt-2">
              Este motivo será registrado no histórico e enviado ao setor de origem.
            </p>
          </div>
          
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
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 disabled:from-gray-400 disabled:to-gray-500 transition-all shadow-lg hover:shadow-xl font-semibold"
            >
              <FiAlertTriangle />
              <span>{loading ? 'Rejeitando...' : 'Rejeitar Processo'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
