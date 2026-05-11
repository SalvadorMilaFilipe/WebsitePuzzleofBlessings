import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://dwsrfrpguyvpyctdfqid.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR3c3JmcnBndXl2cHljdGRmcWlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk2NzcyOTAsImV4cCI6MjA3NTI1MzI5MH0.p3Fsa-4e-SSN53JBeTA-hA12Z1Bybc09AoFqExNgYs0'
const supabase = createClient(supabaseUrl, supabaseKey)

async function simplifyStatus() {
    console.log('Simplifying status labels in database (table: status)...')
    
    // Update ID 1 to "offline"
    const { error: e1 } = await supabase
        .from('status')
        .update({ st_status: 'offline', st_color: '#6B7280' })
        .eq('st_id', 1)

    // Update ID 2 to "online"
    const { error: e2 } = await supabase
        .from('status')
        .update({ st_status: 'online', st_color: '#10B981' })
        .eq('st_id', 2)

    // Update ID 3 to "online"
    const { error: e3 } = await supabase
        .from('status')
        .update({ st_status: 'online', st_color: '#10B981' })
        .eq('st_id', 3)

    if (e1 || e2 || e3) {
        console.error('Error updating status labels:', e1 || e2 || e3)
    } else {
        console.log('Successfully simplified all status labels to "online" or "offline" in table "status".')
    }
}

simplifyStatus()
