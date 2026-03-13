import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Navbar({ onOpenLogin }) {
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
    onOpenLogin()
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
  const displayAvatar = "/img/Player_without_image.png"

  return (
    <>
      <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
        <div className="container">
          <div className="navbar-content">
            <button
              className="mobile-menu-btn"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle Menu"
            >
              <div className={`hamburger ${isMobileMenuOpen ? 'active' : ''}`}>
                <span></span>
                <span></span>
                <span></span>
              </div>
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
                    src="/img/unloggeduser/UnloggedUser.png"
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

          <div className="mobile-sidebar-footer">
            {session ? (
              <div className="mobile-user-profile" style={{ display: 'flex', flexDirection: 'column', gap: '15px', width: '100%', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <img
                    src={displayAvatar}
                    alt="Avatar"
                    className="nav-user-icon mobile-user-icon"
                    style={{ borderRadius: '50%', border: '2px solid #3CB371', filter: 'brightness(0) invert(1)' }}
                  />
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>In-game Avatar</span>
                </div>
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
