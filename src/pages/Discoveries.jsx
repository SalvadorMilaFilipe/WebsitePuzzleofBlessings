import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import BlessingAvatar from '../components/BlessingAvatar'
import CollectibleAvatar from '../components/CollectibleAvatar'
import RarityAvatar from '../components/RarityAvatar'
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
  const [playerId, setPlayerId] = useState(null)

  const [collectibles, setCollectibles] = useState([])
  const [collectiblesLoading, setCollectiblesLoading] = useState(false)
  const [collectiblesError, setCollectiblesError] = useState('')
  const [selectedCollectible, setSelectedCollectible] = useState(null)

  const [categories, setCategories] = useState([])
  const [rarities, setRarities] = useState([])

  useEffect(() => {
    if (!session?.user?.id) return

    const fetchPlayerProgress = async () => {
      try {
        // 1. Get player ID and base level
        const { data: player } = await supabase
          .from('player')
          .select('pl_id, pl_level_id')
          .eq('pl_email', session.user.email)
          .single()

        if (!player) return

        // 2. Get latest save level (reacting to sv_level_id as requested)
        const { data: latestSave } = await supabase
          .from('save')
          .select('sv_level_id')
          .eq('sa_jo_id', player.pl_id)
          .order('sv_updated_at', { ascending: false })
          .limit(1)
          .maybeSingle()

        // Priority to save table, then player record
        const currentLevel = latestSave?.sv_level_id ?? player.pl_level_id ?? 0
        setPlayerLevel(currentLevel)
        setPlayerId(player.pl_id)
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

        // Fetch blessings ONLY from player_blessing table (events)
        const { data, error } = await supabase
          .from('player_blessing')
          .select(`
            date_obtained,
            blessing:blessing (
              bl_id,
              bl_name,
              bl_description,
              bl_lv_id,
              rarity:rarity ( * ),
              category:category ( * ),
              blessing_attribute:blessing_attribute!fk_blessing_attr_blessing (
                attribute:attribute!fk_blessing_attr_attribute ( attr_name )
              )
            )
          `)
          .eq('pl_id', playerId)

        if (error) throw error
        
        const obtainedBlessings = (data || []).map(row => ({
          ...row.blessing,
          date_obtained: row.date_obtained
        }));

        setBlessings(obtainedBlessings)

        // Derive Unlocked Categories and Rarities
        const unlockedCats = [];
        const unlockedRars = [];
        
        obtainedBlessings.forEach(b => {
          if (b.category && !unlockedCats.find(c => c.cat_id === b.category.cat_id)) {
            unlockedCats.push(b.category);
          }
          if (b.rarity && !unlockedRars.find(r => r.rar_id === b.rarity.rar_id)) {
            unlockedRars.push(b.rarity);
          }
        });

        setCategories(unlockedCats.sort((a,b) => a.cat_id - b.cat_id));
        setRarities(unlockedRars.sort((a,b) => a.rar_id - b.rar_id));

      } catch (err) {
        setBlessingsError(err?.message || 'Failed to load discoveries')
      } finally {
        setBlessingsLoading(false)
      }
    }

    if (playerId) fetchBlessings()
  }, [session, playerId])

  useEffect(() => {
    if (!session || !playerId) return

    const fetchCollectibles = async () => {
      try {
        setCollectiblesLoading(true)
        setCollectiblesError('')

        const { data, error } = await supabase
          .from('player_collectible')
          .select(`
            obtention_date,
            collectible:collectible (
              cl_id,
              cl_name,
              cl_description,
              cl_lv_id
            )
          `)
          .eq('pl_id', playerId)

        if (error) throw error
        setCollectibles(data || [])
      } catch (err) {
        setCollectiblesError(err?.message || 'Failed to load collectibles')
      } finally {
        setCollectiblesLoading(false)
      }
    }

    fetchCollectibles()
  }, [session, playerId])

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

  const visibleCollectibles = useMemo(() => {
    if (!collectibles) return []
    let filtered = collectibles
    if (searchTerm) {
      const q = searchTerm.toLowerCase()
      filtered = filtered.filter(c => {
        const col = c.collectible;
        if (!col) return false;
        return (col.cl_name || '').toLowerCase().includes(q) || 
               (col.cl_description || '').toLowerCase().includes(q)
      })
    }
    return filtered
  }, [collectibles, searchTerm])

  const visibleCategories = useMemo(() => {
    if (!categories) return []
    if (!searchTerm) return categories
    const q = searchTerm.toLowerCase()
    return categories.filter(c => 
      (c.cat_name || '').toLowerCase().includes(q) || 
      (c.cat_description || '').toLowerCase().includes(q)
    )
  }, [categories, searchTerm])

  const visibleRarities = useMemo(() => {
    if (!rarities) return []
    if (!searchTerm) return rarities
    const q = searchTerm.toLowerCase()
    return rarities.filter(r => 
      (r.rar_name || '').toLowerCase().includes(q) || 
      (r.rar_description || '').toLowerCase().includes(q)
    )
  }, [rarities, searchTerm])

  if (!session) {
    return (
      <main className="discoveries-main-guest">
        <div className="container">
          <div className="discoveries-guest-card lowpoly-card">
            <div className="guest-glow"></div>
            <div className="guest-content">
              <span className="guest-eyebrow">A Journey to Remember</span>
              <h1 className="guest-title">Islands of Between-Dreams</h1>
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
                className={`filter-tab ${activeFilter === 'collectibles' ? 'active' : ''}`}
                onClick={() => setActiveFilter('collectibles')}
              >
                Collectibles
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
        {activeFilter === 'blessings' ? (
          blessingsLoading ? (
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
                  style={{ borderLeft: `5px solid ${getRarityColor(b.rarity?.rar_name)}` }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', padding: '1rem' }}>
                    <BlessingAvatar 
                      blessing={b} 
                      className="discoveries-element-avatar"
                      style={{ 
                        minWidth: '50px',
                        height: '50px',
                        marginRight: '1rem'
                      }}
                    />

                    <div className="discoveries-element-info" style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div className="discoveries-element-title" style={{ fontSize: '1.6rem', fontWeight: 'bold', color: getRarityColor(b.rarity?.rar_name) }}>
                          {b.bl_name}
                        </div>
                        <span style={{ fontSize: '0.8rem', background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '4px', color: '#888' }}>
                          #{b.bl_id}
                        </span>
                      </div>

                      <p className="discoveries-blessing-category" style={{ margin: '4px 0', opacity: 0.9, fontSize: '0.85rem', color: getRarityColor(b.rarity?.rar_name), fontWeight: 700 }}>
                        {b.category?.cat_name || 'Blessing'}
                      </p>

                      <p style={{ fontSize: '0.9rem', color: '#bbb', margin: '4px 0', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {b.bl_description}
                      </p>

                      <div className="discoveries-blessing-attributes" style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '8px' }}>
                        {b.blessing_attribute?.map((attr, idx) => (
                          <div key={idx} className="discoveries-attr-tag" style={{ fontSize: '0.85rem', color: '#ddd', background: 'rgba(255,255,255,0.05)', padding: '4px 10px', borderRadius: '6px', borderLeft: `3px solid ${getRarityColor(b.rarity?.rar_name)}` }}>
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
          )
        ) : activeFilter === 'collectibles' ? (
          collectiblesLoading ? (
            <div className="no-results"><p>Loading collectibles...</p></div>
          ) : collectiblesError ? (
            <div className="no-results"><p>{collectiblesError}</p></div>
          ) : visibleCollectibles.length > 0 ? (
            <div className="discoveries-elements-grid">
              {visibleCollectibles.map(c => {
                const col = c.collectible;
                if (!col) return null;
                return (
                  <article 
                    key={col.cl_id}
                    className="discoveries-element-card lowpoly-card"
                    onClick={() => setSelectedCollectible(c)}
                    style={{ borderLeft: `5px solid #FFD700` }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', padding: '1rem' }}>
                      <CollectibleAvatar 
                        collectibleName={col.cl_name} 
                        className="discoveries-element-avatar"
                        style={{ 
                          minWidth: '50px',
                          height: '50px',
                          marginRight: '1rem',
                          backgroundSize: 'cover'
                        }}
                      />

                      <div className="discoveries-element-info" style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div className="discoveries-element-title" style={{ fontSize: '1.6rem', fontWeight: 'bold', color: '#FFD700' }}>
                            {col.cl_name}
                          </div>
                          <span style={{ fontSize: '0.8rem', background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '4px', color: '#888' }}>
                            #{col.cl_id}
                          </span>
                        </div>
                        
                        <p className="discoveries-blessing-category" style={{ margin: '4px 0', opacity: 0.9, fontSize: '0.85rem', color: '#FFD700', fontWeight: 700 }}>
                          Collectible
                        </p>

                        <p style={{ fontSize: '0.9rem', color: '#bbb', margin: '4px 0', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {col.cl_description}
                        </p>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="no-results"><p>No collectibles found.</p></div>
          )
        ) : activeFilter === 'categories' ? (
          visibleCategories.length > 0 ? (
            <div className="discoveries-elements-grid">
              {visibleCategories.map(c => (
                <article 
                  key={c.cat_id}
                  className="discoveries-element-card lowpoly-card"
                  style={{ borderLeft: `5px solid #81D89E` }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', padding: '1rem' }}>
                    <div className="category-img" style={{ 
                      minWidth: '50px', height: '50px', marginRight: '1rem',
                      backgroundImage: `url(${c.cat_image || ''})`, backgroundSize: 'cover', backgroundPosition: 'center'
                    }} />
                    <div className="discoveries-element-info">
                      <div className="discoveries-element-title" style={{ fontSize: '1.6rem', fontWeight: 'bold', color: '#81D89E' }}>
                        {c.cat_name}
                      </div>
                      <p style={{ fontSize: '0.9rem', color: '#bbb', mt: '4px' }}>{c.cat_description || 'No description available.'}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="no-results"><p>Catch some blessings to unlock categories!</p></div>
          )
        ) : activeFilter === 'rarities' ? (
          visibleRarities.length > 0 ? (
            <div className="discoveries-elements-grid">
              {visibleRarities.map(r => (
                <article 
                  key={r.rar_id}
                  className="discoveries-element-card lowpoly-card"
                  style={{ borderLeft: `5px solid ${getRarityColor(r.rar_name)}` }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', padding: '1rem' }}>
                    <RarityAvatar 
                      rarityName={r.rar_name} 
                      className="rarity-thumbnail"
                      style={{ 
                        minWidth: '50px', height: '50px', marginRight: '1rem'
                      }} 
                    />
                    <div className="discoveries-element-info">
                      <div className="discoveries-element-title" style={{ fontSize: '1.6rem', fontWeight: 'bold', color: getRarityColor(r.rar_name) }}>
                        {r.rar_name}
                      </div>
                      <p style={{ fontSize: '0.9rem', color: '#bbb', mt: '4px' }}>{r.rar_description || 'No description available.'}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="no-results"><p>Catch some blessings to unlock rarities!</p></div>
          )
        ) : (
          <div className="no-results">
            <p>Coming soon.</p>
          </div>
        )}
      </div>

      {/* Modal Overlay for Selected Collectible */}
      {selectedCollectible && (
        <div className="discoveries-modal-overlay" onClick={() => setSelectedCollectible(null)}>
          <div className="discoveries-modal" onClick={(e) => e.stopPropagation()}>
            <button className="discoveries-close-btn" onClick={() => setSelectedCollectible(null)}>
              &times;
            </button>
            
            <div className="discoveries-modal-header">
              <CollectibleAvatar 
                collectibleName={selectedCollectible.collectible?.cl_name} 
                className="discoveries-modal-avatar"
                style={{
                  backgroundSize: 'contain'
                }}
              />
              <div>
                <h2 className="discoveries-modal-title" style={{ color: '#FFD700', textShadow: `0 0 15px #FFD70044` }}>
                  {selectedCollectible.collectible?.cl_name}
                </h2>
                <div className="discoveries-read-attribute" style={{ marginTop: '0.75rem', marginBottom: 0 }}>
                  <span style={{ color: '#FFD700', fontWeight: 700 }}>Type:</span> Collectible
                </div>
              </div>
            </div>

            <div className="discoveries-modal-body" style={{ marginTop: '1.5rem' }}>
              <div style={{ padding: '0.8rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', borderLeft: `4px solid #FFD700`, marginBottom: '1rem', fontStyle: 'italic', color: '#FFD700' }}>
                This collectible can be obtained at level {selectedCollectible.collectible?.cl_lv_id}
              </div>
              <div className="discoveries-read-description" style={{marginTop: '1.25rem', marginBottom: '1.5rem', color: '#ccc', fontSize: '1rem', lineHeight: '1.7'}}>
                {selectedCollectible.collectible?.cl_description || '—'}
              </div>
              <div className="discoveries-read-date" style={{fontSize: '0.9rem', color: '#888'}}>
                <span style={{color: '#81D89E', fontWeight: 800}}>Obtention Date:</span> {selectedCollectible.obtention_date ? new Date(selectedCollectible.obtention_date).toISOString().split('T')[0] : 'Unknown'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Overlay for Selected Blessing */}
      {selectedBlessing && (
        <div className="discoveries-modal-overlay" onClick={() => setSelectedBlessing(null)}>
          <div className="discoveries-modal" onClick={(e) => e.stopPropagation()}>
            <button className="discoveries-close-btn" onClick={() => setSelectedBlessing(null)}>
              &times;
            </button>
            
            <div className="discoveries-modal-header">
              <BlessingAvatar 
                blessing={selectedBlessing} 
                className="discoveries-modal-avatar"
                style={{
                  backgroundSize: 'contain'
                }}
              />
              <div>
                <h2 className="discoveries-modal-title" style={{ color: getRarityColor(selectedBlessing.rarity?.rar_name), textShadow: `0 0 15px ${getRarityColor(selectedBlessing.rarity?.rar_name)}44` }}>
                  {selectedBlessing.bl_name}
                </h2>
                <div className="discoveries-read-attribute" style={{ marginTop: '0.75rem', marginBottom: 0 }}>
                  <span style={{ color: getRarityColor(selectedBlessing.rarity?.rar_name), fontWeight: 700 }}>Category:</span> {selectedBlessing.category?.cat_name || 'Unknown'} | <span style={{ color: getRarityColor(selectedBlessing.rarity?.rar_name), fontWeight: 700 }}>Rarity:</span> <span style={{ color: getRarityColor(selectedBlessing.rarity?.rar_name), textShadow: '0 0 8px rgba(0,0,0,0.5)' }}>{selectedBlessing.rarity?.rar_name || 'Unknown'}</span>
                </div>
              </div>
            </div>

            <div className="discoveries-modal-body" style={{ marginTop: '1.5rem' }}>
              <div className="discoveries-blessing-attributes">
                {selectedBlessing.blessing_attribute?.map((attr, idx) => (
                  <div key={idx} style={{ padding: '0.8rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', borderLeft: `4px solid ${getRarityColor(selectedBlessing.rarity?.rar_name)}`, marginBottom: '1rem', fontStyle: 'italic', color: getRarityColor(selectedBlessing.rarity?.rar_name) }}>
                    {attr.attribute?.attr_name}
                  </div>
                ))}
              </div>
              <div className="discoveries-read-description" style={{marginTop: '1.25rem', marginBottom: '1.5rem', color: '#ccc', fontSize: '1rem', lineHeight: '1.7'}}>
                {selectedBlessing.bl_description || '—'}
              </div>
              <div className="discoveries-read-date" style={{fontSize: '0.9rem', color: '#888'}}>
                <span style={{color: '#81D89E', fontWeight: 800}}>Obtained on:</span> {selectedBlessing.date_obtained || 'Unknown'}
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

export default Discoveries
