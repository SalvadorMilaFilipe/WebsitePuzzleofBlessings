import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

function UpdateLog() {
  const [updates, setUpdates] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState(null)

  useEffect(() => {
    const fetchUpdates = async () => {
      try {
        const { data, error } = await supabase
          .from('launchergamedownload')
          .select('add_date, description')
          .order('add_date', { ascending: false })

        if (error) throw error
        setUpdates(data || [])
      } catch (err) {
        console.error('Error fetching updates:', err)
        const errorDetails = err.message ? `${err.message} (Code: ${err.code || 'N/A'}) - Details: ${err.details || 'None'} - Hint: ${err.hint || 'None'}` : JSON.stringify(err);
        setErrorMsg(errorDetails)
      } finally {
        setLoading(false)
      }
    }

    fetchUpdates()
  }, [])

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

        {/* Update Entries */}
        <div className="updates-timeline">
          {loading ? (
            <div className="loading-updates" style={{ textAlign: 'center', color: '#81D89E', padding: '2rem' }}>
              Fetching latest updates...
            </div>
          ) : errorMsg ? (
            <div style={{ textAlign: 'center', color: '#ff6b6b', padding: '2rem', backgroundColor: 'rgba(255,0,0,0.1)', borderRadius: '8px' }}>
              <h3>Error loading updates:</h3>
              <p>{errorMsg}</p>
            </div>
          ) : (
            updates.map((update, index) => (
              <div key={update.add_date || index} className="update-entry lowpoly-card">
                <div className="update-header">
                  <h2 className="version-number">{formatDate(update.add_date)}</h2>
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
                      <p className="no-description">No details provided for this update.</p>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
          {!loading && updates.length === 0 && (
            <p style={{ textAlign: 'center', opacity: 0.6 }}>No updates found.</p>
          )}
        </div>
      </div>
    </main>
  )
}

export default UpdateLog

