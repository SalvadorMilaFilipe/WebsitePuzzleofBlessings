import { Link } from 'react-router-dom'

function Footer() {
  const currentYear = new Date().getFullYear()

  const handleNavClick = (e, href) => {
    if (href.startsWith('#')) {
      e.preventDefault()
      const targetId = href.substring(1)
      const targetElement = document.getElementById(targetId)
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }
  }

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h4>Puzzle of Blessings</h4>
            <p>An educational puzzle game designed with care for cognitive development and accessibility.</p>
          </div>
          <div className="footer-section">
            <h4>Navigation</h4>
            <ul className="footer-links">
              <li>
                <Link to="/download">Download & Updates</Link>
              </li>
              <li>
                <Link to="/discoveries">Discoveries</Link>
              </li>
              <li>
                <Link to="/centro">The Center</Link>
              </li>
              <li>
                <Link to="/forum">Forum</Link>
              </li>
              <li>
                <Link to="/updatelog">Update Log</Link>
              </li>
              <li>
                <Link to="/credits">Credits</Link>
              </li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Educational Focus</h4>
            <p>Problem-solving • Spatial Perception • Socio-emotional Skills • Fine Motor Development</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {currentYear} Puzzle of Blessings. All rights reserved.</p>
          <p className="footer-note">Designed for children with autism and middle school students (ages 11-15)</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer

