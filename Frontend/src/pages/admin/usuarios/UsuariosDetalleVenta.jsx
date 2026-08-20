import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, ShoppingBag, Calendar, User, 
  MapPin, Hash, CreditCard, CheckCircle2,
  Clock, Package, Tag, FileText, Printer,
  Download, Share2, Receipt, ShieldCheck,
  TrendingUp, Layers, ChevronRight, CornerDownRight,
  Info, AlertCircle, Copy, Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ventasApi } from "../../../api/ventasApi";
import PrecioFormateado from '../../../components/common/PrecioFormateado';
import Swal from 'sweetalert2';
import getImagenURL from '../../../utils/imageUrl';

export default function UsuariosDetalleVenta() {
  const { idVenta } = useParams();
  const navigate = useNavigate();
  const [venta, setVenta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    const fetchVenta = async () => {
      try {
        setLoading(true);
        const response = await ventasApi.getVentaById(idVenta);
        setVenta(response.datos || response.data || response);
      } catch (err) {
        console.error('Error fetching detalle venta:', err);
        setError('No se pudo cargar el expediente de la venta.');
      } finally {
        setLoading(false);
      }
    };
    fetchVenta();
  }, [idVenta]);

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Factura ${venta.numeroFactura} - Adi Estilos`,
          text: `Detalles de la venta ${venta.numeroFactura}`,
          url: url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
        Swal.fire({
          icon: 'success',
          title: 'Enlace copiado',
          text: 'El enlace a esta factura se ha copiado al portapapeles.',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000
        });
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  const getImageUrl = (path) => {
    if (!path) return null;
    return getImagenURL(path) || null;
  };

  const getProductoImagen = (item) => {
    // 1. Intentar obtener imagen principal de la variante
    const imgVariante = item.variante?.imagenesVariantes?.find(img => img.esPrincipal) || item.variante?.imagenesVariantes?.[0];
    if (imgVariante?.rutaImagen) return imgVariante.rutaImagen;

    // 2. Intentar obtener imagen principal del producto
    const imgProducto = item.variante?.producto?.imagenes?.find(img => img.esPrincipal) || item.variante?.producto?.imagenes?.[0];
    if (imgProducto?.rutaImagen) return imgProducto.rutaImagen;

    return null;
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-white dark:bg-gray-950 space-y-6">
        <div className="relative">
            <div className="absolute inset-0 bg-indigo-500 blur-2xl opacity-10 animate-pulse rounded-full"></div>
            <div className="relative animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-600 border-t-transparent"></div>
        </div>
        <p className="text-gray-400 font-medium uppercase tracking-[0.2em] text-[10px] animate-pulse">Sincronizando Factura</p>
      </div>
    );
  }

  if (error || !venta) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 bg-gray-50 dark:bg-gray-950">
        <div className="bg-white dark:bg-gray-900 p-10 rounded-3xl shadow-xl text-center max-w-lg border border-gray-100 dark:border-gray-800">
          <div className="w-16 h-16 bg-rose-50 dark:bg-rose-900/20 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
             <AlertCircle size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Expediente no encontrado</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6 font-medium">{error || 'La venta solicitada no está disponible en este momento.'}</p>
          <button 
            onClick={() => navigate(-1)} 
            className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 mx-auto shadow-lg shadow-indigo-100 dark:shadow-none"
          >
            <ArrowLeft size={18} />
            Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950 p-4 md:p-8 lg:p-12 space-y-8 transition-colors duration-300 print:bg-white print:p-0">
      
      {/* Estilos para impresión */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          body { background: white !important; }
          .invoice-card { border: none !important; box-shadow: none !important; }
        }
      `}</style>

      {/* Header Premium */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 no-print">
         <div className="flex items-center gap-5">
            <motion.button 
              whileHover={{ scale: 1.05, x: -3 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(-1)}
              className="p-4 bg-white dark:bg-gray-900 rounded-2xl text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 shadow-sm border border-gray-100 dark:border-gray-800 transition-all"
            >
              <ArrowLeft size={24} />
            </motion.button>
            
            <div>
               <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Factura {venta.numeroFactura}</h1>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                    venta.estadoPago === 'pagado' ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800' : 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800'
                  }`}>
                    {venta.estadoPago}
                  </span>
               </div>
               <div className="flex items-center gap-3 text-xs font-medium text-gray-500">
                  <span className="flex items-center gap-1.5"><Calendar size={14} className="text-indigo-500"/> {new Date(venta.creadoEn).toLocaleDateString()}</span>
                  <span className="w-1 h-1 bg-gray-300 dark:bg-gray-700 rounded-full" />
                  <span className="flex items-center gap-1.5 uppercase">ID: {venta.idVenta}</span>
               </div>
            </div>
         </div>

         <div className="flex items-center gap-2">
            <button 
              onClick={handlePrint}
              className="p-3 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:text-indigo-600 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm transition-all" 
              title="Imprimir"
            >
               <Printer size={20} />
            </button>
            <button 
               onClick={handlePrint}
               className="p-3 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:text-indigo-600 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm transition-all" 
               title="Descargar PDF"
            >
               <Download size={20} />
            </button>
            <button 
               onClick={handleShare}
               className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold shadow-lg shadow-indigo-100 dark:shadow-none hover:bg-indigo-700 transition-all text-sm"
            >
               {isCopied ? <Check size={18} /> : <Share2 size={18} />}
               <span>{isCopied ? 'Enlace Copiado' : 'Compartir'}</span>
            </button>
         </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
         {/* Main Content: Products List */}
         <div className="xl:col-span-8 space-y-8">
            <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden invoice-card">
                <div className="p-6 bg-gray-50/30 dark:bg-gray-800/20 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                   <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <Layers size={20} className="text-indigo-500" />
                      Detalle de Productos 
                      <span className="text-gray-400 font-medium ml-1">({venta.detalleVentas?.length || 0})</span>
                   </h3>
                </div>
               
               <div className="divide-y divide-gray-50 dark:divide-gray-800">
                  {venta.detalleVentas?.map((item, idx) => (
                    <motion.div 
                        key={idx} 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="p-6 md:p-8 flex items-center gap-6 group hover:bg-gray-50/30 dark:hover:bg-gray-800/10 transition-colors"
                    >
                        <div className="w-20 h-20 md:w-24 md:h-24 bg-gray-50 dark:bg-gray-800 rounded-2xl flex-shrink-0 overflow-hidden border border-gray-100 dark:border-gray-700 relative shadow-inner">
                           {getProductoImagen(item) ? (
                             <img 
                                src={getImageUrl(getProductoImagen(item))} 
                                alt={item.variante?.producto?.nombreProducto || 'Producto'} 
                                className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-700"
                                onError={(e) => {
                                   e.target.onerror = null;
                                   e.target.src = 'https://placehold.co/400x400?text=Sin+Imagen';
                                }}
                             />
                           ) : (
                             <div className="w-full h-full flex items-center justify-center text-gray-300 dark:text-gray-600">
                                <ShoppingBag size={32} />
                             </div>
                           )}
                        </div>

                        <div className="flex-1">
                            <h4 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight leading-tight group-hover:text-indigo-600 transition-colors">
                               {item.variante?.producto?.nombreProducto || 'Producto No Especificado'}
                            </h4>
                            <div className="flex flex-wrap items-center gap-2 mt-3">
                               {item.variante?.color && (
                                 <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 dark:bg-gray-800 text-[10px] font-bold text-gray-600 dark:text-gray-400 rounded-lg border border-gray-200/50 dark:border-gray-700">
                                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.variante.color.codigoHex || '#CBD5E1' }} />
                                    Color: {item.variante.color.nombreColor}
                                 </span>
                               )}
                               {item.variante?.talla && (
                                 <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 dark:bg-gray-800 text-[10px] font-bold text-gray-600 dark:text-gray-400 rounded-lg border border-gray-200/50 dark:border-gray-700">
                                    Talla: {item.variante.talla.nombreTalla}
                                 </span>
                               )}
                               <span className="px-2.5 py-1 text-[10px] font-bold text-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/20 rounded-lg border border-indigo-100/50 dark:border-indigo-800/30">
                                  SKU: {item.variante?.codigoSku || 'N/A'}
                               </span>
                            </div>
                        </div>

                        <div className="text-right">
                           <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{item.cantidad} x <PrecioFormateado precio={parseFloat(item.precioUnitario)} /></p>
                           <p className="text-xl font-bold text-gray-900 dark:text-white leading-none">
                              <PrecioFormateado precio={item.totalLinea} />
                           </p>
                        </div>
                    </motion.div>
                  ))}
               </div>
            </div>

            {/* Financial Totals */}
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 md:p-10 shadow-sm border border-gray-100 dark:border-gray-800 invoice-card">
               <div className="space-y-4">
                  <div className="flex items-center justify-between text-gray-500 text-sm font-medium">
                     <span className="uppercase tracking-widest text-[11px]">Subtotal</span>
                     <span><PrecioFormateado precio={venta.subtotal} /></span>
                  </div>
                  {Number(venta.descuentoTotal) > 0 && (
                    <div className="flex items-center justify-between text-rose-500 bg-rose-50/30 dark:bg-rose-900/10 p-4 rounded-xl border border-rose-100/50 dark:border-rose-800/30">
                       <span className="text-[11px] font-bold uppercase tracking-widest flex items-center gap-2">
                          <Tag size={14} /> Descuento Aplicado
                       </span>
                       <span className="text-lg font-bold">- <PrecioFormateado precio={venta.descuentoTotal} /></span>
                    </div>
                  )}
                  {Number(venta.impuestos) > 0 && (
                    <div className="flex items-center justify-between text-gray-500 text-sm font-medium">
                        <span className="uppercase tracking-widest text-[11px]">Impuestos</span>
                        <span><PrecioFormateado precio={venta.impuestos} /></span>
                    </div>
                  )}
                  <div className="pt-6 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
                     <div>
                        <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-[0.2em] block mb-1">Total a Pagar</span>
                        <h2 className="text-4xl font-bold text-gray-900 dark:text-white leading-none tracking-tight">
                           <PrecioFormateado precio={venta.total} />
                        </h2>
                     </div>
                     <div className="hidden sm:flex flex-col items-end gap-1.5 no-print">
                        <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg text-[10px] font-bold uppercase border border-emerald-500/20">
                           <CheckCircle2 size={12} /> Operación Exitosa
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>

         {/* Side Info Panel */}
         <div className="xl:col-span-4 space-y-8 no-print">
            {/* Logistic & Sales Info */}
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-800 space-y-8">
               <h3 className="text-lg font-bold text-gray-900 dark:text-white border-b border-gray-50 dark:border-gray-800 pb-4 flex items-center gap-2">
                  <Info size={20} className="text-indigo-500" />
                  Información Logística
               </h3>
               
               <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 text-gray-400 rounded-xl">
                       <Clock size={20} />
                    </div>
                    <div>
                       <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Fecha y Hora</p>
                       <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 leading-tight">
                         {new Date(venta.creadoEn).toLocaleString()}
                       </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 text-gray-400 rounded-xl">
                       <CreditCard size={20} />
                    </div>
                    <div>
                       <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Método Principal</p>
                       <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 leading-tight uppercase">
                         {venta.tipoVenta}
                       </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 text-gray-400 rounded-xl">
                       <User size={20} />
                    </div>
                    <div>
                       <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Vendedor Asignado</p>
                       <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 leading-tight">
                         {venta.usuarioVendedor?.nombres || 'Administrador'}
                       </p>
                    </div>
                  </div>

                  {venta.direccionEntrega && (
                    <div className="p-4 bg-gray-50/50 dark:bg-gray-800/40 rounded-2xl border border-gray-100 dark:border-gray-700">
                       <div className="flex items-center gap-2 text-rose-500 mb-2 font-bold text-[10px] uppercase tracking-wider">
                          <MapPin size={14} /> Dirección de Envío
                       </div>
                       <p className="text-xs text-gray-600 dark:text-gray-400 font-medium italic">{venta.direccionEntrega}</p>
                    </div>
                  )}
               </div>
            </div>

            {/* Payments Summary */}
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-800">
               <h3 className="text-lg font-bold text-gray-900 dark:text-white border-b border-gray-50 dark:border-gray-800 pb-4 mb-6 flex items-center gap-2 uppercase tracking-tighter">
                  <TrendingUp size={20} className="text-emerald-500" /> Historial de Pagos
               </h3>
               <div className="space-y-3">
                  {venta.pagos?.length > 0 ? (
                    venta.pagos.map((pago, i) => (
                      <div key={i} className="p-4 bg-gray-50 dark:bg-gray-800/40 rounded-2xl border border-gray-100 dark:border-gray-800 flex items-center justify-between">
                         <div className="flex items-center gap-3">
                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                            <div>
                               <p className="text-xs font-bold text-gray-900 dark:text-white uppercase leading-none">{pago.metodoPago?.nombreMetodo || 'Pago'}</p>
                               <p className="text-[10px] text-gray-400 font-medium mt-1 uppercase">Transacción {i+1}</p>
                            </div>
                         </div>
                         <p className="text-sm font-bold text-gray-900 dark:text-white"><PrecioFormateado precio={pago.monto} /></p>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center py-6 opacity-30">
                       <FileText size={40} className="mb-2" />
                       <p className="text-xs font-bold text-gray-400">Sin pagos manuales</p>
                    </div>
                  )}
               </div>
            </div>
         </div>
      </div>

    </div>
  );
}
