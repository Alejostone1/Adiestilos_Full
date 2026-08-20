/**
 * Controlador para la gestión de usuarios.
 * Maneja las solicitudes HTTP y las respuestas para las operaciones CRUD de usuarios.
 */

// --- IMPORTACIONES ---
const usuariosService = require('./usuariosService');
const {
  respuestaExitosa,
  respuestaCreada,
  respuestaPaginada
} = require('../../utils/responseHelper');
const { capturarErroresAsync } = require('../../utils/errorHelper');

// --- CONTROLADORES ---

/**
 * Controlador para obtener todos los usuarios de forma paginada y con filtros.
 * @route GET /api/usuarios
 */
const obtenerTodosLosUsuarios = capturarErroresAsync(async (req, res) => {
  // Extraer filtros y paginación de los query params
  const { pagina = 1, limite = 10, ...filtros } = req.query;

  const resultado = await usuariosService.obtenerTodos(filtros, { pagina, limite });

  // Usar el helper para respuestas paginadas
  res.status(200).json(respuestaPaginada(
    resultado.datos,
    resultado.paginacion,
    'Usuarios obtenidos exitosamente.'
  ));
});

/**
 * Controlador para obtener un usuario por su ID.
 * @route GET /api/usuarios/:id
 */
const obtenerUsuarioPorId = capturarErroresAsync(async (req, res) => {
  const { id } = req.params;
  const usuario = await usuariosService.obtenerPorId(id);
  res.status(200).json(respuestaExitosa(usuario));
});

/**
 * Controlador para crear un nuevo usuario.
 * @route POST /api/usuarios
 */
const crearUsuario = capturarErroresAsync(async (req, res) => {
  const nuevoUsuario = await usuariosService.crear(req.body);
  res.status(201).json(respuestaCreada(nuevoUsuario, 'Usuario creado exitosamente.'));
});

/**
 * Controlador para actualizar un usuario existente.
 * @route PUT /api/usuarios/:id
 */
const actualizarUsuario = capturarErroresAsync(async (req, res) => {
  const { id } = req.params;
  const datos = req.body;
  const usuarioActualizado = await usuariosService.actualizar(id, datos);
  res.status(200).json(respuestaExitosa(usuarioActualizado, 'Usuario actualizado exitosamente.'));
});

/**
 * Controlador para eliminar (soft delete) un usuario.
 * @route DELETE /api/usuarios/:id
 */
const eliminarUsuario = capturarErroresAsync(async (req, res) => {
  const { id } = req.params;
  const resultado = await usuariosService.eliminar(id);
  res.status(200).json(respuestaExitosa(resultado));
});

/**
 * Controlador para cambiar el estado de un usuario.
 * @route PATCH /api/usuarios/:id/estado
 */
const cambiarEstadoUsuario = capturarErroresAsync(async (req, res) => {
  const { id } = req.params;
  const { nuevoEstado } = req.body;
  const usuarioActualizado = await usuariosService.cambiarEstado(id, nuevoEstado);
  res.status(200).json(respuestaExitosa(usuarioActualizado, `Estado del usuario cambiado a '${nuevoEstado}'.`));
});

/**
 * Controlador para obtener clientes con crédito.
 * @route GET /api/usuarios/con-credito
 */
const obtenerUsuariosConCredito = capturarErroresAsync(async (req, res) => {
    const resultado = await usuariosService.obtenerClientesConCredito();
    res.status(200).json(respuestaExitosa(resultado.datos, resultado.mensaje));
});

/**
 * Controlador para obtener métricas de un usuario.
 * @route GET /api/usuarios/:id/metricas
 */
const obtenerMetricasUsuario = capturarErroresAsync(async (req, res) => {
  const { id } = req.params;
  const metricas = await usuariosService.obtenerMetricasUsuario(Number(id));
  res.status(200).json(respuestaExitosa(metricas, 'Métricas del usuario obtenidas exitosamente.'));
});

/**
 * Controlador para obtener historial de ventas de un usuario.
 * @route GET /api/usuarios/:id/ventas
 */
const obtenerHistorialVentasUsuario = capturarErroresAsync(async (req, res) => {
  const { id } = req.params;
  const { pagina = 1, limite = 10 } = req.query;
  const historial = await usuariosService.obtenerHistorialVentasUsuario(Number(id), { pagina, limite });
  res.status(200).json(respuestaPaginada(
    historial.datos,
    historial.paginacion,
    'Historial de ventas obtenido exitosamente.'
  ));
});

/**
 * Controlador para obtener historial de créditos de un usuario.
 * @route GET /api/usuarios/:id/creditos
 */
const obtenerHistorialCreditosUsuario = capturarErroresAsync(async (req, res) => {
  const { id } = req.params;
  const { pagina = 1, limite = 10 } = req.query;
  const historial = await usuariosService.obtenerHistorialCreditosUsuario(Number(id), { pagina, limite });
  res.status(200).json(respuestaPaginada(
    historial.datos,
    historial.paginacion,
    'Historial de créditos obtenido exitosamente.'
  ));
});


// --- EXPORTACIÓN ---
module.exports = {
  obtenerTodosLosUsuarios,
  obtenerUsuarioPorId,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario,
  cambiarEstadoUsuario,
  obtenerUsuariosConCredito,
  obtenerMetricasUsuario,
  obtenerHistorialVentasUsuario,
  obtenerHistorialCreditosUsuario
};
