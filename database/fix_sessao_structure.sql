-- 1. GARANTIR A TABELA STATUS (Conforme a imagem enviada)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'status' AND column_name = 'st_ativonojogo') THEN
        ALTER TABLE status ADD COLUMN st_ativonojogo BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- Atualizar os dados dos status para bater com a lógica desejada
INSERT INTO status (st_cod, st_status, st_ativonosite, st_ativonojogo, st_cor) VALUES
    (1, 'online',   TRUE,  TRUE,  '#22C55E'), -- No jogo E no site
    (2, 'inativo',  FALSE, TRUE,  '#F59E0B'), -- No jogo, mas NÃO no site (ou vice-versa conforme lógica anterior, mas vamos priorizar os flags)
    (3, 'offline',  FALSE, FALSE, '#6B7280')  -- Em nenhum
ON CONFLICT (st_cod) DO UPDATE 
SET st_status = EXCLUDED.st_status, 
    st_ativonosite = EXCLUDED.st_ativonosite, 
    st_ativonojogo = EXCLUDED.st_ativonojogo,
    st_cor = EXCLUDED.st_cor;


-- 2. FUNÇÃO DE CÁLCULO DE STATUS (DINÂMICA)
-- Agora a função verifica os flags na tabela status para decidir o ID
CREATE OR REPLACE FUNCTION calcular_status_jogador(p_jo_cod INTEGER)
RETURNS INTEGER AS $$
DECLARE
    v_jogo_ativo BOOLEAN;
    v_site_ativo BOOLEAN;
BEGIN
    -- Verifica sessões abertas
    SELECT EXISTS (SELECT 1 FROM sessao WHERE se_jogador = p_jo_cod AND se_tipo = 'jogo' AND se_datafim IS NULL) INTO v_jogo_ativo;
    SELECT EXISTS (SELECT 1 FROM sessao WHERE se_jogador = p_jo_cod AND se_tipo = 'site' AND se_datafim IS NULL) INTO v_site_ativo;

    -- Lógica baseada nos campos da tabela Status:
    IF v_jogo_ativo AND v_site_ativo THEN
        RETURN 1; -- Online (TRUE, TRUE)
    ELSIF v_jogo_ativo OR v_site_ativo THEN
        RETURN 2; -- Inativo (Apenas um ativo)
    ELSE
        RETURN 3; -- Offline (Nenhum)
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 3. TRIGGERS E OUTROS (Restante do ficheiro mantém-se igual...)
-- (Executar o restante do fix_sessao_structure.sql para garantir integridade)

-- 4. TRIGGER PARA FECHAR SESSÕES ANTIGAS AUTOMATICAMENTE
-- Antes de inserir uma nova sessão, esta função fecha todas as sessões abertas 
-- do mesmo tipo para aquele jogador.
CREATE OR REPLACE FUNCTION trg_func_fechar_sessoes_antigas()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE sessao 
    SET se_datafim = CURRENT_DATE, 
        se_horafim = CURRENT_TIME
    WHERE se_jogador = NEW.se_jogador 
      AND se_tipo = NEW.se_tipo 
      AND se_datafim IS NULL;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_fecha_sessoes_antigas ON sessao;
CREATE TRIGGER trg_fecha_sessoes_antigas
BEFORE INSERT ON sessao
FOR EACH ROW
EXECUTE FUNCTION trg_func_fechar_sessoes_antigas();


-- 5. TRIGGER PARA ATUALIZAÇÃO DO STATUS (JÁ EXISTENTE)
CREATE OR REPLACE FUNCTION trg_func_update_status()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'DELETE') THEN
        UPDATE jogador SET jo_status = calcular_status_jogador(OLD.se_jogador) WHERE jo_cod = OLD.se_jogador;
    ELSE
        UPDATE jogador SET jo_status = calcular_status_jogador(NEW.se_jogador) WHERE jo_cod = NEW.se_jogador;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_atualiza_status_jogador ON sessao;
CREATE TRIGGER trg_atualiza_status_jogador
AFTER INSERT OR UPDATE OR DELETE ON sessao
FOR EACH ROW
EXECUTE FUNCTION trg_func_update_status();


-- 6. VIEW PARA MONITORIZAÇÃO
CREATE OR REPLACE VIEW v_sessoes_detalhadas AS
SELECT 
    s.se_cod,
    j.jo_user AS nome_jogador,
    s.se_tipo,
    s.se_dataini,
    s.se_horaini,
    s.se_datafim,
    s.se_horafim
FROM sessao s
JOIN jogador j ON s.se_jogador = j.jo_cod;


-- 7. PERMISSÕES (RLS)
ALTER TABLE sessao ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can insert their own sessions" ON sessao;
CREATE POLICY "Users can insert their own sessions" ON sessao
FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update their own sessions" ON sessao;
CREATE POLICY "Users can update their own sessions" ON sessao
FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM jogador WHERE jo_cod = sessao.se_jogador AND jo_email = auth.email()));

DROP POLICY IF EXISTS "Users can view their own sessions" ON sessao;
CREATE POLICY "Users can view their own sessions" ON sessao
FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM jogador WHERE jo_cod = sessao.se_jogador AND jo_email = auth.email()));


-- 8. CRIAR SESSÕES PARA TODOS OS UTILIZADORES EXISTENTES (População Inicial)
-- Isto garante que todos os 'uts' na tabela jogador têm uma sessão de site inicial
INSERT INTO sessao (se_jogador, se_tipo)
SELECT jo_cod, 'site'
FROM jogador j
WHERE NOT EXISTS (
    SELECT 1 FROM sessao s 
    WHERE s.se_jogador = j.jo_cod 
      AND s.se_tipo = 'site' 
      AND s.se_datafim IS NULL
);
