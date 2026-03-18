import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'

const WIKI_ELEMENTS = [
  {
    id: 'blessings',
    title: 'Blessings',
    subtitle: 'Name, attribute, description, date',
    modalType: 'blessing',
  },
  {
    id: 'categories',
    title: 'Categories',
    subtitle: 'Name, description, date',
    modalType: 'simple',
  },
  {
    id: 'rarities',
    title: 'Rarities',
    subtitle: 'Name, description, date',
    modalType: 'simple',
  },
  {
    id: 'levels',
    title: 'Levels',
    subtitle: 'Name, description, date',
    modalType: 'simple',
  },
]

function Wiki() {
  const [searchTerm, setSearchTerm] = useState('')
  const [activeFilter, setActiveFilter] = useState('all')
  const [selectedElement, setSelectedElement] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [categories, setCategories] = useState([])
  const [categoriesLoading, setCategoriesLoading] = useState(false)
  const [categoriesError, setCategoriesError] = useState('')

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true)
        setCategoriesError('')

        const { data, error } = await supabase
          .from('categorias')
          .select('*')
          .order('ca_cod', { ascending: true })

        if (error) throw error
        setCategories(data || [])
      } catch (err) {
        setCategoriesError(err?.message || 'Failed to load categories')
        setCategories([])
      } finally {
        setCategoriesLoading(false)
      }
    }

    fetchCategories()
  }, [])

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
  const closeCategoryModal = () => setSelectedCategory(null)

  const normalizedCategories = useMemo(() => {
    return (categories || []).map((c) => {
      const name = c?.ca_nome ?? c?.name ?? c?.nome ?? 'Unnamed'
      const description = c?.ca_descricao ?? c?.ca_desc ?? c?.description ?? c?.descricao ?? ''
      const image = c?.ca_imagem ?? c?.ca_img ?? c?.image ?? c?.imagem ?? ''
      const date = c?.ca_data ?? c?.created_at ?? c?.data ?? ''
      const isSafeImageUrl = typeof image === 'string' && /^(https?:\/\/|data:)/i.test(image.trim())
      return {
        raw: c,
        key: c?.ca_cod ?? c?.id ?? name,
        name,
        description,
        image: isSafeImageUrl ? image.trim() : '',
        date,
      }
    })
  }, [categories])

  const visibleCategories = useMemo(() => {
    if (!searchTerm) return normalizedCategories
    const q = searchTerm.toLowerCase()
    return normalizedCategories.filter((c) => {
      return (
        c.name.toLowerCase().includes(q) ||
        (c.description && c.description.toLowerCase().includes(q))
      )
    })
  }, [normalizedCategories, searchTerm])

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

        {/* Categories (from DB) - shown in "All" and in "Categories" */}
        {activeFilter === 'all' ? (
          <>
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
              <div className="no-results"><p>No results found. Try a different search term.</p></div>
            )}

            <div className="wiki-section-divider"></div>
            <h2 className="wiki-subsection-title">Categories</h2>

            {categoriesLoading ? (
              <div className="no-results"><p>Loading categories...</p></div>
            ) : categoriesError ? (
              <div className="no-results"><p>{categoriesError}</p></div>
            ) : visibleCategories.length > 0 ? (
              <div className="wiki-elements-grid">
                {visibleCategories.map((c) => (
                  <button
                    key={c.key}
                    type="button"
                    className="wiki-element-card lowpoly-card"
                    onClick={() => setSelectedCategory(c)}
                    title={c.name}
                  >
                    <div className="wiki-element-card-inner">
                      <div
                        className="wiki-element-avatar"
                        aria-hidden="true"
                        style={c.image ? { backgroundImage: `url(${c.image})` } : undefined}
                      ></div>
                      <div className="wiki-element-meta">
                        <div className="wiki-element-title">{c.name}</div>
                        <div className="wiki-element-subtitle">{c.description || 'No description yet.'}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="no-results"><p>No categories found.</p></div>
            )}
          </>
        ) : activeFilter === 'categories' ? (
          categoriesLoading ? (
            <div className="no-results"><p>Loading categories...</p></div>
          ) : categoriesError ? (
            <div className="no-results"><p>{categoriesError}</p></div>
          ) : visibleCategories.length > 0 ? (
            <div className="wiki-elements-grid">
              {visibleCategories.map((c) => (
                <button
                  key={c.key}
                  type="button"
                  className="wiki-element-card lowpoly-card"
                  onClick={() => setSelectedCategory(c)}
                  title={c.name}
                >
                  <div className="wiki-element-card-inner">
                    <div
                      className="wiki-element-avatar"
                      aria-hidden="true"
                      style={c.image ? { backgroundImage: `url(${c.image})` } : undefined}
                    ></div>
                    <div className="wiki-element-meta">
                      <div className="wiki-element-title">{c.name}</div>
                      <div className="wiki-element-subtitle">{c.description || 'No description yet.'}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="no-results"><p>No categories found.</p></div>
          )
        ) : (
          /* Other filters (placeholder for future) */
          <div className="no-results">
            <p>Coming soon.</p>
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

      {/* Category Modal (data from DB) */}
      {selectedCategory && (
        <div className="wiki-modal-overlay" onClick={closeCategoryModal} role="dialog" aria-modal="true">
          <div className="wiki-modal" onClick={(e) => e.stopPropagation()}>
            <button className="wiki-close-btn" onClick={closeCategoryModal} aria-label="Close">
              ×
            </button>

            <div className="wiki-modal-header">
              <div
                className="wiki-modal-avatar"
                aria-hidden="true"
                style={selectedCategory.image ? { backgroundImage: `url(${selectedCategory.image})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
              ></div>
              <div className="wiki-modal-header-text">
                <h2 className="wiki-modal-title">{selectedCategory.name}</h2>
                <p className="wiki-modal-subtitle">Category details.</p>
              </div>
            </div>

            <form className="wiki-modal-form" onSubmit={(e) => e.preventDefault()}>
              <div className="wiki-form-grid">
                <div className="wiki-form-group">
                  <label>Image</label>
                  <input type="url" defaultValue={selectedCategory.image || ''} placeholder="Image URL (optional)" />
                </div>

                <div className="wiki-form-group">
                  <label>Name</label>
                  <input type="text" defaultValue={selectedCategory.name || ''} placeholder="Name of the category" />
                </div>

                <div className="wiki-form-group wiki-form-group-full">
                  <label>Description</label>
                  <textarea rows={4} defaultValue={selectedCategory.description || ''} placeholder="Write a short description..." />
                </div>

                <div className="wiki-form-group">
                  <label>Date Added</label>
                  <input type="date" defaultValue={selectedCategory.date ? String(selectedCategory.date).slice(0, 10) : ''} />
                </div>
              </div>

              <div className="wiki-modal-actions">
                <button type="button" className="wiki-btn-secondary" onClick={closeCategoryModal}>
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

