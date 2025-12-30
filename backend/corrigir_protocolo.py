import re

# Ler o arquivo
with open('app/services/processo_service.py', 'r') as f:
    content = f.read()

# Adicionar import datetime no topo se não existir
if 'from datetime import datetime' not in content:
    content = content.replace('from datetime import datetime, timedelta', 'from datetime import datetime, timedelta')

# Encontrar e substituir a função criar_processo
old_function = r'async def criar_processo\(self, processo_data: ProcessoCreate, usuario_id: int\) -> ProcessoResponse:.*?data\["criado_por"\] = usuario_id'

new_function = '''async def criar_processo(self, processo_data: ProcessoCreate, usuario_id: int) -> ProcessoResponse:
        """Cria um novo processo"""
        data = processo_data.model_dump()
        data["criado_por"] = usuario_id
        data["ano"] = datetime.now().year
        
        # Buscar último número de protocolo do ano
        result = self.supabase.table("processos").select("numero_protocolo").eq("ano", data["ano"]).order("id", desc=True).limit(1).execute()
        
        if result.data and result.data[0].get("numero_protocolo"):
            # Extrair número do último protocolo
            ultimo_protocolo = result.data[0]["numero_protocolo"]
            numero = int(ultimo_protocolo.split(".")[2].split("-")[0])
            proximo_numero = numero + 1
        else:
            proximo_numero = 1
        
        # Gerar protocolo: ANO.CBB.NNNNNN-DV
        data["numero_protocolo"] = f'{data["ano"]}.CBB.{proximo_numero:06d}-1'
        data["criado_por"] = usuario_id'''

content = re.sub(old_function, new_function, content, flags=re.DOTALL)

# Salvar
with open('app/services/processo_service.py', 'w') as f:
    f.write(content)

print("✅ Protocolo automático configurado!")
