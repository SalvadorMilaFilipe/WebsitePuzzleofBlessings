import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [activeMobileIndex, setActiveMobileIndex] = useState(-1)
  const { session, userProfile, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const sidebarRef = useRef(null)
  const mobileLinksRef = useRef([])

  const navItems = [
    { label: 'Download', path: '/' },
    { label: 'Discoveries', path: '/discoveries' },
    { label: 'The Center', path: '/centro', isCentro: true },
    { label: 'Update Log', path: '/updatelog' },
    { label: 'Credits', path: '/credits' }
  ]

  if (session) {
    navItems.push({ label: 'My Profile', path: '/profile', isProfile: true })
  }

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
    setActiveMobileIndex(-1)
  }, [location])

  // ... (rest of useEffects)

  // Click outside to close sidebar
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target) && isMobileMenuOpen) {
        setIsMobileMenuOpen(false)
      }
    }

    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      // Focus sidebar to enable arrow keys immediately
      setTimeout(() => {
        sidebarRef.current?.focus()
      }, 100)
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

  const displayName = userProfile?.pl_username || session?.user?.user_metadata?.full_name || 'User'
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
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register'
  if (isAuthPage) return null

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
              <div className="nav-links-group">
                <Link to="/" className="nav-link" onClick={(e) => handleNavClick(e, '/')}>
                  Download
                </Link>
                <Link to="/discoveries" className="nav-link" onClick={(e) => handleNavClick(e, '/discoveries')}>
                  Discoveries
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
              </div>

              {session ? (
                <div className="nav-user-info">
                  <Link
                    to="/profile"
                    className="nav-link nav-username-steam"
                    onClick={(e) => handleNavClick(e, '/profile')}
                  >
                    <div className="user-status-dot" style={{
                      backgroundColor: userProfile?.status?.st_color || '#6B7280',
                      boxShadow: `0 0 5px ${userProfile?.status?.st_color || '#6B7280'}`
                    }}></div>
                    {userProfile?.pl_username || 'PROFILE'}
                  </Link>

                  <img
                    src={displayAvatar}
                    alt="Profile"
                    className="nav-user-icon logged-in"
                    onClick={(e) => {
                      if (e.detail === 2) {
                        navigator.clipboard.writeText(userProfile?.pl_code || '')
                        alert('ID copied to clipboard!')
                      } else if (e.detail === 1) {
                        setTimeout(() => {
                          if (e.detail === 1) navigate('/profile')
                        }, 200)
                      }
                    }}
                    title="Click once: Profile | Double click: Copy ID"
                  />
                  <span
                    className="nav-logout-btn"
                    onClick={handleLogout}
                  >
                    Logout
                  </span>
                </div>
              ) : (
                <div className="nav-auth-buttons">
                  <button className="btn-login" onClick={handleLogin}>
                    Log In
                  </button>
                  <button className="btn-signup-ghost" onClick={() => navigate('/register')}>
                    Sign Up
                    <img
                      src={unloggedUserIcon}
                      alt="User"
                      className="nav-user-icon"
                    />
                  </button>
                </div>
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
        tabIndex="0" // Make it focusable for arrow keys
        onKeyDown={(e) => {
          if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
            e.preventDefault()
            let nextIndex = activeMobileIndex

            // If no active index, find the one closest to current mouse position
            if (nextIndex === -1) {
              const mouseY = window.lastMouseY || 0
              nextIndex = mobileLinksRef.current.findIndex(link => {
                if (!link) return false
                const rect = link.getBoundingClientRect()
                return mouseY >= rect.top && mouseY <= rect.bottom
              })
            }

            if (e.key === 'ArrowUp') {
              nextIndex = nextIndex <= 0 ? navItems.length - 1 : nextIndex - 1
            } else {
              nextIndex = nextIndex >= navItems.length - 1 ? 0 : nextIndex + 1
            }

            setActiveMobileIndex(nextIndex)

            // Auto-scroll to selected item
            const selectedLink = mobileLinksRef.current[nextIndex]
            if (selectedLink) {
              selectedLink.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
            }
          } else if (e.key === 'Enter') {
            if (activeMobileIndex >= 0 && activeMobileIndex < navItems.length) {
              const item = navItems[activeMobileIndex]
              handleNavClick(e, item.path)
              navigate(item.path)
            }
          }
        }}
        onMouseDown={(e) => {
          // Prevent text/image selection/dragging when starting a scroll drag
          if (e.target.tagName === 'A' || e.target.tagName === 'IMG' || e.target.tagName === 'SPAN') {
            // We allow mouse down but we'll prevent default on drag
          }
          const sidebar = sidebarRef.current
          sidebar.isDragging = true
          sidebar.startY = e.pageY - sidebar.offsetTop
          sidebar.initialScrollTop = sidebar.scrollTop
          sidebar.style.cursor = 'grabbing'
        }}
        onMouseLeave={() => {
          const sidebar = sidebarRef.current
          sidebar.isDragging = false
          sidebar.style.cursor = 'grab'
        }}
        onMouseUp={() => {
          const sidebar = sidebarRef.current
          sidebar.isDragging = false
          sidebar.style.cursor = 'grab'
        }}
        onMouseMove={(e) => {
          // Track mouse Y globally for arrow keys
          window.lastMouseY = e.clientY

          const sidebar = sidebarRef.current
          if (!sidebar.isDragging) return
          e.preventDefault()
          const y = e.pageY - sidebar.offsetTop
          const walk = (y - sidebar.startY) * 2 // Scroll speed multiplier
          sidebar.scrollTop = sidebar.initialScrollTop - walk
        }}
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
        style={{ cursor: 'grab', userSelect: 'none' }}
      >
        <div className="mobile-sidebar-header">
          <Link to="/" className="logo mobile-logo" onClick={closeMobileMenu}>
            <span className="logo-icon">🧩</span>
            <span className="logo-text">Puzzle of Blessings</span>
          </Link>
        </div>

        <div className="mobile-sidebar-content">
          {navItems.map((item, index) => (
            <Link
              key={item.path}
              ref={el => mobileLinksRef.current[index] = el}
              to={item.path}
              className={`mobile-nav-link ${item.isCentro ? 'mobile-nav-centro' : ''} ${activeMobileIndex === index ? 'active' : ''}`}
              onClick={(e) => handleNavClick(e, item.path)}
              draggable="false"
              onDragStart={(e) => e.preventDefault()}
              onMouseEnter={() => setActiveMobileIndex(index)}
            >
              {item.label}
            </Link>
          ))}

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
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', alignItems: 'center' }}>
                <button className="btn-login mobile-btn-login" onClick={handleLogin}>
                  Log In
                </button>
                <button className="btn-signup-ghost" style={{ width: '100%', maxWidth: '250px' }} onClick={() => navigate('/register')}>
                  Sign Up
                  <img
                    src="/img/unloggeduser/UnloggedUser.png"
                    alt="User"
                    className="nav-user-icon mobile-user-icon"
                  />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default Navbar
