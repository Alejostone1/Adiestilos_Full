/**
 * Seed - Usuarios Demo
 * Crea/usuario ADMINISTRADOR, VENDEDOR y CLIENTE con contraseñas hasheadas (bcryptjs).
 * Idempotente: usa upsert() por el campo único `usuario`.
 * Los roles se localizan por NOMBRE (no se inventan IDs).
 */

const bcrypt = require('bcryptjs');

const RONDAS_BCRYPT = 10;

module.exports = async function seedUsuarios(prisma) {
  // 1. Localizar roles por nombre
  const roles = await prisma.rol.findMany();
  if (roles.length === 0) {
    throw new Error('No existen roles. Ejecute primero 01_roles.seed.js');
  }
  const rolPorNombre = Object.fromEntries(roles.map(r => [r.nombreRol, r.idRol]));
  const rolesRequeridos = ['Administrador', 'Vendedor', 'Cliente'];

  for (const nombreRol of rolesRequeridos) {
    if (!rolPorNombre[nombreRol]) {
      throw new Error(`Rol '${nombreRol}' no encontrado en la base de datos.`);
    }
  }

  // 2. Definición de usuarios demo
  const usuarios = [
    {
      usuario: 'admin',
      contrasenaPlana: 'Admin123*',
      nombreRol: 'Administrador',
      nombres: 'Administrador',
      apellidos: 'Sistema',
      correoElectronico: 'admin@adiestilos.com',
      telefono: '3000000001',
      direccion: 'Oficina principal',
      estado: 'activo'
    },
    {
      usuario: 'vendedor',
      contrasenaPlana: 'Vendedor123*',
      nombreRol: 'Vendedor',
      nombres: 'Vendedor',
      apellidos: 'Demostración',
      correoElectronico: 'vendedor@adiestilos.com',
      telefono: '3000000002',
      direccion: 'Oficina principal',
      estado: 'activo'
    },
    {
      usuario: 'cliente',
      contrasenaPlana: 'Cliente123*',
      nombreRol: 'Cliente',
      nombres: 'Cliente',
      apellidos: 'Demostración',
      correoElectronico: 'cliente@adiestilos.com',
      telefono: '3000000003',
      direccion: 'Calle de la tienda 123',
      estado: 'activo'
    }
  ];

  // 3. Upsert por `usuario` (único) con contraseña hasheada
  let creadosActualizados = 0;

  for (const u of usuarios) {
    const idRol = rolPorNombre[u.nombreRol];
    const contrasenaHasheada = await bcrypt.hash(u.contrasenaPlana, RONDAS_BCRYPT);

    const datos = {
      usuario: u.usuario,
      nombres: u.nombres,
      apellidos: u.apellidos,
      correoElectronico: u.correoElectronico,
      contrasena: contrasenaHasheada,
      telefono: u.telefono,
      direccion: u.direccion,
      idRol,
      estado: u.estado
    };

    await prisma.usuario.upsert({
      where: { usuario: u.usuario },
      update: datos,
      create: datos
    });

    creadosActualizados++;
  }

  return creadosActualizados;
};