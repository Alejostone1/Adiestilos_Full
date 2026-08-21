/**
 * Helper: upsert categoría sin sobrescribir imagenCategoria si ya tiene URL Cloudinary
 */
async function upsertCategoria(prisma, nombre, datos, padreId) {
  const existente = await prisma.categoria.findUnique({ where: { nombreCategoria: nombre } });
  if (existente && existente.imagenCategoria && existente.imagenCategoria.startsWith('https://')) {
    return existente;
  }
  return prisma.categoria.upsert({
    where: { nombreCategoria: nombre },
    update: { ...datos, ...(padreId ? { categoriaPadreRef: { connect: { idCategoria: padreId } } } : {}) },
    create: { nombreCategoria: nombre, ...datos, ...(padreId ? { categoriaPadreRef: { connect: { idCategoria: padreId } } } : {}) }
  });
}

module.exports = async function seedCategorias(prisma) {
  // ======================================================
  // CATEGORÍA PADRE 1: MUJER
  // ======================================================
  const mujer = await upsertCategoria(prisma, 'Mujer', {
    descripcion: 'Ropa y accesorios para mujer',
    imagenCategoria: 'https://res.cloudinary.com/dm5qezkoc/image/upload/v1787321046/adi-estilos/categorias/bsori38bkkqigscc8vwn.jpg',
    estado: 'activo'
  });

  // Hijas de Mujer
  const categoriasMujer = [
    {
      nombreCategoria: 'Blusas Mujer',
      descripcion: 'Blusas y camisas para mujer',
      imagenCategoria: 'https://res.cloudinary.com/dm5qezkoc/image/upload/v1787321047/adi-estilos/categorias/hwfay7fly7dq4selgouo.jpg'
    },
    {
      nombreCategoria: 'Vestidos Mujer',
      descripcion: 'Vestidos casuales y formales para mujer',
      imagenCategoria: 'https://res.cloudinary.com/dm5qezkoc/image/upload/v1787321047/adi-estilos/categorias/idwffi06tipelxgm6du0.jpg'
    }
  ];

  for (const categoria of categoriasMujer) {
    await upsertCategoria(prisma, categoria.nombreCategoria, {
      descripcion: categoria.descripcion,
      imagenCategoria: categoria.imagenCategoria,
      estado: 'activo'
    }, mujer.idCategoria);
  }

  // ======================================================
  // CATEGORÍA PADRE 2: HOMBRE
  // ======================================================
  const hombre = await upsertCategoria(prisma, 'Hombre', {
    descripcion: 'Ropa y accesorios para hombre',
    imagenCategoria: 'https://res.cloudinary.com/dm5qezkoc/image/upload/v1787321513/adi-estilos/categorias/cate_1787321513126.jpg',
    estado: 'activo'
  });

  // Hijas de Hombre
  const categoriasHombre = [
    {
      nombreCategoria: 'Camisetas Hombre',
      descripcion: 'Camisetas y polos para hombre',
      imagenCategoria: 'https://res.cloudinary.com/dm5qezkoc/image/upload/v1787321048/adi-estilos/categorias/r3p6upr03no75ksdlnzk.jpg'
    },
    {
      nombreCategoria: 'Pantalones Hombre',
      descripcion: 'Jeans y pantalones para hombre',
      imagenCategoria: 'https://res.cloudinary.com/dm5qezkoc/image/upload/v1787321049/adi-estilos/categorias/o79bjm5rqlt8jsoqrtcf.jpg'
    }
  ];

  for (const categoria of categoriasHombre) {
    await upsertCategoria(prisma, categoria.nombreCategoria, {
      descripcion: categoria.descripcion,
      imagenCategoria: categoria.imagenCategoria,
      estado: 'activo'
    }, hombre.idCategoria);
  }

  console.log('✅ Categorías seed ejecutado correctamente');

  return 6;
};
