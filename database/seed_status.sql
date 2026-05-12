-- Run this in the Supabase SQL Editor (Dashboard)
-- Populates the status table with the correct values

INSERT INTO status (st_id, st_status, st_active_site, st_color, st_active_game)
VALUES
  (1, 'offline',  false, '#6B7280', false),
  (2, 'inactive', false, '#F59E0B', true),
  (3, 'online',   true,  '#10B981', true)
ON CONFLICT (st_id) DO UPDATE
SET
  st_status      = EXCLUDED.st_status,
  st_active_site = EXCLUDED.st_active_site,
  st_color       = EXCLUDED.st_color,
  st_active_game = EXCLUDED.st_active_game;
