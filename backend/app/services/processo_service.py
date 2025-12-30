from typing import List, Optional
from fastapi import HTTPException, status
from datetime import datetime, timedelta
from app.database import get_supabase_admin
from app.models import (
    ProcessoCreate, ProcessoUpdate, ProcessoResponse,
    TramitacaoCreate, TramitacaoResponse,
    DashboardStats, ProcessoFiltros
)

class ProcessoService:
    def __init__(self):
        self.supabase = get_supabase_admin()
    
    async def criar_processo(self, processo_data: ProcessoCreate, usuario_id: int) -> ProcessoResponse:
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
        data["criado_por"] = usuario_id
        
        # Calcular data de prazo se prazo_dias foi informado
        if data.get("prazo_dias"):
            data["data_prazo"] = datetime.now() + timedelta(days=data["prazo_dias"])
        
        # Inserir processo
        result = self.supabase.table("processos").insert(data).execute()
        
        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Erro ao criar processo"
            )
        
        processo = result.data[0]
        return ProcessoResponse(**processo)
    
    async def buscar_processo(self, processo_id: int) -> ProcessoResponse:
        """Busca processo por ID"""
        result = self.supabase.table("processos").select("*").eq("id", processo_id).single().execute()
        
        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Processo não encontrado"
            )
        
        return ProcessoResponse(**result.data)
    
    async def buscar_por_protocolo(self, numero_protocolo: str) -> ProcessoResponse:
        """Busca processo por número de protocolo"""
        result = self.supabase.table("processos").select("*").eq("numero_protocolo", numero_protocolo).single().execute()
        
        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Processo não encontrado"
            )
        
        return ProcessoResponse(**result.data)
    
    async def listar_processos(
        self, 
        filtros: Optional[ProcessoFiltros] = None,
        usuario_id: Optional[int] = None,
        setor_id: Optional[int] = None,
        limit: int = 20,
        offset: int = 0
    ) -> tuple[List[ProcessoResponse], int]:
        """Lista processos com filtros"""
        query = self.supabase.table("processos").select("*", count="exact")
        
        # Aplicar filtros
        if filtros:
            if filtros.numero_protocolo:
                query = query.ilike("numero_protocolo", f"%{filtros.numero_protocolo}%")
            if filtros.assunto:
                query = query.ilike("assunto", f"%{filtros.assunto}%")
            if filtros.interessado:
                query = query.ilike("interessado", f"%{filtros.interessado}%")
            if filtros.tipo_processo_id:
                query = query.eq("tipo_processo_id", filtros.tipo_processo_id)
            if filtros.status:
                query = query.eq("status", filtros.status.value)
            if filtros.setor_atual_id:
                query = query.eq("setor_atual_id", filtros.setor_atual_id)
            if filtros.criado_por:
                query = query.eq("criado_por", filtros.criado_por)
            if filtros.prioridade:
                query = query.eq("prioridade", filtros.prioridade.value)
            if filtros.data_inicio:
                query = query.gte("data_autuacao", filtros.data_inicio.isoformat())
            if filtros.data_fim:
                query = query.lte("data_autuacao", filtros.data_fim.isoformat())
        
        # Filtros adicionais
        if usuario_id:
            query = query.eq("criado_por", usuario_id)
        if setor_id:
            query = query.eq("setor_atual_id", setor_id)
        
        # Ordenar e paginar
        result = query.order("data_autuacao", desc=True).range(offset, offset + limit - 1).execute()
        
        processos = [ProcessoResponse(**p) for p in result.data]
        total = result.count if result.count else 0
        
        return processos, total
    
    async def atualizar_processo(self, processo_id: int, processo_data: ProcessoUpdate, usuario_id: int) -> ProcessoResponse:
        """Atualiza processo"""
        # Verificar se processo existe
        await self.buscar_processo(processo_id)
        
        # Atualizar apenas campos não nulos
        data = processo_data.model_dump(exclude_unset=True)
        
        if not data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Nenhum campo para atualizar"
            )
        
        # Atualizar prazo se necessário
        if "prazo_dias" in data and data["prazo_dias"]:
            data["data_prazo"] = datetime.now() + timedelta(days=data["prazo_dias"])
        
        result = self.supabase.table("processos").update(data).eq("id", processo_id).execute()
        
        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Erro ao atualizar processo"
            )
        
        return ProcessoResponse(**result.data[0])
    
    async def tramitar_processo(self, tramitacao_data: TramitacaoCreate, usuario_id: int) -> TramitacaoResponse:
        """Tramita processo entre setores"""
        # Verificar se processo existe
        await self.buscar_processo(tramitacao_data.processo_id)
        
        # Criar tramitação
        data = tramitacao_data.model_dump()
        data["enviado_por"] = usuario_id
        
        result = self.supabase.table("tramitacoes").insert(data).execute()
        
        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Erro ao tramitar processo"
            )
        
        tramitacao = result.data[0]
        
        # Atualizar setor atual do processo
        self.supabase.table("processos").update({
            "setor_atual_id": tramitacao_data.setor_destino_id,
            "status": "em_tramite"
        }).eq("id", tramitacao_data.processo_id).execute()
        
        return TramitacaoResponse(**tramitacao)
    
    async def listar_tramitacoes(self, processo_id: int) -> List[TramitacaoResponse]:
        """Lista histórico de tramitações de um processo"""
        result = self.supabase.table("tramitacoes").select("*").eq("processo_id", processo_id).order("data_envio", desc=True).execute()
        
        return [TramitacaoResponse(**t) for t in result.data]
    
    async def concluir_processo(self, processo_id: int, usuario_id: int) -> ProcessoResponse:
        """Conclui um processo"""
        # Verificar se processo existe
        processo = await self.buscar_processo(processo_id)
        
        if processo.status == "concluido":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Processo já está concluído"
            )
        
        # Atualizar status
        result = self.supabase.table("processos").update({
            "status": "concluido",
            "data_conclusao": datetime.now().isoformat()
        }).eq("id", processo_id).execute()
        
        return ProcessoResponse(**result.data[0])
    
    async def reabrir_processo(self, processo_id: int, usuario_id: int) -> ProcessoResponse:
        """Reabre um processo concluído"""
        # Verificar se processo existe
        processo = await self.buscar_processo(processo_id)
        
        if processo.status != "concluido":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Processo não está concluído"
            )
        
        # Atualizar status
        result = self.supabase.table("processos").update({
            "status": "aberto",
            "data_conclusao": None
        }).eq("id", processo_id).execute()
        
        return ProcessoResponse(**result.data[0])
    
    async def bloquear_processo(self, processo_id: int, motivo: str, usuario_id: int) -> ProcessoResponse:
        """Bloqueia um processo"""
        await self.buscar_processo(processo_id)
        
        result = self.supabase.table("processos").update({
            "bloqueado": True,
            "motivo_bloqueio": motivo,
            "bloqueado_por": usuario_id,
            "bloqueado_em": datetime.now().isoformat()
        }).eq("id", processo_id).execute()
        
        return ProcessoResponse(**result.data[0])
    
    async def desbloquear_processo(self, processo_id: int, usuario_id: int) -> ProcessoResponse:
        """Desbloqueia um processo"""
        await self.buscar_processo(processo_id)
        
        result = self.supabase.table("processos").update({
            "bloqueado": False,
            "motivo_bloqueio": None,
            "bloqueado_por": None,
            "bloqueado_em": None
        }).eq("id", processo_id).execute()
        
        return ProcessoResponse(**result.data[0])
    
    async def get_dashboard_stats(self, usuario_id: int, setor_id: Optional[int] = None) -> DashboardStats:
        """Retorna estatísticas para o dashboard"""
        # Total de processos
        total = self.supabase.table("processos").select("id", count="exact").execute()
        
        # Processos abertos
        abertos = self.supabase.table("processos").select("id", count="exact").eq("status", "aberto").execute()
        
        # Processos em tramite
        em_tramite = self.supabase.table("processos").select("id", count="exact").eq("status", "em_tramite").execute()
        
        # Processos concluídos
        concluidos = self.supabase.table("processos").select("id", count="exact").eq("status", "concluido").execute()
        
        # Meus processos
        meus = self.supabase.table("processos").select("id", count="exact").eq("criado_por", usuario_id).execute()
        
        # Processos do meu setor
        meu_setor = 0
        if setor_id:
            result = self.supabase.table("processos").select("id", count="exact").eq("setor_atual_id", setor_id).execute()
            meu_setor = result.count if result.count else 0
        
        # Pendentes de aprovação
        aprovacoes = self.supabase.table("aprovacoes").select("id", count="exact").eq("aprovador_id", usuario_id).eq("status", "pendente").execute()
        
        # Pendentes de assinatura (documentos que requerem minha assinatura)
        # Simplificado: documentos dos processos do meu setor que requerem assinatura e ainda não foram assinados
        assinaturas_count = 0
        if setor_id:
            docs_result = self.supabase.table("documentos").select("id").eq("requer_assinatura", True).eq("assinado", False).execute()
            assinaturas_count = len(docs_result.data) if docs_result.data else 0
        
        return DashboardStats(
            total_processos=total.count if total.count else 0,
            processos_abertos=abertos.count if abertos.count else 0,
            processos_em_tramite=em_tramite.count if em_tramite.count else 0,
            processos_concluidos=concluidos.count if concluidos.count else 0,
            meus_processos=meus.count if meus.count else 0,
            processos_meu_setor=meu_setor,
            pendentes_aprovacao=aprovacoes.count if aprovacoes.count else 0,
            pendentes_assinatura=assinaturas_count
        )
