-- BD.sql — Updated schema: 2026-03-21
-- Full English translation of all table and column names
-- Based on live Supabase migration (migration_pt_to_en.sql)

-- =====================================================================
-- TABLE: status
-- (name unchanged, columns renamed)
-- =====================================================================
CREATE TABLE status (
  st_id          INT NOT NULL AUTO_INCREMENT,
  st_status      VARCHAR(50),
  st_active_site BOOLEAN,
  st_color       CHAR(7),
  st_active_game BOOLEAN,
  PRIMARY KEY (st_id)
);

-- =====================================================================
-- TABLE: level (was: nivel)
-- =====================================================================
CREATE TABLE level (
  lv_id          INT NOT NULL AUTO_INCREMENT,
  lv_name        VARCHAR(100),
  lv_description TEXT,
  lv_type        VARCHAR(50),
  PRIMARY KEY (lv_id)
);

-- =====================================================================
-- TABLE: rarity (was: rariedade)
-- =====================================================================
CREATE TABLE rarity (
  rar_id          INT NOT NULL AUTO_INCREMENT,
  rar_name        VARCHAR(100),
  rar_description TEXT,
  rar_card_image  TEXT,
  PRIMARY KEY (rar_id)
);

-- =====================================================================
-- TABLE: category (was: categorias)
-- =====================================================================
CREATE TABLE category (
  cat_id          INT NOT NULL AUTO_INCREMENT,
  cat_name        VARCHAR(100) NOT NULL UNIQUE,
  cat_description TEXT,
  cat_image       TEXT,
  PRIMARY KEY (cat_id)
);

-- =====================================================================
-- TABLE: attribute (was: atributos)
-- =====================================================================
CREATE TABLE attribute (
  attr_id   INT NOT NULL AUTO_INCREMENT,
  attr_name VARCHAR(100) NOT NULL,
  PRIMARY KEY (attr_id)
);

-- =====================================================================
-- TABLE: collectible (was: colecionaveis)
-- =====================================================================
CREATE TABLE collectible (
  cl_id          INT NOT NULL AUTO_INCREMENT,
  cl_name        VARCHAR(100) NOT NULL,
  cl_description TEXT,
  PRIMARY KEY (cl_id)
);

-- =====================================================================
-- TABLE: cointest (was: label)
-- =====================================================================
CREATE TABLE cointest (
  id         INT NOT NULL AUTO_INCREMENT,
  coin_count BIGINT,
  PRIMARY KEY (id)
);

-- =====================================================================
-- TABLE: player (was: jogador)
-- =====================================================================
CREATE TABLE player (
  pl_id            INT NOT NULL AUTO_INCREMENT,
  pl_code          VARCHAR(9) NOT NULL,           -- #XXXXXXXX friend code
  pl_username      VARCHAR(50) NOT NULL UNIQUE,
  pl_email         VARCHAR(100) NOT NULL UNIQUE,
  pl_password_site VARCHAR(255),
  pl_password_game VARCHAR(255),
  pl_username_game VARCHAR(100),
  pl_description   TEXT,
  pl_birth_year    BIGINT,
  pl_language      VARCHAR(20) DEFAULT 'en',
  pl_country       VARCHAR(50),
  pl_status_id     INT,
  pl_level_id      INT,
  pl_avatar_id     INT,
  pl_banner        TEXT,
  pl_photo_url     TEXT,
  PRIMARY KEY (pl_id),
  UNIQUE KEY uq_player_code (pl_code),
  CONSTRAINT fk_player_status FOREIGN KEY (pl_status_id)
    REFERENCES status(st_id) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_player_level FOREIGN KEY (pl_level_id)
    REFERENCES level(lv_id) ON DELETE SET NULL ON UPDATE CASCADE
);

-- =====================================================================
-- TABLE: blessing (was: bencao)
-- =====================================================================
CREATE TABLE blessing (
  bl_id          INT NOT NULL AUTO_INCREMENT,
  bl_name        VARCHAR(100) NOT NULL,
  bl_image       TEXT,
  bl_rarity      VARCHAR(50),
  bl_category_id INT,
  bl_description TEXT,
  PRIMARY KEY (bl_id),
  CONSTRAINT fk_blessing_category FOREIGN KEY (bl_category_id)
    REFERENCES category(cat_id) ON DELETE SET NULL ON UPDATE CASCADE
);

-- =====================================================================
-- TABLE: blessing_attribute (was: bencao_atributos)
-- =====================================================================
CREATE TABLE blessing_attribute (
  bl_id      INT NOT NULL,
  attr_id    INT NOT NULL,
  attr_value TEXT,
  PRIMARY KEY (bl_id, attr_id),
  CONSTRAINT fk_blessing_attr_blessing FOREIGN KEY (bl_id)
    REFERENCES blessing(bl_id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_blessing_attr_attribute FOREIGN KEY (attr_id)
    REFERENCES attribute(attr_id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- =====================================================================
-- TABLE: session (was: sessao)
-- Stores both site and game sessions
-- =====================================================================
CREATE TABLE session (
  ss_id         INT NOT NULL AUTO_INCREMENT,
  ss_player_id  INT NOT NULL,
  ss_date_start DATE NOT NULL,
  ss_time_start TIME NOT NULL,
  ss_date_end   DATE,
  ss_time_end   TIME,
  ss_type       VARCHAR(20),  -- 'site' | 'game'
  PRIMARY KEY (ss_id),
  CONSTRAINT fk_session_player FOREIGN KEY (ss_player_id)
    REFERENCES player(pl_id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- =====================================================================
-- TABLE: save (name unchanged)
-- =====================================================================
CREATE TABLE save (
  sv_id         INT NOT NULL AUTO_INCREMENT,
  sv_level_id   INT,
  sv_player_pos TEXT,
  sv_session_id INT,
  sv_updated_at TIMESTAMP WITH TIME ZONE,
  PRIMARY KEY (sv_id),
  CONSTRAINT fk_save_level FOREIGN KEY (sv_level_id)
    REFERENCES level(lv_id) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_save_session FOREIGN KEY (sv_session_id)
    REFERENCES session(ss_id) ON DELETE SET NULL ON UPDATE CASCADE
);

-- =====================================================================
-- TABLE: player_blessing (was: jogador_bencao)
-- =====================================================================
CREATE TABLE player_blessing (
  pl_id         INT NOT NULL,
  bl_id         INT NOT NULL,
  date_obtained DATE NOT NULL DEFAULT (CURRENT_DATE),
  PRIMARY KEY (pl_id, bl_id),
  CONSTRAINT fk_player_blessing_player FOREIGN KEY (pl_id)
    REFERENCES player(pl_id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_player_blessing_blessing FOREIGN KEY (bl_id)
    REFERENCES blessing(bl_id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- =====================================================================
-- TABLE: player_collectible (was: jogador_colecionaveis)
-- =====================================================================
CREATE TABLE player_collectible (
  pl_id INT NOT NULL,
  cl_id INT NOT NULL,
  PRIMARY KEY (pl_id, cl_id),
  CONSTRAINT fk_player_collectible_player FOREIGN KEY (pl_id)
    REFERENCES player(pl_id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_player_collectible_collectible FOREIGN KEY (cl_id)
    REFERENCES collectible(cl_id) ON DELETE CASCADE ON UPDATE CASCADE
);
