import { lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Centro from './pages/Centro'
import Wiki from './pages/Wiki'
import UpdateLog from './pages/UpdateLog'
import Credits from './pages/Credits'
import Profile from './pages/Profile'
import EditProfile from './pages/EditProfile'
import { AuthProvider } from './context/AuthContext'
import InactivityModal from './components/InactivityModal'
// Lazy load the Download page
const Download = lazy(() => import('./pages/Download'))
import Login from './pages/Login'
import Register from './pages/Register'

import AuthRedirect from './components/AuthRedirect'

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <AuthRedirect />
          <Navbar />
          <InactivityModal />
          <Suspense fallback={<div className="container" style={{ padding: '100px', textAlign: 'center' }}>Loading area...</div>}>
            <Routes>
              <Route path="/" element={<Download />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/centro" element={<Centro />} />
              <Route path="/wiki" element={<Wiki />} />
              <Route path="/updatelog" element={<UpdateLog />} />
              <Route path="/credits" element={<Credits />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/edit-profile" element={<EditProfile />} />
            </Routes>
          </Suspense>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App

