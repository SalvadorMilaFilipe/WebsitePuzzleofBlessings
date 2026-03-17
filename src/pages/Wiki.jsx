import { useMemo, useState } from 'react'

const WIKI_ELEMENTS = [
  {
    id: 'blessings',
    title: 'Blessings',
    subtitle: 'Name, attribute, description, date',
    modalType: 'blessing',
  },
  {
    id: 'rarities',
    title: 'Rarities',
    subtitle: 'Name, description, date',
    modalType: 'simple',
  },
  {
    id: 'categories',
    title: 'Categories',
    subtitle: 'Name, description, date',
    modalType: 'simple',
  },
]

function Wiki() {
  const [searchTerm, setSearchTerm] = useState('')
  const [activeFilter, setActiveFilter] = useState('all')
  const [selectedElement, setSelectedElement] = useState(null)

  const visibleElements = useMemo(() => {
    const byFilter = activeFilter === 'all'
      ? WIKI_ELEMENTS
      : WIKI_ELEMENTS.filter((el) => el.id === activeFilter)

    if (!searchTerm) return byFilter

    const q = searchTerm.toLowerCase()
    return byFilter.filter((el) => {
      return (
        el.title.toLowerCase().includes(q) ||
        (el.subtitle && el.subtitle.toLowerCase().includes(q))
      )
    })
  }, [activeFilter, searchTerm])

  const closeModal = () => setSelectedElement(null)

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
                className={`filter-tab ${activeFilter === 'all' ? 'active' : ''}`}
                onClick={() => setActiveFilter('all')}
              >
                All
              </button>
              <button
                className={`filter-tab ${activeFilter === 'blessings' ? 'active' : ''}`}
                onClick={() => setActiveFilter('blessings')}
              >
                Blessings
              </button>
              <button
                className={`filter-tab ${activeFilter === 'rarities' ? 'active' : ''}`}
                onClick={() => setActiveFilter('rarities')}
              >
                Rarities
              </button>
              <button
                className={`filter-tab ${activeFilter === 'categories' ? 'active' : ''}`}
                onClick={() => setActiveFilter('categories')}
              >
                Categories
              </button>
            </div>
          </div>
        </div>

        {/* Elements Grid (2 per row) */}
        {visibleElements.length > 0 ? (
          <div className="wiki-elements-grid">
            {visibleElements.map((el) => (
              <button
                key={el.id}
                type="button"
                className="wiki-element-card lowpoly-card"
                onClick={() => setSelectedElement(el)}
              >
                <div className="wiki-element-card-inner">
                  <div className="wiki-element-avatar" aria-hidden="true"></div>
                  <div className="wiki-element-meta">
                    <div className="wiki-element-title">{el.title}</div>
                    <div className="wiki-element-subtitle">{el.subtitle}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="no-results">
            <p>
              No results found. Try a different search term.
            </p>
          </div>
        )}
      </div>

      {/* Modal (blurred background, no redirect) */}
      {selectedElement && (
        <div className="wiki-modal-overlay" onClick={closeModal} role="dialog" aria-modal="true">
          <div className="wiki-modal" onClick={(e) => e.stopPropagation()}>
            <button className="wiki-close-btn" onClick={closeModal} aria-label="Close">
              ×
            </button>

            <div className="wiki-modal-header">
              <div className="wiki-modal-avatar" aria-hidden="true"></div>
              <div className="wiki-modal-header-text">
                <h2 className="wiki-modal-title">{selectedElement.title}</h2>
                <p className="wiki-modal-subtitle">Fill in the fields below.</p>
              </div>
            </div>

            <form className="wiki-modal-form" onSubmit={(e) => e.preventDefault()}>
              <div className="wiki-form-grid">
                <div className="wiki-form-group">
                  <label>Image</label>
                  <input type="url" placeholder="Image URL (optional)" />
                </div>

                <div className="wiki-form-group">
                  <label>Name</label>
                  <input type="text" placeholder={`Name of the ${selectedElement.id.slice(0, -1)}`} />
                </div>

                {selectedElement.modalType === 'blessing' && (
                  <div className="wiki-form-group wiki-form-group-full">
                    <label>Attribute</label>
                    <input type="text" placeholder="Ex: +1 sorte" />
                  </div>
                )}

                <div className="wiki-form-group wiki-form-group-full">
                  <label>Description</label>
                  <textarea rows={4} placeholder="Write a short description..." />
                </div>

                <div className="wiki-form-group">
                  <label>Date Added</label>
                  <input type="date" />
                </div>
              </div>

              <div className="wiki-modal-actions">
                <button type="button" className="wiki-btn-secondary" onClick={closeModal}>
                  Close
                </button>
                <button type="button" className="wiki-btn-primary" disabled>
                  Save (soon)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  )
}

export default Wiki

