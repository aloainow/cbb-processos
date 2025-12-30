from datetime import timedelta
from fastapi import HTTPException, status
from app.database import get_supabase_admin
from app.models import LoginRequest, Token, UsuarioResponse
from app.utils.auth import verify_password, create_access_token, get_password_hash
from app.config import get_settings

settings = get_settings()

class AuthService:
    def __init__(self):
        self.supabase = get_supabase_admin()
    
    async def login(self, login_data: LoginRequest) -> Token:
        """Autentica usuário e retorna token"""
        print("=" * 60)
        print("🔐 TENTATIVA DE LOGIN")
        print(f"📧 Email recebido: {login_data.email}")
        print(f"🔑 Senha recebida: {login_data.senha}")
        
        # Buscar usuário por email
        result = self.supabase.table("usuarios").select("*").eq("email", login_data.email).single().execute()
        
        print(f"👤 Usuário encontrado: {result.data is not None}")
        
        if not result.data:
            print("❌ ERRO: Usuário não encontrado no banco")
            print("=" * 60)
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Email ou senha incorretos"
            )
        
        usuario = result.data
        print(f"✓ Email no banco: {usuario.get('email')}")
        print(f"✓ Hash armazenado: {usuario.get('senha_hash')[:30]}...")
        
        # Verificar senha
        senha_valida = verify_password(login_data.senha, usuario["senha_hash"])
        print(f"🔐 Verificação de senha: {senha_valida}")
        
        if not senha_valida:
            print("❌ ERRO: Senha incorreta")
            print("=" * 60)
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Email ou senha incorretos"
            )
        
        # Verificar se usuário está ativo
        if not usuario.get("ativo"):
            print("❌ ERRO: Usuário inativo")
            print("=" * 60)
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Usuário inativo"
            )
        
        print("✅ LOGIN BEM-SUCEDIDO!")
        print("=" * 60)
        
        # Criar token
        access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
        access_token = create_access_token(
            data={"sub": str(usuario["id"]), "email": usuario["email"]},
            expires_delta=access_token_expires
        )
        
        # Atualizar último acesso
        self.supabase.table("usuarios").update({
            "ultimo_acesso": "now()"
        }).eq("id", usuario["id"]).execute()
        
        # Remover senha_hash antes de retornar
        usuario.pop("senha_hash", None)
        
        return Token(
            access_token=access_token,
            usuario=UsuarioResponse(**usuario)
        )
    
    async def register(self, usuario_data: dict) -> UsuarioResponse:
        """Registra novo usuário"""
        # Verificar se email já existe
        existing = self.supabase.table("usuarios").select("id").eq("email", usuario_data["email"]).execute()
        
        if existing.data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email já cadastrado"
            )
        
        # Hash da senha
        senha = usuario_data.pop("senha")
        senha_hash = get_password_hash(senha)
        
        # Inserir usuário
        usuario_data["senha_hash"] = senha_hash
        result = self.supabase.table("usuarios").insert(usuario_data).execute()
        
        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Erro ao criar usuário"
            )
        
        usuario = result.data[0]
        usuario.pop("senha_hash", None)
        
        return UsuarioResponse(**usuario)
