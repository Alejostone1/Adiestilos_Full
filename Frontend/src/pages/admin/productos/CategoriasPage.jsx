import React, { useState, useEffect, useCallback } from 'react';
import {
  Tag,
  Plus,
  Search,
  Edit,
  Trash2,
  Upload,
  Image as ImageIcon,
  X,
  Eye,
  Loader2,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Grid3X3,
  List,
  Filter,
  LayoutGrid
} from 'lucide-react';
import { categoriasApi } from '../../../api/categoriasApi';
import { useAuth } from '../../../context/AuthContext';
import CategoryDrilldownDrawer from '../../../components/admin/CategoryDrilldownDrawer';
import getImagenURL from '../../../utils/imageUrl';

// ======================================================
// Componente principal
// ======================================================
export default function CategoriasPage() {
  const { token } = useAuth();

  // Estados principales
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' o 'list'

  // Estados para modales
  const [showModal, setShowModal] = useState(false);
  const [editingCategoria, setEditingCategoria] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedCategoria, setSelectedCategoria] = useState(null);
  const [isDrilldownOpen, setIsDrilldownOpen] = useState(false);
  const [drilldownCategory, setDrilldownCategory] = useState(null);

  // Estados para imágenes
  const [imagenCategoriaUrl, setImagenCategoriaUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Formulario
  const [formData, setFormData] = useState({
    nombreCategoria: '',
    descripcion: '',
    estado: 'activo',
    imagenCategoria: ''
  });

  // Función para obtener URLs de imágenes
  const getImagenUrl = (imagenPath) => {
    if (!imagenPath) return '/placeholder.png';
    return getImagenURL(imagenPath) || '/placeholder.png';
  };

  // Obtener categorías
  const fetchCategorias = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await categoriasApi.obtenerTodasLasCategorias();
      setCategorias(response.datos || []);
    } catch (err) {
      setError(err.message || 'Error al obtener categorías');
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar al iniciar
  useEffect(() => {
    fetchCategorias();
  }, [fetchCategorias]);

  // Filtrar categorías
  const categoriasFiltradas = categorias.filter(categoria =>
    categoria.nombreCategoria.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (categoria.descripcion && categoria.descripcion.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Manejar subida de imagen
  const handleImageUpload = async (file) => {
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const response = await categoriasApi.uploadImagenCategoria(file);
      if (response && response.url) {
        setImagenCategoriaUrl(response.url);
        setFormData({ ...formData, imagenCategoria: response.url });
      }
    } catch (error) {
      console.error('Error al subir la imagen:', error);
      alert('Error al subir la imagen');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Manejar apertura de modal
  const handleOpenModal = (categoria = null) => {
    if (categoria) {
      setEditingCategoria(categoria);
      setFormData({
        nombreCategoria: categoria.nombreCategoria,
        descripcion: categoria.descripcion || '',
        estado: categoria.estado,
        imagenCategoria: categoria.imagenCategoria || ''
      });
      setImagenCategoriaUrl(categoria.imagenCategoria || '');
    } else {
      setEditingCategoria(null);
      setFormData({
        nombreCategoria: '',
        descripcion: '',
        estado: 'activo',
        imagenCategoria: ''
      });
      setImagenCategoriaUrl('');
    }
    setShowModal(true);
  };

  // Manejar cierre de modal
  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCategoria(null);
    setFormData({
      nombreCategoria: '',
      descripcion: '',
      estado: 'activo',
      imagenCategoria: ''
    });
    setImagenCategoriaUrl('');
  };

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCategoria) {
        await categoriasApi.updateCategoria(editingCategoria.idCategoria, formData);
      } else {
        await categoriasApi.createCategoria(formData);
      }
      handleCloseModal();
      fetchCategorias();
    } catch (err) {
      setError(err.message || 'Error al guardar categoría');
    }
  };

  // Manejar eliminación
  const handleDelete = async (idCategoria) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta categoría?')) return;
    try {
      await categoriasApi.deleteCategoria(idCategoria);
      fetchCategorias();
    } catch (err) {
      setError(err.message || 'Error al eliminar categoría');
    }
  };

  // Ver imagen
  const handleViewImage = (e, categoria) => {
    e.stopPropagation();
    setSelectedCategoria(categoria);
    setShowImageModal(true);
  };

  const handleOpenDrilldown = (categoria) => {
    setDrilldownCategory(categoria);
    setIsDrilldownOpen(true);
  };

  // Componente de tarjeta para vista grid
  const CategoriaCard = ({ categoria }) => (
    <div 
      className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group cursor-pointer"
      onClick={() => handleOpenDrilldown(categoria)}
    >
      {/* Imagen de la categoría */}
      <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 overflow-hidden">
        {categoria.imagenCategoria ? (
          <>
            <img
              src={getImagenUrl(categoria.imagenCategoria)}
              alt={categoria.nombreCategoria}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => { e.target.src = '/placeholder.png'; }}
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300" />
            <button
              onClick={(e) => handleViewImage(e, categoria)}
              className="absolute top-2 right-2 p-2 bg-white/90 dark:bg-gray-800/90 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:scale-110"
            >
              <Eye className="w-4 h-4 text-gray-700 dark:text-gray-300" />
            </button>
            <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-gradient-to-t from-black/60 to-transparent">
              <span className="text-white text-xs font-semibold flex items-center justify-center gap-2">
                 <LayoutGrid className="w-3 h-3" /> Explorar Inventario
              </span>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-500">
            <ImageIcon className="w-12 h-12 mb-2" />
            <span className="text-sm">Sin imagen</span>
          </div>
        )}
      </div>

      {/* Contenido */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-lg">
            {categoria.nombreCategoria}
          </h3>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            categoria.estado === 'activo'
              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
          }`}>
            {categoria.estado}
          </span>
        </div>

        {categoria.descripcion && (
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
            {categoria.descripcion}
          </p>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <Tag className="w-3 h-3" />
            <span>ID: {categoria.idCategoria}</span>
          </div>

          <div className="flex gap-1">
            <button
              onClick={(e) => { e.stopPropagation(); handleOpenModal(categoria); }}
              className="p-2 text-blue-600 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
              title="Editar"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleDelete(categoria.idCategoria); }}
              className="p-2 text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900/30 rounded-lg transition-colors"
              title="Eliminar"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Tag className="w-6 h-6" />
                Gestión de Categorías
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Administra las categorías del catálogo con imágenes
              </p>
            </div>

            <button
              onClick={() => handleOpenModal()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Nueva Categoría
            </button>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Barra de herramientas */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Búsqueda */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar categorías..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Controles */}
            <div className="flex items-center gap-3">
              <button
                onClick={fetchCategorias}
                className="flex items-center gap-2 px-3 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="Actualizar"
              >
                <RefreshCw className="w-4 h-4" />
              </button>

              <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Estados */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600 mr-2" />
            <span className="text-gray-600 dark:text-gray-400">Cargando categorías...</span>
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
              <span className="text-red-700 dark:text-red-300">{error}</span>
            </div>
          </div>
        )}

        {!loading && !error && categoriasFiltradas.length === 0 && (
          <div className="text-center py-12">
            <Tag className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              {searchTerm ? 'No se encontraron categorías' : 'No hay categorías registradas'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchTerm ? 'Intenta con otros términos de búsqueda' : 'Crea tu primera categoría para comenzar'}
            </p>
          </div>
        )}

        {/* Vista Grid */}
        {!loading && !error && categoriasFiltradas.length > 0 && viewMode === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {categoriasFiltradas.map((categoria) => (
              <CategoriaCard key={categoria.idCategoria} categoria={categoria} />
            ))}
          </div>
        )}

        {/* Vista Lista */}
        {!loading && !error && categoriasFiltradas.length > 0 && viewMode === 'list' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Categoría
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Descripción
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {categoriasFiltradas.map((categoria) => (
                    <tr key={categoria.idCategoria} className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div 
                          className="flex items-center cursor-pointer group/item"
                          onClick={() => handleOpenDrilldown(categoria)}
                        >
                          <div className="flex-shrink-0 h-10 w-10">
                            {categoria.imagenCategoria ? (
                              <img
                                className="h-10 w-10 rounded-lg object-cover transition-transform group-hover/item:scale-110"
                                src={getImagenUrl(categoria.imagenCategoria)}
                                alt={categoria.nombreCategoria}
                                onError={(e) => { e.target.src = '/placeholder.png'; }}
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                <Tag className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 group-hover/item:text-blue-600 transition-colors">
                              {categoria.nombreCategoria}
                            </div>
                            <div className="text-[11px] uppercase font-semibold text-gray-400 dark:text-gray-500 flex items-center gap-1">
                               <LayoutGrid className="w-3 h-3" /> Ver productos
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 dark:text-gray-100">
                          {categoria.descripcion || '—'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          categoria.estado === 'activo'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                        }`}>
                          {categoria.estado}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          {categoria.imagenCategoria && (
                            <button
                              onClick={(e) => handleViewImage(e, categoria)}
                              className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                              title="Ver imagen"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleOpenModal(categoria)}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(categoria.idCategoria)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Creación/Edición */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleSubmit} className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  {editingCategoria ? 'Editar Categoría' : 'Nueva Categoría'}
                </h3>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </button>
              </div>

              {/* Imagen */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Imagen de la Categoría
                </label>

                <div className="flex items-center gap-6">
                  {/* Preview */}
                  <div className="relative">
                    <div className="w-32 h-32 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden border-2 border-dashed border-gray-300 dark:border-gray-600">
                      {imagenCategoriaUrl ? (
                        <img
                          src={getImagenUrl(imagenCategoriaUrl)}
                          alt="Previsualización"
                          className="w-full h-full object-cover"
                          onError={(e) => { e.target.src = '/placeholder.png'; }}
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-500">
                          <ImageIcon className="w-8 h-8 mb-1" />
                          <span className="text-xs">Sin imagen</span>
                        </div>
                      )}
                    </div>

                    {imagenCategoriaUrl && (
                      <button
                        type="button"
                        onClick={() => {
                          setImagenCategoriaUrl('');
                          setFormData({ ...formData, imagenCategoria: '' });
                        }}
                        className="absolute -top-2 -right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  {/* Upload */}
                  <div className="flex-1">
                    <input
                      type="file"
                      id="imagenCategoria"
                      accept="image/*"
                      onChange={(e) => e.target.files[0] && handleImageUpload(e.target.files[0])}
                      className="hidden"
                    />
                    <label
                      htmlFor="imagenCategoria"
                      className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-2" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">Subiendo...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-8 h-8 text-gray-400 dark:text-gray-500 mb-2" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {imagenCategoriaUrl ? 'Cambiar imagen' : 'Subir imagen'}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                            PNG, JPG, GIF hasta 5MB
                          </span>
                        </>
                      )}
                    </label>
                  </div>
                </div>
              </div>

              {/* Campos del formulario */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nombre de la Categoría *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nombreCategoria}
                    onChange={(e) => setFormData({ ...formData, nombreCategoria: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ej: Ropa Masculina"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Descripción
                  </label>
                  <textarea
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Describe brevemente esta categoría..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Estado
                  </label>
                  <select
                    value={formData.estado}
                    onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="activo">Activo</option>
                    <option value="inactivo">Inactivo</option>
                  </select>
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingCategoria ? 'Actualizar' : 'Crear'} Categoría
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Vista de Imagen */}
      {showImageModal && selectedCategoria && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={() => setShowImageModal(false)}>
          <div className="relative max-w-4xl max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute -top-10 right-0 p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <img
              src={getImagenUrl(selectedCategoria.imagenCategoria)}
              alt={selectedCategoria.nombreCategoria}
              className="max-w-full max-h-[80vh] object-contain rounded-lg"
              onError={(e) => { e.target.src = '/placeholder.png'; }}
            />

            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 rounded-b-lg">
              <h3 className="text-white text-xl font-semibold">{selectedCategoria.nombreCategoria}</h3>
              <p className="text-white/80 text-sm mt-1">
                {selectedCategoria.descripcion || 'Sin descripción'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Explorador de Productos por Categoría (Drill-down) */}
      <CategoryDrilldownDrawer 
        isOpen={isDrilldownOpen}
        onClose={() => setIsDrilldownOpen(false)}
        categoria={drilldownCategory}
      />
    </div>
  );
}
