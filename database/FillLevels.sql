-- =====================================================================
-- POPULATE LEVEL TABLE (PT -> EN)
-- Keeps original IDs 0 to 3
-- =====================================================================

BEGIN;

-- 1. Ensure the levels 0 to 3 are populated with English translations
-- ID 0: Tutorial
INSERT INTO level (lv_id, lv_name, lv_description, lv_type)
VALUES (0, 'Tutorial', 'Learning basic commands and mechanics.', 'campanha')
ON CONFLICT (lv_id) DO UPDATE SET
  lv_name = EXCLUDED.lv_name,
  lv_description = EXCLUDED.lv_description,
  lv_type = EXCLUDED.lv_type;

-- ID 1: Genesis Field
INSERT INTO level (lv_id, lv_name, lv_description, lv_type)
VALUES (1, 'Genesis Field', 'The beginning of your journey in the vast plains of light.', 'campanha')
ON CONFLICT (lv_id) DO UPDATE SET
  lv_name = EXCLUDED.lv_name,
  lv_description = EXCLUDED.lv_description,
  lv_type = EXCLUDED.lv_type;

-- ID 2: Deep Exploration
INSERT INTO level (lv_id, lv_name, lv_description, lv_type)
VALUES (2, 'Deep Exploration', 'Venture into the resonant crystal formations and hidden caves.', 'campanha')
ON CONFLICT (lv_id) DO UPDATE SET
  lv_name = EXCLUDED.lv_name,
  lv_description = EXCLUDED.lv_description,
  lv_type = EXCLUDED.lv_type;

-- ID 3: Shadow Realm
INSERT INTO level (lv_id, lv_name, lv_description, lv_type)
VALUES (3, 'Shadow Realm', 'The final trial against the encroaching darkness and shadow puzzles.', 'campanha')
ON CONFLICT (lv_id) DO UPDATE SET
  lv_name = EXCLUDED.lv_name,
  lv_description = EXCLUDED.lv_description,
  lv_type = EXCLUDED.lv_type;

-- 2. Delete any levels above ID 3 (as requested to have exactly 4 levels)
DELETE FROM level WHERE lv_id > 3;

COMMIT;
