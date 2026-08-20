/**
 * @file variantesFormatter.js
 * @brief Utilidades para formatear y enriquecer datos de variantes con cálculos
 * 
 * Proporciona funciones para:
 * - Calcular margen y margen porcentaje
 * - Enriquecer respuestas con datos calculados
 * - Normalizar datos de variantes
 */

/**
 * Calcula el margen y margen porcentaje de una variante
 * @param {Decimal} precioVenta - Precio de venta
 * @param {Decimal} precioCosto - Precio de costo
 * @returns {Object} {margen, margenPorcentaje}
 */
const calcularMargen = (precioVenta, precioCosto) => {
  const pv = Number(precioVenta);
  const pc = Number(precioCosto);
  
  if (pv <= 0 || pc < 0) {
    return { margen: 0, margenPorcentaje: 0 };
  }

  const margen = pv - pc;
  const margenPorcentaje = pv > 0 ? Number(((margen / pv) * 100).toFixed(2)) : 0;

  return {
    margen: Number(margen.toFixed(2)),
    margenPorcentaje
  };
};

/**
 * Enriquece una variante con campos calculados
 * @param {Object} variante - Datos de la variante de Prisma
 * @returns {Object} Variante enriquecida con margen, etc.
 */
const enriquecerVariante = (variante) => {
  if (!variante) return null;

  const precioVenta = Number(variante.precioVenta);
  const precioCosto = Number(variante.precioCosto);
  const { margen, margenPorcentaje } = calcularMargen(precioVenta, precioCosto);

  return {
    ...variante,
    precioVenta,
    precioCosto,
    cantidadStock: Number(variante.cantidadStock),
    stockMinimo: Number(variante.stockMinimo || 0),
    stockMaximo: Number(variante.stockMaximo || 0),
    margen,
    margenPorcentaje
  };
};

/**
 * Enriquece un arreglo de variantes con campos calculados
 * @param {Array} variantes - Arreglo de variantes de Prisma
 * @returns {Array} Variantes enriquecidas
 */
const enriquecerVariantes = (variantes) => {
  if (!Array.isArray(variantes)) {
    return [];
  }
  return variantes.map(enriquecerVariante);
};

/**
 * Formatea una variante para respuesta de API
 * Incluye solo los campos necesarios para el frontend
 * @param {Object} variante - Datos de la variante
 * @returns {Object} Variante formateada
 */
const formatearVarianteParaAPI = (variante) => {
  const enriquecida = enriquecerVariante(variante);
  
  return {
    idVariante: enriquecida.idVariante,
    codigoSku: enriquecida.codigoSku,
    
    // Precios (OBLIGATORIO)
    precioCosto: enriquecida.precioCosto,
    precioVenta: enriquecida.precioVenta,
    margen: enriquecida.margen,
    margenPorcentaje: enriquecida.margenPorcentaje,
    
    // Stock
    cantidadStock: enriquecida.cantidadStock,
    stockMinimo: enriquecida.stockMinimo,
    stockMaximo: enriquecida.stockMaximo,
    
    // Variantes (color/talla)
    color: enriquecida.color ? {
      idColor: enriquecida.color.idColor,
      nombreColor: enriquecida.color.nombreColor,
      codigoHex: enriquecida.color.codigoHex
    } : null,
    
    talla: enriquecida.talla ? {
      idTalla: enriquecida.talla.idTalla,
      nombreTalla: enriquecida.talla.nombreTalla
    } : null,
    
    // Imágenes
    imagen: enriquecida.imagenesVariantes && enriquecida.imagenesVariantes.length > 0 
      ? enriquecida.imagenesVariantes[0].rutaImagen 
      : null,
    
    estado: enriquecida.estado,
    creadoEn: enriquecida.creadoEn,
    actualizadoEn: enriquecida.actualizadoEn
  };
};

/**
 * Formatea un arreglo de variantes para respuesta de API
 * @param {Array} variantes - Arreglo de variantes
 * @returns {Array} Variantes formateadas
 */
const formatearVariantesParaAPI = (variantes) => {
  if (!Array.isArray(variantes)) {
    return [];
  }
  return variantes.map(formatearVarianteParaAPI);
};

module.exports = {
  calcularMargen,
  enriquecerVariante,
  enriquecerVariantes,
  formatearVarianteParaAPI,
  formatearVariantesParaAPI
};
