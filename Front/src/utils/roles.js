// Única función para normalizar roles en todo el front.
// El backend usa 'METAHUMANO', 'BUROCRATA' y 'ADMIN' (en mayúsculas):
// siempre comparar contra esos valores después de normalizar.
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
