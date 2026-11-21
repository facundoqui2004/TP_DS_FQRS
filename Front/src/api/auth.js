import { api } from './client';

// app.use('/api/auth', usuarioRouter)
export const registerMetahumanoRequest = (user) => api.post('/auth/register/metahumano', user);
export const registerBurocrataRequest  = (user) => api.post('/auth/register/burocrata', user);
export const loginRequest              = (user) => api.post('/auth/login', user);
export const logoutRequest             = ()     => api.post('/auth/logout');
export const getPerfilRequest          = ()     => api.get('/auth/perfil');

// /api/usuarios (solo las rutas que existen en el backend; el borrado está en api/usuarios.js)
export const getAllUsersRequest    = ()        => api.get('/usuarios');
export const getUserByIdRequest    = (id)      => api.get(`/usuarios/${id}`);
