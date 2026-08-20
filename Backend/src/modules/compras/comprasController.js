/**
 * Controlador para la gestión de Compras.
 * Maneja las solicitudes HTTP y las respuestas para las operaciones de compras a proveedores.
 */

// --- IMPORTACIONES ---
const comprasService = require('./comprasService');
const {
  respuestaExitosa,
  respuestaCreada,
  respuestaPaginada
} = require('../../utils/responseHelper');
const { capturarErroresAsync } = require('../../utils/errorHelper');

// --- CONTROLADORES ---

/**
 * Controlador para crear una nueva orden de compra.
 * @route POST /api/compras
 */
const crearCompra = capturarErroresAsync(async (req, res) => {
  const datosCompra = req.body;
  datosCompra.idUsuarioRegistro = req.usuario.idUsuario;

  const nuevaCompra = await comprasService.crear(datosCompra);
  res.status(201).json(respuestaCreada(nuevaCompra, 'Orden de compra creada exitosamente.'));
});

/**
 * Controlador para obtener todas las compras.
 * @route GET /api/compras
 */
const obtenerTodasLasCompras = capturarErroresAsync(async (req, res) => {
  try {
    const { pagina = 1, limite = 10, ...filtros } = req.query;
    const resultado = await comprasService.obtenerTodas(filtros, { pagina, limite });

    res.status(200).json(respuestaPaginada(
      resultado.datos,
      resultado.paginacion,
      'Compras obtenidas exitosamente.'
    ));
  } catch (error) {
    console.error('CRITICAL ERROR in obtenerTodasLasCompras:', error);
    res.status(500).json({ 
      error: true, 
      mensaje: error.message,
      stack: error.stack 
    });
  }
});

/**
 * Controlador para obtener una compra por su ID.
 * @route GET /api/compras/:id
 */
const obtenerCompraPorId = capturarErroresAsync(async (req, res) => {
  const { id } = req.params;
  const compra = await comprasService.obtenerPorId(id);
  res.status(200).json(respuestaExitosa(compra));
});

/**
 * Controlador para recibir una compra y actualizar inventario.
 * @route POST /api/compras/:id/recibir
 */
const recibirCompra = capturarErroresAsync(async (req, res) => {
    const { id } = req.params;
    const { detallesRecibidos } = req.body; // Permite especificar cantidades parciales
    const idUsuario = req.usuario.idUsuario;

    const compraActualizada = await comprasService.recibir(id, idUsuario, detallesRecibidos);
    res.status(200).json(respuestaExitosa(compraActualizada, 'La compra ha sido recibida y el inventario actualizado.'));
});

/**
 * Controlador para actualizar el estado de una compra.
 * @route PATCH /api/compras/:id/estado
 */
const actualizarEstadoCompra = capturarErroresAsync(async (req, res) => {
  const { id } = req.params;
  const { idEstadoPedido } = req.body;

  const compraActualizada = await comprasService.actualizarEstado(id, idEstadoPedido);
  res.status(200).json(respuestaExitosa(compraActualizada, 'Estado de la compra actualizado exitosamente.'));
});

// --- EXPORTACIÓN ---
module.exports = {
  crearCompra,
  obtenerTodasLasCompras,
  obtenerCompraPorId,
  recibirCompra,
  actualizarEstadoCompra
};
