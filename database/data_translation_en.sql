-- =====================================================================
-- DATA TRANSLATION: Portuguese -> English
-- Project: PuzzleofBlessings
-- Date: 2026-03-21
-- Run this in the Supabase SQL Editor.
-- This script updates the CONTENT of the tables to English.
-- =====================================================================

BEGIN;

-- ---------------------------------------------------------------------
-- Table: status
-- ---------------------------------------------------------------------
UPDATE status SET st_status = 'offline'         WHERE st_id = 1;
UPDATE status SET st_status = 'online (in game)' WHERE st_id = 2;
UPDATE status SET st_status = 'online (on site)' WHERE st_id = 3;
UPDATE status SET st_status = 'online'          WHERE st_id = 4;

-- ---------------------------------------------------------------------
-- Table: level
-- ---------------------------------------------------------------------
UPDATE level SET lv_name = 'Tutorial', lv_description = 'Learning basic commands' WHERE lv_id = 0;
UPDATE level SET lv_name = 'Level 1',  lv_description = 'The Beginning of the Journey' WHERE lv_id = 1;
UPDATE level SET lv_name = 'Level 2',  lv_description = 'Deep Exploration' WHERE lv_id = 2;
UPDATE level SET lv_name = 'Level 3',  lv_description = 'Challenge of the Shadows' WHERE lv_id = 3;
UPDATE level SET lv_name = 'Level 4',  lv_description = 'Lost Path' WHERE lv_id = 4;
UPDATE level SET lv_name = 'Level 5',  lv_description = 'Final Confrontation' WHERE lv_id = 5;

-- ---------------------------------------------------------------------
-- Table: rarity
-- ---------------------------------------------------------------------
UPDATE rarity SET rar_name = 'Common',    rar_description = 'Frequent and basic blessings.' WHERE rar_id = 1;
UPDATE rarity SET rar_name = 'Uncommon',  rar_description = 'Blessings with useful situational effects.' WHERE rar_id = 2;
UPDATE rarity SET rar_name = 'Rare',      rar_description = 'Powerful blessings that require mastery.' WHERE rar_id = 3;
UPDATE rarity SET rar_name = 'Epic',      rar_description = 'Abilities that change the course of the challenge.' WHERE rar_id = 4;
UPDATE rarity SET rar_name = 'Legendary', rar_description = 'Unique blessings of immeasurable power.' WHERE rar_id = 5;

-- ---------------------------------------------------------------------
-- Table: category
-- ---------------------------------------------------------------------
UPDATE category SET cat_name = 'Info/Scanning',         cat_description = 'Blessings that reveal hidden elements.' WHERE cat_id = 1;
UPDATE category SET cat_name = 'Physical Manipulation', cat_description = 'Interaction and alteration of physical objects.' WHERE cat_id = 2;
UPDATE category SET cat_name = 'Matter Creation',      cat_description = 'Creation of platforms or temporary objects.' WHERE cat_id = 3;
UPDATE category SET cat_name = 'Help Passives',        cat_description = 'Permanent passive abilities.' WHERE cat_id = 4;

-- ---------------------------------------------------------------------
-- Table: blessing
-- ---------------------------------------------------------------------
UPDATE blessing SET bl_name = 'Object Levitation', bl_description = 'Allows suspending an object in the air.', bl_rarity = 'Common' WHERE bl_id = 1;
UPDATE blessing SET bl_name = 'Duplication',      bl_description = 'Creates a temporary copy of a non-vital object.', bl_rarity = 'Uncommon' WHERE bl_id = 2;
UPDATE blessing SET bl_name = 'Pattern Lens',     bl_description = 'Reveals the correct sequence for 3s.', bl_rarity = 'Rare' WHERE bl_id = 3;
UPDATE blessing SET bl_name = 'Ephemeral Point',  bl_description = 'Generates a platform for 10s.', bl_rarity = 'Uncommon' WHERE bl_id = 4;
UPDATE blessing SET bl_name = 'Clarifier',        bl_description = 'Visually simplifies a complex puzzle.', bl_rarity = 'Epic' WHERE bl_id = 5;
UPDATE blessing SET bl_name = 'Rhythm Sensor',    bl_description = 'Transforms sound clues into visual indicators.', bl_rarity = 'Rare' WHERE bl_id = 6;
UPDATE blessing SET bl_name = 'Double Jump',      bl_description = 'Allows the player to get a double jump.', bl_rarity = 'Common' WHERE bl_id = 7;
UPDATE blessing SET bl_name = 'Magnetic Mold',    bl_description = 'Attracts metal pieces to position with fine adjustment.', bl_rarity = 'Uncommon' WHERE bl_id = 8;

COMMIT;
