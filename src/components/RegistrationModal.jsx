import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { countries } from '../utils/countries'
import './RegistrationModal.css'

function RegistrationModal() {
    const { isNewUser, completeRegistration, logout, session } = useAuth()
    const [step, setStep] = useState(1)
    const [username, setUsername] = useState('')
    const [sitePassword, setSitePassword] = useState('')
    const [gameUser, setGameUser] = useState('')
    const [gamePassword, setGamePassword] = useState('')
    const [birthYear, setBirthYear] = useState(new Date().getFullYear())
    const [country, setCountry] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    if (!isNewUser) return null // Don't render if not a new user

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
        } catch (err) {
            console.error(err)
            setError(err.message || 'Error creating profile. Username might be taken.')
        } finally {
            setLoading(false)
        }
    }

    const currentYear = new Date().getFullYear()
    const years = Array.from({ length: currentYear - 1900 + 1 }, (_, i) => currentYear - i)

    // Helper to get flag emoji
    const getFlagEmoji = (countryCode) => {
        return countryCode
            .toUpperCase()
            .replace(/./g, char => String.fromCodePoint(char.charCodeAt(0) + 127397))
    }

    return (
        <div className="registration-modal-overlay">
            <div className="registration-modal">
                <div className="step-indicator">
                    <span className={step === 1 ? 'active' : ''}>1. Perfil</span>
                    <span className={step === 2 ? 'active' : ''}>2. Jogo</span>
                </div>

                {session?.user?.app_metadata?.provider === 'google' && (
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                        <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" style={{ width: '24px' }} />
                    </div>
                )}

                <h2>{step === 1 ? 'Configurar Perfil' : 'Conta do Jogo'}</h2>
                <p>Quase lá, <strong>{session?.user?.user_metadata?.full_name?.split(' ')[0] || 'Jogador'}</strong>! Precisamos de mais uns detalhes para a tua conta.</p>

                {step === 1 ? (
                    <form onSubmit={handleNextStep}>
                        <div className="form-group">
                            <label htmlFor="username">Username Público</label>
                            <input
                                type="text"
                                id="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Como queres ser visto no site"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="sitePassword">Palavra-passe do Site</label>
                            <input
                                type="password"
                                id="sitePassword"
                                value={sitePassword}
                                onChange={(e) => setSitePassword(e.target.value)}
                                placeholder="Define uma password para o portal"
                                required
                            />
                            {session?.user?.app_metadata?.provider === 'google' && (
                                <small>Como entraste com Google, define esta para login via email se preferires no futuro.</small>
                            )}
                        </div>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <div className="form-group" style={{ flex: 1 }}>
                                <label htmlFor="birthYear">Ano Nascimento</label>
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

                            <div className="form-group" style={{ flex: 1 }}>
                                <label htmlFor="country">País</label>
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
                                        <option value="">Selecionar...</option>
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

                        <div className="modal-actions">
                            <button type="button" className="btn-secondary" onClick={logout}>
                                Cancelar
                            </button>
                            <button type="submit" className="btn-primary">
                                Seguinte →
                            </button>
                        </div>
                    </form>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="gameUser">Username no Jogo (Unity)</label>
                            <input
                                type="text"
                                id="gameUser"
                                value={gameUser}
                                onChange={(e) => setGameUser(e.target.value)}
                                placeholder="O teu nome dentro do jogo"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="gamePassword">Palavra-passe do Jogo</label>
                            <input
                                type="password"
                                id="gamePassword"
                                value={gamePassword}
                                onChange={(e) => setGamePassword(e.target.value)}
                                placeholder="Password exclusiva para o Unity"
                                required
                            />
                        </div>

                        {error && <p className="error-message">{error}</p>}

                        <div className="modal-actions">
                            <button type="button" className="btn-secondary" onClick={() => setStep(1)} disabled={loading}>
                                ← Voltar
                            </button>
                            <button type="submit" className="btn-primary" disabled={loading}>
                                {loading ? 'A processar...' : 'Concluir Registo'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    )
}

export default RegistrationModal
