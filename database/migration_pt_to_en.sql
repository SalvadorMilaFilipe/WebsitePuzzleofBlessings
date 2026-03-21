-- =====================================================================
-- DATABASE MIGRATION: Portuguese -> English
-- Project: PuzzleofBlessings
-- Date: 2026-03-21
-- NOTE: 'session' table stores both site AND game sessions.
--       In PostgreSQL, SESSION is a non-reserved keyword and
--       can be used safely as a table name.
-- IMPORTANT: Run this in the Supabase SQL Editor.
-- Run the entire script at once. It is wrapped in a transaction.
-- =====================================================================

BEGIN;

-- =====================================================================
-- STEP 1: Drop ALL existing Foreign Key constraints
-- (PostgreSQL allows renaming but FKs must be dropped to avoid
--  confusion during table/column renames and re-added cleanly after)
-- =====================================================================

-- --- jogador ---
ALTER TABLE jogador DROP CONSTRAINT IF EXISTS fk_jogador_avatar;
ALTER TABLE jogador DROP CONSTRAINT IF EXISTS fk_jogador_status;
ALTER TABLE jogador DROP CONSTRAINT IF EXISTS fk_jogador_nivel;
ALTER TABLE jogador DROP CONSTRAINT IF EXISTS jogador_jo_status_fkey;
ALTER TABLE jogador DROP CONSTRAINT IF EXISTS jogador_jo_nivelatual_fkey;

-- --- bencao ---
ALTER TABLE bencao DROP CONSTRAINT IF EXISTS fk_bencao_categoria;
ALTER TABLE bencao DROP CONSTRAINT IF EXISTS bencao_be_tipo_fkey;

-- --- bencao_atributos ---
ALTER TABLE bencao_atributos DROP CONSTRAINT IF EXISTS fk_bencao_atributos_be;
ALTER TABLE bencao_atributos DROP CONSTRAINT IF EXISTS fk_bencao_atributos_at;
ALTER TABLE bencao_atributos DROP CONSTRAINT IF EXISTS bencao_atributos_bencao_id_fkey;
ALTER TABLE bencao_atributos DROP CONSTRAINT IF EXISTS bencao_atributos_atributo_id_fkey;

-- --- jogador_bencao ---
ALTER TABLE jogador_bencao DROP CONSTRAINT IF EXISTS fk_jogador_bencao_jo;
ALTER TABLE jogador_bencao DROP CONSTRAINT IF EXISTS fk_jogador_bencao_be;
ALTER TABLE jogador_bencao DROP CONSTRAINT IF EXISTS jogador_bencao_jo_cod_fkey;
ALTER TABLE jogador_bencao DROP CONSTRAINT IF EXISTS jogador_bencao_be_cod_fkey;

-- --- sessao ---
ALTER TABLE sessao DROP CONSTRAINT IF EXISTS fk_sessao_jogador;
ALTER TABLE sessao DROP CONSTRAINT IF EXISTS sessao_se_jogador_fkey;

-- --- jogador_colecionaveis ---
ALTER TABLE jogador_colecionaveis DROP CONSTRAINT IF EXISTS fk_jogador_colecionaveis_jo;
ALTER TABLE jogador_colecionaveis DROP CONSTRAINT IF EXISTS fk_jogador_colecionaveis_co;
ALTER TABLE jogador_colecionaveis DROP CONSTRAINT IF EXISTS jogador_colecionaveis_jo_cod_fkey;
ALTER TABLE jogador_colecionaveis DROP CONSTRAINT IF EXISTS jogador_colecionaveis_co_cod_fkey;

-- --- save ---
ALTER TABLE save DROP CONSTRAINT IF EXISTS save_sa_ni_id_fkey;
ALTER TABLE save DROP CONSTRAINT IF EXISTS fk_save_nivel;

-- =====================================================================
-- STEP 2: Rename Tables
-- (Order: independent tables first, then dependent ones)
-- =====================================================================

-- Independent / lookup tables
-- NOTE: 'status' keeps its name (no rename needed, only columns change below)
ALTER TABLE nivel              RENAME TO level;
ALTER TABLE rariedade          RENAME TO rarity;
ALTER TABLE categorias         RENAME TO category;
ALTER TABLE atributos          RENAME TO attribute;
ALTER TABLE colecionaveis      RENAME TO collectible;
ALTER TABLE label              RENAME TO cointest;

-- Main entity tables
ALTER TABLE jogador            RENAME TO player;
ALTER TABLE bencao             RENAME TO blessing;

-- Junction / dependent tables
ALTER TABLE bencao_atributos   RENAME TO blessing_attribute;
ALTER TABLE sessao             RENAME TO session;
ALTER TABLE jogador_bencao     RENAME TO player_blessing;
ALTER TABLE jogador_colecionaveis RENAME TO player_collectible;

-- save keeps its name (already English)

-- =====================================================================
-- STEP 3: Rename Columns
-- =====================================================================

-- ----- status -----
ALTER TABLE status RENAME COLUMN st_cod          TO st_id;
ALTER TABLE status RENAME COLUMN st_ativonosite  TO st_active_site;
ALTER TABLE status RENAME COLUMN st_cor          TO st_color;
ALTER TABLE status RENAME COLUMN st_ativonojogo  TO st_active_game;
-- st_status stays as st_status

-- ----- level (was nivel) -----
ALTER TABLE level RENAME COLUMN ni_cod       TO lv_id;
ALTER TABLE level RENAME COLUMN ni_nome      TO lv_name;
ALTER TABLE level RENAME COLUMN ni_descricao TO lv_description;
ALTER TABLE level RENAME COLUMN ni_tipo      TO lv_type;

-- ----- rarity (was rariedade) -----
ALTER TABLE rarity RENAME COLUMN ra_id        TO rar_id;
ALTER TABLE rarity RENAME COLUMN ra_nome      TO rar_name;
ALTER TABLE rarity RENAME COLUMN ra_descricao TO rar_description;
ALTER TABLE rarity RENAME COLUMN ra_cardimage TO rar_card_image;

-- ----- category (was categorias) -----
ALTER TABLE category RENAME COLUMN ca_id        TO cat_id;
ALTER TABLE category RENAME COLUMN ca_nome      TO cat_name;
ALTER TABLE category RENAME COLUMN ca_descricao TO cat_description;
ALTER TABLE category RENAME COLUMN ca_imagem    TO cat_image;

-- ----- attribute (was atributos) -----
ALTER TABLE attribute RENAME COLUMN at_cod        TO attr_id;
ALTER TABLE attribute RENAME COLUMN at_designacao TO attr_name;

-- ----- player (was jogador) -----
ALTER TABLE player RENAME COLUMN jo_cod          TO pl_id;
ALTER TABLE player RENAME COLUMN jo_id           TO pl_code;
ALTER TABLE player RENAME COLUMN jo_user         TO pl_username;
ALTER TABLE player RENAME COLUMN jo_email        TO pl_email;
ALTER TABLE player RENAME COLUMN jo_password_site TO pl_password_site;
ALTER TABLE player RENAME COLUMN jo_password_jogo TO pl_password_game;
ALTER TABLE player RENAME COLUMN jo_user_jogo    TO pl_username_game;
ALTER TABLE player RENAME COLUMN jo_descricao    TO pl_description;
ALTER TABLE player RENAME COLUMN jo_anonascimento TO pl_birth_year;
ALTER TABLE player RENAME COLUMN jo_lingua       TO pl_language;
ALTER TABLE player RENAME COLUMN jo_pais         TO pl_country;
ALTER TABLE player RENAME COLUMN jo_status       TO pl_status_id;
ALTER TABLE player RENAME COLUMN jo_nivelatual   TO pl_level_id;
ALTER TABLE player RENAME COLUMN jo_avatar       TO pl_avatar_id;
ALTER TABLE player RENAME COLUMN jo_banner       TO pl_banner;
ALTER TABLE player RENAME COLUMN jo_foto_url     TO pl_photo_url;

-- ----- blessing (was bencao) -----
ALTER TABLE blessing RENAME COLUMN be_cod       TO bl_id;
ALTER TABLE blessing RENAME COLUMN be_nome      TO bl_name;
ALTER TABLE blessing RENAME COLUMN be_imagem    TO bl_image;
ALTER TABLE blessing RENAME COLUMN be_rariedade TO bl_rarity;
ALTER TABLE blessing RENAME COLUMN be_tipo      TO bl_category_id;
ALTER TABLE blessing RENAME COLUMN be_descricao TO bl_description;

-- ----- blessing_attribute (was bencao_atributos) -----
ALTER TABLE blessing_attribute RENAME COLUMN bencao_id     TO bl_id;
ALTER TABLE blessing_attribute RENAME COLUMN atributo_id   TO attr_id;
ALTER TABLE blessing_attribute RENAME COLUMN atributo_valor TO attr_value;

-- ----- session (was sessao) -----
ALTER TABLE session RENAME COLUMN se_cod      TO ss_id;
ALTER TABLE session RENAME COLUMN se_jogador  TO ss_player_id;
ALTER TABLE session RENAME COLUMN se_dataini  TO ss_date_start;
ALTER TABLE session RENAME COLUMN se_horaini  TO ss_time_start;
ALTER TABLE session RENAME COLUMN se_datafim  TO ss_date_end;
ALTER TABLE session RENAME COLUMN se_horafim  TO ss_time_end;
ALTER TABLE session RENAME COLUMN se_tipo     TO ss_type;

-- ----- collectible (was colecionaveis) -----
ALTER TABLE collectible RENAME COLUMN co_cod       TO cl_id;
ALTER TABLE collectible RENAME COLUMN co_nome      TO cl_name;
ALTER TABLE collectible RENAME COLUMN co_descricao TO cl_description;

-- ----- player_collectible (was jogador_colecionaveis) -----
ALTER TABLE player_collectible RENAME COLUMN jo_cod TO pl_id;
ALTER TABLE player_collectible RENAME COLUMN co_cod TO cl_id;

-- ----- player_blessing (was jogador_bencao) -----
ALTER TABLE player_blessing RENAME COLUMN jo_cod         TO pl_id;
ALTER TABLE player_blessing RENAME COLUMN be_cod         TO bl_id;
ALTER TABLE player_blessing RENAME COLUMN data_obtencao  TO date_obtained;

-- ----- cointest (was label) -----
ALTER TABLE cointest RENAME COLUMN nmoedas TO coin_count;

-- ----- save (name kept) -----
ALTER TABLE save RENAME COLUMN sa_id          TO sv_id;
ALTER TABLE save RENAME COLUMN sa_ni_id       TO sv_level_id;
ALTER TABLE save RENAME COLUMN sa_jopos       TO sv_player_pos;
ALTER TABLE save RENAME COLUMN sa_sessao_id   TO sv_session_id;
ALTER TABLE save RENAME COLUMN sa_data_update TO sv_updated_at;

-- =====================================================================
-- STEP 4: Fix type mismatch on save.sv_session_id
-- (was uuid, session.ss_id is int4 — must match for FK)
-- =====================================================================

-- Drop existing data in this column to allow safe type change
-- (if the column has real data you want to keep, skip this and handle manually)
ALTER TABLE save ALTER COLUMN sv_session_id DROP DEFAULT;
ALTER TABLE save ALTER COLUMN sv_session_id TYPE integer USING NULL;

-- =====================================================================
-- STEP 5: Re-create Foreign Key Constraints with new names
-- =====================================================================

-- player -> status
ALTER TABLE player
  ADD CONSTRAINT fk_player_status
  FOREIGN KEY (pl_status_id) REFERENCES status(st_id)
  ON DELETE SET NULL ON UPDATE CASCADE;

-- player -> level
ALTER TABLE player
  ADD CONSTRAINT fk_player_level
  FOREIGN KEY (pl_level_id) REFERENCES level(lv_id)
  ON DELETE SET NULL ON UPDATE CASCADE;

-- blessing -> category
ALTER TABLE blessing
  ADD CONSTRAINT fk_blessing_category
  FOREIGN KEY (bl_category_id) REFERENCES category(cat_id)
  ON DELETE SET NULL ON UPDATE CASCADE;

-- blessing_attribute -> blessing
ALTER TABLE blessing_attribute
  ADD CONSTRAINT fk_blessing_attr_blessing
  FOREIGN KEY (bl_id) REFERENCES blessing(bl_id)
  ON DELETE CASCADE ON UPDATE CASCADE;

-- blessing_attribute -> attribute
ALTER TABLE blessing_attribute
  ADD CONSTRAINT fk_blessing_attr_attribute
  FOREIGN KEY (attr_id) REFERENCES attribute(attr_id)
  ON DELETE CASCADE ON UPDATE CASCADE;

-- session -> player
ALTER TABLE session
  ADD CONSTRAINT fk_session_player
  FOREIGN KEY (ss_player_id) REFERENCES player(pl_id)
  ON DELETE CASCADE ON UPDATE CASCADE;

-- player_blessing -> player
ALTER TABLE player_blessing
  ADD CONSTRAINT fk_player_blessing_player
  FOREIGN KEY (pl_id) REFERENCES player(pl_id)
  ON DELETE CASCADE ON UPDATE CASCADE;

-- player_blessing -> blessing
ALTER TABLE player_blessing
  ADD CONSTRAINT fk_player_blessing_blessing
  FOREIGN KEY (bl_id) REFERENCES blessing(bl_id)
  ON DELETE CASCADE ON UPDATE CASCADE;

-- player_collectible -> player
ALTER TABLE player_collectible
  ADD CONSTRAINT fk_player_collectible_player
  FOREIGN KEY (pl_id) REFERENCES player(pl_id)
  ON DELETE CASCADE ON UPDATE CASCADE;

-- player_collectible -> collectible
ALTER TABLE player_collectible
  ADD CONSTRAINT fk_player_collectible_collectible
  FOREIGN KEY (cl_id) REFERENCES collectible(cl_id)
  ON DELETE CASCADE ON UPDATE CASCADE;

-- save -> level
ALTER TABLE save
  ADD CONSTRAINT fk_save_level
  FOREIGN KEY (sv_level_id) REFERENCES level(lv_id)
  ON DELETE SET NULL ON UPDATE CASCADE;

-- save -> session
ALTER TABLE save
  ADD CONSTRAINT fk_save_session
  FOREIGN KEY (sv_session_id) REFERENCES session(ss_id)
  ON DELETE SET NULL ON UPDATE CASCADE;

-- =====================================================================
-- DONE
-- =====================================================================

COMMIT;
