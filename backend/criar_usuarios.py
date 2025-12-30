from app.database import get_supabase_admin
from app.utils.auth import get_password_hash

supabase = get_supabase_admin()

# Buscar IDs dos setores
setores = supabase.table("setores").select("id, nome").execute()
setor_map = {s['nome']: s['id'] for s in setores.data}

# Criar usuários
usuarios = [
    {"nome": "Maria Silva", "email": "maria@cbb.com.br", "setor_id": setor_map.get('Financeiro'), "cargo": "Diretora Administrativa"},
    {"nome": "João Compras", "email": "compras@cbb.com.br", "setor_id": setor_map.get('Compras'), "cargo": "Coordenador de Compras"},
    {"nome": "Ana Financeiro", "email": "financeiro@cbb.com.br", "setor_id": setor_map.get('Financeiro'), "cargo": "Gerente Financeira"},
    {"nome": "Carlos Presidente", "email": "presidente@cbb.com.br", "setor_id": setor_map.get('Presidência'), "cargo": "Presidente"},
    {"nome": "Paula Jurídico", "email": "juridico@cbb.com.br", "setor_id": setor_map.get('Jurídico'), "cargo": "Assessora Jurídica"},
]

senha_padrao = "Admin@123"
senha_hash = get_password_hash(senha_padrao)

for usuario in usuarios:
    usuario['senha_hash'] = senha_hash
    usuario['ativo'] = True
    
    try:
        supabase.table("usuarios").insert(usuario).execute()
        print(f"✓ Usuário criado: {usuario['nome']} ({usuario['email']})")
    except Exception as e:
        print(f"✗ Erro ao criar {usuario['nome']}: {e}")

print(f"\n✅ Usuários criados! Senha padrão para todos: {senha_padrao}")
