from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.config import get_settings
from app.database import get_supabase_admin
from app.models import TokenData, UsuarioResponse
import hashlib

settings = get_settings()
security = HTTPBearer()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.access_token_expire_minutes)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)
    return encoded_jwt

def decode_token(token: str) -> TokenData:
    print("🔓 DECODIFICANDO TOKEN")
    print(f"Token: {token[:30]}...")
    
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        usuario_id: int = payload.get("sub")
        email: str = payload.get("email")
        
        print(f"✓ Usuario ID: {usuario_id}, Email: {email}")
        
        if usuario_id is None:
            print("❌ ERRO: usuario_id não encontrado")
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token inválido")
        
        return TokenData(usuario_id=usuario_id, email=email)
    except JWTError as e:
        print(f"❌ ERRO JWT: {str(e)}")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token inválido ou expirado")

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> UsuarioResponse:
    print("👤 GET CURRENT USER")
    token = credentials.credentials
    print(f"Token extraído: {token[:30]}...")
    
    token_data = decode_token(token)
    supabase = get_supabase_admin()
    result = supabase.table("usuarios").select("*").eq("id", token_data.usuario_id).single().execute()
    
    print(f"Usuário encontrado: {result.data is not None}")
    
    if not result.data:
        print("❌ Usuário não encontrado")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Usuário não encontrado")
    
    usuario = result.data
    print(f"✓ Usuário: {usuario.get('email')}, Ativo: {usuario.get('ativo')}")
    
    if not usuario.get("ativo"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Usuário inativo")
    
    print("✅ SUCESSO")
    return UsuarioResponse(**usuario)

def calcular_hash_documento(conteudo: str) -> str:
    return hashlib.sha256(conteudo.encode()).hexdigest()

def verificar_permissao_setor(usuario: UsuarioResponse, setor_id: int) -> bool:
    return usuario.setor_id == setor_id

async def get_current_active_user(current_user: UsuarioResponse = Depends(get_current_user)) -> UsuarioResponse:
    if not current_user.ativo:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Usuário inativo")
    return current_user
