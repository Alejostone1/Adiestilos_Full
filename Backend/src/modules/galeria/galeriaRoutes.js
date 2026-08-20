const express = require('express');
const router = express.Router();
const galeriaController = require('./galeriaController');

router.get('/resumen', galeriaController.obtenerResumen);
router.get('/productos', galeriaController.listarProductosGaleria);
router.get('/variantes', galeriaController.listarVariantesGaleria);
router.get('/proveedores', galeriaController.listarProveedoresGaleria);
router.get('/categorias', galeriaController.listarCategoriasGaleria);

module.exports = router;
