module.exports = async function seedCategorias(prisma) {
  // ======================================================
  // CATEGORÍA PADRE 1: MUJER
  // ======================================================
  const mujer = await prisma.categoria.upsert({
    where: { nombreCategoria: 'Mujer' },
    update: {
      descripcion: 'Ropa y accesorios para mujer',
      imagenCategoria: '/uploads/categorias/Mujer.jpg',
      estado: 'activo'
    },
    create: {
      nombreCategoria: 'Mujer',
      descripcion: 'Ropa y accesorios para mujer',
      imagenCategoria: '/uploads/categorias/Mujer.jpg',
      estado: 'activo'
    }
  });

  // Hijas de Mujer
  const categoriasMujer = [
    {
      nombreCategoria: 'Blusas Mujer',
      descripcion: 'Blusas y camisas para mujer',
      imagenCategoria: '/uploads/categorias/Blusa_Mujer.jpg'
    },
    {
      nombreCategoria: 'Vestidos Mujer',
      descripcion: 'Vestidos casuales y formales para mujer',
      imagenCategoria: '/uploads/categorias/Vestidos_Mujer.jpg'
    }
  ];

  for (const categoria of categoriasMujer) {
    await prisma.categoria.upsert({
      where: { nombreCategoria: categoria.nombreCategoria },
      update: {
        descripcion: categoria.descripcion,
        imagenCategoria: categoria.imagenCategoria,
        estado: 'activo',
        categoriaPadreRef: {
          connect: { idCategoria: mujer.idCategoria }
        }
      },
      create: {
        nombreCategoria: categoria.nombreCategoria,
        descripcion: categoria.descripcion,
        imagenCategoria: categoria.imagenCategoria,
        estado: 'activo',
        categoriaPadreRef: {
          connect: { idCategoria: mujer.idCategoria }
        }
      }
    });
  }

  // ======================================================
  // CATEGORÍA PADRE 2: HOMBRE
  // ======================================================
  const hombre = await prisma.categoria.upsert({
    where: { nombreCategoria: 'Hombre' },
    update: {
      descripcion: 'Ropa y accesorios para hombre',
      imagenCategoria: '/uploads/categorias/Hombre.jpg',
      estado: 'activo'
    },
    create: {
      nombreCategoria: 'Hombre',
      descripcion: 'Ropa y accesorios para hombre',
      imagenCategoria: '/uploads/categorias/Hombre.jpg',
      estado: 'activo'
    }
  });

  // Hijas de Hombre
  const categoriasHombre = [
    {
      nombreCategoria: 'Camisetas Hombre',
      descripcion: 'Camisetas y polos para hombre',
      imagenCategoria: '/uploads/categorias/Camisetas_Hombre.jpg'
    },
    {
      nombreCategoria: 'Pantalones Hombre',
      descripcion: 'Jeans y pantalones para hombre',
      imagenCategoria: '/uploads/categorias/Pantalones_Hombre.jpg'
    }
  ];

  for (const categoria of categoriasHombre) {
    await prisma.categoria.upsert({
      where: { nombreCategoria: categoria.nombreCategoria },
      update: {
        descripcion: categoria.descripcion,
        imagenCategoria: categoria.imagenCategoria,
        estado: 'activo',
        categoriaPadreRef: {
          connect: { idCategoria: hombre.idCategoria }
        }
      },
      create: {
        nombreCategoria: categoria.nombreCategoria,
        descripcion: categoria.descripcion,
        imagenCategoria: categoria.imagenCategoria,
        estado: 'activo',
        categoriaPadreRef: {
          connect: { idCategoria: hombre.idCategoria }
        }
      }
    });
  }

  console.log('✅ Categorías seed ejecutado correctamente');

  return 6;
};
