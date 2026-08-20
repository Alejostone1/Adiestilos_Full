module.exports = async function seedRoles(prisma) {
  await prisma.rol.upsert({
    where: { nombreRol: 'Administrador' },
    update: {
      descripcion: 'Acceso total al sistema',
      permisos: {
        ventas: true,
        compras: true,
        inventario: true,
        usuarios: true,
        reportes: true
      }
    },
    create: {
      nombreRol: 'Administrador',
      descripcion: 'Acceso total al sistema',
      permisos: {
        ventas: true,
        compras: true,
        inventario: true,
        usuarios: true,
        reportes: true
      }
    }
  });

  await prisma.rol.upsert({
    where: { nombreRol: 'Cliente' },
    update: {
      descripcion: 'Usuario cliente de la tienda',
      permisos: {
        ver_catalogo: true,
        realizar_compras: true,
        ver_historial: true
      }
    },
    create: {
      nombreRol: 'Cliente',
      descripcion: 'Usuario cliente de la tienda',
      permisos: {
        ver_catalogo: true,
        realizar_compras: true,
        ver_historial: true
      }
    }
  });

  await prisma.rol.upsert({
    where: { nombreRol: 'Vendedor' },
    update: {
      descripcion: 'Gestión de ventas y clientes',
      permisos: {
        ventas: true,
        clientes: true,
        productos: 'solo_lectura'
      }
    },
    create: {
      nombreRol: 'Vendedor',
      descripcion: 'Gestión de ventas y clientes',
      permisos: {
        ventas: true,
        clientes: true,
        productos: 'solo_lectura'
      }
    }
  });

  return 3;
};
