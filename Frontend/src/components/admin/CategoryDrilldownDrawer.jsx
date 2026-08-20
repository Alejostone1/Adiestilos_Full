import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  X, 
  Package, 
  ChevronDown, 
  ChevronRight, 
  Layers, 
  Tag, 
  DollarSign, 
  Box,
  LayoutGrid,
  Loader2,
  AlertCircle,
  ExternalLink,
  ChevronUp
} from 'lucide-react';
import { productosApi } from '../../api/productosApi';
import { variantesApi } from '../../api/variantesApi';
import PrecioFormateado from '../common/PrecioFormateado';
import StatusBadge from './StatusBadge';
import StockIndicator from './StockIndicator';

export default function CategoryDrilldownDrawer({ isOpen, onClose, categoria }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [productos, setProductos] = useState([]);
  const [expandedProduct, setExpandedProduct] = useState(null);
  const [variantesMap, setVariantesMap] = useState({});
  const [loadingVariantes, setLoadingVariantes] = useState({});

  // Reset state when drawer closes or category changes
  useEffect(() => {
    if (isOpen && categoria) {
      fetchProductos();
    } else {
      setProductos([]);
      setExpandedProduct(null);
      setVariantesMap({});
    }
  }, [isOpen, categoria]);

  const fetchProductos = async () => {
    setLoading(true);
    try {
      // Assuming obtenerProductos can take params
      const response = await productosApi.obtenerProductos({ idCategoria: categoria.idCategoria });
      const data = response.datos || response.data || response;
      setProductos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error al cargar productos de la categoría:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleProduct = async (idProducto) => {
    if (expandedProduct === idProducto) {
      setExpandedProduct(null);
      return;
    }

    setExpandedProduct(idProducto);

    // If variants already loaded, skip
    if (variantesMap[idProducto]) return;

    setLoadingVariantes(prev => ({ ...prev, [idProducto]: true }));
    try {
      const response = await variantesApi.getVariantes(); // Should ideally be filtered by product in API
      const allVariantes = response.datos || response.data || response;
      const productVariantes = allVariantes.filter(v => v.idProducto === idProducto);
      
      setVariantesMap(prev => ({ ...prev, [idProducto]: productVariantes }));
    } catch (error) {
      console.error("Error al cargar variantes:", error);
    } finally {
      setLoadingVariantes(prev => ({ ...prev, [idProducto]: false }));
    }
  };

  const getImagenUrl = (imagenPath) => {
    if (!imagenPath) return '/placeholder.png';
    if (typeof imagenPath !== 'string') return '/placeholder.png';
    return getImagenURL(imagenPath) || '/placeholder.png';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Overlay con blur */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-500"
        onClick={onClose}
      />
      
      {/* Panel Lateral */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-lg md:max-w-xl bg-white dark:bg-slate-900 shadow-2xl flex flex-col transition-transform duration-500 transform ease-out translate-x-0">
          
          {/* Header del Panel */}
          <div className="px-6 py-8 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/50 sticky top-0 z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center border border-purple-100 dark:border-purple-800/50">
                  <LayoutGrid className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white leading-tight">
                    {categoria?.nombreCategoria}
                  </h2>
                  <p className="text-sm font-semibold text-slate-400 uppercase tracking-wide mt-0.5">
                    Catálogo de Productos
                  </p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="w-10 h-10 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-all active:scale-95"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-100 dark:border-slate-700 flex items-center gap-2">
                <Package className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  {productos.length} {productos.length === 1 ? 'Producto' : 'Productos'}
                </span>
              </div>
              <StatusBadge status={categoria?.estado} size="sm" />
            </div>
          </div>

          {/* Cuerpo - Lista de Productos */}
          <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar space-y-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 opacity-50">
                <Loader2 className="w-10 h-10 animate-spin text-purple-600 mb-4" />
                <span className="font-semibold text-slate-400 animate-pulse">Analizando inventario...</span>
              </div>
            ) : productos.length === 0 ? (
              <div className="text-center py-20 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700">
                <Box className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="font-semibold text-slate-500">No hay productos vinculados</h3>
                <p className="text-xs text-slate-400 mt-1">Esta categoría aún no tiene stock asociado.</p>
              </div>
            ) : (
              productos.map((producto) => (
                <div 
                  key={producto.idProducto}
                  className={`group relative overflow-hidden bg-white dark:bg-slate-800 rounded-3xl border transition-all duration-300 ${
                    expandedProduct === producto.idProducto 
                    ? 'border-purple-200 dark:border-purple-800 shadow-xl shadow-purple-500/10' 
                    : 'border-slate-100 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-lg'
                  }`}
                >
                  {/* Card Header (Click to expand) */}
                  <div 
                    className="p-5 flex items-center gap-4 cursor-pointer"
                    onClick={() => toggleProduct(producto.idProducto)}
                  >
                    <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-900 border border-slate-50 dark:border-slate-700 p-1 shrink-0">
                      <img 
                        src={getImagenUrl(producto.imagenes?.[0]?.rutaImagen || producto.imagenPrincipal)} 
                        alt={producto.nombreProducto}
                        className="w-full h-full object-cover rounded-xl"
                        onError={(e) => { e.target.src = '/placeholder.png' }}
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-slate-900 dark:text-white truncate pr-6 group-hover:text-purple-600 transition-colors">
                        {producto.nombreProducto}
                      </h4>
                      <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                        <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                           <DollarSign className="w-3 h-3" />
                           <span className="text-sm font-semibold tracking-tight">
                             <PrecioFormateado precio={producto.precioVentaSugerido} />
                           </span>
                        </div>
                        <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                          REF: {producto.codigoReferencia}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {expandedProduct === producto.idProducto ? (
                        <ChevronUp className="w-5 h-5 text-purple-600" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-slate-300 group-hover:text-slate-500 transition-colors" />
                      )}
                    </div>
                  </div>

                  {/* Accordion Content (Variantes) */}
                  {expandedProduct === producto.idProducto && (
                    <div className="px-5 pb-5 pt-2 animate-in slide-in-from-top-4 duration-300">
                      <div className="border-t border-slate-50 dark:border-slate-700/50 mt-2 pt-4">
                        <div className="flex items-center gap-2 mb-4">
                           <Layers className="w-3.5 h-3.5 text-purple-500" />
                           <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-[0.1em]">Variantes Disponibles</span>
                        </div>

                        {loadingVariantes[producto.idProducto] ? (
                          <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl">
                             <Loader2 className="w-4 h-4 animate-spin text-purple-500" />
                             <span className="text-xs font-semibold text-slate-400 italic">Desglosando stock...</span>
                          </div>
                        ) : !variantesMap[producto.idProducto] || variantesMap[producto.idProducto].length === 0 ? (
                          <div className="flex items-center gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-2xl border border-amber-100 dark:border-amber-800/30">
                             <AlertCircle className="w-4 h-4 text-amber-500" />
                             <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">Este producto no cuenta con variantes físicas todavía.</span>
                          </div>
                        ) : (
                          <div className="grid gap-2">
                             {variantesMap[producto.idProducto].map((variante) => (
                               <div 
                                 key={variante.idVariante}
                                 className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-700/50 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all group/var"
                               >
                                 <div className="flex items-center gap-3">
                                   <div className="w-8 h-8 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 shrink-0">
                                      <img 
                                        src={getImagenUrl(variante.imagenesVariantes?.[0]?.rutaImagen || producto.imagenes?.[0]?.rutaImagen)} 
                                        alt="Skin"
                                        className="w-full h-full object-cover"
                                      />
                                   </div>
                                   <div>
                                      <div className="flex items-center gap-2">
                                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                                          {variante.color?.nombreColor || 'No-Color'} / {variante.talla?.nombreTalla || 'No-Talla'}
                                        </span>
                                        <StatusBadge status={variante.estado} size="xs" variant="dot" />
                                      </div>
                                      <span className="text-[11px] font-mono text-slate-400 uppercase">{variante.codigoSku}</span>
                                   </div>
                                 </div>

                                 <div className="text-right">
                                    <StockIndicator 
                                      currentStock={variante.cantidadStock} 
                                      minStock={variante.stockMinimo} 
                                      size="xs" 
                                      variant="compact"
                                    />
                                 </div>
                               </div>
                             ))}
                          </div>
                        )}
                        
                        <div className="mt-4 flex justify-center">
                           <button 
                            onClick={() => navigate(`/admin/productos/${producto.idProducto}/variantes`)}
                            className="flex items-center gap-2 text-[11px] font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-800 transition-colors uppercase tracking-wide px-4 py-2 bg-purple-50 dark:bg-purple-900/30 rounded-xl"
                           >
                             Gestionar en maestro <ExternalLink className="w-3 h-3" />
                           </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer del Panel */}
          <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80">
            <button 
              onClick={onClose}
              className="w-full py-4 bg-slate-900 dark:bg-slate-700 hover:bg-black dark:hover:bg-slate-600 text-white rounded-2xl font-semibold text-sm tracking-wide transition-all active:scale-[0.98] shadow-lg shadow-slate-900/10"
            >
              CERRAR EXPLORADOR
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
