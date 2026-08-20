
const { PrismaClient, Prisma } = require('@prisma/client');
const prisma = new PrismaClient();
// const { handleError } = require('../../utils/errorHelper');

/**
 * Crea un nuevo descuento en el sistema.
 * @param {object} data - Datos para crear el descuento.
 * @param {number} idUsuarioCreacion - ID del usuario que crea el descuento.
 * @returns {Promise<object>} El descuento creado.
 */
const crearDescuento = async (data, idUsuarioCreacion) => {
  try {
    const dataToCreate = { ...data };
    if (dataToCreate.fechaInicio) dataToCreate.fechaInicio = new Date(dataToCreate.fechaInicio);
    if (dataToCreate.fechaFin) dataToCreate.fechaFin = new Date(dataToCreate.fechaFin);

    // Sanitización de IDs y campos numéricos
    if (dataToCreate.idCategoria === "" || dataToCreate.idCategoria === null) dataToCreate.idCategoria = null;
    else if (dataToCreate.idCategoria) dataToCreate.idCategoria = Number(dataToCreate.idCategoria);

    if (dataToCreate.idProducto === "" || dataToCreate.idProducto === null) dataToCreate.idProducto = null;
    else if (dataToCreate.idProducto) dataToCreate.idProducto = Number(dataToCreate.idProducto);

    if (dataToCreate.montoMinimoCompra !== undefined) dataToCreate.montoMinimoCompra = Number(dataToCreate.montoMinimoCompra) || 0;
    if (dataToCreate.valorDescuento !== undefined) dataToCreate.valorDescuento = Number(dataToCreate.valorDescuento);

    return await prisma.descuento.create({
      data: {
        ...dataToCreate,
        usuarioCreacion: idUsuarioCreacion,
      },
      include: {
        categoria: true,
        producto: true,
        usuarioCreacionRef: {
          select: {
            idUsuario: true,
            nombres: true,
            apellidos: true,
          }
        }
      }
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new Error('Ya existe un descuento con ese código.');
    }
    throw error;
  }
};

/**
 * Obtiene una lista de descuentos con filtros y relaciones.
 * @param {object} filters - Opciones de filtrado.
 * @param {object} options - Opciones de paginación y ordenamiento.
 * @returns {Promise<object>} Lista de descuentos y total.
 */
const obtenerDescuentos = async (filters = {}, options = {}) => {
  try {
    const { page = 1, limit = 10, orderBy = 'creadoEn', orderDirection = 'desc' } = options;
    const skip = (page - 1) * limit;

    const [descuentos, total] = await Promise.all([
      prisma.descuento.findMany({
        where: filters,
        include: {
          categoria: {
            select: {
              idCategoria: true,
              nombreCategoria: true,
            }
          },
          producto: {
            select: {
              idProducto: true,
              nombreProducto: true,
              codigoReferencia: true,
            }
          },
          usuarioCreacionRef: {
            select: {
              idUsuario: true,
              nombres: true,
              apellidos: true,
            }
          },
          _count: {
            select: {
              descuentosClientes: true,
              historialDescuentos: true,
            }
          }
        },
        orderBy: { [orderBy]: orderDirection },
        skip,
        take: limit,
      }),
      prisma.descuento.count({ where: filters })
    ]);

    return {
      descuentos,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Obtiene un descuento por su ID.
 * @param {number} id - ID del descuento.
 * @returns {Promise<object>} El descuento encontrado.
 */
const obtenerDescuentoPorId = async (id) => {
  try {
    const descuento = await prisma.descuento.findUnique({
      where: { idDescuento: Number(id) },
      include: {
        categoria: true,
        producto: true,
        usuarioCreacionRef: {
          select: {
            idUsuario: true,
            nombres: true,
            apellidos: true,
          }
        },
        descuentosClientes: {
          include: {
            usuario: {
              select: {
                idUsuario: true,
                nombres: true,
                apellidos: true,
                correoElectronico: true,
              }
            }
          }
        }
      }
    });
    
    if (!descuento) {
      throw new Error('Descuento no encontrado.');
    }
    
    return descuento;
  } catch (error) {
    throw error;
  }
};

/**
 * Obtiene un descuento por su código.
 * @param {string} codigo - Código del descuento.
 * @returns {Promise<object>} El descuento encontrado.
 */
const obtenerDescuentoPorCodigo = async (codigo) => {
  try {
    const descuento = await prisma.descuento.findFirst({
        where: { 
            codigoDescuento: codigo
        }
    });
    if (!descuento) {
      throw new Error('El código de descuento no es válido o no existe.');
    }
    return descuento;
  } catch (error) {
    throw error;
  }
};

/**
 * Actualiza el estado de un descuento (activo, inactivo, vencido).
 * @param {number} idDescuento - ID del descuento a actualizar.
 * @param {string} estado - Nuevo estado del descuento.
 * @returns {Promise<object>} El descuento actualizado.
 */
const actualizarEstadoDescuento = async (idDescuento, estado) => {
  try {
    if (!['activo', 'inactivo', 'vencido'].includes(estado)) {
      throw new Error('Estado no válido.');
    }
    return await prisma.descuento.update({
      where: { idDescuento: Number(idDescuento) },
      data: { estado },
    });
  } catch (error) {
    throw error;
  }
};

/**
 * Valida si un descuento es aplicable sin modificar la base de datos.
 * Es una función de solo lectura para ser usada antes de finalizar una venta.
 * @param {string} codigoDescuento - El código a validar.
 * @param {number} idUsuario - El ID del usuario que intenta usar el código.
 * @param {number} montoCompra - El monto total de la compra para validar el mínimo.
 * @returns {Promise<object>} Objeto con el estado de validez y el descuento.
 */
const validarAplicabilidadDescuento = async (codigoDescuento, idUsuario, montoCompra) => {
  try {
    const descuento = await obtenerDescuentoPorCodigo(codigoDescuento);

    // 1. Validar estado
    if (descuento.estado !== 'activo') {
      throw new Error(`El descuento no está activo (estado actual: ${descuento.estado}).`);
    }

    // 2. Validar vigencia
    const ahora = new Date();
    if (descuento.fechaInicio && ahora < descuento.fechaInicio) {
      throw new Error('El descuento aún no es válido.');
    }
    if (descuento.fechaFin && ahora > descuento.fechaFin) {
      // Opcional: Se podría tener un job que mueva a 'vencido' automáticamente.
      await actualizarEstadoDescuento(descuento.idDescuento, 'vencido');
      throw new Error('El descuento ha vencido.');
    }

    // 3. Validar monto mínimo de compra
    if (descuento.montoMinimoCompra > 0 && montoCompra < descuento.montoMinimoCompra) {
      throw new Error(`Esta compra no cumple el monto mínimo de ${descuento.montoMinimoCompra}.`);
    }

    // 4. Validar usos globales
    if (descuento.cantidadMaximaUsos && descuento.usosActuales >= descuento.cantidadMaximaUsos) {
      throw new Error('Este código de descuento ha alcanzado su límite de usos.');
    }

    // 5. Validar usos por cliente
    if (descuento.usoPorCliente > 0) {
      const usoCliente = await prisma.descuentosCliente.findUnique({
        where: { descuento_cliente_unico: { idDescuento: descuento.idDescuento, idUsuario } },
      });
      if (usoCliente && usoCliente.usosRealizados >= descuento.usoPorCliente) {
        throw new Error('Has alcanzado el límite de usos para este código de descuento.');
      }
    }
    
    return { valido: true, mensaje: 'Descuento aplicable.', descuento };
  } catch (error) {
    // Retornamos un objeto de validez en lugar de lanzar una excepción para manejo en el controller
    return { valido: false, mensaje: error.message, descuento: null };
  }
};


/**
 * NOTA DE ARQUITECTURA: APLICACIÓN DE DESCUENTO
 * 
 * La siguiente función `_aplicarDescuentoEnTransaccion` es un ejemplo conceptual de cómo se
 * debería aplicar el descuento DENTRO de la transacción de la creación de una VENTA.
 * No se expone directamente al controlador de descuentos porque su ejecución depende 
 * intrínsecamente de que se esté creando una venta.
 * 
 * El `ventasService` sería responsable de llamar a esta función.
 */
const _aplicarDescuentoEnTransaccion = async (tx, codigoDescuento, idUsuario, idVenta, montoCompra, valorForzado = null) => {
    // La validación ya debería haberse hecho con `validarAplicabilidadDescuento`
    const { valido, mensaje, descuento } = await validarAplicabilidadDescuento(codigoDescuento, idUsuario, montoCompra);
    if (!valido) {
        throw new Error(`No se puede aplicar el descuento: ${mensaje}`);
    }

    // Calcular el valor del descuento
    let valorAplicado = valorForzado;
    
    if (valorAplicado === null) {
        if (descuento.tipoDescuento === 'valor_fijo') {
            valorAplicado = descuento.valorDescuento;
        } else if (descuento.tipoDescuento === 'porcentaje') {
            valorAplicado = (montoCompra * descuento.valorDescuento) / 100;
        }
    }
    // Aquí iría la lógica para descuentos por categoría o producto si se requiere recalcular

    // 1. Incrementar usos globales
    await tx.descuento.update({
        where: { idDescuento: descuento.idDescuento },
        data: { usosActuales: { increment: 1 } },
    });

    // 2. Incrementar usos por cliente
    if (descuento.usoPorCliente > 0) {
        await tx.descuentosCliente.upsert({
            where: { descuento_cliente_unico: { idDescuento: descuento.idDescuento, idUsuario } },
            update: { usosRealizados: { increment: 1 } },
            create: { idDescuento: descuento.idDescuento, idUsuario, usosRealizados: 1 },
        });
    }

    // 3. Registrar en el historial
    await tx.historialDescuento.create({
        data: {
            idDescuento: descuento.idDescuento,
            idVenta,
            idUsuario,
            valorAplicado: valorAplicado,
        },
    });

    return valorAplicado; // Retorna el monto a descontar en la venta.
}


/**
 * Actualiza un descuento existente.
 * @param {number} id - ID del descuento a actualizar.
 * @param {object} data - Datos a actualizar.
 * @returns {Promise<object>} El descuento actualizado.
 */
const actualizarDescuento = async (id, data) => {
  try {
    const dataToUpdate = { ...data };
    if (dataToUpdate.fechaInicio) dataToUpdate.fechaInicio = new Date(dataToUpdate.fechaInicio);
    if (dataToUpdate.fechaFin) dataToUpdate.fechaFin = new Date(dataToUpdate.fechaFin);

    // Sanitización de IDs y campos numéricos
    if (dataToUpdate.idCategoria === "" || dataToUpdate.idCategoria === null) dataToUpdate.idCategoria = null;
    else if (dataToUpdate.idCategoria) dataToUpdate.idCategoria = Number(dataToUpdate.idCategoria);

    if (dataToUpdate.idProducto === "" || dataToUpdate.idProducto === null) dataToUpdate.idProducto = null;
    else if (dataToUpdate.idProducto) dataToUpdate.idProducto = Number(dataToUpdate.idProducto);

    if (dataToUpdate.montoMinimoCompra !== undefined) dataToUpdate.montoMinimoCompra = Number(dataToUpdate.montoMinimoCompra) || 0;
    if (dataToUpdate.valorDescuento !== undefined) dataToUpdate.valorDescuento = Number(dataToUpdate.valorDescuento);

    return await prisma.descuento.update({
      where: { idDescuento: Number(id) },
      data: dataToUpdate,
      include: {
        categoria: {
          select: {
            idCategoria: true,
            nombreCategoria: true,
          }
        },
        producto: {
          select: {
            idProducto: true,
            nombreProducto: true,
            codigoReferencia: true,
          }
        },
        usuarioCreacionRef: {
          select: {
            idUsuario: true,
            nombres: true,
            apellidos: true,
          }
        }
      }
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new Error('Ya existe un descuento con ese código.');
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      throw new Error('Descuento no encontrado.');
    }
    throw error;
  }
};

/**
 * Elimina un descuento (cambia estado a inactivo en lugar de borrar).
 * @param {number} id - ID del descuento a eliminar.
 * @returns {Promise<object>} El descuento actualizado.
 */
const eliminarDescuento = async (id) => {
  try {
    return await prisma.descuento.update({
      where: { idDescuento: Number(id) },
      data: { estado: 'inactivo' },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      handleError(new Error('Descuento no encontrado.'), 'Error al eliminar descuento');
    }
    handleError(error, 'Error al eliminar el descuento');
  }
};

/**
 * Obtiene el historial de uso de un descuento específico.
 * @param {number} idDescuento - ID del descuento.
 * @param {object} options - Opciones de paginación.
 * @returns {Promise<object>} Historial de uso.
 */
const obtenerHistorialDescuento = async (idDescuento, options = {}) => {
  try {
    const { page = 1, limit = 10 } = options;
    const skip = (page - 1) * limit;

    const [historial, total] = await Promise.all([
      prisma.historialDescuento.findMany({
        where: { idDescuento: Number(idDescuento) },
        include: {
          usuario: {
            select: {
              idUsuario: true,
              nombres: true,
              apellidos: true,
              correoElectronico: true,
            }
          },
          venta: {
            select: {
              idVenta: true,
              numeroFactura: true,
              total: true,
              creadoEn: true,
            }
          }
        },
        orderBy: { fechaUso: 'desc' },
        skip,
        take: limit,
      }),
      prisma.historialDescuento.count({ 
        where: { idDescuento: Number(idDescuento) } 
      })
    ]);

    return {
      historial,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  } catch (error) {
    handleError(error, 'Error al obtener el historial del descuento');
  }
};

/**
 * Obtiene el historial completo de descuentos con filtros.
 * @param {object} filters - Filtros de búsqueda.
 * @param {object} options - Opciones de paginación.
 * @returns {Promise<object>} Historial completo.
 */
const obtenerHistorialGeneral = async (filters = {}, options = {}) => {
  try {
    const { page = 1, limit = 10 } = options;
    const skip = (page - 1) * limit;

    const [historial, total] = await Promise.all([
      prisma.historialDescuento.findMany({
        where: filters,
        include: {
          descuento: {
            select: {
              idDescuento: true,
              nombreDescuento: true,
              codigoDescuento: true,
              tipoDescuento: true,
              valorDescuento: true,
              aplicaA: true,
              idProducto: true,
              producto: {
                select: {
                  nombreProducto: true
                }
              },
              idCategoria: true,
              categoria: {
                select: {
                  nombreCategoria: true
                }
              }
            }
          },
          usuario: {
            select: {
              idUsuario: true,
              nombres: true,
              apellidos: true,
              correoElectronico: true,
            }
          },
          venta: {
            select: {
              idVenta: true,
              numeroFactura: true,
              total: true,
              creadoEn: true,
            }
          }
        },
        orderBy: { fechaUso: 'desc' },
        skip,
        take: limit,
      }),
      prisma.historialDescuento.count({ where: filters })
    ]);

    return {
      historial,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  } catch (error) {
    handleError(error, 'Error al obtener el historial general de descuentos');
  }
};

/**
 * Obtiene estadísticas de uso de descuentos.
 * @returns {Promise<object>} Estadísticas de uso.
 */
const obtenerEstadisticasDescuentos = async () => {
  try {
    const [
      totalDescuentos,
      descuentosActivos,
      descuentosInactivos,
      descuentosVencidos,
      totalUsos,
      ahorroTotal,
      usoUltimos30Dias
    ] = await Promise.all([
      prisma.descuento.count(),
      prisma.descuento.count({ where: { estado: 'activo' } }),
      prisma.descuento.count({ where: { estado: 'inactivo' } }),
      prisma.descuento.count({ where: { estado: 'vencido' } }),
      prisma.historialDescuento.count(),
      prisma.historialDescuento.aggregate({
        _sum: { valorAplicado: true }
      }),
      prisma.historialDescuento.count({
        where: {
          fechaUso: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        }
      })
    ]);

    return {
      totalDescuentos,
      descuentosActivos,
      descuentosInactivos,
      descuentosVencidos,
      totalUsos,
      ahorroTotal: ahorroTotal._sum.valorAplicado || 0,
      usoUltimos30Dias
    };
  } catch (error) {
    throw error;
  }
};

module.exports = {
  crearDescuento,
  obtenerDescuentos,
  obtenerDescuentoPorId,
  obtenerDescuentoPorCodigo,
  actualizarDescuento,
  eliminarDescuento,
  actualizarEstadoDescuento,
  validarAplicabilidadDescuento,
  obtenerHistorialDescuento,
  obtenerHistorialGeneral,
  obtenerEstadisticasDescuentos,
  _aplicarDescuentoEnTransaccion,
};
