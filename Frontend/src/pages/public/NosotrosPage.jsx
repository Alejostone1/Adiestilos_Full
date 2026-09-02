/**
 * @file NosotrosPage.jsx
 * @brief Nosotros — Editorial, pink branding, same content structure.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const fadeInUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
};

const NosotrosPage = () => {
  const valores = [
    {
      icono: <span className="material-symbols-outlined text-[28px]">favorite</span>,
      titulo: 'Pasión',
      descripcion: 'Amamos lo que hacemos. Cada prenda es seleccionada con dedicación y cariño.'
    },
    {
      icono: <span className="material-symbols-outlined text-[28px]">verified</span>,
      titulo: 'Calidad',
      descripcion: 'Solo trabajamos con marcas y materiales que cumplen nuestros altos estándares.'
    },
    {
      icono: <span className="material-symbols-outlined text-[28px]">schedule</span>,
      titulo: 'Atemporalidad',
      descripcion: 'Creemos en piezas que trascienden tendencias y perduran en el tiempo.'
    },
    {
      icono: <span className="material-symbols-outlined text-[28px]">groups</span>,
      titulo: 'Cercanía',
      descripcion: 'Cada cliente es importante. Ofrecemos una atención personalizada y genuina.'
    }
  ];

  const galeriaImagenes = [
    { url: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=600&h=800&fit=crop', alt: 'Interior de la tienda Adi Estilos' },
    { url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=800&fit=crop', alt: 'Colección de accesorios' },
    { url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&h=800&fit=crop', alt: 'Prendas seleccionadas' },
    { url: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600&h=800&fit=crop', alt: 'Detalles de moda' }
  ];

  return (
    <main className="overflow-x-hidden bg-background">
      {/* Hero Section */}
      <section className="relative h-[70vh] min-h-[500px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&h=1080&fit=crop"
            alt="Adi Estilos - Tienda de moda"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-primary/30 mix-blend-multiply" />
        </div>

        <div className="relative z-10 text-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="text-xs uppercase tracking-[0.4em] text-pure-white/80 mb-6 block font-label-caps">
              Nuestra historia
            </span>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extralight text-pure-white tracking-wide font-display-lg">
              Adi Estilos
            </h1>
            <div className="w-16 h-px bg-primary-container mx-auto mt-8" />
            <p className="mt-8 text-lg md:text-xl text-pure-white/80 font-light max-w-xl mx-auto leading-relaxed font-body-lg">
              Más que una tienda, un espacio donde la moda cobra vida
            </p>
          </motion.div>
        </div>
      </section>

      {/* Nuestra Historia */}
      <section className="py-24 md:py-32">
        <div className="max-w-6xl mx-auto px-5 md:px-16">
          <div className="grid md:grid-cols-2 gap-16 md:gap-24 items-center">
            <motion.div {...fadeInUp}>
              <span className="text-xs uppercase tracking-[0.3em] text-primary mb-6 block font-label-caps">
                Desde 2018
              </span>
              <h2 className="text-3xl md:text-4xl font-light text-on-surface leading-snug font-headline-md">
                Un sueño que nació en <span className="italic text-primary">Pereira</span>
              </h2>
              <div className="w-12 h-px bg-primary/30 my-8" />
              <div className="space-y-6 text-text-main font-body-md text-body-md leading-relaxed">
                <p>
                  Adi Estilos comenzó como un pequeño emprendimiento con una gran visión:
                  llevar moda de calidad y estilo contemporáneo a las mujeres de Pereira
                  y el Eje Cafetero.
                </p>
                <p>
                  Lo que empezó como una boutique íntima en el corazón de la ciudad,
                  hoy se ha convertido en un referente de moda para quienes buscan
                  prendas únicas que reflejen su personalidad.
                </p>
                <p>
                  Nuestra fundadora, apasionada por la moda desde temprana edad,
                  ha dedicado años a curar colecciones que combinan tendencias
                  internacionales con el espíritu vibrante de nuestra región.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="aspect-[4/5] overflow-hidden rounded-lg">
                <img
                  src="https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=600&h=800&fit=crop"
                  alt="Fundadora de Adi Estilos"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 w-32 h-32 border border-primary/20 rounded-lg" />
              <div className="absolute -top-6 -right-6 w-32 h-32 border border-primary/20 rounded-lg" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Valores */}
      <section className="py-24 md:py-32 bg-surface-bright">
        <div className="max-w-6xl mx-auto px-5 md:px-16">
          <motion.div {...fadeInUp} className="text-center mb-20">
            <span className="text-xs uppercase tracking-[0.3em] text-primary mb-6 block font-label-caps">
              Lo que nos define
            </span>
            <h2 className="text-3xl md:text-4xl font-light text-on-surface font-headline-md">
              Nuestra filosofía
            </h2>
            <div className="w-16 h-px bg-primary/30 mx-auto mt-8" />
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-12">
            {valores.map((valor, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="text-center group"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 border border-primary/20 text-primary mb-6 rounded-full group-hover:border-primary group-hover:bg-primary/5 transition-all duration-500">
                  {valor.icono}
                </div>
                <h3 className="text-sm uppercase tracking-[0.2em] text-on-surface font-medium mb-4 font-label-caps">
                  {valor.titulo}
                </h3>
                <p className="text-text-main font-body-sm text-body-sm leading-relaxed">
                  {valor.descripcion}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Galería */}
      <section className="py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-5 md:px-16">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <span className="text-xs uppercase tracking-[0.3em] text-primary mb-6 block font-label-caps">
              Nuestro espacio
            </span>
            <h2 className="text-3xl md:text-4xl font-light text-on-surface font-headline-md">
              Un rincón de estilo
            </h2>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {galeriaImagenes.map((imagen, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className={`overflow-hidden rounded-lg ${index === 0 ? 'md:col-span-2 md:row-span-2' : ''}`}
              >
                <div className="aspect-square overflow-hidden group cursor-pointer">
                  <img
                    src={imagen.url}
                    alt={imagen.alt}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Ubicación */}
      <section className="py-24 md:py-32 bg-on-surface text-pure-white">
        <div className="max-w-6xl mx-auto px-5 md:px-16">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div {...fadeInUp}>
              <span className="text-xs uppercase tracking-[0.3em] text-primary-container mb-6 block font-label-caps">
                Visítanos
              </span>
              <h2 className="text-3xl md:text-4xl font-light leading-snug font-headline-md">
                Encuéntranos en el corazón de{' '}
                <span className="italic text-pure-white/80">Pereira</span>
              </h2>
              <div className="w-12 h-px bg-pure-white/20 my-8" />

              <div className="space-y-6 text-pure-white/70 font-body-md text-body-md">
                <div className="flex items-start gap-4">
                  <span className="material-symbols-outlined text-primary-container mt-1">location_on</span>
                  <div>
                    <p className="text-pure-white font-normal mb-1">Dirección</p>
                    <p>Centro Comercial Victoria Plaza</p>
                    <p>Local 205, Pereira, Risaralda</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <span className="material-symbols-outlined text-primary-container mt-1">schedule</span>
                  <div>
                    <p className="text-pure-white font-normal mb-1">Horarios</p>
                    <p>Lunes a Sábado: 10:00 AM - 8:00 PM</p>
                    <p>Domingos: 11:00 AM - 6:00 PM</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <span className="material-symbols-outlined text-primary-container mt-1">call</span>
                  <div>
                    <p className="text-pure-white font-normal mb-1">Contacto</p>
                    <p>+57 (606) 333 4567</p>
                    <p>hola@adiestilos.com</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="aspect-square bg-on-surface-container overflow-hidden relative rounded-lg">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d63635.33!2d-75.7!3d4.81!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e38876f90f3e8f7%3A0x67f9a36d1b0a5d67!2sPereira%2C%20Risaralda%2C%20Colombia!5e0!3m2!1ses!2sco!4v1699999999999!5m2!1ses!2sco"
                  width="100%"
                  height="100%"
                  style={{ border: 0, filter: 'grayscale(100%) contrast(1.1)' }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Ubicación Adi Estilos en Pereira"
                />
                <div className="absolute inset-0 pointer-events-none border border-primary/10 rounded-lg" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 md:py-32 bg-background">
        <div className="max-w-4xl mx-auto px-5 md:px-16 text-center">
          <motion.div {...fadeInUp}>
            <div className="w-16 h-px bg-primary/30 mx-auto mb-10" />
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-light text-on-surface leading-relaxed font-headline-md">
              ¿Lista para descubrir tu <span className="italic text-primary">próximo look</span>?
            </h2>
            <p className="mt-8 text-text-main font-body-lg text-body-lg max-w-xl mx-auto leading-relaxed">
              Explora nuestra colección online o visítanos en tienda.
              Te esperamos con las últimas tendencias y asesoría personalizada.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
              <Link
                to="/tienda"
                className="inline-flex items-center justify-center px-10 py-4 bg-primary text-on-primary font-label-caps text-label-caps rounded-lg hover:bg-tertiary transition-colors shadow-sm"
              >
                Ver colección
              </Link>
              <Link
                to="/contacto"
                className="inline-flex items-center justify-center px-10 py-4 border border-primary text-primary font-label-caps text-label-caps rounded-lg hover:bg-primary hover:text-on-primary transition-colors"
              >
                Contactar
              </Link>
            </div>
            <div className="w-16 h-px bg-primary/30 mx-auto mt-16" />
          </motion.div>
        </div>
      </section>
    </main>
  );
};

export default NosotrosPage;
