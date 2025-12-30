from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime, date
from enum import Enum

# Enums
class StatusProcesso(str, Enum):
    ABERTO = "aberto"
    EM_TRAMITE = "em_tramite"
    CONCLUIDO = "concluido"
    ARQUIVADO = "arquivado"

class NivelAcesso(str, Enum):
    PUBLICO = "publico"
    RESTRITO = "restrito"
    SIGILOSO = "sigiloso"

class Prioridade(str, Enum):
    BAIXA = "baixa"
    NORMAL = "normal"
    ALTA = "alta"
    URGENTE = "urgente"

class TipoDocumento(str, Enum):
    GERADO = "gerado"
    EXTERNO = "externo"
    ANEXO = "anexo"

class StatusDocumento(str, Enum):
    ATIVO = "ativo"
    CANCELADO = "cancelado"
    SUBSTITUIDO = "substituido"

class StatusAprovacao(str, Enum):
    PENDENTE = "pendente"
    APROVADO = "aprovado"
    REJEITADO = "rejeitado"

class TipoAssinatura(str, Enum):
    ELETRONICA = "eletronica"
    DIGITAL = "digital"

# Models Base
class SetorBase(BaseModel):
    nome: str
    sigla: str
    descricao: Optional[str] = None
    email: Optional[str] = None
    responsavel: Optional[str] = None
    ativo: bool = True

class SetorCreate(SetorBase):
    pass

class SetorResponse(SetorBase):
    id: int
    criado_em: datetime

    class Config:
        from_attributes = True

class UsuarioBase(BaseModel):
    nome: str
    email: EmailStr
    setor_id: Optional[int] = None
    cargo: Optional[str] = None
    cpf: Optional[str] = None
    telefone: Optional[str] = None
    foto_url: Optional[str] = None
    ativo: bool = True

class UsuarioCreate(UsuarioBase):
    senha: str

class UsuarioUpdate(BaseModel):
    nome: Optional[str] = None
    email: Optional[EmailStr] = None
    setor_id: Optional[int] = None
    cargo: Optional[str] = None
    cpf: Optional[str] = None
    telefone: Optional[str] = None
    foto_url: Optional[str] = None
    ativo: Optional[bool] = None
    senha: Optional[str] = None

class UsuarioResponse(UsuarioBase):
    id: int
    criado_em: datetime
    ultimo_acesso: Optional[datetime] = None

    class Config:
        from_attributes = True

class TipoProcessoBase(BaseModel):
    nome: str
    descricao: Optional[str] = None
    cor: str = "#3B82F6"
    ativo: bool = True

class TipoProcessoCreate(TipoProcessoBase):
    pass

class TipoProcessoResponse(TipoProcessoBase):
    id: int
    criado_em: datetime

    class Config:
        from_attributes = True

class ProcessoBase(BaseModel):
    tipo_processo_id: int
    assunto: str
    interessado: Optional[str] = None
    cpf_cnpj_interessado: Optional[str] = None
    especificacao: Optional[str] = None
    status: StatusProcesso = StatusProcesso.ABERTO
    nivel_acesso: NivelAcesso = NivelAcesso.PUBLICO
    prioridade: Prioridade = Prioridade.NORMAL
    setor_atual_id: Optional[int] = None
    usuario_responsavel_id: Optional[int] = None
    observacoes: Optional[str] = None
    prazo_dias: Optional[int] = None

class ProcessoCreate(ProcessoBase):
    pass

class ProcessoUpdate(BaseModel):
    assunto: Optional[str] = None
    interessado: Optional[str] = None
    cpf_cnpj_interessado: Optional[str] = None
    especificacao: Optional[str] = None
    status: Optional[StatusProcesso] = None
    nivel_acesso: Optional[NivelAcesso] = None
    prioridade: Optional[Prioridade] = None
    setor_atual_id: Optional[int] = None
    usuario_responsavel_id: Optional[int] = None
    observacoes: Optional[str] = None
    prazo_dias: Optional[int] = None

class ProcessoResponse(ProcessoBase):
    id: int
    numero_protocolo: str
    ano: int
    data_autuacao: datetime
    data_conclusao: Optional[datetime] = None
    data_prazo: Optional[datetime] = None
    criado_por: int
    criado_em: datetime
    atualizado_em: datetime
    bloqueado: bool = False

    class Config:
        from_attributes = True

class DocumentoBase(BaseModel):
    processo_id: int
    tipo_documento: TipoDocumento
    nome: str
    descricao: Optional[str] = None
    numero_documento: Optional[str] = None
    data_documento: Optional[date] = None
    numero_externo: Optional[str] = None
    remetente: Optional[str] = None
    nivel_acesso: NivelAcesso = NivelAcesso.PUBLICO
    requer_assinatura: bool = False
    ordem: int = 0

class DocumentoCreate(DocumentoBase):
    conteudo_html: Optional[str] = None

class DocumentoUpdate(BaseModel):
    nome: Optional[str] = None
    descricao: Optional[str] = None
    conteudo_html: Optional[str] = None
    nivel_acesso: Optional[NivelAcesso] = None
    status: Optional[StatusDocumento] = None

class DocumentoResponse(DocumentoBase):
    id: int
    arquivo_url: Optional[str] = None
    arquivo_nome: Optional[str] = None
    arquivo_tamanho: Optional[int] = None
    arquivo_tipo: Optional[str] = None
    conteudo_html: Optional[str] = None
    status: StatusDocumento
    assinado: bool = False
    criado_por: int
    criado_em: datetime
    atualizado_em: datetime

    class Config:
        from_attributes = True

class TramitacaoBase(BaseModel):
    processo_id: int
    setor_destino_id: int
    observacao: Optional[str] = None
    tipo_tramitacao: str = "despacho"  # despacho, parecer, aprovacao

class TramitacaoCreate(TramitacaoBase):
    setor_origem_id: int

class TramitacaoResponse(TramitacaoBase):
    id: int
    setor_origem_id: int
    data_envio: datetime
    data_recebimento: Optional[datetime] = None
    enviado_por: int
    recebido_por: Optional[int] = None
    criado_em: datetime
    status_aprovacao: Optional[str] = "pendente"
    aprovado_por: Optional[int] = None
    data_aprovacao: Optional[datetime] = None
    motivo_rejeicao: Optional[str] = None

    class Config:
        from_attributes = True

class AprovacaoBase(BaseModel):
    tipo_aprovacao: str
    documento_id: Optional[int] = None
    processo_id: Optional[int] = None
    aprovador_id: int
    nivel_aprovacao: int = 1

class AprovacaoCreate(AprovacaoBase):
    pass

class AprovacaoUpdate(BaseModel):
    status: StatusAprovacao
    observacao: Optional[str] = None

class AprovacaoResponse(AprovacaoBase):
    id: int
    status: StatusAprovacao
    observacao: Optional[str] = None
    data_solicitacao: datetime
    data_resposta: Optional[datetime] = None
    solicitado_por: int
    criado_em: datetime

    class Config:
        from_attributes = True

class AssinaturaBase(BaseModel):
    documento_id: int
    cargo_funcao: Optional[str] = None

class AssinaturaCreate(AssinaturaBase):
    senha: str

class AssinaturaResponse(BaseModel):
    id: int
    documento_id: int
    usuario_id: int
    nome_assinante: str
    cpf_assinante: Optional[str] = None
    cargo_funcao: Optional[str] = None
    tipo_assinatura: TipoAssinatura
    hash_documento: str
    assinado_em: datetime
    valido: bool = True

    class Config:
        from_attributes = True

# Auth Models
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    usuario: UsuarioResponse

class TokenData(BaseModel):
    usuario_id: Optional[int] = None
    email: Optional[str] = None

class LoginRequest(BaseModel):
    email: EmailStr
    senha: str

# Dashboard Models
class DashboardStats(BaseModel):
    total_processos: int
    processos_abertos: int
    processos_em_tramite: int
    processos_concluidos: int
    meus_processos: int
    processos_meu_setor: int
    pendentes_aprovacao: int
    pendentes_assinatura: int

# Filtros e Paginação
class ProcessoFiltros(BaseModel):
    numero_protocolo: Optional[str] = None
    assunto: Optional[str] = None
    interessado: Optional[str] = None
    tipo_processo_id: Optional[int] = None
    status: Optional[StatusProcesso] = None
    setor_atual_id: Optional[int] = None
    criado_por: Optional[int] = None
    data_inicio: Optional[date] = None
    data_fim: Optional[date] = None
    prioridade: Optional[Prioridade] = None

class PaginationParams(BaseModel):
    page: int = Field(1, ge=1)
    page_size: int = Field(20, ge=1, le=100)

class PaginatedResponse(BaseModel):
    items: List
    total: int
    page: int
    page_size: int
    total_pages: int
