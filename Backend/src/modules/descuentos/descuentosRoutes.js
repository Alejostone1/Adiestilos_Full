const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');

const { manejarResultadosValidacion } = require('../../utils/validationHelper');
const { verificarTokenMiddleware, verificarRol } = require('../../middleware/authMiddleware');

const {
  crearDescuento,
  obtenerDescuentos,
  obtenerDescuentoPorId,
  obtenerDescuentoPorCodigo,
  actualizarDescuento,
  eliminarDescuento,
  actualizarEstadoDescuento,
  validarDescuento,
  obtenerHistorialDescuento,
  obtenerHistorialGeneral,
  obtenerEstadisticasDescuentos,
} = require('./descuentosController');

/* ======================================================
   RUTAS ADMINISTRATIVAS (PROTEGIDAS)
====================================================== */

/**
 * Crear descuento
 * POST /api/descuentos
 */
router.post(
  '/',
  [
    verificarTokenMiddleware,
    verificarRol('Administrador'),
    body('nombreDescuento').notEmpty().withMessage('El nombre del descuento es requerido'),
    body('tipoDescuento').isIn(['porcentaje', 'valor_fijo']).withMessage('El tipo de descuento debe ser porcentaje o valor_fijo'),
    body('valorDescuento').isFloat({ gt: 0 }).withMessage('El valor del descuento debe ser un número mayor a 0'),
    body('aplicaA').isIn(['total_venta', 'categoria', 'producto', 'cliente']).withMessage('El campo aplicaA debe ser uno de: total_venta, categoria, producto, cliente'),
    body('idCategoria')
      .if(body('aplicaA').equals('categoria'))
      .notEmpty().withMessage('Debe seleccionar una categoría')
      .isInt({ min: 1 }).withMessage('La categoría debe ser un ID válido'),
    body('idProducto')
      .if(body('aplicaA').equals('producto'))
      .notEmpty().withMessage('Debe seleccionar un producto')
      .isInt({ min: 1 }).withMessage('El producto debe ser un ID válido'),
    body('montoMinimoCompra').optional({ nullable: true }).isFloat({ min: 0 }).withMessage('El monto mínimo debe ser un número mayor o igual a 0'),
    body('cantidadMaximaUsos').optional({ nullable: true, checkFalsy: true }).isInt({ min: 1 }).withMessage('La cantidad máxima de usos debe ser un número entero mayor a 0'),
    body('usoPorCliente').optional({ nullable: true }).isInt({ min: 0 }).withMessage('Los usos por cliente deben ser un número entero mayor o igual a 0'),
    body('fechaInicio').optional({ nullable: true, checkFalsy: true }).isISO8601().withMessage('La fecha de inicio debe tener formato YYYY-MM-DD'),
    body('fechaFin').optional({ nullable: true, checkFalsy: true }).isISO8601().withMessage('La fecha de fin debe tener formato YYYY-MM-DD'),
    body('requiereCodigo').optional().isBoolean().withMessage('El campo requiereCodigo debe ser un valor booleano'),
    body('codigoDescuento').optional({ nullable: true, checkFalsy: true }).isString().trim().isLength({ min: 1 }).withMessage('El código de descuento debe ser una cadena de texto no vacía'),
    body('descripcion').optional({ nullable: true, checkFalsy: true }).isString().withMessage('La descripción debe ser una cadena de texto'),
    manejarResultadosValidacion,
  ],
  crearDescuento
);

/**
 * Listar descuentos (admin)
 * GET /api/descuentos
 */
router.get(
  '/',
  [
    verificarTokenMiddleware,
    verificarRol('Administrador'),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('estado').optional().isIn(['', 'activo', 'inactivo', 'vencido']),
    query('tipoDescuento').optional().isIn(['', 'porcentaje', 'valor_fijo']),
    query('aplicaA').optional().isIn(['', 'total_venta', 'categoria', 'producto', 'cliente']),
    manejarResultadosValidacion,
  ],
  obtenerDescuentos
);

/**
 * Estadísticas de descuentos
 * GET /api/descuentos/estadisticas
 */
router.get(
  '/estadisticas',
  [
    verificarTokenMiddleware,
    verificarRol('Administrador'),
  ],
  obtenerEstadisticasDescuentos
);

/**
 * Historial general
 * GET /api/descuentos/historial
 */
router.get(
  '/historial',
  [
    verificarTokenMiddleware,
    verificarRol('Administrador'),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('idDescuento').optional().isInt({ gt: 0 }),
    query('idUsuario').optional().isInt({ gt: 0 }),
    query('fechaInicio').optional().isISO8601(),
    query('fechaFin').optional().isISO8601(),
    manejarResultadosValidacion,
  ],
  obtenerHistorialGeneral
);

/**
 * Historial por descuento
 * GET /api/descuentos/:id/historial
 */
router.get(
  '/:id/historial',
  [
    verificarTokenMiddleware,
    verificarRol('Administrador'),
    param('id').isInt({ gt: 0 }),
    manejarResultadosValidacion,
  ],
  obtenerHistorialDescuento
);

/**
 * Actualizar estado
 * PATCH /api/descuentos/:id/estado
 */
router.patch(
  '/:id/estado',
  [
    verificarTokenMiddleware,
    verificarRol('Administrador'),
    param('id').isInt({ gt: 0 }),
    body('estado').isIn(['activo', 'inactivo', 'vencido']),
    manejarResultadosValidacion,
  ],
  actualizarEstadoDescuento
);

/**
 * Actualizar descuento
 * PUT /api/descuentos/:id
 */
router.put(
  '/:id',
  [
    verificarTokenMiddleware,
    verificarRol('Administrador'),
    param('id').isInt({ gt: 0 }),
    body('nombreDescuento').optional().notEmpty(),
    body('tipoDescuento').optional().isIn(['porcentaje', 'valor_fijo']),
    body('valorDescuento').optional().isFloat({ gt: 0 }),
    body('aplicaA').optional().isIn(['total_venta', 'categoria', 'producto', 'cliente']),
    body('idCategoria').optional().isInt({ gt: 0 }),
    body('idProducto').optional().isInt({ gt: 0 }),
    body('montoMinimoCompra').optional().isFloat({ min: 0 }),
    body('cantidadMaximaUsos').optional().isInt({ min: 1 }),
    body('usoPorCliente').optional().isInt({ min: 0 }),
    body('fechaInicio').optional().isISO8601(),
    body('fechaFin').optional().isISO8601(),
    body('requiereCodigo').optional().isBoolean(),
    manejarResultadosValidacion,
  ],
  actualizarDescuento
);

/**
 * Eliminar descuento
 * DELETE /api/descuentos/:id
 */
router.delete(
  '/:id',
  [
    verificarTokenMiddleware,
    verificarRol('Administrador'),
    param('id').isInt({ gt: 0 }),
    manejarResultadosValidacion,
  ],
  eliminarDescuento
);

/**
 * Obtener descuento por ID
 * GET /api/descuentos/:id
 */
router.get(
  '/:id',
  [
    verificarTokenMiddleware,
    verificarRol('Administrador'),
    param('id').isInt({ gt: 0 }),
    manejarResultadosValidacion,
  ],
  obtenerDescuentoPorId
);

/* ======================================================
   RUTAS DE USUARIO
====================================================== */

/**
 * Validar descuento
 * POST /api/descuentos/validar
 */
router.post(
  '/validar',
  [
    verificarTokenMiddleware,
    body('codigoDescuento').notEmpty(),
    body('montoCompra').isFloat({ min: 0 }),
    manejarResultadosValidacion,
  ],
  validarDescuento
);

/**
 * Obtener descuento por código
 * GET /api/descuentos/codigo/:codigo
 */
router.get(
  '/codigo/:codigo',
  [
    param('codigo').notEmpty().trim(),
    manejarResultadosValidacion,
  ],
  obtenerDescuentoPorCodigo
);

module.exports = router;
