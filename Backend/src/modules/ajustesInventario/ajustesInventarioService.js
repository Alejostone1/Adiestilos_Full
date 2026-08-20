/**
 * Servicio para la lógica de negocio de Ajustes de Inventario.
 */

const { prisma } = require('../../config/databaseConfig');
const { handleError, ErrorValidacion, ErrorNoEncontrado } = require('../../utils/errorHelper');
const { crearMovimiento } = require('../movimientos/movimientosService');

/**
 * Crea un ajuste de inventario en estado borrador.
 * @param {object} datos - Datos del ajuste.
 * @returns {Promise<object>} El ajuste de inventario creado.
 */
async function crearAjusteBorrador(datos) {
  const { idTipoMovimiento, motivo, detalleAjustes, usuarioRegistro } = datos;

  if (!idTipoMovimiento || !motivo || !detalleAjustes || detalleAjustes.length === 0) {
    throw new ErrorValidacion('Faltan datos requeridos para el ajuste.');
  }

  return prisma.$transaction(async (tx) => {
    // Validar tipo de movimiento
    const tipoMovimiento = await tx.tipoMovimiento.findUnique({
      where: { idTipoMovimiento }
    });
    if (!tipoMovimiento || !tipoMovimiento.activo) {
      throw new ErrorNoEncontrado('Tipo de movimiento no encontrado o inactivo.');
    }

    // Generar número único
    const numeroAjuste = `AJ-${Date.now()}`;

    // Crear ajuste en estado borrador
    const ajuste = await tx.ajusteInventario.create({
      data: {
        numeroAjuste,
        idTipoMovimiento,
        motivo,
        usuarioRegistro,
        fechaAjuste: new Date(),
        estado: 'borrador'
      }
    });

    // Crear detalles del ajuste
    for (const item of detalleAjustes) {
      const { idVariante, cantidadAjuste } = item;
      if (!idVariante || cantidadAjuste === undefined) {
        throw new ErrorValidacion('Cada detalle debe incluir idVariante y cantidadAjuste.');
      }

      const variante = await tx.varianteProducto.findUnique({
        where: { idVariante }
      });
      if (!variante) {
        throw new ErrorNoEncontrado(`Variante con ID ${idVariante} no encontrada.`);
      }

      await tx.detalleAjusteInventario.create({
        data: {
          idAjuste: ajuste.idAjuste,
          idVariante,
          cantidadAjuste,
          stockAnterior: variante.cantidadStock,
          stockNuevo: variante.cantidadStock // Se calculará al aplicar
        }
      });
    }

    return tx.ajusteInventario.findUnique({
      where: { idAjuste: ajuste.idAjuste },
      include: {
        detalleAjustes: {
          include: {
            variante: {
              include: {
                producto: { 
                    include: {
                        imagenes: true,
                        categoria: { select: { nombreCategoria: true } },
                        proveedor: { select: { nombreProveedor: true } }
                    }
                },
                color: { select: { nombreColor: true } },
                talla: { select: { nombreTalla: true } },
                imagenesVariantes: true
              }
            }
          }
        },
        tipoMovimiento: true,
        usuarioRegistroRef: { select: { usuario: true, nombres: true, apellidos: true } }
      }
    });
  });
}

/**
 * Aplica un ajuste de inventario (cambia de borrador a aplicado).
 * @param {number} idAjuste - ID del ajuste.
 * @param {number} usuarioRegistro - ID del usuario que aplica el ajuste.
 * @returns {Promise<object>} El ajuste aplicado.
 */
async function aplicarAjuste(idAjuste, usuarioRegistro) {
  return prisma.$transaction(async (tx) => {
    // Obtener ajuste con detalles
    const ajuste = await tx.ajusteInventario.findUnique({
      where: { idAjuste },
      include: {
        detalleAjustes: {
          include: { variante: true }
        },
        tipoMovimiento: true
      }
    });

    if (!ajuste) {
      throw new ErrorNoEncontrado(`Ajuste con ID ${idAjuste} no encontrado.`);
    }

    console.log(`[SERVICE] Aplicando ajuste ${ajuste.numeroAjuste}. Estado: ${ajuste.estado}, Tipo: ${ajuste.tipoMovimiento.tipo}`);

    if (ajuste.estado !== 'borrador') {
      throw new ErrorValidacion('Solo se pueden aplicar ajustes en estado borrador.');
    }

    // Aplicar cada detalle del ajuste
    for (const detalle of ajuste.detalleAjustes) {
      const variante = detalle.variante;
      const stockAnterior = Number(variante.cantidadStock);
      const cantidadAjuste = Number(detalle.cantidadAjuste);
      let stockNuevo;
      let cantidadMovimiento;

      console.log(`[SERVICE] Detalle ID: ${detalle.idDetalleAjuste}, Variante: ${variante.codigoSku}, Stock Ant: ${stockAnterior}, Cant Ajuste: ${cantidadAjuste}`);

      // Calcular nuevo stock según tipo de movimiento
      if (ajuste.tipoMovimiento.tipo === 'entrada') {
        cantidadMovimiento = cantidadAjuste;
        stockNuevo = stockAnterior + cantidadAjuste;
      } else if (ajuste.tipoMovimiento.tipo === 'salida') {
        cantidadMovimiento = -cantidadAjuste;
        stockNuevo = stockAnterior - cantidadAjuste;
        if (stockNuevo < 0) {
          throw new ErrorValidacion(`Ajuste de salida excede el stock disponible para ${variante.codigoSku}.`);
        }
      } else { // ajuste (conteo físico)
        cantidadMovimiento = cantidadAjuste - stockAnterior;
        stockNuevo = cantidadAjuste;
      }

      console.log(`[SERVICE] Calculado -> Cant Mov: ${cantidadMovimiento}, Stock Nuevo: ${stockNuevo}`);

      // Registrar el movimiento y actualizar el stock
      const movimiento = await crearMovimiento(tx, {
        idVariante: detalle.idVariante,
        cantidad: cantidadMovimiento,
        idTipoMovimiento: ajuste.idTipoMovimiento,
        idAjuste: ajuste.idAjuste,
        usuarioRegistro,
        motivo: `Ajuste aplicado: ${ajuste.motivo}`
      });

      // Actualizar detalle con stock final real registrado
      await tx.detalleAjusteInventario.update({
        where: { idDetalleAjuste: detalle.idDetalleAjuste },
        data: { stockNuevo: movimiento.stockNuevo }
      });
    }

    // Cambiar estado del ajuste a aplicado
    return tx.ajusteInventario.update({
      where: { idAjuste },
      data: { estado: 'aplicado' },
      include: {
        detalleAjustes: {
          include: {
            variante: {
              include: {
                producto: { 
                    include: {
                        imagenes: true,
                        categoria: { select: { nombreCategoria: true } },
                        proveedor: { select: { nombreProveedor: true } }
                    }
                },
                color: { select: { nombreColor: true } },
                talla: { select: { nombreTalla: true } },
                imagenesVariantes: true
              }
            }
          }
        },
        tipoMovimiento: true,
        usuarioRegistroRef: { select: { usuario: true, nombres: true, apellidos: true } }
      }
    });
  });
}

/**
 * Cancela un ajuste de inventario (solo si está en borrador).
 * @param {number} idAjuste - ID del ajuste.
 * @returns {Promise<object>} El ajuste cancelado.
 */
async function cancelarAjuste(idAjuste) {
  const ajuste = await prisma.ajusteInventario.findUnique({
    where: { idAjuste }
  });

  if (!ajuste) {
    throw new ErrorNoEncontrado(`Ajuste con ID ${idAjuste} no encontrado.`);
  }

  if (ajuste.estado !== 'borrador') {
    throw new ErrorValidacion('Solo se pueden cancelar ajustes en estado borrador.');
  }

  return prisma.ajusteInventario.update({
    where: { idAjuste },
    data: { estado: 'cancelado' }
  });
}

/**
 * Obtiene ajustes de inventario con filtros y paginación.
 * @param {object} [filtros] - Filtros opcionales.
 * @param {object} [paginacion] - Opciones de paginación.
 * @returns {Promise<object>} Lista de ajustes y datos de paginación.
 */
async function obtenerAjustes(filtros = {}, paginacion = { pagina: 1, limite: 10 }) {
  const { pagina, limite } = paginacion;
  const skip = (Number(pagina) - 1) * Number(limite);

  const where = {};

  if (filtros.estado) {
    where.estado = filtros.estado;
  }

  if (filtros.idTipoMovimiento) {
    where.idTipoMovimiento = filtros.idTipoMovimiento;
  }

  if (filtros.fechaInicio) {
    where.fechaAjuste = {
      ...where.fechaAjuste,
      gte: new Date(filtros.fechaInicio)
    };
  }

  if (filtros.fechaFin) {
    where.fechaAjuste = {
      ...where.fechaAjuste,
      lte: new Date(filtros.fechaFin)
    };
  }

  const [ajustes, total] = await prisma.$transaction([
    prisma.ajusteInventario.findMany({
      where,
      include: {
        detalleAjustes: {
          include: {
            variante: {
              include: {
                producto: {
                  include: {
                    imagenes: true,
                    categoria: { select: { nombreCategoria: true } },
                    proveedor: { select: { nombreProveedor: true } }
                  }
                },
                color: { select: { nombreColor: true } },
                talla: { select: { nombreTalla: true } },
                imagenesVariantes: true
              }
            }
          }
        },
        tipoMovimiento: true,
        usuarioRegistroRef: { select: { usuario: true, nombres: true, apellidos: true } }
      },
      skip,
      take: Number(limite),
      orderBy: { fechaAjuste: 'desc' }
    }),
    prisma.ajusteInventario.count({ where })
  ]);

  return {
    datos: ajustes || [],
    paginacion: {
      totalRegistros: total,
      paginaActual: Number(pagina),
      totalPaginas: Math.ceil(total / limite),
    }
  };
}

/**
 * Obtiene un ajuste específico por ID.
 * @param {number} idAjuste - ID del ajuste.
 * @returns {Promise<object>} El ajuste encontrado.
 */
async function obtenerAjustePorId(idAjuste) {
  const ajuste = await prisma.ajusteInventario.findUnique({
    where: { idAjuste },
    include: {
      detalleAjustes: {
        include: {
          variante: {
            include: {
              producto: {
                include: {
                  categoria: { select: { nombreCategoria: true } },
                  proveedor: { select: { nombreProveedor: true } }
                }
              },
              color: { select: { nombreColor: true } },
              talla: { select: { nombreTalla: true } }
            }
          }
        }
      },
      tipoMovimiento: true,
      usuarioRegistroRef: { select: { usuario: true, nombres: true, apellidos: true } }
    }
  });

  if (!ajuste) {
    throw new ErrorNoEncontrado(`Ajuste con ID ${idAjuste} no encontrado.`);
  }

  return ajuste;
}

module.exports = {
  crearAjusteBorrador,
  aplicarAjuste,
  cancelarAjuste,
  obtenerAjustes,
  obtenerAjustePorId,
};
