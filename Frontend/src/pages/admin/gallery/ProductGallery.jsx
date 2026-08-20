import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, RefreshCw, Upload, Image as ImageIcon, Layers, Tag, Building } from 'lucide-react';
import { productosApi } from '../../../api/productosApi';
import { imagenesApi } from '../../../api/imagenesApi'; // Importar API de imágenes
import ImageManagerModal from './ImageManagerModal'; // Importar el modal
import getImagenURL from '../../../utils/imageUrl';

const ProductGallery = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');

  // Estados para el modal
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productImages, setProductImages] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const getImagenUrl = (imagenPath) => {
    if (!imagenPath) return '/placeholder.png';
    return getImagenURL(imagenPath) || '/placeholder.png';
  };

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      // Usamos la API de productos estándar que incluye toda la data
      const response = await productosApi.obtenerProductos({ pagina: page, nombre: search, limite: 10 });
      console.log('Response from API:', JSON.stringify(response, null, 2));
      setProducts(response.datos || []);
      setTotalPages(response.paginacion?.totalPaginas || 1);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    const timer = setTimeout(() => {
        fetchProducts();
    }, 500);
    return () => clearTimeout(timer);
  }, [fetchProducts]);

  // Manejadores del modal
  const handleOpenModal = async (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
    setProductImages(product.imagenes || []);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
    setProductImages([]);
    // Recargar la lista principal para actualizar contadores/miniaturas
    fetchProducts();
  };

  const handleUpload = async (files) => {
    if (!selectedProduct) return;
    setIsUploading(true);
    setUploadProgress(0);

    try {
        const uploadPromises = Array.from(files).map(async (file, index) => {
            const formData = new FormData();
            formData.append('imagen', file);
            formData.append('orden', productImages.length + index);

            return await imagenesApi.createImagenProducto(selectedProduct.idProducto, formData, {
                 onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(percentCompleted);
                 }
            });
        });

        const newImagesResponses = await Promise.all(uploadPromises);
        const newImages = newImagesResponses.map(res => res.datos || res.data || res);
        setProductImages(prev => [...prev, ...newImages]);

    } catch (error) {
        console.error("Error subiendo imágenes", error);
        alert("Error al subir imágenes");
    } finally {
        setIsUploading(false);
        setUploadProgress(0);
    }
  };

  const handleDelete = async (idImagen) => {
      if(!window.confirm("¿Estás seguro de eliminar esta imagen?")) return;
      try {
          await imagenesApi.deleteImagenProducto(idImagen);
          setProductImages(prev => prev.filter(img => img.idImagen !== idImagen));
      } catch (error) {
          console.error("Error eliminando imagen", error);
          alert("Error al eliminar imagen");
      }
  };

  const handleSetMain = async (idImagen) => {
      try {
          await imagenesApi.setImagenPrincipal(idImagen);
          setProductImages(prev => prev.map(img => ({
              ...img,
              esPrincipal: img.idImagen === idImagen
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
            placeholder="Buscar producto por nombre o código..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
          />
        </div>

        <div className="flex gap-2">
           <button
            onClick={fetchProducts}
            className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition"
            title="Recargar"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Grid */}
      {loading && products.length === 0 ? (
          <div className="text-center py-20 text-gray-400">Cargando...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {products.map((product) => {
              const imagenPrincipal = product.imagenes?.find(img => img.esPrincipal) || product.imagenes?.[0];
              return (
                <div
                    key={product.idProducto}
                    className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden group hover:shadow-lg transition-all duration-300"
                >
                    <div className="aspect-square bg-gray-100 dark:bg-slate-900 relative">
                        {imagenPrincipal ? (
                            <img
                                src={getImagenUrl(imagenPrincipal.rutaImagen)}
                                alt={product.nombreProducto}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                                <ImageIcon className="w-12 h-12" />
                            </div>
                        )}

                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <button
                                onClick={() => handleOpenModal(product)}
                                className="bg-white/90 text-gray-900 px-4 py-2 rounded-lg font-medium text-sm hover:bg-white transition-colors"
                            >
                                Gestionar
                            </button>
                        </div>

                        {/* Badge Count */}
                        <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                            <ImageIcon className="w-3 h-3" />
                            {product.imagenes?.length || 0}
                        </div>
                         {/* Variantes Count */}
                        <div className="absolute top-2 left-2 bg-purple-500/80 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                          <Layers className="w-3 h-3" />
                          {product.variantes?.length || 0}
                        </div>
                    </div>

                    <div className="p-4">
                        <h3 className="font-semibold text-gray-900 dark:text-white truncate" title={product.nombreProducto}>
                            {product.nombreProducto}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{product.codigoReferencia}</p>

                        <div className="mt-3 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                           <span className="flex items-center gap-1.5 truncate">
                               <Tag className="w-3 h-3" />
                               {product.categoria?.nombreCategoria || 'Sin categoría'}
                           </span>
                           <span className="flex items-center gap-1.5 truncate">
                                <Building className="w-3 h-3" />
                                {product.proveedor?.nombreProveedor || 'Sin proveedor'}
                           </span>
                        </div>
                    </div>
                </div>
              )
            })}
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
            title={selectedProduct?.nombreProducto || 'Gestión de Imágenes'}
            subtitle={selectedProduct?.codigoReferencia}
            images={productImages}
            variants={selectedProduct?.variantes}
            onUpload={handleUpload}
            onDelete={handleDelete}
            onSetMain={handleSetMain}
            isUploading={isUploading}
            uploadProgress={uploadProgress}
            onVariantClick={(v) => {
               // Logic to focus on this variant if needed
               alert(`Gestionando variante: ${v.codigoSku}`);
            }}
       />
    </div>
  );
};

export default ProductGallery;
