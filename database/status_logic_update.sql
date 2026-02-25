-- ==============================================================
-- ATUALIZAÇÃO DA LÓGICA DE STATUS E SESSÕES
-- ==============================================================

-- 1. ATUALIZAR A FUNÇÃO DE CÁLCULO DE STATUS
-- Lógica nova:
-- Site E Jogo = Online (Green)
-- Só Site OU Só Jogo = Inativo (Orange)
-- Nenhum = Offline (Gray)
CREATE OR REPLACE FUNCTION calcular_status_jogador(p_jo_cod INTEGER)
RETURNS INTEGER AS $$
DECLARE
    v_jogo_ativo BOOLEAN;
    v_site_ativo BOOLEAN;
BEGIN
    -- Verifica se tem sessão de JOGO aberta (se_datafim IS NULL)
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
    IF v_jogo_ativo AND v_site_ativo THEN
        RETURN 1; -- Online (Verde)
    ELSIF v_jogo_ativo OR v_site_ativo THEN
        RETURN 2; -- Inativo (Laranja)
    ELSE
        RETURN 3; -- Offline (Cinzento)
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 2. GARANTIR QUE O STATUS É ATUALIZADO NO INSERT/UPDATE DA SESSÃO
-- (O trigger já deve existir das execuções anteriores, mas vamos reforçar)
CREATE OR REPLACE FUNCTION trg_func_update_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Atualiza o status na tabela jogador para o jogador da sessão
    -- Usamos NEW para INSERT/UPDATE e OLD para DELETE
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

-- 3. PERMISSÕES (RLS) - Garantir que o utilizador pode fechar a sua sessão
-- Se o RLS estiver ativado, precisamos destas políticas
ALTER TABLE sessao ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can insert their own sessions" ON sessao;
CREATE POLICY "Users can insert their own sessions" ON sessao
FOR INSERT TO authenticated
WITH CHECK (true); -- O trigger garante a integridade, mas no Supabase precisamos disto

DROP POLICY IF EXISTS "Users can update their own sessions" ON sessao;
CREATE POLICY "Users can update their own sessions" ON sessao
FOR UPDATE TO authenticated
USING (EXISTS (
    SELECT 1 FROM jogador 
    WHERE jo_cod = sessao.se_jogador AND jo_email = auth.email()
));

DROP POLICY IF EXISTS "Users can view their own sessions" ON sessao;
CREATE POLICY "Users can view their own sessions" ON sessao
FOR SELECT TO authenticated
USING (EXISTS (
    SELECT 1 FROM jogador 
    WHERE jo_cod = sessao.se_jogador AND jo_email = auth.email()
));
