import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  FiArrowLeft, FiShoppingCart, FiUser, FiDollarSign,
  FiSearch, FiFilter, FiCalendar, FiHash, FiActivity, FiLayers, FiPackage,
  FiCreditCard, FiFileText, FiPhone, FiMail, FiMapPin, FiClock, FiCheckCircle, FiAlertCircle, FiPrinter, FiDownload
} from 'react-icons/fi';
import { ventasApi } from '../../../api/ventasApi';
import Swal from 'sweetalert2';
import getImagenURL from '../../../utils/imageUrl';

const DetallesVentasPage = () => {
  const { id } = useParams();

  const navigate = useNavigate();
  const [ventas, setVentas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [filtroBusqueda, setFiltroBusqueda] = useState('');
  const [estadisticas, setEstadisticas] = useState({
    totalVendido: 0,
    totalItems: 0,
    promedioVenta: 0,
    clienteTop: 'N/A'
  });

  useEffect(() => {
    cargarDatos();
  }, [id]);

  const cargarDatos = async () => {
    setCargando(true);
    try {
      let data;
      if (id) {
        // Cargar una sola venta específica
        const res = await ventasApi.getVentaById(id);
        data = [res.datos || res];
      } else {
        // Cargar múltiples ventas para auditoría global
        const res = await ventasApi.getVentas({ limite: 100 });
        data = res.datos || [];
      }

      setVentas(Array.isArray(data) ? data : []);
      calcularEstadisticas(data);
    } catch (error) {
      console.error('Error cargando detalles de ventas:', error);
      Swal.fire('Error', 'No se pudieron cargar los detalles', 'error');
    } finally {
      setCargando(false);
    }
  };

  const calcularEstadisticas = (lista) => {
    if (!Array.isArray(lista)) return;

    let totalItems = 0;
    let totalVendido = 0;
    const clientes = {};

    lista.forEach(v => {
      totalVendido += Number(v.total || 0);
      v.detalleVentas?.forEach(d => {
        totalItems += Number(d.cantidad || 0);
      });
      const cNombre = `${v.usuarioCliente?.nombres} ${v.usuarioCliente?.apellidos}`;
      if (v.usuarioCliente) {
        clientes[cNombre] = (clientes[cNombre] || 0) + Number(v.total || 0);
      }
    });

    const topCliente = Object.entries(clientes).sort((a, b) => b[1] - a[1])[0];

    setEstadisticas({
      totalVendido,
      totalItems,
      promedioVenta: lista.length > 0 ? totalVendido / lista.length : 0,
      clienteTop: topCliente ? topCliente[0] : 'N/A'
    });
  };

  const formatearPrecio = (valor) => {
    return Number(valor).toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 });
  };

  // Aplatana todos los detalles de todas las ventas cargadas
  const todosLosDetalles = Array.isArray(ventas) ? ventas.flatMap(v => {
    if (!v) return [];
    return (v.detalleVentas || []).map(d => ({
      ...d,
      ventaRef: v.numeroFactura || `#${v.idVenta}`,
      idVenta: v.idVenta,
      cliente: `${v.usuarioCliente?.nombres} ${v.usuarioCliente?.apellidos}`,
      fecha: v.creadoEn,
      estadoPedido: v.estadoPedido
    }))
  }) : [];

  const detallesFiltrados = todosLosDetalles.filter(d => {
    const q = (filtroBusqueda || '').trim().toLowerCase();
    if (!q) return true;
    return (
      (d.variante?.producto?.nombreProducto || '').toLowerCase().includes(q) ||
      (d.ventaRef || '').toLowerCase().includes(q) ||
      (d.cliente || '').toLowerCase().includes(q) ||
      String(d.idVenta || '').toLowerCase().includes(q) ||
      String(d.idDetalleVenta || '').toLowerCase().includes(q)
    );
  });

    if (id && ventas.length > 0) {
    const venta = ventas[0];
    const isPaid = venta.saldoPendiente <= 0;

    const getImageUrl = (variante) => {
      const imgPath = variante?.imagenesVariantes?.[0]?.rutaImagen ||
                      variante?.producto?.imagenes?.[0]?.rutaImagen ||
                      variante?.producto?.imagenesProductos?.[0]?.rutaImagen;

      if (!imgPath) return null;
      return getImagenURL(imgPath) || null;
    };

    return (
      <div className="p-4 md:p-10 bg-gray-50 dark:bg-gray-950 min-h-screen animate-in fade-in duration-500">
        <div className="max-w-[1400px] mx-auto space-y-8">
          
          {/* Header Detalle */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-6">
               <button
                onClick={() => navigate('/admin/ventas')}
                className="p-3 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 hover:scale-105 transition-all text-gray-500 hover:text-indigo-600"
              >
                <FiArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <div className="flex items-center gap-3 mb-1">
                   <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                     isPaid 
                     ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-900' 
                     : 'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-900/20 dark:border-rose-900'
                   }`}>
                     {isPaid ? 'Pagado Completamente' : 'Saldo Pendiente'}
                   </span>
                   <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">{new Date(venta.creadoEn).toLocaleDateString()}</span>
                </div>
                <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
                  Orden #{venta.numeroFactura}
                </h1>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => window.print()} className="flex items-center gap-2 px-5 py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-bold rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 shadow-sm transition-all">
                 <FiPrinter /> <span className="hidden sm:inline">Imprimir</span>
              </button>
              <button className="flex items-center gap-2 px-5 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 transition-all">
                 <FiDownload /> <span className="hidden sm:inline">Exportar PDF</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
             
             {/* Columna 1: Cliente & Info */}
             <div className="space-y-8">
                {/* Cliente */}
                <div className="bg-white dark:bg-gray-900 p-6 rounded-[2rem] shadow-xl shadow-gray-200/40 dark:shadow-none border border-gray-100 dark:border-gray-800">
                   <h3 className="text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                      <FiUser className="text-indigo-500" /> Información del Cliente
                   </h3>
                   <div className="flex items-center gap-4 mb-6">
                      <div className="h-16 w-16 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 text-xl font-black">
                         {venta.usuarioCliente?.nombres?.[0]}
                      </div>
                      <div>
                         <p className="font-bold text-gray-900 dark:text-white text-lg">{venta.usuarioCliente?.nombres} {venta.usuarioCliente?.apellidos}</p>
                         <p className="text-xs text-gray-500 font-medium">ID: {venta.usuarioCliente?.usuario}</p>
                         <span className="inline-block mt-1 px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-bold uppercase rounded-md">Cliente Frecuente</span>
                      </div>
                   </div>
                   <div className="space-y-4">
                      <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl">
                         <FiMail className="text-gray-400" />
                         <span className="truncate">{venta.usuarioCliente?.correoElectronico}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl">
                         <FiPhone className="text-gray-400" />
                         <span>{venta.usuarioCliente?.telefono || 'Sin teléfono'}</span>
                      </div>
                   </div>
                </div>

                {/* Logística */}
                <div className="bg-white dark:bg-gray-900 p-6 rounded-[2rem] shadow-xl shadow-gray-200/40 dark:shadow-none border border-gray-100 dark:border-gray-800">
                   <h3 className="text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                      <FiMapPin className="text-indigo-500" /> Datos de Entrega
                   </h3>
                   <div className="relative pl-4 border-l-2 border-dashed border-gray-200 dark:border-gray-700 space-y-4">
                      <div>
                         <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Dirección de Envío</p>
                         <p className="text-sm font-bold text-gray-800 dark:text-gray-200">{venta.direccionEntrega || 'Misma dirección de facturación'}</p>
                      </div>
                      {venta.notas && (
                        <div>
                           <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Notas / Instrucciones</p>
                           <p className="text-xs text-gray-600 dark:text-gray-400 italic bg-amber-50 dark:bg-amber-900/10 p-3 rounded-lg border border-amber-100 dark:border-amber-900/30">
                             "{venta.notas}"
                           </p>
                        </div>
                      )}
                   </div>
                </div>
             </div>

             {/* Columna 2: Productos */}
             <div className="bg-white dark:bg-gray-900 rounded-[2rem] shadow-xl shadow-gray-200/40 dark:shadow-none border border-gray-100 dark:border-gray-800 flex flex-col overflow-hidden">
                <div className="p-6 border-b border-gray-100 dark:border-gray-800">
                   <h3 className="text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2">
                      <FiPackage className="text-indigo-500" /> Items Comprados 
                      <span className="bg-gray-100 dark:bg-gray-800 text-gray-500 px-2 py-0.5 rounded-full text-[9px]">{venta.detalleVentas?.length}</span>
                   </h3>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar max-h-[600px]">
                   {venta.detalleVentas?.map((item, idx) => {
                      const mov = venta.movimientos?.find(m => m.idVariante === item.idVariante);
                      const imageUrl = getImageUrl(item.variante);

                      return (
                        <div key={idx} className="flex gap-4 p-4 rounded-2xl bg-gray-50/50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-800 hover:bg-white dark:hover:bg-gray-800 transition-colors group">
                           <div className="h-20 w-20 bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm flex-shrink-0 border border-gray-100 dark:border-gray-700">
                              {imageUrl ? (
                                <img src={imageUrl} alt="Producto" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-300">
                                   <FiPackage className="h-8 w-8" />
                                </div>
                              )}
                           </div>
                           <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                              <div>
                                 <p className="text-[11px] font-black text-gray-800 dark:text-white leading-tight uppercase" title={item.variante?.producto?.nombreProducto}>
                                   {item.variante?.producto?.nombreProducto}
                                 </p>
                                 <div className="flex flex-wrap gap-1.5 mt-2">
                                    {item.variante?.talla && (
                                      <span className="text-[8px] font-black bg-white dark:bg-gray-700 px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-300 uppercase shadow-sm">
                                        T: {item.variante.talla.nombreTalla}
                                      </span>
                                    )}
                                    {item.variante?.color && (
                                      <div className="flex items-center gap-1 text-[8px] font-black bg-white dark:bg-gray-700 px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-300 uppercase shadow-sm">
                                        C: {item.variante.color.nombreColor}
                                        <div className="h-1.5 w-1.5 rounded-full ring-1 ring-gray-200" style={{ backgroundColor: item.variante.color.codigoHex }} />
                                      </div>
                                    )}
                                 </div>
                              </div>
                              
                              <div className="mt-3 flex justify-between items-end">
                                 <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                       <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Cant: {Number(item.cantidad)}</span>
                                       {mov && (
                                          <div className="flex items-center gap-1 px-1.5 py-0.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded text-[8px] font-black border border-indigo-100 dark:border-indigo-900/30">
                                             <span>Stock: {Number(mov.stockAnterior)}</span>
                                             <span>→</span>
                                             <span>{Number(mov.stockNuevo)}</span>
                                          </div>
                                       )}
                                    </div>
                                    <p className="text-[9px] text-gray-400 font-medium">SKU: {item.variante?.codigoSku}</p>
                                 </div>
                                 <p className="text-sm font-black text-indigo-600 dark:text-indigo-400">{formatearPrecio(item.subtotal)}</p>
                              </div>
                           </div>
                        </div>
                      );
                   })}
                </div>
                <div className="p-6 bg-gray-50/80 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 space-y-2">
                   <div className="flex justify-between text-xs text-gray-500">
                      <span>Subtotal</span>
                      <span className="font-bold">{formatearPrecio(venta.subtotal)}</span>
                   </div>
                   <div className="flex justify-between text-xs text-gray-500">
                      <span>Descuentos</span>
                      <span className="font-bold text-rose-500">-{formatearPrecio(venta.descuentoTotal)}</span>
                   </div>
                   <div className="flex justify-between text-xs text-gray-500">
                      <span>Impuestos</span>
                      <span className="font-bold">+{formatearPrecio(venta.impuestos)}</span>
                   </div>
                   <div className="flex justify-between text-lg font-black text-gray-900 dark:text-white pt-2 border-t border-gray-200 dark:border-gray-700 mt-2">
                      <span>Total</span>
                      <span>{formatearPrecio(venta.total)}</span>
                   </div>
                </div>
             </div>

             {/* Columna 3: Pagos & Estado */}
             <div className="space-y-8">
                <div className="bg-white dark:bg-gray-900 p-6 rounded-[2rem] shadow-xl shadow-gray-200/40 dark:shadow-none border border-gray-100 dark:border-gray-800">
                   <div className="flex justify-between items-center mb-6">
                     <h3 className="text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2">
                        <FiCreditCard className="text-indigo-500" /> Historial de Pagos
                     </h3>
                     <span className="px-2 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 text-[8px] font-black uppercase rounded-lg">
                        {venta.pagos?.length} Pagos
                     </span>
                   </div>

                   <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                      {venta.pagos && venta.pagos.length > 0 ? (
                        venta.pagos.map((pago) => (
                          <div key={pago.idPago} className="relative bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                             <div className="flex justify-between items-start mb-2">
                                <div>
                                   <p className="text-xs font-black text-gray-700 dark:text-gray-200 uppercase">{pago.metodoPago?.nombreMetodo || 'Método Desconocido'}</p>
                                   <p className="text-[10px] text-gray-400 font-bold">{new Date(pago.fechaPago).toLocaleString()}</p>
                                </div>
                                <span className="text-sm font-black text-emerald-600">+{formatearPrecio(pago.monto)}</span>
                             </div>
                             {pago.referencia && (
                               <div className="bg-white dark:bg-gray-800 px-3 py-1.5 rounded-lg inline-block border border-gray-100 dark:border-gray-700">
                                  <p className="text-[9px] font-bold text-gray-500 uppercase tracking-wide">Ref: <span className="text-gray-800 dark:text-gray-300 select-all">{pago.referencia}</span></p>
                               </div>
                             )}
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-6">
                           <p className="text-xs text-gray-400">No hay pagos registrados</p>
                        </div>
                      )}
                   </div>
                   
                   <div className="mt-6 pt-4 border-t border-dashed border-gray-200 dark:border-gray-700">
                      <div className="flex justify-between items-center mb-2">
                         <span className="text-xs font-bold text-gray-500 uppercase">Total Abonado</span>
                         <span className="text-sm font-black text-emerald-600">{formatearPrecio(venta.totalPagado)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                         <span className="text-xs font-bold text-gray-500 uppercase">Saldo Pendiente</span>
                         <span className={`text-xl font-black ${venta.saldoPendiente > 0 ? 'text-rose-500' : 'text-gray-400'}`}>{formatearPrecio(venta.saldoPendiente)}</span>
                      </div>
                   </div>
                </div>

                {/* Crédito Info (si existe) */}
                 {venta.credito && (
                    <div className="bg-white dark:bg-gray-900 p-6 rounded-[2rem] shadow-xl shadow-gray-200/40 dark:shadow-none border border-gray-100 dark:border-gray-800 relative overflow-hidden group">
                       <div className="absolute -right-8 -top-8 h-32 w-32 bg-indigo-500/5 group-hover:bg-indigo-500/10 rounded-full transition-colors duration-500" />
                       <h3 className="text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-6 relative z-10 flex items-center gap-2">
                          <FiFileText className="text-indigo-500" /> Información de Crédito
                       </h3>
                       <div className="space-y-6 relative z-10">
                          <div className="grid grid-cols-2 gap-4">
                             <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl border border-gray-100 dark:border-gray-700">
                                <p className="text-[9px] font-bold text-gray-400 uppercase mb-1">Inicio</p>
                                <p className="text-sm font-black text-gray-700 dark:text-gray-200">{new Date(venta.credito.fechaInicio).toLocaleDateString()}</p>
                             </div>
                             <div className="bg-rose-50 dark:bg-rose-900/10 p-3 rounded-xl border border-rose-100 dark:border-rose-900/30">
                                <p className="text-[9px] font-bold text-rose-400 uppercase mb-1">Vencimiento</p>
                                <p className="text-sm font-black text-rose-600 dark:text-rose-400">{venta.credito.fechaVencimiento ? new Date(venta.credito.fechaVencimiento).toLocaleDateString() : 'N/A'}</p>
                             </div>
                          </div>

                          <div className="space-y-3">
                             <div className="flex justify-between items-center text-xs">
                                <span className="font-bold text-gray-500 uppercase tracking-tight">Monto Total</span>
                                <span className="font-black text-gray-800 dark:text-white">{formatearPrecio(venta.credito.montoTotal)}</span>
                             </div>
                             <div className="flex justify-between items-center text-xs">
                                <span className="font-bold text-gray-500 uppercase tracking-tight">Total Abonado</span>
                                <span className="font-black text-emerald-600">{formatearPrecio(venta.credito.totalAbonado)}</span>
                             </div>
                             <div className="relative pt-2">
                                <div className="flex justify-between items-end mb-1.5">
                                   <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Saldo Pendiente</span>
                                   <span className="text-lg font-black text-indigo-600">{formatearPrecio(venta.credito.saldoPendiente)}</span>
                                </div>
                                <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                   <div 
                                      className="h-full bg-indigo-500 transition-all duration-1000 ease-out shadow-lg shadow-indigo-500/20"
                                      style={{ width: `${Math.min(100, (Number(venta.credito.totalAbonado) / Number(venta.credito.montoTotal)) * 100)}%` }}
                                   />
                                </div>
                             </div>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
                             <span className="text-[10px] font-bold text-gray-400 uppercase">Estado del Crédito</span>
                             <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-tighter shadow-sm border ${
                                venta.credito.estado === 'activo' 
                                ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-900' 
                                : 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/20 dark:border-amber-900'
                             }`}>
                                {venta.credito.estado || 'Activo'}
                             </span>
                          </div>
                       </div>
                    </div>
                 )}
             </div>

          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-10 bg-gray-50 dark:bg-gray-950 min-h-screen animate-in fade-in duration-500">
      <div className="max-w-[1600px] mx-auto space-y-10">

        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="flex items-center space-x-6">
             <button
              onClick={() => navigate('/admin/ventas')}
              className="p-4 bg-white dark:bg-gray-900 rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-none hover:scale-110 transition-all text-gray-500 hover:text-indigo-600 border border-gray-100 dark:border-gray-800"
            >
              <FiArrowLeft className="h-6 w-6" />
            </button>
            <div>
              <nav className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-indigo-500 mb-1">
                <Link to="/admin/ventas" className="hover:underline">Operaciones</Link>
                <span>/</span>
                <span className="text-gray-400 text-[10px]">Auditoría de Salidas</span>
              </nav>
              <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">
                Dashboard de Auditoría de Ventas
              </h1>
              <p className="text-gray-500 dark:text-gray-400 font-medium flex items-center gap-2 mt-1">
                <FiActivity className="text-emerald-500" />
                Seguimiento volumétrico de mercancía despachada.
              </p>
            </div>
          </div>

            <div className="flex items-center gap-3 w-full lg:w-auto">
              <div className="relative flex-1 lg:w-80">
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={filtroBusqueda}
                  onChange={(e) => setFiltroBusqueda(e.target.value)}
                  placeholder="Buscar ítem, factura o cliente..."
                  className="w-full pl-12 pr-4 py-4 bg-white dark:bg-gray-900 border-none rounded-[20px] shadow-xl shadow-gray-200/50 dark:shadow-none text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>
            </div>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          <AnalyticsCard
            title="Facturación Bruta"
            value={formatearPrecio(estadisticas.totalVendido)}
            subtitle="Monto total procesado"
            icon={<FiDollarSign />}
            color="indigo"
          />
          <AnalyticsCard
            title="Volumen Despachado"
            value={estadisticas.totalItems}
            subtitle="Unidades totales vendidas"
            icon={<FiPackage />}
            color="blue"
          />
          <AnalyticsCard
            title="Cliente Preferencial"
            value={estadisticas.clienteTop}
            subtitle="Mayor aporte a ingresos"
            icon={<FiUser />}
            color="rose"
          />
          <AnalyticsCard
            title="Ticket Promedio"
            value={formatearPrecio(estadisticas.promedioVenta)}
            subtitle="Valor medio por transacción"
            icon={<FiLayers />}
            color="purple"
          />
        </div>

        {/* Detailed Data Table */}
        <div className="bg-white dark:bg-gray-950 rounded-[40px] shadow-2xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-800 overflow-hidden">
          <div className="px-10 py-8 border-b border-gray-50 dark:border-gray-900 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/30">
            <div>
              <h2 className="text-xl font-black text-gray-900 dark:text-white">Relación de Ítems Vendidos</h2>
              <p className="text-sm text-gray-400 font-medium tracking-tight">Consolidado dinámico de variantes comercializadas</p>
            </div>
            <div className="bg-indigo-600 px-6 py-2 rounded-2xl shadow-lg shadow-indigo-500/20">
              <span className="text-xs font-black text-white uppercase tracking-widest">{detallesFiltrados.length} Registros</span>
            </div>
          </div>

          <div className="overflow-x-auto custom-scrollbar">
            {cargando ? (
              <div className="py-32 flex flex-col items-center justify-center space-y-4">
                <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Sincronizando auditoría...</p>
              </div>
            ) : (
              <table className="min-w-full">
                <thead>
                  <tr className="bg-white dark:bg-gray-950 text-left">
                    <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Variante & Producto</th>
                    <th className="px-6 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Factura Ref</th>
                    <th className="px-6 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Destinatario</th>
                    <th className="px-6 py-6 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">Cant.</th>
                    <th className="px-6 py-6 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Precio Unit.</th>
                    <th className="px-6 py-6 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Dcto. Línea</th>
                    <th className="px-10 py-6 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Transacción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-900">
                  {detallesFiltrados.map((detalle, idx) => {
                    const imgPath = detalle.variante?.imagenesVariantes?.[0]?.rutaImagen ||
                                detalle.variante?.producto?.imagenesProductos?.[0]?.rutaImagen;

                    let imageUrl = imgPath ? getImagenURL(imgPath) : null;

                    return (
                      <tr key={`${detalle.idDetalleVenta}-${idx}`} className="hover:bg-indigo-50/20 dark:hover:bg-indigo-900/10 transition-colors group">
                        <td className="px-10 py-6">
                          <div className="flex items-center space-x-4">
                            <div className="h-14 w-14 flex-shrink-0 bg-gray-100 dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm group-hover:scale-110 transition-transform">
                              {imageUrl ? (
                                <img src={imageUrl} alt="Producto" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-300">
                                  <FiPackage className="h-6 w-6" />
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-black text-gray-900 dark:text-white leading-tight">
                                {detalle.variante?.producto?.nombreProducto}
                              </p>
                              <div className="flex items-center gap-2 mt-1.5">
                                <span className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-lg text-[10px] font-bold text-gray-500 uppercase">
                                  {detalle.variante?.color?.nombreColor || 'N/A'}
                                </span>
                                <span className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-lg text-[10px] font-black uppercase">
                                  {detalle.variante?.talla?.nombreTalla || 'Única'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-6">
                          <Link to={`/admin/ventas`} className="flex items-center space-x-2 text-indigo-500 hover:underline">
                            <FiHash className="h-3 w-3" />
                            <span className="text-sm font-black tracking-tight">{detalle.ventaRef}</span>
                          </Link>
                          <div className="flex items-center space-x-1 mt-1 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                            <FiCalendar className="h-2.5 w-2.5" />
                            <span>{new Date(detalle.fecha).toLocaleDateString()}</span>
                          </div>
                        </td>
                        <td className="px-6 py-6">
                           <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-[10px] font-black">
                              {detalle.cliente?.[0]}
                            </div>
                            <span className="text-sm font-bold text-gray-700 dark:text-gray-300 tracking-tight">{detalle.cliente}</span>
                          </div>
                        </td>
                        <td className="px-6 py-6 text-center">
                          <span className="text-sm font-black text-gray-900 dark:text-gray-200">{detalle.cantidad}</span>
                        </td>
                        <td className="px-6 py-6 text-right font-medium text-sm text-gray-600 dark:text-gray-400">
                          {formatearPrecio(detalle.precioUnitario)}
                        </td>
                        <td className="px-6 py-6 text-right">
                          <span className={`text-[10px] font-black border px-2 py-1 rounded-lg ${Number(detalle.descuentoLinea) > 0 ? 'bg-rose-50 text-rose-500 border-rose-100 dark:bg-rose-900/20' : 'text-gray-300 border-transparent'}`}>
                            {Number(detalle.descuentoLinea) > 0 ? `-${formatearPrecio(detalle.descuentoLinea)}` : '$0'}
                          </span>
                        </td>
                        <td className="px-10 py-6 text-right">
                          <span className="text-base font-black text-indigo-600 dark:text-indigo-400 tracking-tighter">
                            {formatearPrecio(detalle.totalLinea)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/* Componentes Visuales Internos */

const AnalyticsCard = ({ title, value, subtitle, icon, color }) => {
  const styles = {
    indigo: "from-indigo-600 to-blue-700 shadow-indigo-500/20",
    blue: "from-blue-500 to-indigo-600 shadow-blue-500/20",
    rose: "from-rose-500 to-pink-600 shadow-rose-500/20",
    purple: "from-purple-600 to-indigo-800 shadow-purple-500/20"
  };

  return (
    <div className="bg-white dark:bg-gray-900 p-8 rounded-[40px] shadow-2xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-800 relative overflow-hidden group hover:-translate-y-2 transition-all duration-300">
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${styles[color]} opacity-[0.03] rounded-bl-[100px] translate-x-10 -translate-y-10 group-hover:scale-150 transition-transform duration-700`} />

      <div className="flex flex-col space-y-4">
        <div className={`h-14 w-14 bg-gradient-to-br ${styles[color]} rounded-2xl flex items-center justify-center text-white text-2xl shadow-xl shadow-${color}-500/20`}>
          {icon}
        </div>
        <div>
          <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{title}</h4>
          <p className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter mt-1">{value}</p>
          <div className="flex items-center space-x-2 mt-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{subtitle}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetallesVentasPage;