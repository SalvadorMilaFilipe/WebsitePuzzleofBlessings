-- limit_username_length.sql
-- Limits pl_username and pl_username_game to 12 characters

-- Change column types to enforce length at DB level
ALTER TABLE player 
ALTER COLUMN pl_username TYPE VARCHAR(12),
ALTER COLUMN pl_username_game TYPE VARCHAR(12);
