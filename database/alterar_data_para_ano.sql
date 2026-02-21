-- Passo 1: Alterar o tipo da coluna de DATA para INTEIRO (extraindo o ano se existirem dados)
ALTER TABLE jogador
  ALTER COLUMN jo_datanascimento TYPE INT8 USING EXTRACT(YEAR FROM jo_datanascimento)::INT8;

-- Passo 2: Renomear a coluna para o nome desejado
ALTER TABLE jogador
  RENAME COLUMN jo_datanascimento TO jo_anonascimento;
