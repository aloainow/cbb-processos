from passlib.context import CryptContext
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import User  # ajuste o import conforme seu projeto

# Ajuste a string de conexão
DATABASE_URL = "postgresql://user:password@localhost/dbname"  # AJUSTE 
AQUI
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
db = SessionLocal()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Buscar usuário
user = db.query(User).filter(User.email == "admin@cbb.com.br").first()

if user:
    print(f"✓ Usuário encontrado: {user.email}")
    print(f"Hash no banco: {user.password_hash}")
    
    # Testar senha
    senha_teste = "Admin@123"  # ou a senha que você está usando
    resultado = pwd_context.verify(senha_teste, user.password_hash)
    print(f"Verificação de senha: {resultado}")
    
    if not resultado:
        # Gerar novo hash
        novo_hash = pwd_context.hash(senha_teste)
        print(f"\nNovo hash gerado: {novo_hash}")
        print(f"\nExecute este SQL para atualizar:")
        print(f"UPDATE users SET password_hash = '{novo_hash}' WHERE email 
= 'admin@cbb.com.br';")
else:
    print("✗ Usuário não encontrado")
    print("\nUsuários no banco:")
    usuarios = db.query(User).all()
    for u in usuarios:
        print(f"  - {u.email}")

db.close()
