import { useState, useEffect } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { countries } from '../utils/countries'
import './Register.css'

function Register() {
    const { session, isNewUser, userProfile, signupWithEmail, completeRegistration, logout, loading: authLoading } = useAuth()
    const navigate = useNavigate()
    
    // Step logic:
    // 0: Create account (email + password) - only if no session
    // 1: Profile details
    // 2: Game details
    const [step, setStep] = useState(session ? 1 : 0)
    
    // Form states
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [username, setUsername] = useState('')
    const [sitePassword, setSitePassword] = useState('')
    const [gameUser, setGameUser] = useState('')
    const [gamePassword, setGamePassword] = useState('')
    const [birthYear, setBirthYear] = useState(new Date().getFullYear())
    const [country, setCountry] = useState('')
    
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    // Redirect if already has profile
    if (!authLoading && session && !isNewUser && userProfile) {
        return <Navigate to="/" replace />
    }

    // Auto-advance to profile step after signup or OAuth login
    useEffect(() => {
        if (!authLoading && session && step === 0) {
            setStep(1)
        }
    }, [session, authLoading, step])

    const handleCreateAccount = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            await signupWithEmail(email, password)
            // useEffect will move us to step 1
        } catch (err) {
            setError(err.message || 'Account creation failed')
        } finally {
            setLoading(false)
        }
    }

    const handleNextStep = (e) => {
        e.preventDefault()
        setError('')
        if (!username.trim()) {
            setError('System Username is required')
            return
        }
        setStep(2)
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
            await completeRegistration(username, gameUser, gamePassword, sitePassword, birthYear, country)
            navigate('/')
        } catch (err) {
            console.error(err)
            setError(err.message || 'Error creating profile. Username might be taken.')
        } finally {
            setLoading(false)
        }
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
                    {!session && <span className={step === 0 ? 'active' : ''}>0. Account</span>}
                    <span className={step === 1 ? 'active' : ''}>1. Profile</span>
                    <span className={step === 2 ? 'active' : ''}>2. Game</span>
                </div>

                <h2>
                    {step === 0 ? 'Create Account' : step === 1 ? 'Configure Profile' : 'Game Account'}
                </h2>
                
                <p>
                    {step === 0 
                        ? 'Join our realm and start your adventure.' 
                        : `Welcome${session?.user?.user_metadata?.full_name ? ', ' + session.user.user_metadata.full_name.split(' ')[0] : ''}! Please complete your details.`}
                </p>

                {step === 0 && (
                    <form onSubmit={handleCreateAccount}>
                        <div className="form-group">
                            <label htmlFor="reg-email">Email</label>
                            <input
                                type="email"
                                id="reg-email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="mage@example.com"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="reg-password">Password</label>
                            <input
                                type="password"
                                id="reg-password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                minLength={6}
                            />
                        </div>
                        {error && <p className="error-message">{error}</p>}
                        <div className="register-actions">
                            <button type="button" className="btn-secondary" onClick={() => navigate('/login')}>
                                ← Back to Login
                            </button>
                            <button type="submit" className="btn-primary" disabled={loading}>
                                {loading ? 'Creating...' : 'Create Account →'}
                            </button>
                        </div>
                    </form>
                )}

                {step === 1 && (
                    <form onSubmit={handleNextStep}>
                        <div className="form-group">
                            <label>Email (Verified)</label>
                            <input
                                type="email"
                                value={session?.user?.email || ''}
                                readOnly
                                disabled
                                style={{ opacity: 0.6, cursor: 'not-allowed' }}
                            />
                            <small>Account linked via {session?.user?.app_metadata?.provider || 'Auth System'}.</small>
                        </div>

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

                        <div className="form-group">
                            <label htmlFor="sitePassword">Site Password</label>
                            <input
                                type="password"
                                id="sitePassword"
                                value={sitePassword}
                                onChange={(e) => setSitePassword(e.target.value)}
                                placeholder="Set a password for future portal logins"
                                required
                            />
                        </div>

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
                            <button type="button" className="btn-secondary" onClick={() => logout()}>
                                Logout & Exit
                            </button>
                            <button type="submit" className="btn-primary">
                                Profile Done →
                            </button>
                        </div>
                    </form>
                )}

                {step === 2 && (
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
                            <input
                                type="password"
                                id="gamePassword"
                                value={gamePassword}
                                onChange={(e) => setGamePassword(e.target.value)}
                                placeholder="Exclusive password for Unity engine"
                                required
                            />
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
                    </form>
                )}
            </div>
        </div>
    )
}

export default Register 
