
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://dwsrfrpguyvpyctdfqid.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR3c3JmcnBndXl2cHljdGRmcWlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk2NzcyOTAsImV4cCI6MjA3NTI1MzI5MH0.p3Fsa-4e-SSN53JBeTA-hA12Z1Bybc09AoFqExNgYs0'
)

async function seedStatus() {
  const statuses = [
    { st_id: 1, st_status: 'offline', st_active_site: false, st_color: '#6B7280', st_active_game: false },
    { st_id: 2, st_status: 'inactive', st_active_site: false, st_color: '#F59E0B', st_active_game: true },
    { st_id: 3, st_status: 'online', st_active_site: true, st_color: '#10B981', st_active_game: true },
  ]

  const { data, error } = await supabase
    .from('status')
    .upsert(statuses, { onConflict: 'st_id' })
    .select()

  if (error) {
    console.error('Error seeding status:', error)
  } else {
    console.log('Status table seeded successfully:', JSON.stringify(data, null, 2))
  }
}

seedStatus()
