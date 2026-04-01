-- add_level_unlock_columns.sql (2026-04-01)
-- Adding level-based visibility controls (Discoveries/Level-Lock)

-- 1. Update blessing table
ALTER TABLE blessing 
ADD COLUMN bl_lv_id INT;

ALTER TABLE blessing
ADD CONSTRAINT fk_blessing_level FOREIGN KEY (bl_lv_id) 
REFERENCES level(lv_id) ON DELETE SET NULL ON UPDATE CASCADE;

-- 2. Update collectible table
ALTER TABLE collectible 
ADD COLUMN cl_lv_id INT;

ALTER TABLE collectible
ADD CONSTRAINT fk_collectible_level FOREIGN KEY (cl_lv_id) 
REFERENCES level(lv_id) ON DELETE SET NULL ON UPDATE CASCADE;

-- 3. Update category table
ALTER TABLE category 
ADD COLUMN ct_lv_id INT;

ALTER TABLE category
ADD CONSTRAINT fk_category_level FOREIGN KEY (ct_lv_id) 
REFERENCES level(lv_id) ON DELETE SET NULL ON UPDATE CASCADE;

-- 4. Ensure items table follows the same pattern (User already created it)
-- This is just for reference as requested: it_lv_id <-> lv_id
-- If items table wasn't in BD.sql yet:
-- CREATE TABLE items (
--   it_id INT NOT NULL AUTO_INCREMENT,
--   it_name VARCHAR(100),
--   it_lv_id INT,
--   PRIMARY KEY (it_id),
--   CONSTRAINT fk_items_level FOREIGN KEY (it_lv_id) REFERENCES level(lv_id)
-- );
