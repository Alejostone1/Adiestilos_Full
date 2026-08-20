import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Layers,
  Search,
  Edit,
  Trash2,
  Plus,
  RefreshCcw,
  Filter,
  X,
  DollarSign,
  Package,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Loader2,
  AlertCircle,
  CheckCircle,
  Grid3X3,
  Grid,
  List,
  ArrowUpDown,
  ArrowRight,
  Box,
  Tag,
  TrendingUp,
  TrendingDown,
  Minus,
  ToggleLeft,
  ToggleRight,
  Ruler
} from 'lucide-react';
import { productosApi } from "../../../api/productosApi";
import { variantesApi } from "../../../api/variantesApi";
import { coloresApi } from "../../../api/coloresApi";
import { tallasApi } from "../../../api/tallasApi";
import { imagenesApi } from "../../../api/imagenesApi";
import { categoriasApi } from "../../../api/categoriasApi";
import PrecioFormateado from '../../../components/common/PrecioFormateado';
import { proveedoresApi } from "../../../api/proveedoresApi";
import { useAuth } from "../../../context/AuthContext";

// Importar componentes personalizados
import VariantImageGallery from '../../../components/admin/VariantImageGallery';
import ColorSwatch from '../../../components/admin/ColorSwatch';
import StatusBadge from '../../../components/admin/StatusBadge';
import StockIndicator from '../../../components/admin/StockIndicator';
import VariantDetailModal from '../../../components/admin/VariantDetailModal';

export default function VariantesPage() {
  const navigate = useNavigate();
  const { token } = useAuth();

  // Función para construir URLs completas de imágenes
  const getImagenUrl = (imagenPath) => {
    if (!imagenPath) return '/placeholder.png';

    if (imagenPath.startsWith('http')) {
      return imagenPath;
    }

    return imagenPath;
  };

  // Estados principales
  const [variantes, setVariantes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [colores, setColores] = useState([]);
  const [tallas, setTallas] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados de búsqueda y filtros
  const [busqueda, setBusqueda] = useState('');
  const [filtroProducto, setFiltroProducto] = useState('todos');
  const [filtroColor, setFiltroColor] = useState('todos');
  const [filtroTalla, setFiltroTalla] = useState('todos');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  // Estados de paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const [variantesPorPagina] = useState(15);
  const [viewMode, setViewMode] = useState('table'); // 'table' o 'grid'

  // Estados para el modal de detalles
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedProvider, setSelectedProvider] = useState(null);

  // Función para obtener todas las variantes
  const fetchVariantes = useCallback(async () => {
    try {
      const response = await variantesApi.getVariantes();
      let variantesData = [];

      if (response && response.datos && Array.isArray(response.datos)) {
        variantesData = response.datos;
      } else if (response && response.data && Array.isArray(response.data)) {
        variantesData = response.data;
      } else if (Array.isArray(response)) {
        variantesData = response;
      }

      // Cargar imágenes para cada variante
      const variantesConImagenes = await Promise.all(
        variantesData.map(async (variante) => {
          try {
            const imagenesResponse = await imagenesApi.getImagenesVariante(variante.idVariante);
            const imagenesData = imagenesResponse.datos || imagenesResponse.data || imagenesResponse;
            return {
              ...variante,
              imagenesVariantes: Array.isArray(imagenesData) ? imagenesData : []
            };
          } catch (err) {
            console.error('Error al cargar imágenes de la variante:', err);
            return {
              ...variante,
              imagenesVariantes: []
            };
          }
        })
      );

      setVariantes(variantesConImagenes);
    } catch (err) {
      console.error('Error al obtener variantes:', err);
      setVariantes([]);
    }
  }, []);

  // Función para obtener productos
  const fetchProductos = useCallback(async () => {
    try {
      const response = await productosApi.obtenerProductos();
      const productosData = response.datos || response.data || response;
      setProductos(Array.isArray(productosData) ? productosData : []);
      setProductos(productosData);
    } catch (err) {
      console.error('Error al obtener productos:', err);
      setProductos([]);
    }
  }, []);

  // Función para cargar datos relacionados del modal
  const fetchRelatedData = useCallback(async (variante) => {
    try {
      // Obtener producto
      const productResponse = await productosApi.getProductoById(variante.idProducto);
      const productoData = productResponse.datos || productResponse.data || productResponse;
      setSelectedProduct(productoData);

      // Obtener categoría si existe
      if (productoData?.idCategoria) {
        const categoryResponse = await categoriasApi.getCategoriaById(productoData.idCategoria);
        const categoryData = categoryResponse.datos || categoryResponse.data || categoryResponse;
        setSelectedCategory(categoryData);
      }

      // Obtener proveedor si existe
      if (productoData?.idProveedor) {
        const providerResponse = await proveedoresApi.obtenerProveedorById(productoData.idProveedor);
        const providerData = providerResponse.datos || providerResponse.data || providerResponse;
        setSelectedProvider(providerData);
      }

      // Obtener imágenes del producto
      if (productoData?.idProducto) {
        const imagesResponse = await imagenesApi.getImagenesProducto(productoData.idProducto);
        const imagesData = imagesResponse.datos || imagesResponse.data || imagesResponse;
        setSelectedProduct(prev => ({
          ...prev,
          imagenesProductos: Array.isArray(imagesData) ? imagesData : []
        }));
      }
    } catch (err) {
      console.error('Error al cargar datos relacionados:', err);
    }
  }, []);

  // Función para abrir el modal de detalles
  const openDetailModal = async (variante) => {
    setSelectedVariant(variante);
    await fetchRelatedData(variante);
    setShowDetailModal(true);
  };

  // Función para cerrar el modal
  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedVariant(null);
    setSelectedProduct(null);
    setSelectedCategory(null);
    setSelectedProvider(null);
  };

  // Función para obtener datos relacionados
  const fetchDatosRelacionados = useCallback(async () => {
    try {
      const [coloresRes, tallasRes] = await Promise.all([
        coloresApi.getColores(),
        tallasApi.getTallas()
      ]);

      setColores(coloresRes?.datos || coloresRes || []);
      setTallas(tallasRes?.datos || tallasRes || []);
    } catch (err) {
      console.error('Error al obtener datos relacionados:', err);
    }
  }, []);

  // Filtrado de variantes
  const variantesFiltradas = variantes.filter((variante) => {
    if (!variante) return false;

    const sku = variante?.codigoSku || '';
    const producto = variante?.producto?.nombreProducto || '';
    const color = variante?.color?.nombreColor || '';
    const talla = variante?.talla?.nombreTalla || '';
    const estado = variante?.estado || '';

    const busquedaLower = busqueda.toLowerCase();
    const coincideBusqueda =
      sku.toLowerCase().includes(busquedaLower) ||
      producto.toLowerCase().includes(busquedaLower) ||
      color.toLowerCase().includes(busquedaLower) ||
      talla.toLowerCase().includes(busquedaLower);

    const coincideProducto = filtroProducto === 'todos' || variante.idProducto === parseInt(filtroProducto);
    const coincideColor = filtroColor === 'todos' || variante.idColor === parseInt(filtroColor);
    const coincideTalla = filtroTalla === 'todos' || variante.idTalla === parseInt(filtroTalla);
    const coincideEstado = filtroEstado === 'todos' || estado === filtroEstado;

    return coincideBusqueda && coincideProducto && coincideColor && coincideTalla && coincideEstado;
  });

  // Paginación
  const totalPaginas = Math.ceil(variantesFiltradas.length / variantesPorPagina);
  const variantesPaginadas = variantesFiltradas.slice(
    (paginaActual - 1) * variantesPorPagina,
    paginaActual * variantesPorPagina
  );

  // Cargar datos al iniciar
  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchVariantes(),
      fetchProductos(),
      fetchDatosRelacionados()
    ]).finally(() => {
      setLoading(false);
    });
  }, [fetchVariantes, fetchProductos, fetchDatosRelacionados]);

  // Componentes auxiliares
  const BadgeEstado = ({ estado }) => {
    const getEstadoStyle = (estado) => {
      switch (estado?.toLowerCase()) {
          case 'activo': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
          case 'inactivo': return 'bg-gray-100 text-gray-800 dark:bg-slate-700 dark:text-gray-300';
          default: return 'bg-gray-100 text-gray-800 dark:bg-slate-700 dark:text-gray-300';
      }
    };

    const getEstadoIcon = (estado) => {
      switch (estado?.toLowerCase()) {
        case 'activo': return <CheckCircle className="w-3 h-3" />;
        case 'inactivo': return <ToggleLeft className="w-3 h-3" />;
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

  // Función para eliminar variante
  const eliminarVariante = async (idVariante) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta variante? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      await variantesApi.deleteVariante(idVariante);
      await fetchVariantes();
    } catch (error) {
      console.error('Error al eliminar variante:', error);
      const errorMessage = error?.mensaje || error?.message || 'Error al eliminar la variante';
      alert(errorMessage);
    }
  };

  // Función para cambiar estado de variante
  const cambiarEstadoVariante = async (idVariante, nuevoEstado) => {
    try {
      await variantesApi.updateVariante(idVariante, { estado: nuevoEstado });
      await fetchVariantes();
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      const errorMessage = error?.mensaje || error?.message || 'Error al cambiar el estado de la variante';
      alert(errorMessage);
    }
  };

  // Obtener información del producto
  const getProductoInfo = (idProducto) => {
    return productos.find(p => p.idProducto === idProducto);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center transition-colors duration-300">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-b-2 border-purple-600 rounded-full mx-auto" />
          <span className="ml-3 text-gray-500 dark:text-gray-400">Cargando variantes...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="p-4 border border-red-300 dark:border-red-900/50 bg-red-50 dark:bg-red-900/20 rounded-lg text-red-700 dark:text-red-400 max-w-md">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium">Error:</span>
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 p-6 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Layers className="w-8 h-8 text-purple-600" />
            <div>
              <h1 className="text-3xl font-semibold text-gray-900 dark:text-white">Gestión de Variantes</h1>
              <p className="text-gray-600 dark:text-gray-400">Panel administrativo para gestión completa de variantes de productos</p>
            </div>
          </div>

          {/* Estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <div className="card-3d card-elevated bg-white dark:bg-slate-800/60 rounded-lg border border-gray-200 dark:border-slate-700/50 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Total Variantes</span>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">{variantes.length}</p>
                </div>
                <Layers className="w-8 h-8 text-purple-600 opacity-20" />
              </div>
            </div>
            <div className="card-3d card-elevated bg-white dark:bg-slate-800/60 rounded-lg border border-gray-200 dark:border-slate-700/50 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Activas</span>
                  <p className="text-2xl font-semibold text-green-600 dark:text-green-400">
                    {variantes.filter(v => v.estado === 'activo').length}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600 opacity-20" />
              </div>
            </div>
            <div className="card-3d card-elevated bg-white dark:bg-slate-800/60 rounded-lg border border-gray-200 dark:border-slate-700/50 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Inactivas</span>
                  <p className="text-2xl font-semibold text-gray-600 dark:text-gray-300">
                    {variantes.filter(v => v.estado === 'inactivo').length}
                  </p>
                </div>
                <ToggleLeft className="w-8 h-8 text-gray-600 opacity-20" />
              </div>
            </div>
            <div className="card-3d card-elevated bg-white dark:bg-slate-800/60 rounded-lg border border-gray-200 dark:border-slate-700/50 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Productos con Variantes</span>
                  <p className="text-2xl font-semibold text-blue-600 dark:text-blue-400">
                    {[...new Set(variantes.map(v => v.idProducto))].length}
                  </p>
                </div>
                <Package className="w-8 h-8 text-blue-600 opacity-20" />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Barra superior */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-3 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-600 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar por SKU, producto, color o talla..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              <button
                onClick={() => setMostrarFiltros(!mostrarFiltros)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition ${
                  mostrarFiltros
                    ? 'bg-gray-100 dark:bg-slate-800 border-gray-300 dark:border-slate-600'
                    : 'border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-800'
                }`}
              >
                <Filter className="w-4 h-4" />
                Filtros
                {(filtroProducto !== 'todos' || filtroColor !== 'todos' || filtroTalla !== 'todos' || filtroEstado !== 'todos') && (
                  <span className="ml-1 bg-purple-600 text-white text-xs px-2 py-0.5 rounded-full">
                    {(filtroProducto !== 'todos' ? 1 : 0) + (filtroColor !== 'todos' ? 1 : 0) + (filtroTalla !== 'todos' ? 1 : 0) + (filtroEstado !== 'todos' ? 1 : 0)}
                  </span>
                )}
              </button>
            </div>

            <div className="flex gap-3">
              <button
                onClick={fetchVariantes}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-300 transition"
              >
                <RefreshCcw className="w-4 h-4" />
                Actualizar
              </button>

              <button
                onClick={() => navigate('/admin/productos')}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition"
              >
                <Package className="w-4 h-4" />
                Ver Productos
              </button>
            </div>
          </div>

          {/* Panel de filtros */}
          {mostrarFiltros && (
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
                <div className="flex items-end gap-4 flex-1 flex-wrap">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Producto</label>
                    <select
                      value={filtroProducto}
                      onChange={(e) => setFiltroProducto(e.target.value)}
                      className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="todos">Todos los productos</option>
                      {productos.map(producto => (
                        <option key={producto.idProducto} value={producto.idProducto}>
                          {producto.nombreProducto}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Color</label>
                    <select
                      value={filtroColor}
                      onChange={(e) => setFiltroColor(e.target.value)}
                      className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="todos">Todos los colores</option>
                      {colores.map(color => (
                        <option key={color.idColor} value={color.idColor}>
                          {color.nombreColor}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Talla</label>
                    <select
                      value={filtroTalla}
                      onChange={(e) => setFiltroTalla(e.target.value)}
                      className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="todos">Todas las tallas</option>
                      {tallas.map(talla => (
                        <option key={talla.idTalla} value={talla.idTalla}>
                          {talla.nombreTalla}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Estado</label>
                    <select
                      value={filtroEstado}
                      onChange={(e) => setFiltroEstado(e.target.value)}
                      className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="todos">Todos los estados</option>
                      <option value="activo">Activo</option>
                      <option value="inactivo">Inactivo</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setBusqueda('');
                    setFiltroProducto('todos');
                    setFiltroColor('todos');
                    setFiltroTalla('todos');
                    setFiltroEstado('todos');
                  }}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition"
                >
                  <X className="w-4 h-4" />
                  Limpiar filtros
                </button>
              </div>
            </div>
          )}

          {/* Estados */}
          {variantesFiltradas.length === 0 && (
            <div className="text-center py-12">
              <Layers className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-gray-500 dark:text-gray-400">
                {busqueda || filtroProducto !== 'todos' || filtroColor !== 'todos' || filtroTalla !== 'todos' || filtroEstado !== 'todos'
                  ? 'No se encontraron variantes con los filtros aplicados'
                  : 'No hay variantes registradas en el sistema'}
              </p>
              {(busqueda || filtroProducto !== 'todos' || filtroColor !== 'todos' || filtroTalla !== 'todos' || filtroEstado !== 'todos') && (
                <button
                  onClick={() => {
                    setBusqueda('');
                    setFiltroProducto('todos');
                    setFiltroColor('todos');
                    setFiltroTalla('todos');
                    setFiltroEstado('todos');
                  }}
                  className="mt-2 text-sm text-purple-600 hover:text-purple-800 underline"
                >
                  Limpiar filtros
                </button>
              )}
              {variantes.length === 0 && (
                <button
                  onClick={() => navigate('/admin/productos')}
                  className="mt-4 text-sm text-purple-600 hover:text-purple-800 underline"
                >
                  Ir a productos para crear variantes
                </button>
              )}                                                                                                                            
            </div>
          )}

          {/* Tabla de variantes moderna */}
          {variantesFiltradas.length > 0 && (
            <>
              <div className="card-3d card-elevated bg-white dark:bg-slate-800/60 rounded-xl border border-gray-200 dark:border-slate-700/50 overflow-hidden">
                {/* Header de la tabla */}
                <div className="px-6 py-4 card-3d border-b border-gray-200 dark:border-slate-700/50 bg-gray-50 dark:bg-slate-900/50">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Todas las Variantes
                    </h3>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setViewMode('table')}
                        className={`p-2 rounded-lg transition ${
                          viewMode === 'table'
                            ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                            : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700'
                        }`}
                        title="Vista de tabla"
                      >
                        <List className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded-lg transition ${
                          viewMode === 'grid'
                            ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                            : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700'
                        }`}
                        title="Vista de cuadrícula"
                      >
                        <Grid className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {viewMode === 'table' ? (
                  /* Vista de tabla */
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 dark:bg-slate-900/50 border-b border-gray-200 dark:border-slate-700/50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                            SKU
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                            Producto
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                            Color
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                            Talla
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                            Imágenes
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                            Precios
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                            Stock
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                            Estado
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                            Acciones
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-slate-700/50">
                        {variantesPaginadas.map((variante) => {
                          const productoInfo = getProductoInfo(variante.idProducto);
                          return (
                            <tr
                              key={variante.idVariante}
                              className="card-3d hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
                            >
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-sm font-medium text-gray-900 dark:text-white">
                                    {variante.codigoSku}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex flex-col gap-1">
                                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30 rounded-xl max-w-fit group/prod cursor-help">
                                    <Package className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                                    <span className="text-sm font-semibold text-blue-900 dark:text-blue-100 tracking-tight">
                                      {productoInfo?.nombreProducto || 'Producto no encontrado'}
                                    </span>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(`/admin/productos/${variante.idProducto}/variantes`);
                                      }}
                                      className="ml-1 opacity-0 group-hover/prod:opacity-100 text-blue-600 hover:text-blue-800 p-0.5 rounded-md hover:bg-blue-100 transition-all"
                                      title="Filtrar por este producto"
                                    >
                                      <ArrowRight className="w-3 h-3" />
                                    </button>
                                  </div>
                                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide ml-1">
                                    REF: {productoInfo?.codigoReferencia || 'N/A'}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <ColorSwatch
                                  color={variante.color}
                                  size="md"
                                  showName={true}
                                />
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                  <Ruler className="w-4 h-4 text-gray-400 dark:text-gray-600" />
                                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                                    {variante.talla?.nombreTalla || '-'}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <VariantImageGallery
                                  variant={variante}
                                  product={productoInfo}
                                  size="md"
                                  showBadge={true}
                                />
                              </td>
                              <td className="px-6 py-4">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <DollarSign className="w-3 h-3 text-gray-400 dark:text-gray-600" />
                                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                                      <PrecioFormateado precio={variante.precioVenta} />
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <span className="text-xs text-gray-500 dark:text-gray-400">Costo:</span>
                                    <span className="text-xs text-gray-600 dark:text-gray-400">
                                      <PrecioFormateado precio={variante.precioCosto} />
                                    </span>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <StockIndicator
                                  currentStock={variante.cantidadStock}
                                  minStock={variante.stockMinimo}
                                  maxStock={variante.stockMaximo}
                                  size="sm"
                                  variant="detailed"
                                />
                              </td>
                              <td className="px-6 py-4">
                                <StatusBadge
                                  status={variante.estado}
                                  size="sm"
                                  showIcon={true}
                                />
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => openDetailModal(variante)}
                                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-purple-50 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300 hover:bg-purple-600 hover:text-white border border-purple-100 dark:border-purple-800/60 hover:border-purple-600 shadow-sm hover:shadow-md hover:shadow-purple-500/20 hover:-translate-y-0.5 active:scale-95 transition-all"
                                    title="Ver detalles completos"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => navigate(`/admin/productos/${variante.idProducto}/variantes`)}
                                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-600 hover:text-white border border-indigo-100 dark:border-indigo-800/60 hover:border-indigo-600 shadow-sm hover:shadow-md hover:shadow-indigo-500/20 hover:-translate-y-0.5 active:scale-95 transition-all"
                                    title="Gestionar variantes del producto"
                                  >
                                    <Layers className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      const nuevoEstado = variante.estado === 'activo' ? 'inactivo' : 'activo';
                                      if (window.confirm(`¿Estás seguro de que deseas ${nuevoEstado === 'activo' ? 'activar' : 'desactivar'} esta variante?`)) {
                                        cambiarEstadoVariante(variante.idVariante, nuevoEstado);
                                      }
                                    }}
                                    className={`w-10 h-10 flex items-center justify-center rounded-xl border shadow-sm hover:-translate-y-0.5 active:scale-95 transition-all ${
                                      variante.estado === 'activo'
                                        ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 hover:bg-blue-600 hover:text-white border-blue-100 dark:border-blue-800/60 hover:border-blue-600 hover:shadow-blue-500/20'
                                        : 'bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-300 hover:bg-emerald-600 hover:text-white border-emerald-100 dark:border-emerald-800/60 hover:border-emerald-600 hover:shadow-emerald-500/20'
                                    }`}
                                    title={variante.estado === 'activo' ? 'Desactivar' : 'Activar'}
                                  >
                                    {variante.estado === 'activo' ? (
                                      <ToggleLeft className="w-4 h-4" />
                                    ) : (
                                      <ToggleRight className="w-4 h-4" />
                                    )}
                                  </button>
                                  <button
                                    onClick={() => eliminarVariante(variante.idVariante)}
                                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-rose-50 dark:bg-rose-900/40 text-rose-600 dark:text-rose-300 hover:bg-rose-600 hover:text-white border border-rose-100 dark:border-rose-800/60 hover:border-rose-600 shadow-sm hover:shadow-md hover:shadow-rose-500/20 hover:-translate-y-0.5 active:scale-95 transition-all"
                                    title="Eliminar variante"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  /* Vista de cuadrícula */
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {variantesPaginadas.map((variante) => {
                        const productoInfo = getProductoInfo(variante.idProducto);
                        return (
                          <div
                            key={variante.idVariante}
                            className="card-3d card-elevated bg-white dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700/50 rounded-lg p-4 hover:shadow-lg transition-shadow"
                          >
                            {/* Header de la card */}
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                                  {variante.codigoSku}
                                </h4>
                                <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-1 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
                                   <Package className="w-3 h-3 text-slate-400" />
                                   <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-200 truncate max-w-[120px]">
                                     {productoInfo?.nombreProducto || 'Producto no encontrado'}
                                   </p>
                                </div>
                                <div className="mt-1">
                                   <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                                     REF: {productoInfo?.codigoReferencia || 'N/A'}
                                   </span>
                                </div>
                                <div className="mt-3">
                                  <StatusBadge
                                    status={variante.estado}
                                    size="xs"
                                    variant="dot"
                                  />
                                </div>
                              </div>
                              <div className="flex gap-1.5">
                                <button
                                  onClick={() => openDetailModal(variante)}
                                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-purple-600 dark:text-purple-400 hover:bg-purple-600 hover:text-white hover:border-purple-600 transition"
                                  title="Ver detalles"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => navigate(`/admin/productos/${variante.idProducto}/variantes`)}
                                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition"
                                  title="Ver producto"
                                >
                                  <Package className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => eliminarVariante(variante.idVariante)}
                                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-rose-600 dark:text-rose-400 hover:bg-rose-600 hover:text-white hover:border-rose-600 transition"
                                  title="Eliminar"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* Imagen principal */}
                            <div className="mb-3">
                              <VariantImageGallery
                                variant={variante}
                                product={productoInfo}
                                size="lg"
                                showBadge={true}
                              />
                            </div>

                            {/* Detalles */}
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <ColorSwatch
                                  color={variante.color}
                                  size="sm"
                                  showName={false}
                                />
                                <span className="text-sm text-gray-600">
                                  {variante.talla?.nombreTalla || '-'}
                                </span>
                              </div>

                              <div className="flex items-center justify-between">
                                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                  <PrecioFormateado precio={variante.precioVenta} />
                                </span>
                                <StockIndicator
                                  currentStock={variante.cantidadStock}
                                  minStock={variante.stockMinimo}
                                  variant="minimal"
                                  showNumbers={true}
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Paginación */}
              {totalPaginas > 1 && (
                <div className="flex justify-center items-center gap-2 mt-8">
                  <button
                    onClick={() => setPaginaActual(paginaActual - 1)}
                    disabled={paginaActual === 1}
                    className="px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition text-gray-700 dark:text-gray-300"
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
                            ? 'bg-purple-600 text-white'
                            : 'border border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {pagina}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setPaginaActual(paginaActual + 1)}
                    disabled={paginaActual === totalPaginas}
                    className="px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition text-gray-700 dark:text-gray-300"
                  >
                    Siguiente
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal de Detalles de Variante */}
        <VariantDetailModal
          variante={selectedVariant}
          producto={selectedProduct}
          categoria={selectedCategory}
          proveedor={selectedProvider}
          isOpen={showDetailModal}
          onClose={closeDetailModal}
        />
      </div>
    </div>
  );
}
