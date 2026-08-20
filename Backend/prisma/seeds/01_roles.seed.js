module.exports = async function seedRoles(prisma) {
  const permisosAdministrador = {
    dashboard: 'full',
    usuarios: 'full',
    roles: 'full',
    productos: 'full',
    categorias: 'full',
    proveedores: 'full',
    galeria: 'full',
    ventas: 'full',
    creditos: 'full',
    descuentos: 'full',
    devoluciones: 'full',
    compras: 'full',
    inventario: 'full',
    reportes: 'full',
    ver_catalogo: true,
    realizar_compras: true,
    ver_historial: true
  };

  await prisma.rol.upsert({
    where: { nombreRol: 'Administrador' },
    update: {
      descripcion: 'Acceso total al sistema',
      activo: true,
      permisos: permisosAdministrador
    },
    create: {
      nombreRol: 'Administrador',
      descripcion: 'Acceso total al sistema',
      permisos: permisosAdministrador
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
