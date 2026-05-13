import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

function UpdateLog() {
  const [updates, setUpdates] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedVersion, setSelectedVersion] = useState('current')

  useEffect(() => {
    const fetchUpdates = async () => {
      try {
        const { data, error } = await supabase
          .from('launchergamedownload')
          .select('*')
          .order('add_date', { ascending: false })

        if (error) throw error
        setUpdates(data || [])
      } catch (err) {
        console.error('Error fetching updates:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchUpdates()
  }, [])

  const filteredUpdates = selectedVersion === 'current'
    ? (updates.length > 0 ? [updates[0]] : [])
    : updates.filter(update => update.version === selectedVersion)

  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <main className="updatelog-main" style={{ paddingTop: '100px' }}>
      <div className="container">
        <h1 className="section-title">Game Updates</h1>
        
        <p className="update-intro">
          Track all changes, additions, and improvements made to the Puzzle of Blessings game. 
          Stay informed about new Blessings, map updates, balance changes, and more.
        </p>

        <div className="version-filter lowpoly-card">
          <label>Filter by Version:</label>
          <select value={selectedVersion} onChange={(e) => setSelectedVersion(e.target.value)}>
            <option value="current">Current Version (Latest)</option>
            {updates.map(update => (
              <option key={update.id} value={update.version}>
                Version {update.version}
              </option>
            ))}
          </select>
        </div>

        {/* Update Entries */}
        <div className="updates-timeline">
          {loading ? (
            <div className="loading-updates" style={{ textAlign: 'center', color: '#81D89E', padding: '2rem' }}>
              Fetching latest updates...
            </div>
          ) : (
            filteredUpdates.map(update => (
              <div key={update.id} className="update-entry lowpoly-card" data-version={update.version}>
                <div className="update-header">
                  <h2 className="version-number">Version {update.version}</h2>
                  <span className="update-date">{formatDate(update.add_date)}</span>
                </div>
                <div className="update-content">
                  <div className="update-section">
                    <h3>💎 Change Log</h3>
                    {update.description ? (
                      <ul>
                        {update.description.split(/\r?\n/).map((line, idx) => (
                          line.trim() && <li key={idx}>{line.trim()}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="no-description">No details provided for this version.</p>
                    )}
                  </div>
                  <div className="update-meta" style={{ marginTop: '1.5rem', opacity: 0.7, fontSize: '0.8rem' }}>
                    <span>Platform: {update.platform}</span> • <span>Size: {update.size_mb} MB</span>
                  </div>
                </div>
              </div>
            ))
          )}
          {!loading && filteredUpdates.length === 0 && (
            <p style={{ textAlign: 'center', opacity: 0.6 }}>No updates found.</p>
          )}
        </div>
      </div>
    </main>
  )
}

export default UpdateLog

