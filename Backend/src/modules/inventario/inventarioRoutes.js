/**
 * Rutas para Inventario.
 */

const express = require('express');
const router = express.Router();
const { rutaAdministrador } = require('../../middleware/authMiddleware');
const {
  obtenerStockController,
  obtenerEstadisticasController,
  obtenerStockVarianteController,
  obtenerMovimientosController,
} = require('./inventarioController');

// Rutas para inventario
router.get('/stock', rutaAdministrador(), obtenerStockController);
router.get('/estadisticas', rutaAdministrador(), obtenerEstadisticasController);
router.get('/variante/:id/stock', rutaAdministrador(), obtenerStockVarianteController);
router.get('/movimientos', rutaAdministrador(), obtenerMovimientosController);

module.exports = router;
