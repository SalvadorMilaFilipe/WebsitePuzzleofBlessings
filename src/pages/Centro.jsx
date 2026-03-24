import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import '../../css/centro.css'

function Centro() {
  const { userProfile, loading: authLoading } = useAuth()

  // Data States
  // Data States
  const [currencyData, setCurrencyData] = useState({ amount: 0, collected_lv: 0, max_per_lv: 10 })
  const [playerLevel, setPlayerLevel] = useState({ id: 0, name: 'Trainee' })
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

        // B. Fetch Player Level Info from the latest save
        // We join with session to filter by player ID, and join with level to get the name
        const { data: latestSave, error: saveError } = await supabase
          .from('save')
          .select(`
            sv_level_id,
            level:level (
              lv_name
            ),
            session!inner (
              ss_player_id
            )
          `)
          .eq('session.ss_player_id', userProfile.pl_id)
          .order('sv_updated_at', { ascending: false })
          .limit(1)
          .maybeSingle()

        if (saveError) console.warn("Error fetching level from save:", saveError)

        if (latestSave) {
          setPlayerLevel({
            id: latestSave.sv_level_id || 0,
            name: latestSave.level?.lv_name || 'Genesis Field'
          })
        } else {
          // Fallback if no save exists yet
          setPlayerLevel({ id: 0, name: 'Genesis Field' })
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
      const interval = setInterval(() => fetchData(), 10000) // Slightly longer interval (10s)
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

  // Functional: Buy Blessing
  const buyBlessing = async (blessingId) => {
    if (!userProfile?.pl_id) return;

    try {
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];

      const { error: buyErr } = await supabase
        .from('player_blessing')
        .insert([{
          pl_id: userProfile.pl_id,
          bl_id: blessingId,
          date_obtained: dateStr
        }]);

      if (buyErr) throw buyErr;
      alert("Blessing obtained successfully!");

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

  // Guest View / Unauthenticated State
  if (!userProfile) {
    return (
      <main className="centro-main guest-view">
        <div className="centro-container guest-container">
          <section className="guest-hero">
             <div className="hero-content">
                <h3 className="hero-welcome">Welcome, Wanderer</h3>
                <p className="hero-tagline">"The Center" is the heart of your adventure in <strong>Puzzle of Blessings</strong>.</p>
                
                <div className="center-explanation">
                  <p>In this digital sanctuary, you can track your divine journey across the realms. Every level completed, every piece of light gathered, and every blessing earned is recorded here.</p>
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

                <div className="guest-cta">
                  <p className="cta-text">Start your legend today.</p>
                  <button className="install-btn" onClick={() => window.location.href = '/download'}>
                    Install Puzzle of Blessings
                  </button>
                  <p className="cta-sub">Already playing? Please log in to view your dashboard.</p>
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
            <div className="currency-display">
              <img src="/img/puzzle_piece.png" alt="🧩" className="currency-icon"
                onError={(e) => { e.target.src = "https://cdn-icons-png.flaticon.com/512/3204/3204000.png" }} />
              <div className="currency-amount">
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
              <img src="/img/shop_icon.png" alt="🏪" className="btn-icon"
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
            <span className="btn-label">
              {hintCooldown > 0 ? formatTime(hintCooldown) : "Hint"}
            </span>
          </button>

          <button className="icon-btn catalogue-btn" title="Catalogue" onClick={() => alert("Catalogue coming soon!")}>
            <div className="btn-icon-wrapper">
              <img src="/img/catalogue_book.png" alt="📖" className="btn-icon"
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

