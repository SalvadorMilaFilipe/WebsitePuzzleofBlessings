import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { session, userProfile, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const sidebarRef = useRef(null)

  const touchStartX = useRef(0)
  const touchEndX = useRef(0)
  const touchStartY = useRef(0)
  const touchEndY = useRef(0)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close sidebar when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [location])

  // Click outside to close sidebar
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target) && isMobileMenuOpen) {
        setIsMobileMenuOpen(false)
      }
    }

    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isMobileMenuOpen])

  const handleNavClick = (e, path) => {
    // If it's the current path, just scroll to top
    if (location.pathname === path) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      setIsMobileMenuOpen(false)
    }
  }

  const handleLogin = () => {
    navigate('/login')
    setIsMobileMenuOpen(false)
  }

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/')
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  const closeMobileMenu = () => setIsMobileMenuOpen(false)

  const displayName = userProfile?.jo_user || session?.user?.user_metadata?.full_name || 'User'
  const initial = (displayName || 'U').trim().charAt(0).toUpperCase()
  const displayAvatar = `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#6BCB77"/>
          <stop offset="0.5" stop-color="#5BC0EB"/>
          <stop offset="1" stop-color="#7B68EE"/>
        </linearGradient>
      </defs>
      <rect width="128" height="128" rx="64" fill="url(#g)"/>
      <circle cx="64" cy="52" r="22" fill="rgba(0,0,0,0.18)"/>
      <path d="M28 112c8-22 28-34 36-34s28 12 36 34" fill="rgba(0,0,0,0.18)"/>
      <text x="64" y="74" text-anchor="middle" font-family="Inter,Segoe UI,Arial" font-size="40" font-weight="800" fill="rgba(255,255,255,0.92)">${initial}</text>
    </svg>`
  )}`
  const unloggedUserIcon = `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#81D89E"/>
          <stop offset="1" stop-color="#5BC0EB"/>
        </linearGradient>
      </defs>
      <rect width="96" height="96" rx="48" fill="rgba(255,255,255,0.06)"/>
      <circle cx="48" cy="40" r="16" fill="url(#g)"/>
      <path d="M20 84c6-16 18-24 28-24s22 8 28 24" fill="url(#g)"/>
    </svg>`
  )}`

  return (
    <>
      <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
        <div className="container">
          <div className="navbar-content">
            <button
              className={`mobile-menu-btn ${isMobileMenuOpen ? 'active' : ''}`}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle Menu"
            >
              <span></span>
              <span></span>
              <span></span>
            </button>

            <Link to="/" className="logo" onClick={closeMobileMenu}>
              <span className="logo-icon">🧩</span>
              <span className="logo-text">Puzzle of Blessings</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="nav-menu-desktop">
              <Link to="/" className="nav-link" onClick={(e) => handleNavClick(e, '/')}>
                Download
              </Link>
              <Link to="/wiki" className="nav-link" onClick={(e) => handleNavClick(e, '/wiki')}>
                Wiki
              </Link>
              <Link to="/centro" className="nav-centro" onClick={(e) => handleNavClick(e, '/centro')}>
                <span className="nav-separator">|</span>
                The Center
                <span className="nav-separator">|</span>
              </Link>
              <Link to="/updatelog" className="nav-link" onClick={(e) => handleNavClick(e, '/updatelog')}>
                Update Log
              </Link>
              <Link to="/credits" className="nav-link" onClick={(e) => handleNavClick(e, '/credits')}>
                Credits
              </Link>
              {session && (
                <Link
                  to="/profile"
                  className="nav-link nav-username-steam"
                  onClick={(e) => handleNavClick(e, '/profile')}
                  style={{
                    color: '#81D89E',
                    fontWeight: 700,
                    letterSpacing: '1px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <div style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: userProfile?.status?.st_cor || '#6B7280',
                    boxShadow: `0 0 5px ${userProfile?.status?.st_cor || '#6B7280'}`
                  }}></div>
                  {userProfile?.jo_user || 'PROFILE'}
                </Link>
              )}

              {session ? (
                <div className="nav-user-info" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <img
                    src={displayAvatar}
                    alt="Profile"
                    className="nav-user-icon logged-in"
                    onClick={(e) => {
                      if (e.detail === 2) {
                        navigator.clipboard.writeText(userProfile?.jo_id || '')
                        alert('ID copied to clipboard!')
                      } else if (e.detail === 1) {
                        setTimeout(() => {
                          if (e.detail === 1) navigate('/profile')
                        }, 200)
                      }
                    }}
                    title="Click once: Profile | Double click: Copy ID"
                    style={{
                      borderRadius: '50%',
                      border: '2px solid #3CB371',
                      width: '40px',
                      height: '40px',
                      filter: 'brightness(0) invert(1)',
                      cursor: 'pointer'
                    }}
                  />
                  <span
                    onClick={handleLogout}
                    style={{
                      color: 'var(--text-muted)',
                      textDecoration: 'underline',
                      fontSize: '0.7rem',
                      cursor: 'pointer',
                      marginLeft: '-5px',
                      opacity: 0.7,
                      transition: 'opacity 0.2s'
                    }}
                    onMouseOver={(e) => e.target.style.opacity = 1}
                    onMouseOut={(e) => e.target.style.opacity = 0.7}
                  >
                    Logout
                  </span>
                </div>
              ) : (
                <button className="btn-login" onClick={handleLogin}>
                  Log In
                  <img
                    src={unloggedUserIcon}
                    alt="User"
                    className="nav-user-icon"
                  />
                </button>
              )}

            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar Overlay */}
      <div
        className={`mobile-menu-overlay ${isMobileMenuOpen ? 'show' : ''}`}
        onClick={closeMobileMenu}
      ></div>

      {/* Mobile Sidebar */}
      <div
        ref={sidebarRef}
        className={`mobile-sidebar ${isMobileMenuOpen ? 'open' : ''}`}
        onTouchStart={(e) => {
          touchStartX.current = e.touches[0].clientX
          touchStartY.current = e.touches[0].clientY
        }}
        onTouchMove={(e) => {
          touchEndX.current = e.touches[0].clientX
          touchEndY.current = e.touches[0].clientY
        }}
        onTouchEnd={() => {
          const deltaX = touchStartX.current - touchEndX.current
          const deltaY = touchStartY.current - touchEndY.current
          const minSwipeDistance = 50
          const maxVerticalSwipe = 30

          if (deltaX < -minSwipeDistance && Math.abs(deltaY) < maxVerticalSwipe) {
            setIsMobileMenuOpen(false)
          }
        }}
      >
        <div className="mobile-sidebar-header">
          <Link to="/" className="logo mobile-logo" onClick={closeMobileMenu}>
            <span className="logo-icon">🧩</span>
            <span className="logo-text">Puzzle of Blessings</span>
          </Link>
        </div>

        <div className="mobile-sidebar-content">
          <Link to="/" className="mobile-nav-link" onClick={(e) => handleNavClick(e, '/')}>
            Download
          </Link>
          <Link to="/wiki" className="mobile-nav-link" onClick={(e) => handleNavClick(e, '/wiki')}>
            Wiki
          </Link>
          <Link to="/centro" className="mobile-nav-link mobile-nav-centro" onClick={(e) => handleNavClick(e, '/centro')}>
            The Center
          </Link>
          <Link to="/updatelog" className="mobile-nav-link" onClick={(e) => handleNavClick(e, '/updatelog')}>
            Update Log
          </Link>
          <Link to="/credits" className="mobile-nav-link" onClick={(e) => handleNavClick(e, '/credits')}>
            Credits
          </Link>
          {session && (
            <Link to="/profile" className="mobile-nav-link" style={{ color: '#81D89E' }} onClick={(e) => handleNavClick(e, '/profile')}>
              My Profile
            </Link>
          )}

          <div className="mobile-sidebar-footer">
            {session ? (
              <div className="mobile-user-profile" style={{ display: 'flex', flexDirection: 'column', gap: '15px', width: '100%', alignItems: 'center' }}>
                <div
                  onClick={() => navigate('/profile')}
                  style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
                >
                  <img
                    src={displayAvatar}
                    alt="Avatar"
                    className="nav-user-icon mobile-user-icon"
                    style={{ borderRadius: '50%', border: '2px solid #3CB371', filter: 'brightness(0) invert(1)' }}
                  />
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ color: '#81D89E', fontWeight: 600 }}>{displayName}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>View Profile</span>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  style={{
                    background: 'transparent',
                    border: '1px solid rgba(255,255,255,0.2)',
                    color: 'var(--text-muted)',
                    padding: '5px 15px',
                    borderRadius: '4px',
                    fontSize: '0.8rem'
                  }}
                >
                  Logout
                </button>
              </div>
            ) : (
              <button className="btn-login mobile-btn-login" onClick={handleLogin}>
                Log In
                <img
                  src="/img/unloggeduser/UnloggedUser.png"
                  alt="User"
                  className="nav-user-icon mobile-user-icon"
                />
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default Navbar
