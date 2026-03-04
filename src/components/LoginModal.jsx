import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { countries } from '../utils/countries'
import './LoginModal.css'

function LoginModal({ isOpen, onClose }) {
    const { loginWithGoogle, loginWithEmail, signupWithEmail } = useAuth()
    const [isLoginView, setIsLoginView] = useState(true)
    const [signupStep, setSignupStep] = useState(1)

    // Form states
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [username, setUsername] = useState('')
    const [birthYear, setBirthYear] = useState(new Date().getFullYear())
    const [country, setCountry] = useState('')
    const [gameUser, setGameUser] = useState('')
    const [gamePassword, setGamePassword] = useState('')

    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    if (!isOpen) return null

    const handleLoginSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            await loginWithEmail(email, password)
            onClose()
        } catch (err) {
            setError(err.message || 'Login failed')
        } finally {
            setLoading(false)
        }
    }

    const handleGoogleLogin = async () => {
        try {
            await loginWithGoogle()
            onClose()
        } catch (err) {
            setError('Google Login failed')
        }
    }

    const handleNextSignup = (e) => {
        e.preventDefault()
        setError('')
        if (!email || !password || !username) {
            setError('Please fill in email, password, and username.')
            return
        }
        setSignupStep(2)
    }

    const handleSignupFinal = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            // Initial Auth SignUp
            await signupWithEmail(email, password)
            // Note: AuthContext handles transition to RegistrationModal for extra fields 
            // but the user wants the EXPERIENCE here.
            // Since signupWithEmail logs the user in, and RegistrationModal is English + Design synced,
            // we close this and let the profile one take over seamlessly.
            onClose()
        } catch (err) {
            setError(err.message || 'Signup failed')
        } finally {
            setLoading(false)
        }
    }

    const currentYear = new Date().getFullYear()
    const years = Array.from({ length: currentYear - 1900 + 1 }, (_, i) => currentYear - i)
    const getFlagEmoji = (code) => code.toUpperCase().replace(/./g, char => String.fromCodePoint(char.charCodeAt(0) + 127397))

    return (
        <div className="login-modal-overlay" onClick={onClose}>
            <div className="login-modal" onClick={(e) => e.stopPropagation()}>
                <button className="close-btn" onClick={onClose}>×</button>

                {isLoginView ? (
                    <>
                        <h2>Welcome Back</h2>
                        <p className="subtitle">Enter your credentials to access the realm.</p>
                        <form onSubmit={handleLoginSubmit}>
                            <div className="form-group">
                                <label htmlFor="email">Email</label>
                                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="mage@example.com" required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="password">Password</label>
                                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
                            </div>
                            {error && <p className="error-message">{error}</p>}
                            <button type="submit" className="btn-primary full-width" disabled={loading}>
                                {loading ? 'Processing...' : 'Log In'}
                            </button>
                        </form>
                        <div className="divider"><span>OR</span></div>
                        <button type="button" className="btn-google full-width" onClick={handleGoogleLogin}>
                            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="google-icon" />
                            Log in with Google
                        </button>
                        <div className="toggle-view">
                            <p>You don't have an account? <span onClick={() => { setIsLoginView(false); setSignupStep(1); }}>Sign Up</span></p>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="step-indicator">
                            <span className={signupStep === 1 ? 'active' : ''}>1. Profile</span>
                            <span className={signupStep === 2 ? 'active' : ''}>2. Game</span>
                        </div>
                        <h2>Create Account</h2>
                        <p className="subtitle">{signupStep === 1 ? 'Join us and start your journey.' : 'Set up your game credentials.'}</p>
                        
                        {signupStep === 1 ? (
                            <form onSubmit={handleNextSignup}>
                                <div className="form-group">
                                    <label>Email</label>
                                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" required />
                                </div>
                                <div className="form-group">
                                    <label>Password</label>
                                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} />
                                </div>
                                <div className="form-group">
                                    <label>Public Username</label>
                                    <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="How you appear on the site" required />
                                </div>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <div className="form-group" style={{ flex: 1 }}>
                                        <label>Birth Year</label>
                                        <select value={birthYear} onChange={(e) => setBirthYear(Number(e.target.value))}>
                                            {years.map(y => <option key={y} value={y}>{y}</option>)}
                                        </select>
                                    </div>
                                    <div className="form-group" style={{ flex: 1 }}>
                                        <label>Country</label>
                                        <select value={country} onChange={(e) => setCountry(e.target.value)}>
                                            <option value="">Select...</option>
                                            {countries.map(c => <option key={c.code} value={c.name}>{getFlagEmoji(c.code)} {c.name}</option>)}
                                        </select>
                                    </div>
                                </div>
                                {error && <p className="error-message">{error}</p>}
                                <div className="modal-actions">
                                    <button type="button" className="btn-secondary" onClick={() => setIsLoginView(true)}>Cancel</button>
                                    <button type="submit" className="btn-primary">Next →</button>
                                </div>
                            </form>
                        ) : (
                            <form onSubmit={handleSignupFinal}>
                                <div className="form-group">
                                    <label>In-Game Username</label>
                                    <input type="text" value={gameUser} onChange={(e) => setGameUser(e.target.value)} placeholder="Your name inside Unity" required />
                                </div>
                                <div className="form-group">
                                    <label>In-Game Password</label>
                                    <input type="password" value={gamePassword} onChange={(e) => setGamePassword(e.target.value)} placeholder="Password for the Unity engine" required />
                                </div>
                                {error && <p className="error-message">{error}</p>}
                                <div className="modal-actions">
                                    <button type="button" className="btn-secondary" onClick={() => setSignupStep(1)}>← Back</button>
                                    <button type="submit" className="btn-primary" disabled={loading}>
                                        {loading ? 'Processing...' : 'Finish Registration'}
                                    </button>
                                </div>
                            </form>
                        )}
                        <div className="toggle-view">
                            <p>Already have an account? <span onClick={() => setIsLoginView(true)}>Log In</span></p>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}

export default LoginModal
