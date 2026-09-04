/**
 * @file CatalogoPage.jsx
 * @brief Página de tienda/catálogo con diseño editorial ADI ESTILOS
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { obtenerCategoriasPublicas, obtenerProductosPublicos, buscarProductos } from '../../api/publicApi';
import TarjetaProducto from '../../components/public/TarjetaProducto';
import FiltroCategoriasJerarquico from '../../components/public/FiltroCategoriasJerarquico';
import FiltroPrecio from '../../components/public/FiltroPrecio';
import { getImagenURL } from '../../utils/imageUrl';

const esProductoNuevo = (fecha) => {
  if (!fecha) return false;
  const hace7Dias = new Date();
  hace7Dias.setDate(hace7Dias.getDate() - 7);
  return new Date(fecha) > hace7Dias;
};

const encontrarCategoriaPorId = (categorias, id) => {
  if (!id) return null;
  for (const cat of categorias) {
    if (cat.idCategoria === id) return cat;
    const sub = cat.subcategorias?.find((s) => s.idCategoria === id);
    if (sub) return sub;
  }
  return null;
};

const CatalogoPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paginacion, setPaginacion] = useState(null);

  const categoriaActiva = searchParams.get('categoria');
  const categoriaActivaId = categoriaActiva ? parseInt(categoriaActiva, 10) : null;
  const ordenActivo = searchParams.get('orden') || 'recientes';
  const busqueda = searchParams.get('buscar') || '';
  const precioMin = searchParams.get('precioMin') || '';
  const precioMax = searchParams.get('precioMax') || '';
  const paginaActual = parseInt(searchParams.get('pagina') || '1', 10);

  const [showFilters, setShowFilters] = useState(false);

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

  useEffect(() => {
    const cargarProductos = async () => {
      setLoading(true);
      try {
        let res;
        if (busqueda) {
          res = await buscarProductos(busqueda, {
            pagina: paginaActual,
            limite: 12,
            idCategoria: categoriaActiva,
            precioMin: precioMin || undefined,
            precioMax: precioMax || undefined
          });
        } else {
          res = await obtenerProductosPublicos({
            pagina: paginaActual,
            limite: 12,
            idCategoria: categoriaActiva,
            orden: ordenActivo,
            precioMin: precioMin || undefined,
            precioMax: precioMax || undefined
          });
        }
        const prodsFormateados = (res.datos || []).map(prod => ({
          id: prod.idProducto,
          nombre: prod.nombreProducto,
          precio: prod.precioVentaSugerido || prod.precioMinimo,
          imagenPrincipal: getImagenURL(prod.imagenPrincipal) || '/images/placeholder-producto.svg',
          imagenes: (prod.imagenes || []).map(img => ({ ...img, rutaImagen: getImagenURL(img.rutaImagen) })),
          coloresDisponibles: prod.coloresDisponibles || [],
          stockTotal: typeof prod.stockTotal === 'number' ? prod.stockTotal : null,
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
  }, [categoriaActiva, ordenActivo, busqueda, paginaActual, precioMin, precioMax]);

  const updateFilters = (newFilters) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    if (!newFilters.pagina) {
      params.delete('pagina');
    }
    setSearchParams(params);
  };

  const categoriaSeleccionada = useMemo(
    () => encontrarCategoriaPorId(categorias, categoriaActivaId),
    [categorias, categoriaActivaId]
  );

  const hayFiltroPrecio = Boolean(precioMin || precioMax);
  const cantidadFiltrosActivos = (categoriaActiva ? 1 : 0) + (hayFiltroPrecio ? 1 : 0);

  const formatoPrecioChip = () => {
    if (precioMin && precioMax) return `$${precioMin} – $${precioMax}`;
    if (precioMin) return `Desde $${precioMin}`;
    return `Hasta $${precioMax}`;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Page Header */}
      <section className="py-16 md:py-20 text-center">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="font-display-lg text-display-lg text-primary mb-4">
              {busqueda ? (
                <>Resultados para &quot;{busqueda}&quot;</>
              ) : categoriaSeleccionada ? (
                categoriaSeleccionada.nombreCategoria
              ) : (
                'Tienda'
              )}
            </h1>
            <p className="font-body-lg text-body-lg text-text-main">
              {busqueda
                ? `${paginacion?.totalRegistros || productos.length} productos encontrados`
                : 'Encuentra piezas para cada momento'
              }
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop pb-24">
        {/* Top Controls */}
        <div className="flex justify-between items-center mb-8 pb-4 border-b border-outline-variant/30">
          <button
            onClick={() => setShowFilters(true)}
            className="lg:hidden relative flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-outline">tune</span>
            <span className="font-label-caps text-label-caps text-text-main">Filtros</span>
            {cantidadFiltrosActivos > 0 && (
              <span className="absolute -top-2 -right-2 w-4 h-4 flex items-center justify-center bg-primary text-on-primary text-[10px] rounded-full">
                {cantidadFiltrosActivos}
              </span>
            )}
          </button>
          <div className="hidden lg:flex items-center gap-2">
            <span className="material-symbols-outlined text-outline">tune</span>
            <span className="font-label-caps text-label-caps text-text-main">Filtros</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <select
                value={ordenActivo}
                onChange={(e) => updateFilters({ orden: e.target.value })}
                className="appearance-none bg-surface-container-low border border-outline-variant text-text-main font-body-sm text-body-sm rounded-lg py-2 pl-4 pr-10 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              >
                <option value="recientes">Recomendados</option>
                <option value="precio_asc">Precio: Menor a Mayor</option>
                <option value="precio_desc">Precio: Mayor a Menor</option>
                <option value="nombre">Nombre A-Z</option>
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none text-[18px]">
                expand_more
              </span>
            </div>
            <span className="hidden sm:block font-body-sm text-body-sm text-text-main">
              {paginacion?.totalRegistros || productos.length} Productos
            </span>
          </div>
        </div>

        <div className="flex gap-gutter">
          {/* Sidebar - Desktop */}
          <aside className="w-72 shrink-0 hidden lg:block">
            <div className="sticky top-28 space-y-8">
              {/* Categorías */}
              <div>
                <h3 className="font-headline-sm text-headline-sm text-primary mb-4">Categoría</h3>
                <FiltroCategoriasJerarquico
                  categorias={categorias}
                  categoriaActivaId={categoriaActivaId}
                  onSelect={(id) => updateFilters({ categoria: id })}
                />
              </div>

              {/* Precio */}
              <div>
                <h3 className="font-headline-sm text-headline-sm text-primary mb-4">Precio</h3>
                <FiltroPrecio
                  precioMin={precioMin}
                  precioMax={precioMax}
                  onAplicar={(vals) => updateFilters(vals)}
                />
              </div>
            </div>
          </aside>

          {/* Product Grid */}
          <main className="flex-1 min-w-0">
            {/* Active Filters */}
            {(categoriaActiva || busqueda || hayFiltroPrecio) && (
              <div className="flex flex-wrap items-center gap-3 mb-6">
                {categoriaSeleccionada && (
                  <span className="inline-flex items-center gap-2 px-3 py-1 bg-surface-container rounded-full font-label-caps text-label-caps text-text-main">
                    {categoriaSeleccionada.nombreCategoria}
                    <button
                      onClick={() => updateFilters({ categoria: null })}
                      className="text-outline hover:text-primary"
                    >
                      ×
                    </button>
                  </span>
                )}
                {hayFiltroPrecio && (
                  <span className="inline-flex items-center gap-2 px-3 py-1 bg-surface-container rounded-full font-label-caps text-label-caps text-text-main">
                    {formatoPrecioChip()}
                    <button
                      onClick={() => updateFilters({ precioMin: null, precioMax: null })}
                      className="text-outline hover:text-primary"
                    >
                      ×
                    </button>
                  </span>
                )}
                {busqueda && (
                  <span className="inline-flex items-center gap-2 px-3 py-1 bg-surface-container rounded-full font-label-caps text-label-caps text-text-main">
                    &quot;{busqueda}&quot;
                    <button
                      onClick={() => updateFilters({ buscar: null })}
                      className="text-outline hover:text-primary"
                    >
                      ×
                    </button>
                  </span>
                )}
              </div>
            )}

            {/* Products Grid */}
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-10 md:gap-x-6 md:gap-y-12">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="aspect-[3/4] bg-surface-container-low rounded-lg mb-4" />
                    <div className="h-4 bg-surface-container-low w-3/4 mb-2 rounded mx-auto" />
                    <div className="h-4 bg-surface-container-low w-1/2 rounded mx-auto" />
                  </div>
                ))}
              </div>
            ) : productos.length > 0 ? (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-10 md:gap-x-6 md:gap-y-12">
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
                </div>

                {/* Pagination */}
                {paginacion && paginacion.totalPaginas > 1 && (
                  <div className="mt-16 flex items-center justify-center gap-2">
                    <button
                      onClick={() => updateFilters({ pagina: Math.max(1, paginaActual - 1) })}
                      disabled={paginaActual === 1}
                      className="w-10 h-10 flex items-center justify-center border border-outline-variant text-text-main hover:border-primary hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors rounded-lg"
                    >
                      <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                    </button>

                    {[...Array(Math.min(5, paginacion.totalPaginas))].map((_, i) => {
                      const pageNum = i + 1;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => updateFilters({ pagina: pageNum })}
                          className={`w-10 h-10 text-sm font-body-sm rounded-lg transition-colors ${
                            paginaActual === pageNum
                              ? 'bg-primary text-on-primary'
                              : 'border border-outline-variant hover:border-primary hover:text-primary text-text-main'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}

                    <button
                      onClick={() => updateFilters({ pagina: Math.min(paginacion.totalPaginas, paginaActual + 1) })}
                      disabled={paginaActual === paginacion.totalPaginas}
                      className="w-10 h-10 flex items-center justify-center border border-outline-variant text-text-main hover:border-primary hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors rounded-lg"
                    >
                      <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-20">
                <span className="material-symbols-outlined text-6xl text-outline-variant mb-6 block">inventory_2</span>
                <h2 className="font-headline-sm text-headline-sm text-on-surface mb-3">
                  No encontramos productos
                </h2>
                <p className="font-body-md text-body-md text-text-main mb-8 max-w-md mx-auto">
                  {busqueda
                    ? `No hay resultados para "${busqueda}". Intenta con otro término.`
                    : 'No hay productos disponibles con los filtros seleccionados.'
                  }
                </p>
                <button
                  onClick={() => setSearchParams({})}
                  className="px-8 py-3 border border-primary text-primary font-label-caps text-label-caps rounded-lg hover:bg-primary hover:text-on-primary transition-colors"
                >
                  Ver todos los productos
                </button>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 lg:hidden"
          >
            <div
              className="absolute inset-0 bg-inverse-surface/40"
              onClick={() => setShowFilters(false)}
            />

            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween' }}
              className="absolute left-0 top-0 bottom-0 w-80 max-w-full bg-background overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="font-headline-sm text-headline-sm text-on-surface">Filtros</h2>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="text-primary"
                  >
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>

                <div className="mb-8">
                  <h3 className="font-headline-sm text-headline-sm text-primary mb-4">Categoría</h3>
                  <FiltroCategoriasJerarquico
                    categorias={categorias}
                    categoriaActivaId={categoriaActivaId}
                    onSelect={(id) => {
                      updateFilters({ categoria: id });
                      setShowFilters(false);
                    }}
                  />
                </div>

                <div className="mb-8">
                  <h3 className="font-headline-sm text-headline-sm text-primary mb-4">Precio</h3>
                  <FiltroPrecio
                    precioMin={precioMin}
                    precioMax={precioMax}
                    onAplicar={(vals) => {
                      updateFilters(vals);
                      setShowFilters(false);
                    }}
                  />
                </div>

                <button
                  onClick={() => {
                    setSearchParams({});
                    setShowFilters(false);
                  }}
                  className="w-full py-3 border border-primary text-primary font-label-caps text-label-caps rounded-lg hover:bg-primary hover:text-on-primary transition-colors"
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
