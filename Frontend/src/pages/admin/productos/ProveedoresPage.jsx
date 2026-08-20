import React, { useState, useEffect, useCallback } from 'react';
import {
  Users, Edit, Plus, RefreshCcw, Search, Filter, X, Eye, Trash2,
  Building2, Phone, Mail, MapPin, Calendar, CheckCircle, AlertCircle,
  ToggleLeft, ToggleRight, Package, TrendingUp, DollarSign,
  Star, Clock, FileText, Grid3x3, Upload, Camera
} from 'lucide-react';
import { proveedoresApi } from "../../../api/proveedoresApi";
import { productosApi } from "../../../api/productosApi";
import { useAuth } from "../../../context/AuthContext";

export default function ProveedoresPage() {
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
  const [proveedores, setProveedores] = useState([]);
  const [productosPorProveedor, setProductosPorProveedor] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados de modales
  const [mostrarDetalles, setMostrarDetalles] = useState(false);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [mostrarProductos, setMostrarProductos] = useState(false);
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState(null);
  const [proveedorEditando, setProveedorEditando] = useState(null);

  // Estados de búsqueda y filtros
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  // Estados de imágenes
  const [imagenSeleccionada, setImagenSeleccionada] = useState(null);
  const [previsualizacionImagen, setPrevisualizacionImagen] = useState(null);

  // Estados de paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const [proveedoresPorPagina] = useState(12);

  // Función para obtener proveedores
  const fetchProveedores = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await proveedoresApi.listarProveedores();
      let proveedoresData = [];

      if (response && response.datos && Array.isArray(response.datos)) {
        proveedoresData = response.datos;
      } else if (response && response.data && Array.isArray(response.data)) {
        proveedoresData = response.data;
      } else if (Array.isArray(response)) {
        proveedoresData = response;
      }

      const proveedoresValidos = proveedoresData.filter(proveedor =>
        proveedor && typeof proveedor === 'object' && proveedor.idProveedor !== undefined
      );

      setProveedores(proveedoresValidos);
    } catch (err) {
      console.error('Error al obtener proveedores:', err);
      const errorMessage = err?.mensaje || err?.message || 'Error al obtener proveedores';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Función para obtener productos de un proveedor
  const fetchProductosProveedor = useCallback(async (idProveedor) => {
    try {
      const response = await productosApi.obtenerProductos({
        idProveedor: idProveedor,
        estado: 'activo'
      });

      let productosData = [];
      if (response && response.datos && Array.isArray(response.datos)) {
        productosData = response.datos;
      } else if (response && response.data && Array.isArray(response.data)) {
        productosData = response.data;
      } else if (Array.isArray(response)) {
        productosData = response;
      }

      setProductosPorProveedor(prev => ({
        ...prev,
        [idProveedor]: productosData
      }));
    } catch (err) {
      console.error('Error al obtener productos del proveedor:', err);
      setProductosPorProveedor(prev => ({
        ...prev,
        [idProveedor]: []
      }));
    }
  }, []);

  // Filtrado
  const proveedoresFiltrados = proveedores.filter((proveedor) => {
    if (!proveedor) return false;

    const nombre = proveedor?.nombreProveedor || '';
    const nit = proveedor?.nitCC || '';
    const contacto = proveedor?.contacto || '';
    const correo = proveedor?.correoElectronico || '';
    const estado = proveedor?.estado || '';

    const busquedaLower = busqueda.toLowerCase();
    const coincideBusqueda =
      nombre.toLowerCase().includes(busquedaLower) ||
      nit.toLowerCase().includes(busquedaLower) ||
      contacto.toLowerCase().includes(busquedaLower) ||
      correo.toLowerCase().includes(busquedaLower);

    const coincideEstado = filtroEstado === 'todos' || estado === filtroEstado;

    return coincideBusqueda && coincideEstado;
  });

  // Paginación
  const totalPaginas = Math.ceil(proveedoresFiltrados.length / proveedoresPorPagina);
  const proveedoresPaginados = proveedoresFiltrados.slice(
    (paginaActual - 1) * proveedoresPorPagina,
    paginaActual * proveedoresPorPagina
  );

  // Cargar datos al iniciar
  useEffect(() => {
    fetchProveedores();
  }, [fetchProveedores]);

  // Función para manejar selección de imagen
  const handleImagenSeleccion = (event) => {
    const archivo = event.target.files[0];
    if (archivo) {
      setImagenSeleccionada(archivo);
      setPrevisualizacionImagen({
        archivo,
        url: URL.createObjectURL(archivo),
        nombre: archivo.name
      });
    }
  };

  const formatearFecha = (fecha, opciones) => {
  if (!fecha) return '—';
  const date = new Date(fecha);
  if (isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('es-ES', opciones);
};


  // Función para eliminar imagen seleccionada
  const eliminarImagenSeleccionada = () => {
    setImagenSeleccionada(null);
    setPrevisualizacionImagen(null);
  };

  // Función para cambiar estado
  const cambiarEstadoProveedor = async (idProveedor, nuevoEstado) => {
    try {
      await proveedoresApi.updateProveedor(idProveedor, { estado: nuevoEstado });
      await fetchProveedores();
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      const errorMessage = error?.mensaje || error?.message || 'Error al cambiar el estado del proveedor';
      alert(errorMessage);
    }
  };

  // Función para eliminar proveedor
  const eliminarProveedor = async (idProveedor) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este proveedor? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      await proveedoresApi.deleteProveedor(idProveedor);
      await fetchProveedores();
    } catch (error) {
      console.error('Error al eliminar proveedor:', error);
      const errorMessage = error?.mensaje || error?.message || 'Error al eliminar el proveedor';
      alert(errorMessage);
    }
  };

  // Componentes auxiliares
  const BadgeEstado = ({ estado }) => {
    const getEstadoStyle = (estado) => {
      switch (estado?.toLowerCase()) {
        case 'activo': return 'bg-green-100 text-green-800';
        case 'inactivo': return 'bg-gray-100 text-gray-800';
        default: return 'bg-gray-100 text-gray-800';
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

  const ProveedorCard = ({ proveedor }) => {
    const productosCount =
  Array.isArray(productosPorProveedor?.[proveedor.idProveedor])
    ? productosPorProveedor[proveedor.idProveedor].length
    : 0;


    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 hover:border-blue-300 overflow-hidden">
        {/* Header con imagen */}
        <div className="relative h-32 bg-gradient-to-br from-blue-500 to-purple-600 overflow-hidden">
          <img
            src={getImagenUrl(proveedor.imagenProveedor)}
            alt={proveedor.nombreProveedor}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Evitar bucle infinito si ya estamos en el placeholder
              if (!e.target.src.includes('placeholder.png')) {
                e.target.src = getImagenUrl('/placeholder.png');
              }
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg">
                  <Building2 className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-white leading-tight truncate">
                  {proveedor.nombreProveedor}
                </h3>
                <p className="text-sm text-white/90 font-mono">
                  NIT: {proveedor.nitCC}
                </p>
              </div>
            </div>
          </div>

          {/* Badge de estado */}
          <div className="absolute top-4 right-4">
            <BadgeEstado estado={proveedor.estado} />
          </div>
        </div>

        {/* Contenido */}
        <div className="p-6">
          {/* Información de contacto */}
          <div className="space-y-2 text-sm text-gray-600 mb-4">
            {proveedor.contacto && (
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-2 text-gray-400" />
                <span className="truncate">{proveedor.contacto}</span>
              </div>
            )}

            {proveedor.correoElectronico && (
              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-2 text-gray-400" />
                <span className="truncate">{proveedor.correoElectronico}</span>
              </div>
            )}

            {proveedor.telefono && (
              <div className="flex items-center">
                <Phone className="h-4 w-4 mr-2 text-gray-400" />
                <span>{proveedor.telefono}</span>
              </div>
            )}

            {proveedor.direccion && (
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                <span className="truncate">{proveedor.direccion}</span>
              </div>
            )}
          </div>

          {/* Métricas */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="text-center p-2 bg-blue-50 rounded-lg">
              <Package className="h-5 w-5 text-blue-600 mx-auto mb-1" />
              <div className="text-sm font-bold text-gray-900">{productosCount}</div>
              <div className="text-xs text-gray-600">Productos</div>
            </div>

            <div className="text-center p-2 bg-green-50 rounded-lg">
              <TrendingUp className="h-5 w-5 text-green-600 mx-auto mb-1" />
              <div className="text-sm font-bold text-gray-900">Activo</div>
              <div className="text-xs text-gray-600">Estado</div>
            </div>

            <div className="text-center p-2 bg-purple-50 rounded-lg">
              <Calendar className="h-5 w-5 text-purple-600 mx-auto mb-1" />
              <div className="text-sm font-bold text-gray-900">
                {formatearFecha(proveedor.creadoEn, {
  month: 'short',
  day: 'numeric'
})}

              </div>
              <div className="text-xs text-gray-600">Registro</div>
            </div>
          </div>

          {/* Acciones */}
          <div className="grid grid-cols-2 gap-2">
            <button
              title="Ver detalles"
              onClick={() => {
                setProveedorSeleccionado(proveedor);
                setMostrarDetalles(true);
              }}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 text-sm font-medium transition-colors"
            >
              <Eye className="w-4 h-4" />
              Detalles
            </button>

            <button
              title="Ver productos"
              onClick={async () => {
                setProveedorSeleccionado(proveedor);
                await fetchProductosProveedor(proveedor.idProveedor);
                setMostrarProductos(true);
              }}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-600 text-sm font-medium transition-colors"
            >
              <Package className="w-4 h-4" />
              Productos
            </button>
          </div>

          {/* Acciones secundarias */}
          <div className="grid grid-cols-2 gap-2 mt-2">
            <button
              title="Editar"
              onClick={() => {
                setProveedorEditando(proveedor);
                setMostrarFormulario(true);
              }}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-600 text-sm font-medium transition-colors"
            >
              <Edit className="w-4 h-4" />
              Editar
            </button>

            <button
              title={proveedor.estado === 'activo' ? 'Desactivar' : 'Activar'}
              onClick={() => {
                const nuevoEstado = proveedor.estado === 'activo' ? 'inactivo' : 'activo';
                if (window.confirm(`¿Estás seguro de que deseas ${nuevoEstado === 'activo' ? 'activar' : 'desactivar'} el proveedor "${proveedor.nombreProveedor}"?`)) {
                  cambiarEstadoProveedor(proveedor.idProveedor, nuevoEstado);
                }
              }}
              className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                proveedor.estado === 'activo'
                  ? 'bg-red-50 hover:bg-red-100 text-red-600'
                  : 'bg-green-50 hover:bg-green-100 text-green-600'
              }`}
            >
              {proveedor.estado === 'activo' ? (
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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Proveedores</h1>
          </div>
          <p className="text-gray-600">Panel administrativo profesional para gestión completa de proveedores y sus productos</p>
        </div>

        <div className="space-y-6">
          {/* Barra superior */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-3 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar por nombre, NIT, contacto..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

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
                {filtroEstado !== 'todos' && (
                  <span className="ml-1 bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                    1
                  </span>
                )}
              </button>
            </div>

            <div className="flex gap-3">
              <button
                onClick={fetchProveedores}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition"
              >
                <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Actualizar
              </button>

              <button
                onClick={() => setMostrarFormulario(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
              >
                <Plus className="w-4 h-4" />
                Nuevo Proveedor
              </button>
            </div>
          </div>

          {/* Panel de filtros */}
          {mostrarFiltros && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
                <div className="flex items-end gap-4 flex-1">
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
                    </select>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setBusqueda('');
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

          {/* Estados */}
          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin h-8 w-8 border-b-2 border-blue-600 rounded-full" />
              <span className="ml-3 text-gray-500">Cargando proveedores...</span>
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

          {!loading && !error && proveedoresFiltrados.length === 0 && (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-gray-500">
                {busqueda || filtroEstado !== 'todos'
                  ? 'No se encontraron proveedores con los filtros aplicados'
                  : 'No hay proveedores registrados'}
              </p>
              {(busqueda || filtroEstado !== 'todos') && (
                <button
                  onClick={() => {
                    setBusqueda('');
                    setFiltroEstado('todos');
                  }}
                  className="mt-2 text-sm text-blue-600 hover:text-blue-800 underline"
                >
                  Limpiar filtros
                </button>
              )}
            </div>
          )}

          {/* Grid de proveedores */}
          {!loading && !error && proveedoresFiltrados.length > 0 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {proveedoresPaginados.map((proveedor) => (
                  <ProveedorCard
                    key={proveedor.idProveedor}
                    proveedor={proveedor}
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
      </div>

      {/* Modal de detalles del proveedor */}
      {mostrarDetalles && proveedorSeleccionado && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Detalles del Proveedor</h2>
                <button
                  onClick={() => {
                    setMostrarDetalles(false);
                    setProveedorSeleccionado(null);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Imagen del proveedor */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Imagen del Proveedor</label>
                  <div className="relative h-48 bg-gray-100 rounded-lg overflow-hidden group">
                    <img
                      src={getImagenUrl(proveedorSeleccionado.imagenProveedor)}
                      alt={proveedorSeleccionado.nombreProveedor}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Evitar bucle infinito si ya estamos en el placeholder
                        if (!e.target.src.includes('placeholder.png')) {
                          e.target.src = getImagenUrl('/placeholder.png');
                        }
                      }}
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        onClick={() => {
                          window.open(getImagenUrl(proveedorSeleccionado.imagenProveedor), '_blank');
                        }}
                        className="bg-white text-gray-900 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition"
                      >
                        <Camera className="w-5 h-5 inline mr-2" />
                        Ver Imagen
                      </button>
                    </div>
                  </div>
                </div>

                {/* Información básica */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Proveedor</label>
                    <p className="text-gray-900 font-medium">{proveedorSeleccionado.nombreProveedor}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">NIT/CC</label>
                    <p className="text-gray-900 font-mono">{proveedorSeleccionado.nitCC}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contacto</label>
                    <p className="text-gray-900">{proveedorSeleccionado.contacto || 'No especificado'}</p>
                  </div>
                </div>
              </div>

              {/* Información adicional */}
              <div className="mt-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
                  <p className="text-gray-900">{proveedorSeleccionado.correoElectronico || 'No especificado'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                  <p className="text-gray-900">{proveedorSeleccionado.telefono || 'No especificado'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                  <p className="text-gray-900">{proveedorSeleccionado.direccion || 'No especificada'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                  <div className="mt-1">
                    <BadgeEstado estado={proveedorSeleccionado.estado} />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Registro</label>
                  <p className="text-gray-900">
              {formatearFecha(proveedorSeleccionado.creadoEn, {
  year: 'numeric',
  month: 'long',
  day: 'numeric'
})}

                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
                  <div className="mt-1 p-3 bg-gray-50 rounded-lg">
                    <p className="text-gray-900 whitespace-pre-wrap">
                      {proveedorSeleccionado.notas || 'No hay notas registradas'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de productos del proveedor */}
      {mostrarProductos && proveedorSeleccionado && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Productos del Proveedor</h2>
                  <p className="text-gray-600 mt-1">{proveedorSeleccionado.nombreProveedor}</p>
                </div>
                <button
                  onClick={() => {
                    setMostrarProductos(false);
                    setProveedorSeleccionado(null);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {productosPorProveedor[proveedorSeleccionado.idProveedor]?.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-gray-500">Este proveedor no tiene productos asociados</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {productosPorProveedor[proveedorSeleccionado.idProveedor]?.map((producto) => (
                    <div key={producto.idProducto} className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-medium text-gray-900 mb-2">{producto.nombreProducto}</h3>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div>Código: {producto.codigoReferencia}</div>
                        <div>Precio: ${producto.precioVentaSugerido?.toLocaleString()}</div>
                        <div>Estado: <BadgeEstado estado={producto.estado} /></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de formulario de proveedor */}
      {mostrarFormulario && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {proveedorEditando ? 'Editar Proveedor' : 'Nuevo Proveedor'}
                </h2>
                <button
                  onClick={() => {
                    setMostrarFormulario(false);
                    setProveedorEditando(null);
                    eliminarImagenSeleccionada();
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.target);

                const proveedorData = {
                  nombreProveedor: formData.get('nombreProveedor'),
                  nitCC: formData.get('nitCC'),
                  contacto: formData.get('contacto'),
                  correoElectronico: formData.get('correoElectronico'),
                  telefono: formData.get('telefono'),
                  direccion: formData.get('direccion'),
                  estado: formData.get('estado'),
                  notas: formData.get('notas')
                };

                try {
                  if (imagenSeleccionada) {
                    try {
                      const imagenResult = await proveedoresApi.subirImagenProveedor(imagenSeleccionada);
                      proveedorData.imagenProveedor = imagenResult.url;
                    } catch (uploadError) {
                      console.error('Error en la subida de imagen:', uploadError);
                    }
                  } else if (proveedorEditando?.imagenProveedor) {
                    proveedorData.imagenProveedor = proveedorEditando.imagenProveedor;
                  }

                  if (proveedorEditando) {
                    await proveedoresApi.updateProveedor(proveedorEditando.idProveedor, proveedorData);
                  } else {
                    await proveedoresApi.crearProveedor(proveedorData);
                  }

                  setImagenSeleccionada(null);
                  setPrevisualizacionImagen(null);
                  await fetchProveedores();
                  setMostrarFormulario(false);
                  setProveedorEditando(null);
                } catch (error) {
                  console.error('Error al guardar proveedor:', error);
                  alert(error?.mensaje || error?.message || 'Error al guardar el proveedor');
                }
              }} className="space-y-6">
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Imagen del Proveedor</label>

                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImagenSeleccion}
                      className="hidden"
                      id="imagen-proveedor"
                    />
                    <label
                      htmlFor="imagen-proveedor"
                      className="cursor-pointer flex flex-col items-center"
                    >
                      {previsualizacionImagen ? (
                        <div className="relative">
                          <img
                            src={previsualizacionImagen.url}
                            alt={previsualizacionImagen.nombre}
                            className="w-32 h-32 object-cover rounded-lg"
                          />
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              eliminarImagenSeleccionada();
                            }}
                            className="absolute -top-2 -right-2 bg-red-600 text-white p-1 rounded-full hover:bg-red-700 transition"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <Upload className="w-12 h-12 text-gray-400 mb-3" />
                          <span className="text-sm text-gray-600 font-medium">
                            Haz clic para subir imagen
                          </span>
                          <span className="text-xs text-gray-500 mt-1">
                            PNG, JPG, GIF hasta 10MB
                          </span>
                        </>
                      )}
                    </label>
                  </div>

                  {proveedorEditando?.imagenProveedor && !previsualizacionImagen && (
                    <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                      <img
                        src={getImagenUrl(proveedorEditando.imagenProveedor)}
                        alt="Imagen actual"
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="text-sm text-gray-600">
                        <p className="font-medium">Imagen actual</p>
                        <p className="text-xs">Se mantendrá si no subes una nueva</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nombre del Proveedor *</label>
                    <input
                      type="text"
                      name="nombreProveedor"
                      defaultValue={proveedorEditando?.nombreProveedor}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">NIT/CC *</label>
                    <input
                      type="text"
                      name="nitCC"
                      defaultValue={proveedorEditando?.nitCC}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Contacto</label>
                    <input
                      type="text"
                      name="contacto"
                      defaultValue={proveedorEditando?.contacto}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Correo Electrónico</label>
                    <input
                      type="email"
                      name="correoElectronico"
                      defaultValue={proveedorEditando?.correoElectronico}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
                    <input
                      type="tel"
                      name="telefono"
                      defaultValue={proveedorEditando?.telefono}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                    <select
                      name="estado"
                      defaultValue={proveedorEditando?.estado || 'activo'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="activo">Activo</option>
                      <option value="inactivo">Inactivo</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Dirección</label>
                  <textarea
                    name="direccion"
                    rows={3}
                    defaultValue={proveedorEditando?.direccion}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notas</label>
                  <textarea
                    name="notas"
                    rows={4}
                    placeholder="Notas adicionales sobre el proveedor..."
                    defaultValue={proveedorEditando?.notas}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setMostrarFormulario(false);
                      setProveedorEditando(null);
                      eliminarImagenSeleccionada();
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    {proveedorEditando ? 'Actualizar' : 'Crear'} Proveedor
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}