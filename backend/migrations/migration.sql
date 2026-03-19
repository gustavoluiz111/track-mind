-- 1. usuarios
CREATE TABLE usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(200) NOT NULL,
  cpf VARCHAR(14) UNIQUE NOT NULL,
  telefone VARCHAR(20),
  cargo VARCHAR(100),
  idade INTEGER,
  email VARCHAR(200) UNIQUE NOT NULL,
  senha_hash TEXT NOT NULL,
  foto_url TEXT,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. clientes
CREATE TABLE clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo VARCHAR(10) CHECK (tipo IN ('fisica', 'juridica')) NOT NULL,
  nome VARCHAR(200) NOT NULL,
  documento VARCHAR(20) NOT NULL,
  email VARCHAR(200),
  telefone VARCHAR(20),
  endereco JSONB,
  score INTEGER DEFAULT 100,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. itens
CREATE TABLE itens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token VARCHAR(20) UNIQUE NOT NULL,
  qrcode_url TEXT,
  nome VARCHAR(200) NOT NULL,
  categoria VARCHAR(100),
  numero_serie VARCHAR(100),
  descricao TEXT,
  status VARCHAR(20) CHECK (status IN ('disponivel', 'alugado', 'manutencao', 'inativo')) DEFAULT 'disponivel',
  rastreador_id VARCHAR(100),
  valor_aquisicao DECIMAL(10,2),
  data_aquisicao DATE,
  fotos JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. contratos
CREATE TABLE contratos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero VARCHAR(50) UNIQUE NOT NULL,
  cliente_id UUID REFERENCES clientes(id),
  item_id UUID REFERENCES itens(id),
  checklist_saida_id UUID,
  checklist_retorno_id UUID,
  data_inicio DATE NOT NULL,
  data_fim_previsto DATE NOT NULL,
  data_fim_real DATE,
  valor_periodo DECIMAL(10,2),
  tipo_periodo VARCHAR(10) CHECK (tipo_periodo IN ('diario', 'semanal', 'mensal')),
  valor_total DECIMAL(10,2),
  caucao DECIMAL(10,2),
  multa_diaria DECIMAL(10,2),
  local_entrega JSONB,
  geofence JSONB,
  status VARCHAR(20) CHECK (status IN ('ativo', 'encerrado', 'cancelado', 'vencido')) DEFAULT 'ativo',
  pdf_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. checklists
CREATE TABLE checklists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID REFERENCES itens(id),
  contrato_id UUID REFERENCES contratos(id),
  tipo VARCHAR(30) CHECK (tipo IN ('pre_entrega', 'pos_devolucao', 'manutencao_avulsa')),
  usuario_id UUID REFERENCES usuarios(id),
  respostas JSONB,
  fotos JSONB DEFAULT '[]',
  observacoes TEXT,
  assinatura_url TEXT,
  laudo_pdf_url TEXT,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Adicionando FKs de checklists no contrato
ALTER TABLE contratos ADD CONSTRAINT fk_checklist_saida FOREIGN KEY (checklist_saida_id) REFERENCES checklists(id);
ALTER TABLE contratos ADD CONSTRAINT fk_checklist_retorno FOREIGN KEY (checklist_retorno_id) REFERENCES checklists(id);

-- 6. posicoes_gps
CREATE TABLE posicoes_gps (
  id BIGSERIAL PRIMARY KEY,
  rastreador_id VARCHAR(100),
  item_id UUID REFERENCES itens(id),
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  bateria INTEGER,
  velocidade DECIMAL(5,2),
  signal VARCHAR(50),
  timestamp TIMESTAMPTZ
);

-- 7. alertas
CREATE TABLE alertas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo VARCHAR(50),
  descricao TEXT,
  item_id UUID REFERENCES itens(id),
  contrato_id UUID REFERENCES contratos(id),
  resolvido BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices obrigatórios
CREATE UNIQUE INDEX idx_itens_token ON itens(token);
CREATE INDEX idx_itens_status ON itens(status);
CREATE INDEX idx_itens_rastreador_id ON itens(rastreador_id);
CREATE INDEX idx_contratos_status ON contratos(status);
CREATE INDEX idx_contratos_data_fim_previsto ON contratos(data_fim_previsto);
CREATE INDEX idx_contratos_cliente_id ON contratos(cliente_id);
CREATE INDEX idx_checklists_item_id ON checklists(item_id);
CREATE INDEX idx_checklists_tipo ON checklists(tipo);
CREATE INDEX idx_posicoes_gps_rastreador_id ON posicoes_gps(rastreador_id);
CREATE INDEX idx_posicoes_gps_timestamp_desc ON posicoes_gps(timestamp DESC);
CREATE INDEX idx_alertas_resolvido ON alertas(resolvido) WHERE resolvido = false;
