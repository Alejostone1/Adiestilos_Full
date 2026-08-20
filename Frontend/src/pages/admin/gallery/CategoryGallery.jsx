import React, { useState, useEffect } from 'react';
import { Search, RefreshCw, Grid, Image as ImageIcon } from 'lucide-react';
import { galeriaApi } from '../../../api/galeriaApi';
import { categoriasApi } from '../../../api/categoriasApi';
import ImageManagerModal from './ImageManagerModal';
import getImagenURL from '../../../utils/imageUrl';

const CategoryGallery = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    // Modal state
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [categoryImage, setCategoryImage] = useState([]); 
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const response = await galeriaApi.obtenerCategorias();
            setCategories(response.datos || response || []);
        } catch (error) {
            console.error('Error loading categories:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const filteredCategories = categories.filter(c => 
        c.titulo.toLowerCase().includes(search.toLowerCase())
    );

    const handleOpenModal = (category) => {
        setSelectedCategory(category);
        setIsModalOpen(true);
        if (category.imagen) {
            setCategoryImage([{ 
                idImagen: category.id, 
                rutaImagen: category.imagen, 
                esPrincipal: true 
            }]);
        } else {
            setCategoryImage([]);
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedCategory(null);
        setCategoryImage([]);
        fetchCategories();
    };

    const handleUpload = async (files) => {
        if (!selectedCategory || files.length === 0) return;
        setIsUploading(true);
        setUploadProgress(0);

        try {
            const file = files[0];
            
            const uploadRes = await categoriasApi.uploadImagenCategoria(file);
            setUploadProgress(50);

            if (uploadRes && uploadRes.url) {
                await categoriasApi.updateCategoria(selectedCategory.id, {
                    imagenCategoria: uploadRes.url
                });
                
                setUploadProgress(100);
                
                setCategoryImage([{ 
                    idImagen: selectedCategory.id, 
                    rutaImagen: uploadRes.url, 
                    esPrincipal: true 
                }]);
            }
        } catch (error) {
            console.error("Error updating category image", error);
            alert("Error al actualizar la imagen de la categoría");
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
        }
    };

    const handleDelete = async () => {
        if(!window.confirm("¿Eliminar imagen actual?")) return;
        try {
            await categoriasApi.updateCategoria(selectedCategory.id, {
                imagenCategoria: null 
            });
            setCategoryImage([]);
        } catch (error) {
            console.error("Error removing image", error);
            alert("Error al eliminar imagen");
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
                        placeholder="Buscar categoría..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                    />
                </div>
                
                <button 
                    onClick={fetchCategories}
                    className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition"
                    title="Recargar"
                >
                    <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {filteredCategories.map((category) => (
                    <div 
                        key={category.id} 
                        className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden group hover:shadow-lg transition-all duration-300"
                    >
                         <div className="aspect-square bg-gray-100 dark:bg-slate-900 relative">
                            {category.imagen ? (
                                <img 
                                    src={getImagenURL(category.imagen)} 
                                    alt={category.titulo}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-300">
                                    <Grid className="w-12 h-12" />
                                </div>
                            )}

                            {/* Hover Overlay */}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <button 
                                    onClick={() => handleOpenModal(category)}
                                    className="bg-white/90 text-gray-900 px-4 py-2 rounded-lg font-medium text-sm hover:bg-white transition-colors"
                                >
                                    Gestionar
                                </button>
                            </div>
                         </div>
                         <div className="p-4 text-center">
                            <h3 className="font-semibold text-gray-900 dark:text-white truncate">{category.titulo}</h3>
                         </div>
                    </div>
                ))}
            </div>

            <ImageManagerModal 
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={selectedCategory?.titulo}
                subtitle="Imagen de Categoría"
                images={categoryImage}
                onUpload={handleUpload}
                onDelete={categoryImage.length > 0 ? handleDelete : undefined}
                allowMultiple={false}
                isUploading={isUploading}
                uploadProgress={uploadProgress}
            />
        </div>
    );
};

export default CategoryGallery;
