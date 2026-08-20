/**
 * @file CatalogoPage.jsx
 * @brief Página de tienda/catálogo con diseño premium
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { obtenerCategoriasPublicas, obtenerProductosPublicos, buscarProductos } from '../../api/publicApi';
import TarjetaProducto from '../../components/public/TarjetaProducto';

const esProductoNuevo = (fecha) => {
  if (!fecha) return false;
  const hace7Dias = new Date();
  hace7Dias.setDate(hace7Dias.getDate() - 7);
  return new Date(fecha) > hace7Dias;
};

const CatalogoPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paginacion, setPaginacion] = useState(null);
  
  // Filtros desde URL
  const categoriaActiva = searchParams.get('categoria');
  const ordenActivo = searchParams.get('orden') || 'recientes';
  const busqueda = searchParams.get('buscar') || '';
  const paginaActual = parseInt(searchParams.get('pagina') || '1', 10);

  // Estado local para filtros móviles
  const [showFilters, setShowFilters] = useState(false);

  // Cargar categorías
  useEffect(() => {
    const cargarCategorias = async () => {
      try {
        const res = await obtenerCategoriasPublicas();
        setCategorias(res.datos || []);
      } catch (error) {
        console.error('Error cargando categorías:', error);
      }
    };
    cargarCategorias();
  }, []);

  // Cargar productos
  useEffect(() => {
    const cargarProductos = async () => {
      setLoading(true);
      try {
        let res;
        
        if (busqueda) {
          res = await buscarProductos(busqueda, {
            pagina: paginaActual,
            limite: 12,
            idCategoria: categoriaActiva
          });
        } else {
          res = await obtenerProductosPublicos({
            pagina: paginaActual,
            limite: 12,
            idCategoria: categoriaActiva,
            orden: ordenActivo
          });
        }

        const prodsFormateados = (res.datos || []).map(prod => ({
          id: prod.idProducto,
          nombre: prod.nombreProducto,
          precio: prod.precioVentaSugerido || prod.precioMinimo,
          imagenPrincipal: prod.imagenPrincipal || '/images/placeholder-producto.jpg',
          coloresDisponibles: prod.coloresDisponibles || [],
          esNuevo: esProductoNuevo(prod.creadoEn)
        }));
        
        setProductos(prodsFormateados);
        setPaginacion(res.paginacion);
      } catch (error) {
        console.error('Error cargando productos:', error);
        setProductos([]);
      } finally {
        setLoading(false);
      }
    };
    cargarProductos();
  }, [categoriaActiva, ordenActivo, busqueda, paginaActual]);

  // Actualizar URL con filtros
  const updateFilters = (newFilters) => {
    const params = new URLSearchParams(searchParams);
    
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    
    // Reset página al cambiar filtros
    if (!newFilters.pagina) {
      params.delete('pagina');
    }
    
    setSearchParams(params);
  };

  const categoriaSeleccionada = useMemo(() => {
    return categorias.find(c => c.idCategoria === parseInt(categoriaActiva, 10));
  }, [categorias, categoriaActiva]);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Header */}
      <section className="relative bg-neutral-100 py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="w-12 h-px bg-neutral-400 mx-auto mb-8" />
            
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-light text-neutral-900 tracking-wide">
              {busqueda ? (
                <>Resultados para "{busqueda}"</>
              ) : categoriaSeleccionada ? (
                categoriaSeleccionada.nombreCategoria
              ) : (
                'Nuestra Colección'
              )}
            </h1>
            
            <p className="mt-6 text-neutral-500 font-light max-w-xl mx-auto">
              {busqueda ? (
                `${paginacion?.totalRegistros || productos.length} productos encontrados`
              ) : (
                'Piezas cuidadosamente seleccionadas para quienes valoran la calidad y el estilo'
              )}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Sidebar de filtros - Desktop */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-28">
              {/* Categorías */}
              <div className="mb-10">
                <h3 className="text-xs uppercase tracking-[0.2em] text-neutral-400 mb-6">
                  Categorías
                </h3>
                <ul className="space-y-3">
                  <li>
                    <button
                      onClick={() => updateFilters({ categoria: null })}
                      className={`text-sm transition-colors ${
                        !categoriaActiva 
                          ? 'text-neutral-900 font-medium' 
                          : 'text-neutral-500 hover:text-neutral-900'
                      }`}
                    >
                      Todas las categorías
                    </button>
                  </li>
                  {categorias.map((cat) => (
                    <li key={cat.idCategoria}>
                      <button
                        onClick={() => updateFilters({ categoria: cat.idCategoria })}
                        className={`text-sm transition-colors ${
                          categoriaActiva === String(cat.idCategoria)
                            ? 'text-neutral-900 font-medium'
                            : 'text-neutral-500 hover:text-neutral-900'
                        }`}
                      >
                        {cat.nombreCategoria}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Ordenar */}
              <div>
                <h3 className="text-xs uppercase tracking-[0.2em] text-neutral-400 mb-6">
                  Ordenar por
                </h3>
                <ul className="space-y-3">
                  {[
                    { value: 'recientes', label: 'Más recientes' },
                    { value: 'precio_asc', label: 'Precio: menor a mayor' },
                    { value: 'precio_desc', label: 'Precio: mayor a menor' },
                    { value: 'nombre', label: 'Nombre A-Z' },
                  ].map((option) => (
                    <li key={option.value}>
                      <button
                        onClick={() => updateFilters({ orden: option.value })}
                        className={`text-sm transition-colors ${
                          ordenActivo === option.value
                            ? 'text-neutral-900 font-medium'
                            : 'text-neutral-500 hover:text-neutral-900'
                        }`}
                      >
                        {option.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </aside>

          {/* Contenido principal */}
          <main className="flex-1">
            {/* Barra superior móvil */}
            <div className="flex items-center justify-between mb-8 lg:hidden">
              <button
                onClick={() => setShowFilters(true)}
                className="flex items-center gap-2 text-sm text-neutral-600"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filtros
              </button>
              
              <select
                value={ordenActivo}
                onChange={(e) => updateFilters({ orden: e.target.value })}
                className="text-sm border-0 bg-transparent text-neutral-600 focus:ring-0"
              >
                <option value="recientes">Más recientes</option>
                <option value="precio_asc">Precio: menor</option>
                <option value="precio_desc">Precio: mayor</option>
                <option value="nombre">Nombre A-Z</option>
              </select>
            </div>

            {/* Info de resultados */}
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-neutral-100">
              <p className="text-sm text-neutral-500">
                {paginacion?.totalRegistros || productos.length} productos
              </p>
              
              {/* Filtros activos */}
              {(categoriaActiva || busqueda) && (
                <div className="flex items-center gap-3">
                  {categoriaSeleccionada && (
                    <span className="inline-flex items-center gap-2 px-3 py-1 bg-neutral-100 text-xs">
                      {categoriaSeleccionada.nombreCategoria}
                      <button 
                        onClick={() => updateFilters({ categoria: null })}
                        className="text-neutral-400 hover:text-neutral-600"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  {busqueda && (
                    <span className="inline-flex items-center gap-2 px-3 py-1 bg-neutral-100 text-xs">
                      "{busqueda}"
                      <button 
                        onClick={() => updateFilters({ buscar: null })}
                        className="text-neutral-400 hover:text-neutral-600"
                      >
                        ×
                      </button>
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Grid de productos */}
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-x-4 gap-y-10 md:gap-x-6 md:gap-y-12">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="aspect-[3/4] bg-neutral-100 mb-4" />
                    <div className="h-4 bg-neutral-100 w-3/4 mb-2" />
                    <div className="h-4 bg-neutral-100 w-1/2" />
                  </div>
                ))}
              </div>
            ) : productos.length > 0 ? (
              <>
                <motion.div
                  layout
                  className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-x-4 gap-y-10 md:gap-x-6 md:gap-y-12"
                >
                  <AnimatePresence mode="popLayout">
                    {productos.map((producto, index) => (
                      <motion.div
                        key={producto.id}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ delay: index * 0.03 }}
                      >
                        <TarjetaProducto {...producto} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>

                {/* Paginación */}
                {paginacion && paginacion.totalPaginas > 1 && (
                  <div className="mt-16 flex items-center justify-center gap-2">
                    <button
                      onClick={() => updateFilters({ pagina: Math.max(1, paginaActual - 1) })}
                      disabled={paginaActual === 1}
                      className="w-10 h-10 flex items-center justify-center border border-neutral-300 text-neutral-600 hover:border-neutral-900 hover:text-neutral-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      ←
                    </button>
                    
                    {[...Array(Math.min(5, paginacion.totalPaginas))].map((_, i) => {
                      const pageNum = i + 1;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => updateFilters({ pagina: pageNum })}
                          className={`w-10 h-10 text-sm transition-colors ${
                            paginaActual === pageNum
                              ? 'bg-neutral-900 text-white'
                              : 'hover:bg-neutral-100'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    
                    <button
                      onClick={() => updateFilters({ pagina: Math.min(paginacion.totalPaginas, paginaActual + 1) })}
                      disabled={paginaActual === paginacion.totalPaginas}
                      className="w-10 h-10 flex items-center justify-center border border-neutral-300 text-neutral-600 hover:border-neutral-900 hover:text-neutral-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      →
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-20">
                <div className="w-16 h-16 mx-auto mb-6 text-neutral-300">
                  <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <h2 className="text-xl font-light text-neutral-800 mb-3">
                  No encontramos productos
                </h2>
                <p className="text-neutral-500 font-light mb-8 max-w-md mx-auto">
                  {busqueda 
                    ? `No hay resultados para "${busqueda}". Intenta con otro término.`
                    : 'No hay productos disponibles con los filtros seleccionados.'
                  }
                </p>
                <button
                  onClick={() => setSearchParams({})}
                  className="px-8 py-3 border border-neutral-900 text-sm uppercase tracking-wider hover:bg-neutral-900 hover:text-white transition-colors"
                >
                  Ver todos los productos
                </button>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Modal de filtros móvil */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 lg:hidden"
          >
            <div 
              className="absolute inset-0 bg-black/50"
              onClick={() => setShowFilters(false)}
            />
            
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween' }}
              className="absolute left-0 top-0 bottom-0 w-80 max-w-full bg-white overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-lg font-light">Filtros</h2>
                  <button 
                    onClick={() => setShowFilters(false)}
                    className="text-neutral-500"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Categorías */}
                <div className="mb-8">
                  <h3 className="text-xs uppercase tracking-[0.2em] text-neutral-400 mb-4">
                    Categorías
                  </h3>
                  <ul className="space-y-3">
                    <li>
                      <button
                        onClick={() => {
                          updateFilters({ categoria: null });
                          setShowFilters(false);
                        }}
                        className={`text-sm ${!categoriaActiva ? 'text-neutral-900 font-medium' : 'text-neutral-500'}`}
                      >
                        Todas
                      </button>
                    </li>
                    {categorias.map((cat) => (
                      <li key={cat.idCategoria}>
                        <button
                          onClick={() => {
                            updateFilters({ categoria: cat.idCategoria });
                            setShowFilters(false);
                          }}
                          className={`text-sm ${
                            categoriaActiva === String(cat.idCategoria)
                              ? 'text-neutral-900 font-medium'
                              : 'text-neutral-500'
                          }`}
                        >
                          {cat.nombreCategoria}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Limpiar filtros */}
                <button
                  onClick={() => {
                    setSearchParams({});
                    setShowFilters(false);
                  }}
                  className="w-full py-3 border border-neutral-900 text-sm uppercase tracking-wider hover:bg-neutral-900 hover:text-white transition-colors"
                >
                  Limpiar filtros
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CatalogoPage;
