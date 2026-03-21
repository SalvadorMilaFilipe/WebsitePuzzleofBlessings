import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './InactivityModal.css';

const InactivityModal = () => {
    const { showInactivityMessage, setShowInactivityMessage } = useAuth();
    const navigate = useNavigate();

    if (!showInactivityMessage) return null;

    const handleClose = () => {
        setShowInactivityMessage(false);
    };

    const handleLoginAgain = () => {
        setShowInactivityMessage(false);
        navigate('/login');
    };

    return (
        <div className="inactivity-overlay" onClick={handleClose}>
            <div className="inactivity-modal" onClick={(e) => e.stopPropagation()}>
                <div className="inactivity-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
                <h2>Disconnected for Inactivity</h2>
                <p>You have to login again.</p>
                <div className="inactivity-actions">
                    <button className="btn-inactivity-primary" onClick={handleLoginAgain}>
                        Login Again
                    </button>
                    <button className="btn-inactivity-secondary" onClick={handleClose}>
                        Dismiss
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InactivityModal;
