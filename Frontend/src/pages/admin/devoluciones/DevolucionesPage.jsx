import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, Plus, Eye, RefreshCw, Trash2, Calendar, DollarSign, Package } from 'lucide-react';
import { devolucionesApi } from '../../../API/devolucionesApi';
import DevolucionEstadosBadge from './DevolucionEstadosBadge';
import DevolucionDetalleModal from './DevolucionDetalleModal';
import DevolucionForm from './DevolucionForm';

/**
 * Página principal de administración de devoluciones
 * Muestra lista de devoluciones con filtros, búsqueda y acciones CRUD
 */
const DevolucionesPage = () => {
  // Estados principales
  const [devoluciones, setDevoluciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  
  // Estados de paginación y filtros
  const [paginacion, setPaginacion] = useState({
    paginaActual: 1,
    totalPaginas: 1,
    totalRegistros: 0
  });
  const [filtros, setFiltros] = useState({
    estado: '',
    tipoDevolucion: '',
    fechaInicio: '',
    fechaFin: '',
    busqueda: ''
  });
  
  // Estados de modales
  const [mostrarDetalleModal, setMostrarDetalleModal] = useState(false);
  const [mostrarFormModal, setMostrarFormModal] = useState(false);
  const [devolucionSeleccionada, setDevolucionSeleccionada] = useState(null);
  const [accionActual, setAccionActual] = useState('ver'); // 'ver', 'editar', 'crear'

  const estadosDevolucion = [
    { value: 'pendiente', label: 'Pendiente' },
    { value: 'aprobada', label: 'Aprobada' },
    { value: 'rechazada', label: 'Rechazada' },
    { value: 'procesada', label: 'Procesada' }
  ];

  // Cargar devoluciones
  const cargarDevoluciones = useCallback(async () => {
    try {
      setCargando(true);
      setError(null);
      
      const params = {
        pagina: paginacion.paginaActual,
        limite: 10,
        ...Object.fromEntries(
          Object.entries(filtros).filter(([_, valor]) => valor !== '')
        )
      };
      
      const response = await devolucionesApi.getDevoluciones(params);
      
      setDevoluciones(response.datos || []);
      setPaginacion(response.paginacion || paginacion);
    } catch (err) {
      console.error('Error al cargar devoluciones:', err);
      setError(err.message || 'Error al cargar las devoluciones');
    } finally {
      setCargando(false);
    }
  }, [paginacion.paginaActual, filtros]);

  // Cargar datos al montar y cuando cambian filtros/página
  useEffect(() => {
    cargarDevoluciones();
  }, [cargarDevoluciones]);

  // Manejar cambios en filtros
  const handleFiltroChange = (nombre, valor) => {
    setFiltros(prev => ({ ...prev, [nombre]: valor }));
    setPaginacion(prev => ({ ...prev, paginaActual: 1 })); // Resetear a página 1
  };

  // Manejar búsqueda
  const handleBusqueda = (termino) => {
    handleFiltroChange('busqueda', termino);
  };

  // Abrir modal para ver detalle
  const handleVerDetalle = (devolucion) => {
    setDevolucionSeleccionada(devolucion);
    setAccionActual('ver');
    setMostrarDetalleModal(true);
  };

  // Abrir modal para crear nueva devolución
  const handleNuevaDevolucion = () => {
    setDevolucionSeleccionada(null);
    setAccionActual('crear');
    setMostrarFormModal(true);
  };

  // Abrir modal para editar devolución
  const handleEditarDevolucion = (devolucion) => {
    setDevolucionSeleccionada(devolucion);
    setAccionActual('editar');
    setMostrarFormModal(true);
  };

  // Cambiar estado de devolución
  const handleCambiarEstado = async (id, nuevoEstado) => {
    try {
      await devolucionesApi.cambiarEstadoDevolucion(id, nuevoEstado);
      cargarDevoluciones(); // Recargar lista
    } catch (err) {
      console.error('Error al cambiar estado:', err);
      setError(err.message || 'Error al cambiar el estado');
    }
  };

  // Eliminar devolución
  const handleEliminarDevolucion = async (id) => {
    if (!confirm('¿Está seguro de eliminar esta devolución? Esta acción no se puede deshacer.')) {
      return;
    }
    
    try {
      await devolucionesApi.deleteDevolucion(id);
      cargarDevoluciones(); // Recargar lista
    } catch (err) {
      console.error('Error al eliminar devolución:', err);
      setError(err.message || 'Error al eliminar la devolución');
    }
  };

  // Formatear fecha
  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Formatear moneda
  const formatearMoneda = (monto) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP'
    }).format(monto);
  };

  // Renderizar tabla
  const renderTabla = () => {
    if (cargando) {
      return (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Cargando devoluciones...</span>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-12">
          <div className="text-red-600 mb-4">{error}</div>
          <button
            onClick={cargarDevoluciones}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4 inline mr-2" />
            Reintentar
          </button>
        </div>
      );
    }

    if (devoluciones.length === 0) {
      return (
        <div className="text-center py-12">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay devoluciones</h3>
          <p className="text-gray-500 mb-4">No se encontraron devoluciones con los filtros actuales.</p>
          <button
            onClick={handleNuevaDevolucion}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 inline mr-2" />
            Crear Devolución
          </button>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Devolución
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Cliente / Venta
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Tipo
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Total
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {devoluciones.map((devolucion, index) => (
              <tr key={devolucion.idDevolucion} className={`hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                      <Package className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{devolucion.numeroDevolucion}</p>
                      <p className="text-xs text-gray-500">{formatearFecha(devolucion.fechaDevolucion)}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm font-medium text-gray-900">
                    {devolucion.usuarioCliente?.nombres} {devolucion.usuarioCliente?.apellidos}
                  </p>
                  <p className="text-xs text-gray-500">Factura: {devolucion.venta?.numeroFactura || '-'}</p>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-1 text-xs rounded-full border ${
                    devolucion.tipoDevolucion === 'total'
                      ? 'bg-purple-50 text-purple-700 border-purple-200'
                      : 'bg-orange-50 text-orange-700 border-orange-200'
                  }`}>
                    {devolucion.tipoDevolucion === 'total' ? 'Total' : 'Parcial'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm font-semibold text-gray-900">{formatearMoneda(devolucion.totalDevolucion)}</p>
                  <p className="text-xs text-gray-500">{devolucion.detalleDevoluciones?.length || 0} items</p>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-2">
                    <DevolucionEstadosBadge estado={devolucion.estado} size="sm" />
                    <select
                      value={devolucion.estado}
                      onChange={(e) => handleCambiarEstado(devolucion.idDevolucion, e.target.value)}
                      className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white focus:ring-2 focus:ring-blue-500"
                    >
                      {estadosDevolucion.map((estado) => (
                        <option key={estado.value} value={estado.value}>
                          {estado.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => handleVerDetalle(devolucion)}
                      className="p-2 rounded-lg text-blue-600 hover:text-blue-900 hover:bg-blue-50"
                      title="Ver detalle"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    {devolucion.estado !== 'procesada' && (
                      <>
                        <button
                          onClick={() => handleEditarDevolucion(devolucion)}
                          className="p-2 rounded-lg text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50"
                          title="Editar"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEliminarDevolucion(devolucion.idDevolucion)}
                          className="p-2 rounded-lg text-red-600 hover:text-red-900 hover:bg-red-50"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Devoluciones</h1>
          <p className="text-gray-600">Gestiona las devoluciones de productos</p>
        </div>
        <button
          onClick={handleNuevaDevolucion}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nueva Devolución
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Búsqueda */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Búsqueda
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar por número, cliente..."
                value={filtros.busqueda}
                onChange={(e) => handleBusqueda(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Estado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estado
            </label>
            <select
              value={filtros.estado}
              onChange={(e) => handleFiltroChange('estado', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Todos</option>
              <option value="pendiente">Pendiente</option>
              <option value="aprobada">Aprobada</option>
              <option value="rechazada">Rechazada</option>
              <option value="procesada">Procesada</option>
            </select>
          </div>

          {/* Tipo de devolución */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo
            </label>
            <select
              value={filtros.tipoDevolucion}
              onChange={(e) => handleFiltroChange('tipoDevolucion', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Todos</option>
              <option value="total">Total</option>
              <option value="parcial">Parcial</option>
            </select>
          </div>

          {/* Fecha */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha
            </label>
            <input
              type="date"
              value={filtros.fechaInicio}
              onChange={(e) => handleFiltroChange('fechaInicio', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Tabla de devoluciones */}
      <div className="bg-white rounded-lg shadow">
        {renderTabla()}
      </div>

      {/* Paginación */}
      {paginacion.totalPaginas > 1 && (
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-700">
            Mostrando {devoluciones.length} de {paginacion.totalRegistros} devoluciones
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setPaginacion(prev => ({ ...prev, paginaActual: Math.max(1, prev.paginaActual - 1) }))}
              disabled={paginacion.paginaActual === 1}
              className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <span className="px-3 py-1">
              Página {paginacion.paginaActual} de {paginacion.totalPaginas}
            </span>
            <button
              onClick={() => setPaginacion(prev => ({ ...prev, paginaActual: Math.min(paginacion.totalPaginas, prev.paginaActual + 1) }))}
              disabled={paginacion.paginaActual === paginacion.totalPaginas}
              className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}

      {/* Modales */}
      {mostrarDetalleModal && (
        <DevolucionDetalleModal
          devolucion={devolucionSeleccionada}
          onClose={() => setMostrarDetalleModal(false)}
        />
      )}

      {mostrarFormModal && (
        <DevolucionForm
          devolucion={devolucionSeleccionada}
          accion={accionActual}
          onClose={() => setMostrarFormModal(false)}
          onSuccess={() => {
            setMostrarFormModal(false);
            cargarDevoluciones();
          }}
        />
      )}
    </div>
  );
};

export default DevolucionesPage;
