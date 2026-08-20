import React, { useRef, useState } from 'react';
import { X, Upload, Trash2, Star, Loader2, Image as ImageIcon, Layers, Tag as TagIcon, Palette, Ruler } from 'lucide-react';
import getImagenURL from '../../../utils/imageUrl';

const ImageManagerModal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  images = [],
  variants = [],
  onUpload,
  onDelete,
  onSetMain,
  onVariantClick, // Nueva prop para manejar click en variante
  isUploading = false,
  uploadProgress = 0,
  allowMultiple = true
}) => {
  const fileInputRef = useRef(null);
  const [activeTab, setActiveTab] = useState('images');

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      onUpload(e.target.files);
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/placeholder.png';
    return getImagenURL(imagePath) || '/placeholder.png';
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800">
          <div className="flex justify-between items-start">
            <div className="flex-1 min-w-0">
               <h2 className="text-2xl font-semibold text-gray-900 dark:text-white truncate pr-4">{title}</h2>
               {subtitle && <div className="flex items-center gap-2 mt-1 text-sm text-gray-500 dark:text-gray-400">
                  <TagIcon className="w-3.5 h-3.5" />
                  <span className="font-mono">{subtitle}</span>
               </div>}
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors text-gray-500"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mt-6">
            <button
              onClick={() => setActiveTab('images')}
              className={`pb-2 px-1 text-sm font-semibold transition-colors relative ${
                activeTab === 'images' ? 'text-purple-600' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                Imágenes de Galería
                <span className="bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-md text-[11px]">{images.length}</span>
              </div>
              {activeTab === 'images' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600 rounded-full" />}
            </button>

            {variants && variants.length > 0 && (
              <button
                onClick={() => setActiveTab('variants')}
                className={`pb-2 px-1 text-sm font-semibold transition-colors relative ${
                  activeTab === 'variants' ? 'text-purple-600' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4" />
                  Variantes Asignadas
                  <span className="bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-md text-[11px]">{variants.length}</span>
                </div>
                {activeTab === 'variants' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600 rounded-full" />}
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-slate-900/50">
          
          {activeTab === 'images' ? (
            <>
              {/* Upload Area */}
              <div className="mb-8">
                <div 
                  className={`
                    border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-200 cursor-pointer group
                    ${isUploading 
                      ? 'border-purple-200 bg-purple-50 dark:bg-purple-900/10' 
                      : 'border-gray-300 dark:border-slate-600 hover:border-purple-500 hover:bg-purple-100/50 dark:hover:bg-slate-800'
                    }
                  `}
                  onClick={() => !isUploading && fileInputRef.current?.click()}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    multiple={allowMultiple}
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={isUploading}
                  />
                  
                  {isUploading ? (
                    <div className="flex flex-col items-center">
                      <Loader2 className="w-12 h-12 text-purple-600 animate-spin mb-4" />
                      <p className="text-gray-700 dark:text-gray-300 font-semibold text-lg">Subiendo fotografías...</p>
                      <p className="text-gray-500 text-sm mt-1">{uploadProgress}% completado</p>
                      <div className="w-full max-w-xs h-2 bg-gray-200 rounded-full mt-4 overflow-hidden shadow-inner">
                        <div 
                          className="h-full bg-gradient-to-r from-purple-500 to-indigo-600 transition-all duration-300 shadow-[0px_0px_10px_rgba(147,51,234,0.5)]"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-sm">
                        <Upload className="w-8 h-8" />
                      </div>
                      <p className="text-gray-900 dark:text-white font-semibold text-xl">
                        Añadir nuevas imágenes
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-xs mx-auto">
                        Selecciona o arrastra los archivos aquí para actualizar el catálogo visual.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Images Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {images.map((img, index) => {
                  const imageId = img.idImagen || img.idImagenVariante;
                  return (
                    <div
                      key={imageId || `image-${index}`}
                      className={`
                      group relative aspect-square rounded-2xl overflow-hidden border-2 transition-all duration-300
                      ${img.esPrincipal
                        ? 'border-purple-500 shadow-lg scale-100'
                        : 'border-white dark:border-slate-800 bg-white dark:bg-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1'
                      }
                    `}
                    >
                      <img
                        src={getImageUrl(img.rutaImagen)}
                        alt="Galería"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />

                      {/* Main Badge */}
                      {img.esPrincipal && (
                        <div className="absolute top-3 left-3 bg-purple-600 text-white text-[11px] px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-md font-semibold z-10 uppercase tracking-wide">
                          <Star className="w-3 h-3 fill-current" />
                          Principal
                        </div>
                      )}

                      {/* Actions Overlay */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-3 p-4">
                        {!img.esPrincipal && onSetMain && (
                          <button
                            onClick={() => onSetMain(imageId)}
                            className="p-3 bg-white/20 hover:bg-white text-white hover:text-purple-600 rounded-xl transition-all backdrop-blur-md hover:scale-110"
                            title="Establecer como principal"
                          >
                            <Star className="w-6 h-6" />
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={() => onDelete(imageId)}
                            className="p-3 bg-red-500/20 hover:bg-red-500 text-white rounded-xl transition-all backdrop-blur-md hover:scale-110"
                            title="Eliminar imagen"
                          >
                            <Trash2 className="w-6 h-6" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {images.length === 0 && !isUploading && (
                <div className="text-center py-20 bg-white/50 dark:bg-slate-800/40 rounded-3xl border border-dashed border-gray-200 dark:border-slate-700">
                  <ImageIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-500 dark:text-gray-400 font-medium">No hay imágenes en esta galería</p>
                  <p className="text-xs text-gray-400 mt-1">El producto aún no tiene contenido visual cargado.</p>
                </div>
              )}
            </>
          ) : (
            /* Tab de Variantes */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {variants.map((v) => (
                <div 
                  key={v.idVariante}
                  onClick={() => onVariantClick && onVariantClick(v)}
                  className="flex items-center gap-4 p-4 bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 hover:border-purple-400 cursor-pointer transition-all hover:shadow-md hover:-translate-x-1"
                >
                   <div className="w-16 h-16 rounded-xl bg-gray-100 dark:bg-slate-900 flex-shrink-0 overflow-hidden border border-gray-50 dark:border-slate-800 shadow-inner">
                      {v.imagenesVariantes?.[0] ? (
                        <img src={getImageUrl(v.imagenesVariantes[0].rutaImagen)} className="w-full h-full object-cover" alt="" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                           <Layers className="w-6 h-6 text-gray-300" />
                        </div>
                      )}
                   </div>
                   <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-900 dark:text-white truncate">{v.codigoSku}</p>
                        <span className="px-2 py-0.5 bg-gray-100 dark:bg-slate-700 rounded text-[11px] font-mono text-gray-500">
                           Stock: {v.cantidadStock}
                        </span>
                      </div>
                      <div className="flex gap-2 mt-1.5 flex-wrap">
                         {v.color && (
                           <span className="flex items-center gap-1 text-[11px] font-semibold text-purple-600 dark:text-purple-400 uppercase bg-purple-50 dark:bg-purple-900/20 px-2 py-0.5 rounded-full">
                              <Palette className="w-3 h-3" />
                              {v.color.nombreColor}
                           </span>
                         )}
                         {v.talla && (
                           <span className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400 uppercase bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-full">
                              <Ruler className="w-3 h-3" />
                              {v.talla.nombreTalla}
                           </span>
                         )}
                      </div>
                   </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default ImageManagerModal;
