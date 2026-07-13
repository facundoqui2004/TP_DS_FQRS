// Utilidades para manejo de cookies y autenticación

/**
 * Obtiene información del usuario desde la cookie user_info
 * @returns {Object|null} Objeto con datos del usuario o null si no existe
 */
export const getUserFromCookie = () => {
  try {
    const raw = document.cookie
      .split('; ')
      .find((c) => c.startsWith('user_info='))
      ?.split('=')[1];

    return raw ? JSON.parse(decodeURIComponent(raw)) : null;
  } catch (error) {
    console.error('Error al leer cookie user_info:', error);
    return null;
  }
};

/**
 * Verifica si el usuario está autenticado basándose en la cookie
 * @returns {boolean} true si está autenticado, false en caso contrario
 */
export const isAuthenticated = () => {
  const userInfo = getUserFromCookie();
  return userInfo !== null;
};

/**
 * Obtiene el rol del usuario desde la cookie
 * @returns {string|null} El rol del usuario o null
 */
export const getUserRole = () => {
  const userInfo = getUserFromCookie();
  return userInfo?.role || null;
};

/**
 * Obtiene el ID del usuario desde la cookie
 * @returns {number|null} El ID del usuario o null
 */
export const getUserId = () => {
  const userInfo = getUserFromCookie();
  return userInfo?.id || null;
};

export const getMetaId = () => {
  const userInfo = getUserFromCookie();
  return userInfo?.perfilId || null;
};

/**
 * Obtiene el alias del usuario desde la cookie
 * @returns {string|null} El alias del usuario o null
 */
export const getUserAlias = () => {
  const userInfo = getUserFromCookie();
  return userInfo?.alias || null;
};

/**
 * Formatea la información del usuario para compatibilidad con el contexto existente
 * @returns {Object|null} Objeto formateado del usuario o null
 */
export const getFormattedUserInfo = () => {
  const userInfo = getUserFromCookie();
  if (!userInfo) return null;

  return {
    id: userInfo.id,
    rol: userInfo.role,
    alias: userInfo.alias,
    perfil: userInfo.perfil,
    perfilId: userInfo.perfilId,
  };
};

