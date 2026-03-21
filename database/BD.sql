-- BD.sql (MySQL/phpMyAdmin) - Updated on 2026-03-21
-- Includes profile fields and unique player ID
-- Translated all blessing-related tables and columns to English

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `blessing_attributes`;
DROP TABLE IF EXISTS `player_blessings`;
DROP TABLE IF EXISTS `jogador_itens`;
DROP TABLE IF EXISTS `jogador_colecionaveis`;
DROP TABLE IF EXISTS `sessao`;
DROP TABLE IF EXISTS `colecionaveis`;
DROP TABLE IF EXISTS `itens`;
DROP TABLE IF EXISTS `attributes`;
DROP TABLE IF EXISTS `blessings`;
DROP TABLE IF EXISTS `categories`;
DROP TABLE IF EXISTS `jogador`;
DROP TABLE IF EXISTS `avatar`;
DROP TABLE IF EXISTS `label`;

-- =========================
-- TABLE: Avatar
-- =========================
CREATE TABLE `avatar` (
  `av_cod` INT NOT NULL AUTO_INCREMENT,
  `av_img` TEXT NULL,
  PRIMARY KEY (`av_cod`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================
-- TABLE: Jogador (Player)
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
  `jo_lingua` VARCHAR(20) DEFAULT 'en',
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
-- TABLE: Sessao (Session)
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
-- TABLE: Categories
-- =========================
CREATE TABLE `categories` (
  `cat_id` INT NOT NULL AUTO_INCREMENT,
  `cat_name` VARCHAR(100) NOT NULL UNIQUE,
  `cat_description` TEXT NULL,
  `cat_image` TEXT NULL,
  PRIMARY KEY (`cat_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================
-- TABLE: Blessings
-- =========================
CREATE TABLE `blessings` (
  `bl_id` INT NOT NULL AUTO_INCREMENT,
  `bl_name` VARCHAR(100) NOT NULL,
  `bl_image` TEXT NULL,
  `bl_rarity` VARCHAR(50) NULL,
  `bl_category_id` INT NULL,
  `bl_description` TEXT NULL,
  PRIMARY KEY (`bl_id`),
  CONSTRAINT `fk_blessing_category` FOREIGN KEY (`bl_category_id`) REFERENCES `categories` (`cat_id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================
-- TABLE: Attributes
-- =========================
CREATE TABLE `attributes` (
  `attr_id` INT NOT NULL AUTO_INCREMENT,
  `attr_name` VARCHAR(100) NOT NULL,
  PRIMARY KEY (`attr_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================
-- TABLE: Itens
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
-- TABLE: Colecionaveis
-- =========================
CREATE TABLE `colecionaveis` (
  `co_cod` INT NOT NULL AUTO_INCREMENT,
  `co_nome` VARCHAR(100) NOT NULL,
  `co_descricao` TEXT NULL,
  `co_imagem` TEXT NULL,
  PRIMARY KEY (`co_cod`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================
-- TABLE: Label
-- =========================
CREATE TABLE `label` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `nmoedas` INT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================
-- TABLE: Jogador_Colecionaveis
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
-- TABLE: Jogador_Itens
-- =========================
CREATE TABLE `jogador_itens` (
  `jo_cod` INT NOT NULL,
  `it_cod` INT NOT NULL,
  `date_obtained` DATE NOT NULL DEFAULT (CURRENT_DATE),
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
-- TABLE: Player_Blessings
-- =========================
CREATE TABLE `player_blessings` (
  `jo_cod` INT NOT NULL,
  `bl_id` INT NOT NULL,
  `date_obtained` DATE NOT NULL DEFAULT (CURRENT_DATE),
  PRIMARY KEY (`jo_cod`, `bl_id`),
  KEY `idx_player_blessings_bl` (`bl_id`),
  CONSTRAINT `fk_player_blessings_jo` FOREIGN KEY (`jo_cod`) REFERENCES `jogador` (`jo_cod`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_player_blessings_bl` FOREIGN KEY (`bl_id`) REFERENCES `blessings` (`bl_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================
-- TABLE: Blessing_Attributes
-- =========================
CREATE TABLE `blessing_attributes` (
  `bl_id` INT NOT NULL,
  `jo_cod` INT NOT NULL,
  `attr_id` INT NOT NULL,
  `attribute_value` DECIMAL(10,2) NULL,
  PRIMARY KEY (`bl_id`, `jo_cod`, `attr_id`),
  KEY `idx_blessing_attributes_jo` (`jo_cod`),
  KEY `idx_blessing_attributes_attr` (`attr_id`),
  CONSTRAINT `fk_blessing_attributes_bl` FOREIGN KEY (`bl_id`) REFERENCES `blessings` (`bl_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_blessing_attributes_jo` FOREIGN KEY (`jo_cod`) REFERENCES `jogador` (`jo_cod`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_blessing_attributes_attr` FOREIGN KEY (`attr_id`) REFERENCES `attributes` (`attr_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
