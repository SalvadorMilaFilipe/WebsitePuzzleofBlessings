import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Login.css'

function Login() {
    const { session, loginWithGoogle, loginWithEmail, isNewUser, userProfile } = useAuth()
    const navigate = useNavigate()
    
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    // Redireciona se o utilizador já estiver logado e tiver perfil completo
    if (session && !isNewUser && userProfile) {
        return <Navigate to="/" replace />
    }

    const handleLoginSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            await loginWithEmail(email, password)
            // Se o login for bem sucedido mas o perfil não estiver completo,
            // o AuthRedirect tratará do redirecionamento para /register
            if (!isNewUser) navigate('/')
        } catch (err) {
            setError(err.message || 'Login failed')
        } finally {
            setLoading(false)
        }
    }

    const handleGoogleLogin = async () => {
        try {
            await loginWithGoogle()
            // O redirect para / ou /register é tratado pelo Supabase e AuthRedirect
        } catch (err) {
            setError('Google Login failed')
        }
    }

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
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input 
                            type="password" 
                            id="password"
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            placeholder="••••••••" 
                            required 
                        />
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
                    <p>You don't have an account? <span onClick={() => navigate('/register')}>Sign Up</span></p>
                </div>
            </div>
        </div>
    )
}

export default Login 
