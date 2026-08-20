/**
 * Controlador de autenticación.
 * Maneja las solicitudes HTTP para el registro, inicio de sesión,
 * y otras operaciones relacionadas con la autenticación.
 */

// --- IMPORTACIONES ---
const authService = require('./authService');
const {
  respuestaExitosa,
  respuestaCreada,
  respuestaErrorCliente
} = require('../../utils/responseHelper');
const { capturarErroresAsync } = require('../../utils/errorHelper');

// --- CONTROLADORES ---

/**
 * Controlador para registrar un nuevo usuario.
 * @route POST /api/auth/registro
 */
const registrarUsuario = capturarErroresAsync(async (req, res) => {
  // La validación de datos de entrada se delega al servicio.
  // El servicio se encargará de verificar campos requeridos y formatos.
  const nuevoUsuario = await authService.registrarUsuario(req.body);

  // Enviar respuesta de éxito con el código 201 (Creado)
  res.status(201).json(respuestaCreada(nuevoUsuario, 'Usuario registrado exitosamente.'));
});

/**
 * Controlador para iniciar sesión.
 * @route POST /api/auth/login
 */
const iniciarSesion = capturarErroresAsync(async (req, res) => {
  const { identificador, contrasena } = req.body;

  // Validar que los datos necesarios fueron enviados
  if (!identificador || !contrasena) {
    // Usar el helper de respuesta para un error de cliente (400)
    return res.status(400).json(respuestaErrorCliente('Se requieren el identificador (usuario o email) y la contraseña.'));
  }

  const datosSesion = await authService.iniciarSesion(identificador, contrasena);

  // Opcional: Para mayor seguridad en un entorno web, se podría enviar el token
  // de refresco en una cookie HttpOnly.
  // res.cookie('refreshToken', datosSesion.tokenRefresco, {
  //   httpOnly: true,
  //   secure: process.env.NODE_ENV === 'production',
  //   sameSite: 'strict',
  //   maxAge: 30 * 24 * 60 * 60 * 1000 // 30 días
  // });

  // Enviar respuesta de éxito
  res.status(200).json(respuestaExitosa(datosSesion, 'Inicio de sesión exitoso.'));
});

/**
 * Controlador para cerrar sesión (logout).
 * En un enfoque JWT stateless, esto es principalmente una operación del lado del cliente.
 * @route POST /api/auth/logout
 */
const cerrarSesion = (req, res) => {
  // Para JWT stateless, el backend no necesita hacer nada.
  // El cliente es responsable de eliminar el token.
  // Si usáramos una lista negra (blacklist) de tokens, la lógica iría aquí.

  res.status(200).json(respuestaExitosa(null, 'Cierre de sesión exitoso. El cliente debe eliminar el token.'));
};

/**
 * Controlador para obtener el perfil del usuario autenticado.
 * Requiere que el middleware de autenticación se haya ejecutado primero.
 * @route GET /api/auth/perfil
 */
const obtenerPerfil = capturarErroresAsync(async (req, res) => {
  // El middleware de autenticación (`verificarTokenMiddleware`) ya ha verificado
  // el token y ha adjuntado la información del usuario a `req.usuario`.
  const usuarioAutenticado = req.usuario;

  // No es necesario consultar la base de datos de nuevo,
  // ya que el middleware ya lo hizo.
  res.status(200).json(respuestaExitosa(usuarioAutenticado));
});

/**
 * Controlador para cambiar la contraseña del usuario autenticado.
 * @route PUT /api/auth/cambiar-contrasena
 */
const cambiarContrasena = capturarErroresAsync(async (req, res) => {
  // El ID del usuario se obtiene del token, no de los parámetros de la URL, por seguridad.
  const idUsuario = req.usuario.idUsuario;
  const { contrasenaActual, contrasenaNueva } = req.body;

  if (!contrasenaActual || !contrasenaNueva) {
    return res.status(400).json(respuestaErrorCliente('Se requieren la contraseña actual y la nueva.'));
  }

  const resultado = await authService.cambiarContrasena(idUsuario, contrasenaActual, contrasenaNueva);

  res.status(200).json(respuestaExitosa(resultado, 'Contraseña actualizada correctamente.'));
});


// --- EXPORTACIÓN ---
module.exports = {
  registrarUsuario,
  iniciarSesion,
  cerrarSesion,
  obtenerPerfil,
  cambiarContrasena
};
