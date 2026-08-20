/**
 * Servicio de autenticación.
 * Contiene la lógica de negocio para registro, inicio de sesión,
 * manejo de contraseñas y validación de tokens.
 */

// --- IMPORTACIONES ---
const bcrypt = require('bcryptjs');
const { prisma } = require('../../config/databaseConfig');
const { configuracionServidor } = require('../../config/serverConfig');
const { generarParTokens, verificarToken } = require('../../utils/jwtHelper');
const {
  ErrorValidacion,
  ErrorConflicto,
  ErrorNoAutorizado,
  ErrorNoEncontrado,
  ErrorInternoServidor
} = require('../../utils/errorHelper');

// --- FUNCIONES DEL SERVICIO ---

/**
 * Registra un nuevo usuario en el sistema.
 * El primer usuario registrado será 'Administrador', los siguientes serán 'Cliente'.
 * @param {object} datosUsuario - Datos del usuario a registrar.
 * @returns {Promise<object>} El usuario creado (sin contraseña).
 */
async function registrarUsuario(datosUsuario) {
  const { usuario, correoElectronico, contrasena } = datosUsuario;

  // 1. Verificar si el usuario o correo ya existen
  const usuarioExistente = await prisma.usuario.findFirst({
    where: {
      OR: [
        { usuario: { equals: usuario } },
        { correoElectronico: { equals: correoElectronico } }
      ]
    }
  });

  if (usuarioExistente) {
    if (usuarioExistente.usuario.toLowerCase() === usuario.toLowerCase()) {
      throw new ErrorConflicto('El nombre de usuario ya está en uso.');
    }
    throw new ErrorConflicto('El correo electrónico ya está registrado.');
  }

  // 3. Determinar el rol del usuario (primer usuario es admin)
  const totalUsuarios = await prisma.usuario.count();
  const nombreRol = totalUsuarios === 0 ? 'Administrador' : 'Cliente';

  const rol = await prisma.rol.findUnique({ where: { nombreRol } });

  if (!rol) {
    // Esto es un error crítico de configuración si los roles no existen.
    throw new ErrorInternoServidor(`El rol '${nombreRol}' no está definido en la base de datos.`);
  }

  // 4. Hashear la contraseña
  const rondasDeHash = configuracionServidor.bcrypt.rondas;
  const contrasenaHasheada = await bcrypt.hash(contrasena, rondasDeHash);

  // 5. Crear el nuevo usuario en la base de datos
  const nuevoUsuario = await prisma.usuario.create({
    data: {
      ...datosUsuario,
      contrasena: contrasenaHasheada,
      idRol: rol.idRol,
      estado: 'activo' // Por defecto, los usuarios se crean activos
    },
    select: { // Seleccionar qué campos devolver para no exponer la contraseña
      idUsuario: true,
      nombres: true,
      apellidos: true,
      usuario: true,
      correoElectronico: true,
      telefono: true,
      estado: true,
      idRol: true,
      creadoEn: true
    }
  });

  return nuevoUsuario;
}

/**
 * Inicia sesión para un usuario existente.
 * @param {string} identificador - El nombre de usuario o correo electrónico.
 * @param {string} contrasena - La contraseña en texto plano.
 * @returns {Promise<object>} Un objeto con los tokens y los datos del usuario.
 */
async function iniciarSesion(identificador, contrasena) {
  // 1. Buscar al usuario por nombre de usuario o correo electrónico
  const usuario = await prisma.usuario.findFirst({
    where: {
      OR: [
        { usuario: identificador },
        { correoElectronico: identificador }
      ]
    },
    include: {
      rol: true // Incluir la información del rol
    }
  });

  if (!usuario) {
    throw new ErrorNoAutorizado('Credenciales inválidas.'); // Mensaje genérico por seguridad
  }

  // 3. Verificar el estado de la cuenta
  if (usuario.estado !== 'activo') {
    throw new ErrorNoAutorizado(`La cuenta está ${usuario.estado}. Contacte al administrador.`);
  }

  // 4. Comparar la contraseña proporcionada con la hasheada
  const contrasenaValida = await bcrypt.compare(contrasena, usuario.contrasena);
  if (!contrasenaValida) {
    throw new ErrorNoAutorizado('Credenciales inválidas.'); // Mensaje genérico por seguridad
  }

  // 5. Actualizar la fecha de última conexión
  await prisma.usuario.update({
    where: { idUsuario: usuario.idUsuario },
    data: { ultimaConexion: new Date() }
  });

  // 6. Preparar el payload para el token
  const payload = {
    idUsuario: usuario.idUsuario,
    usuario: usuario.usuario,
    rol: usuario.rol.nombreRol
  };

  // 7. Generar y devolver los tokens junto con los datos del usuario
  const tokens = generarParTokens(payload);

  // Omitir la contraseña del objeto de usuario que se devuelve
  const { contrasena: _, ...datosUsuario } = usuario;

  return {
    ...tokens,
    usuario: datosUsuario
  };
}

/**
 * Valida un token de acceso.
 * @param {string} token - El token JWT a validar.
 * @returns {Promise<object>} El payload del token si es válido.
 */
async function validarToken(token) {
  if (!token) {
    throw new ErrorNoAutorizado('No se proporcionó un token.');
  }

  try {
    const payload = verificarToken(token);
    // Opcional: Podríamos verificar aquí si el usuario del token aún existe y está activo
    return payload;
  } catch (error) {
    // El helper `verificarToken` ya lanza un `ErrorNoAutorizado` con el mensaje correcto
    throw error;
  }
}

/**
 * Permite a un usuario cambiar su propia contraseña.
 * @param {number} idUsuario - El ID del usuario.
 * @param {string} contrasenaActual - La contraseña actual para verificación.
 * @param {string} contrasenaNueva - La nueva contraseña.
 * @returns {Promise<object>} Un mensaje de éxito.
 */
async function cambiarContrasena(idUsuario, contrasenaActual, contrasenaNueva) {
  // 1. Validar entrada
  if (!contrasenaActual || !contrasenaNueva) {
    throw new ErrorValidacion('Se requieren la contraseña actual y la nueva.');
  }

  if (contrasenaNueva.length < 6) { // Ejemplo de regla de negocio
    throw new ErrorValidacion('La nueva contraseña debe tener al menos 6 caracteres.');
  }

  // 2. Buscar al usuario
  const usuario = await prisma.usuario.findUnique({
    where: { idUsuario }
  });

  if (!usuario) {
    throw new ErrorNoEncontrado('Usuario no encontrado.');
  }

  // 3. Verificar la contraseña actual
  const contrasenaValida = await bcrypt.compare(contrasenaActual, usuario.contrasena);
  if (!contrasenaValida) {
    throw new ErrorNoAutorizado('La contraseña actual es incorrecta.');
  }

  // 4. Hashear la nueva contraseña
  const rondasDeHash = configuracionServidor.bcrypt.rondas;
  const nuevaContrasenaHasheada = await bcrypt.hash(contrasenaNueva, rondasDeHash);

  // 5. Actualizar la contraseña en la base de datos
  await prisma.usuario.update({
    where: { idUsuario },
    data: { contrasena: nuevaContrasenaHasheada }
  });

  return { mensaje: 'Contraseña actualizada exitosamente.' };
}

// --- EXPORTACIÓN ---
module.exports = {
  registrarUsuario,
  iniciarSesion,
  validarToken,
  cambiarContrasena
};
