import { useState, useEffect } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Login.css'

function Login() {
    const { session, loginWithGoogle, loginWithEmail, sendPasswordReset, isNewUser, userProfile, loading: authLoading } = useAuth()
    const navigate = useNavigate()
    
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    // Redireciona imediatamente se o utilizador já estiver logado e tiver perfil completo
    if (!authLoading && session && !isNewUser && userProfile) {
        return <Navigate to="/" replace />
    }

    const handleLoginSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            const trimmedEmail = email.trim()
            await loginWithEmail(trimmedEmail, password)
            // Não fazemos navigate('/') aqui. Deixamos o AuthRedirect.jsx 
            // ou o guard no topo deste ficheiro tratar do destino correto 
            // após o estado do AuthContext atualizar.
        } catch (err) {
            console.error('Login error:', err)
            let msg = err.message || 'Login failed. Please check your credentials.'
            if (msg.includes('Email not confirmed')) {
                msg = 'Account found, but email is not confirmed. Please check your inbox.'
            }
            if (msg.toLowerCase().includes('invalid login credentials')) {
                msg = 'Credenciais inválidas. Se a conta foi criada no painel do Supabase (ou não tens password definida), usa "Reset Password" para criar/alterar a password e depois tenta novamente.'
            }
            setError(msg)
            setLoading(false)
        }
    }

    const handleGoogleLogin = async () => {
        setError('')
        try {
            await loginWithGoogle()
        } catch (err) {
            setError('Google Login failed. Please try again.')
        }
    }

    const handleResetPassword = async () => {
        setError('')
        setLoading(true)
        try {
            const trimmedEmail = email.trim()
            if (!trimmedEmail) {
                setError('Please enter your email first.')
                return
            }
            await sendPasswordReset(trimmedEmail)
            setError('Password reset email sent! Check your inbox.')
        } catch (err) {
            setError(err.message || 'Failed to send reset email.')
        } finally {
            setLoading(false)
        }
    }

    if (authLoading && !session) return <div className="login-page-container">Checking authentication...</div>

    return (
        <div className="login-page-container">
            <div className="login-card">
                <h2>Welcome Back</h2>
                <p className="subtitle">Enter your credentials to access the realm.</p>
                
                <form onSubmit={handleLoginSubmit}>
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input 
                            type="email" 
                            id="email"
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            placeholder="mage@example.com" 
                            required 
                            disabled={loading}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <div className="password-input-container">
                            <input 
                                type={showPassword ? "text" : "password"} 
                                id="password"
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)} 
                                placeholder="••••••••" 
                                required 
                                disabled={loading}
                            />
                            <button 
                                type="button" 
                                className="password-toggle-btn"
                                onClick={() => setShowPassword(!showPassword)}
                                title={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? '👁️‍🗨️' : '👁️'}
                            </button>
                        </div>
                    </div>
                    {error && <p className="error-message">{error}</p>}
                    <button type="submit" className="btn-primary full-width" disabled={loading}>
                        {loading ? 'Logging in...' : 'Log In'}
                    </button>
                </form>

                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', marginTop: '12px' }}>
                    <button
                        type="button"
                        className="btn-google"
                        onClick={handleResetPassword}
                        disabled={loading}
                        style={{ background: 'rgba(255,255,255,0.06)', color: '#ddd', width: '100%' }}
                    >
                        Reset Password
                    </button>
                </div>

                <div className="divider"><span>OR</span></div>
                
                <button type="button" className="btn-google full-width" onClick={handleGoogleLogin} disabled={loading}>
                    <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="google-icon" />
                    Log in with Google
                </button>

                <div className="toggle-view">
                    <p>You don't have an account? <span onClick={() => navigate('/register')} style={{ cursor: 'pointer', color: '#81D89E', textDecoration: 'underline' }}>Sign Up</span></p>
                </div>
            </div>
        </div>
    )
}

export default Login 
