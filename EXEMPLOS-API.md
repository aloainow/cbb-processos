# 📖 Exemplos de Uso da API - Sistema CBB

## 🔐 Autenticação

### Login
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "roberto@cbb.com.br",
    "senha": "senha123"
  }'
```

**Resposta:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "usuario": {
    "id": 1,
    "nome": "Roberto Santos",
    "email": "roberto@cbb.com.br",
    "setor_id": 3,
    "cargo": "Gerente de TI"
  }
}
```

**⚠️ Salve o `access_token` para usar nos próximos requests!**

---

## 📋 Processos

### 1. Criar Processo

```bash
curl -X POST http://localhost:8000/api/processos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{
    "tipo_processo_id": 1,
    "assunto": "Aquisição de 10 notebooks Dell para o setor de TI",
    "interessado": "Departamento de TI - CBB",
    "cpf_cnpj_interessado": "00.000.000/0001-00",
    "especificacao": "Necessidade de renovação do parque tecnológico",
    "setor_atual_id": 4,
    "prioridade": "alta",
    "prazo_dias": 30,
    "nivel_acesso": "publico"
  }'
```

### 2. Listar Todos os Processos

```bash
curl http://localhost:8000/api/processos \
  -H "Authorization: Bearer SEU_TOKEN"
```

### 3. Buscar Processo por ID

```bash
curl http://localhost:8000/api/processos/1 \
  -H "Authorization: Bearer SEU_TOKEN"
```

### 4. Buscar por Número de Protocolo

```bash
curl http://localhost:8000/api/processos/protocolo/2024.CBB.000001-0 \
  -H "Authorization: Bearer SEU_TOKEN"
```

### 5. Listar Meus Processos

```bash
curl http://localhost:8000/api/processos/meus/lista \
  -H "Authorization: Bearer SEU_TOKEN"
```

### 6. Buscar com Filtros

```bash
# Processos com status "aberto"
curl "http://localhost:8000/api/processos?status=aberto" \
  -H "Authorization: Bearer SEU_TOKEN"

# Processos do tipo 1 (Compras)
curl "http://localhost:8000/api/processos?tipo_processo_id=1" \
  -H "Authorization: Bearer SEU_TOKEN"

# Buscar por assunto
curl "http://localhost:8000/api/processos?assunto=notebook" \
  -H "Authorization: Bearer SEU_TOKEN"

# Múltiplos filtros
curl "http://localhost:8000/api/processos?status=aberto&prioridade=alta&limit=10" \
  -H "Authorization: Bearer SEU_TOKEN"
```

### 7. Atualizar Processo

```bash
curl -X PUT http://localhost:8000/api/processos/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{
    "prioridade": "urgente",
    "observacoes": "Prazo reduzido para 15 dias"
  }'
```

---

## 🔄 Tramitação

### 1. Tramitar Processo

```bash
curl -X POST http://localhost:8000/api/processos/1/tramitar \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{
    "processo_id": 1,
    "setor_origem_id": 4,
    "setor_destino_id": 5,
    "observacao": "Encaminhado para análise financeira",
    "tipo_tramitacao": "normal"
  }'
```

### 2. Ver Histórico de Tramitações

```bash
curl http://localhost:8000/api/processos/1/tramitacoes \
  -H "Authorization: Bearer SEU_TOKEN"
```

---

## 📄 Documentos

### 1. Criar Documento Interno (HTML)

```bash
curl -X POST http://localhost:8000/api/documentos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{
    "processo_id": 1,
    "tipo_documento": "gerado",
    "nome": "Parecer Técnico - Aquisição de Notebooks",
    "descricao": "Análise técnica dos equipamentos solicitados",
    "conteudo_html": "<h1>Parecer Técnico</h1><p>Os notebooks solicitados atendem às especificações...</p>",
    "requer_assinatura": true,
    "nivel_acesso": "publico"
  }'
```

### 2. Upload de Arquivo

```bash
curl -X POST http://localhost:8000/api/documentos/upload \
  -H "Authorization: Bearer SEU_TOKEN" \
  -F "processo_id=1" \
  -F "tipo_documento=anexo" \
  -F "nome=Cotação Dell" \
  -F "descricao=Cotação oficial da Dell" \
  -F "arquivo=@/caminho/para/cotacao.pdf"
```

### 3. Listar Documentos de um Processo

```bash
curl http://localhost:8000/api/processos/1/documentos \
  -H "Authorization: Bearer SEU_TOKEN"
```

### 4. Buscar Documento Específico

```bash
curl http://localhost:8000/api/documentos/1 \
  -H "Authorization: Bearer SEU_TOKEN"
```

### 5. Atualizar Documento

```bash
curl -X PUT http://localhost:8000/api/documentos/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{
    "nome": "Parecer Técnico - REVISADO",
    "descricao": "Versão atualizada do parecer"
  }'
```

### 6. Excluir Documento

```bash
curl -X DELETE http://localhost:8000/api/documentos/1 \
  -H "Authorization: Bearer SEU_TOKEN"
```

---

## 📊 Dashboard e Estatísticas

### Obter Estatísticas

```bash
curl http://localhost:8000/api/dashboard/stats \
  -H "Authorization: Bearer SEU_TOKEN"
```

**Resposta:**
```json
{
  "total_processos": 156,
  "processos_abertos": 45,
  "processos_em_tramite": 89,
  "processos_concluidos": 22,
  "meus_processos": 12,
  "processos_meu_setor": 34,
  "pendentes_aprovacao": 3,
  "pendentes_assinatura": 5
}
```

---

## 🏢 Setores

### Listar Todos os Setores

```bash
curl http://localhost:8000/api/setores \
  -H "Authorization: Bearer SEU_TOKEN"
```

### Buscar Setor Específico

```bash
curl http://localhost:8000/api/setores/3 \
  -H "Authorization: Bearer SEU_TOKEN"
```

---

## 📋 Tipos de Processo

### Listar Tipos

```bash
curl http://localhost:8000/api/tipos-processo \
  -H "Authorization: Bearer SEU_TOKEN"
```

**Resposta:**
```json
[
  {
    "id": 1,
    "nome": "Compras com Recursos Próprios",
    "descricao": "Processo de aquisição de bens e serviços",
    "cor": "#10B981",
    "ativo": true
  },
  {
    "id": 2,
    "nome": "Processo Administrativo",
    "descricao": "Processos administrativos gerais",
    "cor": "#3B82F6",
    "ativo": true
  }
]
```

---

## 🔧 Ações Especiais em Processos

### 1. Concluir Processo

```bash
curl -X POST http://localhost:8000/api/processos/1/concluir \
  -H "Authorization: Bearer SEU_TOKEN"
```

### 2. Reabrir Processo

```bash
curl -X POST http://localhost:8000/api/processos/1/reabrir \
  -H "Authorization: Bearer SEU_TOKEN"
```

### 3. Bloquear Processo

```bash
curl -X POST http://localhost:8000/api/processos/1/bloquear \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d "motivo=Aguardando documentação complementar"
```

### 4. Desbloquear Processo

```bash
curl -X POST http://localhost:8000/api/processos/1/desbloquear \
  -H "Authorization: Bearer SEU_TOKEN"
```

---

## 🐍 Exemplos em Python

### Cliente Python Simples

```python
import requests

class CBBClient:
    def __init__(self, base_url="http://localhost:8000"):
        self.base_url = base_url
        self.token = None
    
    def login(self, email, senha):
        response = requests.post(
            f"{self.base_url}/api/auth/login",
            json={"email": email, "senha": senha}
        )
        data = response.json()
        self.token = data["access_token"]
        return data["usuario"]
    
    def get_headers(self):
        return {"Authorization": f"Bearer {self.token}"}
    
    def criar_processo(self, dados):
        return requests.post(
            f"{self.base_url}/api/processos",
            json=dados,
            headers=self.get_headers()
        ).json()
    
    def listar_processos(self):
        return requests.get(
            f"{self.base_url}/api/processos",
            headers=self.get_headers()
        ).json()
    
    def get_dashboard(self):
        return requests.get(
            f"{self.base_url}/api/dashboard/stats",
            headers=self.get_headers()
        ).json()

# Uso
client = CBBClient()
usuario = client.login("roberto@cbb.com.br", "senha123")
print(f"Logado como: {usuario['nome']}")

# Criar processo
processo = client.criar_processo({
    "tipo_processo_id": 1,
    "assunto": "Teste via Python",
    "setor_atual_id": 3
})
print(f"Processo criado: {processo['numero_protocolo']}")

# Dashboard
stats = client.get_dashboard()
print(f"Total de processos: {stats['total_processos']}")
```

---

## 📝 Fluxo Completo de Exemplo

### Cenário: Processo de Compra de Equipamentos

```bash
# 1. Login
TOKEN=$(curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"compras@cbb.com.br","senha":"senha123"}' \
  | jq -r '.access_token')

# 2. Criar processo
PROCESSO_ID=$(curl -X POST http://localhost:8000/api/processos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "tipo_processo_id":1,
    "assunto":"Aquisição de 10 notebooks",
    "setor_atual_id":4,
    "prioridade":"alta"
  }' | jq -r '.id')

echo "Processo criado: ID $PROCESSO_ID"

# 3. Anexar cotação
curl -X POST http://localhost:8000/api/documentos/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "processo_id=$PROCESSO_ID" \
  -F "tipo_documento=anexo" \
  -F "nome=Cotação" \
  -F "arquivo=@cotacao.pdf"

# 4. Tramitar para financeiro
curl -X POST http://localhost:8000/api/processos/$PROCESSO_ID/tramitar \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "processo_id":'$PROCESSO_ID',
    "setor_origem_id":4,
    "setor_destino_id":5,
    "observacao":"Aprovado. Segue para análise orçamentária."
  }'

echo "Processo tramitado com sucesso!"
```

---

## 🔍 Testando na Interface Interativa

Acesse: http://localhost:8000/docs

Lá você tem uma interface interativa (Swagger UI) onde pode:
- Ver todos os endpoints disponíveis
- Testar cada endpoint visualmente
- Ver os schemas de request/response
- Autorizar uma vez e usar em todos os requests

---

## ❓ Dúvidas Comuns

**P: Como renovar o token?**
R: Faça login novamente. Tokens duram 7 dias por padrão.

**P: Posso usar a API em produção?**
R: Sim! Mas lembre-se de:
- Alterar a SECRET_KEY
- Configurar CORS corretamente
- Usar HTTPS
- Implementar rate limiting

**P: Como fazer paginação?**
R: Use os parâmetros `limit` e `offset`:
```bash
curl "http://localhost:8000/api/processos?limit=20&offset=0"
```

---

**🏀 Documentação da API - Sistema CBB**
**📚 Para mais detalhes: http://localhost:8000/docs**
