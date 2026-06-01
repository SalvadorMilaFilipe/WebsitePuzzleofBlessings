const GAME_CREDITS = [
  {
    category: '🎮 Game Development Team',
    credits: [
      {
        role: 'Lead Developer',
        name: 'João Andrade',
        contribution: 'Game mechanics, physics systems, core gameplay implementation'
      },
      {
        role: 'Game Designer',
        name: 'João Andrade',
        contribution: 'Game design, puzzle creation, educational framework'
      },
      {
        role: '3D Artist',
        name: 'João Andrade & SketchFab Authors',
        contribution: 'Low-poly modeling, environment design, visual style'
      },
      {
        role: 'Game UI/UX Designer',
        name: 'João Andrade & Google Flow',
        contribution: 'Game interface design, accessibility features, user experience'
      },
      {
        role: 'Sound Design',
        name: 'Pixabay Authors',
        contribution: 'Sound effects, ambient audio, sensory-friendly audio design'
      },
      {
        role: 'Music Composer',
        name: 'Pixabay Authors',
        contribution: 'Original soundtrack, calming background music'
      },
      {
        role: 'QA Testing',
        name: 'Sérgio Ravlyuk, João Pereira, Pedro Henrique, Salvador Filipe',
        contribution: 'Beta testing, accessibility testing, feedback collection'
      }
    ]
  }
]

const WEBSITE_CREDITS = [
  {
    category: '🌐 Website Development Team',
    credits: [
      {
        role: 'Frontend Developer',
        name: 'Salvador Filipe',
        contribution: 'React development, UI implementation, responsive design'
      },
      {
        role: 'Web Designer',
        name: 'Salvador Filipe',
        contribution: 'Website design, user interface, visual identity'
      },
      {
        role: 'Backend Developer',
        name: 'Salvador Filipe',
        contribution: 'Backend integration, API development, database management'
      },
      {
        role: 'Real-time Integration',
        name: 'Salvador Filipe & João Andrade',
        contribution: 'Real-time game-to-site communication, data synchronization'
      }
    ]
  }
]
const TECH_CATEGORIES = [
  {
    title: 'Game Engine & Infrastructure',
    items: ['Unity Engine', 'C# Programming', 'Supabase (Cloud Backend)', 'Dropbox API (Deliverables)']
  },
  {
    title: 'Web & Real-time Technologies',
    items: [
      'React.js & Vite',
      'React Three Fiber (3D Animations)',
      'Three.js (WebGL)',
      'Supabase Realtime (Cross-platform Broadcast)',
      'Vanilla CSS3 (Glassmorphism UI)'
    ]
  },
  {
    title: 'Design & Development Tools',
    items: ['Blender (3D Modeling)', 'Pixlr', 'Canva', 'Google Flow', 'Git & GitHub', 'Vercel (Deployment)']
  }
]

function Credits() {
  return (
    <main className="credits-main" style={{ paddingTop: '100px' }}>
      <div className="container">
        <h1 className="section-title">Credits</h1>
        
        <p className="credits-intro">
          Puzzle of Blessings was made possible through the dedication, creativity, and expertise 
          of many talented individuals. We thank everyone who contributed to making this educational 
          game a reality.
        </p>

        {/* Game Credits */}
        {GAME_CREDITS.map((section, index) => (
          <section key={index} className="credits-section">
            <h2 className="credits-category">{section.category}</h2>
            <div className="credits-grid">
              {section.credits.map((credit, creditIndex) => (
                <div key={creditIndex} className="credit-card lowpoly-card">
                  <div className="credit-role">{credit.role}</div>
                  <h3 className="credit-name">{credit.name}</h3>
                  <p className="credit-contribution">{credit.contribution}</p>
                </div>
              ))}
            </div>
          </section>
        ))}

        {/* Website Credits */}
        {WEBSITE_CREDITS.map((section, index) => (
          <section key={index} className="credits-section">
            <h2 className="credits-category">{section.category}</h2>
            <div className="credits-grid">
              {section.credits.map((credit, creditIndex) => (
                <div key={creditIndex} className="credit-card lowpoly-card">
                  <div className="credit-role">{credit.role}</div>
                  <h3 className="credit-name">{credit.name}</h3>
                  <p className="credit-contribution">{credit.contribution}</p>
                </div>
              ))}
            </div>
          </section>
        ))}


        {/* Technologies Used */}
        <section className="credits-section">
          <h2 className="credits-category">🛠️ Technologies & Tools</h2>
          <div className="tech-list lowpoly-card">
            {TECH_CATEGORIES.map((tech, index) => (
              <div key={index} className="tech-category">
                <h4>{tech.title}</h4>
                <ul>
                  {tech.items.map((item, itemIndex) => (
                    <li key={itemIndex}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Contacts Footer Bar */}
        <div style={{
          marginTop: '5rem',
          paddingTop: '1.5rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          justifyContent: 'center',
          gap: '2.5rem',
          fontSize: '0.95rem',
          color: 'var(--text-secondary)',
          flexWrap: 'wrap'
        }}>
          <span><strong>Game Dev:</strong> <a href="mailto:0andradejoao@gmail.com" style={{ color: 'var(--blue-accent)', textDecoration: 'none', marginLeft: '0.5rem' }}>0andradejoao@gmail.com</a></span>
          <span><strong>Website Dev:</strong> <a href="mailto:smilaf@gmaol.com" style={{ color: 'var(--blue-accent)', textDecoration: 'none', marginLeft: '0.5rem' }}>smilaf@gmaol.com</a></span>
        </div>
      </div>
    </main>
  )
}

export default Credits

