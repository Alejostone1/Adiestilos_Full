/**
 * Migración de imágenes locales a Cloudinary.
 * Ejecutar UNA VEZ desde la máquina local donde existen los archivos en uploads/.
 * 
 * Uso: node migrate_images_cloudinary.js
 * 
 * Lee los archivos de Backend/uploads/productos/ y Backend/uploads/variantes/,
 * los sube a Cloudinary y actualiza las URLs en la BD.
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const { cloudinary, inicializarCloudinary, estaConfigurado, obtenerCarpetaBase } = require('./src/config/cloudinaryConfig');

const prisma = new PrismaClient();

async function uploadToCloudinary(filePath, folder) {
  const result = await cloudinary.uploader.upload(filePath, {
    folder,
    resource_type: 'image',
    overwrite: true,
  });
  return result.secure_url;
}

async function migrar() {
  if (!inicializarCloudinary()) {
    console.error('❌ Cloudinary no está configurado. Verifique CLOUDINARY_* en .env');
    process.exit(1);
  }

  console.log('✅ Cloudinary configurado');
  const carpetaBase = obtenerCarpetaBase();

  // 1. Subir imágenes de productos
  const productImages = await prisma.imagenProducto.findMany();
  console.log(`\n📦 Imágenes de producto: ${productImages.length}`);

  for (const img of productImages) {
    if (img.rutaImagen.startsWith('http')) {
      console.log(`  ⏭️  Ya es URL remota: ${img.rutaImagen.substring(0, 60)}...`);
      continue;
    }

    const localPath = path.resolve(process.cwd(), img.rutaImagen.replace(/^\//, ''));
    if (!fs.existsSync(localPath)) {
      console.warn(`  ⚠️  Archivo no encontrado: ${localPath}`);
      continue;
    }

    try {
      const url = await uploadToCloudinary(localPath, `${carpetaBase}/productos`);
      await prisma.imagenProducto.update({
        where: { idImagen: img.idImagen },
        data: { rutaImagen: url }
      });
      console.log(`  ✅ Producto ${img.idImagen}: ${url.substring(0, 70)}...`);
    } catch (err) {
      console.error(`  ❌ Error subiendo imagen ${img.idImagen}: ${err.message}`);
    }
  }

  // 2. Subir imágenes de variantes
  const variantImages = await prisma.imagenVariante.findMany();
  console.log(`\n🎨 Imágenes de variante: ${variantImages.length}`);

  for (const img of variantImages) {
    if (img.rutaImagen.startsWith('http')) {
      console.log(`  ⏭️  Ya es URL remota: ${img.rutaImagen.substring(0, 60)}...`);
      continue;
    }

    const localPath = path.resolve(process.cwd(), img.rutaImagen.replace(/^\//, ''));
    if (!fs.existsSync(localPath)) {
      console.warn(`  ⚠️  Archivo no encontrado: ${localPath}`);
      continue;
    }

    try {
      const url = await uploadToCloudinary(localPath, `${carpetaBase}/variantes`);
      await prisma.imagenVariante.update({
        where: { idImagenVariante: img.idImagenVariante },
        data: { rutaImagen: url }
      });
      console.log(`  ✅ Variante ${img.idImagenVariante}: ${url.substring(0, 70)}...`);
    } catch (err) {
      console.error(`  ❌ Error subiendo imagen variante ${img.idImagenVariante}: ${err.message}`);
    }
  }

  // 3. Subir imágenes de categorías si existen
  const categorias = await prisma.categoria.findMany({
    where: { imagenCategoria: { not: null } }
  });
  console.log(`\n📁 Imágenes de categoría: ${categorias.length}`);

  for (const cat of categorias) {
    if (cat.imagenCategoria.startsWith('http')) {
      console.log(`  ⏭️  Ya es URL remota: ${cat.imagenCategoria.substring(0, 60)}...`);
      continue;
    }

    const localPath = path.resolve(process.cwd(), cat.imagenCategoria.replace(/^\//, ''));
    if (!fs.existsSync(localPath)) {
      console.warn(`  ⚠️  Archivo no encontrado: ${localPath}`);
      continue;
    }

    try {
      const url = await uploadToCloudinary(localPath, `${carpetaBase}/categorias`);
      await prisma.categoria.update({
        where: { idCategoria: cat.idCategoria },
        data: { imagenCategoria: url }
      });
      console.log(`  ✅ Categoría ${cat.idCategoria}: ${url.substring(0, 70)}...`);
    } catch (err) {
      console.error(`  ❌ Error subiendo imagen categoría ${cat.idCategoria}: ${err.message}`);
    }
  }

  console.log('\n🎉 Migración completada');
  await prisma.$disconnect();
}

migrar().catch(async (err) => {
  console.error('❌ Error fatal:', err);
  await prisma.$disconnect();
  process.exit(1);
});