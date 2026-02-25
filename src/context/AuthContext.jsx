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
        // 1. Get initial session
        supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
            setSession(initialSession)
            if (initialSession) {
                fetchUserProfile(initialSession.user.email)
            } else {
                setLoading(false)
            }
        })

        // 2. Listen for auth changes (Only ONCE)
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
            setSession(currentSession)

            if (currentSession) {
                if (currentSession.user.email !== lastFetchedEmail.current || !userProfile) {
                    await fetchUserProfile(currentSession.user.email)
                }
            } else {
                // When logging out, we clear everything
                setUserProfile(null)
                setIsNewUser(false)
                lastFetchedEmail.current = null
                currentSiteSessionId.current = null
                setLoading(false)
            }
        })

        const handleBeforeUnload = () => {
            if (currentSiteSessionId.current) {
                // Use navigator.sendBeacon or a synchronous fetch if possible, 
                // but with Supabase/PostgREST we'll just try to close it.
                // Note: Reliability of this varies by browser.
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
            subscription.unsubscribe()
            document.removeEventListener('visibilitychange', handleVisibilityChange)
            window.removeEventListener('beforeunload', handleBeforeUnload)
        }
    }, [])

    // Effect to handle session creation once userProfile is loaded
    useEffect(() => {
        if (userProfile && session && !currentSiteSessionId.current) {
            startSiteSession(userProfile.jo_cod)
        }
    }, [userProfile, session])

    const startSiteSession = async (playerCod) => {
        try {
            const { data, error } = await supabase
                .from('sessao')
                .insert([{
                    se_jogador: playerCod,
                    se_tipo: 'site'
                }])
                .select('se_cod')
                .single()

            if (error) throw error
            currentSiteSessionId.current = data.se_cod
        } catch (err) {
            console.error('Error starting site session:', err)
        }
    }

    const endSiteSession = async () => {
        if (!currentSiteSessionId.current) return
        try {
            await supabase
                .from('sessao')
                .update({ se_datafim: new Date().toISOString() })
                .eq('se_cod', currentSiteSessionId.current)

            currentSiteSessionId.current = null
        } catch (err) {
            console.error('Error ending site session:', err)
        }
    }

    const fetchUserProfile = async (email, silent = false) => {
        if (fetchingProfile.current) return
        if (!silent) setLoading(true)

        console.log('Fetching profile for email:', email)
        fetchingProfile.current = true
        try {
            // First attempt with join
            const { data, error } = await supabase
                .from('jogador')
                .select('*, status:jo_status(*)')
                .eq('jo_email', email)
                .maybeSingle()

            if (error) {
                console.error('Error fetching profile with join:', error)
                // Fallback: try without join to see if it's a join issue (e.g. data type mismatch)
                const { data: simpleData, error: simpleError } = await supabase
                    .from('jogador')
                    .select('*')
                    .eq('jo_email', email)
                    .maybeSingle()

                if (simpleError) throw simpleError
                if (simpleData) {
                    console.warn('Profile found but status join failed. Check jo_status data type.')
                    setUserProfile(simpleData)
                    setIsNewUser(false)
                    lastFetchedEmail.current = email
                } else {
                    setIsNewUser(true)
                }
            } else if (data) {
                console.log('Profile loaded successfully:', data.jo_user)
                setUserProfile(data)
                setIsNewUser(false)
                lastFetchedEmail.current = email
            } else {
                console.log('No profile found for this email. Marking as new user.')
                setIsNewUser(true)
            }
        } catch (err) {
            console.error('Fetch profile fatal error:', err)
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
            // 2. Clear local storage just in case (optional, depends on your use case)
            localStorage.removeItem('dailyRewardsCollected')
            localStorage.removeItem('isLoggedIn')

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

    return (
        <AuthContext.Provider value={{ session, userProfile, isNewUser, loading, loginWithGoogle, loginWithEmail, signupWithEmail, logout, completeRegistration, refreshProfile }}>
            {children}
        </AuthContext.Provider>
    )
}
