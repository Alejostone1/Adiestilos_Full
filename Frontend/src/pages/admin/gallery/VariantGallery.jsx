import React, { useState, useEffect } from 'react';
import { Search, Filter, RefreshCw, Upload, Image as ImageIcon, Layers, Tag } from 'lucide-react';
import { galeriaApi } from '../../../api/galeriaApi';
import { imagenesApi } from '../../../api/imagenesApi'; // Importar API de imágenes
import ImageManagerModal from './ImageManagerModal'; // Importar el modal
import getImagenURL from '../../../utils/imageUrl';

const VariantGallery = () => {
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');

  // Estados para el modal
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [variantImages, setVariantImages] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const getImagenUrl = (imagenPath) => {
    if (!imagenPath) return '/placeholder.png';
    return getImagenURL(imagenPath) || '/placeholder.png';
  };

  const fetchVariants = async () => {
    setLoading(true);
    try {
      const response = await galeriaApi.obtenerVariantes({ pagina: page, busqueda: search });
      setVariants(response.datos || []);
      setTotalPages(response.paginacion?.totalPaginas || 1);
    } catch (error) {
      console.error('Error loading variants:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
        fetchVariants();
    }, 500);
    return () => clearTimeout(timer);
  }, [page, search]);

  // Manejadores del modal
  const handleOpenModal = async (variant) => {
    setSelectedVariant(variant);
    setIsModalOpen(true);
    try {
        const imagesResponse = await imagenesApi.getImagenesVariante(variant.id);
        setVariantImages(imagesResponse.datos || imagesResponse.data || []);
    } catch (error) {
        console.error("Error cargando imágenes de la variante", error);
        setVariantImages([]);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedVariant(null);
    setVariantImages([]);
    fetchVariants(); 
  };

  const handleUpload = async (files) => {
    if (!selectedVariant) return;
    setIsUploading(true);
    setUploadProgress(0);

    try {
        const uploadPromises = Array.from(files).map(async (file, index) => {
            const formData = new FormData();
            formData.append('imagen', file);
            formData.append('orden', variantImages.length + index); 

            return await imagenesApi.createImagenVariante(selectedVariant.id, formData, {
                 onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(percentCompleted);
                 }
            });
        });

        await Promise.all(uploadPromises);
        
        const imagesResponse = await imagenesApi.getImagenesVariante(selectedVariant.id);
        setVariantImages(imagesResponse.datos || imagesResponse.data || []);

    } catch (error) {
        console.error("Error subiendo imágenes", error);
        alert("Error al subir imágenes");
    } finally {
        setIsUploading(false);
        setUploadProgress(0);
    }
  };

  const handleDelete = async (idImagenVariante) => {
      if(!window.confirm("¿Estás seguro de eliminar esta imagen?")) return;
      try {
          await imagenesApi.deleteImagenVariante(idImagenVariante);
          setVariantImages(prev => prev.filter(img => img.idImagenVariante !== idImagenVariante));
      } catch (error) {
          console.error("Error eliminando imagen", error);
          alert("Error al eliminar imagen");
      }
  };

  const handleSetMain = async (idImagenVariante) => {
      try {
          await imagenesApi.setImagenPrincipalVariante(idImagenVariante);
          setVariantImages(prev => prev.map(img => ({
              ...img,
              esPrincipal: img.idImagenVariante === idImagenVariante
          })));
      } catch (error) {
          console.error("Error estableciendo imagen principal", error);
          alert("Error al establecer imagen principal");
      }
  };

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por SKU o nombre de producto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
          />
        </div>
        
        <div className="flex gap-2">
           <button 
            onClick={fetchVariants}
            className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition"
            title="Recargar"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Grid */}
      {loading && variants.length === 0 ? (
          <div className="text-center py-20 text-gray-400">Cargando...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {variants.map((item) => (
            <div 
                key={item.id} 
                className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden group hover:shadow-lg transition-all duration-300 flex flex-col"
            >
                <div className="aspect-square bg-gray-100 dark:bg-slate-900 relative overflow-hidden">
                    {item.imagenPrincipal ? (
                        <img 
                            src={getImagenUrl(item.imagenPrincipal)} 
                            alt={item.titulo}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-50 dark:bg-slate-900/50">
                            <Layers className="w-10 h-10" />
                        </div>
                    )}
                    
                    {/* Hover Overlay */}
                     <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button 
                            onClick={() => handleOpenModal(item)}
                            className="bg-white/90 text-gray-900 px-4 py-2 rounded-lg font-medium text-sm hover:bg-white transition-colors"
                        >
                            Gestionar Galería
                        </button>
                    </div>

                    {/* Badge Count */}
                    <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1">
                        <ImageIcon className="w-3 h-3" />
                        {item.totalImagenes}
                    </div>

                    {/* Product Prefix Badge */}
                    <div className="absolute bottom-2 left-2 right-2 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm px-2 py-1.5 rounded-lg border border-gray-100 dark:border-slate-700 shadow-sm transition-transform duration-300 transform translate-y-12 group-hover:translate-y-0">
                        <p className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-tighter truncate">PRODUCTO</p>
                        <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">{item.titulo}</p>
                    </div>
                </div>
                
                <div className="p-4 flex-1 flex flex-col">
                    <div className="flex items-center gap-1.5 mb-1">
                       <Tag className="w-3.5 h-3.5 text-gray-400" />
                       <h3 className="font-bold text-gray-900 dark:text-white truncate text-sm" title={item.subtitulo}>
                           {item.subtitulo}
                       </h3>
                    </div>
                    
                    <div className="mt-auto space-y-2">
                        <div className="flex flex-wrap gap-1">
                            {item.atributos.split('/').map((attr, idx) => (
                                <span key={idx} className="inline-block px-2 py-0.5 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-300 rounded text-[10px] font-medium border border-purple-100 dark:border-purple-800/30">
                                    {attr.trim()}
                                </span>
                            ))}
                        </div>
                        
                        <div className="flex items-center justify-between text-[10px] text-gray-400 pt-2 border-t border-gray-50 dark:border-slate-700/50">
                          <span className="flex items-center gap-1">
                             <RefreshCw className="w-3 h-3" />
                             {new Date(item.updatedAt).toLocaleDateString()}
                          </span>
                        </div>
                    </div>
                </div>
            </div>
            ))}
        </div>
      )}
      
      {/* Pagination (Simple) */}
       <div className="flex justify-center gap-2 mt-8">
        <button 
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
            className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-slate-700"
        >
            Anterior
        </button>
        <span className="px-4 py-2 text-gray-600 dark:text-gray-300">
            Página {page} de {totalPages}
        </span>
        <button 
            disabled={page === totalPages}
            onClick={() => setPage(p => p + 1)}
            className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-slate-700"
        >
            Siguiente
        </button>
       </div>

       {/* Modal de Gestión */}
       <ImageManagerModal 
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            title={selectedVariant?.titulo || 'Gestión de Variante'}
            subtitle={`${selectedVariant?.subtitulo} - ${selectedVariant?.atributos}`}
            images={variantImages}
            onUpload={handleUpload}
            onDelete={handleDelete}
            onSetMain={handleSetMain}
            isUploading={isUploading}
            uploadProgress={uploadProgress}
       />
    </div>
  );
};

export default VariantGallery;
