/**
 * @file HomePage.jsx
 * @brief Página principal de Adi Estilos — Experiencia premium de moda.
 */

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { obtenerCategoriasPublicas, obtenerProductosDestacados } from '../../api/publicApi';
import HeroBanner from '../../components/public/HeroBanner';
import SeccionCategorias from '../../components/public/SeccionCategorias';
import CarruselProductos from '../../components/public/CarruselProductos';
import { getImagenURL } from '../../utils/imageUrl';

const esProductoNuevo = (fecha) => {
  if (!fecha) return false;
  const hace7Dias = new Date();
  hace7Dias.setDate(hace7Dias.getDate() - 7);
  return new Date(fecha) > hace7Dias;
};

const HomePage = () => {
  const [categorias, setCategorias] = useState([]);
  const [productosDestacados, setProductosDestacados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [catsRes, prodsRes] = await Promise.all([
          obtenerCategoriasPublicas(),
          obtenerProductosDestacados(8)
        ]);

        const catsFormateadas = (catsRes.datos || [])
          .filter(cat => !cat.categoriaPadre)
          .slice(0, 3)
          .map(cat => ({
            id: cat.idCategoria,
            nombre: cat.nombreCategoria,
            imagen: getImagenURL(cat.imagenCategoria) || `https://images.unsplash.com/photo-1558171813-4c088753af8f?w=600&h=800&fit=crop`,
            cantidadProductos: cat._count?.productos || 0
          }));

        const prodsFormateados = (prodsRes.datos || []).map(prod => ({
          id: prod.idProducto,
          nombre: prod.nombreProducto,
          precio: prod.precioVentaSugerido,
          imagenPrincipal: getImagenURL(prod.imagenPrincipal) || '/images/placeholder-producto.svg',
          imagenes: prod.imagenesProductos || [],
          coloresDisponibles: prod.coloresDisponibles || [],
          esNuevo: esProductoNuevo(prod.creadoEn)
        }));

        setCategorias(catsFormateadas);
        setProductosDestacados(prodsFormateados);
      } catch (error) {
        console.error('Error cargando datos del home:', error);
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, []);

  const handleSubscribe = (e) => {
    e.preventDefault();
    console.log('Suscripción:', email);
    setEmail('');
  };

  return (
    <main className="overflow-x-hidden bg-white">
      {/* Hero Banner */}
      <HeroBanner
        titulo="ADI ESTILOS"
        subtitulo="Donde la moda se encuentra con la autenticidad"
        ctaTexto="Ver colección"
        ctaLink="/tienda"
      />

      {/* Sección de Categorías */}
      {!loading && categorias.length > 0 && (
        <SeccionCategorias
          categorias={categorias}
          titulo="Explora por categoría"
        />
      )}

      {/* Productos Destacados */}
      {!loading && productosDestacados.length > 0 && (
        <CarruselProductos
          productos={productosDestacados}
          titulo="Nuestros favoritos"
          verTodosLink="/tienda"
        />
      )}

      {/* Banner de Marca / Filosofía */}
      <section className="py-24 md:py-32 bg-neutral-50">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-xs uppercase tracking-[0.3em] text-neutral-500 mb-6 block">
              Nuestra filosofía
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-light text-neutral-900 leading-relaxed">
              Creemos en la moda que{' '}
              <span className="italic">trasciende temporadas</span>
            </h2>
            <p className="mt-8 text-neutral-600 font-light leading-relaxed max-w-2xl mx-auto">
              Cada pieza es seleccionada cuidadosamente, pensando en la calidad, 
              el diseño atemporal y el impacto que genera en quien la viste.
            </p>
            <Link 
              to="/nosotros"
              className="inline-flex items-center gap-2 mt-10 text-sm uppercase tracking-wider text-neutral-800 hover:text-neutral-600 transition-colors group"
            >
              Conoce nuestra historia
              <svg 
                className="w-4 h-4 transition-transform group-hover:translate-x-1" 
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Newsletter - Diseño elegante y minimalista */}
      <section className="py-20 md:py-28 bg-neutral-900">
        <div className="max-w-3xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            {/* Icono sutil */}
            <div className="w-12 h-px bg-amber-600/60 mx-auto mb-10" />
            
            <h3 className="text-2xl md:text-3xl font-light text-white tracking-wide">
              Únete a nuestra comunidad
            </h3>
            
            <p className="mt-4 text-neutral-400 font-light max-w-md mx-auto">
              Acceso anticipado a nuevas colecciones, ofertas exclusivas y contenido especial.
            </p>

            <form onSubmit={handleSubscribe} className="mt-10">
              <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Tu correo electrónico"
                  required
                  className="flex-1 px-6 py-4 bg-transparent border border-neutral-700 text-white placeholder:text-neutral-500 focus:outline-none focus:border-neutral-500 transition-colors text-sm tracking-wide"
                />
                <button
                  type="submit"
                  className="px-8 py-4 bg-white text-neutral-900 text-sm uppercase tracking-wider font-medium hover:bg-neutral-200 transition-colors"
                >
                  Suscribirme
                </button>
              </div>
              
              <p className="mt-6 text-xs text-neutral-600">
                Al suscribirte, aceptas recibir comunicaciones de Adi Estilos. 
                Puedes cancelar en cualquier momento.
              </p>
            </form>
            
            {/* Línea decorativa */}
            <div className="w-12 h-px bg-amber-600/60 mx-auto mt-10" />
          </motion.div>
        </div>
      </section>

      {/* Features / Beneficios */}
      <section className="py-16 border-b border-neutral-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
            {[
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                ),
                title: "Envío gratis",
                description: "En pedidos superiores a $100.000"
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                ),
                title: "Devoluciones fáciles",
                description: "30 días para cambios y devoluciones"
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                ),
                title: "Pago seguro",
                description: "Transacciones 100% protegidas"
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 text-neutral-700 mb-4">
                  {feature.icon}
                </div>
                <h4 className="text-sm uppercase tracking-wider text-neutral-900 font-medium mb-2">
                  {feature.title}
                </h4>
                <p className="text-sm text-neutral-500 font-light">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

    </main>
  );
};

export default HomePage;
