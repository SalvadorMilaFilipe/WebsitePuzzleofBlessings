-- =====================================================================
-- 1. UPDATE ALL BLESSING NAMES AND IMAGES (PT -> EN)
-- =====================================================================

-- Sequential Jump (was Salto Duplo)
UPDATE blessing 
SET bl_name = 'Sequential Jump', bl_image = 'Sequential Jump.png'
WHERE bl_name = 'Salto Duplo' OR bl_id = 7;

-- Object Levitation
UPDATE blessing 
SET bl_name = 'Object Levitation', bl_image = 'Object Levitation.png'
WHERE bl_name = 'Levitação de Objeto' OR bl_id = 1;

-- Duplication
UPDATE blessing 
SET bl_name = 'Duplication', bl_image = 'Duplication.png'
WHERE bl_name = 'Duplicação' OR bl_id = 2;

-- Pattern Lens
UPDATE blessing 
SET bl_name = 'Pattern Lens', bl_image = 'Pattern Lens.png'
WHERE bl_name = 'Lente de Padrões' OR bl_id = 3;

-- Ephemeral Point
UPDATE blessing 
SET bl_name = 'Ephemeral Point', bl_image = 'Ephemeral Point.png'
WHERE bl_name = 'Ponto Efêmera' OR bl_id = 4;

-- Clarifier
UPDATE blessing 
SET bl_name = 'Clarifier', bl_image = 'Clarifier.png'
WHERE bl_name = 'Clarificador' OR bl_id = 5;

-- Rhythm Sensor
UPDATE blessing 
SET bl_name = 'Rhythm Sensor', bl_image = 'Rhythm Sensor.png'
WHERE bl_name = 'Sensor de Ritmo' OR bl_id = 6;

-- Magnetic Mold
UPDATE blessing 
SET bl_name = 'Magnetic Mold', bl_image = 'Magnetic Mold.png'
WHERE bl_name = 'Molde Magnético' OR bl_id = 8;

-- =====================================================================
-- 2. POPULATE ATTRIBUTE TABLE (With conflict handling)
-- Each blessing gets a unique attribute name
-- =====================================================================
-- Clean old attributes linked as primary attributes
DELETE FROM attribute WHERE attr_name IN (
  'Levitation Height', 'Copy Duration', 'Pattern Clarity', 
  'Platform Stability', 'Puzzle Insight', 'Rhythm Sync', 
  'Double Jump', 'Magnetic Attraction'
);

INSERT INTO attribute (attr_name) VALUES 
('Object Levitation: Lift and suspend objects at a distance'),
('Duplication: Create a temporary physical copy of an object'),
('Pattern Lens: Reveals hidden sequences and paths for 3s'),
('Ephemeral Point: Generates a stable temporary platform for 10s'),
('Clarifier: Simplifies complex puzzles by highlighting key pieces'),
('Rhythm Sensor: Converts auditory puzzle cues into visual indicators'),
('Double Jump: Grants the player +1 Jump whilst in the air'),
('Magnetic Mold: Forcefully attracts and aligns metal pieces');

-- =====================================================================
-- 3. POPULATE BLESSING_ATTRIBUTE (Linking bl_id to attr_id via subqueries)
-- This approach is much more robust against varying auto-increment IDs.
-- =====================================================================
ALTER TABLE blessing_attribute REPLICA IDENTITY FULL;
DELETE FROM blessing_attribute;

-- Object Levitation
INSERT INTO blessing_attribute (bl_id, attr_id) 
SELECT 1, attr_id FROM attribute WHERE attr_name LIKE 'Object Levitation%';

-- Duplication
INSERT INTO blessing_attribute (bl_id, attr_id) 
SELECT 2, attr_id FROM attribute WHERE attr_name LIKE 'Duplication%';

-- Pattern Lens
INSERT INTO blessing_attribute (bl_id, attr_id) 
SELECT 3, attr_id FROM attribute WHERE attr_name LIKE 'Pattern Lens%';

-- Ephemeral Point
INSERT INTO blessing_attribute (bl_id, attr_id) 
SELECT 4, attr_id FROM attribute WHERE attr_name LIKE 'Ephemeral Point%';

-- Clarifier
INSERT INTO blessing_attribute (bl_id, attr_id) 
SELECT 5, attr_id FROM attribute WHERE attr_name LIKE 'Clarifier%';

-- Rhythm Sensor
INSERT INTO blessing_attribute (bl_id, attr_id) 
SELECT 6, attr_id FROM attribute WHERE attr_name LIKE 'Rhythm Sensor%';

-- Sequential Jump (assuming bl_id 7)
INSERT INTO blessing_attribute (bl_id, attr_id) 
SELECT 7, attr_id FROM attribute WHERE attr_name LIKE 'Double Jump%';

-- Magnetic Mold
INSERT INTO blessing_attribute (bl_id, attr_id) 
SELECT 8, attr_id FROM attribute WHERE attr_name LIKE 'Magnetic Mold%';
