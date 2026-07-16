-- 1. Habilitar a extensão pgcrypto
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Criar a função que fará o hash automático antes de Inserir ou Atualizar
CREATE OR REPLACE FUNCTION hash_player_passwords()
RETURNS TRIGGER AS $$
BEGIN
    -- Verifica e faz o hash de pl_password_site
    IF NEW.pl_password_site IS NOT NULL THEN
        -- Evita fazer hash duplo se a senha já começar com $2a$ ou $2b$ (formato do bcrypt)
        IF NEW.pl_password_site NOT LIKE '$2a$%' AND NEW.pl_password_site NOT LIKE '$2b$%' THEN
            NEW.pl_password_site := crypt(NEW.pl_password_site, gen_salt('bf'));
        END IF;
    END IF;

    -- Verifica e faz o hash de pl_password_game
    IF NEW.pl_password_game IS NOT NULL THEN
        -- Evita fazer hash duplo se a senha já começar com $2a$ ou $2b$ (formato do bcrypt)
        IF NEW.pl_password_game NOT LIKE '$2a$%' AND NEW.pl_password_game NOT LIKE '$2b$%' THEN
            NEW.pl_password_game := crypt(NEW.pl_password_game, gen_salt('bf'));
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Criar o Trigger na tabela 'player'
DROP TRIGGER IF EXISTS trigger_hash_player_passwords ON player;
CREATE TRIGGER trigger_hash_player_passwords
BEFORE INSERT OR UPDATE ON player
FOR EACH ROW
EXECUTE FUNCTION hash_player_passwords();

-- 4. Migração: Fazer o hash das senhas existentes na tabela que ainda estão em texto puro
-- Aviso: Isso pode levar alguns segundos dependendo da quantidade de jogadores.
UPDATE player
SET 
    pl_password_site = crypt(pl_password_site, gen_salt('bf'))
WHERE 
    pl_password_site IS NOT NULL 
    AND pl_password_site NOT LIKE '$2a$%' 
    AND pl_password_site NOT LIKE '$2b$%';

UPDATE player
SET 
    pl_password_game = crypt(pl_password_game, gen_salt('bf'))
WHERE 
    pl_password_game IS NOT NULL 
    AND pl_password_game NOT LIKE '$2a$%' 
    AND pl_password_game NOT LIKE '$2b$%';
