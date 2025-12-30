from typing import List, Optional
from fastapi import HTTPException, status, UploadFile
from app.database import get_supabase_admin
from app.models import DocumentoCreate, DocumentoUpdate, DocumentoResponse
from app.utils.auth import calcular_hash_documento
import uuid

class DocumentoService:
    def __init__(self):
        self.supabase = get_supabase_admin()
    
    async def criar_documento(self, documento_data: DocumentoCreate, usuario_id: int) -> DocumentoResponse:
        """Cria um novo documento"""
        data = documento_data.model_dump()
        data["criado_por"] = usuario_id
        data["status"] = "ativo"
        
        # Calcular hash do conteúdo HTML se fornecido
        if data.get("conteudo_html"):
            data["arquivo_hash"] = calcular_hash_documento(data["conteudo_html"])
        
        # Inserir documento
        result = self.supabase.table("documentos").insert(data).execute()
        
        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Erro ao criar documento"
            )
        
        return DocumentoResponse(**result.data[0])
    
    async def upload_documento(
        self, 
        processo_id: int,
        arquivo: UploadFile,
        usuario_id: int,
        tipo_documento: str = "anexo",
        nome: Optional[str] = None,
        descricao: Optional[str] = None
    ) -> DocumentoResponse:
        """Faz upload de um arquivo como documento"""
        # Ler conteúdo do arquivo
        conteudo = await arquivo.read()
        
        # Gerar nome único para o arquivo
        extensao = arquivo.filename.split(".")[-1] if "." in arquivo.filename else ""
        nome_arquivo = f"{uuid.uuid4()}.{extensao}" if extensao else str(uuid.uuid4())
        
        # Upload para Supabase Storage
        bucket = "documentos"  # Criar este bucket no Supabase Storage
        caminho = f"{processo_id}/{nome_arquivo}"
        
        try:
            # Upload do arquivo
            self.supabase.storage.from_(bucket).upload(
                caminho,
                conteudo,
                {"content-type": arquivo.content_type or "application/octet-stream"}
            )
            
            # Obter URL pública
            url_publica = self.supabase.storage.from_(bucket).get_public_url(caminho)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Erro ao fazer upload do arquivo: {str(e)}"
            )
        
        # Criar registro do documento
        documento_data = {
            "processo_id": processo_id,
            "tipo_documento": tipo_documento,
            "nome": nome or arquivo.filename,
            "descricao": descricao,
            "arquivo_url": url_publica,
            "arquivo_nome": arquivo.filename,
            "arquivo_tamanho": len(conteudo),
            "arquivo_tipo": arquivo.content_type,
            "arquivo_hash": calcular_hash_documento(conteudo.decode('latin1') if isinstance(conteudo, bytes) else conteudo),
            "criado_por": usuario_id,
            "status": "ativo"
        }
        
        result = self.supabase.table("documentos").insert(documento_data).execute()
        
        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Erro ao criar registro do documento"
            )
        
        return DocumentoResponse(**result.data[0])
    
    async def buscar_documento(self, documento_id: int) -> DocumentoResponse:
        """Busca documento por ID"""
        result = self.supabase.table("documentos").select("*").eq("id", documento_id).single().execute()
        
        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Documento não encontrado"
            )
        
        return DocumentoResponse(**result.data)
    
    async def listar_documentos(self, processo_id: int) -> List[DocumentoResponse]:
        """Lista documentos de um processo"""
        result = self.supabase.table("documentos").select("*").eq("processo_id", processo_id).eq("status", "ativo").order("ordem").order("criado_em").execute()
        
        return [DocumentoResponse(**d) for d in result.data]
    
    async def atualizar_documento(self, documento_id: int, documento_data: DocumentoUpdate, usuario_id: int) -> DocumentoResponse:
        """Atualiza documento"""
        # Verificar se documento existe
        await self.buscar_documento(documento_id)
        
        # Atualizar apenas campos não nulos
        data = documento_data.model_dump(exclude_unset=True)
        
        if not data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Nenhum campo para atualizar"
            )
        
        # Se atualizando conteúdo HTML, recalcular hash
        if "conteudo_html" in data:
            data["arquivo_hash"] = calcular_hash_documento(data["conteudo_html"])
        
        result = self.supabase.table("documentos").update(data).eq("id", documento_id).execute()
        
        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Erro ao atualizar documento"
            )
        
        return DocumentoResponse(**result.data[0])
    
    async def cancelar_documento(self, documento_id: int, motivo: str, usuario_id: int) -> DocumentoResponse:
        """Cancela um documento"""
        await self.buscar_documento(documento_id)
        
        result = self.supabase.table("documentos").update({
            "status": "cancelado",
            "motivo_cancelamento": motivo,
            "cancelado_por": usuario_id,
            "cancelado_em": "now()"
        }).eq("id", documento_id).execute()
        
        return DocumentoResponse(**result.data[0])
    
    async def excluir_documento(self, documento_id: int, usuario_id: int) -> bool:
        """Exclui documento (soft delete - apenas marca como cancelado)"""
        await self.cancelar_documento(documento_id, "Documento excluído", usuario_id)
        return True
    
    async def reordenar_documentos(self, processo_id: int, ordem: List[int]) -> bool:
        """Reordena documentos de um processo"""
        # Atualizar ordem de cada documento
        for idx, doc_id in enumerate(ordem):
            self.supabase.table("documentos").update({
                "ordem": idx
            }).eq("id", doc_id).eq("processo_id", processo_id).execute()
        
        return True
