/**
 * API pública para la tienda (sin autenticación)
 * Consume endpoints de /api/public/*
 */
import apiClient from './axiosConfig';

// ====== CATEGORÍAS ======

/**
 * Obtener todas las categorías activas con subcategorías
 * @returns {Promise<Object>} Lista de categorías
 */
export const obtenerCategoriasPublicas = async () => {
  const response = await apiClient.get('/public/categorias');
  return response.data;
};

/**
 * Obtener categoría por ID o slug
 * @param {string|number} idOSlug - ID numérico o slug de la categoría
 * @returns {Promise<Object>} Datos de la categoría
 */
export const obtenerCategoriaPublica = async (idOSlug) => {
  const response = await apiClient.get(`/public/categorias/${idOSlug}`);
  return response.data;
};

/**
 * Obtener productos de una categoría
 * @param {string|number} idCategoria - ID de la categoría
 * @param {Object} opciones - Opciones de filtrado y paginación
 * @param {number} [opciones.pagina] - Número de página
 * @param {number} [opciones.limite] - Límite de resultados
 * @param {string} [opciones.ordenar] - Campo de ordenamiento
 * @returns {Promise<Object>} Productos de la categoría
 */
export const obtenerProductosPorCategoria = async (idCategoria, opciones = {}) => {
  const response = await apiClient.get(`/public/categorias/${idCategoria}/productos`, {
    params: opciones
  });
  return response.data;
};

// ====== PRODUCTOS ======

/**
 * Obtener productos con filtros y paginación
 * @param {Object} opciones - Opciones de filtrado
 * @param {number} [opciones.pagina] - Número de página
 * @param {number} [opciones.limite] - Límite de resultados
 * @param {string} [opciones.ordenar] - Campo de ordenamiento
 * @param {number} [opciones.precioMin] - Precio mínimo
 * @param {number} [opciones.precioMax] - Precio máximo
 * @returns {Promise<Object>} Lista paginada de productos
 */
export const obtenerProductosPublicos = async (opciones = {}) => {
  const response = await apiClient.get('/public/productos', { params: opciones });
  return response.data;
};

/**
 * Obtener productos destacados para el home
 * @param {number} [limite=8] - Cantidad de productos a obtener
 * @returns {Promise<Object>} Lista de productos destacados
 */
export const obtenerProductosDestacados = async (limite = 8) => {
  const response = await apiClient.get('/public/productos/destacados', {
    params: { limite }
  });
  return response.data;
};

/**
 * Obtener detalle completo de un producto
 * @param {string|number} idProducto - ID del producto
 * @returns {Promise<Object>} Detalle del producto
 */
export const obtenerProductoDetalle = async (idProducto) => {
  const response = await apiClient.get(`/public/productos/${idProducto}`);
  return response.data;
};

/**
 * Obtener variantes de un producto
 * @param {string|number} idProducto - ID del producto
 * @returns {Promise<Object>} Lista de variantes del producto
 */
export const obtenerVariantesProducto = async (idProducto) => {
  const response = await apiClient.get(`/public/productos/${idProducto}/variantes`);
  return response.data;
};

/**
 * Buscar productos
 * @param {string} termino - Término de búsqueda
 * @param {Object} opciones - Opciones adicionales de filtrado
 * @param {number} [opciones.pagina] - Número de página
 * @param {number} [opciones.limite] - Límite de resultados
 * @returns {Promise<Object>} Resultados de búsqueda
 */
export const buscarProductos = async (termino, opciones = {}) => {
  const response = await apiClient.get('/public/buscar', {
    params: { q: termino, ...opciones }
  });
  return response.data;
};

/**
 * API pública agrupada
 * @type {Object}
 */
export const publicApi = {
  // Categorías
  obtenerCategoriasPublicas,
  obtenerCategoriaPublica,
  obtenerProductosPorCategoria,

  // Productos
  obtenerProductosPublicos,
  obtenerProductosDestacados,
  obtenerProductoDetalle,
  obtenerVariantesProducto,
  buscarProductos,
};

export default publicApi;
