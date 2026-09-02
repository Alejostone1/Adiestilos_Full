/**
 * @file HomePage.jsx
 * @brief Página principal de Adi Estilos — Experiencia editorial femenina.
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
    <main className="overflow-x-hidden bg-background">
      {/* Hero Banner */}
      <HeroBanner
        titulo="Tu estilo, tu esencia"
        subtitulo="Descubre prendas diseñadas para realzar tu belleza natural y brindarte comodidad con un toque de elegancia suprema."
        ctaTexto="Comprar ahora"
        ctaLink="/tienda"
      />

      {/* Categorías */}
      {!loading && categorias.length > 0 && (
        <SeccionCategorias
          categorias={categorias}
          titulo="Descubre tu estilo"
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

      {/* Brand Philosophy */}
      <section className="py-24 md:py-32 bg-surface">
        <div className="max-w-4xl mx-auto px-margin-mobile md:px-margin-desktop text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <span className="font-label-caps text-label-caps text-primary tracking-widest mb-6 block uppercase">
              Nuestra filosofía
            </span>
            <h2 className="font-headline-md text-headline-md md:text-4xl lg:text-5xl text-on-surface leading-relaxed">
              Creemos en la moda que{' '}
              <span className="italic">trasciende temporadas</span>
            </h2>
            <p className="mt-8 font-body-lg text-body-lg text-text-main leading-relaxed max-w-2xl mx-auto">
              Cada pieza es seleccionada cuidadosamente, pensando en la calidad,
              el diseño atemporal y el impacto que genera en quien la viste.
            </p>
            <Link
              to="/nosotros"
              className="inline-flex items-center gap-2 mt-10 font-label-caps text-label-caps text-primary hover:text-tertiary transition-colors group"
            >
              CONOCE NUESTRA HISTORIA
              <span className="material-symbols-outlined text-sm transition-transform group-hover:translate-x-1">
                arrow_forward
              </span>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-20 md:py-28 bg-surface-container">
        <div className="max-w-3xl mx-auto px-margin-mobile md:px-margin-desktop">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <div className="w-12 h-px bg-primary-container mx-auto mb-10" />

            <h3 className="font-headline-md text-headline-md text-on-surface">
              Únete a nuestra comunidad
            </h3>

            <p className="mt-4 font-body-md text-body-md text-text-main max-w-md mx-auto">
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
                  className="flex-1 px-6 py-4 bg-surface border border-secondary-fixed-dim rounded-lg text-on-surface placeholder-outline focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-body-md"
                />
                <button
                  type="submit"
                  className="px-8 py-4 bg-primary text-on-primary font-label-caps text-label-caps rounded-lg hover:bg-tertiary transition-colors shadow-sm"
                >
                  SUSCRIBIRME
                </button>
              </div>
            </form>

            <div className="w-12 h-px bg-primary-container mx-auto mt-10" />
          </motion.div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 bg-surface border-b border-outline-variant/30">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
            {[
              {
                icon: 'local_shipping',
                title: "Envío gratis",
                description: "En pedidos superiores a $150.000"
              },
              {
                icon: 'replay',
                title: "Devoluciones fáciles",
                description: "30 días para cambios y devoluciones"
              },
              {
                icon: 'verified',
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
                <div className="inline-flex items-center justify-center w-12 h-12 text-primary mb-4">
                  <span className="material-symbols-outlined text-3xl">{feature.icon}</span>
                </div>
                <h4 className="font-label-caps text-label-caps text-on-surface mb-2 uppercase">
                  {feature.title}
                </h4>
                <p className="font-body-sm text-body-sm text-text-main">
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
