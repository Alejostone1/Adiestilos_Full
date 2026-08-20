import React, { useState, useEffect } from 'react';
import {
  FiCreditCard, FiSearch, FiFilter, FiCalendar, FiDollarSign,
  FiClock, FiCheckCircle, FiAlertCircle, FiTrendingDown, FiPlus, FiEye
} from 'react-icons/fi';
import { ventasCreditoApi } from '../../../api/ventasCreditoApi';
import { metodosPagoApi } from '../../../api/metodosPagoApi';
import Swal from 'sweetalert2';

const VentasCreditoPage = () => {
  const [creditos, setCreditos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [metodosPago, setMetodosPago] = useState([]);
  const [filtros, setFiltros] = useState({
    page: 1,
    limit: 10,
    estado: '',
    idUsuario: ''
  });
  const [paginacion, setPaginacion] = useState({});

  useEffect(() => {
    cargarDatos();
  }, [filtros]);

  const cargarDatos = async () => {
    setCargando(true);
    try {
      const [resCreditos, resMetodos] = await Promise.all([
        ventasCreditoApi.getCreditos(filtros),
        metodosPagoApi.getMetodosPago()
      ]);
      setCreditos(resCreditos.datos || []);
      setPaginacion(resCreditos.paginacion || {});
      setMetodosPago(resMetodos.datos || resMetodos || []);
    } catch (error) {
      console.error("Error cargando créditos", error);
      Swal.fire('Error', 'No se pudieron cargar los datos de crédito', 'error');
    } finally {
      setCargando(false);
    }
  };

  const formatearPrecio = (valor) => {
    return Number(valor).toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 });
  };

  const handleAbonar = async (credito) => {
    const { value: formValues } = await Swal.fire({
      title: 'Registrar Abono',
      html: `
        <div class="text-left space-y-4 p-2">
          <p class="text-xs font-bold text-gray-400 uppercase tracking-widest">Saldo Pendiente: ${formatearPrecio(credito.saldoPendiente)}</p>
          <div>
            <label class="block text-[10px] font-black uppercase mb-1">Monto del Abono</label>
            <input id="swal-monto" type="number" class="w-full p-3 border rounded-xl" placeholder="0.00">
          </div>
          <div>
            <label class="block text-[10px] font-black uppercase mb-1">Método de Pago</label>
            <select id="swal-metodo" class="w-full p-3 border rounded-xl">
              ${metodosPago.map(m => `<option value="${m.idMetodoPago}">${m.nombreMetodo}</option>`).join('')}
            </select>
          </div>
          <div>
            <label class="block text-[10px] font-black uppercase mb-1">Notas</label>
            <textarea id="swal-notas" class="w-full p-3 border rounded-xl" rows="2"></textarea>
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Confirmar Abono',
      confirmButtonColor: '#4f46e5',
      preConfirm: () => {
        return {
          monto: document.getElementById('swal-monto').value,
          idMetodoPago: document.getElementById('swal-metodo').value,
          notas: document.getElementById('swal-notas').value
        }
      }
    });

    if (formValues) {
      if (!formValues.monto || formValues.monto <= 0) return Swal.fire('Error', 'Monto inválido', 'error');

      try {
        await ventasCreditoApi.abonarCredito(credito.idVenta, formValues);
        Swal.fire('¡Éxito!', 'Abono registrado correctamente', 'success');
        cargarDatos();
      } catch (error) {
        Swal.fire('Error', error.response?.data?.mensaje || 'Error al procesar el abono', 'error');
      }
    }
  };

  const totalEnMora = creditos.reduce((acc, c) => acc + (c.estado === 'activo' ? Number(c.saldoPendiente) : 0), 0);

  return (
    <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-500">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-800 dark:text-white flex items-center gap-3">
            <FiCreditCard className="text-rose-500" />
            Ventas a Crédito
          </h1>
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-1">Gestión de Saldos y Cobranzas</p>
        </div>
        <div className="flex items-center gap-3">
           <div className="bg-rose-50 dark:bg-rose-900/20 px-6 py-3 rounded-2xl border border-rose-100 dark:border-rose-800">
              <p className="text-[9px] font-black text-rose-500 uppercase tracking-widest leading-none mb-1">Total en Cartera</p>
              <p className="text-xl font-black text-rose-600 dark:text-rose-400">{formatearPrecio(totalEnMora)}</p>
           </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { icon: <FiClock />, label: 'Créditos Activos', value: paginacion.total || 0, color: 'indigo' },
          { icon: <FiAlertCircle />, label: 'En Mora / Vencidos', value: '0', color: 'rose' },
          { icon: <FiCheckCircle />, label: 'Recaudado Hoy', value: '$0', color: 'emerald' },
          { icon: <FiTrendingDown />, label: 'Saldo Promedio', value: formatearPrecio(totalEnMora / (creditos.length || 1)), color: 'amber' }
        ].map((kpi, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-700">
            <div className={`h-12 w-12 rounded-2xl bg-${kpi.color}-50 dark:bg-${kpi.color}-900/20 text-${kpi.color}-600 dark:text-${kpi.color}-400 flex items-center justify-center text-2xl mb-4`}>
              {kpi.icon}
            </div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{kpi.label}</p>
            <h3 className="text-xl font-black text-gray-800 dark:text-white mt-1">{kpi.value}</h3>
          </div>
        ))}
      </div>

      {/* Table Section */}
      <div className="bg-white dark:bg-gray-800 rounded-[3rem] shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por cliente o factura..."
              className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-rose-500"
            />
          </div>
          <div className="flex items-center gap-3">
            <select
              className="bg-gray-50 dark:bg-gray-900 border-none rounded-2xl py-3 px-6 text-sm font-bold text-gray-500"
              value={filtros.estado}
              onChange={(e) => setFiltros({...filtros, estado: e.target.value})}
            >
              <option value="">Todos los Estados</option>
              <option value="activo">Activos</option>
              <option value="pagado">Pagados</option>
              <option value="vencido">Vencidos</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-400 text-[10px] font-black uppercase tracking-widest">
              <tr>
                <th className="py-4 px-8">Cliente / Factura</th>
                <th className="py-4 px-4">Fecha Inicio</th>
                <th className="py-4 px-4 text-right">Monto Total</th>
                <th className="py-4 px-4 text-right">Saldo Pendiente</th>
                <th className="py-4 px-4 text-center">Estado</th>
                <th className="py-4 px-8 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
              {cargando ? (
                <tr><td colSpan="6" className="py-10 text-center text-gray-400 font-bold uppercase tracking-widest">Cargando cartera...</td></tr>
              ) : creditos.length === 0 ? (
                <tr><td colSpan="6" className="py-10 text-center text-gray-400 font-bold uppercase tracking-widest">No hay créditos registrados</td></tr>
              ) : (
                creditos.map((credito) => (
                  <tr key={credito.idCredito} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors group">
                    <td className="py-5 px-8">
                       <div className="flex flex-col">
                          <span className="text-sm font-black text-gray-800 dark:text-gray-100">
                            {credito.usuarioCliente?.nombres} {credito.usuarioCliente?.apellidos}
                          </span>
                          <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-tighter">
                            Factura: {credito.venta?.numeroFactura}
                          </span>
                       </div>
                    </td>
                    <td className="py-5 px-4 text-xs font-bold text-gray-500">
                      {new Date(credito.fechaInicio).toLocaleDateString()}
                    </td>
                    <td className="py-5 px-4 text-right text-sm font-bold text-gray-600 dark:text-gray-300">
                      {formatearPrecio(credito.montoTotal)}
                    </td>
                    <td className="py-5 px-4 text-right">
                      <span className="text-sm font-black text-rose-500">
                        {formatearPrecio(credito.saldoPendiente)}
                      </span>
                    </td>
                    <td className="py-5 px-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                        credito.estado === 'activo' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'
                      }`}>
                        {credito.estado}
                      </span>
                    </td>
                    <td className="py-5 px-8 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleAbonar(credito)}
                          disabled={credito.estado === 'pagado'}
                          className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white text-[10px] font-black uppercase rounded-xl hover:bg-emerald-600 transition-all disabled:opacity-30"
                        >
                          <FiPlus /> Abonar
                        </button>
                        <button className="p-2 bg-gray-100 dark:bg-gray-700 text-gray-500 hover:text-indigo-600 rounded-xl">
                          <FiEye className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default VentasCreditoPage;
