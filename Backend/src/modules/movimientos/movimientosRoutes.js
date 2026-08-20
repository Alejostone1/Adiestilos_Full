
const express = require('express');
const router = express.Router();
const { rutaAdministrador } = require('../../middleware/authMiddleware');

const {
  obtenerMovimientosController,
  obtenerMovimientoController,
} = require('./movimientosController');

/**
 * @swagger
 * /api/movimientos:
 *   get:
 *     summary: Obtiene una lista de movimientos de inventario.
 *     description: Retorna una lista paginada y filtrable de todos los movimientos de inventario.
 *     tags: [MovimientosInventario]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página.
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Cantidad de resultados por página.
 *       - in: query
 *         name: idVariante
 *         schema:
 *           type: integer
 *         description: Filtrar por ID de variante.
 *       - in: query
 *         name: idProducto
 *         schema:
 *           type: integer
 *         description: Filtrar por ID de producto.
 *       - in: query
 *         name: idTipoMovimiento
 *         schema:
 *           type: integer
 *         description: Filtrar por tipo de movimiento.
 *       - in: query
 *         name: fechaInicio
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de inicio del filtro (YYYY-MM-DD).
 *       - in: query
 *         name: fechaFin
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de fin del filtro (YYYY-MM-DD).
 *     responses:
 *       200:
 *         description: Lista de movimientos obtenida exitosamente.
 *       401:
 *         description: No autorizado.
 */
router.get('/', rutaAdministrador(), obtenerMovimientosController);

/**
 * @swagger
 * /api/movimientos/{id}:
 *   get:
 *     summary: Obtiene un movimiento de inventario por su ID.
 *     tags: [MovimientosInventario]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: El ID del movimiento de inventario.
 *     responses:
 *       200:
 *         description: Movimiento de inventario encontrado.
 *       404:
 *         description: Movimiento no encontrado.
 */
router.get('/:id', rutaAdministrador(), obtenerMovimientoController);

module.exports = router;
