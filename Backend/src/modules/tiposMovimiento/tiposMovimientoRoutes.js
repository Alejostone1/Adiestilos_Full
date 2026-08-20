/**
 * Rutas para Tipos de Movimiento.
 */

const express = require('express');
const router = express.Router();
const { rutaAdministrador } = require('../../middleware/authMiddleware');
const {
  crearTipoMovimientoController,
  obtenerTiposMovimientoController,
  obtenerTipoMovimientoController,
  actualizarTipoMovimientoController,
  desactivarTipoMovimientoController,
} = require('./tiposMovimientoController');

// Rutas para tipos de movimiento
router.post('/', rutaAdministrador(), crearTipoMovimientoController);
router.get('/', rutaAdministrador(), obtenerTiposMovimientoController);
router.get('/:id', rutaAdministrador(), obtenerTipoMovimientoController);
router.put('/:id', rutaAdministrador(), actualizarTipoMovimientoController);
router.patch('/:id/desactivar', rutaAdministrador(), desactivarTipoMovimientoController);

module.exports = router;
