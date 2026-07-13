import { api } from './client';

// app.use('/api/auth', usuarioRouter)
export const registerMetahumanoRequest = (user) => api.post('/auth/register/metahumano', user);
export const registerBurocrataRequest  = (user) => api.post('/auth/register/burocrata', user);
export const loginRequest              = (user) => api.post('/auth/login', user);
export const logoutRequest             = ()     => api.post('/auth/logout');
export const getPerfilRequest          = ()     => api.get('/auth/perfil');

// /api/usuarios:
export const getAllUsersRequest    = ()        => api.get('/usuarios');
export const getUserByIdRequest    = (id)      => api.get(`/usuarios/${id}`);
export const updateUserRequest     = (id, d)   => api.put(`/usuarios/${id}`, d);
export const deleteUserRequest     = (id)      => api.delete(`/usuarios/${id}`);
export const toggleUserStatusRequest = (id, a) => api.patch(`/usuarios/${id}/status`, { activo: a });
