import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FiArrowLeft, FiUser, FiShoppingBag, FiCreditCard, FiClock, FiCheckCircle, 
  FiFileText, FiDollarSign, FiCalendar, FiPlus, FiSearch, FiArrowRight, FiEye
} from 'react-icons/fi';
import { creditosApi } from '../../../api/creditosApi';
import { useAuth } from '../../../context/AuthContext';
import ModalRegistrarAbono from '../../../components/admin/creditos/ModalRegistrarAbono';
import Swal from 'sweetalert2';
import getImagenURL from '../../../utils/imageUrl';

const DetalleCreditoPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { usuario } = useAuth();
  
  const [credito, setCredito] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [modalAbonoOpen, setModalAbonoOpen] = useState(false);
  
  // Estados para modo buscador (sin ID)
  const [listaCreditos, setListaCreditos] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [filtrados, setFiltrados] = useState([]);

  useEffect(() => {
    if (id) {
      cargarDetalle();
    } else {
      cargarListaCreditos();
    }
  }, [id]);

  const cargarDetalle = async () => {
    setCargando(true);
    try {
      const res = await creditosApi.getCreditoById(id);
      setCredito(res.datos || res);
    } catch (error) {
      console.error('Error cargando detalle de crédito', error);
      Swal.fire('Error', 'No se pudo cargar la información del crédito', 'error');
      navigate('/admin/creditos/detalle');
    } finally {
      setCargando(false);
    }
  };

  const cargarListaCreditos = async () => {
    setCargando(true);
    try {
      const res = await creditosApi.getCreditos({ limite: 50 });
      const datos = res.datos || [];
      setListaCreditos(datos);
      setFiltrados(datos);
    } catch (error) {
      console.error('Error cargando lista de créditos', error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    if (!id && busqueda) {
      const q = busqueda.toLowerCase();
      const filtered = listaCreditos.filter(c => 
        c.usuarioCliente?.nombres?.toLowerCase().includes(q) ||
        c.usuarioCliente?.apellidos?.toLowerCase().includes(q) ||
        c.venta?.numeroFactura?.toString().includes(q) ||
        c.idCredito.toString().includes(q)
      );
      setFiltrados(filtered);
    } else {
      setFiltrados(listaCreditos);
    }
  }, [busqueda, listaCreditos, id]);

  const formatearPrecio = (valor) => {
    return Number(valor).toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 });
  };

    const calculateDebtPercentage = () => {
      if (!credito) return 0;
      return Math.round((credito.saldoPendiente / credito.montoTotal) * 100);
    };

    const getImageUrl = (variante) => {
      const imgPath = variante?.imagenesVariantes?.[0]?.rutaImagen ||
                      variante?.producto?.imagenes?.[0]?.rutaImagen ||
                      variante?.producto?.imagenesProductos?.[0]?.rutaImagen;

      if (!imgPath) return null;
      return getImagenURL(imgPath) || null;
    };

  if (cargando) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gray-50 dark:bg-gray-950 gap-4">
        <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide animate-pulse">Sincronizando Expediente...</p>
      </div>
    );
  }

  // MODO BUSCADOR (Si no hay ID seleccionado)
  if (!id) {
    return (
      <div className="p-4 md:p-10 bg-gray-50 dark:bg-gray-950 min-h-screen animate-in fade-in duration-500">
        <div className="max-w-[1200px] mx-auto space-y-12">
           
           {/* Hero Search Section */}
           <div className="text-center space-y-6 py-10">
              <div className="inline-flex p-4 bg-indigo-600 text-white rounded-[2rem] shadow-2xl shadow-indigo-500/40 mb-4 animate-bounce">
                 <FiSearch className="h-8 w-8" />
              </div>
              <h1 className="text-4xl md:text-5xl font-semibold text-gray-900 dark:text-white tracking-tight">Consultar Expediente</h1>
              <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto font-medium">
                 Ingresa el nombre del cliente o número de crédito para acceder a la información detallada, historial de pagos y registrar abonos.
              </p>

              <div className="max-w-2xl mx-auto relative group mt-10">
                 <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                    <FiSearch className="h-6 w-6 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                 </div>
                 <input 
                   type="text" 
                   value={busqueda}
                   onChange={(e) => setBusqueda(e.target.value)}
                   placeholder="Buscar cliente, factura o ID de crédito..."
                   className="w-full pl-16 pr-6 py-6 bg-white dark:bg-gray-900 border-none rounded-[2.5rem] shadow-2xl shadow-gray-200/50 dark:shadow-none ring-1 ring-gray-100 dark:ring-gray-800 focus:ring-4 focus:ring-indigo-500/20 text-lg font-semibold transition-all"
                 />
                 <div className="absolute inset-y-0 right-0 p-2">
                    <div className="h-full px-6 bg-gray-100 dark:bg-gray-800 rounded-3xl flex items-center justify-center text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
                       Enter para buscar
                    </div>
                 </div>
              </div>
           </div>

           {/* Results Grid */}
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtrados.map((item) => (
                 <div 
                    key={item.idCredito}
                    onClick={() => navigate(`/admin/creditos/detalle/${item.idCredito}`)}
                    className="group bg-white dark:bg-gray-900 p-8 rounded-[3rem] shadow-xl shadow-gray-200/40 dark:shadow-none border border-gray-100 dark:border-gray-800 hover:scale-[1.02] hover:border-indigo-300 dark:hover:border-indigo-900 transition-all cursor-pointer relative overflow-hidden"
                 >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 dark:bg-indigo-900/20 rounded-bl-[60px] -mr-8 -mt-8 group-hover:scale-110 transition-transform" />
                    
                    <div className="relative z-10 flex flex-col h-full">
                       <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-4">Crédito #{item.idCredito}</span>
                       <h3 className="text-xl font-semibold text-gray-900 dark:text-white leading-tight">
                          {item.usuarioCliente?.nombres} <br/>
                          <span className="opacity-50">{item.usuarioCliente?.apellidos}</span>
                       </h3>
                       
                       <div className="mt-8 space-y-4 flex-1">
                          <div className="flex justify-between items-center text-xs">
                             <span className="font-semibold text-gray-400 uppercase">Saldo Pendiente</span>
                             <span className="font-semibold text-rose-500 text-lg">{formatearPrecio(item.saldoPendiente)}</span>
                          </div>
                          
                          <div className="w-full bg-gray-100 dark:bg-gray-800 h-2 rounded-full overflow-hidden">
                             <div 
                                className="bg-indigo-600 h-full rounded-full transition-all duration-700"
                                style={{ width: `${Math.round(((item.montoTotal - item.saldoPendiente) / item.montoTotal) * 100)}%` }}
                             />
                          </div>
                       </div>

                       <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
                          <span className={`px-3 py-1 rounded-xl text-[11px] font-semibold uppercase tracking-wider ${
                             item.estado === 'pagado' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                          }`}>
                             {item.estado}
                          </span>
                          <FiArrowRight className="h-5 w-5 text-gray-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
                       </div>
                    </div>
                 </div>
              ))}
              
              {filtrados.length === 0 && (
                 <div className="col-span-full py-20 text-center">
                    <p className="text-gray-400 font-semibold uppercase tracking-wide text-sm">No se encontraron resultados</p>
                 </div>
              )}
           </div>
        </div>
      </div>
    );
  }

  // MODO DETALLE (Si hay ID)
  return (
    <div className="p-4 md:p-10 bg-gray-50 dark:bg-gray-950 min-h-screen animate-in fade-in duration-500">
      <div className="max-w-[1400px] mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
           <div className="flex items-center gap-6">
              <button 
                onClick={() => navigate('/admin/creditos/detalle')}
                className="p-3 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 hover:scale-105 transition-all text-gray-500 hover:text-indigo-600"
              >
                <FiArrowLeft className="h-5 w-5" />
              </button>
              <div>
                 <div className="flex items-center gap-3 mb-1">
                    <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Expediente Individual</span>
                    <span className={`px-2.5 py-0.5 rounded-lg text-[11px] font-semibold uppercase tracking-wide border ${
                      credito.estado === 'pagado'
                      ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-900'
                      : 'bg-indigo-50 text-indigo-600 border-indigo-100 dark:bg-indigo-900/20 dark:border-indigo-900'
                    }`}>
                      {credito.estado}
                    </span>
                 </div>
                 <h1 className="text-3xl font-semibold text-gray-900 dark:text-white tracking-tight">Crédito #{credito.idCredito}</h1>
              </div>
           </div>

           {credito.estado === 'activo' && (
             <button 
                onClick={() => setModalAbonoOpen(true)}
                className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold uppercase text-xs tracking-wide rounded-[2rem] shadow-xl shadow-indigo-500/40 hover:scale-105 active:scale-95 transition-all"
             >
                <FiPlus className="h-4 w-4" /> Registrar Abono
             </button>
           )}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
           
           {/* Columna Principal: Info y Productos */}
           <div className="xl:col-span-2 space-y-8">
              
              {/* Información General */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {/* Cliente */}
                 <div className="bg-white dark:bg-gray-900 p-8 rounded-[3rem] shadow-xl shadow-gray-200/40 dark:shadow-none border border-gray-100 dark:border-gray-800 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 dark:bg-indigo-900/20 rounded-bl-[100px] -mr-8 -mt-8 transition-transform group-hover:scale-110" />
                    <h3 className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-6 flex items-center gap-2 relative z-10">
                       <FiUser className="text-indigo-500" /> Identificación del Deudor
                    </h3>
                    <div className="relative z-10">
                       <p className="text-2xl font-semibold text-gray-900 dark:text-white leading-tight">{credito.usuarioCliente?.nombres} {credito.usuarioCliente?.apellidos}</p>
                       <p className="text-xs text-indigo-500 font-semibold mb-8">{credito.usuarioCliente?.correoElectronico || 'Correo no registrado'}</p>
                       
                        <div className="space-y-4">
                           <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 transition-all hover:bg-white dark:hover:bg-gray-800 hover:shadow-md">
                              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Documento</p>
                              <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">{credito.usuarioCliente?.usuario || 'N/A'}</p>
                           </div>
                           <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 transition-all hover:bg-white dark:hover:bg-gray-800 hover:shadow-md">
                              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Teléfono</p>
                              <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">{credito.usuarioCliente?.telefono || 'N/A'}</p>
                           </div>
                        </div>
                    </div>
                 </div>

                 {/* Venta Origen */}
                 <div className="bg-white dark:bg-gray-900 p-8 rounded-[3rem] shadow-xl shadow-gray-200/40 dark:shadow-none border border-gray-100 dark:border-gray-800 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 dark:bg-emerald-900/20 rounded-bl-[100px] -mr-8 -mt-8 transition-transform group-hover:scale-110" />
                    <h3 className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-6 flex items-center gap-2 relative z-10">
                       <FiFileText className="text-emerald-500" /> Transacción de Origen
                    </h3>
                    <div className="relative z-10">
                       <p className="text-2xl font-semibold text-gray-900 dark:text-white">Venta #{credito.venta?.numeroFactura}</p>
                       <p className="text-xs text-gray-500 font-semibold mb-8 uppercase tracking-tighter">Emitida el {new Date(credito.venta?.creadoEn).toLocaleDateString()}</p>
                       
                       <div className="grid grid-cols-2 gap-4">
                          <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                             <p className="text-[11px] font-semibold text-gray-400 uppercase leading-none mb-1">Valor Venta</p>
                             <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">{formatearPrecio(credito.venta?.total)}</p>
                          </div>
                          <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-2xl border border-indigo-100 dark:border-indigo-900/30">
                             <p className="text-[11px] font-semibold text-indigo-400 uppercase leading-none mb-1">Monto de Deuda</p>
                             <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">{formatearPrecio(credito.montoTotal)}</p>
                          </div>
                       </div>

                       <button
                          onClick={() => navigate(`/admin/ventas/detalle/${credito.idVenta}`)}
                          className="mt-6 w-full flex items-center justify-center gap-3 px-6 py-4 bg-gray-900 dark:bg-gray-800 text-white font-semibold text-[11px] uppercase tracking-wide rounded-2xl shadow-xl transition-all hover:scale-105 active:scale-95"
                       >
                          <FiEye className="h-4 w-4" />
                          Inspeccionar Factura
                       </button>
                    </div>
                 </div>
              </div>

              {/* Desglose de Productos */}
              <div className="bg-white dark:bg-gray-900 rounded-[3rem] shadow-xl shadow-gray-200/40 dark:shadow-none border border-gray-100 dark:border-gray-800 overflow-hidden">
                 <div className="p-8 border-b border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-800/20">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-3 uppercase tracking-tight">
                       <FiShoppingBag className="text-indigo-500" /> Artículos Financiados
                    </h3>
                 </div>
                 
                 <div className="p-8 space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar">
                     {credito.venta?.detalleVentas?.map((item) => {
                        const imageUrl = getImageUrl(item.variante);
                        return (
                           <div key={item.idDetalleVenta} className="flex gap-6 p-5 rounded-[2.5rem] bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:shadow-xl hover:border-indigo-100 dark:hover:border-indigo-900/40 transition-all items-center group">
                              <div className="h-24 w-24 bg-gray-50 dark:bg-gray-900 rounded-[2rem] overflow-hidden shadow-inner flex-shrink-0 border border-gray-100 dark:border-gray-800">
                                 {imageUrl ? (
                                    <img src={imageUrl} alt="Producto" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                 ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-200">
                                       <FiShoppingBag className="h-10 w-10" />
                                    </div>
                                 )}
                              </div>
                              <div className="flex-1 min-w-0">
                                 <p className="font-semibold text-gray-900 dark:text-white text-base leading-tight truncate uppercase tracking-tight">{item.variante?.producto?.nombreProducto}</p>
                                 <div className="flex flex-wrap gap-2 mt-3">
                                    <span className="text-[11px] font-semibold bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-xl text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                       Color: {item.variante?.color?.nombreColor}
                                    </span>
                                    <span className="text-[11px] font-semibold bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-xl text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                       Talla: {item.variante?.talla?.nombreTalla}
                                    </span>
                                 </div>
                                 <p className="text-[11px] font-semibold text-gray-400 mt-3 tracking-[0.1em] uppercase">SKU: {item.variante?.codigoSku}</p>
                              </div>
                              <div className="text-right">
                                 <p className="text-[11px] font-semibold text-gray-400 uppercase mb-1">Cant. x{Number(item.cantidad)}</p>
                                 <p className="text-xl font-semibold text-gray-900 dark:text-white tracking-tighter">{formatearPrecio(item.totalLinea || item.subtotal)}</p>
                              </div>
                           </div>
                        )
                     })}
                 </div>
              </div>

           </div>

           {/* Columna Lateral: Estado Financiero */}
           <div className="space-y-8">
              
              {/* Resumen de Deuda */}
              <div className="bg-white dark:bg-gray-900 p-10 rounded-[4rem] shadow-2xl shadow-indigo-500/10 dark:shadow-none border border-gray-100 dark:border-gray-800 text-center relative overflow-hidden group">
                 <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500" />
                 
                 <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-[0.12em] mb-4">Saldo Pendiente Actual</p>
                 <p className="text-5xl font-semibold text-gray-900 dark:text-white mb-10 tracking-tighter">{formatearPrecio(credito.saldoPendiente)}</p>
                 
                 <div className="relative h-6 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mb-10 shadow-inner">
                    <div 
                      className="absolute top-0 left-0 h-full bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-500 transition-all duration-1000 ease-out shadow-lg"
                      style={{ width: `${100 - calculateDebtPercentage()}%` }} 
                    >
                       <div className="absolute top-0 left-0 w-full h-full bg-white/20 animate-pulse" />
                    </div>
                 </div>
                 
                 <div className="flex justify-between items-end border-t border-gray-100 dark:border-gray-800 pt-8">
                    <div className="text-left space-y-1">
                       <p className="uppercase text-[11px] font-semibold text-gray-400 tracking-wide">Total Crédito</p>
                       <p className="text-lg font-semibold text-gray-900 dark:text-white">{formatearPrecio(credito.montoTotal)}</p>
                    </div>
                    <div className="text-right space-y-1">
                       <p className="uppercase text-[11px] font-semibold text-emerald-500 tracking-wide">Abonado ({100 - calculateDebtPercentage()}%)</p>
                       <p className="text-2xl font-semibold text-emerald-600">{formatearPrecio(credito.totalAbonado)}</p>
                    </div>
                 </div>
              </div>

              {/* Historial de Abonos */}
              <div className="bg-white dark:bg-gray-900 p-8 rounded-[3rem] shadow-xl shadow-gray-200/40 dark:shadow-none border border-gray-100 dark:border-gray-800 max-h-[600px] overflow-hidden flex flex-col relative">
                 <h3 className="text-xs font-semibold text-gray-800 dark:text-white uppercase tracking-[0.1em] mb-8 flex items-center gap-3">
                    <FiClock className="text-indigo-500" /> Línea de Tiempo de Pagos
                 </h3>
                 <div className="flex-1 overflow-y-auto custom-scrollbar space-y-6 pr-4 relative">
                    {credito.venta?.pagos?.filter(p => p.tipoPago === 'abono' || p.metodoPago?.nombreMetodo.toLowerCase().includes('crédito') === false).map((pago, idx) => (
                       <div key={pago.idPago} className="relative pl-10 group">
                          {/* Línea conectora */}
                          {idx !== (credito.venta?.pagos?.length - 1) && (
                             <div className="absolute left-[11px] top-6 bottom-[-24px] w-0.5 bg-gray-100 dark:bg-gray-800 transition-colors group-hover:bg-indigo-300" />
                          )}
                          
                          <div className="absolute left-0 top-1 h-6 w-6 rounded-2xl bg-white dark:bg-gray-900 border-2 border-indigo-500 flex items-center justify-center text-[11px] font-semibold text-indigo-500 z-10 transition-all group-hover:scale-110 group-hover:bg-indigo-500 group-hover:text-white">
                             {idx + 1}
                          </div>

                          <div className="bg-gray-50 dark:bg-gray-800/40 p-5 rounded-[2rem] border border-gray-100 dark:border-gray-800 transition-all hover:bg-white dark:hover:bg-gray-900 hover:shadow-xl hover:border-indigo-100 dark:hover:border-indigo-900/40">
                             <div className="flex justify-between items-start">
                                <div>
                                   <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1">{pago.metodoPago?.nombreMetodo}</p>
                                   <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">{new Date(pago.fechaPago).toLocaleDateString()}</p>
                                </div>
                                <span className="text-lg font-semibold text-emerald-600">+{formatearPrecio(pago.monto)}</span>
                             </div>
                             {pago.referencia && (
                                <p className="mt-3 text-[11px] font-semibold text-indigo-400 uppercase tracking-tighter bg-indigo-50 dark:bg-indigo-900/20 px-2 py-1 rounded-lg inline-block">Ref: {pago.referencia}</p>
                             )}
                          </div>
                       </div>
                    ))}
                    {(!credito.venta?.pagos || credito.venta?.pagos.length === 0) && (
                       <div className="text-center py-20 space-y-4">
                          <div className="h-16 w-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto text-gray-200">
                             <FiDollarSign className="h-8 w-8" />
                          </div>
                          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide italic leading-relaxed">
                             Inicia la línea de tiempo <br/> registrando el primer abono
                          </p>
                       </div>
                    )}
                 </div>
              </div>

           </div>

        </div>
      </div>

      {/* Modal de Registrar Abono */}
      <ModalRegistrarAbono
        isOpen={modalAbonoOpen}
        onClose={() => setModalAbonoOpen(false)}
        credito={credito}
        onAbonoRegistrado={cargarDetalle}
      />
    </div>
  );
};

export default DetalleCreditoPage;
