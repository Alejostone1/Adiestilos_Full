/**
 * Controlador para la gestión de Categorías.
 */

// --- IMPORTACIONES ---
const categoriasService = require('./categoriasService');
const {
  respuestaExitosa,
  respuestaCreada
} = require('../../utils/responseHelper');
const { capturarErroresAsync } = require('../../utils/errorHelper');

// --- CONTROLADORES ---

/**
 * Obtener todas las categorías.
 * @route GET /api/categorias
 */
const obtenerTodasLasCategorias = capturarErroresAsync(async (req, res) => {
  const { jerarquia } = req.query; // ej: /categorias?jerarquia=true
  const opciones = {
    jerarquia: jerarquia === 'true'
  };
  const categorias = await categoriasService.obtenerTodas(opciones);
  res.status(200).json(respuestaExitosa(categorias));
});

/**
 * Obtener una categoría por su ID.
 * @route GET /api/categorias/:id
 */
const obtenerCategoriaPorId = capturarErroresAsync(async (req, res) => {
  const { id } = req.params;
  const categoria = await categoriasService.obtenerPorId(id);
  res.status(200).json(respuestaExitosa(categoria));
});

/**
 * Crear una nueva categoría.
 * @route POST /api/categorias
 */
const crearCategoria = capturarErroresAsync(async (req, res) => {
  const nuevaCategoria = await categoriasService.crear(req.body);
  res.status(201).json(respuestaCreada(nuevaCategoria, 'Categoría creada exitosamente.'));
});

/**
 * Actualizar una categoría existente.
 * @route PUT /api/categorias/:id
 */
const actualizarCategoria = capturarErroresAsync(async (req, res) => {
  const { id } = req.params;
  const datos = req.body;
  const categoriaActualizada = await categoriasService.actualizar(id, datos);
  res.status(200).json(respuestaExitosa(categoriaActualizada, 'Categoría actualizada exitosamente.'));
});

/**
 * Eliminar una categoría.
 * @route DELETE /api/categorias/:id
 */
const eliminarCategoria = capturarErroresAsync(async (req, res) => {
  const { id } = req.params;
  const resultado = await categoriasService.eliminar(id);
  res.status(200).json(respuestaExitosa(resultado));
});


// --- EXPORTACIÓN ---
module.exports = {
  obtenerTodasLasCategorias,
  obtenerCategoriaPorId,
  crearCategoria,
  actualizarCategoria,
  eliminarCategoria
};
