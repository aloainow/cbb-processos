'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import TramitarModal from '@/components/TramitarModal';
import UploadDocumentoModal from '@/components/UploadDocumentoModal';
import AprovarModal from '@/components/AprovarModal';
import RejeitarModal from '@/components/RejeitarModal';
import { useAuthStore } from '@/lib/store';
import { processosAPI, documentosAPI } from '@/lib/api';
import { 
  FiArrowLeft, FiSend, FiUpload, FiDownload, FiFile, 
  FiClock, FiUser, FiCalendar, FiAlertCircle, FiCheckCircle,
  FiFolder, FiTag, FiArrowRight, FiCheck, FiX, FiArchive
} from 'react-icons/fi';

export default function DetalhesProcessoPage() {
  const router = useRouter();
  const params = useParams();
  const { isAuthenticated, initAuth, usuario } = useAuthStore();
  
  const [processo, setProcesso] = useState<any>(null);
  const [documentos, setDocumentos] = useState<any[]>([]);
  const [tramitacoes, setTramitacoes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'documentos' | 'historico'>('documentos');
  const [showTramitarModal, setShowTramitarModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showAprovarModal, setShowAprovarModal] = useState(false);
  const [showRejeitarModal, setShowRejeitarModal] = useState(false);
  const [tramitacaoPendente, setTramitacaoPendente] = useState<any>(null);
  
  // Cache de dados
  const [usuarios, setUsuarios] = useState<{[key: number]: any}>({});
  const [setores, setSetores] = useState<{[key: number]: any}>({});
  const [tiposProcesso, setTiposProcesso] = useState<{[key: number]: any}>({});
  
  useEffect(() => {
    initAuth();
  }, [initAuth]);
  
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    loadProcesso();
  }, [isAuthenticated, params.id]);
  
  const loadProcesso = async () => {
    try {
      const id = parseInt(params.id as string);
      const [processoData, docsData, tramData] = await Promise.all([
        processosAPI.buscar(id),
        documentosAPI.listar(id).catch(() => []),
        processosAPI.tramitacoes(id).catch(() => []),
      ]);
      
      setProcesso(processoData);
      setDocumentos(docsData);
      setTramitacoes(tramData);
      
      // Verificar se há tramitação pendente para o setor do usuário
      const pendente = tramData.find((t: any) => 
        t.setor_destino_id === usuario?.setor_id && 
        t.status_aprovacao === 'pendente'
      );
      setTramitacaoPendente(pendente);
      
      // Carregar dados relacionados
      await loadRelatedData(processoData, tramData);
    } catch (error) {
      console.error('Erro ao carregar processo:', error);
      alert('Processo não encontrado');
      router.push('/processos');
    } finally {
      setLoading(false);
    }
  };
  
  const loadRelatedData = async (processo: any, tramitacoes: any[]) => {
    try {
      const response = await fetch('http://localhost:8000/api/setores', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const setoresData = await response.json();
      const setoresMap: any = {};
      setoresData.forEach((s: any) => setoresMap[s.id] = s);
      setSetores(setoresMap);
      
      const userIds = new Set([
        processo.criado_por,
        ...tramitacoes.map((t: any) => t.enviado_por).filter(Boolean)
      ]);
      
      const usersMap: any = {};
      for (const userId of userIds) {
        try {
          const userRes = await fetch(`http://localhost:8000/api/usuarios/${userId}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
          });
          if (userRes.ok) {
            const userData = await userRes.json();
            usersMap[userId] = userData;
          }
        } catch (e) {
          console.error(`Erro ao carregar usuário ${userId}:`, e);
        }
      }
      setUsuarios(usersMap);
      
      const tiposRes = await fetch('http://localhost:8000/api/tipos-processo', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (tiposRes.ok) {
        const tiposData = await tiposRes.json();
        const tiposMap: any = {};
        tiposData.forEach((t: any) => tiposMap[t.id] = t);
        setTiposProcesso(tiposMap);
      }
    } catch (error) {
      console.error('Erro ao carregar dados relacionados:', error);
    }
  };
  
  const handleConcluir = async () => {
    if (!confirm('Deseja realmente concluir este processo?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/processos/${processo.id}/concluir`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) throw new Error('Erro ao concluir');
      
      alert('✅ Processo concluído com sucesso!');
      loadProcesso();
    } catch (error) {
      alert('❌ Erro ao concluir processo');
    }
  };
  
  const handleArquivar = async () => {
    if (!confirm('Deseja realmente arquivar este processo?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/processos/${processo.id}/arquivar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) throw new Error('Erro ao arquivar');
      
      alert('✅ Processo arquivado com sucesso!');
      loadProcesso();
    } catch (error) {
      alert('❌ Erro ao arquivar processo');
    }
  };
  
  const getStatusBadge = (status: string) => {
    const badges: any = {
      'aberto': { bg: 'bg-blue-500', icon: FiFolder, label: 'Aberto' },
      'em_tramite': { bg: 'bg-yellow-500', icon: FiSend, label: 'Em Tramitação' },
      'concluido': { bg: 'bg-green-500', icon: FiCheckCircle, label: 'Concluído' },
      'arquivado': { bg: 'bg-gray-500', icon: FiFolder, label: 'Arquivado' },
    };
    const badge = badges[status] || badges['aberto'];
    const Icon = badge.icon;
    
    return (
      <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg ${badge.bg} text-white`}>
        <Icon size={18} />
        <span className="font-semibold">{badge.label}</span>
      </div>
    );
  };
  
  const getPrioridadeColor = (prioridade: string) => {
    const colors: any = {
      'urgente': 'border-red-500 bg-red-50',
      'alta': 'border-orange-500 bg-orange-50',
      'normal': 'border-blue-500 bg-blue-50',
      'baixa': 'border-gray-500 bg-gray-50',
    };
    return colors[prioridade] || colors['normal'];
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Carregando processo...</p>
        </div>
      </div>
    );
  }
  
  if (!processo) return null;
  
  const criador = usuarios[processo.criado_por];
  const setorCriador = criador ? setores[criador.setor_id] : null;
  const tipoProcesso = tiposProcesso[processo.tipo_processo_id];
  // Pegar usuario do localStorage se o store não tiver
  const usuarioLocal = usuario || JSON.parse(localStorage.getItem('usuario') || '{}');
  const podeAprovar = tramitacaoPendente && usuarioLocal?.setor_id === tramitacaoPendente.setor_destino_id;
  const processoAtivo = processo.status !== 'concluido' && processo.status !== 'arquivado';
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="mb-6">
            <button
              onClick={() => router.push('/processos')}
              className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 mb-4 transition-colors"
            >
              <FiArrowLeft />
              <span>Voltar para processos</span>
            </button>
            
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-4xl font-bold text-gray-800 mb-2">
                  {processo.numero_protocolo}
                </h1>
                <p className="text-xl text-gray-600">{processo.assunto}</p>
              </div>
              {getStatusBadge(processo.status)}
            </div>
          </div>
          
          {/* Alerta de Aprovação Pendente */}
          {podeAprovar && (
            <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-between">
                <div className="flex items-start space-x-3">
                  <FiAlertCircle className="text-yellow-600 mt-1" size={24} />
                  <div>
                    <h3 className="text-lg font-bold text-yellow-900 mb-1">
                      Aprovação Pendente
                    </h3>
                    <p className="text-yellow-800">
                      Este processo está aguardando sua aprovação.
                    </p>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowRejeitarModal(true)}
                    className="flex items-center space-x-2 px-5 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all shadow-md hover:shadow-lg font-semibold"
                  >
                    <FiX size={18} />
                    <span>Rejeitar</span>
                  </button>
                  <button
                    onClick={() => setShowAprovarModal(true)}
                    className="flex items-center space-x-2 px-5 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all shadow-md hover:shadow-lg font-semibold"
                  >
                    <FiCheck size={18} />
                    <span>Aprovar</span>
                  </button>
                </div>
              </div>
            </div>
          )}
          
          <div className={`bg-white rounded-2xl shadow-xl overflow-hidden border-l-8 ${getPrioridadeColor(processo.prioridade)} mb-6`}>
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                <div className="flex items-start space-x-3">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <FiTag className="text-blue-600" size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Tipo</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {tipoProcesso ? tipoProcesso.nome : `Processo #${processo.tipo_processo_id}`}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <FiAlertCircle className="text-purple-600" size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Prioridade</p>
                    <p className="text-lg font-semibold text-gray-900 capitalize">{processo.prioridade}</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <FiCalendar className="text-green-600" size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Data de Autuação</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {new Date(processo.data_autuacao).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <FiUser className="text-orange-600" size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Criado por</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {criador ? criador.nome : `Usuário #${processo.criado_por}`}
                    </p>
                    {setorCriador && (
                      <p className="text-sm text-gray-500">{setorCriador.nome}</p>
                    )}
                  </div>
                </div>
                
                {processo.interessado && (
                  <div className="flex items-start space-x-3">
                    <div className="p-3 bg-indigo-100 rounded-lg">
                      <FiUser className="text-indigo-600" size={24} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Interessado</p>
                      <p className="text-lg font-semibold text-gray-900">{processo.interessado}</p>
                    </div>
                  </div>
                )}
                
                {processo.data_prazo && (
                  <div className="flex items-start space-x-3">
                    <div className="p-3 bg-red-100 rounded-lg">
                      <FiClock className="text-red-600" size={24} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Prazo</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {new Date(processo.data_prazo).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                )}
              </div>
              
              {processo.especificacao && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Especificação:</p>
                  <p className="text-gray-600">{processo.especificacao}</p>
                </div>
              )}
              
              {processo.observacoes && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                  <p className="text-sm font-semibold text-blue-900 mb-2">Observações:</p>
                  <p className="text-blue-800 whitespace-pre-line">{processo.observacoes}</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Botões de Ação */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {processoAtivo && (
              <button 
                onClick={() => setShowTramitarModal(true)}
                className="flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105"
              >
                <FiSend size={20} />
                <span className="font-semibold">Tramitar</span>
              </button>
            )}
            
            {processoAtivo && (
              <button 
                onClick={() => setShowUploadModal(true)}
                className="flex items-center justify-center space-x-2 bg-gradient-to-r from-green-600 to-green-700 text-white py-4 rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105"
              >
                <FiUpload size={20} />
                <span className="font-semibold">Anexar Documento</span>
              </button>
            )}
            
            {processoAtivo && processo.status === 'em_tramite' && (
              <button 
                onClick={handleConcluir}
                className="flex items-center justify-center space-x-2 bg-gradient-to-r from-green-600 to-green-700 text-white py-4 rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105"
              >
                <FiCheckCircle size={20} />
                <span className="font-semibold">Concluir Processo</span>
              </button>
            )}
            
            {processo.status === 'concluido' && (
              <button 
                onClick={handleArquivar}
                className="flex items-center justify-center space-x-2 bg-gradient-to-r from-gray-600 to-gray-700 text-white py-4 rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105"
              >
                <FiArchive size={20} />
                <span className="font-semibold">Arquivar</span>
              </button>
            )}
            
            <button 
              onClick={() => alert('Geração de relatório em breve!')}
              className="flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white py-4 rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105"
            >
              <FiDownload size={20} />
              <span className="font-semibold">Gerar Relatório</span>
            </button>
          </div>
          
          {/* Abas de Documentos e Histórico - continua igual ao arquivo anterior */}
          
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="flex border-b">
              <button
                onClick={() => setTab('documentos')}
                className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                  tab === 'documentos'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <FiFile />
                  <span>Documentos ({documentos.length})</span>
                </div>
              </button>
              
              <button
                onClick={() => setTab('historico')}
                className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                  tab === 'historico'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <FiClock />
                  <span>Histórico ({tramitacoes.length})</span>
                </div>
              </button>
            </div>
            
            <div className="p-8">
              {tab === 'documentos' ? (
                <div>
                  {documentos.length === 0 ? (
                    <div className="text-center py-12">
                      <FiFile className="mx-auto text-gray-400 mb-4" size={48} />
                      <p className="text-gray-500 text-lg">Nenhum documento anexado</p>
                      <p className="text-gray-400 text-sm mt-2">Clique em "Anexar Documento" para adicionar arquivos</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {documentos.map((doc: any) => (
                        <div key={doc.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                          <div className="flex items-center space-x-3">
                            <FiFile className="text-blue-600" size={24} />
                            <div>
                              <p className="font-semibold text-gray-900">{doc.nome}</p>
                              <p className="text-sm text-gray-600">{doc.tipo_documento}</p>
                            </div>
                          </div>
                          <button 
                            onClick={async () => {
                              try {
                                const token = localStorage.getItem('token');
                                const response = await fetch(`http://localhost:8000/api/documentos/${doc.id}/download`, {
                                  headers: { 'Authorization': `Bearer ${token}` }
                                });
                                
                                if (!response.ok) throw new Error('Download falhou');
                                
                                const blob = await response.blob();
                                const url = window.URL.createObjectURL(blob);
                                const link = document.createElement('a');
                                link.href = url;
                                link.download = doc.arquivo_nome || doc.nome;
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                                window.URL.revokeObjectURL(url);
                              } catch (error) {
                                alert('Erro ao baixar arquivo');
                                console.error(error);
                              }
                            }}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            <FiDownload size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  {tramitacoes.length === 0 ? (
                    <div className="text-center py-12">
                      <FiClock className="mx-auto text-gray-400 mb-4" size={48} />
                      <p className="text-gray-500 text-lg">Nenhuma tramitação registrada</p>
                      <p className="text-gray-400 text-sm mt-2">O histórico aparecerá quando o processo for tramitado</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {tramitacoes.map((tram: any, index: number) => {
                        const setorOrigem = setores[tram.setor_origem_id];
                        const setorDestino = setores[tram.setor_destino_id];
                        const enviadoPor = usuarios[tram.enviado_por];
                        const statusAprovacao = tram.status_aprovacao || 'pendente';
                        
                        return (
                          <div key={tram.id} className="relative pl-8 pb-6 last:pb-0">
                            <div className={`absolute left-0 top-0 w-4 h-4 rounded-full border-4 border-white shadow ${
                              statusAprovacao === 'aprovado' ? 'bg-green-600' :
                              statusAprovacao === 'rejeitado' ? 'bg-red-600' :
                              'bg-yellow-500'
                            }`}></div>
                            {index < tramitacoes.length - 1 && (
                              <div className="absolute left-2 top-4 w-0.5 h-full bg-blue-200"></div>
                            )}
                            <div className={`rounded-xl p-6 ml-4 shadow-md hover:shadow-lg transition-all border-l-4 ${
                              statusAprovacao === 'aprovado' ? 'bg-gradient-to-r from-green-50 to-white border-green-500' :
                              statusAprovacao === 'rejeitado' ? 'bg-gradient-to-r from-red-50 to-white border-red-500' :
                              'bg-gradient-to-r from-yellow-50 to-white border-yellow-500'
                            }`}>
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center space-x-3">
                                  <div className="font-semibold text-gray-900 flex items-center space-x-2">
                                    <span className="text-blue-600">
                                      {setorOrigem ? setorOrigem.sigla : `#${tram.setor_origem_id}`}
                                    </span>
                                    <FiArrowRight className="text-gray-400" />
                                    <span className="text-green-600">
                                      {setorDestino ? setorDestino.sigla : `#${tram.setor_destino_id}`}
                                    </span>
                                  </div>
                                  {statusAprovacao === 'aprovado' && (
                                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded">
                                      APROVADO
                                    </span>
                                  )}
                                  {statusAprovacao === 'rejeitado' && (
                                    <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded">
                                      REJEITADO
                                    </span>
                                  )}
                                  {statusAprovacao === 'pendente' && (
                                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded">
                                      PENDENTE
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-gray-500">
                                  {new Date(tram.data_envio).toLocaleString('pt-BR')}
                                </p>
                              </div>
                              <div className="text-sm text-gray-600">
                                <p>
                                  <strong>De:</strong> {setorOrigem ? setorOrigem.nome : `Setor #${tram.setor_origem_id}`}
                                </p>
                                <p>
                                  <strong>Para:</strong> {setorDestino ? setorDestino.nome : `Setor #${tram.setor_destino_id}`}
                                </p>
                                <p>
                                  <strong>Tramitado por:</strong> {enviadoPor ? enviadoPor.nome : `Usuário #${tram.enviado_por}`}
                                </p>
                              </div>
                              {tram.observacao && (
                                <div className="mt-3 p-3 bg-white rounded-lg border border-blue-100">
                                  <p className="text-sm font-semibold text-gray-700 mb-1">Observação:</p>
                                  <p className="text-sm text-gray-600 whitespace-pre-line">{tram.observacao}</p>
                                </div>
                              )}
                              {tram.motivo_rejeicao && (
                                <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-200">
                                  <p className="text-sm font-semibold text-red-900 mb-1">Motivo da Rejeição:</p>
                                  <p className="text-sm text-red-700">{tram.motivo_rejeicao}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
      
      {processo && tramitacaoPendente && (
        <>
          <TramitarModal
            processoId={processo.id}
            processoProtocolo={processo.numero_protocolo}
            isOpen={showTramitarModal}
            onClose={() => setShowTramitarModal(false)}
            onSuccess={loadProcesso}
          />
          
          <UploadDocumentoModal
            processoId={processo.id}
            processoProtocolo={processo.numero_protocolo}
            isOpen={showUploadModal}
            onClose={() => setShowUploadModal(false)}
            onSuccess={loadProcesso}
          />
          
          <AprovarModal
            tramitacaoId={tramitacaoPendente.id}
            processoProtocolo={processo.numero_protocolo}
            isOpen={showAprovarModal}
            onClose={() => setShowAprovarModal(false)}
            onSuccess={loadProcesso}
          />
          
          <RejeitarModal
            tramitacaoId={tramitacaoPendente.id}
            processoProtocolo={processo.numero_protocolo}
            isOpen={showRejeitarModal}
            onClose={() => setShowRejeitarModal(false)}
            onSuccess={loadProcesso}
          />
        </>
      )}
      
      {processo && !tramitacaoPendente && (
        <>
          <TramitarModal
            processoId={processo.id}
            processoProtocolo={processo.numero_protocolo}
            isOpen={showTramitarModal}
            onClose={() => setShowTramitarModal(false)}
            onSuccess={loadProcesso}
          />
          
          <UploadDocumentoModal
            processoId={processo.id}
            processoProtocolo={processo.numero_protocolo}
            isOpen={showUploadModal}
            onClose={() => setShowUploadModal(false)}
            onSuccess={loadProcesso}
          />
        </>
      )}
    </div>
  );
}
