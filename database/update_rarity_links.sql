-- update_rarity_links.sql
-- 1. Ensure standard rarities exist (adjust descriptions/images as needed in Supabase UI later)
INSERT INTO rarity (rar_name, rar_description)
SELECT 'Common', 'Standard blessings found throughout the islands.'
WHERE NOT EXISTS (SELECT 1 FROM rarity WHERE rar_name = 'Common');

INSERT INTO rarity (rar_name, rar_description)
SELECT 'Uncommon', 'Slightly more powerful blessings with a distinct green aura.'
WHERE NOT EXISTS (SELECT 1 FROM rarity WHERE rar_name = 'Uncommon');

INSERT INTO rarity (rar_name, rar_description)
SELECT 'Rare', 'Potent blessings that are hard to come by.'
WHERE NOT EXISTS (SELECT 1 FROM rarity WHERE rar_name = 'Rare');

INSERT INTO rarity (rar_name, rar_description)
SELECT 'Epic', 'Exceptional power granted only to the persistent.'
WHERE NOT EXISTS (SELECT 1 FROM rarity WHERE rar_name = 'Epic');

INSERT INTO rarity (rar_name, rar_description)
SELECT 'Legendary', 'God-like power that reshapes the islands.'
WHERE NOT EXISTS (SELECT 1 FROM rarity WHERE rar_name = 'Legendary');

-- 2. Add the foreign key column to blessing
ALTER TABLE blessing ADD COLUMN bl_rarity_id INT;

-- 3. Map string names to rarity IDs
UPDATE blessing b
SET bl_rarity_id = r.rar_id
FROM rarity r
WHERE LOWER(b.bl_rarity) = LOWER(r.rar_name);

-- 4. Drop the old string column
ALTER TABLE blessing DROP COLUMN bl_rarity;

-- 5. Add Foreign Key Constraint
ALTER TABLE blessing 
ADD CONSTRAINT fk_blessing_rarity FOREIGN KEY (bl_rarity_id) 
REFERENCES rarity(rar_id) ON DELETE SET NULL ON UPDATE CASCADE;
