/**
 * @file permisosHelper.js
 * @brief Utilidades para verificar permisos en el frontend.
 */

/**
 * Verifica si un usuario tiene acceso a un módulo con un nivel específico.
 * @param {Object} usuario - El objeto de usuario del AuthContext.
 * @param {string} modulo - La clave del módulo (ej: 'ventas').
 * @param {string} nivelRequerido - 'read' o 'full'.
 * @returns {boolean}
 */
export const tienePermiso = (usuario, modulo, nivelRequerido = 'read') => {
  if (!usuario || !usuario.rol) return false;

  // El Administrador tiene bypass total en el frontend por facilidad de uso
  if (usuario.rol.nombreRol === 'Administrador') return true;

  const permisos = usuario.rol.permisos || {};
  const permisoActual = permisos[modulo];

  // Caso booleano
  if (typeof permisoActual === 'boolean') {
    return permisoActual;
  }

  // Caso granular
  if (nivelRequerido === 'full') {
    return permisoActual === 'full';
  }

  if (nivelRequerido === 'read') {
    return permisoActual === 'full' || permisoActual === 'read';
  }

  return false;
};

/**
 * Hook opcional para usar en componentes funcionales.
 * (Nota: Si prefieres usarlo como hook, puedes importarlo en un contexto)
 */
export const useCheckPermisos = (usuario) => {
  return (modulo, nivel) => tienePermiso(usuario, modulo, nivel);
};
