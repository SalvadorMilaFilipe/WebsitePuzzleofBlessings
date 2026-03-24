import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'

function Wiki() {
  const [searchTerm, setSearchTerm] = useState('')
  const [activeFilter, setActiveFilter] = useState('blessings')
  const [blessings, setBlessings] = useState([])
  const [blessingsLoading, setBlessingsLoading] = useState(false)
  const [blessingsError, setBlessingsError] = useState('')
  const [selectedBlessing, setSelectedBlessing] = useState(null)

  useEffect(() => {
    const fetchBlessings = async () => {
      try {
        setBlessingsLoading(true)
        setBlessingsError('')

        const { data, error } = await supabase
          .from('blessing') // Singular
          .select(`
          *,
          category:category ( cat_name ),
          blessing_attribute:blessing_attribute!fk_blessing_attr_blessing (
            attribute:attribute!fk_blessing_attr_attribute ( attr_name )
          )
        `)
          .order('bl_id', { ascending: true })

        if (error) throw error
        setBlessings(data || [])
      } catch (err) {
        setBlessingsError(err?.message || 'Failed to load blessings')
      } finally {
        setBlessingsLoading(false)
      }
    }

    fetchBlessings()
  }, [])

  const getRarityColor = (rarity) => {
    if (!rarity) return '#ccc'
    const r = rarity.toLowerCase()
    if (r.includes('common') && !r.includes('uncommon')) return '#a9d3ff' // Light Blue
    if (r.includes('uncommon')) return '#81D89E' // Green
    if (r.includes('rare')) return '#4da6ff' // Blue
    if (r.includes('epic')) return '#b388ff' // Purple
    if (r.includes('legendary')) return '#ffd700' // Gold
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

  return (
    <main className="wiki-main">
      <div className="container">
        <h1 className="section-title">Wiki</h1>

        {/* Search Bar */}
        <div className="search-section">
          <div className="search-container lowpoly-card">
            <div className="search-box">
              <input
                type="text"
                id="wiki-search"
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
          <div className="wiki-elements-grid">
            {visibleBlessings.map(b => (
              <article 
                key={b.bl_id}
                className="wiki-element-card lowpoly-card"
                onClick={() => setSelectedBlessing(b)}
              >
                <div style={{ display: 'flex', alignItems: 'center', padding: '1rem' }}>
                  <div
                    className="wiki-element-avatar"
                    style={{ 
                      backgroundImage: b.bl_image ? `url("/blessingscardmodels/${b.bl_image}")` : 'none',
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

                  <div className="wiki-element-info" style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div className="wiki-element-title" style={{ fontSize: '1.6rem', fontWeight: 'bold' }}>
                        {b.bl_name}
                      </div>
                      <span style={{ fontSize: '0.8rem', background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '4px', color: '#888' }}>
                        #{b.bl_id}
                      </span>
                    </div>

                    <p className="wiki-blessing-category" style={{ margin: '4px 0', opacity: 0.8, fontSize: '0.85rem', color: '#81D89E' }}>
                      {b.category?.cat_name || 'Blessing'}
                    </p>

                    <p style={{ fontSize: '0.9rem', color: '#bbb', margin: '4px 0', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {b.bl_description}
                    </p>

                    <div className="wiki-blessing-attributes" style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '8px' }}>
                      {b.blessing_attribute?.map((attr, idx) => (
                        <div key={idx} className="wiki-attr-tag" style={{ fontSize: '0.85rem', color: '#ccc', background: 'rgba(255,255,255,0.05)', padding: '4px 10px', borderRadius: '6px', borderLeft: '3px solid #81D89E' }}>
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
        <div className="wiki-modal-overlay" onClick={() => setSelectedBlessing(null)}>
          <div className="wiki-modal" onClick={(e) => e.stopPropagation()}>
            <button className="wiki-close-btn" onClick={() => setSelectedBlessing(null)}>
              &times;
            </button>
            
            <div className="wiki-modal-header">
              <div 
                className="wiki-modal-avatar"
                style={{ 
                  backgroundImage: selectedBlessing.bl_image ? `url("/blessingscardmodels/${selectedBlessing.bl_image}")` : 'none',
                  backgroundSize: 'cover', 
                  backgroundPosition: 'center' 
                }}
              ></div>
              <div>
                <h2 className="wiki-modal-title" style={{color: '#a9d3ff'}}>{selectedBlessing.bl_name}</h2>
                <div className="wiki-read-attribute" style={{marginTop: '0.75rem', marginBottom: 0}}>
                  <span>Category:</span> {selectedBlessing.categories?.cat_name || 'Unknown'} | <span>Rarity:</span> <span style={{ color: getRarityColor(selectedBlessing.bl_rarity), textShadow: '0 0 8px rgba(0,0,0,0.5)' }}>{selectedBlessing.bl_rarity || 'Unknown'}</span>
                </div>
              </div>
            </div>

            <div className="wiki-modal-body" style={{marginTop: '1.5rem'}}>
              <div className="wiki-blessing-attributes">
                {selectedBlessing.blessing_attribute?.map((attr, idx) => (
                  <div key={idx} style={{ padding: '0.8rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', borderLeft: '4px solid #81D89E', marginBottom: '1rem', fontStyle: 'italic', color: '#81D89E' }}>
                    {attr.attribute?.attr_name}
                  </div>
                ))}
              </div>
              <div className="wiki-read-description" style={{marginTop: '1.25rem', marginBottom: '1.5rem', color: '#ccc', fontSize: '1rem', lineHeight: '1.7'}}>
                {selectedBlessing.bl_description || '—'}
              </div>
              <div className="wiki-read-date" style={{fontSize: '0.9rem', color: '#888'}}>
                <span style={{color: '#81D89E', fontWeight: 800}}>Date Added:</span> {new Date().toISOString().split('T')[0]}
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

export default Wiki
