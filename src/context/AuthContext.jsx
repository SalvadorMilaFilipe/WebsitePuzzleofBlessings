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
                console.warn('[AuthContext] Auth loading safety timeout reached (20s). Forcing loading to false.')
                setLoading(false)
            }
        }, 20000) // Increased to 20s to handle slow DB connections

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
            startSiteSession(userProfile.pl_id) // Updated to pl_id
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
                .from('session') // Updated from sessao
                .insert([{
                    ss_player_id: playerName, // Updated from se_jogador
                    ss_type: 'site', // Updated from se_tipo
                    ss_date_start: dateStr, // Updated from se_dataini
                    ss_time_start: timeStr // Updated from se_horaini
                }])
                .select('ss_id') // Updated from se_cod
                .single()

            if (error) throw error
            currentSiteSessionId.current = data.ss_id
            console.log('[Auth] Site session started successfully:', data.ss_id)
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
                .from('session') // Updated from sessao
                .update({
                    ss_date_end: dateStr, // Updated from se_datafim
                    ss_time_end: timeStr // Updated from se_horafim
                })
                .eq('ss_id', sessionId) // Updated from se_cod

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
            console.log('[Auth] Database request started for:', email)
            const { data, error } = await supabase
                .from('player')
                .select('*')
                .ilike('pl_email', email)
                .maybeSingle()

            console.log('[Auth] Profile fetch result for email:', email, data ? 'Found' : 'Not found', error ? 'Error: ' + error.message : 'No error')

            if (error) throw error

            if (data) {
                console.log('[Auth] Profile found!')
                setUserProfile(data)
                setIsNewUser(false)
                lastFetchedEmail.current = email
            } else {
                console.log('[Auth] No profile found in player table. User is new.')
                setIsNewUser(true)
            }
        } catch (err) {
            console.error('[Auth] Fatal error loading profile:', err)
            // Even on error, we don't want to show the loading screen forever, 
            // and we assume a profile might need to be created if fetching failed.
            setIsNewUser(true) 
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
            pl_code: generateJoId(), // Updated from jo_id
            pl_username: username, // Updated from jo_user
            pl_email: session.user.email, // Updated from jo_email
            pl_password_site: sitePassword, // Updated from jo_password_site
            pl_password_game: gamePassword, // Updated from jo_password_jogo
            pl_username_game: gameUser,       // Updated from jo_user_jogo
            pl_birth_year: birthYear, // Updated from jo_anonascimento
            pl_country: country, // Updated from jo_pais
            pl_language: 'en', // Updated from jo_lingua, default to English
            pl_avatar_id: null // Updated from jo_avatar
        }

        console.log('[Auth] Attempting to complete registration for:', username)
        const { data, error } = await supabase
            .from('player') // Updated from jogador
            .upsert(newProfile, { onConflict: 'pl_email' }) // Added UPSERT logic to allow relinking existing progress if auth user was deleted
            .select()
            .single()

        if (error) {
            console.error('[Auth] Error in completeRegistration:', error)
            throw error
        }
        console.log('[Auth] Registration completed successfully in DB')

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
            refreshProfile,
            supabase
        }}>
            {children}
        </AuthContext.Provider>
    )
}
