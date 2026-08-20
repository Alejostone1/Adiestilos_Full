/**
 * Middleware para el manejo de carga de archivos utilizando Multer.
 * Proporciona una configuración flexible para subir imágenes a diferentes directorios.
 */

// --- IMPORTACIONES ---
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { configuracionServidor } = require('../config/serverConfig');
const { ErrorValidacion } = require('../utils/errorHelper');

/**
 * Crea un directorio si no existe.
 * @param {string} directorio - La ruta del directorio a crear.
 */
const asegurarDirectorio = (directorio) => {
  if (!fs.existsSync(directorio)) {
    fs.mkdirSync(directorio, { recursive: true });
  }
};

/**
 * Crea una configuración de almacenamiento para Multer.
 * @param {string} subdirectorio - El subdirectorio dentro de 'uploads' donde se guardarán los archivos (ej: 'productos', 'categorias').
 * @returns {multer.StorageEngine} Configuración de almacenamiento de Multer.
 */
const crearStorage = (subdirectorio) => {
  return multer.diskStorage({
    /**
     * Define la carpeta de destino para los archivos subidos.
     */
    destination: (req, file, cb) => {
      const directorioDestino = path.join(configuracionServidor.uploads.directorio, subdirectorio);
      asegurarDirectorio(directorioDestino);
      cb(null, directorioDestino);
    },
    /**
     * Define el nombre del archivo guardado para evitar colisiones.
     */
    filename: (req, file, cb) => {
      const prefijo = `${subdirectorio.slice(0, 4)}_${Date.now()}`;
      const extension = path.extname(file.originalname);
      const nombreArchivo = `${prefijo}${extension}`;
      cb(null, nombreArchivo);
    }
  });
};

/**
 * Filtro para aceptar únicamente archivos de imagen.
 */
const filtroDeImagenes = (req, file, cb) => {
  const tiposPermitidos = configuracionServidor.uploads.tiposPermitidos.imagenes;
  if (tiposPermitidos.includes(file.mimetype)) {
    // Aceptar el archivo
    cb(null, true);
  } else {
    // Rechazar el archivo con un error de validación
    const error = new ErrorValidacion(`Tipo de archivo no permitido: ${file.mimetype}. Solo se aceptan imágenes.`);
    cb(error, false);
  }
};

/**
 * Crea un middleware de Multer configurado para un tipo de subida específico.
 * @param {string} subdirectorio - Subdirectorio para guardar los archivos.
 * @returns {multer.Instance} Instancia de Multer configurada.
 */
const crearUploader = (subdirectorio) => {
  // Validar que el subdirectorio sea un nombre de carpeta válido
  if (!/^[a-zA-Z0-9_-]+$/.test(subdirectorio)) {
      throw new Error('Nombre de subdirectorio no válido.');
  }

  return multer({
    storage: crearStorage(subdirectorio),
    fileFilter: filtroDeImagenes,
    limits: {
      fileSize: 1024 * 1024 * 5 // Límite de 5MB (se puede tomar de la config)
    }
  });
};

// --- MIDDLEWARES EXPORTADOS ---

// Middleware para subir una única imagen de producto
const subirImagenProducto = crearUploader('productos').single('imagen');

// Middleware para subir múltiples imágenes de producto (hasta 5)
const subirImagenesProducto = crearUploader('productos').array('imagenes', 5);

// Middleware para subir una imagen de categoría
const subirImagenCategoria = crearUploader('categorias').single('imagen');

// Middleware para subir una imagen de variante de producto
const subirImagenVariante = crearUploader('variantes').single('imagen');

// Middleware para subir una imagen de perfil de usuario
const subirImagenPerfil = crearUploader('perfiles').single('avatar');

// Middleware para subir una imagen de proveedor
const subirImagenProveedor = crearUploader('proveedores').single('imagen');


module.exports = {
  subirImagenProducto,
  subirImagenesProducto,
  subirImagenCategoria,
  subirImagenVariante,
  subirImagenPerfil,
  subirImagenProveedor
};
