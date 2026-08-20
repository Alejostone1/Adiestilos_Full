import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  History,
  Search,
  Filter,
  X,
  Calendar,
  User,
  Tag,
  DollarSign,
  Receipt,
  Download,
  RefreshCcw,
  Loader2,
  Eye,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  CreditCard,
  Mail
} from 'lucide-react';
import { descuentosApi } from '../../../api/descuentosApi';
import { usuariosApi } from '../../../api/usuariosApi';
import PrecioFormateado from '../../../components/common/PrecioFormateado';
import { useAuth } from "../../../context/AuthContext";
import { motion, AnimatePresence } from 'framer-motion';

export default function HistorialDescuentosPage() {
  const navigate = useNavigate();
  const { token } = useAuth();

  // Estados principales
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Estados de paginación y filtros
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const [filters, setFilters] = useState({
    idDescuento: '',
    idUsuario: '',
    fechaInicio: '',
    fechaFin: ''
  });

  // Estados de UI
  const [showFilters, setShowFilters] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Estados para datos auxiliares
  const [descuentos, setDescuentos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);

  // Cargar datos iniciales
  const cargarDatos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [historialRes, descuentosRes, usuariosRes] = await Promise.all([
        descuentosApi.obtenerHistorialGeneral({
          page: pagination.page,
          limit: pagination.limit,
          ...Object.fromEntries(
            Object.entries(filters).filter(([_, value]) => value !== '')
          )
        }),
        descuentosApi.obtenerDescuentos({ limit: 100 }),
        usuariosApi.getUsuarios({ limit: 100 }) // FIXED: Changed obtenerUsuarios to getUsuarios
      ]);

      setHistorial(historialRes.historial || []);
      setPagination(prev => ({
        ...prev,
        total: historialRes.total || 0,
        totalPages: historialRes.totalPages || 0
      }));
      setDescuentos(descuentosRes.descuentos || []);
      setUsuarios(usuariosRes.usuarios || []);
    } catch (err) {
      console.error('Error al cargar datos:', err);
      setError(err.message || 'Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, filters]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  // Manejo de filtros
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({
      idDescuento: '',
      idUsuario: '',
      fechaInicio: '',
      fechaFin: ''
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // UI Helpers
  const getDescuentoNombre = (idDescuento) => {
    const descuento = descuentos.find(d => d.idDescuento === idDescuento);
    return descuento ? descuento.nombreDescuento : 'Descuento #' + idDescuento;
  };

  const getUsuarioNombre = (idUsuario) => {
    const usuario = usuarios.find(u => u.idUsuario === idUsuario);
    if (usuario) {
      return `${usuario.nombres} ${usuario.apellidos}`;
    }
    return 'Usuario #' + idUsuario;
  };

  const openDetailsModal = (item) => {
    setSelectedItem(item);
    setShowDetailsModal(true);
  };

  const exportarDatos = () => {
    // Crear CSV
    const headers = [
      'ID Historial',
      'Descuento',
      'Usuario',
      'Venta',
      'Valor Aplicado',
      'Fecha Uso'
    ];

    const csvContent = [
      headers.join(','),
      ...historial.map(item => [
        item.idHistorialDescuento,
        `"${getDescuentoNombre(item.idDescuento)}"`,
        `"${getUsuarioNombre(item.idUsuario)}"`,
        item.venta?.numeroFactura || 'N/A',
        item.valorAplicado,
        new Date(item.fechaUso).toLocaleString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `historial_descuentos_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- Premium UI Components ---

  const StatCard = ({ title, value, icon: Icon, color, secondaryValue }) => (
    <div className="relative overflow-hidden bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 group hover:shadow-md transition-all duration-300">
      <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity`}>
        <Icon className={`w-24 h-24 text-${color}-600`} />
      </div>
      <div className="relative z-10 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{value}</h3>
          {secondaryValue && <p className="text-xs text-gray-400 mt-2 font-medium">{secondaryValue}</p>}
        </div>
        <div className={`w-12 h-12 rounded-xl bg-${color}-50 dark:bg-${color}-900/20 flex items-center justify-center text-${color}-600 dark:text-${color}-400`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900 p-6 space-y-8 animate-fade-in transition-colors duration-300">

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
            <History className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            Historial de Uso
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-lg">Monitorea en tiempo real quién está usando tus promociones.</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={exportarDatos}
          disabled={loading || historial.length === 0}
          className="bg-emerald-600 text-white px-6 py-3 rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-200 dark:shadow-none transition-all flex items-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="w-5 h-5" />
          Exportar Reporte CSV
        </motion.button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
            title="Total Usos Registrados"
            value={pagination.total}
            icon={Tag}
            color="blue"
            secondaryValue="Transacciones totales"
        />
        <StatCard
            title="Ahorro Entregado"
            value={<PrecioFormateado precio={historial.reduce((sum, item) => sum + parseFloat(item.valorAplicado), 0)} />}
            icon={TrendingDown}
            color="green"
            secondaryValue="Descuentos aplicados"
        />
        <StatCard
            title="Cupones Únicos"
            value={new Set(historial.map(item => item.idDescuento)).size}
            icon={Receipt}
            color="purple"
            secondaryValue="Variedad de promociones"
        />
      </div>

      {/* Toolbar & Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors duration-300">
        <div className="p-4 flex flex-col md:flex-row items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-2 w-full md:w-auto flex-1">
                 <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors font-medium ${
                      showFilters
                      ? 'bg-indigo-50 border-indigo-200 text-indigo-600 dark:bg-indigo-900/20 dark:border-indigo-800 dark:text-indigo-400'
                      : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                >
                  <Filter className="w-4 h-4" />
                  Filtros Avanzados
                </button>
                {(filters.idDescuento || filters.idUsuario || filters.fechaInicio || filters.fechaFin) && (
                    <button onClick={clearFilters} className="text-xs text-red-500 hover:text-red-400 font-medium px-2">
                        Limpiar filtros
                    </button>
                )}
            </div>
            <button
                onClick={cargarDatos}
                className="p-2 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                title="Actualizar tabla"
            >
                <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="p-4 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700 grid grid-cols-1 md:grid-cols-4 gap-4"
            >
              <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">Por Promoción</label>
                  <select
                    value={filters.idDescuento}
                    onChange={(e) => handleFilterChange('idDescuento', e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:border-indigo-500 dark:text-white transition-colors"
                  >
                    <option value="">Todas</option>
                    {descuentos.map(descuento => (
                      <option key={descuento.idDescuento} value={descuento.idDescuento}>
                        {descuento.nombreDescuento}
                      </option>
                    ))}
                  </select>
              </div>

               <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">Por Usuario</label>
                  <select
                    value={filters.idUsuario}
                    onChange={(e) => handleFilterChange('idUsuario', e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:border-indigo-500 dark:text-white transition-colors"
                  >
                    <option value="">Todos</option>
                    {usuarios.map(usuario => (
                      <option key={usuario.idUsuario} value={usuario.idUsuario}>
                        {usuario.nombres} {usuario.apellidos}
                      </option>
                    ))}
                  </select>
              </div>

               <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">Desde</label>
                  <input
                    type="date"
                    value={filters.fechaInicio}
                    onChange={(e) => handleFilterChange('fechaInicio', e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:border-indigo-500 dark:text-white transition-colors"
                  />
              </div>

               <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">Hasta</label>
                  <input
                    type="date"
                    value={filters.fechaFin}
                    onChange={(e) => handleFilterChange('fechaFin', e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:border-indigo-500 dark:text-white transition-colors"
                  />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Table Content */}
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full">
            <thead className="bg-gray-50/80 dark:bg-gray-700/50 backdrop-blur sticky top-0 z-10 text-left">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Fecha y Hora</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Promoción Utilizada</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Usuario</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Detalles Venta</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ahorro</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700 bg-white dark:bg-gray-800">
               {loading && historial.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mx-auto" />
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Cargando historial...</p>
                  </td>
                </tr>
              ) : historial.length === 0 ? (
                <tr>
                   <td colSpan="6" className="px-6 py-16 text-center text-gray-500 dark:text-gray-400">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                      <History className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Sin registros</h3>
                    <p>No se encontraron usos de descuentos con los filtros actuales.</p>
                  </td>
                </tr>
              ) : (
                historial.map((item) => (
                  <tr key={item.idHistorialDescuento} className="group hover:bg-gray-50/60 dark:hover:bg-gray-700/40 transition-colors">
                     <td className="px-6 py-4">
                        <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-gray-400" />
                                {new Date(item.fechaUso).toLocaleDateString()}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-500 ml-6">
                                {new Date(item.fechaUso).toLocaleTimeString()}
                            </span>
                        </div>
                     </td>
                     <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                                <Tag className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-900 dark:text-white">{getDescuentoNombre(item.idDescuento)}</p>
                                {item.descuento && (
                                     <span className="text-xs text-purple-600 dark:text-purple-400 font-medium inline-block bg-purple-50 dark:bg-purple-900/20 px-1.5 rounded mt-0.5">
                                        {item.descuento.tipoDescuento === 'porcentaje' ? `${item.descuento.valorDescuento}% OFF` : <PrecioFormateado precio={item.descuento.valorDescuento} />}
                                     </span>
                                )}
                            </div>
                        </div>
                     </td>
                     <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                             <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                <User className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">{getUsuarioNombre(item.idUsuario)}</p>
                                {item.usuario && <p className="text-xs text-gray-500 dark:text-gray-400">{item.usuario.correoElectronico}</p>}
                            </div>
                        </div>
                     </td>
                     <td className="px-6 py-4">
                        <div className="flex flex-col">
                             <span className="text-sm text-gray-900 dark:text-gray-200 font-mono">
                                 {item.venta?.numeroFactura || 'N/A'}
                             </span>
                             {item.venta && (
                                 <span className="text-xs text-gray-500 dark:text-gray-400">
                                     Total: <PrecioFormateado precio={item.venta.total} />
                                 </span>
                             )}
                        </div>
                     </td>
                     <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 text-sm font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-lg">
                            -<PrecioFormateado precio={item.valorAplicado} />
                        </span>
                     </td>
                     <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => openDetailsModal(item)}
                          className="p-2 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-lg transition-all"
                          title="Ver detalles completos"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                     </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {pagination.totalPages > 1 && (
            <div className="p-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between bg-gray-50 dark:bg-gray-800/50">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                    Página {pagination.page} de {pagination.totalPages}
                </span>
                <div className="flex space-x-2">
                    <button
                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                        disabled={pagination.page === 1}
                        className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-700 dark:text-gray-200"
                    >
                        Anterior
                    </button>
                    <button
                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                        disabled={pagination.page === pagination.totalPages}
                        className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-700 dark:text-gray-200"
                    >
                        Siguiente
                    </button>
                </div>
            </div>
        )}
      </div>

       {/* Modal Detalle */}
       <AnimatePresence>
       {showDetailsModal && selectedItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-100 dark:border-gray-700"
          >
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Receipt className="w-5 h-5 text-indigo-500" />
                Detalle de Transacción
              </h3>
              <button onClick={() => { setShowDetailsModal(false); setSelectedItem(null); }} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors">
                  <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            <div className="p-8">
                <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-6 mb-8 text-center border border-indigo-100 dark:border-indigo-900/50">
                    <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400 mb-1">Ahorro Total Aplicado</p>
                    <p className="text-4xl font-extrabold text-indigo-700 dark:text-indigo-300">
                        -<PrecioFormateado precio={selectedItem.valorAplicado} />
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Tag className="w-4 h-4 text-purple-500" />
                            <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Promoción</h4>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-xl border border-gray-100 dark:border-gray-700 space-y-3">
                             <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Nombre</p>
                                <p className="font-medium text-gray-900 dark:text-white">{getDescuentoNombre(selectedItem.idDescuento)}</p>
                             </div>
                             {selectedItem.descuento && (
                                <>
                                    <div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Configuración</p>
                                        <p className="font-medium text-gray-900 dark:text-white">
                                            {selectedItem.descuento.tipoDescuento === 'porcentaje' ? `${selectedItem.descuento.valorDescuento}%` : <PrecioFormateado precio={selectedItem.descuento.valorDescuento} />}
                                            <span className="text-gray-400 text-sm mx-1">•</span>
                                            <span className="capitalize">{selectedItem.descuento.aplicaA.replace('_', ' ')}</span>
                                            {selectedItem.descuento.aplicaA === 'producto' && selectedItem.descuento.producto && (
                                                <>
                                                    <span className="text-gray-400 text-sm mx-1">•</span>
                                                    <span className="text-indigo-600 dark:text-indigo-400 font-bold">{selectedItem.descuento.producto.nombreProducto}</span>
                                                </>
                                            )}
                                            {selectedItem.descuento.aplicaA === 'categoria' && selectedItem.descuento.categoria && (
                                                <>
                                                    <span className="text-gray-400 text-sm mx-1">•</span>
                                                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">Cat: {selectedItem.descuento.categoria.nombreCategoria}</span>
                                                </>
                                            )}
                                        </p>
                                    </div>
                                </>
                             )}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <User className="w-4 h-4 text-blue-500" />
                            <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Cliente</h4>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-xl border border-gray-100 dark:border-gray-700 space-y-3">
                             <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Nombre</p>
                                <p className="font-medium text-gray-900 dark:text-white">{getUsuarioNombre(selectedItem.idUsuario)}</p>
                             </div>
                             {selectedItem.usuario && (
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Contacto</p>
                                    <p className="font-medium text-gray-900 dark:text-white text-sm break-all">{selectedItem.usuario.correoElectronico}</p>
                                </div>
                             )}
                        </div>
                    </div>
                </div>

                <div className="mt-8 pt-8 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-2 mb-4">
                        <CreditCard className="w-4 h-4 text-emerald-500" />
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Detalles de la Factura</h4>
                    </div>
                    {selectedItem.venta ? (
                        <div className="flex flex-col md:flex-row justify-between gap-4 bg-emerald-50 dark:bg-emerald-900/10 p-4 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
                            <div>
                                <p className="text-xs text-emerald-600 dark:text-emerald-400 mb-1">Nº Factura</p>
                                <p className="font-mono font-bold text-gray-900 dark:text-white">{selectedItem.venta.numeroFactura}</p>
                            </div>
                            <div>
                                <p className="text-xs text-emerald-600 dark:text-emerald-400 mb-1">Fecha de Compra</p>
                                <p className="font-medium text-gray-900 dark:text-white">{new Date(selectedItem.venta.creadoEn).toLocaleString()}</p>
                            </div>
                            <div className="md:text-right">
                                <p className="text-xs text-emerald-600 dark:text-emerald-400 mb-1">Monto Total</p>
                                <p className="font-bold text-gray-900 dark:text-white text-lg"><PrecioFormateado precio={selectedItem.venta.total} /></p>
                            </div>
                        </div>
                    ) : (
                        <p className="text-gray-500 italic text-center py-4">Información de venta vinculada no disponible.</p>
                    )}
                </div>
            </div>

            <div className="p-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-end rounded-b-2xl">
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedItem(null);
                }}
                className="px-6 py-2.5 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors font-medium shadow-sm"
              >
                Cerrar Detalle
              </button>
            </div>
          </motion.div>
        </div>
       )}
       </AnimatePresence>

    </div>
  );
}
