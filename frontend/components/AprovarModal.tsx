'use client';

import { useState } from 'react';
import { FiX, FiCheck } from 'react-icons/fi';

interface AprovarModalProps {
  tramitacaoId: number;
  processoProtocolo: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AprovarModal({ 
  tramitacaoId,
  processoProtocolo,
  isOpen, 
  onClose, 
  onSuccess 
}: AprovarModalProps) {
  const [loading, setLoading] = useState(false);
  const [observacao, setObservacao] = useState('');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/tramitacoes/${tramitacaoId}/aprovar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          observacao: observacao || undefined
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Erro ao aprovar');
      }
      
      alert('✅ Processo aprovado com sucesso!');
      onSuccess();
      onClose();
      setObservacao('');
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
        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6 flex items-center justify-between rounded-t-2xl">
          <div>
            <h2 className="text-2xl font-bold mb-1">Aprovar Processo</h2>
            <p className="text-green-100">{processoProtocolo}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
          >
            <FiX size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg">
            <p className="text-sm text-green-700">
              <strong>Atenção:</strong> Ao aprovar, o processo continuará seu fluxo normal.
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Observações (Opcional)
            </label>
            <textarea
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              rows={4}
              placeholder="Adicione observações sobre esta aprovação..."
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all resize-none"
            />
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
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 disabled:from-gray-400 disabled:to-gray-500 transition-all shadow-lg hover:shadow-xl font-semibold"
            >
              <FiCheck />
              <span>{loading ? 'Aprovando...' : 'Aprovar Processo'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
