/**
 * Middleware de autenticación para proteger rutas
 * Proporciona funciones para verificar tokens JWT y roles de usuario
 */

const { prisma } = require('../config/databaseConfig');
const {
  extraerTokenDeHeader,
  verificarToken,
  decodificarToken
} = require('../utils/jwtHelper');
const {
  ErrorNoAutorizado,
  ErrorProhibido,
  ErrorNoEncontrado
} = require('../utils/errorHelper');

/**
 * Middleware para verificar token JWT
 * Extrae y valida el token del header Authorization
 * Agrega la información del usuario a req.usuario
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} res - Objeto de respuesta Express
 * @param {Function} next - Función next de Express
 */
async function verificarTokenMiddleware(req, res, next) {
  try {
    // Extraer token del header Authorization
    const token = extraerTokenDeHeader(req.headers.authorization);

    if (!token) {
      throw new ErrorNoAutorizado('Token de autenticación requerido');
    }

    // Verificar y decodificar el token
    const payload = verificarToken(token);

    // Verificar que el payload tenga la información necesaria
    if (!payload.idUsuario) {
      throw new ErrorNoAutorizado('Token inválido: falta información del usuario');
    }

    // Obtener información completa del usuario desde la base de datos
    const usuario = await prisma.usuario.findUnique({
      where: { idUsuario: payload.idUsuario },
      select: {
        idUsuario: true,
        nombres: true,
        apellidos: true,
        usuario: true,
        correoElectronico: true,
        telefono: true,
        estado: true,
        ultimaConexion: true,
        rol: {
          select: {
            idRol: true,
            nombreRol: true,
            permisos: true
          }
        }
      }
    });

    if (!usuario) {
      throw new ErrorNoEncontrado('Usuario no encontrado', 'usuario', payload.idUsuario);
    }

    // Verificar que el usuario esté activo
    if (usuario.estado !== 'activo') {
      throw new ErrorNoAutorizado(`Cuenta ${usuario.estado}. Contacte al administrador.`);
    }

    // Agregar información del usuario a la solicitud
    req.usuario = {
      ...usuario,
      token: token,
      payloadToken: payload
    };

    // Logging en desarrollo
    if (process.env.NODE_ENV === 'development') {
      console.log('🔐 Usuario autenticado:', {
        idUsuario: usuario.idUsuario,
        usuario: usuario.usuario,
        rol: usuario.rol.nombreRol,
        ruta: req.originalUrl,
        metodo: req.method,
        timestamp: new Date().toISOString()
      });
    }

    next();

  } catch (error) {
    next(error);
  }
}

/**
 * Middleware para verificar roles de usuario
 * Debe usarse después de verificarTokenMiddleware
 * @param {Array|string} rolesPermitidos - Roles que tienen acceso a la ruta
 * @returns {Function} Middleware de Express
 */
function verificarRol(rolesPermitidos) {
  return (req, res, next) => {
    try {
      // Verificar que el usuario esté autenticado
      if (!req.usuario || !req.usuario.rol) {
        throw new ErrorNoAutorizado('Usuario no autenticado');
      }

      // Convertir rolesPermitidos a array si es string
      const roles = Array.isArray(rolesPermitidos) ? rolesPermitidos : [rolesPermitidos];

      // Verificar si el rol del usuario está en los roles permitidos
      const rolUsuario = req.usuario.rol.nombreRol;
      const tienePermiso = roles.includes(rolUsuario);

      if (!tienePermiso) {
        throw new ErrorProhibido(
          `Acceso denegado. Se requiere uno de los siguientes roles: ${roles.join(', ')}`
        );
      }

      // Logging en desarrollo
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ Permiso de rol verificado:', {
          usuario: req.usuario.usuario,
          rol: rolUsuario,
          rolesPermitidos: roles,
          ruta: req.originalUrl,
          timestamp: new Date().toISOString()
        });
      }

      next();

    } catch (error) {
      next(error);
    }
  };
}

/**
 * Middleware opcional de autenticación
 * Similar a verificarTokenMiddleware pero no lanza error si no hay token
 * Útil para rutas que funcionan con o sin autenticación
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} res - Objeto de respuesta Express
 * @param {Function} next - Función next de Express
 */
async function verificarTokenOpcional(req, res, next) {
  try {
    const token = extraerTokenDeHeader(req.headers.authorization);

    if (token) {
      try {
        const payload = verificarToken(token);

        if (payload.idUsuario) {
          // Obtener información del usuario
          const usuario = await prisma.usuario.findUnique({
            where: { idUsuario: payload.idUsuario },
            select: {
              idUsuario: true,
              nombres: true,
              apellidos: true,
              usuario: true,
              correoElectronico: true,
              estado: true,
              rol: {
                select: {
                  idRol: true,
                  nombreRol: true,
                  permisos: true
                }
              }
            }
          });

          if (usuario && usuario.estado === 'activo') {
            req.usuario = {
              ...usuario,
              token: token,
              payloadToken: payload
            };
          }
        }
      } catch (error) {
        // Si hay error en el token, continuar sin usuario (no lanzar error)
        console.warn('⚠️ Token opcional inválido, continuando sin autenticación:', error.message);
      }
    }

    next();

  } catch (error) {
    next(error);
  }
}

/**
 * Middleware para verificar permisos específicos con niveles granulares.
 * Niveles: 'full' (Escribir/Ver), 'read' (Solo Ver), 'none' (Sin Acceso).
 * @param {string} modulo - La clave del módulo a verificar (ej: 'ventas').
 * @param {string} nivelRequerido - El nivel mínimo requerido ('full' o 'read').
 * @returns {Function} Middleware de Express.
 */
function verificarPermisos(modulo, nivelRequerido = 'read') {
  return (req, res, next) => {
    try {
      if (!req.usuario || !req.usuario.rol) {
        throw new ErrorNoAutorizado('Usuario no autenticado');
      }

      // El Administrador Maestro siempre tiene acceso total por defecto
      // (Opcional: Si quieres que el Admin también sea restrictivo, comenta esta línea)
      if (req.usuario.rol.nombreRol === 'Administrador') {
        return next();
      }

      const permisosUsuario = req.usuario.rol.permisos || {};
      const permisoActual = permisosUsuario[modulo];

      // Caso 1: Permiso booleano (true/false)
      if (typeof permisoActual === 'boolean') {
        if (permisoActual) return next();
        throw new ErrorProhibido(`No tienes permiso para el módulo: ${modulo}`);
      }

      // Caso 2: Permisos granulares (full, read, none)
      if (nivelRequerido === 'full') {
        if (permisoActual === 'full') return next();
      } else if (nivelRequerido === 'read') {
        if (permisoActual === 'full' || permisoActual === 'read') return next();
      }

      throw new ErrorProhibido(
        `Nivel de acceso insuficiente para ${modulo}. Se requiere: ${nivelRequerido}`
      );

    } catch (error) {
      next(error);
    }
  };
}

/**
 * Middleware para verificar propiedad de recursos
 * Verifica si el usuario es propietario del recurso o tiene permisos administrativos
 * @param {string} campoIdUsuario - Nombre del campo que contiene el ID del usuario propietario
 * @param {Array} rolesAdmin - Roles que pueden acceder a cualquier recurso (opcional)
 * @returns {Function} Middleware de Express
 */
function verificarPropiedad(campoIdUsuario = 'idUsuario', rolesAdmin = ['Administrador']) {
  return (req, res, next) => {
    try {
      // Verificar que el usuario esté autenticado
      if (!req.usuario) {
        throw new ErrorNoAutorizado('Usuario no autenticado');
      }

      // Si es administrador, permitir acceso
      if (rolesAdmin.includes(req.usuario.rol.nombreRol)) {
        next();
        return;
      }

      // Obtener el ID del usuario propietario del recurso
      const idUsuarioPropietario = req.params[campoIdUsuario] || req.body[campoIdUsuario];

      if (!idUsuarioPropietario) {
        throw new ErrorProhibido('No se puede determinar el propietario del recurso');
      }

      // Verificar que el usuario sea el propietario
      if (parseInt(idUsuarioPropietario) !== req.usuario.idUsuario) {
        throw new ErrorProhibido('Solo puedes acceder a tus propios recursos');
      }

      next();

    } catch (error) {
      next(error);
    }
  };
}

/**
 * Middleware para logging de acceso
 * Registra todas las solicitudes autenticadas
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} res - Objeto de respuesta Express
 * @param {Function} next - Función next de Express
 */
function loggingAcceso(req, res, next) {
  if (req.usuario) {
    console.log('📊 Acceso registrado:', {
      usuario: req.usuario.usuario,
      rol: req.usuario.rol.nombreRol,
      metodo: req.method,
      ruta: req.originalUrl,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString()
    });
  }

  next();
}

/**
 * Middleware combinado para rutas protegidas
 * Combina verificación de token y rol en un solo middleware
 * @param {Array|string} rolesPermitidos - Roles que tienen acceso
 * @returns {Array} Array de middlewares
 */
function rutaProtegida(rolesPermitidos) {
  return [
    verificarTokenMiddleware,
    verificarRol(rolesPermitidos),
    loggingAcceso
  ];
}

/**
 * Middleware combinado para rutas de administrador
 * @returns {Array} Array de middlewares para rutas administrativas
 */
function rutaAdministrador() {
  return rutaProtegida(['Administrador']);
}

/**
 * Middleware combinado para rutas de vendedor
 * @returns {Array} Array de middlewares para rutas de vendedor
 */
function rutaVendedor() {
  return rutaProtegida(['Administrador', 'Vendedor']);
}

/**
 * Middleware combinado para rutas de bodeguero
 * @returns {Array} Array de middlewares para rutas de bodeguero
 */
function rutaBodeguero() {
  return rutaProtegida(['Administrador', 'Bodeguero']);
}

// Exportar todos los middlewares
module.exports = {
  // Middlewares principales
  verificarTokenMiddleware,
  verificarRol,
  verificarTokenOpcional,

  // Middlewares avanzados
  verificarPermisos,
  verificarPropiedad,

  // Middlewares de utilidad
  loggingAcceso,

  // Middlewares combinados
  rutaProtegida,
  rutaAdministrador,
  rutaVendedor,
  rutaBodeguero
};
