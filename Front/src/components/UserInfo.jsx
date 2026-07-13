import React from 'react';
import { useAuth } from '../context/AuthContext';
import { getUserFromCookie, isAuthenticated as checkCookieAuth } from '../utils/cookies';

const UserInfo = () => {
  const { user: contextUser, isAuthenticated: contextAuth, getHomeRouteByRole, refreshProfile } = useAuth();

  // Obtener de las cookies
  const cookieUser = getUserFromCookie();
  const cookieAuth = checkCookieAuth();
  
  const user = cookieUser || contextUser;
  const isAuthenticated = cookieAuth || contextAuth;

  const handleRefreshProfile = async () => {
    const result = await refreshProfile();
    if (result.success) {
      console.log('Perfil actualizado correctamente');
    } else {
      console.error('Error al actualizar perfil:', result.error);
    }
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="bg-gray-100 p-4 rounded-lg">
        <p className="text-gray-600">No hay usuario autenticado</p>
      </div>
    );
  }

  const homeRoute = getHomeRouteByRole();

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg border">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Información del Usuario</h2>
      
      <div className="space-y-3">
        <div>
          <label className="font-semibold text-gray-700">Alias:</label>
          <p className="text-gray-600">{user.alias || 'No disponible'}</p>
        </div>
        
        <div>
          <label className="font-semibold text-gray-700">Email:</label>
          <p className="text-gray-600">{user.mail || 'No disponible'}</p>
        </div>
        
        <div>
          <label className="font-semibold text-gray-700">Rol:</label>
          <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
            (user.rol || user.role) === 'METAHUMANO' 
              ? 'bg-blue-100 text-blue-800' 
              : (user.rol || user.role) === 'BUROCRATA'
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-800'
          }`}>
            {user.rol || user.role || 'Sin rol'}
          </span>
        </div>
        
        <div>
          <label className="font-semibold text-gray-700">ID:</label>
          <p className="text-gray-600">{user.id || 'No disponible'}</p>
        </div>
        
        <div>
          <label className="font-semibold text-gray-700">Perfil:</label>
          <p className="text-gray-600">{user.perfil || 'No disponible'}</p>
        </div>
        
        <div>
          <label className="font-semibold text-gray-700">Página de inicio asignada:</label>
          <p className="text-blue-600 font-mono">{homeRoute}</p>
        </div>
        
        <div>
          <label className="font-semibold text-gray-700">Estado:</label>
          <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
            Autenticado {cookieUser ? '(Cookie)' : '(Local)'}
          </span>
        </div>
        
        <div className="mt-4">
          <button 
            onClick={handleRefreshProfile}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Actualizar Perfil
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserInfo;
