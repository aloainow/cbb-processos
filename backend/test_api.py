#!/usr/bin/env python3
"""
Script para testar a API do Sistema de Gestão de Processos CBB
"""
import requests
import json
from typing import Optional

BASE_URL = "http://localhost:8000"

class APITester:
    def __init__(self, base_url: str = BASE_URL):
        self.base_url = base_url
        self.token: Optional[str] = None
        
    def login(self, email: str, senha: str):
        """Faz login e armazena o token"""
        print(f"\n🔐 Fazendo login com {email}...")
        
        response = requests.post(
            f"{self.base_url}/api/auth/login",
            json={"email": email, "senha": senha}
        )
        
        if response.status_code == 200:
            data = response.json()
            self.token = data["access_token"]
            usuario = data["usuario"]
            print(f"✅ Login bem-sucedido!")
            print(f"👤 Usuário: {usuario['nome']}")
            print(f"📧 Email: {usuario['email']}")
            print(f"🏢 Setor ID: {usuario['setor_id']}")
            return True
        else:
            print(f"❌ Erro no login: {response.text}")
            return False
    
    def get_headers(self):
        """Retorna headers com autenticação"""
        return {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json"
        }
    
    def listar_tipos_processo(self):
        """Lista tipos de processo"""
        print("\n📋 Listando tipos de processo...")
        
        response = requests.get(
            f"{self.base_url}/api/tipos-processo",
            headers=self.get_headers()
        )
        
        if response.status_code == 200:
            tipos = response.json()
            print(f"✅ {len(tipos)} tipos encontrados:")
            for tipo in tipos:
                print(f"   {tipo['id']} - {tipo['nome']} ({tipo['cor']})")
            return tipos
        else:
            print(f"❌ Erro: {response.text}")
            return []
    
    def listar_setores(self):
        """Lista setores"""
        print("\n🏢 Listando setores...")
        
        response = requests.get(
            f"{self.base_url}/api/setores",
            headers=self.get_headers()
        )
        
        if response.status_code == 200:
            setores = response.json()
            print(f"✅ {len(setores)} setores encontrados:")
            for setor in setores:
                print(f"   {setor['id']} - {setor['nome']} ({setor['sigla']})")
            return setores
        else:
            print(f"❌ Erro: {response.text}")
            return []
    
    def criar_processo(self, tipo_processo_id: int, assunto: str, setor_atual_id: int):
        """Cria um novo processo"""
        print(f"\n📝 Criando processo...")
        
        data = {
            "tipo_processo_id": tipo_processo_id,
            "assunto": assunto,
            "interessado": "Departamento de TI",
            "setor_atual_id": setor_atual_id,
            "prioridade": "normal",
            "especificacao": "Processo de teste criado automaticamente"
        }
        
        response = requests.post(
            f"{self.base_url}/api/processos",
            headers=self.get_headers(),
            json=data
        )
        
        if response.status_code == 200:
            processo = response.json()
            print(f"✅ Processo criado!")
            print(f"📄 Protocolo: {processo['numero_protocolo']}")
            print(f"📌 Assunto: {processo['assunto']}")
            print(f"🆔 ID: {processo['id']}")
            return processo
        else:
            print(f"❌ Erro: {response.text}")
            return None
    
    def listar_processos(self):
        """Lista processos"""
        print("\n📚 Listando processos...")
        
        response = requests.get(
            f"{self.base_url}/api/processos",
            headers=self.get_headers()
        )
        
        if response.status_code == 200:
            processos = response.json()
            print(f"✅ {len(processos)} processos encontrados:")
            for proc in processos[:5]:  # Mostrar apenas os 5 primeiros
                print(f"   {proc['numero_protocolo']} - {proc['assunto'][:50]}...")
            return processos
        else:
            print(f"❌ Erro: {response.text}")
            return []
    
    def get_dashboard(self):
        """Obtém estatísticas do dashboard"""
        print("\n📊 Buscando estatísticas do dashboard...")
        
        response = requests.get(
            f"{self.base_url}/api/dashboard/stats",
            headers=self.get_headers()
        )
        
        if response.status_code == 200:
            stats = response.json()
            print("✅ Estatísticas:")
            print(f"   📁 Total de processos: {stats['total_processos']}")
            print(f"   📂 Processos abertos: {stats['processos_abertos']}")
            print(f"   🔄 Em trâmite: {stats['processos_em_tramite']}")
            print(f"   ✅ Concluídos: {stats['processos_concluidos']}")
            print(f"   👤 Meus processos: {stats['meus_processos']}")
            print(f"   🏢 Processos do meu setor: {stats['processos_meu_setor']}")
            print(f"   ⏳ Pendentes de aprovação: {stats['pendentes_aprovacao']}")
            print(f"   ✍️ Pendentes de assinatura: {stats['pendentes_assinatura']}")
            return stats
        else:
            print(f"❌ Erro: {response.text}")
            return None

def main():
    print("="*60)
    print("🏀 Sistema de Gestão de Processos - CBB")
    print("   Teste da API")
    print("="*60)
    
    # Criar instância do tester
    tester = APITester()
    
    # Fazer login
    if not tester.login("roberto@cbb.com.br", "senha123"):
        print("\n❌ Não foi possível fazer login. Verifique se a API está rodando.")
        return
    
    # Testar endpoints
    tester.get_dashboard()
    tipos = tester.listar_tipos_processo()
    setores = tester.listar_setores()
    
    # Criar um processo de teste
    if tipos and setores:
        processo = tester.criar_processo(
            tipo_processo_id=tipos[0]['id'],
            assunto="Processo de Teste - Aquisição de Notebooks",
            setor_atual_id=setores[0]['id']
        )
        
        if processo:
            # Listar processos
            tester.listar_processos()
    
    print("\n" + "="*60)
    print("✅ Testes concluídos!")
    print("="*60)

if __name__ == "__main__":
    main()
