-- Comandos para o Editor de SQL do Supabase (PostgreSQL)

-- 1. Renomear a coluna jo_nome para jo_user_jogo
ALTER TABLE jogador RENAME COLUMN jo_nome TO jo_user_jogo;

-- 2. Adicionar as novas colunas para passwords
ALTER TABLE jogador ADD COLUMN jo_password_site VARCHAR(255);
ALTER TABLE jogador ADD COLUMN jo_password_jogo VARCHAR(255);
