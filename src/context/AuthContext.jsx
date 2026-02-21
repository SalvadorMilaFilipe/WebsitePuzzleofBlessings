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
        } = supabase.auth.onAuthStateChange((event, currentSession) => {
            setSession(currentSession)

            if (currentSession) {
                if (currentSession.user.email !== lastFetchedEmail.current || !userProfile) {
                    fetchUserProfile(currentSession.user.email)
                }
            } else {
                setUserProfile(null)
                setIsNewUser(false)
                lastFetchedEmail.current = null
                setLoading(false)
            }
        })

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible' && lastFetchedEmail.current) {
                fetchUserProfile(lastFetchedEmail.current, true)
            }
        }

        document.addEventListener('visibilitychange', handleVisibilityChange)

        return () => {
            subscription.unsubscribe()
            document.removeEventListener('visibilitychange', handleVisibilityChange)
        }
    }, [])

    const fetchUserProfile = async (email, silent = false) => {
        if (fetchingProfile.current) return
        if (!silent) setLoading(true)

        fetchingProfile.current = true
        try {
            const { data, error } = await supabase
                .from('jogador')
                .select('*')
                .eq('jo_email', email)
                .maybeSingle() // maybeSingle avoids error if row not found

            if (error) {
                console.error('Error fetching profile:', error)
            } else if (data) {
                setUserProfile(data)
                setIsNewUser(false)
                lastFetchedEmail.current = email
            } else {
                setIsNewUser(true)
            }
        } catch (err) {
            console.error(err)
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
        const { error } = await supabase.auth.signOut()
        if (error) console.error('Error logging out:', error.message)
        // State clearing is handled by onAuthStateChange
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
