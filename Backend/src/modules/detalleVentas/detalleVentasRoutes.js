
const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validationHelper');
const { authMiddleware } = require('../../middleware/authMiddleware'); // Asumiendo que existe un middleware de autenticación

const {
  crearDetalleVenta,
  obtenerDetallesPorVenta,
  obtenerDetalleVenta,
} = require('./detalleVentasController');

/**
 * @swagger
 * /api/detalles-venta:
 *   post:
 *     summary: Crea un nuevo detalle para una venta.
 *     description: Añade un producto (variante) a una venta existente, actualiza el stock y los totales de la venta.
 *     tags: [DetalleVentas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               idVenta:
 *                 type: integer
 *                 description: ID de la venta a la que se añade el detalle.
 *               idVariante:
 *                 type: integer
 *                 description: ID de la variante de producto que se está vendiendo.
 *               cantidad:
 *                 type: number
 *                 format: double
 *                 description: Cantidad del producto vendido.
 *               descuentoLinea:
 *                 type: number
 *                 format: double
 *                 description: (Opcional) Descuento aplicado a esta línea de venta.
 *     responses:
 *       201:
 *         description: Detalle de venta creado exitosamente.
 *       400:
 *         description: Datos de entrada inválidos o error de negocio (ej. stock insuficiente).
 *       401:
 *         description: No autorizado.
 */
router.post(
  '/',
  [
    authMiddleware,
    body('idVenta').isInt({ gt: 0 }).withMessage('El ID de la venta debe ser un entero positivo.'),
    body('idVariante').isInt({ gt: 0 }).withMessage('El ID de la variante debe ser un entero positivo.'),
    body('cantidad').isFloat({ gt: 0 }).withMessage('La cantidad debe ser un número positivo.'),
    body('descuentoLinea').optional().isFloat({ min: 0 }).withMessage('El descuento no puede ser negativo.'),
    handleValidationErrors,
  ],
  crearDetalleVenta
);

/**
 * @swagger
 * /api/detalles-venta/venta/{idVenta}:
 *   get:
 *     summary: Obtiene todos los detalles de una venta específica.
 *     tags: [DetalleVentas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: idVenta
 *         required: true
 *         schema:
 *           type: integer
 *         description: El ID de la venta.
 *     responses:
 *       200:
 *         description: Lista de detalles de la venta.
 *       404:
 *         description: Venta no encontrada.
 */
router.get(
  '/venta/:idVenta',
  [
    authMiddleware,
    param('idVenta').isInt({ gt: 0 }).withMessage('El ID de la venta debe ser un entero válido.'),
    handleValidationErrors,
  ],
  obtenerDetallesPorVenta
);

/**
 * @swagger
 * /api/detalles-venta/{id}:
 *   get:
 *     summary: Obtiene un detalle de venta por su ID.
 *     tags: [DetalleVentas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: El ID del detalle de venta.
 *     responses:
 *       200:
 *         description: Detalle de venta encontrado.
 *       404:
 *         description: Detalle de venta no encontrado.
 */
router.get(
  '/:id',
  [
    authMiddleware,
    param('id').isInt({ gt: 0 }).withMessage('El ID debe ser un entero válido.'),
    handleValidationErrors,
  ],
  obtenerDetalleVenta
);

module.exports = router;
