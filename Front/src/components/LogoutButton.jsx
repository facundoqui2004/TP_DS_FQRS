import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const LogoutButton = ({ className = '', children = 'Cerrar Sesión' }) => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Error durante el logout:', error);
            // navegar al login
            navigate('/login');
        }
    };

    return (
        <button 
            onClick={handleLogout}
            className={className}
            type="button"
        >
            {children}
        </button>
    );
};

export default LogoutButton;
