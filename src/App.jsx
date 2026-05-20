import { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import InactivityModal from './components/InactivityModal'
import { AuthProvider } from './context/AuthContext'
import AuthRedirect from './components/AuthRedirect'

// Lazy load all pages for optimized page transitions and reduced bundle size
const Download = lazy(() => import('./pages/Download'))
const Centro = lazy(() => import('./pages/Centro'))
const Discoveries = lazy(() => import('./pages/Discoveries'))
const UpdateLog = lazy(() => import('./pages/UpdateLog'))
const Credits = lazy(() => import('./pages/Credits'))
const Profile = lazy(() => import('./pages/Profile'))
const EditProfile = lazy(() => import('./pages/EditProfile'))
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))

// Beautiful, glassmorphic loading animation themed after "Puzzle of Blessings"
function PageLoader() {
  return (
    <div className="premium-page-loader">
      <div className="loader-puzzle-container">
        <div className="loader-puzzle-piece p1"></div>
        <div className="loader-puzzle-piece p2"></div>
        <div className="loader-puzzle-piece p3"></div>
        <div className="loader-puzzle-piece p4"></div>
      </div>
      <div className="loader-text">Restoring Blessing...</div>
    </div>
  )
}

// Wrapper to handle scroll-to-top and trigger smooth page transitions on navigation
function AnimatedPage({ children }) {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [])

  return (
    <div className="page-transition-wrapper">
      {children}
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <AuthRedirect />
          <Navbar />
          <InactivityModal />
          {/* Suspense boundary handles the loading state with a premium themed animation */}
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<AnimatedPage><Download /></AnimatedPage>} />
              <Route path="/download" element={<Navigate to="/" replace />} />
              <Route path="/login" element={<AnimatedPage><Login /></AnimatedPage>} />
              <Route path="/register" element={<AnimatedPage><Register /></AnimatedPage>} />
              <Route path="/centro" element={<AnimatedPage><Centro /></AnimatedPage>} />
              <Route path="/discoveries" element={<AnimatedPage><Discoveries /></AnimatedPage>} />
              <Route path="/updatelog" element={<AnimatedPage><UpdateLog /></AnimatedPage>} />
              <Route path="/credits" element={<AnimatedPage><Credits /></AnimatedPage>} />
              <Route path="/profile" element={<AnimatedPage><Profile /></AnimatedPage>} />
              <Route path="/edit-profile" element={<AnimatedPage><EditProfile /></AnimatedPage>} />
            </Routes>
          </Suspense>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
