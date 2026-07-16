CREATE OR REPLACE FUNCTION verify_game_password(p_username_game text, p_password_game text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_stored_hash text;
BEGIN
  -- Busca o hash salvo no banco de dados para o jogador com o username do jogo fornecido
  SELECT pl_password_game INTO v_stored_hash
  FROM player
  WHERE pl_username_game ILIKE p_username_game;

  -- Se não encontrar jogador, retorna falso
  IF NOT FOUND THEN
    RETURN false;
  END IF;

  -- Se o campo de senha for nulo, retorna falso
  IF v_stored_hash IS NULL THEN
    RETURN false;
  END IF;

  -- Verifica se a senha salva já é um hash do bcrypt (começa com $2a$ ou $2b$)
  IF v_stored_hash LIKE '$2a$%' OR v_stored_hash LIKE '$2b$%' THEN
    -- Usa a extensão pgcrypto para verificar se a senha batem
    RETURN v_stored_hash = crypt(p_password_game, v_stored_hash);
  ELSE
    -- Caso a migração não tenha rodado para este usuário, faz fallback pra plaintext
    RETURN v_stored_hash = p_password_game;
  END IF;
END;
$$;
