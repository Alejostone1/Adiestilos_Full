import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
  Grid3X3,
  List,
  ArrowUpDown,
  Box,
  Tag,
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowLeft,
  Grid,
  Ruler,
  ToggleLeft,
  ToggleRight,
  Layers,
  Upload
} from 'lucide-react';
import { productosApi } from "../../../api/productosApi";
import { variantesApi } from "../../../api/variantesApi";
import { coloresApi } from "../../../api/coloresApi";
import { tallasApi } from "../../../api/tallasApi";
import { imagenesApi } from "../../../api/imagenesApi";
import { categoriasApi } from "../../../api/categoriasApi";
import PrecioFormateado from '../../../components/common/PrecioFormateado';
import { useAuth } from "../../../context/AuthContext";

// Importar componentes personalizados
import VariantImageGallery from '../../../components/admin/VariantImageGallery';
import ColorSwatch from '../../../components/admin/ColorSwatch';
import StatusBadge from '../../../components/admin/StatusBadge';
import StockIndicator from '../../../components/admin/StockIndicator';
import VariantFormModal from '../../../components/admin/VariantFormModal';

export default function VariantesProductoPage() {
  const navigate = useNavigate();
  const { idProducto } = useParams();
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
  const [producto, setProducto] = useState(null);
  const [variantes, setVariantes] = useState([]);
  const [colores, setColores] = useState([]);
  const [tallas, setTallas] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [varianteSeleccionada, setVarianteSeleccionada] = useState(null);
  const [mostrarFormularioVariante, setMostrarFormularioVariante] = useState(false);
  const [varianteEditando, setVarianteEditando] = useState(null);
  // Estados de imágenes de variantes
  const [imagenesVariante, setImagenesVariante] = useState([]);
  const [mostrarGaleriaImagenes, setMostrarGaleriaImagenes] = useState(false);
  const [isGalleryUploading, setIsGalleryUploading] = useState(false);
  const [viewingImage, setViewingImage] = useState(null);
  const [imagenesParaSubir, setImagenesParaSubir] = useState([]);
  const [isUploadingImagenes, setIsUploadingImagenes] = useState(false);

  // Estados de búsqueda y filtros
  const [busqueda, setBusqueda] = useState('');
  const [filtroColor, setFiltroColor] = useState('todos');
  const [filtroTalla, setFiltroTalla] = useState('todos');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  // Estados de paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const [variantesPorPagina] = useState(10);
  const [viewMode, setViewMode] = useState('table'); // 'table' o 'grid'

  // Función para obtener imágenes de la variante
  const fetchImagenesVariante = useCallback(async (idVariante) => {
    try {
      const response = await imagenesApi.getImagenesVariante(idVariante);
      const imagenesData = response.datos || response.data || response;
      setImagenesVariante(Array.isArray(imagenesData) ? imagenesData : []);
    } catch (err) {
      console.error('Error al obtener imágenes de la variante:', err);
      setImagenesVariante([]);
    }
  }, []);

  // Función para obtener detalles del producto
  const fetchProducto = useCallback(async () => {
    try {
      const response = await productosApi.getProductoById(idProducto);
      const productoData = response.datos || response.data || response;
      setProducto(productoData);
    } catch (err) {
      console.error('Error al obtener producto:', err);
      const errorMessage = err?.mensaje || err?.message || 'Error al obtener el producto';
      setError(errorMessage);
    }
  }, [idProducto]);

  // Función para obtener variantes del producto
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

      const variantesProducto = variantesData.filter(variante =>
        variante.idProducto === parseInt(idProducto)
      );

      // Cargar imágenes para cada variante
      const variantesConImagenes = await Promise.all(
        variantesProducto.map(async (variante) => {
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
  }, [idProducto]);

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
    const color = variante?.color?.nombreColor || '';
    const talla = variante?.talla?.nombreTalla || '';
    const estado = variante?.estado || '';

    const busquedaLower = busqueda.toLowerCase();
    const coincideBusqueda =
      sku.toLowerCase().includes(busquedaLower) ||
      color.toLowerCase().includes(busquedaLower) ||
      talla.toLowerCase().includes(busquedaLower);

    const coincideColor = filtroColor === 'todos' || variante.idColor === parseInt(filtroColor);
    const coincideTalla = filtroTalla === 'todos' || variante.idTalla === parseInt(filtroTalla);
    const coincideEstado = filtroEstado === 'todos' || estado === filtroEstado;

    return coincideBusqueda && coincideColor && coincideTalla && coincideEstado;
  });

  // Paginación
  const totalPaginas = Math.ceil(variantesFiltradas.length / variantesPorPagina);
  const variantesPaginadas = variantesFiltradas.slice(
    (paginaActual - 1) * variantesPorPagina,
    paginaActual * variantesPorPagina
  );

  // Cargar datos al iniciar
  useEffect(() => {
    if (idProducto) {
      setLoading(true);
      Promise.all([
        fetchProducto(),
        fetchVariantes(),
        fetchDatosRelacionados()
      ]).finally(() => {
        setLoading(false);
      });
    }
  }, [idProducto, fetchProducto, fetchVariantes, fetchDatosRelacionados]);

  // Efecto para cargar imágenes cuando se edita una variante
  useEffect(() => {
    if (varianteEditando && mostrarFormularioVariante) {
      fetchImagenesVariante(varianteEditando.idVariante);
    } else {
      setImagenesVariante([]);
      setImagenesParaSubir([]);
    }
  }, [varianteEditando, mostrarFormularioVariante, fetchImagenesVariante]);

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

  const getEstadoStyle = (estado) => {
    switch (estado?.toLowerCase()) {
      case 'activo': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'inactivo': return 'bg-gray-100 text-gray-800 dark:bg-slate-700 dark:text-gray-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-slate-700 dark:text-gray-300';
    }
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

  // Función para manejar la carga de múltiples imágenes
  const handleImagenesUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    setImagenesParaSubir(prev => [...prev, ...files]);
  };

  // Función para eliminar imagen de la lista de subida
  const removeImagenParaSubir = (index) => {
    setImagenesParaSubir(prev => prev.filter((_, i) => i !== index));
  };

  // Función para subir todas las imágenes pendientes
  const uploadImagenesVariante = async (idVariante) => {
    if (imagenesParaSubir.length === 0) return;

    setIsUploadingImagenes(true);
    try {
      const uploadPromises = imagenesParaSubir.map(file =>
        imagenesApi.createImagenVariante(idVariante, file, `Imagen de variante ${varianteEditando?.codigoSku || 'nueva'}`)
      );

      await Promise.all(uploadPromises);
      await fetchImagenesVariante(idVariante);
      setImagenesParaSubir([]);
    } catch (error) {
      console.error('Error al subir imágenes:', error);
      alert(error?.mensaje || error?.message || 'Error al subir las imágenes');
    } finally {
      setIsUploadingImagenes(false);
    }
  };

  // Función para eliminar imagen de variante
  const handleDeleteImagenVariante = async (idImagen) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta imagen?')) return;

    try {
      await imagenesApi.deleteImagenVariante(idImagen);
      if (varianteEditando) {
        await fetchImagenesVariante(varianteEditando.idVariante);
      }
    } catch (error) {
      console.error('Error al eliminar imagen:', error);
      alert(error?.mensaje || error?.message || 'Error al eliminar la imagen');
    }
  };

  // Función para establecer imagen principal
  const handleSetImagenPrincipal = async (idImagen) => {
    try {
      await imagenesApi.setImagenPrincipalVariante(idImagen);
      if (varianteEditando) {
        await fetchImagenesVariante(varianteEditando.idVariante);
      }
    } catch (error) {
      console.error('Error al establecer imagen principal:', error);
      alert(error?.mensaje || error?.message || 'Error al establecer la imagen principal');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center transition-colors duration-300">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-b-2 border-blue-600 rounded-full mx-auto" />
          <span className="ml-3 text-gray-500 dark:text-gray-400">Cargando variantes...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="p-4 border border-red-300 bg-red-50 rounded-lg text-red-700 max-w-md">
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
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate('/admin/productos')}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-300 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver a Productos
            </button>
          </div>

          {producto && (
            <div className="relative overflow-hidden bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl shadow-slate-200/50 dark:shadow-none group">
              {/* Elemento decorativo de fondo */}
              <div className="absolute -right-20 -top-20 w-64 h-64 bg-purple-500/5 blur-[80px] rounded-full" />
              
              <div className="flex flex-col md:flex-row items-stretch">
                {/* Lado Izquierdo: Imagen del Producto */}
                <div className="w-full md:w-64 h-64 md:h-auto bg-slate-100 dark:bg-slate-900 relative p-4 group/img">
                  <div className="w-full h-full rounded-2xl overflow-hidden shadow-inner border border-white/50 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-center">
                    <img
                      src={getImagenUrl(producto.imagenes?.[0]?.rutaImagen || producto.imagenPrincipal)}
                      alt={producto.nombreProducto}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-110"
                      onError={(e) => { e.target.src = '/placeholder.png'; }}
                    />
                  </div>
                  <div className="absolute top-6 left-6">
                     <span className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black text-slate-500 uppercase tracking-tighter shadow-sm border border-slate-100 dark:border-slate-700">
                        Producto Base
                     </span>
                  </div>
                </div>

                {/* Lado Derecho: Información Detallada */}
                <div className="flex-1 p-8 relative flex flex-col justify-center">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Layers className="w-4 h-4 text-purple-600" />
                        <span className="text-[10px] font-black text-purple-600 dark:text-purple-400 uppercase tracking-[0.2em]">Catalogo Maestro</span>
                      </div>
                      <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                        {producto.nombreProducto}
                      </h1>
                      <div className="mt-2 flex flex-wrap gap-2">
                         <span className="bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-lg text-xs font-bold text-slate-500 dark:text-slate-300">
                           REF: {producto.codigoReferencia}
                         </span>
                         <span className="bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-lg text-xs font-bold text-blue-600 dark:text-blue-300">
                           {producto.categoria?.nombreCategoria || 'General'}
                         </span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-2 shrink-0">
                       <BadgeEstado estado={producto.estado} />
                       <div className="text-right">
                         <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Variantes</span>
                         <span className="text-2xl font-black text-slate-900 dark:text-white leading-none">{variantes.length}</span>
                       </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 border-t border-slate-100 dark:border-slate-700/50">
                    <div className="space-y-1">
                       <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Precio Sugerido</span>
                       <div className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                         <PrecioFormateado precio={producto.precioVentaSugerido} />
                       </div>
                    </div>
                    
                    <div className="space-y-1">
                       <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Stock Total</span>
                       <div className="text-lg font-black text-slate-700 dark:text-slate-200">
                          {variantes.reduce((acc, v) => acc + Number(v.cantidadStock), 0)} <span className="text-[10px] font-bold text-slate-400 lowercase">unds</span>
                       </div>
                    </div>

                    <div className="col-span-2 flex items-center justify-end">
                       <button 
                        onClick={() => navigate(`/admin/productos`)}
                        className="text-xs font-bold text-slate-400 hover:text-purple-600 underline underline-offset-4 transition-colors"
                       >
                         Ver detalles técnicos completa
                       </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {/* Barra superior */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-3 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-600 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar por SKU, color o talla..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              <button
                onClick={() => setMostrarFiltros(!mostrarFiltros)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition ${
                  mostrarFiltros
                    ? 'bg-gray-100 dark:bg-slate-700 border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white'
                    : 'border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-300'
                }`}
              >
                <Filter className="w-4 h-4" />
                Filtros
                {(filtroColor !== 'todos' || filtroTalla !== 'todos' || filtroEstado !== 'todos') && (
                  <span className="ml-1 bg-purple-600 text-white text-xs px-2 py-0.5 rounded-full">
                    {(filtroColor !== 'todos' ? 1 : 0) + (filtroTalla !== 'todos' ? 1 : 0) + (filtroEstado !== 'todos' ? 1 : 0)}
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
                onClick={() => {
                  setVarianteEditando(null);
                  setMostrarFormularioVariante(true);
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition"
              >
                <Plus className="w-4 h-4" />
                Nueva Variante
              </button>
            </div>
          </div>

          {/* Panel de filtros */}
          {mostrarFiltros && (
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
                <div className="flex items-end gap-4 flex-1 flex-wrap">
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
              <Layers className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600" />
              <p className="mt-2 text-gray-500 dark:text-gray-400">
                {busqueda || filtroColor !== 'todos' || filtroTalla !== 'todos' || filtroEstado !== 'todos'
                  ? 'No se encontraron variantes con los filtros aplicados'
                  : 'Este producto no tiene variantes registradas'}
              </p>
              {(busqueda || filtroColor !== 'todos' || filtroTalla !== 'todos' || filtroEstado !== 'todos') && (
                <button
                  onClick={() => {
                    setBusqueda('');
                    setFiltroColor('todos');
                    setFiltroTalla('todos');
                    setFiltroEstado('todos');
                  }}
                  className="mt-2 text-sm text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 underline"
                >
                  Limpiar filtros
                </button>
              )}
              {variantes.length === 0 && (
                <button
                  onClick={() => {
                    setVarianteEditando(null);
                    setMostrarFormularioVariante(true);
                  }}
                  className="mt-4 text-sm text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 underline"
                >
                  Crear primera variante
                </button>
              )}
            </div>
          )}

          {/* Tabla de variantes moderna */}
          {variantesFiltradas.length > 0 && (
            <>
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden shadow-sm">
                {/* Header de la tabla */}
                <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Variantes del Producto
                    </h3>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setViewMode('table')}
                        className={`p-2 rounded-lg transition ${
                          viewMode === 'table'
                            ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                            : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800'
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
                            : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800'
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
                      <thead className="bg-gray-50 dark:bg-slate-900/50 border-b border-gray-200 dark:border-slate-700">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                            SKU
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
                      <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                        {variantesPaginadas.map((variante) => (
                          <tr
                            key={variante.idVariante}
                            className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors dark:text-gray-300"
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-sm font-medium text-gray-900 dark:text-gray-100">
                                  {variante.codigoSku}
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
                                <Ruler className="w-4 h-4 text-gray-400" />
                                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                  {variante.talla?.nombreTalla || '-'}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <VariantImageGallery
                                variant={variante}
                                product={producto}
                                size="md"
                                showBadge={true}
                              />
                            </td>
                            <td className="px-6 py-4">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <DollarSign className="w-3 h-3 text-gray-400" />
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
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  onClick={() => {
                                    setVarianteEditando(variante);
                                    setMostrarFormularioVariante(true);
                                  }}
                                  className="p-1.5 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition"
                                  title="Editar variante"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => {
                                    const nuevoEstado = variante.estado === 'activo' ? 'inactivo' : 'activo';
                                    if (window.confirm(`¿Estás seguro de que deseas ${nuevoEstado === 'activo' ? 'activar' : 'desactivar'} esta variante?`)) {
                                      cambiarEstadoVariante(variante.idVariante, nuevoEstado);
                                    }
                                  }}
                                  className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
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
                                  className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                                  title="Eliminar variante"
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
                ) : (
                  /* Vista de cuadrícula */
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {variantesPaginadas.map((variante) => (
                        <div
                          key={variante.idVariante}
                          className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-4 hover:shadow-lg transition-shadow"
                        >
                          {/* Header de la card */}
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                                {variante.codigoSku}
                              </h4>
                              <StatusBadge
                                status={variante.estado}
                                size="xs"
                                variant="dot"
                                className="mt-1"
                              />
                            </div>
                            <div className="flex gap-1">
                              <button
                                onClick={() => {
                                  setVarianteEditando(variante);
                                  setMostrarFormularioVariante(true);
                                }}
                                className="p-1 text-gray-400 hover:text-purple-600 transition"
                                title="Editar"
                              >
                                <Edit className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => eliminarVariante(variante.idVariante)}
                                className="p-1 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition"
                                title="Eliminar"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>

                          {/* Imagen principal */}
                          <div className="mb-3">
                            <VariantImageGallery
                              variant={variante}
                              product={producto}
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
                              <span className="text-sm text-gray-600 dark:text-gray-400">
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
                      ))}
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
                            ? 'bg-purple-600 text-white'
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
      </div>

      {/* Modal de formulario de variante */}
      {mostrarFormularioVariante && (
        <VariantFormModal
          isOpen={mostrarFormularioVariante}
          onClose={() => {
            setMostrarFormularioVariante(false);
            setVarianteEditando(null);
            setImagenesParaSubir([]);
            setImagenesVariante([]);
          }}
          onSubmit={async (formData, nuevasImagenes) => {
             try {
                // Add idProducto to formData for new variants
                const dataToSend = {
                  ...formData,
                  idProducto: parseInt(idProducto)
                };

                if (varianteEditando) {
                  await variantesApi.updateVariante(varianteEditando.idVariante, dataToSend);
                  if (nuevasImagenes.length > 0) {
                      setIsUploadingImagenes(true);
                       const uploadPromises = nuevasImagenes.map(file => {
                          const formDataImagen = new FormData();
                          formDataImagen.append('imagen', file);
                          formDataImagen.append('descripcion', `Imagen de variante ${formData.codigoSku}`);
                          return imagenesApi.createImagenVariante(varianteEditando.idVariante, formDataImagen);
                        });
                        await Promise.all(uploadPromises);
                        setIsUploadingImagenes(false);
                  }
                } else {
                  const nuevaVariante = await variantesApi.createVariante(dataToSend);
                  if (nuevasImagenes.length > 0) {
                     setIsUploadingImagenes(true);
                     const idVariante = nuevaVariante.datos?.idVariante || nuevaVariante.idVariante;
                     const uploadPromises = nuevasImagenes.map(file => {
                        const formDataImagen = new FormData();
                        formDataImagen.append('imagen', file);
                        formDataImagen.append('descripcion', `Imagen de variante ${formData.codigoSku}`);
                        return imagenesApi.createImagenVariante(idVariante, formDataImagen);
                      });
                      await Promise.all(uploadPromises);
                       setIsUploadingImagenes(false);
                  }
                }
                await fetchVariantes();
                setMostrarFormularioVariante(false);
                setVarianteEditando(null);
                setImagenesParaSubir([]);
                setImagenesVariante([]);
              } catch (error) {
                 console.error('Error al guardar variante:', error);
                 throw error; // Re-throw to be handled by modal
              }
          }}
          initialData={varianteEditando}
          colores={colores}
          tallas={tallas}
          producto={producto}
          isSubmitting={isUploadingImagenes}
        />
      )}

      {/* Modal de vista de imagen */}
      {viewingImage && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[60] p-4" onClick={() => setViewingImage(null)}>
          <div className="relative max-w-4xl max-h-[90vh] flex items-center justify-center bg-slate-900 rounded-xl overflow-hidden">
            <img
              src={getImagenUrl(viewingImage)}
              alt="Vista ampliada"
              className="max-w-full max-h-full object-contain"
            />
            <button onClick={() => setViewingImage(null)} className="absolute top-4 right-4 bg-red-600/80 hover:bg-red-700 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg transition">×</button>
          </div>
        </div>
      )}
    </div>
  );
}