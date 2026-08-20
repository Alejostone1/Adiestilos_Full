/**
 * Configuración de la base de datos con Prisma
 * Maneja la conexión y desconexión a la base de datos MySQL
 */

const { PrismaClient } = require('@prisma/client');

const {
  DATABASE_URL,
  NODE_ENV
} = process.env;

if (!DATABASE_URL) {
  throw new Error('La variable de entorno DATABASE_URL es requerida');
}

// Opciones de Prisma según entorno
const opcionesPrisma = {
  log: NODE_ENV === 'development'
    ? ['query', 'info', 'warn', 'error']
    : ['error'],
  datasources: {
    db: {
      url: DATABASE_URL,
    },
  },
};

// Singleton real de Prisma
let prismaInstance = null;

function obtenerInstanciaPrisma() {
  if (!prismaInstance) {
    prismaInstance = new PrismaClient(opcionesPrisma);
  }
  return prismaInstance;
}

const prisma = obtenerInstanciaPrisma();

/**
 * Conecta a la base de datos
 */
async function conectarBaseDatos() {
  try {
    console.log('🔄 Conectando a la base de datos...');
    await prisma.$connect();
    console.log('✅ Base de datos conectada');

    if (NODE_ENV === 'development') {
      console.log(`📊 Entorno: ${NODE_ENV}`);
    }
  } catch (error) {
    console.error('❌ Error conectando a la base de datos:', error.message);
    throw error;
  }
}

/**
 * Desconecta la base de datos
 * ⚠️ Se llama desde server.js (shutdown centralizado)
 */
async function desconectarBaseDatos() {
  try {
    if (prismaInstance) {
      await prismaInstance.$disconnect();
      console.log('🔌 Base de datos desconectada');
    }
  } catch (error) {
    console.error('❌ Error al desconectar BD:', error.message);
  }
}

/**
 * Verifica la conexión
 */
async function verificarConexion() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}

module.exports = {
  prisma,
  conectarBaseDatos,
  desconectarBaseDatos,
  verificarConexion,
  obtenerInstanciaPrisma
};
