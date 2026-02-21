import { useState, useEffect } from 'react'

const INITIAL_WIKI_ITEMS = []

function Wiki() {
  const [searchTerm, setSearchTerm] = useState('')
  const [activeFilter, setActiveFilter] = useState('all')
  const [wikiItems] = useState(INITIAL_WIKI_ITEMS)

  const filteredItems = wikiItems.filter(item => {
    const matchesSearch = searchTerm === '' || 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesFilter = activeFilter === 'all' || item.type === activeFilter
    return matchesSearch && matchesFilter
  })

  return (
    <main className="wiki-main" style={{ paddingTop: '100px' }}>
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
                placeholder="Search for Blessings, Items, or Mechanics..."
                autoComplete="off"
              />
            </div>
            <div className="filter-tabs">
              <button
                className={`filter-tab ${activeFilter === 'all' ? 'active' : ''}`}
                onClick={() => setActiveFilter('all')}
              >
                All
              </button>
              <button
                className={`filter-tab ${activeFilter === 'blessing' ? 'active' : ''}`}
                onClick={() => setActiveFilter('blessing')}
              >
                Blessings
              </button>
              <button
                className={`filter-tab ${activeFilter === 'ghost' ? 'active' : ''}`}
                onClick={() => setActiveFilter('ghost')}
              >
                Ghosts
              </button>
              <button
                className={`filter-tab ${activeFilter === 'mechanic' ? 'active' : ''}`}
                onClick={() => setActiveFilter('mechanic')}
              >
                Mechanics
              </button>
              <button
                className={`filter-tab ${activeFilter === 'event' ? 'active' : ''}`}
                onClick={() => setActiveFilter('event')}
              >
                Event Items
              </button>
            </div>
          </div>
        </div>

        {/* Results Grid */}
        {filteredItems.length > 0 ? (
          <div className="wiki-grid">
            {filteredItems.map(item => (
              <div key={item.id} className="wiki-item lowpoly-card" data-type={item.type} data-name={item.name}>
                <div className="item-header">
                  <div className="item-header-left">
                    {item.image && (
                      <img src={item.image} alt={item.name} className="item-image" />
                    )}
                    <h3 className="item-name">{item.name}</h3>
                  </div>
                  {item.rarity && (
                    <span className={`item-rarity ${item.rarity}`}>
                      {item.rarity.charAt(0).toUpperCase() + item.rarity.slice(1)}
                    </span>
                  )}
                </div>
                <div className="item-content">
                  {item.description && (
                    <p className="item-description">{item.description}</p>
                  )}
                  {item.info && (
                    <div className="item-info">
                      {Object.entries(item.info).map(([key, value]) => (
                        <div key={key} className="info-row">
                          <strong>{key}:</strong> {value}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-results">
            <p>
              {searchTerm || activeFilter !== 'all'
                ? 'No results found. Try a different search term.'
                : 'No wiki entries yet. Check back soon for Blessings, items, and game mechanics!'}
            </p>
          </div>
        )}
      </div>
    </main>
  )
}

export default Wiki

