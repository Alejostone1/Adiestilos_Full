import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const fadeInUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
};

const staggerContainer = {
  initial: {},
  whileInView: { transition: { staggerChildren: 0.15 } },
  viewport: { once: true }
};

const NosotrosPage = () => {
  const valores = [
    {
      icono: (
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
      titulo: 'Pasión',
      descripcion: 'Amamos lo que hacemos. Cada prenda es seleccionada con dedicación y cariño.'
    },
    {
      icono: (
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
      ),
      titulo: 'Calidad',
      descripcion: 'Solo trabajamos con marcas y materiales que cumplen nuestros altos estándares.'
    },
    {
      icono: (
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      titulo: 'Atemporalidad',
      descripcion: 'Creemos en piezas que trascienden tendencias y perduran en el tiempo.'
    },
    {
      icono: (
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      titulo: 'Cercanía',
      descripcion: 'Cada cliente es importante. Ofrecemos una atención personalizada y genuina.'
    }
  ];

  const galeriaImagenes = [
    {
      url: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=600&h=800&fit=crop',
      alt: 'Interior de la tienda Adi Estilos'
    },
    {
      url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=800&fit=crop',
      alt: 'Colección de accesorios'
    },
    {
      url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&h=800&fit=crop',
      alt: 'Prendas seleccionadas'
    },
    {
      url: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600&h=800&fit=crop',
      alt: 'Detalles de moda'
    }
  ];

  return (
    <main className="overflow-x-hidden bg-white">
      {/* Hero Section */}
      <section className="relative h-[70vh] min-h-[500px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&h=1080&fit=crop"
            alt="Adi Estilos - Tienda de moda"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-neutral-900/50" />
        </div>
        
        <div className="relative z-10 text-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="text-xs uppercase tracking-[0.4em] text-white/70 mb-6 block">
              Nuestra historia
            </span>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extralight text-white tracking-wide">
              Adi Estilos
            </h1>
            <div className="w-16 h-px bg-white/40 mx-auto mt-8" />
            <p className="mt-8 text-lg md:text-xl text-white/80 font-light max-w-xl mx-auto leading-relaxed">
              Más que una tienda, un espacio donde la moda cobra vida
            </p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <div className="w-px h-12 bg-white/30 animate-pulse" />
        </motion.div>
      </section>

      {/* Nuestra Historia */}
      <section className="py-24 md:py-32">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 md:gap-24 items-center">
            <motion.div {...fadeInUp}>
              <span className="text-xs uppercase tracking-[0.3em] text-neutral-400 mb-6 block">
                Desde 2018
              </span>
              <h2 className="text-3xl md:text-4xl font-light text-neutral-900 leading-snug">
                Un sueño que nació en{' '}
                <span className="italic">Pereira</span>
              </h2>
              <div className="w-12 h-px bg-neutral-300 my-8" />
              <div className="space-y-6 text-neutral-600 font-light leading-relaxed">
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
              <div className="aspect-[4/5] overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=600&h=800&fit=crop"
                  alt="Fundadora de Adi Estilos"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 w-32 h-32 border border-neutral-200" />
              <div className="absolute -top-6 -right-6 w-32 h-32 border border-neutral-200" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Valores y Filosofía */}
      <section className="py-24 md:py-32 bg-neutral-50">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div {...fadeInUp} className="text-center mb-20">
            <span className="text-xs uppercase tracking-[0.3em] text-neutral-400 mb-6 block">
              Lo que nos define
            </span>
            <h2 className="text-3xl md:text-4xl font-light text-neutral-900">
              Nuestra filosofía
            </h2>
            <div className="w-16 h-px bg-neutral-300 mx-auto mt-8" />
          </motion.div>

          <motion.div
            {...staggerContainer}
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-12"
          >
            {valores.map((valor, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="text-center group"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 border border-neutral-200 text-neutral-600 mb-6 group-hover:border-neutral-400 transition-colors duration-500">
                  {valor.icono}
                </div>
                <h3 className="text-sm uppercase tracking-[0.2em] text-neutral-900 font-medium mb-4">
                  {valor.titulo}
                </h3>
                <p className="text-neutral-500 font-light text-sm leading-relaxed">
                  {valor.descripcion}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Galería de la Tienda */}
      <section className="py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <span className="text-xs uppercase tracking-[0.3em] text-neutral-400 mb-6 block">
              Nuestro espacio
            </span>
            <h2 className="text-3xl md:text-4xl font-light text-neutral-900">
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
                className={`overflow-hidden ${index === 0 ? 'md:col-span-2 md:row-span-2' : ''}`}
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
      <section className="py-24 md:py-32 bg-neutral-900 text-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div {...fadeInUp}>
              <span className="text-xs uppercase tracking-[0.3em] text-neutral-400 mb-6 block">
                Visítanos
              </span>
              <h2 className="text-3xl md:text-4xl font-light leading-snug">
                Encuéntranos en el corazón de{' '}
                <span className="italic text-neutral-300">Pereira</span>
              </h2>
              <div className="w-12 h-px bg-neutral-600 my-8" />
              
              <div className="space-y-6 text-neutral-400 font-light">
                <div className="flex items-start gap-4">
                  <svg className="w-5 h-5 mt-1 text-neutral-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div>
                    <p className="text-white font-normal mb-1">Dirección</p>
                    <p>Centro Comercial Victoria Plaza</p>
                    <p>Local 205, Pereira, Risaralda</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <svg className="w-5 h-5 mt-1 text-neutral-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-white font-normal mb-1">Horarios</p>
                    <p>Lunes a Sábado: 10:00 AM - 8:00 PM</p>
                    <p>Domingos: 11:00 AM - 6:00 PM</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <svg className="w-5 h-5 mt-1 text-neutral-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <div>
                    <p className="text-white font-normal mb-1">Contacto</p>
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
              <div className="aspect-square bg-neutral-800 overflow-hidden relative">
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
                <div className="absolute inset-0 pointer-events-none border border-neutral-700" />
              </div>
              <div className="absolute -bottom-4 -right-4 w-full h-full border border-neutral-700 -z-10" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-24 md:py-32 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div {...fadeInUp}>
            <div className="w-16 h-px bg-neutral-300 mx-auto mb-10" />
            
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-light text-neutral-900 leading-relaxed">
              ¿Lista para descubrir tu{' '}
              <span className="italic">próximo look</span>?
            </h2>
            
            <p className="mt-8 text-neutral-500 font-light max-w-xl mx-auto leading-relaxed">
              Explora nuestra colección online o visítanos en tienda. 
              Te esperamos con las últimas tendencias y asesoría personalizada.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
              <Link
                to="/tienda"
                className="inline-flex items-center justify-center px-10 py-4 bg-neutral-900 text-white text-sm uppercase tracking-wider font-medium hover:bg-neutral-800 transition-colors"
              >
                Ver colección
              </Link>
              <Link
                to="/contacto"
                className="inline-flex items-center justify-center px-10 py-4 border border-neutral-300 text-neutral-900 text-sm uppercase tracking-wider font-medium hover:border-neutral-900 transition-colors"
              >
                Contactar
              </Link>
            </div>

            <div className="w-16 h-px bg-neutral-300 mx-auto mt-16" />
          </motion.div>
        </div>
      </section>
    </main>
  );
};

export default NosotrosPage;
