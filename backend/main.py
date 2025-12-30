from fastapi import FastAPI, Body, Depends, HTTPException, status, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
from app.models import *
from app.utils.auth import get_current_user, get_current_active_user
from app.services.auth_service import AuthService
from app.services.processo_service import ProcessoService
from app.services.documento_service import DocumentoService
from app.database import get_supabase_admin

# Criar app FastAPI
app = FastAPI(
    title="Sistema de Gestão de Processos - CBB",
    description="API para gestão de processos eletrônicos da Confederação Brasileira de Basketball",
    version="1.0.0"
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Em produção, especificar domínios permitidos
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Instanciar serviços
auth_service = AuthService()
processo_service = ProcessoService()
documento_service = DocumentoService()

# ==================== ROTAS DE AUTENTICAÇÃO ====================

@app.post("/api/auth/login", response_model=Token, tags=["Autenticação"])
async def login(login_data: LoginRequest):
    """Autentica usuário e retorna token JWT"""
    return await auth_service.login(login_data)

@app.post("/api/auth/register", response_model=UsuarioResponse, tags=["Autenticação"])
async def register(usuario: UsuarioCreate):
    """Registra novo usuário"""
    return await auth_service.register(usuario.model_dump())

@app.get("/api/auth/me", response_model=UsuarioResponse, tags=["Autenticação"])
async def get_me(current_user: UsuarioResponse = Depends(get_current_active_user)):
    """Retorna dados do usuário autenticado"""
    return current_user

# ==================== ROTAS DE PROCESSOS ====================

@app.post("/api/processos", response_model=ProcessoResponse, tags=["Processos"])
async def criar_processo(
    processo: ProcessoCreate,
    current_user: UsuarioResponse = Depends(get_current_active_user)
):
    """Cria um novo processo"""
    return await processo_service.criar_processo(processo, current_user.id)

@app.get("/api/processos/{processo_id}", response_model=ProcessoResponse, tags=["Processos"])
async def buscar_processo(
    processo_id: int,
    current_user: UsuarioResponse = Depends(get_current_active_user)
):
    """Busca processo por ID"""
    return await processo_service.buscar_processo(processo_id)

@app.get("/api/processos/protocolo/{numero_protocolo}", response_model=ProcessoResponse, tags=["Processos"])
async def buscar_por_protocolo(
    numero_protocolo: str,
    current_user: UsuarioResponse = Depends(get_current_active_user)
):
    """Busca processo por número de protocolo"""
    return await processo_service.buscar_por_protocolo(numero_protocolo)

@app.get("/api/processos", response_model=List[ProcessoResponse], tags=["Processos"])
async def listar_processos(
    numero_protocolo: Optional[str] = None,
    assunto: Optional[str] = None,
    interessado: Optional[str] = None,
    tipo_processo_id: Optional[int] = None,
    status: Optional[StatusProcesso] = None,
    setor_atual_id: Optional[int] = None,
    limit: int = 20,
    offset: int = 0,
    current_user: UsuarioResponse = Depends(get_current_active_user)
):
    """Lista processos com filtros"""
    filtros = ProcessoFiltros(
        numero_protocolo=numero_protocolo,
        assunto=assunto,
        interessado=interessado,
        tipo_processo_id=tipo_processo_id,
        status=status,
        setor_atual_id=setor_atual_id
    )
    processos, total = await processo_service.listar_processos(filtros, limit=limit, offset=offset)
    return processos

@app.get("/api/processos/meus", response_model=List[ProcessoResponse], tags=["Processos"])
async def listar_meus_processos(
    limit: int = 20,
    offset: int = 0,
    current_user: UsuarioResponse = Depends(get_current_active_user)
):
    """Lista processos criados pelo usuário atual"""
    processos, total = await processo_service.listar_processos(
        usuario_id=current_user.id,
        limit=limit,
        offset=offset
    )
    return processos

@app.get("/api/processos/setor/{setor_id}", response_model=List[ProcessoResponse], tags=["Processos"])
async def listar_processos_setor(
    setor_id: int,
    limit: int = 20,
    offset: int = 0,
    current_user: UsuarioResponse = Depends(get_current_active_user)
):
    """Lista processos de um setor"""
    processos, total = await processo_service.listar_processos(
        setor_id=setor_id,
        limit=limit,
        offset=offset
    )
    return processos

@app.put("/api/processos/{processo_id}", response_model=ProcessoResponse, tags=["Processos"])
async def atualizar_processo(
    processo_id: int,
    processo: ProcessoUpdate,
    current_user: UsuarioResponse = Depends(get_current_active_user)
):
    """Atualiza processo"""
    return await processo_service.atualizar_processo(processo_id, processo, current_user.id)

@app.post("/api/processos/{processo_id}/tramitar", response_model=TramitacaoResponse, tags=["Processos"])
async def tramitar_processo(
    processo_id: int,
    setor_destino_id: int = Body(...),
    observacao: str = Body(None),
    tipo_tramitacao: str = Body("despacho"),
    current_user: UsuarioResponse = Depends(get_current_active_user)
):
    """Tramita processo para outro setor"""
    from app.models import TramitacaoCreate
    
    tramitacao_data = TramitacaoCreate(
        processo_id=processo_id,
        setor_origem_id=current_user.setor_id,
        setor_destino_id=setor_destino_id,
        observacao=observacao,
        tipo_tramitacao=tipo_tramitacao
    )
    
    return await processo_service.tramitar_processo(tramitacao_data, current_user.id)

@app.get("/api/processos/{processo_id}/tramitacoes", response_model=List[TramitacaoResponse], tags=["Processos"])
async def listar_tramitacoes(
    processo_id: int,
    current_user: UsuarioResponse = Depends(get_current_active_user)
):
    """Lista histórico de tramitações de um processo"""
    return await processo_service.listar_tramitacoes(processo_id)

@app.post("/api/processos/{processo_id}/concluir", response_model=ProcessoResponse, tags=["Processos"])
async def concluir_processo(
    processo_id: int,
    current_user: UsuarioResponse = Depends(get_current_active_user)
):
    """Conclui um processo"""
    return await processo_service.concluir_processo(processo_id, current_user.id)

@app.post("/api/processos/{processo_id}/reabrir", response_model=ProcessoResponse, tags=["Processos"])
async def reabrir_processo(
    processo_id: int,
    current_user: UsuarioResponse = Depends(get_current_active_user)
):
    """Reabre um processo concluído"""
    return await processo_service.reabrir_processo(processo_id, current_user.id)

@app.post("/api/processos/{processo_id}/bloquear", response_model=ProcessoResponse, tags=["Processos"])
async def bloquear_processo(
    processo_id: int,
    motivo: str = Form(...),
    current_user: UsuarioResponse = Depends(get_current_active_user)
):
    """Bloqueia um processo"""
    return await processo_service.bloquear_processo(processo_id, motivo, current_user.id)

@app.post("/api/processos/{processo_id}/desbloquear", response_model=ProcessoResponse, tags=["Processos"])
async def desbloquear_processo(
    processo_id: int,
    current_user: UsuarioResponse = Depends(get_current_active_user)
):
    """Desbloqueia um processo"""
    return await processo_service.desbloquear_processo(processo_id, current_user.id)

# ==================== ROTAS DE DOCUMENTOS ====================

@app.post("/api/documentos", response_model=DocumentoResponse, tags=["Documentos"])
async def criar_documento(
    documento: DocumentoCreate,
    current_user: UsuarioResponse = Depends(get_current_active_user)
):
    """Cria um novo documento"""
    return await documento_service.criar_documento(documento, current_user.id)

@app.post("/api/documentos/upload", response_model=DocumentoResponse, tags=["Documentos"])
async def upload_documento(
    processo_id: int = Form(...),
    arquivo: UploadFile = File(...),
    tipo_documento: str = Form("anexo"),
    nome: Optional[str] = Form(None),
    descricao: Optional[str] = Form(None),
    current_user: UsuarioResponse = Depends(get_current_active_user)
):
    """Faz upload de um arquivo como documento"""
    return await documento_service.upload_documento(
        processo_id=processo_id,
        arquivo=arquivo,
        usuario_id=current_user.id,
        tipo_documento=tipo_documento,
        nome=nome,
        descricao=descricao
    )

@app.get("/api/documentos/{documento_id}", response_model=DocumentoResponse, tags=["Documentos"])
async def buscar_documento(
    documento_id: int,
    current_user: UsuarioResponse = Depends(get_current_active_user)
):
    """Busca documento por ID"""
    return await documento_service.buscar_documento(documento_id)

# Endpoint antigo comentado - conflitava com o novo
# @app.get("/api/processos/{processo_id}/documentos")
# async def listar_documentos_old(...):
#     return await documento_service.listar_documentos(processo_id)

@app.put("/api/documentos/{documento_id}", response_model=DocumentoResponse, tags=["Documentos"])
async def atualizar_documento(
    documento_id: int,
    documento: DocumentoUpdate,
    current_user: UsuarioResponse = Depends(get_current_active_user)
):
    """Atualiza documento"""
    return await documento_service.atualizar_documento(documento_id, documento, current_user.id)

@app.delete("/api/documentos/{documento_id}", tags=["Documentos"])
async def excluir_documento(
    documento_id: int,
    current_user: UsuarioResponse = Depends(get_current_active_user)
):
    """Exclui documento"""
    await documento_service.excluir_documento(documento_id, current_user.id)
    return {"message": "Documento excluído com sucesso"}

# ==================== ROTAS DE DASHBOARD ====================

@app.get("/api/dashboard/stats", response_model=DashboardStats, tags=["Dashboard"])
async def get_dashboard_stats(
    current_user: UsuarioResponse = Depends(get_current_active_user)
):
    """Retorna estatísticas para o dashboard"""
    return await processo_service.get_dashboard_stats(current_user.id, current_user.setor_id)

# ==================== ROTAS DE SETORES ====================

@app.get("/api/setores", response_model=List[SetorResponse], tags=["Setores"])
async def listar_setores(
    current_user: UsuarioResponse = Depends(get_current_active_user)
):
    """Lista todos os setores ativos"""
    supabase = get_supabase_admin()
    result = supabase.table("setores").select("*").eq("ativo", True).order("nome").execute()
    return [SetorResponse(**s) for s in result.data]

@app.get("/api/setores/{setor_id}", response_model=SetorResponse, tags=["Setores"])
async def buscar_setor(
    setor_id: int,
    current_user: UsuarioResponse = Depends(get_current_active_user)
):
    """Busca setor por ID"""
    supabase = get_supabase_admin()
    result = supabase.table("setores").select("*").eq("id", setor_id).single().execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Setor não encontrado")
    return SetorResponse(**result.data)

# ==================== ROTAS DE TIPOS DE PROCESSO ====================

@app.get("/api/tipos-processo", response_model=List[TipoProcessoResponse], tags=["Tipos de Processo"])
async def listar_tipos_processo(
    current_user: UsuarioResponse = Depends(get_current_active_user)
):
    """Lista todos os tipos de processo ativos"""
    supabase = get_supabase_admin()
    result = supabase.table("tipos_processo").select("*").eq("ativo", True).order("nome").execute()
    return [TipoProcessoResponse(**tp) for tp in result.data]

# ==================== ROTA DE HEALTH CHECK ====================

@app.get("/health", tags=["Health"])
async def health_check():
    """Verifica se a API está rodando"""
    return {"status": "ok", "message": "API rodando"}

@app.get("/", tags=["Root"])
async def root():
    """Rota raiz"""
    return {
        "message": "Sistema de Gestão de Processos - CBB API",
        "version": "1.0.0",
        "docs": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    from app.config import get_settings
    
    settings = get_settings()
    uvicorn.run(
        "main:app",
        host=settings.api_host,
        port=settings.api_port,
        reload=True
    )

@app.get("/api/usuarios/{usuario_id}", tags=["Usuários"])
async def buscar_usuario_por_id(
    usuario_id: int,
    current_user: UsuarioResponse = Depends(get_current_active_user)
):
    supabase = get_supabase_admin()
    result = supabase.table("usuarios").select("*").eq("id", usuario_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    return result.data[0]

@app.post("/api/processos/{processo_id}/documentos", tags=["Documentos"])
async def upload_documento(
    processo_id: int,
    arquivo: UploadFile = File(...),
    nome: str = Form(...),
    tipo_documento: str = Form(...),
    descricao: str = Form(None),
    current_user: UsuarioResponse = Depends(get_current_active_user)
):
    import os
    supabase = get_supabase_admin()
    upload_dir = f"/tmp/cbb_documentos/{processo_id}"
    os.makedirs(upload_dir, exist_ok=True)
    file_path = f"{upload_dir}/{arquivo.filename}"
    content = await arquivo.read()
    with open(file_path, "wb") as f:
        f.write(content)
    doc_data = {
        "processo_id": processo_id,
        "nome": nome,
        "tipo_documento": tipo_documento,
        "descricao": descricao,
        "arquivo_url": file_path,
        "arquivo_nome": arquivo.filename,
        "arquivo_tamanho": len(content),
        "arquivo_tipo": arquivo.content_type,
        "criado_por": current_user.id
    }
    result = supabase.table("documentos").insert(doc_data).execute()
    return {"message": "Sucesso", "documento": result.data[0]}

@app.get("/api/processos/{processo_id}/documentos", tags=["Documentos"])
async def listar_documentos_processo(
    processo_id: int,
    current_user: UsuarioResponse = Depends(get_current_active_user)
):
    supabase = get_supabase_admin()
    result = supabase.table("documentos").select("*").eq("processo_id", processo_id).order("criado_em", desc=True).execute()
    return result.data

@app.get("/api/documentos/{documento_id}/download", tags=["Documentos"])
async def download_documento(
    documento_id: int,
    current_user: UsuarioResponse = Depends(get_current_active_user)
):
    from fastapi.responses import FileResponse
    import os
    supabase = get_supabase_admin()
    result = supabase.table("documentos").select("*").eq("id", documento_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Documento não encontrado")
    doc = result.data[0]
    file_path = doc['arquivo_url']
    if not file_path or not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Arquivo não encontrado")
    return FileResponse(
        path=file_path,
        filename=doc['arquivo_nome'],
        media_type=doc['arquivo_tipo'] or 'application/octet-stream'
    )


@app.post("/api/tramitacoes/{tramitacao_id}/aprovar", tags=["Tramitações"])
async def aprovar_tramitacao(
    tramitacao_id: int,
    current_user: UsuarioResponse = Depends(get_current_active_user),
    data: dict = Body({})
):
    observacao = data.get('observacao')
    from datetime import datetime
    supabase = get_supabase_admin()
    tram = supabase.table("tramitacoes").select("*").eq("id", tramitacao_id).single().execute()
    if not tram.data:
        raise HTTPException(404, "Não encontrada")
    if current_user.setor_id != tram.data['setor_destino_id']:
        raise HTTPException(403, "Sem permissão")
    supabase.table("tramitacoes").update({
        "status_aprovacao": "aprovado",
        "aprovado_por": current_user.id,
        "data_aprovacao": datetime.now().isoformat()
    }).eq("id", tramitacao_id).execute()
    return {"message": "Aprovado"}


@app.get("/api/processos-meus", tags=["Processos"])
async def get_meus_processos(current_user: UsuarioResponse = Depends(get_current_active_user)):
    supabase = get_supabase_admin()
    result = supabase.table("processos").select("*").eq("criado_por", current_user.id).order("criado_em", desc=True).execute()
    return result.data if result.data else []

@app.get("/api/processos-setor", tags=["Processos"])
async def get_processos_setor(current_user: UsuarioResponse = Depends(get_current_active_user)):
    supabase = get_supabase_admin()
    trams = supabase.table("tramitacoes").select("processo_id").eq("setor_destino_id", current_user.setor_id).execute()
    if not trams.data:
        return []
    processo_ids = list(set([t['processo_id'] for t in trams.data]))
    result = supabase.table("processos").select("*").in_("id", processo_ids).order("criado_em", desc=True).execute()
    return result.data if result.data else []


@app.get("/api/processos-relevantes", tags=["Processos"])
async def get_processos_relevantes(current_user: UsuarioResponse = Depends(get_current_active_user)):
    """Lista processos relevantes para o usuário"""
    supabase = get_supabase_admin()
    
    # Processos criados por mim
    meus = supabase.table("processos").select("*").eq("criado_por", current_user.id).execute()
    meus_ids = set([p['id'] for p in meus.data]) if meus.data else set()
    
    # Processos tramitados para meu setor
    trams = supabase.table("tramitacoes").select("processo_id").eq("setor_destino_id", current_user.setor_id).execute()
    setor_ids = set([t['processo_id'] for t in trams.data]) if trams.data else set()
    
    # Combinar
    todos_ids = list(meus_ids | setor_ids)
    
    if not todos_ids:
        return []
    
    result = supabase.table("processos").select("*").in_("id", todos_ids).order("criado_em", desc=True).execute()
    return result.data if result.data else []


@app.get("/api/processos-relevantes", tags=["Processos"])
async def get_processos_relevantes(current_user: UsuarioResponse = Depends(get_current_active_user)):
    """Lista processos relevantes para o usuário"""
    supabase = get_supabase_admin()
    
    # Processos criados por mim
    meus = supabase.table("processos").select("*").eq("criado_por", current_user.id).execute()
    meus_ids = set([p['id'] for p in meus.data]) if meus.data else set()
    
    # Processos tramitados para meu setor
    trams = supabase.table("tramitacoes").select("processo_id").eq("setor_destino_id", current_user.setor_id).execute()
    setor_ids = set([t['processo_id'] for t in trams.data]) if trams.data else set()
    
    # Combinar
    todos_ids = list(meus_ids | setor_ids)
    
    if not todos_ids:
        return []
    
    result = supabase.table("processos").select("*").in_("id", todos_ids).order("criado_em", desc=True).execute()
    return result.data if result.data else []


@app.post("/api/tramitacoes/{tramitacao_id}/rejeitar", tags=["Tramitações"])
async def rejeitar_tramitacao(tramitacao_id: int, current_user: UsuarioResponse = Depends(get_current_active_user), data: dict = Body({})):
    from datetime import datetime
    motivo = data.get('motivo', '')
    if not motivo:
        raise HTTPException(400, "Motivo obrigatório")
    
    supabase = get_supabase_admin()
    tram = supabase.table("tramitacoes").select("*").eq("id", tramitacao_id).single().execute()
    if not tram.data:
        raise HTTPException(404, "Não encontrada")
    
    if current_user.setor_id != tram.data['setor_destino_id']:
        raise HTTPException(403, "Sem permissão")
    
    # Marcar como rejeitada
    supabase.table("tramitacoes").update({
        "status_aprovacao": "rejeitado",
        "aprovado_por": current_user.id,
        "data_aprovacao": datetime.now().isoformat(),
        "motivo_rejeicao": motivo
    }).eq("id", tramitacao_id).execute()
    
    # Criar devolução
    nova = {
        "processo_id": tram.data['processo_id'],
        "setor_origem_id": tram.data['setor_destino_id'],
        "setor_destino_id": tram.data['setor_origem_id'],
        "observacao": f"REJEITADO: {motivo}",
        "tipo_tramitacao": "despacho",
        "enviado_por": current_user.id,
        "status_aprovacao": "pendente"
    }
    supabase.table("tramitacoes").insert(nova).execute()
    
    return {"message": "Rejeitado e devolvido"}
