import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package,
  Search,
  Edit,
  Trash2,
  Plus,
  RefreshCcw,
  Filter,
  X,
  DollarSign,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Loader2,
  AlertCircle,
  CheckCircle,
  Grid3x3,
  List,
  ArrowUpDown,
  Box,
  Tag,
  TrendingUp,
  TrendingDown,
  Minus,
  Palette,
  Ruler,
  Layers,
  ToggleLeft,
  ToggleRight,
  Camera,
  Upload
} from 'lucide-react';
import { productosApi } from '../../../api/productosApi';
import { categoriasApi } from '../../../api/categoriasApi';
import { proveedoresApi } from '../../../api/proveedoresApi';
import { coloresApi } from '../../../api/coloresApi';
import { tallasApi } from '../../../api/tallasApi';
import { imagenesApi } from '../../../api/imagenesApi';
import PrecioFormateado from '../../../components/common/PrecioFormateado';
import ProductosWizard from '../../../components/admin/ProductosWizard';
import { useAuth } from "../../../context/AuthContext";
import getImagenURL from '../../../utils/imageUrl';

export default function ProductosPage() {
  const navigate = useNavigate();
  const { token } = useAuth();

  // Función para construir URLs completas de imágenes
  const getImagenUrl = (imagenPath) => {
    if (!imagenPath) return '/placeholder.png';
    return getImagenURL(imagenPath) || '/placeholder.png';
  };

  // Estados principales
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [proveedores, setProveedores] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [mostrarDetalles, setMostrarDetalles] = useState(false);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [productoEditando, setProductoEditando] = useState(null);

  // Estados de búsqueda y filtros
  const [busqueda, setBusqueda] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('todos');
  const [filtroProveedor, setFiltroProveedor] = useState('todos');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  // Estados de paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const [productosPorPagina] = useState(12);

  // Estados de imágenes
  const [mostrarGaleriaImagenes, setMostrarGaleriaImagenes] = useState(false);
  const [galleryImages, setGalleryImages] = useState([]);
  const [isGalleryUploading, setIsGalleryUploading] = useState(false);
  const [viewingImage, setViewingImage] = useState(null);
  const [imagenPrincipalUrl, setImagenPrincipalUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Función para obtener productos
  const fetchProductos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await productosApi.obtenerProductos();

      let productosData = [];

      if (response && response.datos && Array.isArray(response.datos)) {
        productosData = response.datos;
      } else if (response && response.data && Array.isArray(response.data)) {
        productosData = response.data;
      } else if (Array.isArray(response)) {
        productosData = response;
      }

      const productosValidos = productosData.filter(producto =>
        producto && typeof producto === 'object' && producto.idProducto !== undefined
      );

      setProductos(productosValidos);
    } catch (err) {
      console.error('Error al obtener productos:', err);
      const errorMessage = err?.mensaje || err?.message || 'Error al obtener productos';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Función para obtener datos relacionados
  const fetchDatosRelacionados = useCallback(async () => {
    try {
      const [categoriasRes, proveedoresRes] = await Promise.all([
        categoriasApi.obtenerTodasLasCategorias(),
        proveedoresApi.listarProveedores()
      ]);

      setCategorias(categoriasRes?.datos || categoriasRes || []);
      setProveedores(proveedoresRes?.datos || proveedoresRes || []);
    } catch (err) {
      console.error('Error al obtener datos relacionados:', err);
    }
  }, []);

  // Filtrado
  const productosFiltrados = productos.filter((producto) => {
    if (!producto) return false;

    const nombre = producto?.nombreProducto || '';
    const codigo = producto?.codigoReferencia || '';
    const categoria = producto?.categoria?.nombreCategoria || '';
    const proveedor = producto?.proveedor?.nombreProveedor || '';
    const estado = producto?.estado || '';

    const busquedaLower = busqueda.toLowerCase();
    const coincideBusqueda =
      nombre.toLowerCase().includes(busquedaLower) ||
      codigo.toLowerCase().includes(busquedaLower);

    const coincideCategoria = filtroCategoria === 'todos' || producto.idCategoria === parseInt(filtroCategoria);
    const coincideProveedor = filtroProveedor === 'todos' || producto.idProveedor === parseInt(filtroProveedor);
    const coincideEstado = filtroEstado === 'todos' || estado === filtroEstado;

    return coincideBusqueda && coincideCategoria && coincideProveedor && coincideEstado;
  });

  // Paginación
  const totalPaginas = Math.ceil(productosFiltrados.length / productosPorPagina);
  const productosPaginados = productosFiltrados.slice(
    (paginaActual - 1) * productosPorPagina,
    paginaActual * productosPorPagina
  );

  // Cargar datos al iniciar
  useEffect(() => {
    fetchProductos();
    fetchDatosRelacionados();
  }, [fetchProductos, fetchDatosRelacionados]);

  // Efecto para gestionar los datos del formulario de producto
  useEffect(() => {
    if (mostrarFormulario) {
      if (productoEditando) {
        setImagenPrincipalUrl(productoEditando.imagenPrincipal || '');
      } else {
        setImagenPrincipalUrl('');
      }
    }
  }, [mostrarFormulario, productoEditando]);

  // Función para manejar la carga de la imagen principal
  const handleImagenUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const response = await productosApi.uploadImagenProducto(file);
      if (response && response.url) {
        setImagenPrincipalUrl(response.url);
      }
    } catch (error) {
      console.error("Error al subir la imagen:", error);
      alert(error?.mensaje || error?.message || "Error al subir la imagen");
    } finally {
      setIsUploading(false);
    }
  };

  const refetchProductDetails = async (idProducto) => {
    try {
      const refreshedProduct = await productosApi.getProductoById(idProducto);
      const productData = refreshedProduct.datos || refreshedProduct.data || refreshedProduct;
      setProductoSeleccionado(productData);
      setGalleryImages(productData.imagenes || []);
    } catch (error) {
      console.error("Error al recargar los detalles del producto:", error);
      alert("No se pudieron actualizar los detalles del producto.");
    }
  };

  const handleGalleryImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file || !productoSeleccionado) return;

    setIsGalleryUploading(true);
    try {
      const formData = new FormData();
      formData.append('imagen', file);
      await imagenesApi.createImagenProducto(productoSeleccionado.idProducto, formData);
      await refetchProductDetails(productoSeleccionado.idProducto);
    } catch (error) {
      console.error("Error al subir imagen a la galería:", error);
      alert(error?.mensaje || error?.message || "Error al subir la imagen.");
    } finally {
      setIsGalleryUploading(false);
    }
  };

  const handleDeleteImage = async (idImagen) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar esta imagen?")) return;

    try {
      await imagenesApi.deleteImagenProducto(idImagen);
      await refetchProductDetails(productoSeleccionado.idProducto);
      await fetchProductos();
    } catch (error) {
      console.error("Error al eliminar la imagen:", error);
      alert(error?.mensaje || error?.message || "Error al eliminar la imagen.");
    }
  };

  const handleSetPrincipal = async (idImagen) => {
    if (!window.confirm("¿Deseas establecer esta imagen como la principal del producto?")) return;

    try {
      await imagenesApi.setImagenPrincipal(idImagen);
      await refetchProductDetails(productoSeleccionado.idProducto);
      await fetchProductos();
    } catch (error) {
      console.error("Error al establecer la imagen principal:", error);
      alert(error?.mensaje || error?.message || "Error al establecer la imagen principal.");
    }
  };

  // Función para cambiar estado
  const cambiarEstadoProducto = async (idProducto, nuevoEstado) => {
    try {
      await productosApi.updateProducto(idProducto, { estado: nuevoEstado });
      await fetchProductos();
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      const errorMessage = error?.mensaje || error?.message || 'Error al cambiar el estado del producto';
      alert(errorMessage);
    }
  };

  // Función para eliminar producto
  const eliminarProducto = async (idProducto) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este producto? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      await productosApi.deleteProducto(idProducto);
      await fetchProductos();
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      const errorMessage = error?.mensaje || error?.message || 'Error al eliminar el producto';
      alert(errorMessage);
    }
  };

  // Función para abrir el modal de nuevo producto
  const handleOpenModal = () => {
    setProductoEditando(null);
    setMostrarFormulario(true);
  };

  // Componentes auxiliares
  const BadgeEstado = ({ estado }) => {
    const getEstadoStyle = (estado) => {
      switch (estado?.toLowerCase()) {
        case 'activo': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
        case 'inactivo': return 'bg-gray-100 text-gray-800 dark:bg-slate-700 dark:text-gray-300';
        case 'descontinuado': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
        default: return 'bg-gray-100 text-gray-800 dark:bg-slate-700 dark:text-gray-300';
      }
    };

    const getEstadoIcon = (estado) => {
      switch (estado?.toLowerCase()) {
        case 'activo': return <CheckCircle className="w-3 h-3" />;
        case 'inactivo': return <ToggleLeft className="w-3 h-3" />;
        case 'descontinuado': return <X className="w-3 h-3" />;
        default: return <AlertCircle className="w-3 h-3" />;
      }
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEstadoStyle(estado)}`}>
        {getEstadoIcon(estado)}
        <span className="ml-1">{estado || 'Sin estado'}</span>
      </span>
    );
  };

  // Componentes auxiliares para el modal de detalles
  const Info = ({ label, value, mono = false }) => (
    <div>
      <span className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">{label}</span>
      <p className={`text-gray-900 dark:text-gray-100 ${mono ? 'font-mono' : ''}`}>{value}</p>
    </div>
  );

  const InfoBox = ({ label, value }) => (
    <div>
      <span className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">{label}</span>
      <p className="text-gray-900 dark:text-gray-100">{value}</p>
    </div>
  );

  const Feature = ({ active, label }) => (
    <div className="flex items-center gap-2">
      {active ? (
        <CheckCircle className="w-5 h-5 text-green-600" />
      ) : (
        <X className="w-5 h-5 text-gray-400" />
      )}
      <span className={`text-sm ${active ? 'text-gray-900' : 'text-gray-500'}`}>
        {label}
      </span>
    </div>
  );

  const DateInfo = ({ label, date }) => (
    <div>
      <span className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">{label}</span>
      <p className="text-gray-900 dark:text-gray-100">
        {date ? new Date(date).toLocaleString('es-ES') : 'No disponible'}
      </p>
    </div>
  );

  const ProductoCard = ({ producto }) => {
    const imagenUrl = getImagenUrl(producto.imagenPrincipal);
    const totalStock = producto.variantes?.reduce((acc, v) => acc + (Number(v.cantidadStock) || 0), 0) || 0;
    const totalVariantes = producto.variantes?.length || 0;

    return (
      <div className="card-3d card-elevated bg-white dark:bg-slate-800/60 rounded-xl border border-gray-200 dark:border-slate-700/50 hover:border-blue-300 dark:hover:border-blue-500 transition-all duration-300 overflow-hidden">
        {/* Imagen del producto */}
        <div className="relative h-48 bg-gray-100 overflow-hidden">
          <img
            src={imagenUrl}
            alt={producto.nombreProducto}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = '/placeholder.png';
            }}
          />

          {/* Badge de estado */}
          <div className="absolute top-2 right-2">
            <BadgeEstado estado={producto.estado} />
          </div>

          {/* Indicadores de variantes */}
          <div className="absolute top-2 left-2 flex gap-1">
            {producto.tieneColores && (
              <div className="bg-white/90 backdrop-blur-sm rounded-full p-1.5" title="Tiene colores">
                <Palette className="w-3 h-3 text-purple-600" />
              </div>
            )}
            {producto.tieneTallas && (
              <div className="bg-white/90 backdrop-blur-sm rounded-full p-1.5" title="Tiene tallas">
                <Ruler className="w-3 h-3 text-blue-600" />
              </div>
            )}
          </div>
        </div>

        {/* Información del producto */}
        <div className="p-4">
          <div className="mb-3">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-lg leading-tight mb-1">
              {producto.nombreProducto}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">
              {producto.codigoReferencia}
            </p>
          </div>

          {/* Categoría y Proveedor */}
          <div className="space-y-1 mb-3">
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <Tag className="w-3 h-3 mr-1.5 text-gray-400" />
              {producto.categoria?.nombreCategoria || 'Sin categoría'}
            </div>
            {producto.proveedor && (
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <Box className="w-3 h-3 mr-1.5 text-gray-400" />
                {producto.proveedor.nombreProveedor}
              </div>
            )}
          </div>

          {/* Stock y Variantes */}
          <div className="flex items-center justify-between mb-4 px-3 py-2 bg-slate-50 dark:bg-slate-700/30 rounded-xl border border-slate-100 dark:border-slate-700/50">
            <div className="flex flex-col">
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Stock Total</span>
               <span className={`text-sm font-black ${totalStock > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}`}>
                  {totalStock} {producto.unidadMedida || 'unidades'}
               </span>
            </div>
            <div className="h-8 w-px bg-slate-200 dark:bg-slate-700" />
            <div className="flex flex-col items-end">
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Variantes</span>
               <span className="text-sm font-black text-slate-700 dark:text-slate-300">
                  {totalVariantes} {totalVariantes === 1 ? 'Opción' : 'Opciones'}
               </span>
            </div>
          </div>

          {/* Acciones */}
          <div className="grid grid-cols-2 gap-2">
            <button
              title="Ver detalles"
              onClick={() => {
                setProductoSeleccionado(producto);
                setMostrarDetalles(true);
              }}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 text-sm font-medium transition-colors"
            >
              <Eye className="w-4 h-4" />
              Detalles
            </button>

            <button
              title="Gestionar variantes"
              onClick={() => navigate(`/admin/productos/${producto.idProducto}/variantes`)}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-600 text-sm font-medium transition-colors"
            >
              <Layers className="w-4 h-4" />
              Variantes
            </button>
          </div>

          {/* Acciones secundarias */}
          <div className="grid grid-cols-2 gap-2 mt-2">
            <button
              title="Editar"
              onClick={() => {
                setProductoEditando(producto);
                setMostrarFormulario(true);
              }}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-gray-50 dark:bg-slate-700 hover:bg-gray-100 dark:hover:bg-slate-600 text-gray-600 dark:text-gray-300 text-sm font-medium transition-colors"
            >
              <Edit className="w-4 h-4" />
              Editar
            </button>

            <button
              title={producto.estado === 'activo' ? 'Desactivar' : 'Activar'}
              onClick={() => {
                const nuevoEstado = producto.estado === 'activo' ? 'inactivo' : 'activo';
                if (window.confirm(`¿Estás seguro de que deseas ${nuevoEstado === 'activo' ? 'activar' : 'desactivar'} el producto "${producto.nombreProducto}"?`)) {
                  cambiarEstadoProducto(producto.idProducto, nuevoEstado);
                }
              }}
              className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                producto.estado === 'activo'
                  ? 'bg-red-50 hover:bg-red-100 text-red-600'
                  : 'bg-green-50 hover:bg-green-100 text-green-600'
              }`}
            >
              {producto.estado === 'activo' ? (
                <>
                  <ToggleLeft className="w-4 h-4" />
                  Desactivar
                </>
              ) : (
                <>
                  <ToggleRight className="w-4 h-4" />
                  Activar
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
      <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Package className="w-6 h-6" />
                Gestión de Productos
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Administra el catálogo completo de productos
              </p>
            </div>

            <button
              onClick={() => handleOpenModal()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Nuevo Producto
            </button>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Barra de herramientas */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Búsqueda */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por nombre o código..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setMostrarFiltros(!mostrarFiltros)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition ${
                  mostrarFiltros
                    ? 'bg-gray-100 border-gray-300'
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                <Filter className="w-4 h-4" />
                Filtros
                {(filtroCategoria !== 'todos' || filtroProveedor !== 'todos' || filtroEstado !== 'todos') && (
                  <span className="ml-1 bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                    {(filtroCategoria !== 'todos' ? 1 : 0) + (filtroProveedor !== 'todos' ? 1 : 0) + (filtroEstado !== 'todos' ? 1 : 0)}
                  </span>
                )}
              </button>

              <button
                onClick={fetchProductos}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition"
              >
                <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Actualizar
              </button>
            </div>
          </div>

          {/* Panel de filtros */}
          {mostrarFiltros && (
            <div className="bg-white rounded-lg border border-gray-200 p-6 mt-4">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
                <div className="flex items-end gap-4 flex-1 flex-wrap">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                    <select
                      value={filtroCategoria}
                      onChange={(e) => setFiltroCategoria(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="todos">Todas las categorías</option>
                      {categorias.map(categoria => (
                        <option key={categoria.idCategoria} value={categoria.idCategoria}>
                          {categoria.nombreCategoria}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Proveedor</label>
                    <select
                      value={filtroProveedor}
                      onChange={(e) => setFiltroProveedor(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="todos">Todos los proveedores</option>
                      <option value="">Sin proveedor</option>
                      {proveedores.map(proveedor => (
                        <option key={proveedor.idProveedor} value={proveedor.idProveedor}>
                          {proveedor.nombreProveedor}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                    <select
                      value={filtroEstado}
                      onChange={(e) => setFiltroEstado(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="todos">Todos los estados</option>
                      <option value="activo">Activo</option>
                      <option value="inactivo">Inactivo</option>
                      <option value="descontinuado">Descontinuado</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setBusqueda('');
                    setFiltroCategoria('todos');
                    setFiltroProveedor('todos');
                    setFiltroEstado('todos');
                  }}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition"
                >
                  <X className="w-4 h-4" />
                  Limpiar filtros
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Estados */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin h-8 w-8 border-b-2 border-blue-600 rounded-full" />
            <span className="ml-3 text-gray-500">Cargando productos...</span>
          </div>
        )}

        {error && (
          <div className="p-4 border border-red-300 bg-red-50 rounded-lg text-red-700">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium">Error:</span>
              {error}
            </div>
          </div>
        )}

        {!loading && !error && productosFiltrados.length === 0 && (
          <div className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-gray-500">
              {busqueda || filtroCategoria !== 'todos' || filtroProveedor !== 'todos' || filtroEstado !== 'todos'
                ? 'No se encontraron productos con los filtros aplicados'
                : 'No hay productos registrados'}
            </p>
            {(busqueda || filtroCategoria !== 'todos' || filtroProveedor !== 'todos' || filtroEstado !== 'todos') && (
              <button
                onClick={() => {
                  setBusqueda('');
                  setFiltroCategoria('todos');
                  setFiltroProveedor('todos');
                  setFiltroEstado('todos');
                }}
                className="mt-2 text-sm text-blue-600 hover:text-blue-800 underline"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        )}

        {/* Grid de productos */}
        {!loading && !error && productosFiltrados.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {productosPaginados.map((producto) => (
                <ProductoCard
                  key={producto.idProducto}
                  producto={producto}
                />
              ))}
            </div>

            {/* Paginación */}
            {totalPaginas > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <button
                  onClick={() => setPaginaActual(paginaActual - 1)}
                  disabled={paginaActual === 1}
                  className="px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Anterior
                </button>

                <div className="flex gap-1">
                  {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(pagina => (
                    <button
                      key={pagina}
                      onClick={() => setPaginaActual(pagina)}
                      className={`px-3 py-2 rounded-lg transition ${
                        pagina === paginaActual
                          ? 'bg-blue-600 text-white'
                          : 'border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {pagina}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setPaginaActual(paginaActual + 1)}
                  disabled={paginaActual === totalPaginas}
                  className="px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Siguiente
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal de detalles del producto */}
      {mostrarDetalles && productoSeleccionado && (
        <div
          className="fixed inset-0 z-[50] bg-black/60 flex items-center justify-center p-4"
          onClick={() => {
            setMostrarDetalles(false);
            setProductoSeleccionado(null);
          }}
        >
          {/* Contenedor modal */}
          <div
            className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b dark:border-slate-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Detalles del Producto
              </h2>
              <button
                onClick={() => {
                  setMostrarDetalles(false);
                  setProductoSeleccionado(null);
                }}
                className="p-2 rounded-full hover:bg-gray-100 transition"
                aria-label="Cerrar"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-72px)]">
              {/* Sección superior */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Galería */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Imágenes del Producto
                    </span>

                    <button
                      onClick={() => {
                        setGalleryImages(productoSeleccionado.imagenes ?? []);
                        setMostrarGaleriaImagenes(true);
                      }}
                      className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-800"
                    >
                      <Camera className="w-4 h-4" />
                      Ver galería
                    </button>
                  </div>

                  <div className="relative h-64 rounded-xl overflow-hidden bg-gray-100 dark:bg-slate-900 group">
                    <img
                      src={getImagenUrl(productoSeleccionado.imagenPrincipal)}
                      alt={productoSeleccionado.nombreProducto}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.png";
                      }}
                    />

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                      <button
                        onClick={() => {
                          setGalleryImages(productoSeleccionado.imagenes ?? []);
                          setMostrarGaleriaImagenes(true);
                        }}
                        className="bg-white text-gray-900 px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-gray-100"
                      >
                        <Grid3x3 className="w-5 h-5" />
                        Ver todas
                      </button>
                    </div>
                  </div>
                </div>

                {/* Información básica */}
                <div className="space-y-4">
                  <Info label="Nombre" value={productoSeleccionado.nombreProducto} />
                  <Info
                    label="Código de Referencia"
                    value={productoSeleccionado.codigoReferencia}
                    mono
                  />
                  <Info
                    label="Descripción"
                    value={productoSeleccionado.descripcion || "Sin descripción"}
                  />

                  <div>
                    <span className="block text-sm font-medium text-gray-700 mb-1">
                      Precio Venta Sugerido
                    </span>
                    <p className="text-2xl font-bold text-green-600">
                      <PrecioFormateado
                        precio={productoSeleccionado.precioVentaSugerido}
                      />
                    </p>
                  </div>

                  <Info
                    label="Unidad de Medida"
                    value={productoSeleccionado.unidadMedida}
                  />

                  {/* Resumen de Inventario en Detalles */}
                  <div className="p-4 rounded-2xl bg-pink-50 dark:bg-pink-900/20 border border-pink-100 dark:border-pink-800/30 flex gap-6">
                    <div className="flex-1 text-center border-r border-pink-200 dark:border-pink-800/50">
                       <span className="block text-[10px] font-black text-pink-500 uppercase tracking-widest mb-1">Stock Disponible</span>
                       <span className="text-xl font-black text-pink-900 dark:text-pink-100">
                         {productoSeleccionado.variantes?.reduce((acc, v) => acc + (Number(v.cantidadStock) || 0), 0) || 0}
                       </span>
                    </div>
                    <div className="flex-1 text-center">
                       <span className="block text-[10px] font-black text-pink-500 uppercase tracking-widest mb-1">Variantes Activas</span>
                       <span className="text-xl font-black text-pink-900 dark:text-pink-100">
                         {productoSeleccionado.variantes?.length || 0}
                       </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Información adicional */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
                <InfoBox
                  label="Categoría"
                  value={productoSeleccionado.categoria?.nombreCategoria || "Sin categoría"}
                />
                <InfoBox
                  label="Proveedor"
                  value={productoSeleccionado.proveedor?.nombreProveedor || "Sin proveedor"}
                />
                <div>
                  <span className="block text-sm font-medium text-gray-700 mb-3">
                    Estado
                  </span>
                  <BadgeEstado estado={productoSeleccionado.estado} />
                </div>
              </div>

              {/* Características */}
              <div className="mt-8">
                <span className="block text-sm font-medium text-gray-700 mb-3">
                  Características
                </span>
                <div className="flex gap-6">
                  <Feature
                    active={productoSeleccionado.tieneColores}
                    label="Tiene colores"
                  />
                  <Feature
                    active={productoSeleccionado.tieneTallas}
                    label="Tiene tallas"
                  />
                </div>
              </div>

              {/* Fechas */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                <DateInfo
                  label="Fecha de Creación"
                  date={productoSeleccionado.creadoEn}
                />
                <DateInfo
                  label="Última Actualización"
                  date={productoSeleccionado.actualizadoEn}
                />
              </div>

              {/* Variantes y sus Imágenes */}
              {productoSeleccionado.variantes && productoSeleccionado.variantes.length > 0 && (
                <div className="mt-10 border-t pt-8">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                    <Layers className="w-5 h-5 text-purple-600" />
                    Detalle de Variantes y Stock
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {productoSeleccionado.variantes.map((variante) => (
                      <div 
                        key={variante.idVariante}
                        className="bg-gray-50 dark:bg-slate-700/50 rounded-xl p-4 border border-gray-100 dark:border-slate-700"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <span className="text-sm font-black text-slate-700 dark:text-slate-200">
                              {variante.color?.nombreColor || 'Sin Color'} / {variante.talla?.nombreTalla || 'Sin Talla'}
                            </span>
                            <span className="block text-[10px] font-mono text-slate-400 mt-0.5">SKU: {variante.codigoSku}</span>
                          </div>
                          <div className="text-right">
                             <span className={`text-xs font-black px-2 py-1 rounded-lg ${Number(variante.cantidadStock) > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                               Stock: {Number(variante.cantidadStock)}
                             </span>
                          </div>
                        </div>

                        {/* Mini Galería de Variante */}
                        <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                          {variante.imagenesVariantes && variante.imagenesVariantes.length > 0 ? (
                            variante.imagenesVariantes.map((img) => (
                              <div 
                                key={img.idImagenVariante}
                                className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200 bg-white shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                                onClick={() => setViewingImage(img.rutaImagen)}
                              >
                                <img 
                                  src={getImagenUrl(img.rutaImagen)} 
                                  alt="Variante" 
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ))
                          ) : (
                            <div className="w-16 h-16 rounded-lg border border-dashed border-gray-300 flex items-center justify-center bg-white shrink-0">
                               <ImageIcon className="w-4 h-4 text-gray-300" />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Wizard para crear/editar productos */}
      <ProductosWizard
        isOpen={mostrarFormulario}
        onClose={() => {
          setMostrarFormulario(false);
          setProductoEditando(null);
        }}
        producto={productoEditando}
        onSuccess={() => {
          fetchProductos();
        }}
      />

      {/* Modal de galería de imágenes */}
      {mostrarGaleriaImagenes && productoSeleccionado && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Galería de Imágenes</h2>
                <button
                  onClick={() => setMostrarGaleriaImagenes(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <p className="text-gray-600 mt-1">{productoSeleccionado.nombreProducto}</p>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {galleryImages.map((imagen) => (
                  <div key={imagen.idImagen} className="relative group">
                    <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={getImagenUrl(imagen.rutaImagen)}
                        alt={`Imagen ${imagen.idImagen}`}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.src = '/placeholder.png'; }}
                      />
                    </div>
                    {imagen.esPrincipal && (
                      <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                        Principal
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                      <button
                        onClick={() => setViewingImage(imagen.rutaImagen)}
                        className="bg-white/80 text-gray-900 p-2 rounded-full hover:bg-white transition"
                        title="Ver imagen"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteImage(imagen.idImagen)}
                        className="bg-red-600/80 text-white p-2 rounded-full hover:bg-red-600 transition"
                        title="Eliminar imagen"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      {!imagen.esPrincipal && (
                        <button
                          onClick={() => handleSetPrincipal(imagen.idImagen)}
                          className="bg-blue-600/80 text-white p-2 rounded-full hover:bg-blue-600 transition"
                          title="Marcar como principal"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {/* Botón para agregar más imágenes */}
                <div className="aspect-square bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-gray-400 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleGalleryImageUpload}
                    className="hidden"
                    id="gallery-image-upload"
                    disabled={isGalleryUploading}
                  />
                  <label htmlFor="gallery-image-upload" className={`cursor-pointer text-center ${isGalleryUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    {isGalleryUploading ? (
                      <div className="animate-spin h-8 w-8 border-b-2 border-blue-600 rounded-full mx-auto mb-2" />
                    ) : (
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    )}
                    <span className="text-sm text-gray-600">
                      {isGalleryUploading ? 'Subiendo...' : 'Agregar imagen'}
                    </span>
                  </label>
                </div>
              </div>
            </div>

            <div className="p-6 border-t flex justify-end">
              <button
                onClick={() => setMostrarGaleriaImagenes(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de vista de imagen */}
      {viewingImage && (
        <div
          className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-4"
          onClick={() => setViewingImage(null)}
        >
          {/* Contenedor para evitar cierre al hacer click en la imagen */}
          <div
            className="relative max-w-full max-h-full"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={getImagenUrl(viewingImage)}
              alt="Vista ampliada"
              className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl"
            />

            {/* Botón cerrar */}
            <button
              onClick={() => setViewingImage(null)}
              className="absolute -top-4 -right-4 bg-black/70 hover:bg-black text-white rounded-full w-10 h-10 flex items-center justify-center text-2xl font-bold"
              aria-label="Cerrar"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
}