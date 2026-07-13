import { api } from './client';

export const obtenerTodosLosUsuarios = () => api.get('/usuarios');
export const getMe = () => api.get('/usuarios/me');
export const obtenerUsuarioPorId = (id) => api.get(`/usuarios/${id}`);
export const actualizarUsuario = (id, d) => api.put(`/usuarios/${id}`, d);
export const eliminarUsuario = (id) => api.delete(`/auth/admin/usuarios/${id}`);
export const cambiarEstadoUsuario = (id, a) =>
  api.patch(`/usuarios/${id}/estado`, { activo: a });

export const obtenerMetahumanos = () => api.get('/metahumanos');
export const obtenerMetahumanoById = (id) => api.get(`/metahumanos/${id}`);
export const obtenerBurocratas = () => api.get('/Burocratas');
export const obtenerTodosLosUsuariosCombinados = async () => {
  try {
    console.log('Obteniendo usuarios desde /usuarios...');
    const response = await api.get('/usuarios');
    
    // Check if response.data is the array or response.data.usuarios
    const rawUsers = response.data.usuarios || response.data || [];
    console.log('Usuarios raw obtenidos:', rawUsers);

    if (!Array.isArray(rawUsers)) {
      console.error('Formato de respuesta inesperado:', response.data);
      return { data: [] };
    }

    const todosLosUsuarios = rawUsers.map(user => {
      // Determine role and role-specific data
      const isMetahumano = !!user.metahumano;
      const isBurocrata = !!user.burocrata;
      const roleData = user.metahumano || user.burocrata || {};
      
      // Map to unified structure
      return {
        // IDs
        id: roleData.id || user.id, // Keep role ID as 'id' for compatibility with existing role-based views if needed, OR prefer user.id? 
        // Wait, the user wants 'idUsuario' for deletion (which is user.id) and 'id' for role display.
        // Let's map:
        idUsuario: user.id, // The User ID (14)
        idRol: roleData.id, // The Role ID (5)
        id: roleData.id || user.id, // Default ID for tables (usually role ID in role views)

        // Basic Info
        nomUsuario: roleData.alias || roleData.nombre || roleData.nomBurocrata || user.email,
        email: user.email,
        telefono: user.telefono,
        rol: user.role, // 'METAHUMANO' or 'BUROCRATA'
        
        // Dates
        fechaCreacion: user.createdAt,
        createdAt: user.createdAt,

        // Status
        estado: user.verificado ? 'ACTIVO' : 'INACTIVO', // Assuming verificado maps to status, or use default
        activo: user.verificado,

        // Spread specific data
        ...roleData,
        _original: user // Keep original for debug
      };
    });

    console.log(`Total usuarios procesados: ${todosLosUsuarios.length}`);
    return { data: todosLosUsuarios };

  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    throw error;
  }
};

export const definirEstiloVidaRequest = (datos) => api.post('/metahumanos/estilo-vida', datos);

export const actualizarMetahumano = (id, data) => api.put(`/metahumanos/${id}`, data);
