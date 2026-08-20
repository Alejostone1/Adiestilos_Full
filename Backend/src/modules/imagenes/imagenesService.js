
/**
 * @file imagenesService.js
 * @brief Servicio para la lógica de negocio relacionada con las imágenes de productos y variantes.
 *
 * Este archivo contiene la lógica para interactuar con la base de datos y el sistema de archivos
 * para gestionar las imágenes, incluyendo su creación, eliminación y actualización.
 */

const { prisma } = require('../../config/databaseConfig');
const fs = require('fs/promises');
const path = require('path');
const { configuracionServidor } = require('../../config/serverConfig');
const cloudinaryService = require('../../services/cloudinaryService');

/**
 * @function establecerImagenPrincipal
 * @brief Establece una imagen como la principal para un producto o variante.
 * @param {number} idImagen - El ID de la imagen a establecer como principal.
 * @param {'producto' | 'variante'} tipo - El tipo de entidad (producto o variante).
 * @returns {Promise<object>} La imagen actualizada.
 * @description Utiliza una transacción para asegurar que solo una imagen sea la principal,
 * primero desmarcando cualquier otra principal existente para la misma entidad.
 */
const establecerImagenPrincipal = async (idImagen, tipo) => {
  const modeloImagen = tipo === 'producto' ? prisma.imagenProducto : prisma.imagenVariante;
  const idCampo = tipo === 'producto' ? 'idImagen' : 'idImagenVariante';
  const idEntidadCampo = tipo === 'producto' ? 'idProducto' : 'idVariante';

  const imagen = await modeloImagen.findUnique({ where: { [idCampo]: idImagen } });
  if (!imagen) {
    const error = new Error('Imagen no encontrada.');
    error.statusCode = 404;
    throw error;
  }

  const idEntidad = imagen[idEntidadCampo];

  return prisma.$transaction(async (tx) => {
    const modeloTx = tipo === 'producto' ? tx.imagenProducto : tx.imagenVariante;
    
    // 1. Quitar la marca de principal de todas las demás imágenes de la entidad
    await modeloTx.updateMany({
      where: {
        [idEntidadCampo]: idEntidad,
        NOT: { [idCampo]: idImagen },
      },
      data: { esPrincipal: false },
    });

    // 2. Establecer la imagen actual como principal
    const imagenActualizada = await modeloTx.update({
      where: { [idCampo]: idImagen },
      data: { esPrincipal: true },
    });

    return imagenActualizada;
  });
};

/**
 * @function crearImagen
 * @brief Crea un registro de imagen en la base de datos.
 * @param {number} idEntidad - ID del producto o variante.
 * @param {'producto' | 'variante'} tipo - El tipo de entidad.
 * @param {object} file - Objeto del archivo subido por multer (req.file).
 * @param {object} body - Datos del cuerpo de la solicitud (esPrincipal, descripcion, orden).
 * @returns {Promise<object>} El registro de la imagen creada.
 */
const crearImagen = async (idEntidad, tipo, file, body) => {
  const subdirectorio = tipo === 'producto' ? 'productos' : 'variantes';
  // Con Cloudinary configurado devuelve la URL remota; si no, la ruta local /uploads/...
  const rutaImagen = await cloudinaryService.guardarImagen(file, subdirectorio);

  // Verificar si es la primera imagen para este producto/variante
  const modeloImagen = tipo === 'producto' ? prisma.imagenProducto : prisma.imagenVariante;
  const idEntidadCampo = tipo === 'producto' ? 'idProducto' : 'idVariante';
  
  const imagenesExistentes = await modeloImagen.count({
    where: { [idEntidadCampo]: idEntidad }
  });

  // Si es la primera imagen, automáticamente es principal
  const esPrimeraImagen = imagenesExistentes === 0;
  const esPrincipalManual = body.esPrincipal === 'true' || body.esPrincipal === true;
  
  const datos = {
    rutaImagen,
    esPrincipal: esPrimeraImagen || esPrincipalManual,
    descripcion: body.descripcion || `Imagen ${imagenesExistentes + 1}`,
    orden: body.orden ? parseInt(body.orden, 10) : imagenesExistentes,
  };

  // Si la imagen se marca como principal (o es la primera), ejecutar la lógica transaccional
  if (datos.esPrincipal && !esPrimeraImagen) {
    await modeloImagen.updateMany({
      where: { [idEntidadCampo]: idEntidad },
      data: { esPrincipal: false },
    });
  }
  
  return modeloImagen.create({
    data: {
      ...datos,
      [idEntidadCampo]: idEntidad,
    },
  });
};

/**
 * @function eliminarImagen
 * @brief Elimina una imagen de la base de datos y del sistema de archivos.
 * @param {number} idImagen - ID de la imagen a eliminar.
 * @param {'producto' | 'variante'} tipo - El tipo de entidad.
 * @returns {Promise<void>}
 */
const eliminarImagen = async (idImagen, tipo) => {
  const modeloImagen = tipo === 'producto' ? prisma.imagenProducto : prisma.imagenVariante;
  const idCampo = tipo === 'producto' ? 'idImagen' : 'idImagenVariante';

  // 1. Encontrar el registro de la imagen
  const imagen = await modeloImagen.findUnique({ where: { [idCampo]: idImagen } });
  if (!imagen) {
    const error = new Error('Imagen no encontrada para eliminar.');
    error.statusCode = 404;
    throw error;
  }

  // 2. Eliminar el archivo (de Cloudinary o del sistema de archivos local)
  try {
    if (cloudinaryService.esUrlCloudinary(imagen.rutaImagen)) {
      await cloudinaryService.borrarImagen(imagen.rutaImagen);
    } else {
      const rutaCompleta = path.join(configuracionServidor.uploads.directorio, '..', imagen.rutaImagen);
      await fs.unlink(rutaCompleta);
    }
  } catch (fileError) {
    // Si el archivo no existe, no es un error crítico, pero se debe registrar
    console.warn(`No se pudo eliminar el archivo de imagen: ${imagen.rutaImagen}. Puede que ya haya sido borrado.`);
  }

  // 3. Eliminar el registro de la base de datos
  await modeloImagen.delete({ where: { [idCampo]: idImagen } });
};

/**
 * @function actualizarDatosImagen
 * @brief Actualiza los metadatos de una imagen (orden, descripción).
 * @param {number} idImagen - ID de la imagen a actualizar.
 * @param {'producto' | 'variante'} tipo - El tipo de entidad.
 * @param {object} data - Datos a actualizar.

 */
const actualizarDatosImagen = async (idImagen, tipo, data) => {
    const modeloImagen = tipo === 'producto' ? prisma.imagenProducto : prisma.imagenVariante;
    const idCampo = tipo === 'producto' ? 'idImagen' : 'idImagenVariante';
    
    return modeloImagen.update({
        where: { [idCampo]: idImagen },
        data: {
            descripcion: data.descripcion,
            orden: data.orden ? parseInt(data.orden, 10) : undefined,
        }
    });
}

/**
 * @function obtenerImagenesPorEntidad
 * @brief Obtiene todas las imágenes asociadas a un producto o variante.
 * @param {number} idEntidad - ID del producto o variante.
 * @param {'producto' | 'variante'} tipo - El tipo de entidad.
 * @returns {Promise<Array>} Una lista de imágenes.
 */
const obtenerImagenesPorEntidad = async (idEntidad, tipo) => {
    const modeloImagen = tipo === 'producto' ? prisma.imagenProducto : prisma.imagenVariante;
    const idEntidadCampo = tipo === 'producto' ? 'idProducto' : 'idVariante';

    return modeloImagen.findMany({
        where: { [idEntidadCampo]: idEntidad },
        orderBy: { orden: 'asc' },
    });
}

// Exportar funciones del servicio
module.exports = {
  crearImagen,
  eliminarImagen,
  establecerImagenPrincipal,
  actualizarDatosImagen,
  obtenerImagenesPorEntidad
};
