/**
 * @file CategoriaPage.jsx
 * @brief Página que muestra productos filtrados por categoría
 */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { obtenerCategoriaPublica, obtenerProductosPorCategoria } from '../../api/publicApi';
import TarjetaProducto from '../../components/public/TarjetaProducto';
import { getImagenURL } from '../../utils/imageUrl';

const esProductoNuevo = (fecha) => {
  if (!fecha) return false;
  const hace7Dias = new Date();
  hace7Dias.setDate(hace7Dias.getDate() - 7);
  return new Date(fecha) > hace7Dias;
};

const CategoriaPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [categoria, setCategoria] = useState(null);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paginacion, setPaginacion] = useState(null);
  const [paginaActual, setPaginaActual] = useState(1);
  const [orden, setOrden] = useState('recientes');

  useEffect(() => {
    const cargarDatos = async () => {
      setLoading(true);
      try {
        const [catRes, prodsRes] = await Promise.all([
          obtenerCategoriaPublica(id),
          obtenerProductosPorCategoria(id, { pagina: paginaActual, limite: 12, orden })
        ]);

        setCategoria(catRes.datos || catRes);
        
        const prodsFormateados = (prodsRes.datos || []).map(prod => ({
          id: prod.idProducto,
          nombre: prod.nombreProducto,
          precio: prod.precioVentaSugerido || prod.precioMinimo,
          imagenPrincipal: getImagenURL(prod.imagenPrincipal) || '/images/placeholder-producto.svg',
          coloresDisponibles: prod.coloresDisponibles || [],
          esNuevo: esProductoNuevo(prod.creadoEn)
        }));
        
        setProductos(prodsFormateados);
        setPaginacion(prodsRes.paginacion);
      } catch (error) {
        console.error('Error cargando categoría:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      cargarDatos();
    }
  }, [id, paginaActual, orden]);

  const cambiarOrden = (nuevoOrden) => {
    setOrden(nuevoOrden);
    setPaginaActual(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50">
        {/* Skeleton del header */}
        <div className="h-64 bg-neutral-200 animate-pulse" />
        
        {/* Skeleton de productos */}
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="space-y-4">
                <div className="aspect-[3/4] bg-neutral-200 rounded-lg animate-pulse" />
                <div className="h-4 bg-neutral-200 rounded animate-pulse w-3/4" />
                <div className="h-4 bg-neutral-200 rounded animate-pulse w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!categoria) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-light text-neutral-800 mb-4">Categoría no encontrada</h2>
          <button
            onClick={() => navigate('/')}
            className="text-sm uppercase tracking-wider text-neutral-600 hover:text-neutral-900 transition-colors"
          >
            ← Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header de categoría */}
      <section className="relative h-72 md:h-80 overflow-hidden bg-neutral-900">
        {categoria.imagenCategoria && (
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-40"
            style={{ backgroundImage: `url(${categoria.imagenCategoria})` }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/80 to-transparent" />

        {/* Botón volver */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-5 left-5 z-20 inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-semibold uppercase tracking-wider hover:bg-white/20 hover:border-white/40 transition-all active:scale-95"
          aria-label="Volver atrás"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Volver
        </button>

        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">
          {/* Breadcrumb */}
          <nav className="mb-6">
            <ol className="flex items-center gap-2 text-xs uppercase tracking-wider text-neutral-400">
              <li>
                <Link to="/" className="hover:text-white transition-colors">Inicio</Link>
              </li>
              <li>
                <span className="mx-2">/</span>
              </li>
              <li>
                <Link to="/tienda" className="hover:text-white transition-colors">Tienda</Link>
              </li>
              <li>
                <span className="mx-2">/</span>
              </li>
              <li className="text-white">
                {categoria.nombreCategoria}
              </li>
            </ol>
          </nav>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-light tracking-wider text-white uppercase"
          >
            {categoria.nombreCategoria}
          </motion.h1>
          
          {categoria.descripcion && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mt-4 text-neutral-300 font-light max-w-xl"
            >
              {categoria.descripcion}
            </motion.p>
          )}
        </div>
      </section>

      {/* Barra de filtros */}
      <div className="border-b border-neutral-200 sticky top-0 bg-white z-20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-neutral-500">
              {paginacion?.totalRegistros || productos.length} productos
            </p>
            
            <div className="flex items-center gap-4">
              <span className="text-sm text-neutral-500 hidden sm:inline">Ordenar por:</span>
              <select
                value={orden}
                onChange={(e) => cambiarOrden(e.target.value)}
                className="text-sm border-0 bg-transparent text-neutral-800 font-medium focus:ring-0 cursor-pointer pr-8"
              >
                <option value="recientes">Más recientes</option>
                <option value="precio_asc">Precio: menor a mayor</option>
                <option value="precio_desc">Precio: mayor a menor</option>
                <option value="nombre">Nombre A-Z</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Grid de productos */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {productos.length > 0 ? (
          <>
            <motion.div 
              layout
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10 md:gap-x-6 md:gap-y-12"
            >
              <AnimatePresence mode="popLayout">
                {productos.map((producto, index) => (
                  <motion.div
                    key={producto.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.05 }}
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
                  onClick={() => setPaginaActual(p => Math.max(1, p - 1))}
                  disabled={paginaActual === 1}
                  className="px-4 py-2 text-sm border border-neutral-300 hover:border-neutral-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  Anterior
                </button>
                
                <div className="flex items-center gap-1">
                  {[...Array(paginacion.totalPaginas)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setPaginaActual(i + 1)}
                      className={`w-10 h-10 text-sm transition-colors ${
                        paginaActual === i + 1
                          ? 'bg-neutral-900 text-white'
                          : 'hover:bg-neutral-100'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                
                <button
                  onClick={() => setPaginaActual(p => Math.min(paginacion.totalPaginas, p + 1))}
                  disabled={paginaActual === paginacion.totalPaginas}
                  className="px-4 py-2 text-sm border border-neutral-300 hover:border-neutral-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  Siguiente
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <p className="text-neutral-500 mb-6">No hay productos disponibles en esta categoría.</p>
            <Link 
              to="/tienda"
              className="inline-block px-8 py-3 border border-neutral-900 text-sm uppercase tracking-wider hover:bg-neutral-900 hover:text-white transition-colors"
            >
              Ver toda la tienda
            </Link>
          </div>
        )}
      </div>

      {/* Subcategorías */}
      {categoria.subcategorias && categoria.subcategorias.length > 0 && (
        <section className="bg-neutral-50 py-16">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-xl font-light text-neutral-800 mb-8 text-center uppercase tracking-wider">
              También te puede interesar
            </h2>
            <div className="flex flex-wrap justify-center gap-4">
              {categoria.subcategorias.map((sub) => (
                <Link
                  key={sub.idCategoria}
                  to={`/categoria/${sub.idCategoria}`}
                  className="px-6 py-3 border border-neutral-300 text-sm hover:border-neutral-900 hover:bg-neutral-900 hover:text-white transition-all duration-300"
                >
                  {sub.nombreCategoria}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default CategoriaPage;
