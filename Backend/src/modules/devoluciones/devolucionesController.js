/**
 * Controlador para la gestión de Devoluciones.
 * Maneja las solicitudes HTTP y las respuestas para las operaciones de devoluciones.
 */

// --- IMPORTACIONES ---
const devolucionesService = require('./devolucionesService');
const {
  respuestaExitosa,
  respuestaCreada,
  respuestaPaginada
} = require('../../utils/responseHelper');
const { capturarErroresAsync } = require('../../utils/errorHelper');

// --- CONTROLADORES ---

/**
 * Controlador para crear una nueva devolución.
 * @route POST /api/devoluciones
 */
const crearDevolucion = capturarErroresAsync(async (req, res) => {
  const datosDevolucion = req.body;
  datosDevolucion.usuarioRegistro = req.usuario.idUsuario; // Usuario que registra la operación

  const nuevaDevolucion = await devolucionesService.crear(datosDevolucion);
  res.status(201).json(respuestaCreada(nuevaDevolucion, 'Devolución creada exitosamente.'));
});

/**
 * Controlador para obtener todas las devoluciones.
 * @route GET /api/devoluciones
 */
const obtenerDevoluciones = capturarErroresAsync(async (req, res) => {
  const { pagina = 1, limite = 10, ...filtros } = req.query;
  const resultado = await devolucionesService.obtenerTodas(filtros, { pagina, limite });

  res.status(200).json(respuestaPaginada(
    resultado.datos,
    resultado.paginacion,
    'Devoluciones obtenidas exitosamente.'
  ));
});

/**
 * Controlador para obtener una devolución por su ID.
 * @route GET /api/devoluciones/:id
 */
const obtenerDevolucionPorId = capturarErroresAsync(async (req, res) => {
  const { id } = req.params;
  const devolucion = await devolucionesService.obtenerPorId(id, req.usuario);
  res.status(200).json(respuestaExitosa(devolucion));
});


/**
 * Controlador para actualizar una devolución.
 * @route PUT /api/devoluciones/:id
 */
const actualizarDevolucion = capturarErroresAsync(async (req, res) => {
  const { id } = req.params;
  const datosActualizacion = req.body;

  const devolucionActualizada = await devolucionesService.actualizar(id, datosActualizacion);
  res.status(200).json(respuestaExitosa(devolucionActualizada, 'Devolución actualizada exitosamente.'));
});

/**
 * Controlador para cambiar el estado de una devolución.
 * @route PATCH /api/devoluciones/:id/estado
 */
const cambiarEstadoDevolucion = capturarErroresAsync(async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;

  const devolucionActualizada = await devolucionesService.cambiarEstado(id, estado, req.usuario);
  res.status(200).json(respuestaExitosa(devolucionActualizada, 'Estado de devolución actualizado exitosamente.'));
});

/**
 * Controlador para eliminar una devolución (baja lógica).
 * @route DELETE /api/devoluciones/:id
 */
const eliminarDevolucion = capturarErroresAsync(async (req, res) => {
  const { id } = req.params;

  await devolucionesService.eliminar(id, req.usuario);
  res.status(200).json(respuestaExitosa(null, 'Devolución eliminada exitosamente.'));
});

// --- EXPORTACIÓN ---
module.exports = {
  crearDevolucion,
  obtenerDevoluciones,
  obtenerDevolucionPorId,
  actualizarDevolucion,
  cambiarEstadoDevolucion,
  eliminarDevolucion
};
