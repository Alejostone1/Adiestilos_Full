import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiSearch, FiFilter, FiEye, FiArrowRight, FiDollarSign, FiClock, FiCheckCircle, FiAlertCircle 
} from 'react-icons/fi';
import { creditosApi } from '../../../api/creditosApi';
import Swal from 'sweetalert2';

const HistorialCreditosPage = () => {
  const navigate = useNavigate();
  const [creditos, setCreditos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');

  useEffect(() => {
    cargarCreditos();
  }, []);

  const cargarCreditos = async () => {
    setCargando(true);
    try {
      const res = await creditosApi.getCreditos({ limite: 100 }); // Traer suficientes por ahora
      setCreditos(res.datos || []);
    } catch (error) {
      console.error('Error cargando créditos', error);
      Swal.fire('Error', 'No se pudo cargar el historial de créditos', 'error');
    } finally {
      setCargando(false);
    }
  };

  const formatearPrecio = (valor) => {
    return Number(valor).toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 });
  };

  // Filtrado
  const creditosFiltrados = creditos.filter(credito => {
    const cumpleEstado = filtroEstado === 'todos' || credito.estado === filtroEstado;
    const q = busqueda.toLowerCase();
    const cumpleBusqueda = 
      credito.usuarioCliente?.nombres?.toLowerCase().includes(q) ||
      credito.usuarioCliente?.apellidos?.toLowerCase().includes(q) ||
      String(credito.venta?.numeroFactura).toLowerCase().includes(q);
    
    return cumpleEstado && cumpleBusqueda;
  });

  // Estadísticas rápidas
  const totalCartera = creditos.reduce((acc, c) => acc + (c.estado === 'activo' ? Number(c.saldoPendiente) : 0), 0);
  const totalRecaudado = creditos.reduce((acc, c) => acc + Number(c.totalAbonado), 0);

  return (
    <div className="p-4 md:p-10 bg-gray-50 dark:bg-gray-950 min-h-screen animate-in fade-in duration-500">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900 dark:text-white tracking-tight">Historial de Créditos</h1>
            <p className="text-gray-500 dark:text-gray-400 font-medium mt-1">Registro completo de cartera y cobranza</p>
          </div>
          
          <div className="flex items-center gap-4 bg-white dark:bg-gray-900 p-2 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
             <div className="flex items-center gap-3 px-4 py-2 border-r border-gray-100 dark:border-gray-800">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-lg">
                   <FiDollarSign />
                </div>
                <div>
                   <p className="text-[11px] font-semibold text-gray-400 uppercase">Cartera Activa</p>
                   <p className="text-sm font-semibold text-gray-900 dark:text-gray-200">{formatearPrecio(totalCartera)}</p>
                </div>
             </div>
             <div className="flex items-center gap-3 px-4 py-2">
                <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 rounded-lg">
                   <FiCheckCircle />
                </div>
                <div>
                   <p className="text-[11px] font-semibold text-gray-400 uppercase">Recaudado</p>
                   <p className="text-sm font-semibold text-gray-900 dark:text-gray-200">{formatearPrecio(totalRecaudado)}</p>
                </div>
             </div>
          </div>
        </div>

        {/* Filtros y Búsqueda */}
        <div className="flex flex-col md:flex-row items-center gap-4 justify-between">
           <div className="relative w-full md:w-96 group">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Buscar por cliente o factura..." 
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white dark:bg-gray-900 border-none rounded-2xl shadow-sm ring-1 ring-gray-100 dark:ring-gray-800 focus:ring-2 focus:ring-indigo-500 transition-all"
              />
           </div>
           
           <div className="flex bg-white dark:bg-gray-900 p-1 rounded-xl shadow-sm ring-1 ring-gray-100 dark:ring-gray-800">
              {['todos', 'activo', 'pagado'].map(filtro => (
                <button
                  key={filtro}
                  onClick={() => setFiltroEstado(filtro)}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wide transition-all ${
                    filtroEstado === filtro 
                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm' 
                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                  }`}
                >
                  {filtro}
                </button>
              ))}
           </div>
        </div>

        {/* Tabla */}
        <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-800 overflow-hidden">
           <div className="overflow-x-auto custom-scrollbar">
             <table className="min-w-full">
               <thead>
                 <tr className="bg-gray-50/50 dark:bg-gray-800/20 text-left">
                   <th className="px-8 py-6 text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Cliente</th>
                   <th className="px-6 py-6 text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Venta Ref.</th>
                   <th className="px-6 py-6 text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Monto Crédito</th>
                   <th className="px-6 py-6 text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Abonado</th>
                   <th className="px-6 py-6 text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Saldo</th>
                   <th className="px-6 py-6 text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Estado</th>
                   <th className="px-8 py-6 text-right text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Acción</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                 {cargando ? (
                   <tr><td colSpan="7" className="py-20 text-center text-gray-400">Cargando historial...</td></tr>
                 ) : creditosFiltrados.length === 0 ? (
                   <tr><td colSpan="7" className="py-20 text-center text-gray-400">No se encontraron créditos registrados</td></tr>
                 ) : (
                   creditosFiltrados.map((credito) => (
                     <tr key={credito.idCredito} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                       <td className="px-8 py-5">
                          <p className="font-semibold text-gray-900 dark:text-white text-sm">{credito.usuarioCliente?.nombres} {credito.usuarioCliente?.apellidos}</p>
                          <p className="text-[11px] text-gray-400 mt-0.5">ID: {credito.idUsuario}</p>
                       </td>
                       <td className="px-6 py-5">
                          <span className="font-mono text-xs font-semibold text-gray-600 dark:text-gray-300">{credito.venta?.numeroFactura}</span>
                          <p className="text-[11px] text-gray-400 mt-0.5">{new Date(credito.fechaInicio).toLocaleDateString()}</p>
                       </td>
                       <td className="px-6 py-5">
                          <span className="font-semibold text-sm text-gray-900 dark:text-white">{formatearPrecio(credito.montoTotal)}</span>
                       </td>
                       <td className="px-6 py-5">
                          <span className="font-semibold text-xs text-emerald-600">{formatearPrecio(credito.totalAbonado)}</span>
                       </td>
                       <td className="px-6 py-5">
                          <span className={`font-semibold text-sm ${Number(credito.saldoPendiente) > 0 ? 'text-rose-500' : 'text-gray-400'}`}>
                            {formatearPrecio(credito.saldoPendiente)}
                          </span>
                       </td>
                       <td className="px-6 py-5">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wide border ${
                            credito.estado === 'pagado' 
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-900' 
                            : 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/20 dark:border-amber-900'
                          }`}>
                            {credito.estado === 'pagado' ? <FiCheckCircle /> : <FiAlertCircle />}
                            {credito.estado}
                          </span>
                       </td>
                       <td className="px-8 py-5 text-right">
                          <button 
                            onClick={() => navigate(`/admin/creditos/detalle/${credito.idCredito}`)}
                            className="p-2 bg-white dark:bg-gray-800 text-gray-400 hover:text-indigo-600 border border-gray-200 dark:border-gray-700 rounded-xl hover:shadow-md transition-all"
                          >
                             <FiArrowRight />
                          </button>
                       </td>
                     </tr>
                   ))
                 )}
               </tbody>
             </table>
           </div>
        </div>

      </div>
    </div>
  );
};

export default HistorialCreditosPage;
