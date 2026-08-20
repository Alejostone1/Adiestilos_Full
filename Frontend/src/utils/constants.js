/**
 * Constantes globales de la aplicación.
 * Centraliza valores comunes utilizados en toda la aplicación frontend.
 */

// --- CONSTANTES DE ESTADO ---
export const ESTADOS_PRODUCTO = {
  ACTIVO: 'activo',
  INACTIVO: 'inactivo',
  DESCONTINUADO: 'descontinuado'
};

export const ESTADOS_USUARIO = {
  ACTIVO: 'activo',
  INACTIVO: 'inactivo',
  SUSPENDIDO: 'suspendido'
};

export const ESTADOS_CREDITO = {
  PENDIENTE: 'pendiente',
  APROBADO: 'aprobado',
  RECHAZADO: 'rechazado',
  PAGADO: 'pagado'
};

export const ESTADOS_VENTA = {
  PENDIENTE: 'pendiente',
  COMPLETADA: 'completada',
  CANCELADA: 'cancelada'
};

// --- CONSTANTES DE PAGINACIÓN ---
export const PAGINACION_DEFAULT = {
  LIMITE: 10,
  PAGINA_INICIAL: 1
};

// --- CONSTANTES DE MONEDA ---
export const MONEDA = {
  SIMBOLO: '$',
  CODIGO: 'USD',
  DECIMALES: 2
};

// --- CONSTANTES DE VALIDACIÓN ---
export const VALIDACION = {
  MIN_CONTRASENA: 6,
  MAX_NOMBRE: 100,
  MAX_CORREO: 255
};

// --- CONSTANTES DE ROLES ---
export const ROLES = {
  ADMIN: 'admin',
  EMPLEADO: 'empleado',
  CLIENTE: 'cliente'
};

// --- CONSTANTES DE MENSAJES ---
export const MENSAJES = {
  ERROR_GENERICO: 'Ocurrió un error inesperado. Por favor, intente nuevamente.',
  CARGA_DATOS: 'Cargando datos...',
  SIN_DATOS: 'No hay datos disponibles.',
  CONFIRMACION_ELIMINAR: '¿Está seguro de que desea eliminar este elemento? Esta acción no se puede deshacer.'
};

// --- CONSTANTES DE API ---
export const API_TIMEOUT = 15000; // 15 segundos

// --- CONSTANTES DE UI ---
export const UI = {
  DEBOUNCE_BUSQUEDA: 300, // milisegundos
  MAX_ITEMS_POR_PAGINA: 100
};
