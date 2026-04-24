import { Link } from 'react-router-dom'
import { useEffect, useState, lazy, Suspense } from 'react'
import Footer from '../components/Footer'
import { supabase } from '../lib/supabase'
// import PuzzleAnimation from '../components/PuzzleAnimation'

const PuzzleAnimation = lazy(() => import('../components/PuzzleAnimation'))

function Download() {
  const [latestInfo, setLatestInfo] = useState({
    version: 'v1.0.0-Beta',
    size_mb: '120',
    platform: 'Windows (Tested)',
    add_date: '2026-04-24'
  })

  useEffect(() => {
    async function fetchLatestInfo() {
      try {
        const { data, error } = await supabase
          .from('launchergamedownload')
          .select('*')
          .order('id', { ascending: false })
          .limit(1)
          .maybeSingle()

        if (data && !error) {
          setLatestInfo(data)
        }
      } catch (err) {
        console.error('Error fetching game info:', err)
      }
    }
    fetchLatestInfo()
  }, [])

  useEffect(() => {
    // Smooth scroll handler
    const handleSmoothScroll = (e) => {
      const href = e.target.getAttribute('href')
      if (href && href.startsWith('#')) {
        e.preventDefault()
        const targetId = href.substring(1)
        const targetElement = document.getElementById(targetId)
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }
    }

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', handleSmoothScroll)
    })

    return () => {
      document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.removeEventListener('click', handleSmoothScroll)
      })
    }
  }, [])

  return (
    <>
      {/* Hero Section */}
      <section className="hero" style={{ position: 'relative', overflow: 'hidden' }}>
        <Suspense fallback={null}>
          <PuzzleAnimation type="assemble" />
        </Suspense>
        <div className="hero-content" style={{ position: 'relative', zIndex: 2, pointerEvents: 'none' }}>
          <div className="hero-text" style={{ pointerEvents: 'auto' }}>
            <h1 className="hero-title">Puzzle of Blessings</h1>
            <p className="hero-subtitle">
              A 3D educational puzzle game that develops cognitive, executive, and sensory skills
              through spatial problem-solving and cooperative interactions
            </p>
            <div className="hero-buttons">
              <a 
                href="https://www.dropbox.com/scl/fi/u9ba96y3tyb0i6ag0jf2j/LauncherInstaller.exe?rlkey=n7xdawedmyow8us59dzt839ho&st=k6rkzzgf&dl=1"
                className="btn btn-primary"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="btn-icon">⬇️</span>
                Download Game
              </a>
            </div>
          </div>
          <div className="hero-image" style={{ pointerEvents: 'auto' }}>
            <div className="game-preview lowpoly-style" style={{ background: 'transparent', boxShadow: 'none', border: 'none' }}>
              {/* The 3D animation occupies the background of the hero, 
                   but we can keep this div for layout balance if needed or add a specific 3D view here */}
              <div className="preview-placeholder" style={{ opacity: 0.8, background: 'transparent', boxShadow: 'none' }}>
                <span className="preview-icon">🧩</span>
                <p>3D Interactive Experience</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Download & Updates Section */}
      <section id="download" className="download">
        <div className="container">
          <div className="download-content">
            <h2 className="section-title">Download & Updates</h2>
            <p className="download-description">
              Download Puzzle of Blessings or update your existing installation to the latest version!
            </p>

            <div className="download-card lowpoly-card">
              <div className="download-info">
                <h3>Puzzle of Blessings</h3>
                <p className="download-version">Latest Version: <span>{latestInfo.version}</span></p>
                <p className="download-size">Size: <span>{latestInfo.size_mb} MB</span></p>
                <p className="download-platforms">Platforms: {latestInfo.platform}</p>
                <p className="download-date">Released: <span>{latestInfo.add_date}</span></p>
              </div>
              <div className="download-actions">
                <p className="download-notice">
                  Official Windows installer. Use the main download button at the top of the page.
                </p>
              </div>
            </div>

            {/* Updates Section for Existing Players */}
            <div className="updates-info lowpoly-card">
              <h3>📦 Already Have the Game?</h3>
              <p>If you already have Puzzle of Blessings installed and want to update to the latest version, follow these steps:</p>
              <div className="update-steps">
                <div className="update-step">
                  <span className="step-number">1</span>
                  <div className="step-content">
                    <h4>Check Your Current Version</h4>
                    <p>Open the game and check the version number in the main menu or settings screen.</p>
                  </div>
                </div>
                <div className="update-step">
                  <span className="step-number">2</span>
                  <div className="step-content">
                    <h4>View Latest Updates</h4>
                    <p>Visit our <Link to="/updatelog">Update Log</Link> to see what's new in the latest version.</p>
                  </div>
                </div>
                <div className="update-step">
                  <span className="step-number">3</span>
                  <div className="step-content">
                    <h4>Download the Update</h4>
                    <p>Download the latest version from the button above. Your save data will be preserved automatically.</p>
                  </div>
                </div>
                <div className="update-step">
                  <span className="step-number">4</span>
                  <div className="step-content">
                    <h4>Install & Play</h4>
                    <p>Run the installer to update your game. Once complete, launch and continue your progress!</p>
                  </div>
                </div>
              </div>
              <div className="update-notice">
                <p>
                  <strong>Note:</strong> We recommend backing up your save files before updating,
                  though our update system preserves your progress automatically. If you encounter any issues,
                  check our documentation for help.
                </p>
              </div>
            </div>

            <div className="system-requirements lowpoly-card">
              <h3>System Requirements</h3>
              <div className="requirements-grid">
                <div className="requirement-item">
                  <strong>OS:</strong> Windows 10/11, macOS 10.14+, Linux (Ubuntu 18.04+)
                </div>
                <div className="requirement-item">
                  <strong>Processor:</strong> To be determined
                </div>
                <div className="requirement-item">
                  <strong>Memory:</strong> To be determined
                </div>
                <div className="requirement-item">
                  <strong>Graphics:</strong> Low-poly optimized, details TBD
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </>
  )
}

export default Download

