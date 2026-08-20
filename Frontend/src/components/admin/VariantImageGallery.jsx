import React, { useState } from 'react';
import { Eye, X, ChevronLeft, ChevronRight, Image as ImageIcon, Package, ArrowLeft } from 'lucide-react';
import getImagenURL from '../../utils/imageUrl';

const VariantImageGallery = ({ 
  variant, 
  product, 
  size = 'md', 
  showBadge = true,
  className = '' 
}) => {
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Combinar imágenes de la variante y del producto
  const variantImages = variant.imagenesVariantes || [];
  const productImages = product?.imagenesProductos || [];
  const allImages = [
    ...variantImages.map(img => ({ ...img, type: 'variant' })),
    ...productImages.map(img => ({ ...img, type: 'product' }))
  ];

  // Determinar la imagen principal
  const mainVariantImage = variantImages.find(img => img.esPrincipal);
  const mainProductImage = productImages.find(img => img.esPrincipal);
  const fallbackImage = variant.imagenVariante || product?.imagenPrincipal;

  let displayImage = null;
  let imageCount = allImages.length;

  if (mainVariantImage) {
    displayImage = mainVariantImage;
  } else if (mainProductImage) {
    displayImage = mainProductImage;
  } else if (variantImages.length > 0) {
    displayImage = variantImages[0];
  } else if (productImages.length > 0) {
    displayImage = productImages[0];
  } else if (fallbackImage) {
    displayImage = { rutaImagen: fallbackImage, type: 'fallback' };
  }

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/placeholder.png';
    return getImagenURL(imagePath) || '/placeholder.png';
  };

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20'
  };

  const openGallery = (index = 0, e) => {
    if (e) e.stopPropagation();
    setCurrentImageIndex(index);
    setIsGalleryOpen(true);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  if (!displayImage) {
    return (
      <div className={`${sizeClasses[size]} bg-gray-100 dark:bg-slate-800 rounded-lg flex items-center justify-center border border-gray-200 dark:border-slate-700 ${className}`}>
        <ImageIcon className="w-1/2 h-1/2 text-gray-400 dark:text-gray-500" />
      </div>
    );
  }

  return (
    <>
      <div className="relative group">
        <button
          onClick={(e) => openGallery(0, e)}
          className={`${sizeClasses[size]} rounded-lg overflow-hidden border-2 border-gray-200 dark:border-slate-700 hover:border-purple-400 dark:hover:border-purple-500 transition-all duration-200 transform hover:scale-105 ${className}`}
        >
          <img
            src={getImageUrl(displayImage.rutaImagen)}
            alt={`Variante ${variant.codigoSku}`}
            className="w-full h-full object-cover"
            onError={(e) => { e.target.src = '/placeholder.png'; }}
          />
        </button>

        {/* Badge de contador de imágenes */}
        {showBadge && imageCount > 1 && (
          <div className="absolute -top-2 -right-2 bg-purple-600 text-white text-xs px-1.5 py-0.5 rounded-full font-medium shadow-lg">
            +{imageCount - 1}
          </div>
        )}

        {/* Indicador de tipo de imagen */}
        {displayImage.type === 'variant' && (
          <div className="absolute top-1 left-1 bg-green-600 text-white text-xs px-1 py-0.5 rounded">
            V
          </div>
        )}

        {/* Overlay de hover */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center pointer-events-none">
          <Eye className="w-4 h-4 text-white" />
        </div>
      </div>

      {/* Modal de Galería */}
      {isGalleryOpen && (
        <div className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4">
          <div className="relative max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            {/* Botón cerrar */}
            <button
              onClick={() => setIsGalleryOpen(false)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 transition z-10"
            >
              <X className="w-8 h-8" />
            </button>

            {/* Contenido de la imagen */}
            <div className="relative bg-black rounded-lg overflow-hidden">
              <img
                src={getImageUrl(allImages[currentImageIndex].rutaImagen)}
                alt={`Imagen ${currentImageIndex + 1}`}
                className="w-full h-auto max-h-[70vh] object-contain"
              />

              {/* Navegación */}
              {allImages.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}

              {/* Información de la imagen */}
              <div className="absolute bottom-4 left-4 right-4 bg-black/60 text-white p-3 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {allImages[currentImageIndex].type === 'variant' ? (
                      <>
                        <Package className="w-4 h-4" />
                        <span className="text-sm">Imagen de Variante</span>
                      </>
                    ) : (
                      <>
                        <ImageIcon className="w-4 h-4" />
                        <span className="text-sm">Imagen de Producto</span>
                      </>
                    )}
                  </div>
                  <span className="text-sm">
                    {currentImageIndex + 1} / {allImages.length}
                  </span>
                </div>
                {allImages[currentImageIndex].descripcion && (
                  <p className="text-xs mt-1 text-gray-300">
                    {allImages[currentImageIndex].descripcion}
                  </p>
                )}
              </div>
            </div>

            {/* Thumbnails */}
            {allImages.length > 1 && (
              <div className="flex gap-2 mt-4 justify-center overflow-x-auto">
                {allImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition ${
                      index === currentImageIndex
                        ? 'border-purple-500'
                        : 'border-gray-600 hover:border-gray-400'
                    }`}
                  >
                    <img
                      src={getImageUrl(image.rutaImagen)}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default VariantImageGallery;
