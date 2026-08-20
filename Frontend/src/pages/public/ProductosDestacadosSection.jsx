import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import useEmblaCarousel from 'embla-carousel-react';
import { motion, AnimatePresence } from 'framer-motion';

// ================== PRODUCT CARD ANIMADA ==================
const AnimatedProductCard = ({ prod, index, accentColor = '#c77833' }) => {
  return (
    <motion.div
      className="flex-shrink-0 w-full sm:w-[240px] md:w-[280px] lg:w-[300px]"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      whileHover={{ y: -10, zIndex: 10 }}
      style={{ perspective: '1000px' }}
    >
      <motion.div
        className="bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden h-full flex flex-col"
        whileHover={{
          y: -8,
          boxShadow: '0 20px 40px -10px rgba(0,0,0,0.25)',
          scale: 1.02
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        style={{
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Imagen con parallax */}
        <div className="relative h-72 overflow-hidden">
          <motion.img
            src={prod.imagen}
            alt={prod.nombre}
            className="w-full h-full object-cover"
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
          <div
            className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ pointerEvents: 'none' }}
          ></div>
        </div>

        <div className="p-6 flex-grow flex flex-col">
          <h3 className="text-lg font-semibold text-gray-900">{prod.nombre}</h3>
          <p className="text-gray-500 mt-1 font-medium">{prod.precio}</p>

          <motion.button
            className="mt-auto w-full rounded-full py-2.5 text-sm font-medium text-white mt-4"
            style={{ backgroundColor: accentColor }}
            whileHover={{
              backgroundColor: '#000',
              color: '#fff'
            }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            Añadir al carrito
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ================== SECCIÓN PRINCIPAL ==================
const ProductosDestacadosSection = ({ productosDestacados = [] }) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: 'start',
    slidesToScroll: 1,
    dragFree: false,
    skipSnaps: false,
  });

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState([]);

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    };

    emblaApi.on('select', onSelect);
    onSelect();

    setScrollSnaps(emblaApi.scrollSnapList());

    // Auto-play (opcional)
    const autoPlay = setInterval(() => {
      emblaApi.scrollNext();
    }, 4000);

    return () => {
      emblaApi.off('select', onSelect);
      clearInterval(autoPlay);
    };
  }, [emblaApi]);

  const accentColor = '#c77833'; // Terracota — ¡cámbialo si quieres!

  return (
    <section className="py-24 bg-gradient-to-b from-white to-gray-50 relative overflow-hidden">
      {/* Elementos decorativos */}
      <div
        className="absolute top-20 left-10 w-32 h-32 rounded-full opacity-5 blur-xl"
        style={{ backgroundColor: accentColor }}
      ></div>
      <div
        className="absolute bottom-20 right-10 w-40 h-40 rounded-full opacity-5 blur-xl"
        style={{ backgroundColor: accentColor }}
      ></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <motion.h2
          className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          Nuestros favoritos
        </motion.h2>

        {/* Carrusel */}
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex touch-pan-y">
            <AnimatePresence>
              {productosDestacados.map((prod, index) => (
                <AnimatedProductCard
                  key={index}
                  prod={prod}
                  index={index}
                  accentColor={accentColor}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Controles */}
        <div className="flex justify-between items-center mt-12">
          <button
            onClick={scrollPrev}
            className="w-12 h-12 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-md hover:shadow-lg transition-all"
            aria-label="Anterior"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Indicadores */}
          <div className="flex space-x-2">
            {scrollSnaps.map((_, i) => (
              <button
                key={i}
                onClick={() => emblaApi?.scrollTo(i)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  i === selectedIndex ? 'bg-gray-900 w-6' : 'bg-gray-300'
                }`}
                aria-label={`Ir al slide ${i + 1}`}
              />
            ))}
          </div>

          <button
            onClick={scrollNext}
            className="w-12 h-12 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-md hover:shadow-lg transition-all"
            aria-label="Siguiente"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Botón CTA */}
        <div className="text-center mt-16">
          <motion.div
            whileHover={{ scale: 1.03, boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
            whileTap={{ scale: 0.98 }}
          >
            <Link
              to="/tienda"
              className="inline-block rounded-full border-2 border-gray-900 px-10 py-3.5 text-sm font-semibold text-gray-900 hover:bg-gray-900 hover:text-white transition-all duration-300"
            >
              Ver toda la tienda
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ProductosDestacadosSection;