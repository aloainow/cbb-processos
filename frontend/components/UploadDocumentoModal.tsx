'use client';

import { useState } from 'react';
import { FiX, FiUpload, FiFile, FiAlertCircle } from 'react-icons/fi';

interface UploadDocumentoModalProps {
  processoId: number;
  processoProtocolo: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function UploadDocumentoModal({ 
  processoId, 
  processoProtocolo,
  isOpen, 
  onClose, 
  onSuccess 
}: UploadDocumentoModalProps) {
  const [loading, setLoading] = useState(false);
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    tipo_documento: '',
    descricao: '',
  });
  
  const tiposDocumento = [
    'Ofício',
    'Memorando',
    'Relatório',
    'Contrato',
    'Nota Fiscal',
    'Comprovante',
    'Ata',
    'Parecer',
    'Declaração',
    'Outros'
  ];
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setArquivo(file);
      
      // Preencher nome automaticamente se estiver vazio
      if (!formData.nome) {
        setFormData(prev => ({ ...prev, nome: file.name }));
      }
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!arquivo) {
      alert('Selecione um arquivo!');
      return;
    }
    
    setLoading(true);
    
    try {
      const formDataUpload = new FormData();
      formDataUpload.append('arquivo', arquivo);
      formDataUpload.append('processo_id', processoId.toString());
      formDataUpload.append('nome', formData.nome);
      formDataUpload.append('tipo_documento', formData.tipo_documento);
      formDataUpload.append('descricao', formData.descricao);
      
      const response = await fetch(`http://localhost:8000/api/processos/${processoId}/documentos`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formDataUpload
      });
      
      if (!response.ok) {
        throw new Error('Erro ao fazer upload');
      }
      
      alert('✅ Documento anexado com sucesso!');
      onSuccess();
      onClose();
      
      // Limpar form
      setFormData({ nome: '', tipo_documento: '', descricao: '' });
      setArquivo(null);
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
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-1">Anexar Documento</h2>
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
            <div className="flex items-start">
              <FiAlertCircle className="text-green-500 mt-0.5 mr-3 flex-shrink-0" size={20} />
              <div className="text-sm text-green-700">
                <p className="font-semibold mb-1">Formatos aceitos:</p>
                <p>PDF, Word (.doc, .docx), Excel (.xls, .xlsx), Imagens (.jpg, .png), ZIP</p>
                <p className="mt-1">Tamanho máximo: 10MB</p>
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Arquivo <span className="text-red-500">*</span>
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-green-500 transition-colors">
              <input
                type="file"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
                required
              />
              <label 
                htmlFor="file-upload"
                className="cursor-pointer"
              >
                {arquivo ? (
                  <div className="flex items-center justify-center space-x-3">
                    <FiFile className="text-green-600" size={32} />
                    <div className="text-left">
                      <p className="font-semibold text-gray-900">{arquivo.name}</p>
                      <p className="text-sm text-gray-500">
                        {(arquivo.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <FiUpload className="mx-auto text-gray-400 mb-4" size={48} />
                    <p className="text-gray-600 font-semibold mb-2">
                      Clique para selecionar um arquivo
                    </p>
                    <p className="text-sm text-gray-500">
                      ou arraste e solte aqui
                    </p>
                  </>
                )}
              </label>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Nome do Documento <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              required
              placeholder="Ex: Contrato de Prestação de Serviços"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all"
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Tipo de Documento <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.tipo_documento}
              onChange={(e) => setFormData({ ...formData, tipo_documento: e.target.value })}
              required
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all"
            >
              <option value="">Selecione o tipo</option>
              {tiposDocumento.map(tipo => (
                <option key={tipo} value={tipo}>{tipo}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Descrição
            </label>
            <textarea
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              rows={3}
              placeholder="Adicione uma breve descrição do documento..."
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all resize-none"
            />
          </div>
          
          <div className="flex items-center justify-end space-x-4 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all shadow-md hover:shadow-lg font-semibold"
            >
              Cancelar
            </button>
            
            <button
              type="submit"
              disabled={loading || !arquivo}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 disabled:from-gray-400 disabled:to-gray-500 transition-all shadow-lg hover:shadow-xl font-semibold"
            >
              <FiUpload />
              <span>{loading ? 'Enviando...' : 'Anexar Documento'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
