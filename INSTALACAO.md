# Guia de Instalação e Deploy - Sistema de Gestão de Processos CBB

## 📋 Pré-requisitos

- Conta no Supabase (já configurada)
- Python 3.11+
- Node.js 18+ (para o frontend quando criado)

## 🚀 Instalação Rápida

### Passo 1: Configurar o Banco de Dados

1. Acesse o Supabase: https://supabase.com/dashboard
2. Entre no seu projeto: `bzhvhuiwnxccqvnqfymm`
3. Vá em **SQL Editor**
4. Cole e execute o conteúdo de `database/schema.sql`
5. Aguarde a conclusão (pode levar 1-2 minutos)

### Passo 2: Configurar Storage no Supabase

1. No Supabase, vá em **Storage**
2. Crie um novo bucket chamado `documentos`
3. Deixe público ou configure políticas RLS conforme necessário

### Passo 3: Configurar o Backend

```bash
# Navegar para pasta do backend
cd backend

# Instalar dependências
pip install -r requirements.txt

# Configurar variáveis de ambiente (já está no .env)
# Verifique se as credenciais estão corretas

# Rodar servidor
python main.py
```

O backend estará rodando em: `http://localhost:8000`

Documentação da API: `http://localhost:8000/docs`

## 🔐 Usuários de Teste

Após rodar o schema.sql, você terá estes usuários disponíveis:

**Senha para todos:** `senha123`

- roberto@cbb.com.br - Gerente de TI
- maria@cbb.com.br - Diretora Administrativa  
- compras@cbb.com.br - Coordenador de Compras
- financeiro@cbb.com.br - Gerente Financeiro
- presidente@cbb.com.br - Presidente
- juridico@cbb.com.br - Assessora Jurídica

## 📊 Testando a API

### 1. Login

```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "roberto@cbb.com.br", "senha": "senha123"}'
```

Isso retornará um `access_token`. Use-o nos próximos requests.

### 2. Criar Processo

```bash
curl -X POST http://localhost:8000/api/processos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -d '{
    "tipo_processo_id": 1,
    "assunto": "Aquisição de equipamentos de TI",
    "interessado": "Departamento de TI",
    "setor_atual_id": 3,
    "prioridade": "alta"
  }'
```

### 3. Listar Processos

```bash
curl http://localhost:8000/api/processos \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

### 4. Dashboard

```bash
curl http://localhost:8000/api/dashboard/stats \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

## 🌐 Deploy no Replit

### Opção 1: Importar Projeto

1. Acesse [Replit](https://replit.com)
2. Clique em **Create Repl**
3. Escolha **Import from GitHub** (ou faça upload dos arquivos)
4. Selecione Python como linguagem

### Opção 2: Criar Manualmente

1. Crie um novo Repl Python
2. Faça upload de todos os arquivos do backend
3. Configure os Secrets:
   - `SUPABASE_URL`
   - `SUPABASE_KEY`
   - `SUPABASE_SERVICE_KEY`
   - `SECRET_KEY`

### Configurar o Replit

Crie um arquivo `.replit` na raiz:

```toml
run = "cd backend && python main.py"
language = "python3"

[nix]
channel = "stable-23_05"

[deployment]
run = ["sh", "-c", "cd backend && python main.py"]
```

Crie `replit.nix`:

```nix
{ pkgs }: {
  deps = [
    pkgs.python311
    pkgs.python311Packages.pip
  ];
}
```

### Iniciar o Projeto

Clique em **Run** e o Replit irá:
1. Instalar as dependências automaticamente
2. Iniciar o servidor FastAPI
3. Disponibilizar a URL pública

## 🔧 Configurações Importantes

### Alterar a Secret Key (IMPORTANTE!)

No arquivo `.env`, altere a `SECRET_KEY` para algo único:

```python
# Gerar uma nova secret key
import secrets
print(secrets.token_urlsafe(32))
```

### Configurar CORS para Produção

No `main.py`, linha das origens CORS, altere de `["*"]` para seu domínio:

```python
allow_origins=["https://seu-dominio.com"],
```

## 📱 Próximos Passos

1. ✅ Backend está pronto
2. ⏳ Criar frontend Next.js (próximo passo)
3. ⏳ Implementar sistema de assinaturas
4. ⏳ Adicionar notificações
5. ⏳ Implementar workflow de aprovações completo

## 🐛 Troubleshooting

### Erro: "Module not found"

```bash
pip install --upgrade -r requirements.txt
```

### Erro de conexão com Supabase

Verifique se:
- As credenciais no `.env` estão corretas
- O projeto Supabase está ativo
- Você executou o schema.sql

### Erro: "Token inválido"

- Faça login novamente para obter um novo token
- Tokens expiram em 7 dias por padrão

## 📞 Suporte

Para dúvidas ou problemas:
- Email: ti@cbb.com.br
- Documentação da API: http://localhost:8000/docs

---

**Desenvolvido para CBB - Confederação Brasileira de Basketball**
