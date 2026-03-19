import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'

function Wiki() {
  const [searchTerm, setSearchTerm] = useState('')
  const [activeFilter, setActiveFilter] = useState('blessings')
  const [doubleJump, setDoubleJump] = useState(null)
  const [doubleJumpAttr, setDoubleJumpAttr] = useState(null)
  const [blessingsLoading, setBlessingsLoading] = useState(false)
  const [blessingsError, setBlessingsError] = useState('')
  const [selectedBlessing, setSelectedBlessing] = useState(null)

  useEffect(() => {
    const fetchDoubleJump = async () => {
      try {
        setBlessingsLoading(true)
        setBlessingsError('')

        const { data, error } = await supabase
          .from('bencao')
          .select('be_cod, be_nome, be_imagem, be_descricao, be_rariedade, categorias(ca_nome)')
          .ilike('be_nome', '%salto%duplo%')
          .order('be_cod', { ascending: true })
          .limit(1)

        if (error) throw error
        const blessing = (data && data[0]) ? data[0] : null
        setDoubleJump(blessing)

        if (blessing?.be_cod) {
          const { data: attrsData, error: attrsError } = await supabase
            .from('bencao_atributos')
            .select('atributo_valor, atributos!fk_bencao_atributos_at(at_designacao)')
            .eq('be_cod', blessing.be_cod)
            .limit(1)

          if (attrsError) throw attrsError
          setDoubleJumpAttr((attrsData && attrsData[0]) ? attrsData[0] : null)
        } else {
          setDoubleJumpAttr(null)
        }
      } catch (err) {
        setBlessingsError(err?.message || 'Failed to load blessing')
        setDoubleJump(null)
        setDoubleJumpAttr(null)
      } finally {
        setBlessingsLoading(false)
      }
    }

    fetchDoubleJump()
  }, [])

  const today = useMemo(() => {
    const d = new Date()
    const yyyy = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd}`
  }, [])

  const visibleBlessing = useMemo(() => {
    if (!doubleJump) return null
    if (!searchTerm) return doubleJump
    const q = searchTerm.toLowerCase()
    const name = (doubleJump.be_nome || '').toLowerCase()
    const desc = (doubleJump.be_descricao || '').toLowerCase()
    return (name.includes(q) || desc.includes(q)) ? doubleJump : null
  }, [doubleJump, searchTerm])

  const visibleAttributeText = useMemo(() => {
    const designation = doubleJumpAttr?.atributos?.at_designacao
    const value = doubleJumpAttr?.atributo_valor

    if (designation && value) return `${designation}: ${value}`
    if (designation) return String(designation)
    if (value) return String(value)

    // Fallback (until DB is fully populated)
    return '+1 salto para o jogador enquanto está no ar'
  }, [doubleJumpAttr])

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

        {/* READ-ONLY: start with Blessings (Double Jump) */}
        {activeFilter !== 'blessings' ? (
          <div className="no-results">
            <p>Coming soon.</p>
          </div>
        ) : blessingsLoading ? (
          <div className="no-results"><p>Loading blessing...</p></div>
        ) : blessingsError ? (
          <div className="no-results"><p>{blessingsError}</p></div>
        ) : visibleBlessing ? (
          <div className="wiki-elements-grid">
            <article 
              className="wiki-element-card lowpoly-card"
              onClick={() => setSelectedBlessing(visibleBlessing)}
            >
              <div className="wiki-element-card-inner">
                <div 
                  className="wiki-element-avatar"
                  style={{ backgroundImage: visibleBlessing.be_imagem ? `url("/blessingscardmodels/${visibleBlessing.be_imagem}")` : 'none' }}
                ></div>
                <div className="wiki-element-meta">
                  <div className="wiki-element-title">{visibleBlessing.be_nome}</div>
                  <div className="wiki-element-subtitle">{visibleAttributeText}</div>
                </div>
              </div>
            </article>
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
                  backgroundImage: selectedBlessing.be_imagem ? `url("/blessingscardmodels/${selectedBlessing.be_imagem}")` : 'none',
                  backgroundSize: 'cover', 
                  backgroundPosition: 'center' 
                }}
              ></div>
              <div>
                <h2 className="wiki-modal-title" style={{color: '#a9d3ff'}}>{selectedBlessing.be_nome}</h2>
                <div className="wiki-read-attribute" style={{marginTop: '0.75rem', marginBottom: 0}}>
                  <span>Categoria:</span> {selectedBlessing.categorias?.ca_nome || 'Desconhecida'} | <span>Raridade:</span> {selectedBlessing.be_rariedade || 'Desconhecida'}
                </div>
              </div>
            </div>

            <div className="wiki-modal-body" style={{marginTop: '1.5rem'}}>
              <div className="wiki-read-attribute">
                <span>Efeito:</span> {visibleAttributeText}
              </div>
              <div className="wiki-read-description" style={{marginTop: '1.25rem', marginBottom: '1.5rem', color: '#ccc', fontSize: '1rem', lineHeight: '1.7'}}>
                {selectedBlessing.be_descricao || '—'}
              </div>
              <div className="wiki-read-date" style={{fontSize: '0.9rem', color: '#888'}}>
                <span style={{color: '#81D89E', fontWeight: 800}}>Data de Adição:</span> {today}
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

export default Wiki

