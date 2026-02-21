import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://dwsrfrpguyvpyctdfqid.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR3c3JmcnBndXl2cHljdGRmcWlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk2NzcyOTAsImV4cCI6MjA3NTI1MzI5MH0.p3Fsa-4e-SSN53JBeTA-hA12Z1Bybc09AoFqExNgYs0'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
