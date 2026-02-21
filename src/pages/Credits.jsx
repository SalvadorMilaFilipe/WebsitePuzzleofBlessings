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
        name: 'João Andrade',
        contribution: 'Low-poly modeling, environment design, visual style'
      },
      {
        role: 'Game UI/UX Designer',
        name: 'Designer Name',
        contribution: 'Game interface design, accessibility features, user experience'
      },
      {
        role: 'Sound Design',
        name: 'Audio Designer',
        contribution: 'Sound effects, ambient audio, sensory-friendly audio design'
      },
      {
        role: 'Music Composer',
        name: 'Composer Name',
        contribution: 'Original soundtrack, calming background music'
      },
      {
        role: 'QA Testing',
        name: 'Testers',
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
        name: 'Designer Name',
        contribution: 'Website design, user interface, visual identity'
      },
      {
        role: 'Backend Developer',
        name: 'Salvador Filipe',
        contribution: 'Backend integration, API development, database management'
      },
      {
        role: 'Real-time Integration',
        name: 'Integration Specialist',
        contribution: 'Real-time game-to-site communication, data synchronization'
      }
    ]
  }
]

const OTHER_CREDITS = [
  {
    category: '📚 Educational Consultants',
    credits: [
      {
        role: 'Special Needs Education',
        name: 'Consultant Name',
        contribution: 'Autism spectrum support, adaptive learning strategies'
      },
      {
        role: 'Pedagogical Advisor',
        name: 'Advisor Name',
        contribution: 'Cognitive development, assessment frameworks'
      },
      {
        role: 'Therapy Specialist',
        name: 'Specialist Name',
        contribution: 'Occupational therapy, sensory integration guidance'
      }
    ]
  }
]

const TECH_CATEGORIES = [
  {
    title: 'Game Engine & Development',
    items: ['Unity Engine', 'C# Programming']
  },
  {
    title: 'Web Development',
    items: ['React', 'HTML5 / CSS3', 'JavaScript']
  },
  {
    title: 'Design Tools',
    items: ['Blender (3D Modeling)', 'Adobe Creative Suite', 'Figma (UI Design)']
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

        {/* Other Credits */}
        {OTHER_CREDITS.map((section, index) => (
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

        {/* Special Thanks */}
        <section className="credits-section">
          <h2 className="credits-category">🙏 Special Thanks</h2>
          <div className="thanks-content lowpoly-card">
            <p>We extend our deepest gratitude to:</p>
            <ul>
              <li>All the children, families, and educators who participated in playtesting and provided invaluable feedback</li>
              <li>The schools and institutions that supported our research and development</li>
              <li>The open-source community for tools and resources that made this project possible</li>
              <li>Everyone who believed in our vision of making education accessible and engaging through games</li>
            </ul>
          </div>
        </section>

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

        {/* Contact */}
        <section className="credits-section">
          <div className="contact-info lowpoly-card">
            <h3>Want to Contribute?</h3>
            <p>
              We're always looking for passionate individuals to join our mission. 
              If you're interested in contributing to Puzzle of Blessings, please reach out 
              through our forum or contact the development team.
            </p>
          </div>
        </section>
      </div>
    </main>
  )
}

export default Credits

