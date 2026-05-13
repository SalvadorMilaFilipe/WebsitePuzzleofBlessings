-- =====================================================================
-- FIX 1: RLS policies for the 'session' table
-- Run this in the Supabase SQL Editor
-- =====================================================================

-- Enable RLS (if not already)
ALTER TABLE session ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to INSERT their own sessions
DROP POLICY IF EXISTS "Allow authenticated insert on session" ON session;
CREATE POLICY "Allow authenticated insert on session" ON session
FOR INSERT TO authenticated
WITH CHECK (true);

-- Allow authenticated users to UPDATE their own sessions
DROP POLICY IF EXISTS "Allow authenticated update on session" ON session;
CREATE POLICY "Allow authenticated update on session" ON session
FOR UPDATE TO authenticated
USING (
  ss_player_id IN (
    SELECT pl_id FROM player WHERE pl_email = auth.email()
  )
);

-- Allow authenticated users to SELECT their own sessions
DROP POLICY IF EXISTS "Allow authenticated select on session" ON session;
CREATE POLICY "Allow authenticated select on session" ON session
FOR SELECT TO authenticated
USING (
  ss_player_id IN (
    SELECT pl_id FROM player WHERE pl_email = auth.email()
  )
);


-- =====================================================================
-- FIX 2: Check which emails exist in Supabase Auth vs player table
-- This helps identify users who can't log in
-- =====================================================================
SELECT 
  p.pl_email,
  p.pl_username,
  p.pl_password_site,
  au.email AS auth_email,
  CASE WHEN au.email IS NULL THEN 'MISSING FROM AUTH' ELSE 'OK' END AS auth_status
FROM player p
LEFT JOIN auth.users au ON lower(p.pl_email) = lower(au.email)
ORDER BY auth_status DESC;
