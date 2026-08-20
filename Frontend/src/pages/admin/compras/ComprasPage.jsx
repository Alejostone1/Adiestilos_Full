import React, { useState, useEffect } from 'react';
import {
  FiPlus, FiPackage, FiTrendingUp, FiDollarSign, FiCalendar,
  FiEye, FiEdit3, FiArrowRight, FiFilter, FiSearch, FiHash
} from 'react-icons/fi';
import ModalCompra from '../../../components/admin/compras/ModalCompra';
import ModalDetalleCompra from '../../../components/admin/compras/ModalDetalleCompra';
import ModalCambiarEstadoCompra from '../../../components/admin/compras/ModalCambiarEstadoCompra';
import comprasApi from '../../../api/comprasApi';
import { useNavigate } from 'react-router-dom';

const formatearPrecioColombia = (valor) => {
  const numero = Math.round(Number(valor) || 0);
  return numero.toLocaleString('es-CO');
};

const ComprasPage = () => {
  const navigate = useNavigate();
  const [modalCompraOpen, setModalCompraOpen] = useState(false);
  const [modalDetalleOpen, setModalDetalleOpen] = useState(false);
  const [modalEstadoOpen, setModalEstadoOpen] = useState(false);
  const [compraSeleccionada, setCompraSeleccionada] = useState(null);

  const [compras, setCompras] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [filtrosVisibles, setFiltrosVisibles] = useState(false);
  const [filtros, setFiltros] = useState({
    idProveedor: '',
    estado: '',
    fechaInicio: '',
    fechaFin: ''
  });
  const [estadisticas, setEstadisticas] = useState({
    totalCompras: 0,
    totalMes: 0,
    ordenesActivas: 0
  });

  useEffect(() => {
    cargarCompras();
  }, []);

  const cargarComprasConFiltros = async () => {
    setCargando(true);
    try {
      const params = { limite: 10 };
      
      // Agregar filtros si tienen valores
      if (filtros.idProveedor) params.idProveedor = filtros.idProveedor;
      if (filtros.estado) params.estado = filtros.estado;
      if (filtros.fechaInicio) params.fechaInicio = filtros.fechaInicio;
      if (filtros.fechaFin) params.fechaFin = filtros.fechaFin;
      
      const data = await comprasApi.obtenerCompras(params);
      const listaCompras = Array.isArray(data) ? data : data.datos || [];
      setCompras(listaCompras);

      // Calcular estadísticas básicas
      const total = listaCompras.reduce((acc, c) => acc + Number(c.total || 0), 0);
      setEstadisticas({
        totalCompras: (data.paginacion?.totalItems || listaCompras.length),
        totalMes: total,
        ordenesActivas: listaCompras.filter(c => c.estadoPedido?.nombreEstado?.toUpperCase().includes('PENDIENTE')).length
      });
    } catch (error) {
      console.error('Error cargando compras con filtros:', error);
    } finally {
      setCargando(false);
    }
  };

  const cargarCompras = async () => {
    setCargando(true);
    try {
      const data = await comprasApi.obtenerCompras({ limite: 10 });
      const listaCompras = Array.isArray(data) ? data : data.datos || [];
      setCompras(listaCompras);

      // Calcular estadísticas básicas
      const total = listaCompras.reduce((acc, c) => acc + Number(c.total || 0), 0);
      setEstadisticas({
        totalCompras: (data.paginacion?.totalItems || listaCompras.length),
        totalMes: total,
        ordenesActivas: listaCompras.filter(c => c.estadoPedido?.nombreEstado?.toUpperCase().includes('PENDIENTE')).length
      });
    } catch (error) {
      console.error('Error cargando compras:', error);
    } finally {
      setCargando(false);
    }
  };

  const abrirDetalle = (compra) => {
    setCompraSeleccionada(compra);
    setModalDetalleOpen(true);
  };

  const abrirCambioEstado = (compra) => {
    setCompraSeleccionada(compra);
    setModalEstadoOpen(true);
  };

  const handleCompraCreada = () => {
    cargarCompras();
  };

  return (
    <div className="p-4 md:p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900 dark:text-white tracking-tight">
            Gestión de Compras
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium">
            Control de órdenes, proveedores y recepción de mercancía.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/compras/detalle')}
            className="flex items-center gap-2 px-5 py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-white font-semibold rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 hover:bg-gray-50 transition-all"
          >
            <FiPackage className="text-indigo-500" />
            <span>Ver Análisis de Ítems</span>
          </button>
          <button
            onClick={() => setModalCompraOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold rounded-2xl shadow-lg shadow-indigo-500/30 hover:scale-105 transition-all"
          >
            <FiPlus />
            <span>Nueva Compra</span>
          </button>
        </div>
      </div>

        {/* Dashboard de KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <KPICard
            title="Órdenes Totales"
            value={estadisticas.totalCompras}
            icon={<FiPackage />}
            color="indigo"
          />
          <KPICard
            title="Inversión Mensual"
            value={`$${formatearPrecioColombia(estadisticas.totalMes)}`}
            icon={<FiDollarSign />}
            color="emerald"
          />
          <KPICard
            title="Pendientes por Recibir"
            value={estadisticas.ordenesActivas}
            icon={<FiTrendingUp />}
            color="amber"
          />
        </div>

        {/* Tabla Principal */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-800 overflow-hidden">
          <div className="p-8 border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row justify-between items-center gap-4">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white flex items-center gap-3">
              Historial Reabastecimiento
              <span className="text-sm font-medium bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full text-gray-500">
                {compras.length} registros
              </span>
            </h2>
            <div className="flex items-center gap-3">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar compra..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all w-64"
                />
              </div>
              <button 
                onClick={() => setFiltrosVisibles(!filtrosVisibles)}
                className={`p-2 rounded-xl transition-colors ${
                  filtrosVisibles 
                    ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' 
                    : 'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <FiFilter className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Panel de Filtros */}
          {filtrosVisibles && (
            <div className="px-8 py-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Proveedor</label>
                  <select
                    value={filtros.idProveedor}
                    onChange={(e) => setFiltros({...filtros, idProveedor: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm"
                  >
                    <option value="">Todos</option>
                    {/* Aquí podrías cargar los proveedores dinámicamente */}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Estado</label>
                  <select
                    value={filtros.estado}
                    onChange={(e) => setFiltros({...filtros, estado: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm"
                  >
                    <option value="">Todos</option>
                    <option value="8">Recibida</option>
                    <option value="9">Pendiente</option>
                    <option value="10">Parcial</option>
                    <option value="7">Cancelada</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Fecha Inicio</label>
                  <input
                    type="date"
                    value={filtros.fechaInicio}
                    onChange={(e) => setFiltros({...filtros, fechaInicio: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Fecha Fin</label>
                  <input
                    type="date"
                    value={filtros.fechaFin}
                    onChange={(e) => setFiltros({...filtros, fechaFin: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm"
                  />
                </div>
              </div>
              <div className="flex justify-end mt-4 gap-2">
                <button
                  onClick={() => {
                    setFiltros({idProveedor: '', estado: '', fechaInicio: '', fechaFin: ''});
                    setBusqueda('');
                  }}
                  className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                >
                  Limpiar
                </button>
                <button
                  onClick={() => cargarComprasConFiltros()}
                  className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700"
                >
                  Aplicar Filtros
                </button>
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            {cargando ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                <p className="font-medium text-gray-500 animate-pulse">Analizando registros de almacén...</p>
              </div>
            ) : compras.length === 0 ? (
              <EmptyState onClick={() => setModalCompraOpen(true)} />
            ) : (
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-50/50 dark:bg-gray-800/50">
                    <th className="px-8 py-5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Identificación</th>
                    <th className="px-8 py-5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Socio Proveedor</th>
                    <th className="px-8 py-5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Cronología</th>
                    <th className="px-8 py-5 text-right text-xs font-semibold text-gray-400 uppercase tracking-wide">Monto Total</th>
                    <th className="px-8 py-5 text-center text-xs font-semibold text-gray-400 uppercase tracking-wide">Estado Vital</th>
                    <th className="px-8 py-5 text-center text-xs font-semibold text-gray-400 uppercase tracking-wide">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {compras.map((compra) => (
                    <tr key={compra.idCompra} className="hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-semibold">
                            <FiHash />
                          </div>
                          <div>
                            <span className="block font-semibold text-gray-900 dark:text-white text-sm">
                              {compra.numeroCompra || `#${compra.idCompra}`}
                            </span>
                            <span className="text-[11px] text-gray-400 font-semibold uppercase tracking-tighter">ID: {compra.idCompra}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">{compra.proveedor?.nombreProveedor || 'N/A'}</span>
                          <span className="text-[11px] text-gray-400 font-medium">Verificado por {compra.usuarioRegistro?.usuario || 'Sist.'}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center space-x-2 text-sm text-gray-500 font-medium">
                          <FiCalendar className="text-gray-400" />
                          <span>{new Date(compra.fechaCompra).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <span className="text-base font-semibold text-indigo-600 dark:text-indigo-400">
                          ${formatearPrecioColombia(compra.total)}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <div
                          className="inline-flex items-center px-4 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-wide border"
                          style={{
                            backgroundColor: `${compra.estadoPedido?.color}15` || '#F3F4F6',
                            color: compra.estadoPedido?.color || '#6B7280',
                            borderColor: `${compra.estadoPedido?.color}30` || '#E5E7EB'
                          }}
                        >
                          <span className="w-1.5 h-1.5 rounded-full mr-2 shadow-sm" style={{ backgroundColor: compra.estadoPedido?.color || '#9CA3AF' }} />
                          {compra.estadoPedido?.nombreEstado || compra.estado || 'Pendiente'}
                        </div>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => abrirDetalle(compra)}
                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 hover:bg-blue-600 hover:text-white border border-blue-100 dark:border-blue-800/60 hover:border-blue-600 shadow-sm hover:shadow-md hover:shadow-blue-500/20 hover:-translate-y-0.5 active:scale-95 transition-all"
                            title="Ver Detalle"
                          >
                            <FiEye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => abrirCambioEstado(compra)}
                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-300 hover:bg-emerald-600 hover:text-white border border-emerald-100 dark:border-emerald-800/60 hover:border-emerald-600 shadow-sm hover:shadow-md hover:shadow-emerald-500/20 hover:-translate-y-0.5 active:scale-95 transition-all"
                            title="Flujo de Estado"
                          >
                            <FiEdit3 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

      {/* Modales */}
      <ModalCompra
        isOpen={modalCompraOpen}
        onClose={() => setModalCompraOpen(false)}
        onCompraCreada={handleCompraCreada}
      />

      <ModalDetalleCompra
        isOpen={modalDetalleOpen}
        onClose={() => setModalDetalleOpen(false)}
        compra={compraSeleccionada}
      />

      <ModalCambiarEstadoCompra
        isOpen={modalEstadoOpen}
        onClose={() => setModalEstadoOpen(false)}
        compra={compraSeleccionada}
        onEstadoActualizado={cargarCompras}
      />
    </div>
  );
};

/* Componentes de apoyo internos */

const KPICard = ({ title, value, icon, color }) => {
  const themes = {
    indigo: "from-indigo-500 to-blue-600 shadow-indigo-200",
    emerald: "from-emerald-500 to-teal-600 shadow-emerald-200",
    amber: "from-amber-500 to-orange-600 shadow-amber-200"
  };

  return (
    <div className="relative group overflow-hidden bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-xl shadow-gray-100 transition-all hover:shadow-2xl hover:-translate-y-1">
      <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${themes[color]} opacity-5 rounded-bl-full translate-x-6 -translate-y-6 group-hover:scale-150 transition-transform duration-700`} />
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{title}</span>
          <p className="text-3xl font-semibold text-gray-900 dark:text-white tracking-tighter">{value}</p>
        </div>
        <div className={`h-14 w-14 bg-gradient-to-br ${themes[color]} rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

const EmptyState = ({ onClick }) => (
  <div className="text-center py-24 px-8 group">
    <div className="relative inline-block mb-6">
      <div className="absolute inset-0 bg-indigo-500 rounded-full blur-2xl opacity-10 group-hover:opacity-20 transition-opacity" />
      <FiPackage className="h-20 w-20 text-gray-200 dark:text-gray-800 mx-auto relative z-10" />
    </div>
    <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">Bóveda de Compras Vacía</h3>
    <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-xs mx-auto">Comienza abastecer tu inventario registrando tu primera orden de compra estratégica.</p>
    <button
      onClick={onClick}
      className="inline-flex items-center space-x-2 text-indigo-600 hover:text-indigo-700 font-semibold uppercase tracking-wide text-[11px] transition-all"
    >
      <span>Ejecutar Primera Compra</span>
      <FiArrowRight className="h-3 w-3" />
    </button>
  </div>
);

export default ComprasPage;
