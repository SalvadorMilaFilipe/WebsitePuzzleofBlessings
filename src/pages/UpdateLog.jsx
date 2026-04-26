import { useState } from 'react'

const UPDATES = [
  {
    version: '1.0.0-Beta',
    date: 'April 24, 2026',
    description: 'Major infrastructure update including dynamic systems and deck management.',
    sections: [
      {
        title: '💎 New Features',
        items: [
          'Implemented the Battle Deck system - Configure up to 4 blessings for gameplay.',
          'Added dynamic version tracking for game downloads directly from database.',
          'Synchronized Google OAuth authentication with standard login credentials.'
        ]
      },
      {
        title: '🔧 Improvements & Fixes',
        subsections: [
          {
            title: 'Website & Database:',
            items: [
              'Enabled automatic Dropbox installer downloads via direct links.',
              'Added release date tracking for new game versions.',
              'Fixed player_blessing schema issues for multi-device sync.'
            ]
          },
          {
            title: 'User Experience:',
            items: [
              'New translucent "Glassmorphism" UI for the Deck interface.',
              'Optimized "The Center" dashboard for better high-resolution scaling.',
              'Improved login resilience for users using hybrid authentication methods.'
            ]
          }
        ]
      }
    ]
  },
  {
    version: '0.9.0',
    date: 'December 20, 2023',
    description: 'Beta release with core mechanics and initial content.',
    sections: [
      {
        title: '✨ New Features',
        items: [
          'Initial implementation of gravity-gun mechanics',
          'Basic Blessing system framework',
          'First version of Ghost NPCs'
        ]
      },
      {
        title: '🆕 New Content',
        subsections: [
          {
            title: 'Blessings Added:',
            items: [
              'Levitator (Common) - Initial implementation',
              'Pattern Lens (Common) - Initial implementation'
            ]
          },
          {
            title: 'Maps/Puzzles Added:',
            items: [
              '3 test puzzle arenas',
              '1 tutorial area'
            ]
          }
        ]
      },
      {
        title: '🐛 Known Issues',
        items: [
          'Some physics interactions need refinement',
          'Report generation incomplete'
        ]
      }
    ]
  },
  {
    version: '0.8.0',
    date: 'November 10, 2023',
    description: 'Alpha build - Core systems and initial prototype.',
    sections: [
      {
        title: '✨ Initial Features',
        items: [
          'Basic 3D puzzle framework',
          'Low-poly visual style implementation',
          'Initial UI/UX design'
        ]
      },
      {
        title: '📝 Notes',
        content: 'Early prototype for testing core concepts and visual direction. Many features still in development.'
      }
    ]
  }
]

function UpdateLog() {
  const [selectedVersion, setSelectedVersion] = useState('current')

  const filteredUpdates = selectedVersion === 'current'
    ? (UPDATES.length > 0 ? [UPDATES[0]] : [])
    : UPDATES.filter(update => update.version === selectedVersion)

  return (
    <main className="updatelog-main" style={{ paddingTop: '100px' }}>
      <div className="container">
        <h1 className="section-title">Update Log</h1>
        
        <p className="update-intro">
          Track all changes, additions, and improvements made to Puzzle of Blessings. 
          Stay informed about new Blessings, map updates, balance changes, and more.
        </p>

        {/* Version Filter */}
        <div className="version-filter lowpoly-card">
          <label>Filter by Version:</label>
          <select value={selectedVersion} onChange={(e) => setSelectedVersion(e.target.value)}>
            <option value="current">Current Version (Latest)</option>
            {UPDATES.map(update => (
              <option key={update.version} value={update.version}>
                Version {update.version}
              </option>
            ))}
          </select>
        </div>

        {/* Update Entries */}
        <div className="updates-timeline">
          {filteredUpdates.map(update => (
            <div key={update.version} className="update-entry lowpoly-card" data-version={update.version}>
              <div className="update-header">
                <h2 className="version-number">Version {update.version}</h2>
                <span className="update-date">{update.date}</span>
              </div>
              <div className="update-content">
                <p className="update-description">{update.description}</p>
                
                {update.sections.map((section, index) => (
                  <div key={index} className="update-section">
                    <h3>{section.title}</h3>
                    {section.items && (
                      <ul>
                        {section.items.map((item, itemIndex) => (
                          <li key={itemIndex}>{item}</li>
                        ))}
                      </ul>
                    )}
                    {section.subsections && section.subsections.map((subsection, subIndex) => (
                      <div key={subIndex}>
                        <h4>{subsection.title}</h4>
                        <ul>
                          {subsection.items.map((item, itemIndex) => (
                            <li key={itemIndex}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                    {section.content && <p>{section.content}</p>}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}

export default UpdateLog

