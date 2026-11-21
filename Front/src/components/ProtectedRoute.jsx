import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { normalizeRole } from '../utils/roles';

const ProtectedRoute = ({ children, requiredRole = null, allowedRoles = [] }) => {
    const { isAuthenticated, user, checkingSession } = useAuth();

    // Mientras el servidor confirma la sesión y el rol, no mostrar nada
    // (así un rol editado en localStorage no llega a renderizar la ruta)
    if (checkingSession) {
        return null;
    }

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
