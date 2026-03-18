import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'

function Wiki() {
  const [searchTerm, setSearchTerm] = useState('')
  const [activeFilter, setActiveFilter] = useState('blessings')
  const [doubleJump, setDoubleJump] = useState(null)
  const [doubleJumpAttr, setDoubleJumpAttr] = useState(null)
  const [blessingsLoading, setBlessingsLoading] = useState(false)
  const [blessingsError, setBlessingsError] = useState('')

  useEffect(() => {
    const fetchDoubleJump = async () => {
      try {
        setBlessingsLoading(true)
        setBlessingsError('')

        const { data, error } = await supabase
          .from('bencao')
          .select('be_cod, be_nome, be_imagem, be_descricao')
          .ilike('be_nome', '%duplo%salto%')
          .order('be_cod', { ascending: true })
          .limit(1)

        if (error) throw error
        const blessing = (data && data[0]) ? data[0] : null
        setDoubleJump(blessing)

        if (blessing?.be_cod) {
          const { data: attrsData, error: attrsError } = await supabase
            .from('bencao_atributos')
            .select('atributo_valor, atributos(at_designacao)')
            .eq('be_cod', blessing.be_cod)
            .order('jo_cod', { ascending: true })
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
          <div className="wiki-read-grid">
            <article className="wiki-read-card lowpoly-card">
              <div className="wiki-read-avatar">
                {visibleBlessing.be_imagem ? (
                  <img
                    src={`/blessingscardmodels/${visibleBlessing.be_imagem}`}
                    alt={visibleBlessing.be_nome}
                    className="wiki-read-avatar-img"
                    onError={(e) => { e.currentTarget.style.display = 'none' }}
                  />
                ) : null}
              </div>

              <div className="wiki-read-body">
                <div className="wiki-read-title">{visibleBlessing.be_nome}</div>
                <div className="wiki-read-attribute">
                  {visibleAttributeText}
                </div>
                <div className="wiki-read-description">
                  {visibleBlessing.be_descricao || '—'}
                </div>
                <div className="wiki-read-date">
                  <span>Data de Adição:</span> {today}
                </div>
              </div>
            </article>
          </div>
        ) : (
          <div className="no-results"><p>No results found.</p></div>
        )}
      </div>
    </main>
  )
}

export default Wiki

