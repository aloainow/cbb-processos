import { create } from 'zustand';

interface Usuario {
  id: number;
  nome: string;
  email: string;
  setor_id?: number;
  cargo?: string;
}

interface AuthStore {
  token: string | null;
  usuario: Usuario | null;
  isAuthenticated: boolean;
  login: (token: string, usuario: Usuario) => void;
  logout: () => void;
  initAuth: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  token: null,
  usuario: null,
  isAuthenticated: false,
  
  login: (token, usuario) => {
    localStorage.setItem('token', token);
    localStorage.setItem('usuario', JSON.stringify(usuario));
    set({ token, usuario, isAuthenticated: true });
  },
  
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    set({ token: null, usuario: null, isAuthenticated: false });
  },
  
  initAuth: () => {
    const token = localStorage.getItem('token');
    const usuarioStr = localStorage.getItem('usuario');
    if (token && usuarioStr) {
      const usuario = JSON.parse(usuarioStr);
      set({ token, usuario, isAuthenticated: true });
    }
  },
}));

// Store para processos
interface ProcessosStore {
  processos: any[];
  processoSelecionado: any | null;
  loading: boolean;
  setProcessos: (processos: any[]) => void;
  setProcessoSelecionado: (processo: any | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useProcessosStore = create<ProcessosStore>((set) => ({
  processos: [],
  processoSelecionado: null,
  loading: false,
  
  setProcessos: (processos) => set({ processos }),
  setProcessoSelecionado: (processo) => set({ processoSelecionado: processo }),
  setLoading: (loading) => set({ loading }),
}));

// Store para documentos
interface DocumentosStore {
  documentos: any[];
  documentoSelecionado: any | null;
  setDocumentos: (documentos: any[]) => void;
  setDocumentoSelecionado: (documento: any | null) => void;
}

export const useDocumentosStore = create<DocumentosStore>((set) => ({
  documentos: [],
  documentoSelecionado: null,
  
  setDocumentos: (documentos) => set({ documentos }),
  setDocumentoSelecionado: (documento) => set({ documentoSelecionado: documento }),
}));
