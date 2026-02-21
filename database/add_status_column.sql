-- Adicionar o campo jo_status à tabela jogador
ALTER TABLE jogador ADD COLUMN jo_status VARCHAR(20) DEFAULT 'offline';
