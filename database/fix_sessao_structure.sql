-- ==============================================================
-- FIX_SESSAO_TABLE_STRUCTURE.SQL
-- Ajusta a tabela sessao para bater exatamente com a imagem e a nova lógica
-- ==============================================================

-- 1. ADICIONAR COLUNAS SE NÃO EXISTIREM (Split de Data e Hora conforme imagem)
DO $$ 
BEGIN
    -- Data de Início
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sessao' AND column_name = 'se_dataini') THEN
        ALTER TABLE sessao ADD COLUMN se_dataini DATE DEFAULT CURRENT_DATE;
    END IF;

    -- Hora de Início
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sessao' AND column_name = 'se_horaini') THEN
        ALTER TABLE sessao ADD COLUMN se_horaini TIME DEFAULT CURRENT_TIME;
    END IF;

    -- Data de Fim
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sessao' AND column_name = 'se_datafim') THEN
        ALTER TABLE sessao ADD COLUMN se_datafim DATE;
    END IF;

    -- Hora de Fim
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sessao' AND column_name = 'se_horafim') THEN
        ALTER TABLE sessao ADD COLUMN se_horafim TIME;
    END IF;
    
    -- Tipo de Sessão
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sessao' AND column_name = 'se_tipo') THEN
        ALTER TABLE sessao ADD COLUMN se_tipo VARCHAR(10) DEFAULT 'site' CHECK (se_tipo IN ('site', 'jogo'));
    END IF;
END $$;

-- 2. ATUALIZAR FUNÇÃO DE CÁLCULO DE STATUS PARA USAR AS NOVAS COLUNAS
-- Consideramos uma sessão ATIVA se se_datafim (ou se_horafim) for NULL
CREATE OR REPLACE FUNCTION calcular_status_jogador(p_jo_cod INTEGER)
RETURNS INTEGER AS $$
DECLARE
    v_jogo_ativo BOOLEAN;
    v_site_ativo BOOLEAN;
BEGIN
    -- Verifica se tem sessão de JOGO aberta
    SELECT EXISTS (
        SELECT 1 FROM sessao 
        WHERE se_jogador = p_jo_cod AND se_tipo = 'jogo' AND se_datafim IS NULL
    ) INTO v_jogo_ativo;

    -- Verifica se tem sessão de SITE aberta
    SELECT EXISTS (
        SELECT 1 FROM sessao 
        WHERE se_jogador = p_jo_cod AND se_tipo = 'site' AND se_datafim IS NULL
    ) INTO v_site_ativo;

    -- Lógica solicitada:
    -- Online: Jogo + Site
    -- Inativo: Apenas Jogo OU Apenas Site
    -- Offline: Nenhum
    
    IF v_jogo_ativo AND v_site_ativo THEN
        RETURN 1; -- online
    ELSIF v_jogo_ativo OR v_site_ativo THEN
        RETURN 2; -- inativo
    ELSE
        RETURN 3; -- offline
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 3. RE-CRIAR O TRIGGER PARA GARANTIR QUE ELE USA A FUNÇÃO ATUALIZADA
DROP TRIGGER IF EXISTS trg_atualiza_status_jogador ON sessao;
CREATE TRIGGER trg_atualiza_status_jogador
AFTER INSERT OR UPDATE OR DELETE ON sessao
FOR EACH ROW
EXECUTE FUNCTION trg_func_update_status();
