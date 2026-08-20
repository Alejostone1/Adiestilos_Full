/**
 * Utilidades para manejo de JWT (JSON Web Tokens)
 * Proporciona funciones para generar, verificar y decodificar tokens JWT
 */

const jwt = require('jsonwebtoken');
const { configuracionServidor } = require('../config/serverConfig');
const { ErrorNoAutorizado, ErrorInternoServidor } = require('./errorHelper');

/**
 * Generar un token JWT
 * @param {Object} payload - Datos a incluir en el token
 * @param {string} expiresIn - Tiempo de expiración (opcional, usa configuración por defecto)
 * @returns {string} Token JWT generado
 */
function generarToken(payload, expiresIn = null) {
  try {
    // Validar parámetros
    if (!payload || typeof payload !== 'object') {
      throw new ErrorInternoServidor('El payload debe ser un objeto válido');
    }

    // Verificar que el secreto JWT esté configurado
    if (!configuracionServidor.jwt.secreto) {
      throw new ErrorInternoServidor('El secreto JWT no está configurado');
    }

    // Usar tiempo de expiración proporcionado o el de configuración
    const tiempoExpiracion = expiresIn || configuracionServidor.jwt.expiracion;

    // Opciones del token
    const opciones = {
      expiresIn: tiempoExpiracion,
      issuer: 'adi-estilos-api',
      audience: 'adi-estilos-clientes'
    };

    // Agregar timestamp de emisión
    const payloadCompleto = {
      ...payload,
      iat: Math.floor(Date.now() / 1000) // Issued at
    };

    // Generar el token
    const token = jwt.sign(payloadCompleto, configuracionServidor.jwt.secreto, opciones);

    // Logging en desarrollo
    if (configuracionServidor.esDesarrollo) {
      console.log('🔐 Token JWT generado:', {
        usuario: payload.idUsuario || payload.usuario || 'desconocido',
        expiracion: tiempoExpiracion,
        timestamp: new Date().toISOString()
      });
    }

    return token;

  } catch (error) {
    console.error('❌ Error al generar token JWT:', error.message);

    if (error instanceof ErrorInternoServidor) {
      throw error;
    }

    throw new ErrorInternoServidor('Error al generar el token de autenticación');
  }
}

/**
 * Verificar y decodificar un token JWT
 * @param {string} token - Token JWT a verificar
 * @returns {Object} Payload decodificado del token
 */
function verificarToken(token) {
  try {
    // Validar parámetros
    if (!token || typeof token !== 'string') {
      throw new ErrorNoAutorizado('Token de autenticación requerido');
    }

    // Verificar que el secreto JWT esté configurado
    if (!configuracionServidor.jwt.secreto) {
      throw new ErrorInternoServidor('El secreto JWT no está configurado');
    }

    // Opciones de verificación
    const opciones = {
      issuer: 'adi-estilos-api',
      audience: 'adi-estilos-clientes'
    };

    // Verificar el token
    const payloadDecodificado = jwt.verify(token, configuracionServidor.jwt.secreto, opciones);

    // Verificar expiración manualmente (por si acaso)
    const ahora = Math.floor(Date.now() / 1000);
    if (payloadDecodificado.exp && payloadDecodificado.exp < ahora) {
      throw new ErrorNoAutorizado('El token de autenticación ha expirado');
    }

    // Logging en desarrollo
    if (configuracionServidor.esDesarrollo) {
      console.log('✅ Token JWT verificado:', {
        usuario: payloadDecodificado.idUsuario || payloadDecodificado.usuario || 'desconocido',
        expiracion: new Date(payloadDecodificado.exp * 1000).toISOString(),
        timestamp: new Date().toISOString()
      });
    }

    return payloadDecodificado;

  } catch (error) {
    // Manejar errores específicos de JWT
    if (error.name === 'JsonWebTokenError') {
      throw new ErrorNoAutorizado('Token de autenticación inválido');
    }

    if (error.name === 'TokenExpiredError') {
      throw new ErrorNoAutorizado('El token de autenticación ha expirado');
    }

    if (error.name === 'NotBeforeError') {
      throw new ErrorNoAutorizado('El token de autenticación no es válido aún');
    }

    // Si ya es un error personalizado, re-lanzarlo
    if (error instanceof ErrorNoAutorizado || error instanceof ErrorInternoServidor) {
      throw error;
    }

    // Error genérico
    console.error('❌ Error al verificar token JWT:', error.message);
    throw new ErrorNoAutorizado('Error en la autenticación');
  }
}

/**
 * Decodificar un token JWT sin verificar (solo para obtener información)
 * @param {string} token - Token JWT a decodificar
 * @returns {Object|null} Payload decodificado o null si es inválido
 */
function decodificarToken(token) {
  try {
    if (!token || typeof token !== 'string') {
      return null;
    }

    // Decodificar sin verificar
    const payload = jwt.decode(token);

    return payload;

  } catch (error) {
    console.warn('⚠️ Error al decodificar token JWT:', error.message);
    return null;
  }
}

/**
 * Extraer token JWT del header Authorization
 * @param {string} headerAuth - Valor del header Authorization
 * @returns {string|null} Token extraído o null si no es válido
 */
function extraerTokenDeHeader(headerAuth) {
  try {
    if (!headerAuth || typeof headerAuth !== 'string') {
      return null;
    }

    // Verificar formato "Bearer <token>"
    const partes = headerAuth.split(' ');
    if (partes.length !== 2 || partes[0].toLowerCase() !== 'bearer') {
      return null;
    }

    const token = partes[1];
    if (!token || token.trim().length === 0) {
      return null;
    }

    return token;

  } catch (error) {
    console.warn('⚠️ Error al extraer token del header:', error.message);
    return null;
  }
}

/**
 * Verificar si un token está próximo a expirar
 * @param {string} token - Token JWT a verificar
 * @param {number} minutosAnticipacion - Minutos de anticipación (por defecto 5)
 * @returns {boolean} true si está próximo a expirar
 */
function tokenProximoExpirar(token, minutosAnticipacion = 5) {
  try {
    const payload = decodificarToken(token);

    if (!payload || !payload.exp) {
      return true; // Considerar expirado si no se puede decodificar
    }

    const ahora = Math.floor(Date.now() / 1000);
    const tiempoRestante = payload.exp - ahora;
    const segundosAnticipacion = minutosAnticipacion * 60;

    return tiempoRestante <= segundosAnticipacion;

  } catch (error) {
    console.warn('⚠️ Error al verificar expiración del token:', error.message);
    return true; // Considerar expirado en caso de error
  }
}

/**
 * Generar un token de refresco
 * @param {Object} payload - Datos básicos del usuario
 * @returns {string} Token de refresco generado
 */
function generarTokenRefresco(payload) {
  try {
    if (!payload || !payload.idUsuario) {
      throw new ErrorInternoServidor('El payload debe incluir idUsuario');
    }

    // Payload simplificado para refresh token
    const payloadRefresco = {
      idUsuario: payload.idUsuario,
      tipo: 'refresh',
      jti: generarIdUnico() // ID único para el token
    };

    // Expiración más larga para refresh tokens (30 días por defecto)
    const expiracionRefresco = process.env.JWT_REFRESH_EXPIRES_IN || '30d';

    return generarToken(payloadRefresco, expiracionRefresco);

  } catch (error) {
    console.error('❌ Error al generar token de refresco:', error.message);
    throw error;
  }
}

/**
 * Generar un par de tokens (acceso y refresco)
 * @param {Object} payload - Datos del usuario para incluir en los tokens
 * @returns {Object} Objeto con tokens de acceso y refresco
 */
function generarParTokens(payload) {
  try {
    // Generar token de acceso
    const tokenAcceso = generarToken(payload);

    // Generar token de refresco
    const tokenRefresco = generarTokenRefresco(payload);

    return {
      tokenAcceso,
      tokenRefresco,
      tipo: 'Bearer',
      expiracionAcceso: configuracionServidor.jwt.expiracion,
      expiracionRefresco: process.env.JWT_REFRESH_EXPIRES_IN || '30d'
    };

  } catch (error) {
    console.error('❌ Error al generar par de tokens:', error.message);
    throw error;
  }
}

/**
 * Middleware de autenticación para Express
 * Verifica el token JWT en el header Authorization
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} res - Objeto de respuesta Express
 * @param {Function} next - Función next de Express
 */
function middlewareAutenticacion(req, res, next) {
  try {
    // Extraer token del header
    const token = extraerTokenDeHeader(req.headers.authorization);

    if (!token) {
      throw new ErrorNoAutorizado('Token de autenticación requerido');
    }

    // Verificar token
    const payload = verificarToken(token);

    // Agregar información del usuario a la solicitud
    req.usuario = payload;
    req.token = token;

    next();

  } catch (error) {
    next(error);
  }
}

/**
 * Middleware opcional de autenticación
 * Similar al anterior pero no lanza error si no hay token
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} res - Objeto de respuesta Express
 * @param {Function} next - Función next de Express
 */
function middlewareAutenticacionOpcional(req, res, next) {
  try {
    const token = extraerTokenDeHeader(req.headers.authorization);

    if (token) {
      const payload = verificarToken(token);
      req.usuario = payload;
      req.token = token;
    }

    next();

  } catch (error) {
    // No hacer nada, continuar sin usuario autenticado
    next();
  }
}

/**
 * Convertir tiempo de string a segundos
 * @private
 * @param {string} tiempo - Tiempo en formato como '1h', '30m', '7d'
 * @returns {number} Tiempo en segundos
 */
function convertirTiempoASegundos(tiempo) {
  const regex = /^(\d+)([smhd])$/;
  const match = tiempo.match(regex);

  if (!match) {
    throw new Error(`Formato de tiempo inválido: ${tiempo}`);
  }

  const valor = parseInt(match[1], 10);
  const unidad = match[2];

  switch (unidad) {
    case 's': return valor;
    case 'm': return valor * 60;
    case 'h': return valor * 60 * 60;
    case 'd': return valor * 60 * 60 * 24;
    default: throw new Error(`Unidad de tiempo desconocida: ${unidad}`);
  }
}

/**
 * Generar un ID único para tokens
 * @private
 * @returns {string} ID único
 */
function generarIdUnico() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Exportar todas las funciones y middlewares
module.exports = {
  // Funciones principales
  generarToken,
  verificarToken,
  decodificarToken,

  // Funciones de utilidad
  extraerTokenDeHeader,
  tokenProximoExpirar,

  // Funciones para refresh tokens
  generarTokenRefresco,
  generarParTokens,

  // Middlewares
  middlewareAutenticacion,
  middlewareAutenticacionOpcional,

  // Funciones auxiliares (para testing)
  convertirTiempoASegundos,
  generarIdUnico
};
