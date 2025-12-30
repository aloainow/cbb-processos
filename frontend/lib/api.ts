import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Cliente axios configurado
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token em todas as requisições
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para tratar erros de autenticação
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ==================== AUTH ====================
export const authAPI = {
  login: async (email: string, senha: string) => {
    const response = await api.post('/api/auth/login', { email, senha });
    return response.data;
  },
  
  getMe: async () => {
    const response = await api.get('/api/auth/me');
    return response.data;
  },
};

// ==================== PROCESSOS ====================
export const processosAPI = {
  criar: async (data: any) => {
    const response = await api.post('/api/processos', data);
    return response.data;
  },
  
  listar: async (params?: any) => {
    const response = await api.get('/api/processos-relevantes', { params });
    return response.data;
  },
  
  buscar: async (id: number) => {
    const response = await api.get(`/api/processos/${id}`);
    return response.data;
  },
  
  buscarPorProtocolo: async (protocolo: string) => {
    const response = await api.get(`/api/processos/protocolo/${protocolo}`);
    return response.data;
  },
  
  meus: async () => {
    const response = await api.get('/api/processos/meus/lista');
    return response.data;
  },
  
  doSetor: async (setorId: number) => {
    const response = await api.get(`/api/processos/setor/${setorId}`);
    return response.data;
  },
  
  atualizar: async (id: number, data: any) => {
    const response = await api.put(`/api/processos/${id}`, data);
    return response.data;
  },
  
  tramitar: async (id: number, data: any) => {
    const response = await api.post(`/api/processos/${id}/tramitar`, data);
    return response.data;
  },
  
  tramitacoes: async (id: number) => {
    const response = await api.get(`/api/processos/${id}/tramitacoes`);
    return response.data;
  },
  
  concluir: async (id: number) => {
    const response = await api.post(`/api/processos/${id}/concluir`);
    return response.data;
  },
  
  reabrir: async (id: number) => {
    const response = await api.post(`/api/processos/${id}/reabrir`);
    return response.data;
  },
  
  bloquear: async (id: number, motivo: string) => {
    const formData = new FormData();
    formData.append('motivo', motivo);
    const response = await api.post(`/api/processos/${id}/bloquear`, formData);
    return response.data;
  },
  
  desbloquear: async (id: number) => {
    const response = await api.post(`/api/processos/${id}/desbloquear`);
    return response.data;
  },
};

// ==================== DOCUMENTOS ====================
export const documentosAPI = {
  criar: async (data: any) => {
    const response = await api.post('/api/documentos', data);
    return response.data;
  },
  
  upload: async (processoId: number, arquivo: File, dados?: any) => {
    const formData = new FormData();
    formData.append('processo_id', processoId.toString());
    formData.append('arquivo', arquivo);
    if (dados?.tipo_documento) formData.append('tipo_documento', dados.tipo_documento);
    if (dados?.nome) formData.append('nome', dados.nome);
    if (dados?.descricao) formData.append('descricao', dados.descricao);
    
    const response = await api.post('/api/documentos/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  
  buscar: async (id: number) => {
    const response = await api.get(`/api/documentos/${id}`);
    return response.data;
  },
  
  listar: async (processoId: number) => {
    const response = await api.get(`/api/processos/${processoId}/documentos`);
    return response.data;
  },
  
  atualizar: async (id: number, data: any) => {
    const response = await api.put(`/api/documentos/${id}`, data);
    return response.data;
  },
  
  excluir: async (id: number) => {
    const response = await api.delete(`/api/documentos/${id}`);
    return response.data;
  },
};

// ==================== DASHBOARD ====================
export const dashboardAPI = {
  stats: async () => {
    const response = await api.get('/api/dashboard/stats');
    return response.data;
  },
};

// ==================== SETORES ====================
export const setoresAPI = {
  listar: async () => {
    const response = await api.get('/api/setores');
    return response.data;
  },
  
  buscar: async (id: number) => {
    const response = await api.get(`/api/setores/${id}`);
    return response.data;
  },
};

// ==================== TIPOS DE PROCESSO ====================
export const tiposProcessoAPI = {
  listar: async () => {
    const response = await api.get('/api/tipos-processo');
    return response.data;
  },
};

export default api;
