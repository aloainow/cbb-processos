# 🎨 Frontend - Sistema CBB

## ✨ O Que Foi Criado

Frontend Next.js 14 completo seguindo o **padrão visual do SEI** (Sistema Eletrônico de Informações do Governo Federal).

### Características Visuais SEI
- ✅ Cores azul institucional (#003d82, #0066cc)
- ✅ Layout com cabeçalho fixo azul
- ✅ Barra lateral de navegação
- ✅ Tabelas com listras zebradas
- ✅ Badges coloridos para status
- ✅ Árvore de documentos expansível
- ✅ Interface limpa e profissional

---

## 📁 Estrutura do Frontend

```
frontend/
├── app/                         # Next.js App Router
│   ├── globals.css             # Estilos globais (SEI style)
│   ├── layout.tsx              # Layout raiz
│   ├── page.tsx                # Página inicial (redireciona)
│   │
│   ├── login/
│   │   └── page.tsx            # 🔐 Página de login
│   │
│   ├── dashboard/
│   │   └── page.tsx            # 📊 Dashboard principal
│   │
│   └── processos/
│       ├── page.tsx            # 📋 Listagem de processos
│       └── [id]/
│           └── page.tsx        # 📄 Visualização com árvore
│
├── components/
│   ├── Header.tsx              # Cabeçalho estilo SEI
│   └── Sidebar.tsx             # Menu lateral
│
├── lib/
│   ├── api.ts                  # Cliente API (axios)
│   └── store.ts                # Estado global (zustand)
│
├── package.json                # Dependências
├── tsconfig.json               # Config TypeScript
├── tailwind.config.js          # Config Tailwind (cores SEI)
├── next.config.js              # Config Next.js
└── .env.local                  # Variáveis de ambiente
```

---

## 🚀 Como Rodar

### 1. Instalar Dependências (3 min)

```bash
cd frontend
npm install
```

### 2. Configurar Backend (1 min)

Edite `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 3. Rodar (1 min)

```bash
npm run dev
```

Acesse: **http://localhost:3000**

---

## 🎨 Páginas Implementadas

### 1. Login (/login)
- ✅ Design estilo SEI
- ✅ Formulário de autenticação
- ✅ Validação de campos
- ✅ Integração com backend
- ✅ Usuários de teste visíveis

### 2. Dashboard (/dashboard)
- ✅ Cards com estatísticas
- ✅ Total de processos por status
- ✅ Meus processos
- ✅ Processos do setor
- ✅ Pendências
- ✅ Ações rápidas
- ✅ Design responsivo

### 3. Listagem de Processos (/processos)
- ✅ Tabela estilo SEI
- ✅ Busca em tempo real
- ✅ Filtro por protocolo/assunto
- ✅ Badges de status
- ✅ Ordenação
- ✅ Link para visualização

### 4. Visualização de Processo (/processos/[id])
- ✅ **Árvore de documentos** (lateral esquerda)
- ✅ Visualização de documento (central)
- ✅ Histórico de tramitações (aba)
- ✅ Informações do processo
- ✅ Botões de ação
- ✅ Layout de 3 colunas

---

## 🎯 Funcionalidades Principais

### Autenticação
- [x] Login JWT
- [x] Armazenamento de token
- [x] Proteção de rotas
- [x] Logout
- [x] Refresh automático

### Dashboard
- [x] Estatísticas em tempo real
- [x] Cards clicáveis
- [x] Navegação rápida
- [x] Informações do usuário

### Processos
- [x] Listagem completa
- [x] Busca e filtros
- [x] Visualização detalhada
- [x] Árvore de documentos
- [x] Histórico de tramitações
- [x] Download de anexos

### Navegação
- [x] Menu lateral fixo
- [x] Breadcrumbs
- [x] Links rápidos
- [x] Indicador de página ativa

---

## 🎨 Componentes Visuais SEI

### Cores
```css
--sei-header: #003d82      /* Azul escuro cabeçalho */
--sei-blue: #0066cc         /* Azul principal */
--sei-blue-dark: #004d99    /* Azul hover */
--sei-gray: #f5f5f5         /* Fundo cinza claro */
--sei-border: #cccccc       /* Bordas */
```

### Badges de Status
- 🔵 **Aberto** - Azul claro
- 🟡 **Em Trâmite** - Amarelo
- 🟢 **Concluído** - Verde
- ⚪ **Arquivado** - Cinza

### Badges de Prioridade
- 🔴 **Urgente** - Vermelho
- 🟠 **Alta** - Laranja
- 🔵 **Normal** - Azul
- ⚪ **Baixa** - Cinza

---

## 📱 Responsividade

Todas as telas são responsivas:
- ✅ Desktop (1920px+)
- ✅ Laptop (1366px)
- ✅ Tablet (768px)
- ✅ Mobile (375px+)

---

## 🔧 Tecnologias Usadas

- **Next.js 14** - Framework React
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **Axios** - Requisições HTTP
- **Zustand** - Gerenciamento de estado
- **React Icons** - Ícones
- **date-fns** - Formatação de datas

---

## 🚀 Deploy

### Opção 1: Vercel (Recomendado)

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
cd frontend
vercel
```

### Opção 2: Replit

1. Criar novo Repl Next.js
2. Upload dos arquivos do frontend
3. Configurar .env:
   ```
   NEXT_PUBLIC_API_URL=https://seu-backend.replit.app
   ```
4. Run!

### Opção 3: Netlify

```bash
npm run build
# Fazer upload da pasta .next no Netlify
```

---

## 📊 Screenshots

### Login
```
┌─────────────────────────────────────┐
│           🏀 CBB                    │
│  Sistema de Processos Eletrônicos  │
│                                     │
│  [       E-mail        ]            │
│  [       Senha         ]            │
│  [      ENTRAR        ]             │
│                                     │
│  Usuários de teste: ...             │
└─────────────────────────────────────┘
```

### Dashboard
```
┌─────────────────────────────────────────────────┐
│ CBB - Sistema   [Processos] [Novo]    [Usuário]│
├─────────┬───────────────────────────────────────┤
│ Menu    │ Bem-vindo, Roberto!                   │
│         │                                       │
│ Início  │ [Total: 156] [Abertos: 45] [...]     │
│ Process │                                       │
│ Novo    │ Ações Rápidas                        │
│ Meus    │ [Novo Processo] [Pesquisar] [...]    │
│ Setor   │                                       │
└─────────┴───────────────────────────────────────┘
```

### Árvore de Documentos
```
┌─────────────────────────────────────────────────┐
│ 2024.CBB.000001-0 - Aquisição de Notebooks     │
├──────────────┬──────────────────────────────────┤
│ Árvore │Hist│ Visualização do Documento         │
│              │                                   │
│ 📄 Doc 001  │ Parecer Técnico                  │
│ 📄 Doc 002  │ Análise dos equipamentos...      │
│ 📎 Doc 003  │                                   │
│ 📝 Doc 004  │ [Conteúdo HTML renderizado]      │
│              │                                   │
└──────────────┴──────────────────────────────────┘
```

---

## 🔜 Próximas Features (Não Implementadas)

### Curto Prazo
- [ ] Página de criação de processo
- [ ] Formulário de tramitação
- [ ] Upload de documentos
- [ ] Editor HTML para docs internos
- [ ] Busca avançada com filtros

### Médio Prazo
- [ ] Sistema de notificações
- [ ] Assinatura de documentos
- [ ] Aprovação de processos
- [ ] Relatórios e exportação
- [ ] Impressão de processos

### Longo Prazo
- [ ] PWA (Progressive Web App)
- [ ] Notificações push
- [ ] Modo offline
- [ ] Chat interno
- [ ] Integração Gov.br

---

## 💡 Dicas de Desenvolvimento

### Adicionar Nova Página

1. Criar arquivo em `app/nova-pagina/page.tsx`
2. Adicionar no menu lateral (Sidebar.tsx)
3. Proteger rota se necessário

### Adicionar Novo Componente

```tsx
// components/MeuComponente.tsx
export default function MeuComponente() {
  return (
    <div className="card p-6">
      Conteúdo
    </div>
  );
}
```

### Fazer Chamada à API

```tsx
import { processosAPI } from '@/lib/api';

const data = await processosAPI.listar();
```

### Usar Estado Global

```tsx
import { useAuthStore } from '@/lib/store';

const { usuario, isAuthenticated } = useAuthStore();
```

---

## 🐛 Troubleshooting

### Erro: "Cannot find module"
```bash
rm -rf node_modules package-lock.json
npm install
```

### Erro: "API não responde"
- Verifique se o backend está rodando
- Confirme a URL em .env.local
- Veja o console do navegador (F12)

### Erro: "Token inválido"
- Faça logout e login novamente
- Limpe o localStorage
- Verifique se o backend está acessível

---

## 📞 Suporte

- **Documentação Next.js:** https://nextjs.org/docs
- **Tailwind CSS:** https://tailwindcss.com/docs
- **React Icons:** https://react-icons.github.io/react-icons

---

**🎨 Frontend Completo no Estilo SEI**
**✅ Pronto para uso e extensão**
**📱 Responsivo e Moderno**
