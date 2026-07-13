import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// normalizar roles
const normalizeRole = (role) => {
    if (!role) return null;
    
    const roleUpper = role.toUpperCase();
    
    switch (roleUpper) {
        case 'METAHUMANO':
        case 'META':
            return 'METAHUMANO';
        case 'BUROCRATA':
        case 'BURO':
            return 'BUROCRATA';
        case 'ADMIN':
        case 'ADMINISTRATOR':
            return 'admin';
        default:
            return role;
    }
};

const ProtectedRoute = ({ children, requiredRole = null }) => {
    const { isAuthenticated, user } = useAuth();

    // normalizar rol de usuario
    const userRole = normalizeRole(user?.role);

    console.log('Verificando acceso:', { 
        isAuthenticated, 
        user, 
        requiredRole,
        originalRole: user?.role,
        normalizedUserRole: userRole
    });

    // si no esta autenticado, redirigir al login
    if (!isAuthenticated) {
        console.log('Usuario no autenticado, redirigiendo a /login');
        return <Navigate to="/login" replace />;
    }

    // Si se requiere rol
    if (requiredRole && userRole !== requiredRole) {
        console.log(`Usuario no tiene el rol requerido: ${requiredRole}, tiene: ${userRole} (original: ${user?.role})`);
        return <Navigate to="/" replace />;
    }

    console.log('✅ Acceso permitido a la ruta protegida');
    return children;
};

export default ProtectedRoute;
