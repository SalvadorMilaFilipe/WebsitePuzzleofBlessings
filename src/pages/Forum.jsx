import { useState, useEffect, useRef } from 'react'

const PROHIBITED_WORDS = ['spam', 'hack', 'cheat', 'exploit']
const INITIAL_TOPICS = [
  {
    id: 1,
    title: 'Welcome to the Forum!',
    category: 'general',
    preview: 'Welcome to the Puzzle of Blessings community forum! This is a place to discuss the game, share strategies, and connect with other players...',
    author: 'Admin',
    date: '2024-01-15',
    replies: 5
  }
]

function Forum() {
  const [showForm, setShowForm] = useState(false)
  const [topics, setTopics] = useState(INITIAL_TOPICS)
  const [filterCategory, setFilterCategory] = useState('all')
  const [sortBy, setSortBy] = useState('recent')
  const [searchTerm, setSearchTerm] = useState('')
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    content: ''
  })
  const [charCount, setCharCount] = useState(0)
  const [hasProhibitedWords, setHasProhibitedWords] = useState(false)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))

    if (name === 'content') {
      setCharCount([...value].length)
      const text = value.toLowerCase()
      const found = PROHIBITED_WORDS.some(word => text.includes(word))
      setHasProhibitedWords(found)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    const text = (formData.title + ' ' + formData.content).toLowerCase()
    const foundWords = PROHIBITED_WORDS.filter(word => text.includes(word))

    if (foundWords.length > 0) {
      alert('Your message contains prohibited language. Please revise your content.')
      return
    }

    // In a real implementation, this would send data to server
    alert('Topic created successfully! (Demo mode - topics are not saved)')
    setFormData({ title: '', category: '', content: '' })
    setCharCount(0)
    setShowForm(false)
  }

  const filteredAndSortedTopics = topics
    .filter(topic => {
      const matchesCategory = filterCategory === 'all' || topic.category === filterCategory
      const matchesSearch = searchTerm === '' ||
        topic.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        topic.preview.toLowerCase().includes(searchTerm.toLowerCase())
      return matchesCategory && matchesSearch
    })
    .sort((a, b) => {
      if (sortBy === 'recent') {
        return new Date(b.date) - new Date(a.date)
      } else if (sortBy === 'popular' || sortBy === 'replies') {
        return b.replies - a.replies
      }
      return 0
    })

  return (
    <main className="forum-main" style={{ paddingTop: '100px' }}>
      <div className="container">
        <h1 className="section-title">Forum</h1>

        {/* Create New Topic */}
        <div className="create-topic-section">
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            + Create New Topic
          </button>

          {showForm && (
            <div className="create-form lowpoly-card" style={{ marginTop: '1.5rem' }}>
              <h3>Create New Topic</h3>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="topic-title">Topic Title *</label>
                  <input
                    type="text"
                    id="topic-title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter topic title..."
                    maxLength={100}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="topic-category">Category *</label>
                  <select
                    id="topic-category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select category...</option>
                    <option value="general">General Discussion</option>
                    <option value="gameplay">Gameplay</option>
                    <option value="tips">Tips & Strategies</option>
                    <option value="bugs">Bug Reports</option>
                    <option value="suggestions">Suggestions</option>
                    <option value="help">Help & Support</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="topic-content">Content *</label>
                  <textarea
                    id="topic-content"
                    name="content"
                    value={formData.content}
                    onChange={handleInputChange}
                    required
                    placeholder="Write your message here..."
                    rows={6}
                    maxLength={2000}
                  />
                  <small style={{ color: hasProhibitedWords ? 'var(--blue-accent)' : 'var(--text-muted)' }}>
                    {charCount} / 2000 characters
                    {hasProhibitedWords && ' ⚠️ Please avoid prohibited language'}
                  </small>
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn btn-primary">Create Topic</button>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Filter Bar */}
        <div className="forum-filters lowpoly-card">
          <div className="filter-group">
            <label>Category:</label>
            <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
              <option value="all">All Categories</option>
              <option value="general">General Discussion</option>
              <option value="gameplay">Gameplay</option>
              <option value="tips">Tips & Strategies</option>
              <option value="bugs">Bug Reports</option>
              <option value="suggestions">Suggestions</option>
              <option value="help">Help & Support</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Sort by:</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="recent">Most Recent</option>
              <option value="popular">Most Popular</option>
              <option value="replies">Most Replies</option>
            </select>
          </div>
          <div className="filter-group">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search topics..."
            />
          </div>
        </div>

        {/* Topics List */}
        <div className="topics-list">
          {filteredAndSortedTopics.length > 0 ? (
            filteredAndSortedTopics.map(topic => (
              <div key={topic.id} className="topic-item lowpoly-card" data-category={topic.category}>
                <div className="topic-header">
                  <h3 className="topic-title">{topic.title}</h3>
                  <span className={`topic-category ${topic.category}`}>
                    {topic.category.charAt(0).toUpperCase() + topic.category.slice(1).replace(/([A-Z])/g, ' $1')}
                  </span>
                </div>
                <p className="topic-preview">{topic.preview}</p>
                <div className="topic-meta">
                  <span>By: {topic.author}</span>
                  <span>{new Date(topic.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  <span>{topic.replies} replies</span>
                </div>
              </div>
            ))
          ) : (
            <div className="no-results">
              <p>No topics found. Try adjusting your filters or create a new topic!</p>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

export default Forum

