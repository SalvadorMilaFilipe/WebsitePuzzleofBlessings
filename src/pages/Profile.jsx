import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { formatBlessingImage } from '../utils/formatUtils'
import '../../css/profile.css'

function Profile() {
    const { session, userProfile, loading, supabase } = useAuth()
    const navigate = useNavigate()

    const [allBlessings, setAllBlessings] = useState([])
    const [unlockedIds, setUnlockedIds] = useState(new Set())
    const [blessingsLoading, setBlessingsLoading] = useState(true)
    const [collectibles, setCollectibles] = useState([])

    useEffect(() => {
        if (!loading && !session) {
            navigate('/')
        }
        if (userProfile?.pl_id) {
            fetchBlessingsData()
            fetchCollectiblesData()
        }
    }, [session, loading, navigate, userProfile])

    const fetchBlessingsData = async () => {
        try {
            setBlessingsLoading(true)
            if (!supabase) return;

            const { data: allB, error: bError } = await supabase
                .from('blessing')
                .select('*, category:category(cat_name)')
                .order('bl_id')

            if (bError) throw bError
            
            // Filter out Admin NoClip for normal count/view
            const filteredBlessings = (allB || []).filter(b => b.bl_name !== 'Admin NoClip');
            setAllBlessings(filteredBlessings)

            const { data: unlocked, error: uError } = await supabase
                .from('player_blessing')
                .select('bl_id')
                .eq('pl_id', userProfile.pl_id)

            if (uError) throw uError
            const unlockedSet = new Set(unlocked.map(u => u.bl_id))
            setUnlockedIds(unlockedSet)

        } catch (err) {
            console.error('Error fetching blessings:', err.message)
        } finally {
            setBlessingsLoading(false)
        }
    }

    const fetchCollectiblesData = async () => {
        try {
            if (!supabase || !userProfile?.pl_id) return;
            const { data, error } = await supabase
                .from('player_collectible')
                .select('cl_id, collectible:collectible(cl_name)')
                .eq('pl_id', userProfile.pl_id)
            if (error) throw error
            setCollectibles(data || [])
        } catch (err) {
            console.error('Error fetching collectibles:', err.message)
        }
    }



    if (loading) {
        return (
            <div className="profile-loading" style={{ paddingTop: '150px', textAlign: 'center', color: 'white' }}>
                <div className="loader"></div>
                <p>Loading your destiny...</p>
            </div>
        )
    }

    if (!session || !userProfile) return null

    return (
        <main className="profile-main" style={{ paddingTop: '100px' }}>
            <div className="container">
                <div className="profile-container">
                    {/* Banner Section */}
                    <div className="profile-banner-container">
                        {userProfile.pl_banner ? (
                            <img src={userProfile.pl_banner} alt="Banner" className="profile-banner-img" />
                        ) : (
                            <div className="profile-banner-placeholder"></div>
                        )}
                    </div>

                    {/* Header with Overlay Avatar */}
                    <div className="profile-header-content">
                        <div className="profile-avatar-wrapper">
                            <img
                                src="/img/Player_without_image.png"
                                alt="Avatar"
                                className="profile-avatar-img"
                            />
                        </div>
                        <div className="profile-title-section" style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingBottom: '1rem' }}>
                            <div className="profile-name-info">
                                <h1 className="profile-username" style={{ margin: 0, lineHeight: 1.2 }}>{userProfile.pl_username}</h1>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '5px' }}>
                                    <p className="profile-realname" style={{ margin: 0 }}>{userProfile.pl_username_game}</p>
                                    <span style={{
                                        fontSize: '0.8rem',
                                        background: 'rgba(255,255,255,0.05)',
                                        padding: '5px 12px',
                                        borderRadius: '12px',
                                        color: '#fff',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        border: '1px solid rgba(255,255,255,0.1)'
                                    }}>
                                        <div style={{
                                            width: '8px',
                                            height: '8px',
                                            borderRadius: '50%',
                                            backgroundColor: userProfile.status?.st_color || '#6B7280',
                                            boxShadow: `0 0 8px ${userProfile.status?.st_color || '#6B7280'}`,
                                            flexShrink: 0
                                        }}></div>
                                        <span style={{ textTransform: 'capitalize' }}>
                                            {userProfile.status?.st_status || 'offline'}
                                        </span>
                                    </span>

                                </div>
                            </div>

                            <button
                                className="edit-profile-btn"
                                onClick={() => navigate('/edit-profile')}
                                style={{
                                    background: 'rgba(129, 216, 158, 0.1)',
                                    border: '1px solid #81D89E',
                                    color: '#81D89E',
                                    padding: '0.5rem 1.2rem',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '0.9rem',
                                    fontWeight: 600,
                                    transition: 'all 0.2s',
                                    marginBottom: '5px'
                                }}
                                onMouseOver={(e) => {
                                    e.target.style.background = 'rgba(129, 216, 158, 0.2)'
                                    e.target.style.transform = 'translateY(-2px)'
                                }}
                                onMouseOut={(e) => {
                                    e.target.style.background = 'rgba(129, 216, 158, 0.1)'
                                    e.target.style.transform = 'translateY(0)'
                                }}
                            >
                                Edit Profile
                            </button>
                        </div>
                    </div>

                    <div className="profile-body">
                        {/* Description Section */}
                        <section className="profile-section">
                            <h3>Description</h3>
                            <div className="profile-description">
                                {userProfile.pl_description || "This player hasn't written their story yet..."}
                            </div>
                        </section>

                        {/* Player Attributes Section */}
                        <section className="profile-section">
                            <h3>Player Attributes</h3>
                            <div className="attributes-info">
                                Not available in this phase of the game.
                            </div>
                        </section>

                        {/* Blessings Section */}
                        <section className="profile-section">
                            <h3>Blessings ({allBlessings.filter(b => unlockedIds.has(b.bl_id)).length} / {allBlessings.length})</h3>
                            <p className="stat-card-total">Colored for obtained, gray for locked.</p>
                            <div className="profile-stats-grid">
                                {blessingsLoading ? (
                                    <p>Loading blessings...</p>
                                ) : allBlessings.length > 0 ? (
                                    allBlessings.map((b) => {
                                        const isUnlocked = unlockedIds.has(b.bl_id)
                                        return (
                                            <div
                                                key={b.bl_id}
                                                className={`item-card blessing-card ${isUnlocked ? 'obtained' : 'unobtained'}`}
                                                title={isUnlocked ? b.bl_name : "Locked"}
                                            >
                                                <div className="blessing-img-container">
                                                    <img
                                                        src={`/blessingcardmodels/${formatBlessingImage(b.bl_image || b.bl_name)}`}
                                                        alt={b.bl_name}
                                                        className="blessing-card-img"
                                                    />
                                                </div>
                                                <span className="item-card-name">{isUnlocked ? b.bl_name : "? ? ?"}</span>
                                                {isUnlocked && b.bl_rarity && (
                                                    <span className={`rarity-badge ${b.bl_rarity.toLowerCase()}`}>
                                                        {b.bl_rarity}
                                                    </span>
                                                )}
                                            </div>
                                        )
                                    })
                                ) : (
                                    <p>No blessings found in the scroll of destiny.</p>
                                )}
                            </div>
                        </section>

                        {/* Collectibles Section */}
                        {collectibles.length > 0 && (
                            <section className="profile-section">
                                <h3>Collectibles ({collectibles.length})</h3>
                                <div className="profile-stats-grid">
                                    {collectibles.map((c, idx) => (
                                        <div key={idx} className="item-card obtained">
                                            <span className="item-card-icon">🏺</span>
                                            <span className="item-card-name">{c.collectible?.cl_name || `Collectible #${c.cl_id}`}</span>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>
                </div>
            </div>
        </main>
    )
}

export default Profile
