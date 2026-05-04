import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import BlessingAvatar from '../components/BlessingAvatar'
import DeckModal from '../components/DeckModal'
import Player3D from '../components/Player3D'
import '../../css/centro.css'

function Centro() {
  const { userProfile, loading: authLoading } = useAuth()

  // Data States
  const [currencyData, setCurrencyData] = useState({ amount: 0, collected_lv: 0, max_per_lv: 10 })
  const [playerLevel, setPlayerLevel] = useState({ id: 0, name: 'Trainee' })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isShopOpen, setIsShopOpen] = useState(false)
  const [isDeckOpen, setIsDeckOpen] = useState(false)

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

  // 2. Fetch Data (Currency and Level)
  useEffect(() => {
    const fetchData = async () => {
      if (!userProfile?.pl_id) return

      try {
        setLoading(true)
        setError(null)

        // A. Fetch Currency Data
        let { data: cData, error: cError } = await supabase
          .from('currency')
          .select('*')
          .eq('cur_pl_id', userProfile.pl_id)
          .maybeSingle()

        if (cError) throw cError

        // If no record exists, create one
        if (!cData) {
          const { data: newData, error: insertError } = await supabase
            .from('currency')
            .insert([{ cur_pl_id: userProfile.pl_id, cur_ammount: 0 }])
            .select()
            .single()

          if (!insertError) cData = newData
        }

        if (cData) {
          setCurrencyData({
            amount: cData.cur_ammount || 0,
            collected_lv: cData.collected_lv || 0,
            max_per_lv: cData.max_per_lv || 10
          })
        }

        // B. Fetch Player Level Info
        const { data: latestSave, error: saveError } = await supabase
          .from('save')
          .select(`
            sv_level_id,
            level:level (
              lv_name
            )
          `)
          .ilike('sv_player_pos', `%"playerUser":"${userProfile.pl_username}"%`)
          .order('sv_updated_at', { ascending: false })
          .limit(1)
          .maybeSingle()

        if (latestSave) {
          setPlayerLevel({
            id: latestSave.sv_level_id || 0,
            name: latestSave.level?.lv_name || (latestSave.sv_level_id === 0 ? 'Tutorial' : 'Genesis Field')
          })
        } else {
          // Fallback: Try the player table's current level
          const { data: userData } = await supabase
            .from('player')
            .select('pl_level_id, level:level(lv_name)')
            .eq('pl_id', userProfile.pl_id)
            .maybeSingle()

          if (userData) {
            setPlayerLevel({
              id: userData.pl_level_id || 0,
              name: userData.level?.lv_name || (userData.pl_level_id === 0 ? 'Tutorial' : 'Genesis Field')
            })
          } else {
            setPlayerLevel({ id: 0, name: 'Tutorial' })
          }
        }

      } catch (err) {
        console.error('Error fetching center data:', err)
        setError(err.message || 'Error loading data')
      } finally {
        setLoading(false)
      }
    }

    if (!authLoading && userProfile) {
      fetchData()
      const interval = setInterval(() => fetchData(), 10000)
      return () => clearInterval(interval)
    }
  }, [userProfile, authLoading])

  // Functional: Hint System
  const handleHintClick = () => {
    if (hintCooldown > 0) return
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

  const formatTime = (ms) => {
    const mins = Math.floor(ms / 60000)
    const secs = Math.floor((ms % 60000) / 1000)
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`
  }

  const isProgressComplete = currencyData.collected_lv === currencyData.max_per_lv
  const progressColorClass = isProgressComplete ? 'progress-gold' : 'progress-standard'

  if (authLoading) return <div className="centro-loading-screen">Authenticating...</div>

  // Guest View
  if (!userProfile) {
    return (
      <main className="centro-main guest-view">
        <div className="centro-container guest-container">
          <section className="guest-hero">
              <div className="hero-content">
                <h3 className="hero-welcome">Welcome, Wanderer</h3>
                <div className="center-explanation">
                  <p>In this digital sanctuary, you can track your divine journey across the realms. Every level completed, every piece of light gathered, and every blessing earned is recorded here.</p>
                </div>
                <div className="guest-cta">
                  <p className="cta-text">Start your legend today.</p>
                  <button className="install-btn" onClick={() => window.location.href = '/download'}>
                    Install Puzzle of Blessings
                  </button>
                  <p className="cta-sub">Already playing? Please log in to view your dashboard.</p>
                </div>
                <div className="guest-features">
                  <div className="feature-card">
                    <div className="feature-icon">📈</div>
                    <h3>Track Progress</h3>
                    <p>Monitor your ascent through the game's challenging levels.</p>
                  </div>
                  <div className="feature-card">
                    <div className="feature-icon">🏪</div>
                    <h3>The Shop</h3>
                    <p>Unlock legendary blessings to aid you in your quest.</p>
                  </div>
                  <div className="feature-card">
                    <div className="feature-icon">💡</div>
                    <h3>Seek Wisdom</h3>
                    <p>When the path grows dark, find the light with our hint system.</p>
                  </div>
                </div>
             </div>
          </section>
          <div className="guest-background-effect"></div>
        </div>
      </main>
    )
  }

  return (
    <main className="centro-main">
      <div className="centro-container">

        {/* HEADER AREA */}
        <header className="centro-header">
          <div className="header-left">
            {/* Empty space to balance the centered title */}
          </div>


          <div className="header-center">
            <h1 className="centro-title">The Center</h1>
          </div>
          <div className="header-right">
            <div className="level-badge">
              {playerLevel.id === 0 ? (
                <div className="level-tutorial-badge">Tutorial</div>
              ) : (
                <>
                  <div className="level-number">Level {playerLevel.id}</div>
                  <div className="level-name">{playerLevel.name}</div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* SIDE ACTIONS */}
        <nav className="centro-sidebar-actions">
          <div className="currency-display sidebar-pill">
            <img src="/img/puzzle_piece.png" alt="🧩" className="currency-icon"
              onError={(e) => { e.target.src = "https://cdn-icons-png.flaticon.com/512/3204/3204000.png" }} />
            <div className="currency-amount">
              <span className="amount-value">{currencyData.amount.toLocaleString()}</span>
            </div>
          </div>


          <button className="icon-btn shop-btn" title="Shop" onClick={() => setIsShopOpen(true)}>
            <div className="btn-icon-wrapper">
              <img src="/img/shop_icon.png" alt="🏪" className="btn-icon green-icon"
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
              <img src="/img/hint_bulb.png" alt="💡" className="btn-icon"
                onError={(e) => { e.target.src = "https://cdn-icons-png.flaticon.com/512/702/702797.png" }} />
            </div>
            <span className="btn-label">{hintCooldown > 0 ? formatTime(hintCooldown) : "Hint"}</span>
          </button>

          <button className="icon-btn deck-btn" title="My Deck" onClick={() => setIsDeckOpen(true)}>
            <div className="btn-icon-wrapper">
              <img src="/img/deck_icon.png" alt="🃏" className="btn-icon"
                onError={(e) => { e.target.src = "https://cdn-icons-png.flaticon.com/512/1070/1070260.png" }} />
            </div>
            <span className="btn-label">Deck</span>
          </button>
        </nav>

        {/* MIDDLE AREA */}
        <div className="player-model-container">
          <div className="model-placeholder">
            <Player3D />
            <p className="model-hint" style={{ marginTop: '-40px', position: 'relative', zIndex: 10 }}>Click & Drag to rotate player model</p>
          </div>
        </div>

        {/* FOOTER AREA */}
        <footer className="centro-footer">
          <div className={`level-progress ${progressColorClass}`}>
            {currencyData.collected_lv} / {currencyData.max_per_lv}
          </div>
        </footer>

      </div>

      {/* SHOP OVERLAY */}
      {isShopOpen && (
        <div className="centro-shop-overlay" onClick={() => setIsShopOpen(false)}>
          <div className="centro-shop-modal simple-shop" onClick={(e) => e.stopPropagation()}>
            <button className="shop-close-btn" onClick={() => setIsShopOpen(false)}>&times;</button>
            <div className="shop-modal-header centered">
              <h2 className="shop-title">The Shop</h2>
              <p className="shop-subtitle">For x currency you can get a random object or item that can help you in your journey</p>
            </div>
            
            <div className="simple-shop-content">
              <div className="sketch-question-wrapper">
                 <img src="/img/Player_without_image.png" alt="?" className="sketch-question" />
              </div>
              
              <button className="btn-primary shop-random-btn">
                 x amount to get a random item
              </button>
            </div>
          </div>
        </div>
      )}
      {/* DECK MODAL */}
      <DeckModal 
        isOpen={isDeckOpen} 
        onClose={() => setIsDeckOpen(false)} 
        userId={userProfile?.pl_id} 
      />
    </main>
  )
}

export default Centro
