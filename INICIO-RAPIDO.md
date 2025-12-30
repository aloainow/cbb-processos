# 🚀 Início Rápido - Sistema de Gestão de Processos CBB

## ⚡ 3 Passos para Rodar

### 1️⃣ Configure o Banco (5 minutos)

1. Acesse: https://supabase.com/dashboard/project/bzhvhuiwnxccqvnqfymm
2. Vá em **SQL Editor**
3. Cole todo o conteúdo de `database/schema.sql`
4. Clique em **RUN**
5. Crie um bucket chamado `documentos` em **Storage**

### 2️⃣ Rode o Backend (2 minutos)

```bash
cd backend
pip install -r requirements.txt
python main.py
```

✅ API rodando em: http://localhost:8000
📚 Documentação: http://localhost:8000/docs

### 3️⃣ Teste a API (1 minuto)

```bash
python backend/test_api.py
```

## 🔑 Login de Teste

- **Email:** roberto@cbb.com.br
- **Senha:** senha123

Outros usuários disponíveis (mesma senha):
- maria@cbb.com.br (Diretora Administrativa)
- compras@cbb.com.br (Compras)
- financeiro@cbb.com.br (Financeiro)
- presidente@cbb.com.br (Presidência)
- juridico@cbb.com.br (Jurídico)

## 📋 O que o Sistema Faz

✅ **Gestão de Processos**
- Criar processos com protocolo automático
- Tramitar entre setores
- Acompanhar status e prazos
- Histórico completo

✅ **Documentos**
- Upload de arquivos
- Documentos gerados internamente
- Visualização em árvore
- Controle de versões

✅ **Workflow**
- Aprovações em múltiplos níveis
- Assinaturas eletrônicas
- Notificações (em desenvolvimento)

✅ **Dashboard**
- Estatísticas em tempo real
- Processos pendentes
- Meu setor
- Meus processos

## 🌐 Deploy no Replit

1. Vá em: https://replit.com
2. Clique em **Create Repl** → **Import from GitHub** ou **Upload files**
3. Faça upload desta pasta completa
4. Configure os **Secrets**:
   - SUPABASE_URL (já está no .env)
   - SUPABASE_KEY (já está no .env)
   - SUPABASE_SERVICE_KEY (já está no .env)
   - SECRET_KEY (gere um novo!)
5. Clique em **Run**

## 🔧 Gerando Nova Secret Key

```python
import secrets
print(secrets.token_urlsafe(32))
# Cole o resultado no .env na variável SECRET_KEY
```

## 📊 Estrutura do Projeto

```
/
├── backend/              # API FastAPI
│   ├── app/
│   │   ├── services/    # Lógica de negócio
│   │   ├── utils/       # Autenticação e helpers
│   │   ├── models.py    # Modelos Pydantic
│   │   ├── config.py    # Configurações
│   │   └── database.py  # Conexão Supabase
│   ├── main.py          # App principal
│   ├── test_api.py      # Script de teste
│   └── requirements.txt
│
├── database/
│   └── schema.sql       # Schema completo do banco
│
├── README.md            # Documentação principal
└── INSTALACAO.md        # Guia detalhado
```

## 🎯 Próximos Passos

Agora que o backend está rodando:

1. **Teste todos os endpoints** em http://localhost:8000/docs
2. **Crie alguns processos** via API
3. **Experimente tramitar** entre setores
4. **Faça upload** de documentos

## 📞 Precisa de Ajuda?

- Documentação da API: http://localhost:8000/docs
- Veja o `INSTALACAO.md` para guia completo
- Teste com `python backend/test_api.py`

## ✨ Features Implementadas

✅ Autenticação JWT
✅ CRUD completo de processos
✅ Tramitação entre setores
✅ Upload de documentos
✅ Histórico de tramitações
✅ Dashboard com estatísticas
✅ Busca e filtros
✅ Níveis de acesso (público, restrito, sigiloso)
✅ Sistema de aprovações
✅ Assinaturas eletrônicas
✅ API REST completa e documentada

## 🔜 Próximas Features

⏳ Frontend Next.js (em desenvolvimento)
⏳ Notificações em tempo real
⏳ Integração Gov.br para assinatura digital
⏳ Relatórios e exportação
⏳ Mobile app
⏳ OCR para documentos

---

**🏀 Desenvolvido para CBB - Confederação Brasileira de Basketball**
**⚡ MVP Completo - Backend Pronto para Produção**
