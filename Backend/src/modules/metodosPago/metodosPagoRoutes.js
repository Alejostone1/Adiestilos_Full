
const express = require('express');
const router = express.Router();
const {
  obtenerMetodosPago,
  obtenerMetodoPagoPorId,
  crearMetodoPago,
  actualizarMetodoPago,
  eliminarMetodoPago,
  obtenerTiposMetodoPago,
} = require('./metodosPagoController');
const { verificarTokenMiddleware, rutaAdministrador } = require('../../middleware/authMiddleware');

// Rutas para los métodos de pago

// 1. Obtener todos los métodos de pago (protegido)
router.get('/', verificarTokenMiddleware, obtenerMetodosPago);

// 2. Obtener todos los tipos de métodos (DEBE IR ANTES DE /:id para evitar conflictos)
router.get('/tipos', verificarTokenMiddleware, obtenerTiposMetodoPago);

// 3. Obtener un método de pago por ID (protegido)
router.get('/:id', verificarTokenMiddleware, obtenerMetodoPagoPorId);

// 4. Crear un nuevo método de pago (solo administradores)
router.post('/', rutaAdministrador(), crearMetodoPago);

// 5. Actualizar un método de pago (solo administradores)
router.put('/:id', rutaAdministrador(), actualizarMetodoPago);

// 6. Eliminar un método de pago (solo administradores)
router.delete('/:id', rutaAdministrador(), eliminarMetodoPago);

module.exports = router;
