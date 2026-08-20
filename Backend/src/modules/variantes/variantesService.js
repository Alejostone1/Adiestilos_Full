
/**
 * @file variantesService.js
 * @brief Servicio para la lógica de negocio de las variantes de producto.
 *
 * Este archivo maneja todas las operaciones de base de datos para el modelo VarianteProducto,
 * incluyendo la creación, consulta, actualización y eliminación de variantes,
 * así como la gestión de sus relaciones y validaciones de negocio.
 */

const { prisma } = require('../../config/databaseConfig');
const { crearMovimiento } = require('../movimientos/movimientosService');
const { enriquecerVariantes, enriquecerVariante } = require('./variantesFormatter');

/**
 * @function obtenerVariantes
 * @brief Obtiene una lista de variantes, opcionalmente filtrada por producto.
 * @param {number} [productoId] - ID del producto para filtrar las variantes (opcional).
 * @returns {Promise<Array>} Un arreglo con las variantes encontradas enriquecidas con margen.
 * @description Retorna todas las variantes o solo las de un producto específico.
 * Incluye información relacionada como el producto, color y talla para un contexto completo.
 * Enriquece cada variante con cálculo de margen y margen porcentaje.
 */
const obtenerVariantes = async (productoId) => {
  const whereClause = productoId ? { idProducto: productoId } : {};
  const variantes = await prisma.varianteProducto.findMany({
    where: whereClause,
    include: {
      producto: {
        select: {
          idProducto: true,
          nombreProducto: true,
        },
      },
      color: {
        select: {
          idColor: true,
          nombreColor: true,
          codigoHex: true,
        },
      },
      talla: {
        select: {
          idTalla: true,
          nombreTalla: true,
        },
      },
      imagenesVariantes: {
        where: {
          esPrincipal: true
        },
        take: 1
      }
    },
    orderBy: {
      idVariante: 'desc',
    },
  });

  // Enriquecer variantes con cálculo de margen
  return enriquecerVariantes(variantes);
};

/**
 * @function obtenerVariantePorId
 * @brief Obtiene una variante específica por su ID.
 * @param {number} id - El ID de la variante a buscar.
 * @returns {Promise<object|null>} El objeto de la variante enriquecido con margen, o null.
 * @description Busca una variante por su ID, incluyendo detalles del producto, color y talla.
 * Enriquece la variante con cálculo automático de margen y margen porcentaje.
 */
const obtenerVariantePorId = async (id) => {
  const variante = await prisma.varianteProducto.findUnique({
    where: { idVariante: id },
    include: {
      producto: true,
      color: true,
      talla: true,
      imagenesVariantes: true,
    },
  });

  return variante ? enriquecerVariante(variante) : null;
};

/**
 * @function crearVariante
 * @brief Crea una nueva variante de producto.
 * @param {object} datosVariante - Datos de la variante a crear.
 *   Campos obligatorios: idProducto, codigoSku, precioVenta, precioCosto
 * @returns {Promise<object>} La variante recién creada enriquecida con margen.
 * @throws {Error} Si ya existe una variante con la misma combinación de producto, color y talla.
 * @description Antes de crear, verifica que no exista una variante idéntica
 * para la combinación de producto, color y talla, para evitar duplicados.
 */
const crearVariante = async (datosVariante, idUsuario) => {
  // Desestructurar datos para la validación
  const { idProducto, idColor, idTalla, cantidadStock, ...restoDatos } = datosVariante;

  // Validar que la combinación producto-color-talla no exista
  const varianteExistente = await prisma.varianteProducto.findFirst({
    where: {
      idProducto: idProducto,
      idColor: idColor,
      idTalla: idTalla,
    },
  });

  if (varianteExistente) {
    const error = new Error('Ya existe una variante con la misma combinación de producto, color y talla.');
    error.statusCode = 409;
    throw error;
  }

  // Usar una transacción para asegurar que la variante y el movimiento se creen juntos
  const nuevaVariante = await prisma.$transaction(async (tx) => {
    // 1. Crear la variante con stock en 0 inicialmente (el movimiento lo actualizará)
    const variante = await tx.varianteProducto.create({
      data: {
        ...restoDatos,
        idProducto,
        idColor,
        idTalla,
        cantidadStock: 0, // Empezamos en 0 para que el movimiento de Stock Inicial sea correcto
      },
      include: {
        producto: true,
        color: true,
        talla: true,
        imagenesVariantes: true
      }
    });

    // 2. Si se especificó un stock inicial, registrar el movimiento
    if (cantidadStock > 0) {
      // Buscar el tipo de movimiento para "Stock Inicial"
      let tipoMovimiento = await tx.tipoMovimiento.findFirst({
        where: { nombreTipo: 'Stock Inicial' }
      });

      // Si no existe (no se ha corrido el seed), buscar uno similar o usar el ID 5 (Ajuste por Inventario) como fallback
      if (!tipoMovimiento) {
          tipoMovimiento = await tx.tipoMovimiento.findFirst({
              where: { nombreTipo: { contains: 'Ajuste' } }
          });
      }

      await crearMovimiento(tx, {
        idVariante: variante.idVariante,
        cantidad: cantidadStock,
        idTipoMovimiento: tipoMovimiento ? tipoMovimiento.idTipoMovimiento : 7, // Fallback al ID 7 si todo falla
        usuarioRegistro: idUsuario,
        motivo: 'Carga inicial de stock al crear la variante.',
      });

      // Actualizar el stock en la variante
      return await tx.varianteProducto.update({
        where: { idVariante: variante.idVariante },
        data: { cantidadStock },
        include: {
          producto: true,
          color: true,
          talla: true,
          imagenesVariantes: true
        }
      });
    }

    return variante;
  });

  // Enriquecer la variante antes de retornarla
  return enriquecerVariante(nuevaVariante);
};

/**
 * @function actualizarVariante
 * @brief Actualiza una variante existente.
 * @param {number} id - El ID de la variante a actualizar.
 * @param {object} datosActualizacion - Datos a modificar.
 * @returns {Promise<object>} La variante actualizada enriquecida con margen.
 * @description Actualiza la información de una variante específica por su ID.
 * Enriquece el resultado con cálculo de margen.
 */
const actualizarVariante = async (id, datosActualizacion) => {
  const varianteActualizada = await prisma.varianteProducto.update({
    where: { idVariante: id },
    data: datosActualizacion,
    include: {
      producto: true,
      color: true,
      talla: true,
      imagenesVariantes: true
    }
  });

  return enriquecerVariante(varianteActualizada);
};

/**
 * @function eliminarVariante
 * @brief Desactiva una variante (borrado lógico).
 * @param {number} id - El ID de la variante a desactivar.
 * @returns {Promise<object>} La variante con el estado actualizado a 'inactivo'.
 * @description Cambia el estado de una variante a 'inactivo' en lugar de borrarla
 * para mantener la consistencia de los registros históricos (ventas, compras, etc.).
 */
const eliminarVariante = async (id) => {
  return prisma.varianteProducto.update({
    where: { idVariante: id },
    data: { estado: 'inactivo' },
  });
};

// Exportar las funciones del servicio
module.exports = {
  obtenerVariantes,
  obtenerVariantePorId,
  crearVariante,
  actualizarVariante,
  eliminarVariante,
};
