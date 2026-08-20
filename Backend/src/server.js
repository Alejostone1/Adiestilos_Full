/**
 * Punto de entrada del servidor.
 * Este archivo se encarga de iniciar el servidor HTTP y conectar a la base de datos.
 */

// Cargar variables de entorno desde .env
require('dotenv').config();

// Importar la aplicación Express configurada
const app = require('./app');

// Importar la configuración del servidor y de la base de datos
const { configuracionServidor } = require('./config/serverConfig');
const { conectarBaseDatos, desconectarBaseDatos } = require('./config/databaseConfig');

// Obtener el puerto desde la configuración
const PUERTO = configuracionServidor.puerto;

let servidor;

/**
 * Función principal para iniciar el servidor.
 * Realiza la conexión a la base de datos y luego levanta el servidor HTTP.
 */
async function iniciarServidor() {
  try {
    // 1. Conectar a la base de datos
    await conectarBaseDatos();

    // 2. Iniciar el servidor HTTP
    servidor = app.listen(PUERTO, () => {
      console.log('------------------------------------------------');
      console.log(`🚀 Servidor iniciado en modo [${configuracionServidor.entorno}]`);
      console.log(`✅ Escuchando en http://localhost:${PUERTO}`);
      console.log(`📚 Rutas de la API disponibles en ${configuracionServidor.api.rutaBase}`);
      console.log('------------------------------------------------');
    });

    // Manejar errores del servidor (ej: puerto en uso)
    servidor.on('error', (error) => {
      if (error.syscall !== 'listen') {
        throw error;
      }
      switch (error.code) {
        case 'EACCES':
          console.error(`❌ El puerto ${PUERTO} requiere privilegios elevados.`);
          process.exit(1);
          break;
        case 'EADDRINUSE':
          console.error(`❌ El puerto ${PUERTO} ya está en uso.`);
          process.exit(1);
          break;
        default:
          throw error;
      }
    });

  } catch (error) {
    console.error('❌ Fallo al iniciar el servidor:', error.message);
    process.exit(1); // Salir del proceso con un código de error
  }
}

/**
 * Función para cerrar el servidor de forma segura.
 * Cierra la conexión del servidor y de la base de datos.
 */
async function cerrarServidor() {
  console.log('\n🛑 Recibida señal de apagado. Cerrando servidor...');
  if (servidor) {
    servidor.close(async () => {
      console.log('✅ Servidor HTTP cerrado.');
      await desconectarBaseDatos();
      process.exit(0);
    });
  } else {
    await desconectarBaseDatos();
    process.exit(0);
  }
}

// --- MANEJO DE SEÑALES DEL SISTEMA PARA CIERRE GRACEFUL ---

// Capturar Ctrl+C (SIGINT)
process.on('SIGINT', cerrarServidor);

// Capturar señal de terminación (usada por PM2, Docker, etc.)
process.on('SIGTERM', cerrarServidor);

// Capturar errores no manejados para asegurar el cierre de la conexión
process.on('uncaughtException', (error) => {
  console.error('💥 ERROR NO CAPTURADO:', error);
  // No cerramos el servidor aquí, ya que el manejador de errores de Express debería encargarse.
  // Podríamos considerar un cierre forzado si es necesario.
});

// Capturar promesas rechazadas no manejadas
process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 PROMESA RECHAZADA NO MANEJADA:', reason);
  console.error('Promise:', promise);

  // Si es un error de Prisma, mostrar más detalles
  if (reason && typeof reason === 'object' && reason.code) {
    console.error('Código de error:', reason.code);
    console.error('Meta:', reason.meta);
  }

  // En producción, podríamos querer cerrar el proceso
  if (process.env.NODE_ENV === 'production') {
    console.error('Cerrando proceso debido a una promesa rechazada no manejada en producción');
    process.exit(1);
  }
});


// --- INICIAR LA APLICACIÓN ---
iniciarServidor();
