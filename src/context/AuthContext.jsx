import { createContext, useContext, useEffect, useState, useRef } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
    const [session, setSession] = useState(null)
    const [userProfile, setUserProfile] = useState(null) // Data from 'jogador' table
    const [loading, setLoading] = useState(true)
    const [isNewUser, setIsNewUser] = useState(false)
    const fetchingProfile = useRef(false)
    const lastFetchedEmail = useRef(null)
    const currentSiteSessionId = useRef(null)

    useEffect(() => {
        // Safety timeout: Never stay in loading state for more than 10 seconds
        const timeout = setTimeout(() => {
            if (loading) {
                console.warn('Auth loading safety timeout reached. Forcing loading to false.')
                setLoading(false)
            }
        }, 10000)

        // 1. Get initial session
        supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
            console.log('Initial session check:', initialSession ? 'Found' : 'Not found')
            setSession(initialSession)
            if (initialSession) {
                fetchUserProfile(initialSession.user.email)
            } else {
                setLoading(false)
            }
        })

        // 2. Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((event, currentSession) => {
            console.log('Auth state change event:', event)
            setSession(currentSession)

            if (currentSession) {
                if (currentSession.user.email !== lastFetchedEmail.current || !userProfile) {
                    fetchUserProfile(currentSession.user.email)
                }
            } else {
                // Clear state on logout
                setUserProfile(null)
                setIsNewUser(false)
                lastFetchedEmail.current = null
                currentSiteSessionId.current = null
                setLoading(false)
            }
        })

        const handleBeforeUnload = () => {
            if (currentSiteSessionId.current) {
                endSiteSession()
            }
        }

        window.addEventListener('beforeunload', handleBeforeUnload)

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible' && lastFetchedEmail.current) {
                fetchUserProfile(lastFetchedEmail.current, true)
            }
        }

        document.addEventListener('visibilitychange', handleVisibilityChange)

        return () => {
            clearTimeout(timeout)
            subscription.unsubscribe()
            document.removeEventListener('visibilitychange', handleVisibilityChange)
            window.removeEventListener('beforeunload', handleBeforeUnload)
        }
    }, [])

    // Effect to handle session creation once userProfile is loaded
    useEffect(() => {
        if (userProfile && session && !currentSiteSessionId.current) {
            startSiteSession(userProfile.jo_cod) // Pass ID now for DB consistency
        }
    }, [userProfile, session])

    const startSiteSession = async (playerName) => {
        if (!playerName) return
        try {
            console.log(`[Auth] Attempting to start site session for player: ${playerName}`)

            const now = new Date()
            const dateStr = now.toISOString().split('T')[0]
            const timeStr = now.toTimeString().split(' ')[0]

            const { data, error } = await supabase
                .from('sessao')
                .insert([{
                    se_jogador: playerName,
                    se_tipo: 'site',
                    se_dataini: dateStr,
                    se_horaini: timeStr
                }])
                .select('se_cod')
                .single()

            if (error) throw error
            currentSiteSessionId.current = data.se_cod
            console.log('[Auth] Site session started successfully:', data.se_cod)
        } catch (err) {
            console.error('[Auth] Fatal error starting site session:', err.message)
        }
    }

    const endSiteSession = async () => {
        if (!currentSiteSessionId.current) return
        const sessionId = currentSiteSessionId.current
        currentSiteSessionId.current = null // Clear immediately

        const now = new Date()
        const dateStr = now.toISOString().split('T')[0]
        const timeStr = now.toTimeString().split(' ')[0]

        try {
            console.log(`[Auth] Ending site session: ${sessionId}`)
            await supabase
                .from('sessao')
                .update({
                    se_datafim: dateStr,
                    se_horafim: timeStr
                })
                .eq('se_cod', sessionId)

            console.log('[Auth] Site session ended successfully')
        } catch (err) {
            console.error('[Auth] Error ending site session:', err.message)
        }
    }

    const fetchUserProfile = async (email, silent = false) => {
        if (!email) {
            setLoading(false)
            return
        }

        // If already fetching, don't start another one but ensure loading is handled if not silent
        if (fetchingProfile.current) {
            return
        }

        if (!silent) setLoading(true)
        fetchingProfile.current = true

        console.log(`[Auth] Fetching profile for: ${email}`)

        try {
            // First try with status join using explicitly named reference
            const { data, error } = await supabase
                .from('jogador')
                .select('*, status:fk_jogador_status(*)')
                .ilike('jo_email', email)
                .maybeSingle()

            if (error) {
                console.warn('[Auth] Join fetch failed, trying simple fetch:', error.message)
                // Fallback to simple fetch if join fails (e.g. table schema transition)
                const { data: simpleData, error: simpleError } = await supabase
                    .from('jogador')
                    .select('*')
                    .ilike('jo_email', email)
                    .maybeSingle()

                if (simpleError) throw simpleError

                if (simpleData) {
                    setUserProfile(simpleData)
                    setIsNewUser(false)
                } else {
                    setIsNewUser(true)
                }
            } else if (data) {
                setUserProfile(data)
                setIsNewUser(false)
                lastFetchedEmail.current = email
            } else {
                console.log('[Auth] No profile found in jogador table.')
                setIsNewUser(true)
            }
        } catch (err) {
            console.error('[Auth] Fatal error loading profile:', err)
            // Even on error, we don't want to show the loading screen forever
        } finally {
            setLoading(false)
            fetchingProfile.current = false
        }
    }

    const refreshProfile = () => {
        if (session?.user?.email) {
            fetchUserProfile(session.user.email, true)
        }
    }

    const loginWithGoogle = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin,
            },
        })
        if (error) console.error('Error logging in:', error.message)
    }

    const loginWithEmail = async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })
        if (error) throw error
        return data
    }

    const signupWithEmail = async (email, password) => {
        // Just create the auth user. The profile creation happens in RegistrationModal
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        })
        if (error) throw error
        return data
    }

    const logout = async () => {
        try {
            // 1. End the session in the database while we are still authenticated
            if (currentSiteSessionId.current) {
                await endSiteSession()
            }
            // 2. Clear session storage
            sessionStorage.removeItem('dailyRewardsCollected')
            sessionStorage.removeItem('isLoggedIn')

            // 3. Sign out from Supabase
            const { error } = await supabase.auth.signOut()
            if (error) throw error
        } catch (error) {
            console.error('Error during logout process:', error.message)
            // Even if database update fails, we force sign out
            await supabase.auth.signOut()
        }
    }

    const completeRegistration = async (username, gameUser, gamePassword, sitePassword = null, birthYear, country = null) => {
        if (!session || !session.user) return

        // Generate a random ID: # followed by 8 characters (letters and numbers)
        const generateJoId = () => {
            const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
            let result = '#'
            for (let i = 0; i < 8; i++) {
                result += characters.charAt(Math.floor(Math.random() * characters.length))
            }
            return result
        }

        const newProfile = {
            jo_id: generateJoId(),
            jo_user: username, // Site/System Username
            jo_email: session.user.email,
            jo_password_site: sitePassword, // Store site password (if email registration)
            jo_password_jogo: gamePassword, // Specific password for Unity
            jo_user_jogo: gameUser,       // Specific username for Unity
            jo_anonascimento: birthYear,
            jo_pais: country,
            jo_lingua: 'pt',
            jo_avatar: null
        }

        const { data, error } = await supabase
            .from('jogador')
            .insert([newProfile])
            .select()
            .single()

        if (error) throw error

        setUserProfile(data)
        setIsNewUser(false)
        return data
    }

    const [showInactivityMessage, setShowInactivityMessage] = useState(false)
    const inactivityTimer = useRef(null)

    const resetInactivityTimer = () => {
        if (inactivityTimer.current) clearTimeout(inactivityTimer.current)

        // Only set timer if user is logged in
        if (session) {
            inactivityTimer.current = setTimeout(async () => {
                console.log('[Auth] Inactivity timeout reached. Logging out...')
                await logout()
                setShowInactivityMessage(true)
            }, 30 * 60 * 1000) // 30 minutes
        }
    }

    useEffect(() => {
        // Events that define "activity"
        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart']

        const handleActivity = () => {
            resetInactivityTimer()
        }

        if (session) {
            events.forEach(event => window.addEventListener(event, handleActivity))
            resetInactivityTimer()
        } else {
            if (inactivityTimer.current) clearTimeout(inactivityTimer.current)
        }

        return () => {
            events.forEach(event => window.removeEventListener(event, handleActivity))
            if (inactivityTimer.current) clearTimeout(inactivityTimer.current)
        }
    }, [session])

    return (
        <AuthContext.Provider value={{
            session,
            userProfile,
            isNewUser,
            loading,
            showInactivityMessage,
            setShowInactivityMessage,
            loginWithGoogle,
            loginWithEmail,
            signupWithEmail,
            logout,
            completeRegistration,
            refreshProfile
        }}>
            {children}
        </AuthContext.Provider>
    )
}
