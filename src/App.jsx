import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import MainMenu from './pages/MainMenu'
import Download from './pages/Download'
import Centro from './pages/Centro'
import Forum from './pages/Forum'
import Wiki from './pages/Wiki'
import UpdateLog from './pages/UpdateLog'
import Credits from './pages/Credits'
import Profile from './pages/Profile'
import EditProfile from './pages/EditProfile'
import { AuthProvider } from './context/AuthContext'
import RegistrationModal from './components/RegistrationModal'
import LoginModal from './components/LoginModal'

function App() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)

  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar onOpenLogin={() => setIsLoginModalOpen(true)} />
          <RegistrationModal />
          <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
          <Routes>
            <Route path="/" element={<MainMenu />} />
            <Route path="/download" element={<Download />} />
            <Route path="/centro" element={<Centro />} />
            <Route path="/forum" element={<Forum />} />
            <Route path="/wiki" element={<Wiki />} />
            <Route path="/updatelog" element={<UpdateLog />} />
            <Route path="/credits" element={<Credits />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/edit-profile" element={<EditProfile />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App

