/**
 * Servicio de gestión de usuarios.
 * Contiene toda la lógica de negocio para las operaciones CRUD de usuarios.
 */

// --- IMPORTACIONES ---
const bcrypt = require('bcryptjs');
const { prisma } = require('../../config/databaseConfig');
const { configuracionServidor } = require('../../config/serverConfig');
const {
  ErrorNoEncontrado,
  ErrorConflicto,
  ErrorValidacion,
  ErrorInternoServidor
} = require('../../utils/errorHelper');

// --- CONSTANTES Y HELPERS ---

/**
 * Objeto de selección para Prisma.
 * Asegura que el campo 'contrasena' nunca se devuelva en las consultas.
 * Incluye campos básicos y la relación con el rol.
 */
const seleccionCamposUsuario = {
  idUsuario: true,
  nombres: true,
  apellidos: true,
  usuario: true,
  correoElectronico: true,
  telefono: true,
  direccion: true,
  estado: true,
  ultimaConexion: true,
  creadoEn: true,
  actualizadoEn: true,
  rol: {
    select: {
      idRol: true,
      nombreRol: true,
      permisos: true
    }
  },
  resumenCredito: true,
  _count: {
    select: {
      ventasComoCliente: true,
      ventasComoVendedor: true,
      creditosComoCliente: true
    }
  }
};

// --- FUNCIONES DEL SERVICIO ---

/**
 * Obtiene una lista paginada de usuarios con filtros opcionales.
 * @param {object} [filtros={}] - Filtros para la consulta (nombre, correo, rol, estado).
 * @param {object} [paginacion={ pagina: 1, limite: 10 }] - Opciones de paginación.
 * @returns {Promise<object>} Un objeto con la lista de usuarios y metadatos de paginación.
 */
async function obtenerTodos(filtros = {}, paginacion = { pagina: 1, limite: 10 }) {
  const { nombre, correo, rol, estado } = filtros;
  const { pagina, limite } = paginacion;

  const skip = (pagina - 1) * limite;

  const where = {
    AND: [
      nombre && {
        OR: [
          { nombres: { contains: nombre, mode: 'insensitive' } },
          { apellidos: { contains: nombre, mode: 'insensitive' } }
        ]
      },
      correo && { correoElectronico: { contains: correo, mode: 'insensitive' } },
      rol && { rol: { nombreRol: { equals: rol, mode: 'insensitive' } } },
      estado && { estado: { equals: estado, mode: 'insensitive' } }
    ].filter(Boolean) // Eliminar filtros nulos o vacíos
  };

  const [usuarios, total] = await prisma.$transaction([
    prisma.usuario.findMany({
      where,
      select: seleccionCamposUsuario,
      skip,
      take: Number(limite),
      orderBy: { creadoEn: 'desc' }
    }),
    prisma.usuario.count({ where })
  ]);

  return {
    datos: usuarios,
    paginacion: {
      totalRegistros: total,
      paginaActual: Number(pagina),
      totalPaginas: Math.ceil(total / limite),
      registrosPorPagina: Number(limite)
    }
  };
}

/**
 * Obtiene métricas de un usuario
 * @param {number} idUsuario - ID del usuario
 * @returns {Promise<object>} Métricas del usuario
 */
async function obtenerMetricasUsuario(idUsuario) {
  const [
    ventasComoCliente,
    ventasComoVendedor,
    creditosActivos,
    creditosPagados,
    resumenCredito,
    totalPagosRealizados
  ] = await prisma.$transaction([
    // Ventas como cliente (compras del usuario)
    prisma.venta.aggregate({
      where: { idUsuario: idUsuario },
      _count: { idVenta: true },
      _sum: { total: true }
    }),
    // Ventas como vendedor (ventas realizadas por el usuario)
    prisma.venta.aggregate({
      where: { idUsuarioVendedor: idUsuario },
      _count: { idVenta: true },
      _sum: { total: true }
    }),
    // Créditos activos
    prisma.credito.count({
      where: {
        idUsuario: idUsuario,
        estado: 'activo'
      }
    }),
    // Créditos pagados
    prisma.credito.count({
      where: {
        idUsuario: idUsuario,
        estado: 'pagado'
      }
    }),
    // Resumen de crédito (saldo total, etc)
    prisma.clientesCreditoResumen.findUnique({
      where: { idUsuario: idUsuario }
    }),
    // Total pagos realizados (sumatoria de pagos vinculados a sus ventas)
    prisma.pago.aggregate({
      where: {
        venta: { idUsuario: idUsuario }
      },
      _sum: { monto: true }
    })
  ]);

  return {
    ventas: {
      comoClienteCount: ventasComoCliente._count.idVenta || 0,
      comoClienteTotal: ventasComoCliente._sum.total || 0,
      comoVendedorCount: ventasComoVendedor._count.idVenta || 0,
      comoVendedorTotal: ventasComoVendedor._sum.total || 0,
    },
    creditos: {
      activos: creditosActivos,
      pagados: creditosPagados,
      saldoPendiente: resumenCredito?.saldoTotal || 0,
      limiteCredito: resumenCredito?.limiteCredito || 0,
      totalAbonado: resumenCredito?.totalAbonado || 0,
      creditoTotal: resumenCredito?.creditoTotal || 0
    },
    pagos: {
      totalRealizado: totalPagosRealizados._sum.monto || 0
    }
  };
}

/**
 * Obtiene historial de ventas de un usuario
 * @param {number} idUsuario - ID del usuario
 * @param {object} [paginacion] - Opciones de paginación
 * @returns {Promise<object>} Historial de ventas paginado
 */
async function obtenerHistorialVentasUsuario(idUsuario, paginacion = { pagina: 1, limite: 10 }) {
  const { pagina, limite } = paginacion;
  const skip = (pagina - 1) * limite;

  const where = {
    OR: [
      { idUsuario: idUsuario },
      { idUsuarioVendedor: idUsuario }
    ]
  };

  const [ventas, total] = await prisma.$transaction([
    prisma.venta.findMany({
      where,
      include: {
        usuarioCliente: {
          select: { idUsuario: true, nombres: true, apellidos: true }
        },
        usuarioVendedor: {
          select: { idUsuario: true, nombres: true, apellidos: true }
        },
        estadoPedido: {
          select: { nombreEstado: true }
        }
      },
      skip,
      take: Number(limite),
      orderBy: { creadoEn: 'desc' }
    }),
    prisma.venta.count({ where })
  ]);

  return {
    datos: ventas,
    paginacion: {
      totalRegistros: total,
      paginaActual: Number(pagina),
      totalPaginas: Math.ceil(total / limite),
      registrosPorPagina: Number(limite)
    }
  };
}

/**
 * Obtiene historial de créditos de un usuario
 * @param {number} idUsuario - ID del usuario
 * @param {object} [paginacion] - Opciones de paginación
 * @returns {Promise<object>} Historial de créditos paginado
 */
async function obtenerHistorialCreditosUsuario(idUsuario, paginacion = { pagina: 1, limite: 10 }) {
  const { pagina, limite } = paginacion;
  const skip = (pagina - 1) * limite;

  const where = {
    OR: [
      { idUsuario: idUsuario },
      { usuarioRegistro: idUsuario }
    ]
  };

  const [creditos, total] = await prisma.$transaction([
    prisma.credito.findMany({
      where,
      include: {
        venta: {
          select: { idVenta: true, numeroFactura: true, total: true }
        },
        usuarioCliente: {
          select: { idUsuario: true, nombres: true, apellidos: true }
        }
      },
      skip,
      take: Number(limite),
      orderBy: { creadoEn: 'desc' }
    }),
    prisma.credito.count({ where })
  ]);

  return {
    datos: creditos,
    paginacion: {
      totalRegistros: total,
      paginaActual: Number(pagina),
      totalPaginas: Math.ceil(total / limite),
      registrosPorPagina: Number(limite)
    }
  };
}

/**
 * Obtiene un usuario específico por su ID.
 * @param {number} id - El ID del usuario.
 * @returns {Promise<object>} El objeto del usuario.
 */
async function obtenerPorId(id) {
  const idUsuario = parseInt(id, 10);
  if (isNaN(idUsuario)) {
    throw new ErrorValidacion('El ID del usuario debe ser un número.');
  }

  const usuario = await prisma.usuario.findUnique({
    where: { idUsuario },
    select: seleccionCamposUsuario
  });

  if (!usuario) {
    throw new ErrorNoEncontrado(`Usuario con ID ${idUsuario} no encontrado.`);
  }
  return usuario;
}

/**
 * Crea un nuevo usuario.
 * @param {object} datos - Los datos del nuevo usuario.
 * @returns {Promise<object>} El usuario creado.
 */
async function crear(datos) {
  const { nombres, usuario, correoElectronico, contrasena, idRol, estado = 'activo' } = datos;

  if (!nombres || !usuario || !correoElectronico || !contrasena || !idRol) {
    throw new ErrorValidacion('Faltan campos requeridos: nombres, usuario, correo, contraseña y rol son obligatorios.');
  }

  // Verificar si el rol existe
  const rolExiste = await prisma.rol.findUnique({ where: { idRol: parseInt(idRol, 10) } });
  if (!rolExiste) {
    throw new ErrorValidacion(`El rol con ID ${idRol} no existe.`);
  }

  // Verificar unicidad de usuario y correo
  const existente = await prisma.usuario.findFirst({
    where: { OR: [{ usuario }, { correoElectronico }] }
  });
  if (existente) {
    throw new ErrorConflicto('El nombre de usuario o el correo electrónico ya están en uso.');
  }

  const contrasenaHasheada = await bcrypt.hash(contrasena, configuracionServidor.bcrypt.rondas);

  const nuevoUsuario = await prisma.usuario.create({
    data: { ...datos, contrasena: contrasenaHasheada, idRol: parseInt(idRol, 10), estado },
    select: seleccionCamposUsuario
  });

  return nuevoUsuario;
}

/**
 * Actualiza los datos de un usuario.
 * @param {number} id - El ID del usuario a actualizar.
 * @param {object} datos - Los datos a actualizar.
 * @returns {Promise<object>} El usuario actualizado.
 */
async function actualizar(id, datos) {
  const idUsuario = parseInt(id, 10);
   if (isNaN(idUsuario)) {
    throw new ErrorValidacion('El ID del usuario debe ser un número.');
  }

  // Verificar que el usuario exista
  await obtenerPorId(idUsuario);

  const { correoElectronico, usuario, contrasena, ...restoDatos } = datos;

  // Si se intenta actualizar email o usuario, verificar que no entren en conflicto
  if (correoElectronico || usuario) {
    const conflicto = await prisma.usuario.findFirst({
      where: {
        AND: [
          { idUsuario: { not: idUsuario } },
          { OR: [{ correoElectronico }, { usuario }] }
        ]
      }
    });
    if (conflicto) {
      throw new ErrorConflicto('El nuevo email o nombre de usuario ya está en uso por otra cuenta.');
    }
  }

  // Si se envía una nueva contraseña, hashearla
  if (contrasena) {
    restoDatos.contrasena = await bcrypt.hash(contrasena, configuracionServidor.bcrypt.rondas);
  }

  const datosParaActualizar = { ...restoDatos, correoElectronico, usuario };

  const usuarioActualizado = await prisma.usuario.update({
    where: { idUsuario },
    data: datosParaActualizar,
    select: seleccionCamposUsuario
  });

  return usuarioActualizado;
}

/**
 * Realiza un borrado lógico (soft delete) de un usuario, cambiando su estado a 'eliminado'.
 * @param {number} id - El ID del usuario a eliminar.
 * @returns {Promise<object>} Un mensaje de éxito.
 */
async function eliminar(id) {
  const idUsuario = parseInt(id, 10);
  if (isNaN(idUsuario)) {
    throw new ErrorValidacion('El ID del usuario debe ser un número.');
  }

  await obtenerPorId(idUsuario);

  await prisma.usuario.update({
    where: { idUsuario },
    data: { estado: 'eliminado' }
  });

  return { mensaje: `Usuario con ID ${idUsuario} ha sido marcado como eliminado.` };
}

/**
 * Cambia el estado de un usuario (ej: 'activo', 'inactivo', 'bloqueado').
 * @param {number} id - El ID del usuario.
 * @param {string} nuevoEstado - El nuevo estado para el usuario.
 * @returns {Promise<object>} El usuario con su estado actualizado.
 */
async function cambiarEstado(id, nuevoEstado) {
  const idUsuario = parseInt(id, 10);
  const estadosValidos = ['activo', 'inactivo', 'bloqueado'];

  if (isNaN(idUsuario)) {
    throw new ErrorValidacion('El ID del usuario debe ser un número.');
  }
  if (!nuevoEstado || !estadosValidos.includes(nuevoEstado)) {
    throw new ErrorValidacion(`El estado debe ser uno de los siguientes: ${estadosValidos.join(', ')}.`);
  }

  await obtenerPorId(idUsuario);

  const usuarioActualizado = await prisma.usuario.update({
    where: { idUsuario },
    data: { estado: nuevoEstado },
    select: seleccionCamposUsuario
  });

  return usuarioActualizado;
}

/**
 * Busca un usuario por su dirección de correo electrónico.
 * @param {string} email - El correo electrónico a buscar.
 * @returns {Promise<object>} El usuario encontrado.
 */
async function buscarPorEmail(email) {
  if (!email) throw new ErrorValidacion('Se requiere un email para la búsqueda.');

  const usuario = await prisma.usuario.findUnique({
    where: { correoElectronico: email },
    select: seleccionCamposUsuario
  });

  if (!usuario) {
    throw new ErrorNoEncontrado(`Usuario con email ${email} no encontrado.`);
  }
  return usuario;
}

/**
 * Busca un usuario por su nombre de usuario.
 * @param {string} nombreUsuario - El nombre de usuario a buscar.
 * @returns {Promise<object>} El usuario encontrado.
 */
async function buscarPorUsuario(nombreUsuario) {
  if (!nombreUsuario) throw new ErrorValidacion('Se requiere un nombre de usuario para la búsqueda.');

  const usuario = await prisma.usuario.findUnique({
    where: { usuario: nombreUsuario },
    select: seleccionCamposUsuario
  });

  if (!usuario) {
    throw new ErrorNoEncontrado(`Usuario con nombre de usuario '${nombreUsuario}' no encontrado.`);
  }
  return usuario;
}

/**
 * Obtiene una lista de todos los clientes que tienen un crédito activo.
 * @returns {Promise<Array<object>>} Una lista de clientes con sus créditos.
 */
async function obtenerClientesConCredito() {
    const clientes = await prisma.usuario.findMany({
        where: {
            rol: { nombreRol: 'Cliente' },
            creditosComoCliente: {
                some: {
                    estado: 'activo' // Normalizado a minúsculas según EstadoCredito
                }
            }
        },
        select: {
            idUsuario: true,
            nombres: true,
            apellidos: true,
            correoElectronico: true,
            creditosComoCliente: {
                where: {
                    estado: 'activo'
                },
                select: {
                    idCredito: true,
                    montoTotal: true,
                    saldoPendiente: true,
                    fechaVencimiento: true,
                    estado: true,
                }
            }
        }
    });

    if (clientes.length === 0) {
      return { mensaje: "No se encontraron clientes con créditos activos.", datos: [] };
    }

    return { mensaje: "Clientes con créditos activos obtenidos exitosamente.", datos: clientes };
}


// --- EXPORTACIÓN ---
module.exports = {
  obtenerTodos,
  obtenerPorId,
  crear,
  actualizar,
  eliminar,
  cambiarEstado,
  buscarPorEmail,
  buscarPorUsuario,
  obtenerClientesConCredito,
  obtenerMetricasUsuario,
  obtenerHistorialVentasUsuario,
  obtenerHistorialCreditosUsuario
};
