import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { supabase } from '../lib/supabase'
import BlessingAvatar from '../components/BlessingAvatar'
import CollectibleAvatar from '../components/CollectibleAvatar'
import AdminBlessingAvatar from '../components/AdminBlessingAvatar'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

function Discoveries() {
  const { session, userProfile } = useAuth()
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [activeFilter, setActiveFilter] = useState('general')
  
  const [blessings, setBlessings] = useState([])
  const [blessingsLoading, setBlessingsLoading] = useState(false)
  const [blessingsError, setBlessingsError] = useState('')
  const [selectedBlessing, setSelectedBlessing] = useState(null)

  const [adminBlessings, setAdminBlessings] = useState([
    { 
      bl_id: 'A1', 
      bl_name: 'Admin NoClip', 
      bl_description: 'Allows the user to walk through walls and fly through the environment for testing purposes.',
      category: { cat_name: 'Admin Utility' },
      rarity: { rar_name: 'Legendary' }, // Give it a legendary look
      isAdminOnly: true 
    }
  ])
  
  const [playerLevel, setPlayerLevel] = useState(0)
  const [playerId, setPlayerId] = useState(null)

  const [collectibles, setCollectibles] = useState([])
  const [collectiblesLoading, setCollectiblesLoading] = useState(false)
  const [collectiblesError, setCollectiblesError] = useState('')
  const [selectedCollectible, setSelectedCollectible] = useState(null)

  const [allLevels, setAllLevels] = useState([])
  const [allCategories, setAllCategories] = useState([])
  const [allRarities, setAllRarities] = useState([])

  useEffect(() => {
    const fetchCatsAndRarities = async () => {
      const [{ data: cats }, { data: rars }] = await Promise.all([
        supabase.from('category').select('*').order('cat_id', { ascending: true }),
        supabase.from('rarity').select('*').order('rar_id', { ascending: true })
      ])
      if (cats) setAllCategories(cats)
      if (rars) setAllRarities(rars)
    }
    fetchCatsAndRarities()
  }, [])

  useEffect(() => {
    if (selectedCollectible || selectedBlessing) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [selectedCollectible, selectedBlessing]);

  useEffect(() => {
    const fetchLevels = async () => {
      const { data } = await supabase.from('level').select('*').order('lv_id', { ascending: true })
      if (data) setAllLevels(data)
    }
    fetchLevels()
  }, [])

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

  const matchesSearch = (q, ...fields) =>
    fields.some((f) => (f || '').toLowerCase().includes(q))

  const tutorialItems = useMemo(() => (
    playerLevel === 0
      ? [{
          bl_id: 'T0',
          bl_name: 'Boost',
          bl_description: 'Increases speed for 3 seconds. The player automatically moves forward and cannot jump during this time.',
          category: { cat_name: 'Tutorial' },
          emoji: '💨',
          isTutorial: true,
          itemType: 'blessing',
        }]
      : []
  ), [playerLevel])

  const normalizedBlessings = useMemo(() => (
    (blessings || [])
      .filter((b) => b?.bl_id != null)
      .map((b) => ({ ...b, itemType: 'blessing' }))
  ), [blessings])

  const normalizedCollectibles = useMemo(() => (
    (collectibles || [])
      .filter((row) => row?.collectible?.cl_id != null)
      .map((row) => ({
        ...row.collectible,
        itemType: 'collectible',
        date_obtained: row.obtention_date,
      }))
  ), [collectibles])

  const filterBlessings = (list, { categoryOnly = false, rarityOnly = false } = {}) => {
    let filtered = list
    if (categoryOnly) {
      filtered = filtered.filter((b) => b.category?.cat_id != null)
    }
    if (rarityOnly) {
      filtered = filtered.filter((b) => b.rarity?.rar_id != null)
    }
    if (!searchTerm) return filtered
    const q = searchTerm.toLowerCase()
    return filtered.filter((b) =>
      matchesSearch(
        q,
        b.bl_name,
        b.bl_description,
        b.category?.cat_name,
        b.rarity?.rar_name,
        getAttributeText(b)
      )
    )
  }

  const filterCollectibles = (list) => {
    if (!searchTerm) return list
    const q = searchTerm.toLowerCase()
    return list.filter((c) =>
      matchesSearch(q, c.cl_name, c.cl_description, 'Collectible')
    )
  }

  const visibleBlessings = useMemo(
    () => filterBlessings(normalizedBlessings),
    [normalizedBlessings, searchTerm]
  )

  const visibleCollectibles = useMemo(
    () => filterCollectibles(normalizedCollectibles),
    [normalizedCollectibles, searchTerm]
  )

  const visibleBlessingsByCategory = useMemo(
    () => filterBlessings(normalizedBlessings, { categoryOnly: true })
      .sort((a, b) => (a.category?.cat_name || '').localeCompare(b.category?.cat_name || '')),
    [normalizedBlessings, searchTerm]
  )

  const visibleBlessingsByRarity = useMemo(
    () => filterBlessings(normalizedBlessings, { rarityOnly: true })
      .sort((a, b) => (a.rarity?.rar_id ?? 0) - (b.rarity?.rar_id ?? 0)),
    [normalizedBlessings, searchTerm]
  )

  const groupedBlessingsByCategory = useMemo(() => {
    const groups = {}
    visibleBlessingsByCategory.forEach((b) => {
      const catName = b.category?.cat_name || 'General'
      if (!groups[catName]) groups[catName] = []
      groups[catName].push(b)
    })
    return groups
  }, [visibleBlessingsByCategory])

  const groupedBlessingsByRarity = useMemo(() => {
    const groups = {}
    visibleBlessingsByRarity.forEach((b) => {
      const rarName = b.rarity?.rar_name || 'Unknown Rarity'
      if (!groups[rarName]) groups[rarName] = []
      groups[rarName].push(b)
    })
    return groups
  }, [visibleBlessingsByRarity])

  const visibleGeneral = useMemo(() => {
    const items = [
      ...tutorialItems,
      ...filterBlessings(normalizedBlessings),
      ...filterCollectibles(normalizedCollectibles),
    ]
    return items
  }, [tutorialItems, normalizedBlessings, normalizedCollectibles, searchTerm])

  const visibleAdminBlessings = useMemo(() => {
    if (!adminBlessings) return []
    if (!searchTerm) return adminBlessings
    const q = searchTerm.toLowerCase()
    return adminBlessings.filter(b => 
      (b.bl_name || '').toLowerCase().includes(q) || 
      (b.bl_description || '').toLowerCase().includes(q)
    )
  }, [adminBlessings, searchTerm])

  const isAdmin = useMemo(() => {
    // Current admin identification logic
    return session?.user?.email === 'sfilipe05@gmail.com' || userProfile?.pl_username === 'Salvador Filipe' || userProfile?.pl_is_admin === true;
  }, [session, userProfile])

  const isCollectibleItem = (item) => item?.itemType === 'collectible'

  const handleFilterChange = (filter) => {
    setActiveFilter(filter)
    setSelectedBlessing(null)
    setSelectedCollectible(null)
  }

  const renderBlessingCard = (b, { showAttributes = false } = {}) => (
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
          style={{ minWidth: '70px', height: '100px', marginRight: '1rem' }}
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
          {showAttributes && b.blessing_attribute?.length > 0 && (
            <div className="discoveries-blessing-attributes" style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '8px' }}>
              {b.blessing_attribute.map((attr, idx) => (
                <div key={idx} className="discoveries-attr-tag" style={{ fontSize: '0.85rem', color: '#ddd', background: 'rgba(255,255,255,0.05)', padding: '4px 10px', borderRadius: '6px', borderLeft: `3px solid ${getRarityColor(b.rarity?.rar_name)}` }}>
                  {attr.attribute?.attr_name}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </article>
  )

  const renderCollectibleCard = (col) => (
    <article
      key={col.cl_id}
      className="discoveries-element-card lowpoly-card"
      onClick={() => setSelectedCollectible({ collectible: col, obtention_date: col.date_obtained })}
      style={{ borderLeft: '5px solid #FFD700' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', padding: '1rem' }}>
        <CollectibleAvatar
          collectibleName={col.cl_name}
          className="discoveries-element-avatar"
          style={{ minWidth: '70px', height: '100px', marginRight: '1rem', backgroundSize: 'contain' }}
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
  )

  const renderMixedCard = (item) => {
    if (isCollectibleItem(item)) return renderCollectibleCard(item)
    return renderBlessingCard(item)
  }

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
    <>
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
                type="button"
                className={`filter-tab ${activeFilter === 'general' ? 'active' : ''}`}
                onClick={() => handleFilterChange('general')}
              >
                General
              </button>
              <button
                type="button"
                className={`filter-tab ${activeFilter === 'blessings' ? 'active' : ''}`}
                onClick={() => handleFilterChange('blessings')}
              >
                Blessings
              </button>
              {normalizedCollectibles.length > 0 && (
                <button
                  type="button"
                  className={`filter-tab ${activeFilter === 'collectibles' ? 'active' : ''}`}
                  onClick={() => handleFilterChange('collectibles')}
                >
                  Collectibles
                </button>
              )}
              <button
                type="button"
                className={`filter-tab ${activeFilter === 'categories' ? 'active' : ''}`}
                onClick={() => handleFilterChange('categories')}
              >
                Categories
              </button>
              <button
                type="button"
                className={`filter-tab ${activeFilter === 'rarities' ? 'active' : ''}`}
                onClick={() => handleFilterChange('rarities')}
              >
                Rarities
              </button>
              <button
                type="button"
                className={`filter-tab ${activeFilter === 'levels' ? 'active' : ''}`}
                onClick={() => handleFilterChange('levels')}
              >
                Levels
              </button>
              {isAdmin && (
                <button
                  type="button"
                  className={`filter-tab admin-tab ${activeFilter === 'admin' ? 'active' : ''}`}
                  onClick={() => handleFilterChange('admin')}
                  style={{ borderLeft: '2px solid #FFD700', color: '#FFD700' }}
                >
                  Admin
                </button>
              )}
            </div>
          </div>
        </div>

        <div key={activeFilter} className="discoveries-elements-grid">
        {activeFilter === 'general' ? (
          visibleGeneral.length > 0 ? (
            visibleGeneral.map((item) => renderMixedCard(item))
          ) : (
            <div className="no-results"><p>No discoveries found.</p></div>
          )
        ) : activeFilter === 'blessings' ? (
          blessingsLoading ? (
            <div className="no-results"><p>Loading blessings...</p></div>
          ) : blessingsError ? (
            <div className="no-results"><p>{blessingsError}</p></div>
          ) : visibleBlessings.length > 0 ? (
            visibleBlessings.map((b) => renderBlessingCard(b, { showAttributes: true }))
          ) : (
            <div className="no-results"><p>No blessings found.</p></div>
          )
        ) : activeFilter === 'collectibles' ? (
          collectiblesLoading ? (
            <div className="no-results"><p>Loading collectibles...</p></div>
          ) : collectiblesError ? (
            <div className="no-results"><p>{collectiblesError}</p></div>
          ) : visibleCollectibles.length > 0 ? (
            visibleCollectibles.map((col) => renderCollectibleCard(col))
          ) : (
            <div className="no-results"><p>No collectibles found.</p></div>
          )
        ) : activeFilter === 'categories' ? (
          allCategories.length > 0 ? (
            allCategories.map(cat => (
                <article 
                  key={cat.cat_id}
                  className="discoveries-element-card lowpoly-card level-discovery-card"
                  style={{ borderLeft: `5px solid #5BC0EB`, padding: '0', overflow: 'hidden' }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                    <div className="level-img-wrapper" style={{ width: '100%', height: '220px', overflow: 'hidden', position: 'relative' }}>
                      <div className="level-img-header" style={{ 
                        width: '100%', height: '100%',
                        backgroundImage: `url(/categories/${cat.cat_image || `${cat.cat_name}.png`})`, 
                        backgroundSize: 'cover', backgroundRepeat: 'no-repeat', backgroundPosition: 'center',
                        backgroundColor: 'rgba(0,0,0,0.3)'
                      }}>
                      </div>
                    </div>
                    <div className="discoveries-element-info" style={{ padding: '1.5rem', background: 'rgba(15, 26, 18, 0.95)' }}>
                      <div className="discoveries-element-title" style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#5BC0EB' }}>
                        {cat.cat_name}
                      </div>
                      <p style={{ fontSize: '0.95rem', color: '#ccc', margin: '12px 0 0', lineHeight: '1.5' }}>{cat.cat_description || 'Category description not available.'}</p>
                    </div>
                  </div>
                </article>
            ))
          ) : (
            <div className="no-results"><p>No categories found.</p></div>
          )
        ) : activeFilter === 'rarities' ? (
          allRarities.length > 0 ? (
            allRarities.map(rar => {
              const rarityColor = getRarityColor(rar.rar_name);
              return (
                <article 
                  key={rar.rar_id}
                  className="discoveries-element-card lowpoly-card level-discovery-card"
                  style={{ borderLeft: `5px solid ${rarityColor}`, padding: '0', overflow: 'hidden' }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                    <div className="level-img-wrapper" style={{ width: '100%', height: '220px', overflow: 'hidden', position: 'relative' }}>
                      <div className="level-img-header" style={{ 
                        width: '100%', height: '100%',
                        backgroundImage: `url(/rarityimages/${rar.rar_card_image || `${rar.rar_name.toLowerCase()}_rar.png`})`, 
                        backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundPosition: 'center',
                        backgroundColor: 'rgba(0,0,0,0.3)'
                      }}>
                      </div>
                    </div>
                    <div className="discoveries-element-info" style={{ padding: '1.5rem', background: 'rgba(15, 26, 18, 0.95)' }}>
                      <div className="discoveries-element-title" style={{ fontSize: '1.8rem', fontWeight: 'bold', color: rarityColor }}>
                        {rar.rar_name}
                      </div>
                      <p style={{ fontSize: '0.95rem', color: '#ccc', margin: '12px 0 0', lineHeight: '1.5' }}>{rar.rar_description || 'Rarity description not available.'}</p>
                    </div>
                  </div>
                </article>
              );
            })
          ) : (
            <div className="no-results"><p>No rarities found.</p></div>
          )
        ) : activeFilter === 'admin' && isAdmin ? (
          visibleAdminBlessings.length > 0 ? (
            visibleAdminBlessings.map(b => (
                <article 
                  key={b.bl_id}
                  className="discoveries-element-card lowpoly-card admin-card"
                  onClick={() => setSelectedBlessing(b)}
                  style={{ borderLeft: `5px solid #FFD700`, background: 'rgba(255, 215, 0, 0.05)' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', padding: '1rem' }}>
                    <AdminBlessingAvatar 
                      blessing={b} 
                      className="discoveries-element-avatar"
                      style={{ 
                        minWidth: '70px',
                        height: '100px',
                        marginRight: '1rem'
                      }}
                    />

                    <div className="discoveries-element-info" style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div className="discoveries-element-title" style={{ fontSize: '1.6rem', fontWeight: 'bold', color: '#FFD700' }}>
                          {b.bl_name}
                        </div>
                        <span style={{ fontSize: '0.8rem', background: 'rgba(255,215,0,0.2)', padding: '2px 8px', borderRadius: '4px', color: '#FFD700', fontWeight: 'bold' }}>
                          ADMIN
                        </span>
                      </div>

                      <p className="discoveries-blessing-category" style={{ margin: '4px 0', opacity: 0.9, fontSize: '0.85rem', color: '#FFD700', fontWeight: 700 }}>
                        {b.category?.cat_name || 'Admin Utility'}
                      </p>

                      <p style={{ fontSize: '0.9rem', color: '#bbb', margin: '4px 0' }}>
                        {b.bl_description}
                      </p>
                    </div>
                  </div>
                </article>
              ))
          ) : (
            <div className="no-results"><p>No admin tools found.</p></div>
          )
        ) : activeFilter === 'levels' ? (
          allLevels.filter(lv => lv.lv_id <= playerLevel).length > 0 ? (
            allLevels.filter(lv => lv.lv_id <= playerLevel).map(lv => (
                <article 
                  key={lv.lv_id}
                  className="discoveries-element-card lowpoly-card level-discovery-card"
                  style={{ borderLeft: `5px solid #81D89E`, padding: '0', overflow: 'hidden' }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                    <div className="level-img-wrapper" style={{ width: '100%', height: '220px', overflow: 'hidden', position: 'relative' }}>
                      <div className="level-img-header" style={{ 
                        width: '100%', height: '100%',
                        backgroundImage: `url(${lv.lv_id === 0 ? '/levelimg/DownloadimgTuturial.png' : `/levelimg/level_${lv.lv_id}.png`})`, 
                        backgroundSize: 'cover', backgroundRepeat: 'no-repeat', backgroundPosition: 'center',
                        backgroundColor: 'rgba(0,0,0,0.3)'
                      }}>
                        {!lv.lv_id === 0 && ![`level_0.png`, `level_1.png`, `level_3.png`].includes(`level_${lv.lv_id}.png`) && (
                           <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '0.8rem', color: '#666', background: 'rgba(0,0,0,0.6)' }}>
                              Preview Unavailable
                           </div>
                        )}
                      </div>
                    </div>
                    <div className="discoveries-element-info" style={{ padding: '1.5rem', background: 'rgba(15, 26, 18, 0.95)' }}>
                      <div className="discoveries-element-title" style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#81D89E' }}>
                        {lv.lv_name}
                      </div>
                      <p className="discoveries-blessing-category" style={{ margin: '4px 0', opacity: 0.9, fontSize: '0.9rem', color: '#81D89E', fontWeight: 700 }}>
                        {lv.lv_id === 0 ? 'Tutorial' : `Level ${lv.lv_id}`} {lv.lv_id === playerLevel ? '(Current Exploration)' : '(Region Restored)'}
                      </p>
                      <p style={{ fontSize: '0.95rem', color: '#ccc', margin: '12px 0 0', lineHeight: '1.5' }}>{lv.lv_description || 'Explore the world to uncover more details about this region.'}</p>
                    </div>
                  </div>
                </article>
              ))
          ) : (
            <div className="no-results"><p>Continue your journey to unlock more regions.</p></div>
          )
        ) : (
          <div className="no-results"><p>Coming soon.</p></div>
        )}
        </div>
      </div>
    </main>

      {/* Modal Overlay for Selected Collectible */}
      {selectedCollectible && createPortal(
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
        </div>,
        document.body
      )}

      {/* Modal Overlay for Selected Blessing */}
      {selectedBlessing && createPortal(
        <div className="discoveries-modal-overlay" onClick={() => setSelectedBlessing(null)}>
          <div className="discoveries-modal" onClick={(e) => e.stopPropagation()}>
            <button className="discoveries-close-btn" onClick={() => setSelectedBlessing(null)}>
              &times;
            </button>
            
            <div className="discoveries-modal-header">
              {selectedBlessing.isAdminOnly ? (
                <AdminBlessingAvatar 
                  blessing={selectedBlessing} 
                  className="discoveries-modal-avatar"
                  style={{
                    backgroundSize: 'contain'
                  }}
                />
              ) : (
                <BlessingAvatar 
                  blessing={selectedBlessing} 
                  className="discoveries-modal-avatar"
                  style={{
                    backgroundSize: 'contain'
                  }}
                />
              )}
              <div>
                <h2 className="discoveries-modal-title" style={{ color: getRarityColor(selectedBlessing.rarity?.rar_name), textShadow: `0 0 15px ${getRarityColor(selectedBlessing.rarity?.rar_name)}44` }}>
                  {selectedBlessing.bl_name}
                </h2>
                <div className="discoveries-read-attribute" style={{ marginTop: '0.75rem', marginBottom: 0 }}>
                  <span style={{ color: getRarityColor(selectedBlessing.rarity?.rar_name), fontWeight: 700 }}>{selectedBlessing.isAdminOnly ? 'Type:' : 'Category:'}</span> {selectedBlessing.category?.cat_name || 'Unknown'}
                  {!selectedBlessing.isTutorial && (
                    <>
                      {' '} | <span style={{ color: getRarityColor(selectedBlessing.rarity?.rar_name), fontWeight: 700 }}>Rarity:</span> <span style={{ color: getRarityColor(selectedBlessing.rarity?.rar_name), textShadow: '0 0 8px rgba(0,0,0,0.5)' }}>{selectedBlessing.rarity?.rar_name || 'Unknown'}</span>
                    </>
                  )}
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
              {!selectedBlessing.isAdminOnly && !selectedBlessing.isTutorial && (
                <div className="discoveries-read-date" style={{fontSize: '0.9rem', color: '#888'}}>
                  <span style={{color: '#81D89E', fontWeight: 800}}>Obtained on:</span> {selectedBlessing.date_obtained || 'Unknown'}
                </div>
              )}
              {selectedBlessing.isAdminOnly && (
                <div className="discoveries-read-date" style={{fontSize: '0.8rem', color: '#FFD700', opacity: 0.8}}>
                  * This is an administrative tool. Use with caution.
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}

export default Discoveries
