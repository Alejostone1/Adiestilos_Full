
const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validationHelper');
const { authMiddleware, adminMiddleware } = require('../../middleware/authMiddleware');

const {
  crearDevolucion,
  cambiarEstadoDevolucion,
  procesarDevolucion,
} = require('./detalleDevolucionesController');

/**
 * @swagger
 * /api/devoluciones:
 *   post:
 *     summary: Crea una nueva solicitud de devolución.
 *     description: Inicia un proceso de devolución en estado 'pendiente'. No afecta inventario ni finanzas hasta ser procesada.
 *     tags: [Devoluciones]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [idVenta, idUsuario, motivo, tipoDevolucion, detalles]
 *             properties:
 *               idVenta: { type: 'integer' }
 *               idUsuario: { type: 'integer' }
 *               motivo: { type: 'string' }
 *               tipoDevolucion: { type: 'string', enum: ['total', 'parcial'] }
 *               detalles: { 
 *                  type: 'array', 
 *                  items: { 
 *                      type: 'object', 
 *                      required: [idDetalleVenta, cantidadDevuelta],
 *                      properties: {
 *                          idDetalleVenta: { type: 'integer' },
 *                          cantidadDevuelta: { type: 'number' }
 *                      }
 *                  } 
 *               }
 *     responses:
 *       201:
 *         description: Solicitud de devolución creada.
 *       400:
 *         description: Datos inválidos.
 */
router.post(
  '/',
  [
    authMiddleware, // Cualquier usuario autenticado puede solicitar una devolución
    body('idVenta').isInt({ gt: 0 }),
    body('idUsuario').isInt({ gt: 0 }),
    body('motivo').notEmpty().isString(),
    body('tipoDevolucion').isIn(['total', 'parcial']),
    body('detalles').isArray({ min: 1 }),
    body('detalles.*.idDetalleVenta').isInt({ gt: 0 }),
    body('detalles.*.cantidadDevuelta').isFloat({ gt: 0 }),
    handleValidationErrors,
  ],
  crearDevolucion
);

/**
 * @swagger
 * /api/devoluciones/{idDevolucion}/estado:
 *   patch:
 *     summary: Cambia el estado de una devolución (ej. aprobar/rechazar).
 *     tags: [Devoluciones]
 *     security:
 *       - bearerAuth: [admin]
 *     parameters:
 *       - in: path
 *         name: idDevolucion
 *         required: true
 *         schema: { type: 'integer' }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [estado]
 *             properties:
 *               estado: { type: 'string', enum: ['aprobada', 'rechazada'] }
 *     responses:
 *       200:
 *         description: Estado actualizado.
 */
router.patch(
  '/:idDevolucion/estado',
  [
    authMiddleware,
    adminMiddleware,
    param('idDevolucion').isInt({ gt: 0 }),
    body('estado').isIn(['aprobada', 'rechazada']),
    handleValidationErrors,
  ],
  cambiarEstadoDevolucion
);

/**
 * @swagger
 * /api/devoluciones/{idDevolucion}/procesar:
 *   post:
 *     summary: Procesa una devolución 'aprobada'.
 *     description: Actualiza el inventario, ajusta finanzas y marca la devolución como 'procesada'.
 *     tags: [Devoluciones]
 *     security:
 *       - bearerAuth: [admin]
 *     parameters:
 *       - in: path
 *         name: idDevolucion
 *         required: true
 *         schema: { type: 'integer' }
 *     responses:
 *       200:
 *         description: Devolución procesada exitosamente.
 *       400:
 *         description: La devolución no está en estado 'aprobada' o ya fue procesada.
 */
router.post(
    '/:idDevolucion/procesar',
    [
      authMiddleware,
      adminMiddleware,
      param('idDevolucion').isInt({ gt: 0 }),
      handleValidationErrors,
    ],
    procesarDevolucion
);


module.exports = router;
