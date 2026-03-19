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
          .from('bencao')
          .select(`
            be_cod, be_nome, be_imagem, be_descricao, be_rariedade, 
            categorias(ca_nome),
            bencao_atributos(
              atributo_valor, 
              atributos!fk_bencao_atributos_at(at_designacao)
            )
          `)
          .order('be_cod', { ascending: true })

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
    if (r.includes('comum') && !r.includes('incomum')) return '#a9d3ff' // Azul claro
    if (r.includes('incomum')) return '#81D89E' // Verde
    if (r.includes('raro')) return '#4da6ff' // Azul
    if (r.includes('épico') || r.includes('epico')) return '#b388ff' // Roxo
    if (r.includes('lendário') || r.includes('lendario')) return '#ffd700' // Dourado
    return '#ccc'
  }

  const getAttributeText = (blessing) => {
    const attrRows = blessing?.bencao_atributos || []
    if (attrRows.length > 0) {
      const best = attrRows[0]
      const designation = best.atributos?.at_designacao
      const value = best.atributo_valor
      if (designation && value) return `${designation}: ${value}`
      if (designation) return String(designation)
      if (value) return String(value)
    }
    // Fallback based on name
    if (blessing.be_nome?.toLowerCase().includes('salto')) return '+1 salto para o jogador enquanto está no ar'
    return 'Sem atributo definido'
  }

  const visibleBlessings = useMemo(() => {
    if (!blessings) return []
    let filtered = blessings
    if (searchTerm) {
      const q = searchTerm.toLowerCase()
      filtered = filtered.filter(b => 
        (b.be_nome || '').toLowerCase().includes(q) || 
        (b.be_descricao || '').toLowerCase().includes(q)
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

        {/* READ-ONLY: start with Blessings (Double Jump) */}
        {activeFilter !== 'blessings' ? (
          <div className="no-results">
            <p>Coming soon.</p>
          </div>
        ) : blessingsLoading ? (
          <div className="no-results"><p>Loading blessing...</p></div>
        ) : blessingsError ? (
          <div className="no-results"><p>{blessingsError}</p></div>
        ) : visibleBlessings.length > 0 ? (
          <div className="wiki-elements-grid">
            {visibleBlessings.map(b => (
              <article 
                key={b.be_cod}
                className="wiki-element-card lowpoly-card"
                onClick={() => setSelectedBlessing(b)}
              >
                <div className="wiki-element-card-inner">
                  <div 
                    className="wiki-element-avatar"
                    style={{ backgroundImage: b.be_imagem ? `url("/blessingscardmodels/${b.be_imagem}")` : 'none' }}
                  ></div>
                  <div className="wiki-element-meta">
                    <div className="wiki-element-title">{b.be_nome}</div>
                    <div className="wiki-element-subtitle">{getAttributeText(b)}</div>
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
                  backgroundImage: selectedBlessing.be_imagem ? `url("/blessingscardmodels/${selectedBlessing.be_imagem}")` : 'none',
                  backgroundSize: 'cover', 
                  backgroundPosition: 'center' 
                }}
              ></div>
              <div>
                <h2 className="wiki-modal-title" style={{color: '#a9d3ff'}}>{selectedBlessing.be_nome}</h2>
                <div className="wiki-read-attribute" style={{marginTop: '0.75rem', marginBottom: 0}}>
                  <span>Categoria:</span> {selectedBlessing.categorias?.ca_nome || 'Desconhecida'} | <span>Raridade:</span> <span style={{ color: getRarityColor(selectedBlessing.be_rariedade), textShadow: '0 0 8px rgba(0,0,0,0.5)' }}>{selectedBlessing.be_rariedade || 'Desconhecida'}</span>
                </div>
              </div>
            </div>

            <div className="wiki-modal-body" style={{marginTop: '1.5rem'}}>
              <div className="wiki-read-attribute">
                <span>Efeito:</span> {getAttributeText(selectedBlessing)}
              </div>
              <div className="wiki-read-description" style={{marginTop: '1.25rem', marginBottom: '1.5rem', color: '#ccc', fontSize: '1rem', lineHeight: '1.7'}}>
                {selectedBlessing.be_descricao || '—'}
              </div>
              <div className="wiki-read-date" style={{fontSize: '0.9rem', color: '#888'}}>
                <span style={{color: '#81D89E', fontWeight: 800}}>Data de Adição:</span> {new Date().toISOString().split('T')[0]}
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

export default Wiki

