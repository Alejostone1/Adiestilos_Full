const express = require('express');
const router = express.Router();

const proveedoresController = require('./proveedoresController');
const { rutaAdministrador } = require('../../middleware/authMiddleware');
const { subirImagenProveedor } = require('../../middleware/uploadMiddleware');
const cloudinaryService = require('../../services/cloudinaryService');

// ===============================================
//      RUTAS PARA PROVEEDORES (solo admin)
// ===============================================

// GET /api/proveedores
router.get('/', rutaAdministrador(), proveedoresController.listarProveedores);

// GET /api/proveedores/:id
router.get('/:id', rutaAdministrador(), proveedoresController.obtenerProveedor);

// POST /api/proveedores
router.post('/', rutaAdministrador(), proveedoresController.crearProveedor);

// PUT /api/proveedores/:id
router.put('/:id', rutaAdministrador(), proveedoresController.actualizarProveedor);

// DELETE /api/proveedores/:id
router.delete('/:id', rutaAdministrador(), proveedoresController.eliminarProveedor);

// POST /api/proveedores/upload - Subir imagen de proveedor
router.post('/upload', rutaAdministrador(), subirImagenProveedor, async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ 
      mensaje: 'No se ha subido ninguna imagen' 
    });
  }

  try {
    // Con Cloudinary configurado devuelve la URL remota; si no, la ruta local /uploads/...
    const urlImagen = await cloudinaryService.guardarImagen(req.file, 'proveedores');
    res.status(200).json({ 
      mensaje: 'Imagen subida exitosamente',
      url: urlImagen,
      filename: req.file.filename
    });
  } catch (error) {
    console.error('Error al guardar la imagen de proveedor:', error);
    res.status(500).json({ mensaje: 'Error interno al subir la imagen' });
  }
});

module.exports = router;
