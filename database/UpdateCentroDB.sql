-- =====================================================================
-- 1. RENAMING ATTRIBUTES
-- sequential jump (mudei de double jump para sequential jump)
-- =====================================================================
UPDATE attribute 
SET attr_name = 'Double Jump' 
WHERE attr_name = 'Pulo Duplo' OR attr_name = 'Double Jump';

-- Rename the blessing itself
UPDATE blessing 
SET bl_name = 'Sequential Jump' 
WHERE bl_name = 'Double Jump' OR bl_name = 'Pulo Duplo';

-- =====================================================================
-- 2. CREATE CURRENCY TABLE
-- =====================================================================
CREATE TABLE IF NOT EXISTS currency (
  id           INT NOT NULL AUTO_INCREMENT,
  pl_id        INT NOT NULL,
  amount       BIGINT DEFAULT 0,
  max_per_lv   INT DEFAULT 5, -- Number of pieces available in the level
  collected_lv INT DEFAULT 0, -- Number of pieces already collected in the level
  PRIMARY KEY (id),
  CONSTRAINT fk_currency_player FOREIGN KEY (pl_id)
    REFERENCES player(pl_id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- =====================================================================
-- 3. UPDATING BLESSING_ATTRIBUTE
-- Mapping each blessing to its attribute (attr_value removed as per request)
-- =====================================================================
-- First, ensure the mapping table matches the new request (no attr_value)
-- Assuming the table already exists, we'll just populate it.

-- Example population (Adjust based on actual bl_id and attr_id)
-- INSERT INTO blessing_attribute (bl_id, attr_id) VALUES (1, 1);

-- =====================================================================
-- 4. PURCHASE PROCEDURE / TRIGGER
-- Updates player_blessing with current date (dd, mm, yyyy format)
-- =====================================================================
-- Note: Supabase/PostgreSQL usually handles this with DEFAULT CURRENT_DATE, 
-- but we can ensure it follows the format if needed.

/*
-- To be used in the site:
INSERT INTO player_blessing (pl_id, bl_id, date_obtained)
VALUES (player_id, blessing_id, CURRENT_DATE);
*/
