import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import '../../css/profile.css'

function EditProfile() {
    const { session, userProfile, loading, refreshProfile } = useAuth()
    const navigate = useNavigate()

    // Estados para campos editáveis
    const [formData, setFormData] = useState({
        pl_username: '',
        pl_username_game: '',
        pl_description: ''
    })

    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState({ text: '', type: '' })

    useEffect(() => {
        if (!loading && !session) {
            navigate('/')
        }
        if (userProfile) {
            setFormData({
                pl_username: userProfile.pl_username || '',
                pl_username_game: userProfile.pl_username_game || '',
                pl_description: userProfile.pl_description || ''
            })
        }
    }, [session, loading, navigate, userProfile])

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSaving(true)
        setMessage({ text: '', type: '' })

        try {
            const { error } = await supabase
                .from('player') // Updated from jogador
                .update({
                    pl_username: formData.pl_username,
                    pl_username_game: formData.pl_username_game,
                    pl_description: formData.pl_description
                })
                .eq('pl_email', session.user.email) // Updated from jo_email

            if (error) throw error

            setMessage({ text: 'Perfil atualizado com sucesso!', type: 'success' })
            refreshProfile()
            setTimeout(() => navigate('/profile'), 1500)
        } catch (err) {
            console.error(err)
            setMessage({ text: 'Erro ao atualizar perfil: ' + err.message, type: 'error' })
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="profile-loading" style={{ paddingTop: '150px', textAlign: 'center', color: 'white' }}>
                <div className="loader"></div>
                <p>A carregar dados...</p>
            </div>
        )
    }

    if (!session || !userProfile) return null

    return (
        <main className="profile-main" style={{ paddingTop: '100px', paddingBottom: '50px' }}>
            <div className="container">
                <div className="profile-container" style={{ maxWidth: '800px', margin: '0 auto', background: 'rgba(20, 20, 30, 0.95)', border: '1px solid rgba(255,255,255,0.1)' }}>

                    <div style={{ padding: '2rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                        <h2 style={{ color: '#81D89E', margin: 0 }}>Editar Perfil</h2>
                        <p style={{ color: '#888', marginTop: '0.5rem' }}>Personalize a sua identidade no site e no jogo.</p>
                    </div>

                    <form onSubmit={handleSubmit} style={{ padding: '2rem' }}>

                        {/* SECÇÃO: Dados do Site */}
                        <section style={{ marginBottom: '2.5rem' }}>
                            <h3 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '1.2rem', borderLeft: '3px solid #81D89E', paddingLeft: '10px' }}>
                                Identidade no Site
                            </h3>

                            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                                <label style={{ color: '#ccc', display: 'block', marginBottom: '0.5rem' }}>Nome de Utilizador (Site)</label>
                                <input
                                    type="text"
                                    name="pl_username" // Updated
                                    value={formData.pl_username}
                                    onChange={handleChange}
                                    style={{ width: '100%', padding: '0.8rem', background: 'rgba(0,0,0,0.2)', border: '1px solid #444', borderRadius: '6px', color: '#fff' }}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label style={{ color: '#ccc', display: 'block', marginBottom: '0.5rem' }}>Descrição / Bio</label>
                                <textarea
                                    name="pl_description" // Updated
                                    value={formData.pl_description}
                                    onChange={handleChange}
                                    rows="4"
                                    placeholder="Escreve algo sobre ti..."
                                    style={{ width: '100%', padding: '0.8rem', background: 'rgba(0,0,0,0.2)', border: '1px solid #444', borderRadius: '6px', color: '#fff', resize: 'vertical' }}
                                ></textarea>
                            </div>
                        </section>

                        {/* SECÇÃO: Dados do Jogo */}
                        <section style={{ marginBottom: '2.5rem' }}>
                            <h3 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '1.2rem', borderLeft: '3px solid #4CAF50', paddingLeft: '10px' }}>
                                Identidade no Jogo (Unity)
                            </h3>

                            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                                <label style={{ color: '#ccc', display: 'block', marginBottom: '0.5rem' }}>Nome de Jogador (In-Game)</label>
                                <input
                                    type="text"
                                    name="pl_username_game" // Updated
                                    value={formData.pl_username_game}
                                    onChange={handleChange}
                                    style={{ width: '100%', padding: '0.8rem', background: 'rgba(0,0,0,0.2)', border: '1px solid #444', borderRadius: '6px', color: '#fff' }}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label style={{ color: '#ccc', display: 'block', marginBottom: '0.8rem' }}>Estado Atual</label>
                                <div style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    padding: '0.8rem 1.2rem',
                                    background: 'rgba(255,255,255,0.05)',
                                    borderRadius: '8px',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    color: '#fff'
                                }}>
                                    <div style={{
                                        width: '10px',
                                        height: '10px',
                                        borderRadius: '50%',
                                        backgroundColor: userProfile.status?.st_color || '#6B7280',
                                        boxShadow: `0 0 10px ${userProfile.status?.st_color || '#6B7280'}`
                                    }}></div>
                                    <span style={{ textTransform: 'capitalize', fontWeight: '500' }}>
                                        {userProfile.status?.st_status || 'offline'}
                                    </span>
                                    <small style={{ color: '#888', marginLeft: '10px', fontStyle: 'italic' }}>
                                        (Calculado automaticamente pelas sessões)
                                    </small>
                                </div>
                            </div>
                        </section>

                        {/* SECÇÃO: Dados Inalteráveis */}
                        <section style={{ marginBottom: '2.5rem', opacity: 0.7 }}>
                            <h3 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '1.2rem', borderLeft: '3px solid #666', paddingLeft: '10px' }}>
                                Informação de Conta (Inalterável)
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: 'rgba(0,0,0,0.1)', padding: '1rem', borderRadius: '8px' }}>
                                <div>
                                    <small style={{ color: '#888' }}>ID Único</small>
                                    <p style={{ color: '#fff', margin: '4px 0' }}>{userProfile.pl_code}</p>
                                </div>
                                <div>
                                    <small style={{ color: '#888' }}>E-mail Associado</small>
                                    <p style={{ color: '#fff', margin: '4px 0' }}>{userProfile.pl_email}</p>
                                </div>
                                <div>
                                    <small style={{ color: '#888' }}>País</small>
                                    <p style={{ color: '#fff', margin: '4px 0' }}>{userProfile.pl_country || 'Não definido'}</p>
                                </div>
                                <div>
                                    <small style={{ color: '#888' }}>Ano de Nascimento</small>
                                    <p style={{ color: '#fff', margin: '4px 0' }}>{userProfile.pl_birth_year}</p>
                                </div>
                            </div>
                        </section>

                        {message.text && (
                            <div style={{
                                padding: '1rem',
                                borderRadius: '6px',
                                marginBottom: '1.5rem',
                                textAlign: 'center',
                                background: message.type === 'success' ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)',
                                color: message.type === 'success' ? '#4CAF50' : '#f44336',
                                border: `1px solid ${message.type === 'success' ? '#4CAF50' : '#f44336'}`
                            }}>
                                {message.text}
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                            <button
                                type="button"
                                onClick={() => navigate('/profile')}
                                className="btn-secondary"
                                style={{ flex: 1, padding: '1rem', cursor: 'pointer', borderRadius: '8px' }}
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                className="btn-primary"
                                style={{ flex: 2, padding: '1rem', cursor: 'pointer', borderRadius: '8px', fontWeight: 'bold' }}
                            >
                                {saving ? 'A Guardar...' : 'Guardar Alterações'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </main>
    )
}

export default EditProfile
