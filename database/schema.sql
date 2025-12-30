-- Schema para Sistema de Gestão de Processos - CBB
-- Executar no SQL Editor do Supabase

-- Limpar tabelas existentes (cuidado em produção!)
DROP TABLE IF EXISTS assinaturas CASCADE;
DROP TABLE IF EXISTS aprovacoes CASCADE;
DROP TABLE IF EXISTS documentos CASCADE;
DROP TABLE IF EXISTS tramitacoes CASCADE;
DROP TABLE IF EXISTS processos CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;
DROP TABLE IF EXISTS setores CASCADE;
DROP TABLE IF EXISTS tipos_processo CASCADE;

-- Tipos de Processo
CREATE TABLE tipos_processo (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(200) NOT NULL,
    descricao TEXT,
    cor VARCHAR(7) DEFAULT '#3B82F6',
    ativo BOOLEAN DEFAULT true,
    criado_em TIMESTAMP DEFAULT NOW()
);

-- Setores
CREATE TABLE setores (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(200) NOT NULL,
    sigla VARCHAR(20) NOT NULL UNIQUE,
    descricao TEXT,
    email VARCHAR(255),
    responsavel VARCHAR(200),
    ativo BOOLEAN DEFAULT true,
    criado_em TIMESTAMP DEFAULT NOW()
);

-- Usuários
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(200) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    senha_hash VARCHAR(255) NOT NULL,
    setor_id INTEGER REFERENCES setores(id),
    cargo VARCHAR(100),
    cpf VARCHAR(14),
    telefone VARCHAR(20),
    foto_url TEXT,
    ativo BOOLEAN DEFAULT true,
    ultimo_acesso TIMESTAMP,
    criado_em TIMESTAMP DEFAULT NOW()
);

-- Processos
CREATE TABLE processos (
    id SERIAL PRIMARY KEY,
    numero_protocolo VARCHAR(50) NOT NULL UNIQUE,
    ano INTEGER NOT NULL,
    tipo_processo_id INTEGER REFERENCES tipos_processo(id) NOT NULL,
    assunto TEXT NOT NULL,
    interessado VARCHAR(200),
    cpf_cnpj_interessado VARCHAR(18),
    especificacao TEXT,
    
    -- Controle
    status VARCHAR(50) DEFAULT 'aberto', -- aberto, em_tramite, concluido, arquivado
    nivel_acesso VARCHAR(20) DEFAULT 'publico', -- publico, restrito, sigiloso
    prioridade VARCHAR(20) DEFAULT 'normal', -- baixa, normal, alta, urgente
    
    -- Setor atual
    setor_atual_id INTEGER REFERENCES setores(id),
    
    -- Usuário responsável atual (opcional)
    usuario_responsavel_id INTEGER REFERENCES usuarios(id),
    
    -- Observações gerais
    observacoes TEXT,
    
    -- Controle de datas
    data_autuacao TIMESTAMP DEFAULT NOW(),
    data_conclusao TIMESTAMP,
    prazo_dias INTEGER,
    data_prazo TIMESTAMP,
    
    -- Auditoria
    criado_por INTEGER REFERENCES usuarios(id) NOT NULL,
    criado_em TIMESTAMP DEFAULT NOW(),
    atualizado_em TIMESTAMP DEFAULT NOW(),
    
    -- Bloqueio
    bloqueado BOOLEAN DEFAULT false,
    motivo_bloqueio TEXT,
    bloqueado_por INTEGER REFERENCES usuarios(id),
    bloqueado_em TIMESTAMP
);

-- Tramitações
CREATE TABLE tramitacoes (
    id SERIAL PRIMARY KEY,
    processo_id INTEGER REFERENCES processos(id) NOT NULL,
    
    -- Origem e Destino
    setor_origem_id INTEGER REFERENCES setores(id) NOT NULL,
    setor_destino_id INTEGER REFERENCES setores(id) NOT NULL,
    
    -- Informações
    observacao TEXT,
    tipo_tramitacao VARCHAR(50) DEFAULT 'normal', -- normal, urgente, retorno
    
    -- Controle de recebimento
    data_envio TIMESTAMP DEFAULT NOW(),
    data_recebimento TIMESTAMP,
    recebido_por INTEGER REFERENCES usuarios(id),
    
    -- Auditoria
    enviado_por INTEGER REFERENCES usuarios(id) NOT NULL,
    criado_em TIMESTAMP DEFAULT NOW()
);

-- Documentos
CREATE TABLE documentos (
    id SERIAL PRIMARY KEY,
    processo_id INTEGER REFERENCES processos(id) NOT NULL,
    
    -- Informações do documento
    numero_documento VARCHAR(50),
    tipo_documento VARCHAR(50) NOT NULL, -- gerado, externo, anexo
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    
    -- Arquivo
    arquivo_url TEXT,
    arquivo_nome VARCHAR(255),
    arquivo_tamanho BIGINT, -- em bytes
    arquivo_tipo VARCHAR(100), -- mime type
    arquivo_hash VARCHAR(64), -- SHA256 para integridade
    
    -- Conteúdo (para documentos gerados internamente)
    conteudo_html TEXT,
    
    -- Metadados
    data_documento DATE,
    numero_externo VARCHAR(100), -- número de ofício externo, por exemplo
    remetente VARCHAR(200),
    
    -- Controle
    ordem INTEGER DEFAULT 0, -- ordem na árvore do processo
    nivel_acesso VARCHAR(20) DEFAULT 'publico',
    
    -- Status
    status VARCHAR(50) DEFAULT 'ativo', -- ativo, cancelado, substituido
    motivo_cancelamento TEXT,
    cancelado_por INTEGER REFERENCES usuarios(id),
    cancelado_em TIMESTAMP,
    
    -- Assinatura
    requer_assinatura BOOLEAN DEFAULT false,
    assinado BOOLEAN DEFAULT false,
    
    -- Auditoria
    criado_por INTEGER REFERENCES usuarios(id) NOT NULL,
    criado_em TIMESTAMP DEFAULT NOW(),
    atualizado_em TIMESTAMP DEFAULT NOW()
);

-- Aprovações (Workflow)
CREATE TABLE aprovacoes (
    id SERIAL PRIMARY KEY,
    documento_id INTEGER REFERENCES documentos(id),
    processo_id INTEGER REFERENCES processos(id),
    
    -- Pode ser aprovação de documento ou processo
    tipo_aprovacao VARCHAR(50) NOT NULL, -- documento, processo, tramitacao
    
    -- Aprovador
    aprovador_id INTEGER REFERENCES usuarios(id) NOT NULL,
    nivel_aprovacao INTEGER DEFAULT 1, -- 1, 2, 3... (ordem de aprovação)
    
    -- Status
    status VARCHAR(50) DEFAULT 'pendente', -- pendente, aprovado, rejeitado
    observacao TEXT,
    
    -- Datas
    data_solicitacao TIMESTAMP DEFAULT NOW(),
    data_resposta TIMESTAMP,
    
    -- Auditoria
    solicitado_por INTEGER REFERENCES usuarios(id) NOT NULL,
    criado_em TIMESTAMP DEFAULT NOW()
);

-- Assinaturas
CREATE TABLE assinaturas (
    id SERIAL PRIMARY KEY,
    documento_id INTEGER REFERENCES documentos(id) NOT NULL,
    
    -- Assinante
    usuario_id INTEGER REFERENCES usuarios(id) NOT NULL,
    nome_assinante VARCHAR(200) NOT NULL,
    cpf_assinante VARCHAR(14),
    cargo_funcao VARCHAR(200),
    
    -- Tipo de assinatura
    tipo_assinatura VARCHAR(50) DEFAULT 'eletronica', -- eletronica, digital (ICP-Brasil)
    
    -- Dados da assinatura
    hash_documento VARCHAR(64) NOT NULL, -- Hash do documento no momento da assinatura
    hash_assinatura VARCHAR(255), -- Hash da assinatura digital (se aplicável)
    certificado_digital TEXT, -- Dados do certificado (se ICP-Brasil)
    
    -- IP e localização
    ip_assinante VARCHAR(45),
    localizacao TEXT,
    
    -- Validação
    valido BOOLEAN DEFAULT true,
    motivo_invalidacao TEXT,
    
    -- Auditoria
    assinado_em TIMESTAMP DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_processos_numero ON processos(numero_protocolo);
CREATE INDEX idx_processos_status ON processos(status);
CREATE INDEX idx_processos_setor_atual ON processos(setor_atual_id);
CREATE INDEX idx_processos_criado_por ON processos(criado_por);
CREATE INDEX idx_processos_data_autuacao ON processos(data_autuacao);

CREATE INDEX idx_tramitacoes_processo ON tramitacoes(processo_id);
CREATE INDEX idx_tramitacoes_setor_destino ON tramitacoes(setor_destino_id);
CREATE INDEX idx_tramitacoes_data_envio ON tramitacoes(data_envio);

CREATE INDEX idx_documentos_processo ON documentos(processo_id);
CREATE INDEX idx_documentos_tipo ON documentos(tipo_documento);
CREATE INDEX idx_documentos_status ON documentos(status);

CREATE INDEX idx_aprovacoes_aprovador ON aprovacoes(aprovador_id);
CREATE INDEX idx_aprovacoes_status ON aprovacoes(status);
CREATE INDEX idx_aprovacoes_documento ON aprovacoes(documento_id);
CREATE INDEX idx_aprovacoes_processo ON aprovacoes(processo_id);

CREATE INDEX idx_assinaturas_documento ON assinaturas(documento_id);
CREATE INDEX idx_assinaturas_usuario ON assinaturas(usuario_id);

-- Função para gerar número de protocolo automático
CREATE OR REPLACE FUNCTION gerar_numero_protocolo()
RETURNS TRIGGER AS $$
DECLARE
    ano_atual INTEGER;
    sequencial INTEGER;
    novo_protocolo VARCHAR(50);
BEGIN
    ano_atual := EXTRACT(YEAR FROM NOW());
    
    -- Buscar o último sequencial do ano
    SELECT COALESCE(MAX(
        CAST(
            SUBSTRING(numero_protocolo FROM '\d{4}\.CBB\.(\d+)-\d') 
            AS INTEGER
        )
    ), 0) + 1
    INTO sequencial
    FROM processos
    WHERE ano = ano_atual;
    
    -- Formato: AAAA.CBB.NNNNNN-D (onde D é o dígito verificador)
    novo_protocolo := ano_atual || '.CBB.' || LPAD(sequencial::TEXT, 6, '0');
    
    -- Calcular dígito verificador simples (módulo 11)
    -- Simplificado: usar último dígito do sequencial
    novo_protocolo := novo_protocolo || '-' || (sequencial % 10)::TEXT;
    
    NEW.numero_protocolo := novo_protocolo;
    NEW.ano := ano_atual;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para gerar protocolo automaticamente
CREATE TRIGGER trigger_gerar_protocolo
    BEFORE INSERT ON processos
    FOR EACH ROW
    WHEN (NEW.numero_protocolo IS NULL)
    EXECUTE FUNCTION gerar_numero_protocolo();

-- Função para atualizar data de modificação
CREATE OR REPLACE FUNCTION atualizar_data_modificacao()
RETURNS TRIGGER AS $$
BEGIN
    NEW.atualizado_em = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para atualizar data de modificação
CREATE TRIGGER trigger_atualizar_processo
    BEFORE UPDATE ON processos
    FOR EACH ROW
    EXECUTE FUNCTION atualizar_data_modificacao();

CREATE TRIGGER trigger_atualizar_documento
    BEFORE UPDATE ON documentos
    FOR EACH ROW
    EXECUTE FUNCTION atualizar_data_modificacao();

-- Seeds de dados iniciais

-- Tipos de Processo
INSERT INTO tipos_processo (nome, descricao, cor) VALUES
('Compras com Recursos Próprios', 'Processo de aquisição de bens e serviços com recursos próprios da CBB', '#10B981'),
('Processo Administrativo', 'Processos administrativos gerais', '#3B82F6'),
('Contrato', 'Elaboração e gestão de contratos', '#8B5CF6'),
('Convocação', 'Convocações de atletas e comissões técnicas', '#F59E0B'),
('Licitação', 'Processos licitatórios', '#EF4444'),
('Recursos Humanos', 'Processos relacionados a RH', '#06B6D4'),
('Jurídico', 'Processos e pareceres jurídicos', '#EC4899');

-- Setores (baseado no fluxo de compras)
INSERT INTO setores (nome, sigla, descricao, email) VALUES
('Presidência', 'PRES', 'Presidência da CBB', 'presidencia@cbb.com.br'),
('Diretoria Administrativa', 'DIRADM', 'Diretoria Administrativa e Financeira', 'administrativa@cbb.com.br'),
('Tecnologia da Informação', 'TI', 'Setor de Tecnologia e Inovação', 'ti@cbb.com.br'),
('Compras e Contratações', 'COMPRAS', 'Setor de Compras e Contratações', 'compras@cbb.com.br'),
('Financeiro', 'FIN', 'Setor Financeiro e Contabilidade', 'financeiro@cbb.com.br'),
('Jurídico', 'JUR', 'Assessoria Jurídica', 'juridico@cbb.com.br'),
('Recursos Humanos', 'RH', 'Departamento de Recursos Humanos', 'rh@cbb.com.br'),
('Marketing', 'MKT', 'Marketing e Comunicação', 'marketing@cbb.com.br'),
('Competições', 'COMP', 'Departamento de Competições', 'competicoes@cbb.com.br'),
('Seleções', 'SEL', 'Departamento de Seleções Nacionais', 'selecoes@cbb.com.br'),
('Protocolo', 'PROT', 'Setor de Protocolo e Arquivo', 'protocolo@cbb.com.br');

-- Usuários de teste (senha: senha123)
-- Hash bcrypt de 'senha123': $2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYqVMp5qHWa
INSERT INTO usuarios (nome, email, senha_hash, setor_id, cargo, cpf) VALUES
('Roberto Santos', 'roberto@cbb.com.br', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYqVMp5qHWa', 3, 'Gerente de TI', '123.456.789-00'),
('Maria Silva', 'maria@cbb.com.br', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYqVMp5qHWa', 2, 'Diretora Administrativa', '987.654.321-00'),
('João Compras', 'compras@cbb.com.br', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYqVMp5qHWa', 4, 'Coordenador de Compras', '111.222.333-44'),
('Ana Financeiro', 'financeiro@cbb.com.br', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYqVMp5qHWa', 5, 'Gerente Financeiro', '555.666.777-88'),
('Carlos Presidente', 'presidente@cbb.com.br', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYqVMp5qHWa', 1, 'Presidente', '999.888.777-66'),
('Paula Jurídico', 'juridico@cbb.com.br', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYqVMp5qHWa', 6, 'Assessora Jurídica', '444.333.222-11');

-- Views úteis para consultas

-- View: Processos com informações completas
CREATE OR REPLACE VIEW vw_processos_completos AS
SELECT 
    p.id,
    p.numero_protocolo,
    p.assunto,
    p.interessado,
    p.status,
    p.nivel_acesso,
    p.prioridade,
    p.data_autuacao,
    p.data_conclusao,
    p.prazo_dias,
    p.data_prazo,
    tp.nome as tipo_processo,
    tp.cor as tipo_processo_cor,
    sa.nome as setor_atual,
    sa.sigla as setor_atual_sigla,
    uc.nome as criado_por_nome,
    uc.email as criado_por_email,
    ur.nome as responsavel_nome,
    ur.email as responsavel_email,
    (SELECT COUNT(*) FROM documentos WHERE processo_id = p.id AND status = 'ativo') as total_documentos,
    (SELECT COUNT(*) FROM tramitacoes WHERE processo_id = p.id) as total_tramitacoes
FROM processos p
LEFT JOIN tipos_processo tp ON p.tipo_processo_id = tp.id
LEFT JOIN setores sa ON p.setor_atual_id = sa.id
LEFT JOIN usuarios uc ON p.criado_por = uc.id
LEFT JOIN usuarios ur ON p.usuario_responsavel_id = ur.id;

-- View: Documentos com informações completas
CREATE OR REPLACE VIEW vw_documentos_completos AS
SELECT 
    d.id,
    d.processo_id,
    d.numero_documento,
    d.tipo_documento,
    d.nome,
    d.descricao,
    d.arquivo_url,
    d.arquivo_nome,
    d.arquivo_tamanho,
    d.arquivo_tipo,
    d.data_documento,
    d.status,
    d.requer_assinatura,
    d.assinado,
    d.ordem,
    d.criado_em,
    u.nome as criado_por_nome,
    u.email as criado_por_email,
    p.numero_protocolo,
    (SELECT COUNT(*) FROM assinaturas WHERE documento_id = d.id) as total_assinaturas
FROM documentos d
LEFT JOIN usuarios u ON d.criado_por = u.id
LEFT JOIN processos p ON d.processo_id = p.id;

-- View: Tramitações com informações completas
CREATE OR REPLACE VIEW vw_tramitacoes_completas AS
SELECT 
    t.id,
    t.processo_id,
    t.observacao,
    t.tipo_tramitacao,
    t.data_envio,
    t.data_recebimento,
    so.nome as setor_origem_nome,
    so.sigla as setor_origem_sigla,
    sd.nome as setor_destino_nome,
    sd.sigla as setor_destino_sigla,
    ue.nome as enviado_por_nome,
    ur.nome as recebido_por_nome,
    p.numero_protocolo
FROM tramitacoes t
LEFT JOIN setores so ON t.setor_origem_id = so.id
LEFT JOIN setores sd ON t.setor_destino_id = sd.id
LEFT JOIN usuarios ue ON t.enviado_por = ue.id
LEFT JOIN usuarios ur ON t.recebido_por = ur.id
LEFT JOIN processos p ON t.processo_id = p.id;

-- Configurar políticas RLS (Row Level Security) - opcional para produção
-- ALTER TABLE processos ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE documentos ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE tramitacoes ENABLE ROW LEVEL SECURITY;

-- Comentários nas tabelas
COMMENT ON TABLE processos IS 'Processos eletrônicos da CBB';
COMMENT ON TABLE documentos IS 'Documentos anexados aos processos';
COMMENT ON TABLE tramitacoes IS 'Histórico de tramitação dos processos';
COMMENT ON TABLE aprovacoes IS 'Workflow de aprovações';
COMMENT ON TABLE assinaturas IS 'Assinaturas eletrônicas de documentos';
COMMENT ON TABLE setores IS 'Setores/Departamentos da CBB';
COMMENT ON TABLE usuarios IS 'Usuários do sistema';
COMMENT ON TABLE tipos_processo IS 'Tipos de processos disponíveis';

-- Concluído!
SELECT 'Schema criado com sucesso!' as status;
