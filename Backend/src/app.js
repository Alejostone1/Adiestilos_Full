/**
 * Archivo principal de la aplicación Express.
 * Configura todos los middlewares, rutas y manejo de errores.
 */

// Importaciones de módulos de Node y de terceros
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

// Importaciones de módulos locales
const { configuracionServidor } = require('./config/serverConfig');
const todasLasRutas = require('./allRoutes');
const { manejadorDeErrores, noEncontrado } = require('./middleware/errorMiddleware');

// --- INICIALIZACIÓN DE LA APP ---
const app = express();

// --- CONFIGURACIÓN DE MIDDLEWARES ---

// 1. Middleware de seguridad con Helmet
// Ayuda a proteger la aplicación de vulnerabilidades web conocidas
// Temporalmente desactivado para solucionar problemas CORS
// app.use(helmet(configuracionServidor.seguridad.helmet));

// 2. Middleware de CORS (Cross-Origin Resource Sharing)
// Permite solicitudes desde los orígenes configurados
app.use(cors(configuracionServidor.cors));

// 3. Middleware para parsear JSON
// Permite que la aplicación acepte cuerpos de solicitud en formato JSON
app.use(express.json({ limit: '10mb' }));

// 4. Middleware para parsear cuerpos de solicitud URL-encoded
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 5. Middleware de logging de solicitudes HTTP con Morgan
// Muestra logs de las solicitudes entrantes en la consola
if (configuracionServidor.esDesarrollo) {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// 6. Servir archivos estáticos
// Expone el directorio 'uploads' para que se pueda acceder públicamente a las imágenes
const directorioUploads = configuracionServidor.uploads.directorio;
app.use('/uploads', express.static(directorioUploads));
console.log(` sirviendo archivos estáticos desde: ${directorioUploads}`);


// --- RUTAS DE LA APLICACIÓN ---

// Ruta de bienvenida o de estado de la API
app.get('/', (req, res) => {
  res.json({
    mensaje: 'Bienvenido a la API de Adi-Estilos',
    version: configuracionServidor.api.version,
    entorno: configuracionServidor.entorno,
    documentacion: '/api-docs' // Futura ruta para la documentación
  });
});

// Endpoint de salud para health checks (Railway/Vercel)
app.get('/health', (req, res) => {
  res.status(200).json({
    estado: 'ok',
    entorno: configuracionServidor.entorno,
    timestamp: new Date().toISOString()
  });
});

// Montar todas las rutas de la API bajo el prefijo configurado (ej: /api)
app.use(configuracionServidor.api.rutaBase, todasLasRutas);


// --- MANEJO DE ERRORES ---

// 1. Middleware para manejar rutas no encontradas (404)
// Se ejecuta si ninguna de las rutas anteriores coincide
app.use(noEncontrado);

// 2. Middleware global para manejar todos los demás errores
// Debe ser el último middleware que se registra en la aplicación
app.use(manejadorDeErrores);


// --- EXPORTACIÓN ---
module.exports = app;
