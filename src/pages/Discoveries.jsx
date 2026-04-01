import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import { getBlessingUrl } from '../utils/formatUtils'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

function Discoveries() {
  const { session } = useAuth()
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [activeFilter, setActiveFilter] = useState('blessings')
  const [blessings, setBlessings] = useState([])
  const [blessingsLoading, setBlessingsLoading] = useState(false)
  const [blessingsError, setBlessingsError] = useState('')
  const [selectedBlessing, setSelectedBlessing] = useState(null)
  const [playerLevel, setPlayerLevel] = useState(0)

  useEffect(() => {
    if (!session?.user?.id) return

    const fetchPlayerProgress = async () => {
      try {
        const { data: playerData } = await supabase
          .from('player')
          .select('pl_level_id')
          .eq('pl_email', session.user.email)
          .single()

        setPlayerLevel(playerData?.pl_level_id || 0)
      } catch (err) {
        console.error('Error fetching player level:', err)
      }
    }

    fetchPlayerProgress()
  }, [session])

  useEffect(() => {
    if (!session) return

    const fetchBlessings = async () => {
      try {
        setBlessingsLoading(true)
        setBlessingsError('')

        // Fetching blessings where level is <= playerLevel (inclusive of previous levels)
        const { data, error } = await supabase
          .from('blessing')
          .select(`
            *,
            category:category ( cat_name ),
            blessing_attribute:blessing_attribute!fk_blessing_attr_blessing (
              attribute:attribute!fk_blessing_attr_attribute ( attr_name )
            )
          `)
          .lte('bl_lv_id', playerLevel)
          .order('bl_id', { ascending: true })

        if (error) throw error
        setBlessings(data || [])
      } catch (err) {
        setBlessingsError(err?.message || 'Failed to load discoveries')
      } finally {
        setBlessingsLoading(false)
      }
    }

    fetchBlessings()
  }, [session, playerLevel])

  const getRarityColor = (rarity) => {
    if (!rarity) return '#ccc'
    const r = rarity.toLowerCase()
    if (r.includes('common') && !r.includes('uncommon')) return '#a9d3ff' // Soft Blue
    if (r.includes('uncommon')) return '#81D89E' // Emerald Green
    if (r.includes('rare')) return '#4da6ff' // Sky Blue
    if (r.includes('epic')) return '#d0b3ff' // Royal Purple
    if (r.includes('legendary')) return '#FFD700' // Burnished Gold
    return '#ccc'
  }

  const getAttributeText = (blessing) => {
    const attrRows = blessing?.blessing_attribute || []
    if (attrRows.length > 0) {
      return attrRows[0].attribute?.attr_name || ''
    }
    return 'No attribute defined'
  }

  const visibleBlessings = useMemo(() => {
    if (!blessings) return []
    let filtered = blessings
    if (searchTerm) {
      const q = searchTerm.toLowerCase()
      filtered = filtered.filter(b => 
        (b.bl_name || '').toLowerCase().includes(q) || 
        (b.bl_description || '').toLowerCase().includes(q)
      )
    }
    return filtered
  }, [blessings, searchTerm])

  if (!session) {
    return (
      <main className="discoveries-main-guest">
        <div className="container">
          <div className="discoveries-guest-card lowpoly-card">
            <div className="guest-glow"></div>
            <div className="guest-content">
              <span className="guest-eyebrow">Ilhas do Entre-Sonho</span>
              <h1 className="guest-title">A Journey to Remember</h1>
              <p className="guest-description">
                Your memories are locked within the islands. To uncover your discoveries, you must first establish a connection to this world.
              </p>
              
              <div className="progression-preview">
                <div className="preview-step">
                  <div className="step-icon">0</div>
                  <span>Tutorial</span>
                </div>
                <div className="preview-line"></div>
                <div className="preview-step locked">
                  <div className="step-icon">1</div>
                  <span>First Soul</span>
                </div>
                <div className="preview-line"></div>
                <div className="preview-step locked">
                  <div className="step-icon">?</div>
                  <span>Unknown</span>
                </div>
              </div>

              <div className="guest-actions">
                <button className="btn-primary" onClick={() => navigate('/register')}>Start Your Journey</button>
                <button className="btn-secondary" onClick={() => navigate('/login')}>Recover Memories</button>
              </div>
              
              <p className="guest-footer-note">
                Progress through the levels to unlock blessings, collectibles, and the lore of the ghosts that haunt the islands.
              </p>
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="discoveries-main">
      <div className="container">
        <h1 className="section-title">Discoveries</h1>

        {/* Search Bar */}
        <div className="search-section">
          <div className="search-container lowpoly-card">
            <div className="search-box">
              <input
                type="text"
                id="discoveries-search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search for Blessings, Rarities, or Categories..."
                autoComplete="off"
              />
            </div>
            <div className="filter-tabs">
              <button
                className={`filter-tab ${activeFilter === 'blessings' ? 'active' : ''}`}
                onClick={() => setActiveFilter('blessings')}
              >
                Blessings
              </button>
              <button
                className={`filter-tab ${activeFilter === 'categories' ? 'active' : ''}`}
                onClick={() => setActiveFilter('categories')}
              >
                Categories
              </button>
              <button
                className={`filter-tab ${activeFilter === 'rarities' ? 'active' : ''}`}
                onClick={() => setActiveFilter('rarities')}
              >
                Rarities
              </button>
              <button
                className={`filter-tab ${activeFilter === 'levels' ? 'active' : ''}`}
                onClick={() => setActiveFilter('levels')}
              >
                Levels
              </button>
            </div>
          </div>
        </div>

        {/* READ-ONLY: start with Blessings */}
        {activeFilter !== 'blessings' ? (
          <div className="no-results">
            <p>Coming soon.</p>
          </div>
        ) : blessingsLoading ? (
          <div className="no-results"><p>Loading blessings...</p></div>
        ) : blessingsError ? (
          <div className="no-results"><p>{blessingsError}</p></div>
        ) : visibleBlessings.length > 0 ? (
          <div className="discoveries-elements-grid">
            {visibleBlessings.map(b => (
              <article 
                key={b.bl_id}
                className="discoveries-element-card lowpoly-card"
                onClick={() => setSelectedBlessing(b)}
                style={{ borderLeft: `5px solid ${getRarityColor(b.bl_rarity)}` }}
              >
                <div style={{ display: 'flex', alignItems: 'center', padding: '1rem' }}>
                  <div
                    className="discoveries-element-avatar"
                    style={{ 
                      backgroundImage: getBlessingUrl(b.bl_image),
                      minWidth: '80px',
                      height: '80px',
                      borderRadius: '50%',
                      backgroundSize: 'contain',
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'center',
                      boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
                      marginRight: '1.5rem'
                    }}
                  ></div>

                  <div className="discoveries-element-info" style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div className="discoveries-element-title" style={{ fontSize: '1.6rem', fontWeight: 'bold', color: getRarityColor(b.bl_rarity) }}>
                        {b.bl_name}
                      </div>
                      <span style={{ fontSize: '0.8rem', background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '4px', color: '#888' }}>
                        #{b.bl_id}
                      </span>
                    </div>

                    <p className="discoveries-blessing-category" style={{ margin: '4px 0', opacity: 0.9, fontSize: '0.85rem', color: getRarityColor(b.bl_rarity), fontWeight: 700 }}>
                      {b.category?.cat_name || 'Blessing'}
                    </p>

                    <p style={{ fontSize: '0.9rem', color: '#bbb', margin: '4px 0', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {b.bl_description}
                    </p>

                    <div className="discoveries-blessing-attributes" style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '8px' }}>
                      {b.blessing_attribute?.map((attr, idx) => (
                        <div key={idx} className="discoveries-attr-tag" style={{ fontSize: '0.85rem', color: '#ddd', background: 'rgba(255,255,255,0.05)', padding: '4px 10px', borderRadius: '6px', borderLeft: `3px solid ${getRarityColor(b.bl_rarity)}` }}>
                           {attr.attribute?.attr_name}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="no-results"><p>No results found.</p></div>
        )}
      </div>

      {/* Modal Overlay for Selected Blessing */}
      {selectedBlessing && (
        <div className="discoveries-modal-overlay" onClick={() => setSelectedBlessing(null)}>
          <div className="discoveries-modal" onClick={(e) => e.stopPropagation()}>
            <button className="discoveries-close-btn" onClick={() => setSelectedBlessing(null)}>
              &times;
            </button>
            
            <div className="discoveries-modal-header">
              <div 
                className="discoveries-modal-avatar"
                style={{ 
                  backgroundImage: getBlessingUrl(selectedBlessing.bl_image),
                  backgroundSize: 'cover', 
                  backgroundPosition: 'center' 
                }}
              ></div>
              <div>
                <h2 className="discoveries-modal-title" style={{ color: getRarityColor(selectedBlessing.bl_rarity), textShadow: `0 0 15px ${getRarityColor(selectedBlessing.bl_rarity)}44` }}>
                  {selectedBlessing.bl_name}
                </h2>
                <div className="discoveries-read-attribute" style={{ marginTop: '0.75rem', marginBottom: 0 }}>
                  <span style={{ color: getRarityColor(selectedBlessing.bl_rarity), fontWeight: 700 }}>Category:</span> {selectedBlessing.category?.cat_name || 'Unknown'} | <span style={{ color: getRarityColor(selectedBlessing.bl_rarity), fontWeight: 700 }}>Rarity:</span> <span style={{ color: getRarityColor(selectedBlessing.bl_rarity), textShadow: '0 0 8px rgba(0,0,0,0.5)' }}>{selectedBlessing.bl_rarity || 'Unknown'}</span>
                </div>
              </div>
            </div>

            <div className="discoveries-modal-body" style={{ marginTop: '1.5rem' }}>
              <div className="discoveries-blessing-attributes">
                {selectedBlessing.blessing_attribute?.map((attr, idx) => (
                  <div key={idx} style={{ padding: '0.8rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', borderLeft: `4px solid ${getRarityColor(selectedBlessing.bl_rarity)}`, marginBottom: '1rem', fontStyle: 'italic', color: getRarityColor(selectedBlessing.bl_rarity) }}>
                    {attr.attribute?.attr_name}
                  </div>
                ))}
              </div>
              <div className="discoveries-read-description" style={{marginTop: '1.25rem', marginBottom: '1.5rem', color: '#ccc', fontSize: '1rem', lineHeight: '1.7'}}>
                {selectedBlessing.bl_description || '—'}
              </div>
              <div className="discoveries-read-date" style={{fontSize: '0.9rem', color: '#888'}}>
                <span style={{color: '#81D89E', fontWeight: 800}}>Date Added:</span> {new Date().toISOString().split('T')[0]}
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

export default Discoveries
