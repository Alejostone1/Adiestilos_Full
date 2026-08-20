/**
 * Configuración centralizada del servidor Express
 * Maneja todas las configuraciones del servidor, CORS, y variables de entorno
 */

// Importar dependencias necesarias
const path = require('path');

// Variables de entorno requeridas para el servidor
const {
  PORT = 3000,                    // Puerto del servidor (por defecto 3000)
  NODE_ENV = 'development',       // Entorno de ejecución
  JWT_SECRET,                     // Secreto para JWT
  JWT_EXPIRES_IN = '24h',         // Tiempo de expiración del JWT
  BCRYPT_ROUNDS = 10,             // Rondas de encriptación para bcrypt
  CORS_ORIGIN = '*',              // Origen permitido para CORS
  UPLOAD_PATH = 'uploads',        // Directorio para archivos subidos
  MAX_FILE_SIZE = '10mb',         // Tamaño máximo de archivos
  RATE_LIMIT_WINDOW = 15,         // Ventana de tiempo para rate limiting (minutos)
  RATE_LIMIT_MAX = 100,           // Máximo de solicitudes por ventana
  LOG_LEVEL = 'info',             // Nivel de logging
  API_VERSION = 'v1',             // Versión de la API
  API_PREFIX = '/api',            // Prefijo de la API
  CLOUDINARY_CLOUD_NAME,          // Cloudinary: nombre de la nube
  CLOUDINARY_API_KEY,             // Cloudinary: API Key
  CLOUDINARY_API_SECRET,          // Cloudinary: API Secret
  CLOUDINARY_FOLDER = 'adi-estilos' // Cloudinary: carpeta base opcional
} = process.env;

// Validar variables de entorno críticas
const variablesRequeridas = ['JWT_SECRET'];

for (const variable of variablesRequeridas) {
  if (!process.env[variable]) {
    throw new Error(`La variable de entorno ${variable} es requerida pero no está definida`);
  }
}

// Configuración del servidor
const configuracionServidor = {
  // Configuración básica del servidor
  puerto: parseInt(PORT, 10),
  entorno: NODE_ENV,
  esDesarrollo: NODE_ENV === 'development',
  esProduccion: NODE_ENV === 'production',

  // Configuración de la API
  api: {
    version: API_VERSION,
    prefijo: API_PREFIX,
    rutaBase: API_PREFIX
  },

  // Configuración de JWT
  jwt: {
    secreto: JWT_SECRET,
    expiracion: JWT_EXPIRES_IN
  },

  // Configuración de encriptación
  bcrypt: {
    rondas: parseInt(BCRYPT_ROUNDS, 10)
  },

  // Configuración de CORS
  cors: {
    origen: CORS_ORIGIN === '*' ? CORS_ORIGIN : CORS_ORIGIN.split(','),
    credenciales: true,
    metodos: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    headersPermitidos: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
      'Cache-Control',
      'X-Access-Token'
    ],
    opcionesExitosas: 200
  },

  // Configuración de archivos subidos
  uploads: {
    directorio: path.join(__dirname, '../../', UPLOAD_PATH),
    rutaPublica: `/${UPLOAD_PATH}`,
    tamanoMaximo: MAX_FILE_SIZE,
    tiposPermitidos: {
      imagenes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      documentos: ['application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    }
  },

  // Configuración de rate limiting
  rateLimit: {
    ventanaMs: parseInt(RATE_LIMIT_WINDOW, 10) * 60 * 1000, // Convertir minutos a milisegundos
    maxSolicitudes: parseInt(RATE_LIMIT_MAX, 10),
    mensaje: {
      error: 'Demasiadas solicitudes desde esta IP, por favor intenta de nuevo más tarde',
      codigo: 'RATE_LIMIT_EXCEEDED'
    }
  },

  // Configuración de logging
  logging: {
    nivel: LOG_LEVEL,
    formato: NODE_ENV === 'development' ? 'dev' : 'combined',
    archivo: {
      nombre: 'app.log',
      directorio: path.join(__dirname, '../../logs'),
      maxTamano: '20m',
      maxArchivos: '14d'
    }
  },

  // Configuración de seguridad
  seguridad: {
    helmet: {
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
          fontSrc: ["'self'", "https://fonts.gstatic.com"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:", "http://localhost:3000", "http://127.0.0.1:3000", "https://res.cloudinary.com"],
        },
      },
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
      }
    },

    // Configuración de sesiones (si se usa express-session)
    sesion: {
      secreto: JWT_SECRET, // Usar el mismo secreto que JWT
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: NODE_ENV === 'production', // Solo HTTPS en producción
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 horas
      }
    }
  },

  // Configuración de Cloudinary (almacenamiento de imágenes en producción)
  cloudinary: {
    cloudName: CLOUDINARY_CLOUD_NAME,
    apiKey: CLOUDINARY_API_KEY,
    apiSecret: CLOUDINARY_API_SECRET,
    carpetaBase: CLOUDINARY_FOLDER
  },

  // Configuración de base de datos (referencia a databaseConfig)
  baseDatos: {
    logs: NODE_ENV === 'development'
  },

  // Configuración de respuestas HTTP
  respuestas: {
    exitosas: {
      codigo: 200,
      mensaje: 'Operación exitosa'
    },
    creadas: {
      codigo: 201,
      mensaje: 'Recurso creado exitosamente'
    },
    sinContenido: {
      codigo: 204,
      mensaje: 'Sin contenido'
    },
    errorCliente: {
      codigo: 400,
      mensaje: 'Solicitud incorrecta'
    },
    noAutorizado: {
      codigo: 401,
      mensaje: 'No autorizado'
    },
    prohibido: {
      codigo: 403,
      mensaje: 'Acceso prohibido'
    },
    noEncontrado: {
      codigo: 404,
      mensaje: 'Recurso no encontrado'
    },
    conflicto: {
      codigo: 409,
      mensaje: 'Conflicto con el estado actual del recurso'
    },
    errorServidor: {
      codigo: 500,
      mensaje: 'Error interno del servidor'
    }
  }
};

/**
 * Función para validar la configuración
 * Verifica que todos los valores sean válidos
 * @returns {boolean} true si la configuración es válida
 */
function validarConfiguracion() {
  try {
    // Validar puerto
    if (isNaN(configuracionServidor.puerto) || configuracionServidor.puerto < 1 || configuracionServidor.puerto > 65535) {
      throw new Error(`Puerto inválido: ${configuracionServidor.puerto}`);
    }

    // Validar JWT
    if (!configuracionServidor.jwt.secreto || configuracionServidor.jwt.secreto.length < 32) {
      throw new Error('JWT_SECRET debe tener al menos 32 caracteres');
    }

    // Validar rate limiting
    if (configuracionServidor.rateLimit.ventanaMs <= 0 || configuracionServidor.rateLimit.maxSolicitudes <= 0) {
      throw new Error('Configuración de rate limiting inválida');
    }

    console.log('✅ Configuración del servidor validada exitosamente');
    return true;

  } catch (error) {
    console.error('❌ Error en la validación de configuración:', error.message);
    throw error;
  }
}

/**
 * Función para obtener información de la configuración
 * Útil para debugging y logging
 * @returns {object} Información resumida de la configuración
 */
function obtenerInfoConfiguracion() {
  return {
    puerto: configuracionServidor.puerto,
    entorno: configuracionServidor.entorno,
    apiVersion: configuracionServidor.api.version,
    corsOrigen: Array.isArray(configuracionServidor.cors.origen)
      ? configuracionServidor.cors.origen.join(', ')
      : configuracionServidor.cors.origen,
    rateLimit: `${configuracionServidor.rateLimit.maxSolicitudes} solicitudes por ${configuracionServidor.rateLimit.ventanaMs / 60000} minutos`,
    uploads: {
      directorio: configuracionServidor.uploads.directorio,
      tamanoMaximo: configuracionServidor.uploads.tamanoMaximo
    }
  };
}

// Validar configuración al cargar el módulo
validarConfiguracion();

// Exportar la configuración y funciones de utilidad
module.exports = {
  configuracionServidor,        // Configuración completa
  validarConfiguracion,         // Función de validación
  obtenerInfoConfiguracion      // Función para obtener info
};
