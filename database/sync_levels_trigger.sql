-- sync_levels_trigger.sql (2026-04-09)
-- Sincroniza pl_level_id (player) com sv_level_id (save) em tempo real

-- 1. Função para atualizar os SAVES quando o nível do PLAYER muda
CREATE OR REPLACE FUNCTION trg_func_player_to_save_level()
RETURNS TRIGGER AS $$
BEGIN
    -- Atualiza todos os saves do jogador apenas se o nível for diferente para evitar loops
    UPDATE save 
    SET sv_level_id = NEW.pl_level_id
    WHERE sa_jo_id = NEW.pl_id 
      AND (sv_level_id IS DISTINCT FROM NEW.pl_level_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger na tabela PLAYER
DROP TRIGGER IF EXISTS trg_player_level_sync ON player;
CREATE TRIGGER trg_player_level_sync
AFTER UPDATE OF pl_level_id ON player
FOR EACH ROW
EXECUTE FUNCTION trg_func_player_to_save_level();


-- 2. Função para atualizar o PLAYER quando um SAVE muda (ex: progresso no jogo)
CREATE OR REPLACE FUNCTION trg_func_save_to_player_level()
RETURNS TRIGGER AS $$
BEGIN
    -- Atualiza o perfil mestre do jogador se o save tiver um nível diferente
    UPDATE player
    SET pl_level_id = NEW.sv_level_id
    WHERE pl_id = NEW.sa_jo_id
      AND (pl_level_id IS DISTINCT FROM NEW.sv_level_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger na tabela SAVE
DROP TRIGGER IF EXISTS trg_save_level_sync ON save;
CREATE TRIGGER trg_save_level_sync
AFTER INSERT OR UPDATE OF sv_level_id ON save
FOR EACH ROW
EXECUTE FUNCTION trg_func_save_to_player_level();
