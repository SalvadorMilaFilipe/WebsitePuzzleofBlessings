-- ==============================================================
-- status_sessao_postgresql.sql (ATUALIZADO PARA SUPABASE/POSTGRES)
-- Descrição: Altera a tabela 'sessao' existente e cria a tabela 'status'.
-- ==============================================================

-- 1. CRIAR A TABELA DE STATUS PRIMEIRO
CREATE TABLE IF NOT EXISTS status (
    st_cod         SERIAL       PRIMARY KEY,
    st_status      VARCHAR(20)  NOT NULL UNIQUE,
    st_ativonosite BOOLEAN      NOT NULL DEFAULT FALSE,
    st_cor         CHAR(7)      NOT NULL DEFAULT '#808080'
);

-- Inserir os 3 estados base (Online, Inativo, Offline)
INSERT INTO status (st_cod, st_status, st_ativonosite, st_cor) VALUES
    (1, 'online',   TRUE,  '#22C55E'), -- No jogo E no site
    (2, 'inativo',  FALSE, '#F59E0B'), -- No jogo, mas NÃO no site
    (3, 'offline',  FALSE, '#6B7280')  -- Em nenhum
ON CONFLICT (st_cod) DO UPDATE 
SET st_status = EXCLUDED.st_status, 
    st_ativonosite = EXCLUDED.st_ativonosite, 
    st_cor = EXCLUDED.st_cor;

-- Ajustar a sequência para não dar erro nos próximos inserts
SELECT setval('status_st_cod_seq', (SELECT MAX(st_cod) FROM status));


-- 2. ALTERAR A TABELA JOGADOR PARA USAR O STATUS NOVO
-- Primeiro removemos a coluna antiga se ela for texto, ou apenas garantimos que existe a FK
DO $$ 
BEGIN
    -- Se a coluna jo_status já existir e for varchar, removemos para recriar como int
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jogador' AND column_name = 'jo_status' AND data_type = 'character varying') THEN
        ALTER TABLE jogador DROP COLUMN jo_status;
    END IF;

    -- Adiciona a coluna como INTEGER apontando para a tabela status
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jogador' AND column_name = 'jo_status') THEN
        ALTER TABLE jogador ADD COLUMN jo_status INTEGER NOT NULL DEFAULT 3 REFERENCES status(st_cod);
    END IF;
END $$;


-- 3. ALTERAR A TABELA SESSAO PARA INCLUIR O TIPO
-- Adiciona a coluna se_tipo (se não existir) para sabermos se é login no site ou no jogo
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sessao' AND column_name = 'se_tipo') THEN
        ALTER TABLE sessao ADD COLUMN se_tipo VARCHAR(10) DEFAULT 'site' CHECK (se_tipo IN ('site', 'jogo'));
    END IF;
END $$;


-- 4. FUNÇÃO PARA CALCULAR O STATUS AUTOMATICAMENTE
-- Esta função vê se há sessões abertas (onde se_datafim é NULL)
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


-- 5. TRIGGER PARA ATUALIZAR O STATUS SEMPRE QUE A SESSAO MUDAR
CREATE OR REPLACE FUNCTION trg_func_update_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Atualiza o status na tabela jogador
    UPDATE jogador 
    SET jo_status = calcular_status_jogador(NEW.se_jogador)
    WHERE jo_cod = NEW.se_jogador;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Remove o trigger se já existir para não duplicar
DROP TRIGGER IF EXISTS trg_atualiza_status_jogador ON sessao;

-- Cria o trigger para INSERT e UPDATE (quando fecha a sessão)
CREATE TRIGGER trg_atualiza_status_jogador
AFTER INSERT OR UPDATE ON sessao
FOR EACH ROW
EXECUTE FUNCTION trg_func_update_status();


-- 6. VIEW PARA CONSULTA FÁCIL
CREATE OR REPLACE VIEW v_status_jogadores AS
SELECT 
    j.jo_cod,
    j.jo_user,
    s.st_status,
    s.st_cor,
    s.st_ativonosite
FROM jogador j
JOIN status s ON j.jo_status = s.st_cod;
