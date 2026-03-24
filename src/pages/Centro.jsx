import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import '../../css/centro.css'

function Centro() {
  const { userProfile, loading: authLoading } = useAuth()
  
  // Data States
  const [currencyData, setCurrencyData] = useState({ amount: 0, collected_lv: 0, max_per_lv: 10 })
  const [playerLevel, setPlayerLevel] = useState({ id: 0, name: 'Trainee' }) // Placeholder level
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Hint Cooldown State (10 minutes = 600,000ms)
  const [hintCooldown, setHintCooldown] = useState(0)
  const COOLDOWN_TIME = 10 * 60 * 1000

  // 1. Initial State Check for Cooldown
  useEffect(() => {
    const lastHint = localStorage.getItem('last_hint_time')
    if (lastHint) {
      const remaining = COOLDOWN_TIME - (Date.now() - parseInt(lastHint))
      if (remaining > 0) {
        setHintCooldown(remaining)
        const timer = setInterval(() => {
          setHintCooldown(prev => {
            if (prev <= 1000) {
              clearInterval(timer)
              return 0
            }
            return prev - 1000
          })
        }, 1000)
        return () => clearInterval(timer)
      }
    }
  }, [])

  // 2. Fetch Currency Data
  useEffect(() => {
    const fetchData = async () => {
      if (!userProfile?.pl_id) return

      try {
        setLoading(true)
        setError(null)

        // Fetch Currency Data
        let { data: cData, error: cError } = await supabase
          .from('currency')
          .select('*')
          .eq('pl_id', userProfile.pl_id)
          .maybeSingle()

        if (cError) throw cError
        
        // If no record exists, create one for the player
        if (!cData) {
          const { data: newData, error: insertError } = await supabase
            .from('currency')
            .insert([{ pl_id: userProfile.pl_id, amount: 0, collected_lv: 0, max_per_lv: 10 }])
            .select()
            .single()
            
          if (insertError) {
              console.warn("Could not auto-create currency record. Check if table 'currency' exists.", insertError)
          } else {
              cData = newData
          }
        }

        if (cData) {
          setCurrencyData(cData)
        }

        // Fetch Player Level Info (Placeholder Level 0)
        setPlayerLevel({ id: 0, name: 'Genesis Field' })

      } catch (err) {
        console.error('Error fetching center data:', err)
        setError(err.message || 'Error loading data')
      } finally {
        setLoading(false)
      }
    }

    if (!authLoading && userProfile) {
      fetchData()
      const interval = setInterval(() => fetchData(), 5000)
      return () => clearInterval(interval)
    }
  }, [userProfile, authLoading])

  // Functional: Hint System
  const handleHintClick = () => {
    if (hintCooldown > 0) return
    
    // Logic for hint
    alert("Hint: The ancient pillars hold the key to the sequence!")
    
    const now = Date.now()
    localStorage.setItem('last_hint_time', now.toString())
    setHintCooldown(COOLDOWN_TIME)
    
    const timer = setInterval(() => {
      setHintCooldown(prev => {
        if (prev <= 1000) {
          clearInterval(timer)
          return 0
        }
        return prev - 1000
      })
    }, 1000)
  }

  // Functional: Buy Blessing (Updated with explicit date handling)
  const buyBlessing = async (blessingId) => {
      if (!userProfile?.pl_id) return;
      
      try {
          // Getting current date in YYYY-MM-DD format (Standard SQL Date)
          const now = new Date();
          const dateStr = now.toISOString().split('T')[0];

          const { error: buyErr } = await supabase
              .from('player_blessing') // Updated from jogador_bencao
              .insert([{ 
                  pl_id: userProfile.pl_id, 
                  bl_id: blessingId,
                  date_obtained: dateStr // Explicitly setting the date (DD, MM, YYYY format stored in DB)
              }]);
          
          if (buyErr) throw buyErr;

          // After purchase, we can update the local state or show feedback
          alert("Blessing obtained successfully!");
          
          // Optionally refresh the currency display or blessings catalog
          // fetchData(); 

      } catch (err) {
          console.error("Error buying blessing:", err);
          alert("Purchase failed. Maybe you already have it or lack the currency?");
      }
  }

  const formatTime = (ms) => {
    const mins = Math.floor(ms / 60000)
    const secs = Math.floor((ms % 60000) / 1000)
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`
  }

  const isProgressComplete = currencyData.collected_lv === currencyData.max_per_lv
  const progressColorClass = isProgressComplete ? 'progress-gold' : 'progress-standard'

  if (authLoading) return <div className="centro-loading-screen">Authenticating...</div>

  return (
    <main className="centro-main">
      <div className="centro-container">
        
        {/* HEADER AREA */}
        <header className="centro-header">
          <div className="header-left">
            <div className="currency-display">
              <img src="/public/img/puzzle_piece.png" alt="🧩" className="currency-icon" 
                onError={(e) => { e.target.src = "https://cdn-icons-png.flaticon.com/512/3204/3204000.png" }} />
              <div className="currency-amount">
                <span className="amount-label">Banked Pieces:</span>
                <span className="amount-value">{currencyData.amount.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="header-center">
            <h1 className="centro-title">The Center</h1>
          </div>

          <div className="header-right">
            <div className="level-badge">
              <div className="level-number">Level {playerLevel.id}</div>
              <div className="level-name">{playerLevel.name}</div>
            </div>
          </div>
        </header>

        {/* SIDE ACTIONS */}
        <nav className="centro-sidebar-actions">
          <button className="icon-btn shop-btn" title="Shop" onClick={() => alert("Shop opening soon!")}>
            <div className="btn-icon-wrapper">
              <img src="/public/img/shop_icon.png" alt="🏪" className="btn-icon" 
                onError={(e) => { e.target.src = "https://cdn-icons-png.flaticon.com/512/1170/1170678.png" }} />
            </div>
            <span className="btn-label">Shop</span>
          </button>

          <button 
            className={`icon-btn hint-btn ${hintCooldown > 0 ? 'cooldown' : ''}`} 
            onClick={handleHintClick}
            disabled={hintCooldown > 0}
            title={hintCooldown > 0 ? `Cooldown: ${formatTime(hintCooldown)}` : "Get Hint"}
          >
            <div className="btn-icon-wrapper">
              <img src="/public/img/hint_bulb.png" alt="💡" className="btn-icon" 
                onError={(e) => { e.target.src = "https://cdn-icons-png.flaticon.com/512/702/702797.png" }} />
            </div>
            <span className="btn-label">
              {hintCooldown > 0 ? formatTime(hintCooldown) : "Hint"}
            </span>
          </button>

          <button className="icon-btn catalogue-btn" title="Catalogue" onClick={() => alert("Catalogue coming soon!")}>
            <div className="btn-icon-wrapper">
              <img src="/public/img/catalogue_book.png" alt="📖" className="btn-icon" 
                onError={(e) => { e.target.src = "https://cdn-icons-png.flaticon.com/512/2232/2232688.png" }} />
            </div>
            <span className="btn-label">Catalog</span>
          </button>
        </nav>

        {/* MIDDLE AREA */}
        <div className="player-model-container">
          <div className="model-placeholder">
            <img src="/img/Player_without_image.png" alt="Player" className="player-render" />
            <p className="model-hint">Click & Drag to rotate player model</p>
          </div>
        </div>

        {/* FOOTER AREA */}
        <footer className="centro-footer">
          <div className={`level-progress ${progressColorClass}`}>
             {currencyData.collected_lv} / {currencyData.max_per_lv}
          </div>
        </footer>

      </div>
    </main>
  )
}

export default Centro

