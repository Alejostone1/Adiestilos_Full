import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import useEmblaCarousel from 'embla-carousel-react';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';
import TarjetaProducto from './TarjetaProducto';

const CarruselProductos = ({
  productos = [],
  titulo,
  verTodosLink,
  autoScroll = false,
  autoScrollDelay = 5000
}) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    loop: false,
    skipSnaps: false,
    slidesToScroll: 1,
    containScroll: 'trimSnaps'
  });

  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);

    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi, onSelect]);

  useEffect(() => {
    if (!emblaApi || !autoScroll) return;

    const interval = setInterval(() => {
      if (emblaApi.canScrollNext()) {
        emblaApi.scrollNext();
      } else {
        emblaApi.scrollTo(0);
      }
    }, autoScrollDelay);

    return () => clearInterval(interval);
  }, [emblaApi, autoScroll, autoScrollDelay]);

  if (!productos.length) return null;

  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex items-end justify-between mb-12"
        >
          <div>
            <div className="w-12 h-px bg-neutral-300 mb-6" />
            <h2 className="text-xl md:text-2xl font-light text-neutral-900 tracking-[0.2em] uppercase">
              {titulo}
            </h2>
          </div>
          
          <div className="flex items-center gap-6">
            {verTodosLink && (
              <Link
                to={verTodosLink}
                className="hidden sm:inline-flex items-center gap-2 text-xs uppercase tracking-widest text-neutral-600 hover:text-neutral-900 transition-colors group"
              >
                Ver todos
                <svg 
                  className="w-4 h-4 transition-transform group-hover:translate-x-1" 
                  fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            )}
            
            {/* Controles */}
            <div className="flex items-center gap-2">
              <button
                onClick={scrollPrev}
                disabled={!canScrollPrev}
                className="w-10 h-10 flex items-center justify-center border border-neutral-300 text-neutral-600 hover:border-neutral-900 hover:text-neutral-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                aria-label="Anterior"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={scrollNext}
                disabled={!canScrollNext}
                className="w-10 h-10 flex items-center justify-center border border-neutral-300 text-neutral-600 hover:border-neutral-900 hover:text-neutral-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                aria-label="Siguiente"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Carrusel */}
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-4 md:gap-6">
            {productos.map((producto) => (
              <div
                key={producto.id}
                className="flex-none w-[70%] sm:w-[45%] md:w-[30%] lg:w-[23%]"
              >
                <TarjetaProducto {...producto} />
              </div>
            ))}
          </div>
        </div>

        {/* Link móvil */}
        {verTodosLink && (
          <div className="mt-10 text-center sm:hidden">
            <Link
              to={verTodosLink}
              className="inline-flex items-center gap-2 px-6 py-3 border border-neutral-900 text-xs uppercase tracking-widest text-neutral-900 hover:bg-neutral-900 hover:text-white transition-colors"
            >
              Ver todos los productos
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

CarruselProductos.propTypes = {
  productos: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      nombre: PropTypes.string.isRequired,
      precio: PropTypes.number.isRequired,
      imagenPrincipal: PropTypes.string.isRequired,
      coloresDisponibles: PropTypes.array,
      esNuevo: PropTypes.bool,
      slug: PropTypes.string
    })
  ).isRequired,
  titulo: PropTypes.string.isRequired,
  verTodosLink: PropTypes.string,
  autoScroll: PropTypes.bool,
  autoScrollDelay: PropTypes.number
};

export default CarruselProductos;
