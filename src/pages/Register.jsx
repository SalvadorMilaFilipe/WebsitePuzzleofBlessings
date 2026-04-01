import { useState, useEffect } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { countries } from '../utils/countries'
import './Register.css'

function Register() {
    const { session, isNewUser, userProfile, signupWithEmail, completeRegistration, logout, loading: authLoading } = useAuth()
    const navigate = useNavigate()
    
    // Step logic: Now only 1 (Profile) and 2 (Game)
    const [step, setStep] = useState(1)
    
    // Form states
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [username, setUsername] = useState('')
    const [gameUser, setGameUser] = useState('')
    const [gamePassword, setGamePassword] = useState('')
    const [showGamePassword, setShowGamePassword] = useState(false)
    const [birthYear, setBirthYear] = useState(new Date().getFullYear())
    const [country, setCountry] = useState('')
    
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    // Redirect if already has profile
    if (!authLoading && session && !isNewUser && userProfile) {
        return <Navigate to="/" replace />
    }

    const handleNextStep = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            // Se não houver sessão, precisamos de criar a conta primeiro
            if (!session) {
                const cleanEmail = email.trim()
                if (!cleanEmail || !password) {
                    setError('Email and Password are required to create an account.')
                    setLoading(false)
                    return
                }
                await signupWithEmail(cleanEmail, password)
                // O signupWithEmail no AuthContext deve disparar a criação da sessão
                // Após o signup, o componente re-renderiza com session, e mantemos o step em 1
            }

            if (!username.trim()) {
                setError('Public Username is required')
                setLoading(false)
                return
            }

            setStep(2)
        } catch (err) {
            setError(err.message || 'Failed to initialize account.')
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        if (!gameUser.trim() || !gamePassword.trim()) {
            setError('Game Username and Password are required')
            setLoading(false)
            return
        }

        try {
            // Using 'password' (Account Password) as the Site Password to avoid confusion
            await completeRegistration(username.trim(), gameUser.trim(), gamePassword.trim(), password, birthYear, country)
            navigate('/')
        } catch (err) {
            console.error(err)
            setError(err.message || 'Error creating profile. Username might be taken.')
        } finally {
            setLoading(false)
        }
    }

    const handleLogoutExit = async () => {
        await logout()
        navigate('/')
    }

    const currentYear = new Date().getFullYear()
    const years = Array.from({ length: currentYear - 1900 + 1 }, (_, i) => currentYear - i)

    const getFlagEmoji = (countryCode) => {
        return countryCode
            .toUpperCase()
            .replace(/./g, char => String.fromCodePoint(char.charCodeAt(0) + 127397))
    }

    if (authLoading) return <div className="register-page-container">Loading session...</div>

    return (
        <div className="register-page-container">
            <div className="register-card">
                <div className="step-indicator">
                    {/* 0. Account removido conforme solicitado */}
                    <span className={step === 1 ? 'active' : ''}>1. Profile</span>
                    <span className={step === 2 ? 'active' : ''}>2. Game</span>
                </div>

                <h2>{step === 1 ? 'Configure Profile' : 'Game Account'}</h2>
                
                <p>
                    {session 
                        ? `Welcome${session?.user?.user_metadata?.full_name ? ', ' + session.user.user_metadata.full_name.split(' ')[0] : ''}! Please complete your details.` 
                        : 'Welcome, Traveler! Let\'s create your account and profile.'}
                </p>

                {step === 1 ? (
                    <form onSubmit={handleNextStep}>
                        {/* Se tiver sessão (Google), email é read-only. Se não, é editável para signup. */}
                        <div className="form-group">
                            <label htmlFor="reg-email">{session ? 'Email (Verified)' : 'Account Email'}</label>
                            <input
                                type="email"
                                id="reg-email"
                                value={session ? session.user.email : email}
                                onChange={(e) => setEmail(e.target.value)}
                                readOnly={!!session}
                                disabled={!!session}
                                style={session ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
                                placeholder="mage@example.com"
                                required
                            />
                            {session && <small>Account linked via {session?.user?.app_metadata?.provider || 'Auth System'}.</small>}
                        </div>

                        {!session && (
                            <div className="form-group">
                                <label htmlFor="reg-password">Account Password</label>
                                <div className="password-input-container">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        id="reg-password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Set account password"
                                        required
                                        minLength={6}
                                    />
                                    <button 
                                        type="button" 
                                        className="password-toggle-btn"
                                        onClick={() => setShowPassword(!showPassword)}
                                        title={showPassword ? "Hide" : "Show"}
                                    >
                                        {showPassword ? '👁️‍🗨️' : '👁️'}
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="form-group">
                            <label htmlFor="username">Public Username</label>
                            <input
                                type="text"
                                id="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="How you will be seen on the site"
                                required
                            />
                        </div>

                        {/* Site property removed and merged with Account Password to simplify login */}

                        <div className="flex-row">
                            <div className="form-group">
                                <label htmlFor="birthYear">Birth Year</label>
                                <select
                                    id="birthYear"
                                    value={birthYear}
                                    onChange={(e) => setBirthYear(Number(e.target.value))}
                                >
                                    {years.map((year) => (
                                        <option key={year} value={year}>{year}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="country">Country</label>
                                <div className="country-select-wrapper">
                                    {country && (
                                        <img
                                            src={`https://flagcdn.com/w20/${countries.find(c => c.name === country)?.code.toLowerCase()}.png`}
                                            alt=""
                                            className="selected-flag"
                                        />
                                    )}
                                    <select
                                        id="country"
                                        value={country}
                                        onChange={(e) => setCountry(e.target.value)}
                                        className={country ? 'has-flag' : ''}
                                    >
                                        <option value="">Select...</option>
                                        {countries.map((c) => (
                                            <option key={c.code} value={c.name}>
                                                {getFlagEmoji(c.code)} {c.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {error && <p className="error-message">{error}</p>}

                        <div className="register-actions">
                            <button type="button" className="btn-secondary" onClick={handleLogoutExit}>
                                Logout & Exit
                            </button>
                            <button type="submit" className="btn-primary" disabled={loading}>
                                {loading ? 'Processing...' : 'Profile Done →'}
                            </button>
                        </div>

                        <div className="register-login-link">
                            <p>Already have an account? <span onClick={() => navigate('/login')}>Log In</span></p>
                        </div>
                    </form>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="gameUser">In-Game Username (Unity)</label>
                            <input
                                type="text"
                                id="gameUser"
                                value={gameUser}
                                onChange={(e) => setGameUser(e.target.value)}
                                placeholder="Your name inside the game world"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="gamePassword">In-Game Password</label>
                            <div className="password-input-container">
                                <input
                                    type={showGamePassword ? "text" : "password"}
                                    id="gamePassword"
                                    value={gamePassword}
                                    onChange={(e) => setGamePassword(e.target.value)}
                                    placeholder="Exclusive password for Unity engine"
                                    required
                                />
                                <button 
                                    type="button" 
                                    className="password-toggle-btn"
                                    onClick={() => setShowGamePassword(!showGamePassword)}
                                    title={showGamePassword ? "Hide" : "Show"}
                                >
                                    {showGamePassword ? '👁️‍🗨️' : '👁️'}
                                </button>
                            </div>
                        </div>

                        {error && <p className="error-message">{error}</p>}

                        <div className="register-actions">
                            <button type="button" className="btn-secondary" onClick={() => setStep(1)} disabled={loading}>
                                ← Back
                            </button>
                            <button type="submit" className="btn-primary" disabled={loading}>
                                {loading ? 'Processing...' : 'Finish Registration'}
                            </button>
                        </div>

                        <div className="register-login-link">
                            <p>Already have an account? <span onClick={() => navigate('/login')}>Log In</span></p>
                        </div>
                    </form>
                )}
            </div>
        </div>
    )
}

export default Register 
