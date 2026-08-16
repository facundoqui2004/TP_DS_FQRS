import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Normalizar roles
export const normalizeRole = (role) => {
    if (!role) return null;
    
    const roleUpper = String(role).toUpperCase().trim();
    
    switch (roleUpper) {
        case 'METAHUMANO':
        case 'META':
            return 'METAHUMANO';
        case 'BUROCRATA':
        case 'BURO':
            return 'BUROCRATA';
        case 'ADMIN':
        case 'ADMINISTRATOR':
            return 'ADMIN';
        default:
            return roleUpper;
    }
};

const ProtectedRoute = ({ children, requiredRole = null, allowedRoles = [] }) => {
    const { isAuthenticated, user } = useAuth();

    // Si no está autenticado, redirigir al login
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    const userRole = normalizeRole(user?.role);

    // Combinar requiredRole y allowedRoles en una lista normalizada
    const allowedList = [
        ...(Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles]),
        ...(requiredRole ? [requiredRole] : [])
    ]
        .filter(Boolean)
        .map(r => normalizeRole(r));

    // Si se especificaron roles permitidos, verificar pertenencia
    if (allowedList.length > 0 && (!userRole || !allowedList.includes(userRole))) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;
