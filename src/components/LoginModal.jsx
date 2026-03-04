
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import './LoginModal.css'

function LoginModal({ isOpen, onClose }) {
    const { loginWithGoogle, loginWithEmail, signupWithEmail } = useAuth()
    const [isLoginView, setIsLoginView] = useState(true) // Toggle Log In vs Sign Up
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    if (!isOpen) return null

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            if (isLoginView) {
                await loginWithEmail(email, password)
                onClose() // Close modal on success (auth state change will trigger profile check)
            } else {
                await signupWithEmail(email, password)
                // Check if email confirmation is required by Supabase settings. 
                // If auto-confirm is on, flow continues. If not, alert user.
                // Assuming auto-confirm for dev or user handles email link.
                onClose()
            }
        } catch (err) {
            console.error(err)
            setError(err.message || 'Authentication failed')
        } finally {
            setLoading(false)
        }
    }

    const handleGoogleLogin = async () => {
        try {
            await loginWithGoogle()
            onClose()
        } catch (err) {
            console.error(err)
            setError('Google Login failed')
        }
    }

    return (
        <div className="login-modal-overlay" onClick={onClose}>
            <div className="login-modal" onClick={(e) => e.stopPropagation()}>
                <button className="close-btn" onClick={onClose}>×</button>

                <h2>{isLoginView ? 'Welcome Back' : 'Create Account'}</h2>
                <p className="subtitle">
                    {isLoginView
                        ? 'Enter your credentials to access the realm.'
                        : 'Join us and start your journey.'}
                </p>

                <form onSubmit={handleSubmit}>
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
                            minLength={6}
                        />
                    </div>

                    {error && <p className="error-message">{error}</p>}

                    <button type="submit" className="btn-primary full-width" disabled={loading}>
                        {loading ? 'Processing...' : (isLoginView ? 'Log In' : 'Sign Up')}
                    </button>
                </form>

                <div className="divider">
                    <span>OR</span>
                </div>

                <button
                    type="button"
                    className="btn-google full-width"
                    onClick={handleGoogleLogin}
                    disabled={loading}
                >
                    <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="google-icon" />
                    {isLoginView ? 'Log in with Google' : 'Sign up with Google'}
                </button>

                <div className="toggle-view">
                    {isLoginView ? (
                        <p>Don't have an account? <span onClick={() => setIsLoginView(false)}>Sign Up</span></p>
                    ) : (
                        <p>Already have an account? <span onClick={() => setIsLoginView(true)}>Log In</span></p>
                    )}
                </div>

            </div>
        </div>
    )
}

export default LoginModal
