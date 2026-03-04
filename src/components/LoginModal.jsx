
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
            <div className="login-modal google-style" onClick={(e) => e.stopPropagation()}>
                <button className="close-btn" onClick={onClose}>×</button>
                <div className="google-header">
                    <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="google-logo" />
                    <h2>{isLoginView ? 'Sign in' : 'Create account'}</h2>
                    <p className="subtitle">to continue to Puzzle of Blessings</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            required
                            minLength={6}
                        />
                    </div>
                    {error && <p className="error-message">{error}</p>}

                    <div className="auth-footer">
                        <div className="toggle-view">
                            <span onClick={() => setIsLoginView(!isLoginView)}>
                                {isLoginView ? 'Create account' : 'Sign in instead'}
                            </span>
                        </div>
                        <button type="submit" className="btn-primary full-width" disabled={loading}>
                            {loading ? 'Processing…' : 'Next'}
                        </button>
                    </div>
                </form>

                <div className="divider"><span>OR</span></div>

                <button
                    type="button"
                    className="btn-google full-width"
                    onClick={handleGoogleLogin}
                    disabled={loading}
                >
                    <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="google-icon" />
                    {isLoginView ? 'Sign in with Google' : 'Sign up with Google'}
                </button>
            </div>
        </div>
    );
}

export default LoginModal
