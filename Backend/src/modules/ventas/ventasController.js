/**
 * Controlador para la gestión de Ventas.
 * Maneja las solicitudes HTTP y las respuestas para las operaciones de ventas.
 */

// --- IMPORTACIONES ---
const ventasService = require('./ventasService');
const {
  respuestaExitosa,
  respuestaCreada,
  respuestaPaginada
} = require('../../utils/responseHelper');
const { capturarErroresAsync } = require('../../utils/errorHelper');

// --- CONTROLADORES ---

/**
 * Controlador para obtener todas las ventas.
 * @route GET /api/ventas
 */
const obtenerTodasLasVentas = capturarErroresAsync(async (req, res) => {
  const { pagina = 1, limite = 10, ...filtros } = req.query;
  const resultado = await ventasService.obtenerTodas(filtros, req.usuario, { pagina, limite });

  res.status(200).json(respuestaPaginada(
    resultado.datos,
    resultado.paginacion,
    'Ventas obtenidas exitosamente.'
  ));
});

/**
 * Controlador para obtener una venta por su ID.
 * @route GET /api/ventas/:id
 */
const obtenerVentaPorId = capturarErroresAsync(async (req, res) => {
  const { id } = req.params;
  const venta = await ventasService.obtenerPorId(id, req.usuario);
  res.status(200).json(respuestaExitosa(venta));
});

/**
 * Controlador para crear una nueva venta.
 * @route POST /api/ventas
 */
const crearVenta = capturarErroresAsync(async (req, res) => {
  const datosVenta = req.body;
  // Asignar el vendedor que está realizando la operación
  datosVenta.idUsuarioVendedor = req.usuario.idUsuario;

  const nuevaVenta = await ventasService.crear(datosVenta, req.usuario);
  res.status(201).json(respuestaCreada(nuevaVenta, 'Venta creada exitosamente.'));
});

/**
 * Controlador para actualizar el estado de una venta.
 * @route PATCH /api/ventas/:id/estado
 */
const actualizarEstadoVenta = capturarErroresAsync(async (req, res) => {
    const { id } = req.params;
    const { idEstadoPedido } = req.body;

    const ventaActualizada = await ventasService.actualizarEstado(id, idEstadoPedido, req.usuario);
    res.status(200).json(respuestaExitosa(ventaActualizada, 'Estado de la venta actualizado.'));
});


// --- EXPORTACIÓN ---
module.exports = {
  obtenerTodasLasVentas,
  obtenerVentaPorId,
  crearVenta,
  actualizarEstadoVenta
};
