import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function AuthRedirect() {
    const { isNewUser, session, userProfile } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()

    useEffect(() => {
        // Se há sessão mas não há perfil na tabela jogador -> obrigar a completar registo
        // Só redirecionamos se não estivermos já na página de registo
        if (session && isNewUser && !userProfile && location.pathname !== '/register') {
            console.log('[AuthRedirect] New user detected without profile. Redirecting to /register');
            navigate('/register', { replace: true })
        }
    }, [isNewUser, session, userProfile, location.pathname, navigate])

    return null // Não renderiza nada — só lógica
}

export default AuthRedirect 
