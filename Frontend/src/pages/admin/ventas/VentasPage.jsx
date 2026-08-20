import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiPlus, FiSearch, FiFilter, FiCalendar, FiDollarSign,
  FiPackage, FiTrendingUp, FiUsers, FiEye,
  FiEdit3, FiDownload, FiActivity
} from 'react-icons/fi';
import { ventasApi } from '../../../api/ventasApi';
import { estadosPedidoApi } from '../../../api/estadosPedidoApi';
import ModalVenta from '../../../components/admin/ventas/ModalVenta';
import Swal from 'sweetalert2';

const VentasPage = () => {
  // ========================================
  // ESTADOS DEL COMPONENTE
  // ========================================
  const [ventas, setVentas] = useState([]); // Lista de ventas
  const [cargando, setCargando] = useState(true); // Estado de carga
  const [modalVentaOpen, setModalVentaOpen] = useState(false); // Control del modal de nueva venta
  const [estadosPedido, setEstadosPedido] = useState([]); // Lista de estados disponibles
  const [modalEstadoOpen, setModalEstadoOpen] = useState(false); // Control del modal de cambio de estado
  const [ventaSeleccionada, setVentaSeleccionada] = useState(null); // Venta seleccionada para cambiar estado

  // Filtros de búsqueda y paginación
  const [filtros, setFiltros] = useState({
    pagina: 1,
    limite: 10,
    busqueda: '',
    estadoPedido: ''
  });

  const [paginacion, setPaginacion] = useState({}); // Metadata de paginación

  const navigate = useNavigate();

  // ========================================
  // EFECTOS - CARGA INICIAL DE DATOS
  // ========================================

  // Cargar ventas cada vez que cambien los filtros
  useEffect(() => {
    cargarVentas();
  }, [filtros]);

  // Cargar estados de pedido una sola vez al montar el componente
  useEffect(() => {
    const cargarEstadosPedido = async () => {
      try {
        const res = await estadosPedidoApi.getEstadosPedido();
        setEstadosPedido(res.datos || []);
      } catch (error) {
        console.error('Error cargando estados de pedido:', error);
      }
    };
    cargarEstadosPedido();
  }, []);

  // ========================================
  // FUNCIONES DE DATOS
  // ========================================

  /**
   * Carga la lista de ventas desde el API
   */
  const cargarVentas = async () => {
    setCargando(true);
    try {
      const res = await ventasApi.getVentas(filtros);
      setVentas(res.datos || []);
      setPaginacion(res.paginacion || {});
    } catch (error) {
      console.error("Error cargando ventas", error);
      Swal.fire('Error', 'No se pudieron cargar las ventas', 'error');
    } finally {
      setCargando(false);
    }
  };

  /**
   * Cambia el estado de un pedido
   * @param {number} idVenta - ID de la venta a actualizar
   * @param {number} nuevoEstadoId - ID del nuevo estado
   */
  const cambiarEstadoPedido = async (idVenta, nuevoEstadoId) => {
    try {
      await ventasApi.actualizarEstado(idVenta, nuevoEstadoId);
      await cargarVentas();
      setModalEstadoOpen(false);
      setVentaSeleccionada(null);
      Swal.fire('Éxito', 'Estado del pedido actualizado correctamente', 'success');
    } catch (error) {
      console.error('Error cambiando estado:', error);
      Swal.fire('Error', 'No se pudo cambiar el estado del pedido', 'error');
    }
  };

  /**
   * Abre el modal para cambiar el estado de una venta
   * @param {object} venta - Objeto de venta seleccionada
   */
  const abrirModalEstado = (venta) => {
    setVentaSeleccionada(venta);
    setModalEstadoOpen(true);
  };

  // ========================================
  // FUNCIONES DE FORMATO Y UTILIDADES
  // ========================================

  /**
   * Formatea un valor numérico como moneda colombiana (COP)
   * @param {number} valor - Valor a formatear
   * @returns {string} Valor formateado como moneda
   */
  const formatearPrecio = (valor) => {
    return Number(valor).toLocaleString('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    });
  };

  /**
   * Determina el color de texto adecuado según el color de fondo
   * Calcula el brillo del color hexadecimal y decide si usar texto claro u oscuro
   * @param {string} colorHex - Color hexadecimal (ej: #F59E0B)
   * @returns {string} Clase de Tailwind para el color de texto
   */
  const getStatusColor = (colorHex) => {
    if (!colorHex) return 'bg-gray-100 text-gray-700 dark:bg-gray-700/30 dark:text-gray-400';

    // Convertir hex a RGB
    const hex = colorHex.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);

    // Calcular brillo usando la fórmula de luminancia percibida
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;

    // Si el brillo es mayor a 155, usar texto oscuro, sino texto claro
    const textColor = brightness > 155 ? 'text-gray-800' : 'text-white';

    return `${textColor}`;
  };

  /**
   * Retorna las clases de color para el estado de pago
   * @param {string} estado - Estado del pago (pagada, parcial, pendiente)
   * @returns {string} Clases de Tailwind para el indicador de pago
   */
  const getPagoColor = (estado) => {
    const colors = {
      'pagada': 'bg-emerald-500 text-white',
      'parcial': 'bg-amber-500 text-white',
      'pendiente': 'bg-gray-400 text-white',
    };
    return colors[estado] || 'bg-gray-400 text-white';
  };

  // ========================================
  // CÁLCULOS DE KPIs
  // ========================================

  // Total vendido en las ventas actuales cargadas
  const totalVendido = ventas.reduce((acc, v) => acc + Number(v.total || 0), 0);

  // Ticket promedio (valor promedio por venta)
  const ticketPromedio = ventas.length > 0 ? totalVendido / ventas.length : 0;

  // Número de clientes únicos
  const clientesUnicos = new Set(ventas.map(v => v.idUsuario)).size;

  // ========================================
  // RENDER DEL COMPONENTE
  // ========================================

  return (
    <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-500">

      {/* ========================================
          HEADER & ACTIONS
          ======================================== */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-800 dark:text-white flex items-center gap-3">
            <FiDollarSign className="text-indigo-600" />
            Ventas & Facturación
          </h1>
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-1">
            Gestión Centralizada de Salidas
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Botón para ver análisis detallado */}
          <button
            onClick={() => navigate('/admin/ventas/detalles')}
            className="flex items-center gap-2 px-5 py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-white font-bold rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 hover:bg-gray-50 transition-all"
          >
            <FiActivity className="text-indigo-500" />
            <span>Ver Análisis Detallado</span>
          </button>

          {/* Botón para crear nueva venta */}
          <button
            onClick={() => setModalVentaOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-black rounded-2xl shadow-lg shadow-indigo-500/30 hover:scale-105 active:scale-95 transition-all"
          >
            <FiPlus className="h-5 w-5" />
            <span>Nueva Venta</span>
          </button>
        </div>
      </div>

      {/* ========================================
          KPI CARDS - MÉTRICAS PRINCIPALES
          ======================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            icon: <FiDollarSign />,
            label: 'Ventas Totales',
            value: formatearPrecio(totalVendido),
            color: 'indigo',
            trend: '+12.5%'
          },
          {
            icon: <FiPackage />,
            label: 'Ordenes Procesadas',
            value: paginacion.totalRegistros || ventas.length,
            color: 'blue',
            trend: 'Hoy'
          },
          {
            icon: <FiTrendingUp />,
            label: 'Ticket Promedio',
            value: formatearPrecio(ticketPromedio),
            color: 'emerald',
            trend: 'Estable'
          },
          {
            icon: <FiUsers />,
            label: 'Clientes Alcanzados',
            value: clientesUnicos,
            color: 'rose',
            trend: 'Nuevos'
          }
        ].map((kpi, i) => (
          <div
            key={i}
            className="bg-white dark:bg-gray-800 p-6 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-700 group hover:border-indigo-500 transition-all"
          >
            {/* Icono del KPI */}
            <div className={`h-12 w-12 rounded-2xl bg-${kpi.color}-50 dark:bg-${kpi.color}-900/20 text-${kpi.color}-600 dark:text-${kpi.color}-400 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform`}>
              {kpi.icon}
            </div>

            {/* Etiqueta del KPI */}
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              {kpi.label}
            </p>

            {/* Valor y tendencia */}
            <div className="flex items-end justify-between mt-1">
              <h3 className="text-xl font-black text-gray-800 dark:text-white">
                {kpi.value}
              </h3>
              <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded-full">
                {kpi.trend}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* ========================================
          TABLA DE VENTAS
          ======================================== */}
      <div className="bg-white dark:bg-gray-800 rounded-[3rem] shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">

        {/* ========================================
            TOOLBAR - BÚSQUEDA Y FILTROS
            ======================================== */}
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Barra de búsqueda */}
          <div className="relative w-full md:w-96">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por factura o cliente..."
              className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
              value={filtros.busqueda}
              onChange={(e) => setFiltros({ ...filtros, busqueda: e.target.value })}
            />
          </div>

          {/* Botones de filtros */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-300 font-bold rounded-2xl border border-gray-100 dark:border-gray-700 hover:bg-gray-100 transition-all">
              <FiFilter /> Filtros
            </button>
            <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-300 font-bold rounded-2xl border border-gray-100 dark:border-gray-700 hover:bg-gray-100 transition-all">
              <FiCalendar /> Fecha
            </button>
          </div>
        </div>

        {/* ========================================
            TABLA DE DATOS
            ======================================== */}
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left">
            {/* Encabezados de la tabla */}
            <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-400 text-[10px] font-black uppercase tracking-widest">
              <tr>
                <th className="py-4 px-8">Nº Factura</th>
                <th className="py-4 px-4">Cliente</th>
                <th className="py-4 px-4">Fecha</th>
                <th className="py-4 px-4 text-right">Total</th>
                <th className="py-4 px-4 text-center">Estado Pedido</th>
                <th className="py-4 px-4 text-center">Pago</th>
                <th className="py-4 px-8 text-right">Acciones</th>
              </tr>
            </thead>

            {/* Cuerpo de la tabla */}
            <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
              {cargando ? (
                // Estado de carga
                <tr>
                  <td colSpan="7" className="py-20 text-center text-gray-400 font-bold">
                    Cargando transacciones...
                  </td>
                </tr>
              ) : ventas.length === 0 ? (
                // Sin resultados
                <tr>
                  <td colSpan="7" className="py-20 text-center text-gray-400 font-bold">
                    No se encontraron ventas registradas.
                  </td>
                </tr>
              ) : (
                // Filas de ventas
                ventas.map((venta) => (
                  <tr
                    key={venta.idVenta}
                    className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors group"
                  >
                    {/* Número de factura */}
                    <td className="py-5 px-8">
                      <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded-lg">
                        {venta.numeroFactura}
                      </span>
                    </td>

                    {/* Información del cliente */}
                    <td className="py-5 px-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-gray-800 dark:text-gray-100">
                          {venta.usuarioCliente?.nombres} {venta.usuarioCliente?.apellidos}
                        </span>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                          {venta.usuarioCliente?.usuario || 'Consumidor Final'}
                        </span>
                      </div>
                    </td>

                    {/* Fecha de creación */}
                    <td className="py-5 px-4 text-xs font-bold text-gray-500">
                      {new Date(venta.creadoEn).toLocaleDateString()}
                    </td>

                    {/* Total de la venta */}
                    <td className="py-5 px-4 text-right">
                      <span className="text-sm font-black text-gray-800 dark:text-white">
                        {formatearPrecio(venta.total)}
                      </span>
                    </td>

                    {/* Estado del pedido - CLICKEABLE para cambiar estado */}
                    <td className="py-5 px-4 text-center">
                      <button
                        onClick={() => abrirModalEstado(venta)}
                        className={`px-4 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105 hover:shadow-lg ${getStatusColor(venta.estadoPedido?.color)}`}
                        style={{ backgroundColor: venta.estadoPedido?.color || '#6B7280' }}
                        title="Click para cambiar estado"
                      >
                        {venta.estadoPedido?.nombreEstado || 'Desconocido'}
                      </button>
                    </td>

                    {/* Estado de pago */}
                    <td className="py-5 px-4 text-center">
                      <span className={`h-2.5 w-2.5 rounded-full inline-block mr-2 ${getPagoColor(venta.estadoPago)}`}></span>
                      <span className="text-[10px] font-black uppercase text-gray-500 dark:text-gray-400">
                        {venta.estadoPago}
                      </span>
                    </td>

                    {/* Acciones - Botones de acción que aparecen al hover */}
                    <td className="py-5 px-8 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {/* Ver detalles */}
                        <button
                          onClick={() => navigate(`/admin/ventas/detalles/${venta.idVenta}`)}
                          className="p-2 bg-gray-100 dark:bg-gray-700 text-gray-500 hover:text-indigo-600 rounded-xl transition-all"
                          title="Ver detalles"
                        >
                          <FiEye className="h-4 w-4" />
                        </button>

                        {/* Descargar factura */}
                        <button className="p-2 bg-gray-100 dark:bg-gray-700 text-gray-500 hover:text-indigo-600 rounded-xl transition-all">
                          <FiDownload className="h-4 w-4" />
                        </button>

                        {/* Cambiar estado */}
                        <button
                          onClick={() => abrirModalEstado(venta)}
                          className="p-2 bg-gray-100 dark:bg-gray-700 text-gray-500 hover:text-indigo-600 rounded-xl transition-all"
                          title="Cambiar estado"
                        >
                          <FiEdit3 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ========================================
            PAGINACIÓN
            ======================================== */}
        <div className="p-6 bg-gray-50 dark:bg-gray-900/50 flex items-center justify-between border-t border-gray-100 dark:border-gray-700">
          {/* Contador de registros */}
          <p className="text-xs font-bold text-gray-400">
            Mostrando {ventas.length} de {paginacion.totalRegistros || 0} ventas
          </p>

          {/* Botones de navegación */}
          <div className="flex gap-2">
            <button
              disabled={paginacion.paginaActual === 1}
              onClick={() => setFiltros({ ...filtros, pagina: filtros.pagina - 1 })}
              className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-black hover:bg-gray-50 transition-all disabled:opacity-50"
            >
              Anterior
            </button>
            <button
              disabled={paginacion.paginaActual === paginacion.totalPaginas}
              onClick={() => setFiltros({ ...filtros, pagina: filtros.pagina + 1 })}
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-black shadow-lg shadow-indigo-500/20 hover:scale-105 transition-all disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>

      {/* ========================================
          MODAL DE NUEVA VENTA
          ======================================== */}
      <ModalVenta
        isOpen={modalVentaOpen}
        onClose={() => setModalVentaOpen(false)}
        onVentaCreada={cargarVentas}
      />

      {/* ========================================
          MODAL DE CAMBIO DE ESTADO
          Modal moderno con grid de tarjetas de estados
          ======================================== */}
      {modalEstadoOpen && ventaSeleccionada && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-gray-800 rounded-[3rem] shadow-2xl border border-gray-200 dark:border-gray-700 max-w-4xl w-full max-h-[90vh] overflow-hidden animate-in slide-in-from-bottom-4 duration-300">

            {/* ========================================
                HEADER DEL MODAL
                ======================================== */}
            <div className="p-8 border-b border-gray-200 dark:border-gray-700">
              {/* Título y botón de cerrar */}
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-black text-gray-800 dark:text-white flex items-center gap-3">
                  <FiEdit3 className="text-indigo-600" />
                  Cambiar Estado del Pedido
                </h2>
                <button
                  onClick={() => {
                    setModalEstadoOpen(false);
                    setVentaSeleccionada(null);
                  }}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all"
                >
                  <span className="text-2xl text-gray-400">×</span>
                </button>
              </div>

              {/* Información de la venta seleccionada */}
              <div className="flex items-center gap-4 text-sm">
                {/* Número de factura */}
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 font-bold">Factura:</span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-black bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded-lg">
                    {ventaSeleccionada.numeroFactura}
                  </span>
                </div>

                {/* Cliente */}
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 font-bold">Cliente:</span>
                  <span className="text-gray-800 dark:text-gray-200 font-bold">
                    {ventaSeleccionada.usuarioCliente?.nombres} {ventaSeleccionada.usuarioCliente?.apellidos}
                  </span>
                </div>

                {/* Estado actual */}
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 font-bold">Estado actual:</span>
                  <span
                    className={`px-3 py-1 rounded-xl text-xs font-black ${getStatusColor(ventaSeleccionada.estadoPedido?.color)}`}
                    style={{ backgroundColor: ventaSeleccionada.estadoPedido?.color }}
                  >
                    {ventaSeleccionada.estadoPedido?.nombreEstado}
                  </span>
                </div>
              </div>
            </div>

            {/* ========================================
                BODY DEL MODAL - GRID DE ESTADOS
                ======================================== */}
            <div className="p-8 overflow-y-auto max-h-[calc(90vh-200px)] custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {estadosPedido.map((estado) => {
                  // Verificar si este es el estado actual
                  const isActual = ventaSeleccionada.estadoPedido?.idEstadoPedido === estado.idEstadoPedido;
                  const colorHex = estado.color || '#6B7280';

                  return (
                    <button
                      key={estado.idEstadoPedido}
                      onClick={() => cambiarEstadoPedido(ventaSeleccionada.idVenta, estado.idEstadoPedido)}
                      disabled={isActual}
                      className={`group relative p-6 rounded-2xl border-2 transition-all duration-300 text-left ${
                        isActual
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 cursor-default'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-lg hover:scale-105 active:scale-95'
                      }`}
                      style={{
                        backgroundColor: isActual ? undefined : 'transparent'
                      }}
                    >
                      {/* Indicador de estado actual */}
                      {isActual && (
                        <div className="absolute -top-2 -right-2 bg-indigo-600 text-white text-[8px] font-black px-2 py-1 rounded-full shadow-lg">
                          ACTUAL
                        </div>
                      )}

                      {/* Color Badge con número de orden */}
                      <div className="flex items-center gap-3 mb-3">
                        <div
                          className="h-10 w-10 rounded-xl shadow-sm flex items-center justify-center font-black text-white text-xs"
                          style={{ backgroundColor: colorHex }}
                        >
                          {estado.orden}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-black text-sm text-gray-800 dark:text-white line-clamp-2">
                            {estado.nombreEstado}
                          </h3>
                        </div>
                      </div>

                      {/* Descripción del estado */}
                      <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">
                        {estado.descripcion}
                      </p>

                      {/* Barra de color preview */}
                      <div
                        className="h-1.5 rounded-full transition-all duration-300"
                        style={{ backgroundColor: colorHex }}
                      />

                      {/* Overlay de hover effect */}
                      {!isActual && (
                        <div className="absolute inset-0 bg-gradient-to-br from-transparent to-indigo-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ========================================
                FOOTER DEL MODAL
                ======================================== */}
            <div className="p-6 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <p className="text-xs text-gray-400 font-bold">
                Selecciona un estado para actualizar el pedido
              </p>
              <button
                onClick={() => {
                  setModalEstadoOpen(false);
                  setVentaSeleccionada(null);
                }}
                className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-black rounded-2xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VentasPage;