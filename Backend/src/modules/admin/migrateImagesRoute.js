/**
 * Endpoint temporal para migrar rutas de imagen a URLs de Cloudinary.
 * DESPUÉS DE USAR, ELIMINAR ESTE ARCHIVO Y LA RUTA EN allRoutes.js
 */
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

router.post('/migrate-images', async (req, res) => {
  try {
    const { mapping } = req.body;
    if (!Array.isArray(mapping)) {
      return res.status(400).json({ error: 'mapping debe ser un array' });
    }

    const resultados = [];

    for (const item of mapping) {
      const { local, cloudinary } = item;
      if (!local || !cloudinary) continue;

      // Update ImagenProducto
      const imgProd = await prisma.imagenProducto.updateMany({
        where: { rutaImagen: local },
        data: { rutaImagen: cloudinary }
      });
      if (imgProd.count > 0) {
        resultados.push({ tipo: 'producto', ruta: local, actualizadas: imgProd.count });
      }

      // Update ImagenVariante
      const imgVar = await prisma.imagenVariante.updateMany({
        where: { rutaImagen: local },
        data: { rutaImagen: cloudinary }
      });
      if (imgVar.count > 0) {
        resultados.push({ tipo: 'variante', ruta: local, actualizadas: imgVar.count });
      }
    }

    // Verify
    const totalProd = await prisma.imagenProducto.count();
    const cloudProd = await prisma.imagenProducto.count({
      where: { rutaImagen: { startsWith: 'https://' } }
    });
    const totalVar = await prisma.imagenVariante.count();
    const cloudVar = await prisma.imagenVariante.count({
      where: { rutaImagen: { startsWith: 'https://' } }
    });

    res.json({
      mensaje: 'Migración completada',
      resultados,
      resumen: {
        imagenesProducto: { total: totalProd, conCloudinary: cloudProd },
        imagenesVariante: { total: totalVar, conCloudinary: cloudVar }
      }
    });
  } catch (error) {
    console.error('Error en migración:', error);
    res.status(500).json({ error: error.message });
  } finally {
    await prisma.$disconnect();
  }
});

module.exports = router;
