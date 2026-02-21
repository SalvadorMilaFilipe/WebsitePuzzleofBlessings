-- BD.sql (MySQL/phpMyAdmin) - Atualizado em 2026-02-15
-- Inclui campos de perfil e ID único do jogador

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `bencao_atributos`;
DROP TABLE IF EXISTS `jogador_bencao`;
DROP TABLE IF EXISTS `jogador_itens`;
DROP TABLE IF EXISTS `jogador_colecionaveis`;
DROP TABLE IF EXISTS `sessao`;
DROP TABLE IF EXISTS `colecionaveis`;
DROP TABLE IF EXISTS `itens`;
DROP TABLE IF EXISTS `atributos`;
DROP TABLE IF EXISTS `bencao`;
DROP TABLE IF EXISTS `jogador`;
DROP TABLE IF EXISTS `avatar`;
DROP TABLE IF EXISTS `label`;

-- =========================
-- TABELA: Avatar
-- =========================
CREATE TABLE `avatar` (
  `av_cod` INT NOT NULL AUTO_INCREMENT,
  `av_img` TEXT NULL,
  PRIMARY KEY (`av_cod`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================
-- TABELA: Jogador
-- =========================
CREATE TABLE `jogador` (
  `jo_cod` INT NOT NULL AUTO_INCREMENT,
  `jo_id` VARCHAR(9) NOT NULL,
  `jo_user` VARCHAR(50) NOT NULL,
  `jo_email` VARCHAR(100) NOT NULL,
  `jo_password_site` VARCHAR(255) NULL,
  `jo_password_jogo` VARCHAR(255) NULL,
  `jo_user_jogo` VARCHAR(100) NULL,
  `jo_descricao` TEXT NULL,
  `jo_anonascimento` BIGINT NULL,
  `jo_lingua` VARCHAR(20) DEFAULT 'pt',
  `jo_pais` VARCHAR(50) NULL,
  `jo_status` VARCHAR(20) DEFAULT 'offline',
  `jo_avatar` INT NULL,
  `jo_banner` TEXT NULL,
  `jo_foto_url` TEXT NULL,
  PRIMARY KEY (`jo_cod`),
  UNIQUE KEY `uq_jogador_id` (`jo_id`),
  UNIQUE KEY `uq_jogador_user` (`jo_user`),
  UNIQUE KEY `uq_jogador_email` (`jo_email`),
  KEY `idx_jogador_avatar` (`jo_avatar`),
  CONSTRAINT `fk_jogador_avatar` FOREIGN KEY (`jo_avatar`) REFERENCES `avatar` (`av_cod`)
    ON DELETE SET NULL
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================
-- TABELA: Sessao
-- =========================
CREATE TABLE `sessao` (
  `se_cod` INT NOT NULL AUTO_INCREMENT,
  `se_jogador` INT NOT NULL,
  `se_dataini` DATE NOT NULL,
  `se_horaini` TIME NOT NULL,
  `se_datafim` DATE NULL,
  `se_horafim` TIME NULL,
  PRIMARY KEY (`se_cod`),
  KEY `idx_sessao_jogador` (`se_jogador`),
  CONSTRAINT `fk_sessao_jogador` FOREIGN KEY (`se_jogador`) REFERENCES `jogador` (`jo_cod`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================
-- TABELA: Bencao
-- =========================
CREATE TABLE `bencao` (
  `be_cod` INT NOT NULL AUTO_INCREMENT,
  `be_designacao` VARCHAR(100) NOT NULL,
  `be_imagem` TEXT NULL,
  `be_rariedade` VARCHAR(50) NULL,
  `be_tipo` VARCHAR(50) NULL,
  `be_descricao` TEXT NULL,
  PRIMARY KEY (`be_cod`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================
-- TABELA: Atributos
-- =========================
CREATE TABLE `atributos` (
  `at_cod` INT NOT NULL AUTO_INCREMENT,
  `at_designacao` VARCHAR(100) NOT NULL,
  PRIMARY KEY (`at_cod`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================
-- TABELA: Itens
-- =========================
CREATE TABLE `itens` (
  `it_cod` INT NOT NULL AUTO_INCREMENT,
  `it_nome` VARCHAR(100) NOT NULL,
  `it_descricao` TEXT NULL,
  `it_lore` TEXT NULL,
  `it_rariedade` VARCHAR(50) NULL,
  `it_imagem` TEXT NULL,
  PRIMARY KEY (`it_cod`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================
-- TABELA: Colecionaveis
-- =========================
CREATE TABLE `colecionaveis` (
  `co_cod` INT NOT NULL AUTO_INCREMENT,
  `co_nome` VARCHAR(100) NOT NULL,
  `co_descricao` TEXT NULL,
  `co_imagem` TEXT NULL,
  PRIMARY KEY (`co_cod`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================
-- TABELA: Label
-- =========================
CREATE TABLE `label` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `nmoedas` INT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================
-- TABELA: Jogador_Colecionaveis
-- =========================
CREATE TABLE `jogador_colecionaveis` (
  `jo_cod` INT NOT NULL,
  `co_cod` INT NOT NULL,
  PRIMARY KEY (`jo_cod`, `co_cod`),
  KEY `idx_jogador_colecionaveis_co` (`co_cod`),
  CONSTRAINT `fk_jogador_colecionaveis_jo` FOREIGN KEY (`jo_cod`) REFERENCES `jogador` (`jo_cod`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_jogador_colecionaveis_co` FOREIGN KEY (`co_cod`) REFERENCES `colecionaveis` (`co_cod`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================
-- TABELA: Jogador_Itens
-- =========================
CREATE TABLE `jogador_itens` (
  `jo_cod` INT NOT NULL,
  `it_cod` INT NOT NULL,
  `data_obtencao` DATE NOT NULL DEFAULT (CURRENT_DATE),
  PRIMARY KEY (`jo_cod`, `it_cod`),
  KEY `idx_jogador_itens_it` (`it_cod`),
  CONSTRAINT `fk_jogador_itens_jo` FOREIGN KEY (`jo_cod`) REFERENCES `jogador` (`jo_cod`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_jogador_itens_it` FOREIGN KEY (`it_cod`) REFERENCES `itens` (`it_cod`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================
-- TABELA: Jogador_Bencao
-- =========================
CREATE TABLE `jogador_bencao` (
  `jo_cod` INT NOT NULL,
  `be_cod` INT NOT NULL,
  `data_obtencao` DATE NOT NULL DEFAULT (CURRENT_DATE),
  PRIMARY KEY (`jo_cod`, `be_cod`),
  KEY `idx_jogador_bencao_be` (`be_cod`),
  CONSTRAINT `fk_jogador_bencao_jo` FOREIGN KEY (`jo_cod`) REFERENCES `jogador` (`jo_cod`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_jogador_bencao_be` FOREIGN KEY (`be_cod`) REFERENCES `bencao` (`be_cod`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================
-- TABELA: Bencao_Atributos
-- =========================
CREATE TABLE `bencao_atributos` (
  `be_cod` INT NOT NULL,
  `jo_cod` INT NOT NULL,
  `at_cod` INT NOT NULL,
  `atributo_valor` DECIMAL(10,2) NULL,
  PRIMARY KEY (`be_cod`, `jo_cod`, `at_cod`),
  KEY `idx_bencao_atributos_jo` (`jo_cod`),
  KEY `idx_bencao_atributos_at` (`at_cod`),
  CONSTRAINT `fk_bencao_atributos_be` FOREIGN KEY (`be_cod`) REFERENCES `bencao` (`be_cod`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_bencao_atributos_jo` FOREIGN KEY (`jo_cod`) REFERENCES `jogador` (`jo_cod`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_bencao_atributos_at` FOREIGN KEY (`at_cod`) REFERENCES `atributos` (`at_cod`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
