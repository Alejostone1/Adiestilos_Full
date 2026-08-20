import React, { useState, useEffect } from 'react';
import { galeriaApi } from '../../../api/galeriaApi';
import { 
  FiSearch, FiBox, FiChevronDown, FiPlus, FiAlertCircle, 
  FiImage, FiTag, FiShoppingBag, FiInfo 
} from 'react-icons/fi';

const SelectorVariantes = ({ alAgregar }) => {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [expandidos, setExpandidos] = useState({});

  useEffect(() => {
    cargarProductos();
  }, []);

  const cargarProductos = async () => {
    setCargando(true);
    try {
      // Usamos el nuevo alias listarProductosGaleria
      const resultado = await galeriaApi.listarProductosGaleria();
      setProductos(resultado.datos || []);
    } catch (error) {
      console.error("Error cargando productos de galería", error);
    } finally {
      setCargando(false);
    }
  };

  const toggleExpandir = (id) => {
    setExpandidos(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const productosFiltrados = productos.filter(p => 
    p.titulo.toLowerCase().includes(busqueda.toLowerCase())
  );

  const UPLOAD_URL = (import.meta.env.VITE_API_URL || '').replace('/api', '');

  return (
    <div className="flex flex-col h-[600px] space-y-6">
      <div className="flex flex-col gap-1">
        <h3 className="text-lg font-black text-gray-800 dark:text-white flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600">
            <FiShoppingBag className="h-5 w-5" />
          </div>
          Catálogo de Productos
        </h3>
        <p className="text-xs text-gray-500 font-medium ml-10">Selecciona los productos y variantes para agregar al pedido</p>
      </div>

      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <FiSearch className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
        </div>
        <input
          type="text"
          className="w-full bg-white dark:bg-gray-800 border-2 border-transparent ring-1 ring-gray-100 dark:ring-gray-700/50 rounded-[1.5rem] py-4 pl-12 pr-4 text-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-sm font-medium"
          placeholder="Buscar por nombre de producto o referencia..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
        {cargando ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-100 border-t-indigo-600"></div>
              <FiBox className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-indigo-600 animate-pulse" />
            </div>
            <p className="mt-6 text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Cargando Inventario</p>
          </div>
        ) : productosFiltrados.length === 0 ? (
          <div className="text-center py-20 bg-gray-50/50 dark:bg-gray-800/30 rounded-[2.5rem] border-2 border-dashed border-gray-100 dark:border-gray-700">
            <div className="h-20 w-20 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
              <FiSearch className="h-10 w-10 text-gray-200" />
            </div>
            <h4 className="text-gray-800 dark:text-gray-200 font-black">Sin resultados</h4>
            <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest font-bold">No se encontraron productos coincidentes</p>
          </div>
        ) : (
          productosFiltrados.map(producto => (
            <div 
              key={producto.id}
              className={`group bg-white dark:bg-gray-800 border-2 transition-all duration-300 rounded-[2rem] overflow-hidden ${
                expandidos[producto.id] 
                ? 'border-indigo-500/20 shadow-xl shadow-indigo-500/5 ring-1 ring-indigo-500/10' 
                : 'border-transparent ring-1 ring-gray-100 dark:ring-gray-700/50 hover:ring-indigo-500/30 shadow-sm hover:shadow-md'
              }`}
            >
              <div 
                className={`p-4 flex items-center gap-5 cursor-pointer transition-colors ${
                  expandidos[producto.id] ? 'bg-indigo-50/20 dark:bg-indigo-900/10' : 'hover:bg-gray-50/50 dark:hover:bg-gray-700/30'
                }`}
                onClick={() => toggleExpandir(producto.id)}
              >
                <div className="h-20 w-20 rounded-2xl overflow-hidden bg-white flex-shrink-0 shadow-md border-2 border-white dark:border-gray-700 relative group-hover:scale-105 transition-transform duration-500">
                  {producto.imagen ? (
                    <img 
                      src={`${UPLOAD_URL}${producto.imagen}`} 
                      alt={producto.titulo}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full w-full bg-gray-50 dark:bg-gray-800">
                      <FiImage className="text-gray-300 text-2xl" />
                    </div>
                  )}
                  {expandidos[producto.id] && (
                    <div className="absolute inset-0 bg-indigo-600/10 backdrop-blur-[1px]" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded-lg border border-indigo-100 dark:border-indigo-800/50">
                      {producto.nombreCategoria || 'General'}
                    </span>
                    <span className="text-[9px] font-bold text-gray-400">Ref: {producto.subtitulo}</span>
                  </div>
                  <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100 truncate group-hover:text-indigo-600 transition-colors">
                    {producto.titulo}
                  </h3>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-1.5">
                      <div className="flex -space-x-1.5">
                         {producto.variantes?.slice(0,4).map((v, idx) => (
                           <div 
                             key={idx} 
                             className="h-4 w-4 rounded-full border border-white dark:border-gray-800 shadow-sm transition-transform hover:scale-125 cursor-help"
                             style={{ backgroundColor: v.color?.codigoHex || '#cbd5e1' }}
                             title={v.color?.nombreColor}
                           />
                         ))}
                      </div>
                      <span className="text-[11px] text-gray-400 font-bold tracking-tight">
                        {producto.variantes?.length || 0} Variantes
                      </span>
                    </div>
                    {(producto.variantes?.reduce((acc, v) => acc + v.cantidadStock, 0) || 0) <= 5 && (
                      <span className="flex items-center gap-1 text-[9px] font-bold text-amber-600 uppercase">
                        <FiAlertCircle className="h-2.5 w-2.5" /> Stock Bajo
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                   <div className={`p-2 rounded-xl transition-all ${
                     expandidos[producto.id] ? 'bg-indigo-600 text-white rotate-180 shadow-lg shadow-indigo-200' : 'bg-gray-100 dark:bg-gray-700 text-gray-400'
                   }`}>
                     <FiChevronDown className="h-4 w-4" />
                   </div>
                </div>
              </div>

              {expandidos[producto.id] && (
                <div className="px-6 pb-6 bg-gradient-to-b from-transparent to-gray-50/30 dark:to-gray-900/20 border-t border-gray-100/50 dark:border-gray-700/50 animate-in slide-in-from-top-4 duration-500">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 pt-4">
                    {producto.variantes && producto.variantes.length > 0 ? (
                      producto.variantes.map(variante => (
                        <div 
                          key={variante.id}
                          className="flex items-center gap-4 bg-white dark:bg-gray-800/80 p-3 rounded-2xl border border-gray-100 dark:border-gray-700 hover:border-indigo-500/50 hover:shadow-xl transition-all duration-300 group/item relative overflow-hidden"
                        >
                          <div className="h-14 w-14 rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-900 flex-shrink-0 border border-gray-100 dark:border-gray-700 shadow-inner group-hover/item:scale-105 transition-transform duration-500">
                             <img 
                                src={`${UPLOAD_URL}${variante.imagen || producto.imagen}`} 
                                alt="Variante"
                                className="h-full w-full object-cover"
                              />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              {/* Círculo de color dinámico */}
                              <div 
                                className="h-3 w-3 rounded-full border border-gray-200 dark:border-gray-600" 
                                style={{ backgroundColor: variante.color?.codigoHex || '#cbd5e1' }}
                              />
                              <span className="text-[11px] font-bold text-gray-700 dark:text-gray-200">
                                {variante.color?.nombreColor || 'S/C'}
                              </span>
                              <div className="h-1 w-1 rounded-full bg-gray-300 mx-1" />
                              <span className="text-[10px] font-bold px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-500 rounded-md uppercase">
                                {variante.talla?.nombreTalla || 'T/U'}
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-3 mt-1.5">
                              <span className="text-sm font-bold text-indigo-600">
                                ${variante.precioVenta?.toLocaleString() || '0'}
                              </span>
                              <span className={`text-[10px] font-bold uppercase tracking-tight ${
                                variante.cantidadStock > 5 
                                  ? 'text-gray-400' 
                                  : variante.cantidadStock > 0 
                                    ? 'text-amber-500' 
                                    : 'text-rose-500'
                              }`}>
                                {variante.cantidadStock > 0 ? `Stock: ${variante.cantidadStock}` : 'Agotado'}
                              </span>
                            </div>
                          </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              alAgregar(variante, producto);
                            }}
                            disabled={variante.cantidadStock <= 0}
                            className={`h-10 w-10 rounded-xl transition-all flex items-center justify-center shadow-lg ${
                              variante.cantidadStock > 0 
                                ? 'bg-indigo-600 text-white hover:bg-indigo-700 hover:scale-110 active:scale-90 shadow-indigo-100 dark:shadow-none' 
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-300 cursor-not-allowed shadow-none'
                            }`}
                          >
                            <FiPlus className={`h-5 w-5 ${variante.cantidadStock > 0 ? '' : 'opacity-30'}`} />
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-2 py-8 text-center bg-gray-50/50 dark:bg-gray-900/30 rounded-2xl border-2 border-dashed border-gray-100 dark:border-gray-700">
                        <FiInfo className="h-8 w-8 text-gray-200 mx-auto mb-2" />
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Sin variantes disponibles</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        )}

      </div>
    </div>
  );
};

export default SelectorVariantes;
