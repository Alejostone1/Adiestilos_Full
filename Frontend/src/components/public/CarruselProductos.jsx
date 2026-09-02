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
    <section className="py-20 md:py-28 bg-surface">
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex items-end justify-between mb-12"
        >
          <div>
            <h2 className="font-headline-md text-headline-md text-primary">
              {titulo}
            </h2>
          </div>

          <div className="flex items-center gap-6">
            {verTodosLink && (
              <Link
                to={verTodosLink}
                className="hidden sm:inline-flex items-center gap-2 font-label-caps text-label-caps text-primary hover:text-tertiary transition-colors group"
              >
                Ver todos
                <span className="material-symbols-outlined text-sm transition-transform group-hover:translate-x-1">
                  arrow_forward
                </span>
              </Link>
            )}

            <div className="flex items-center gap-2">
              <button
                onClick={scrollPrev}
                disabled={!canScrollPrev}
                className="w-10 h-10 flex items-center justify-center border border-outline-variant text-text-main hover:border-primary hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors rounded-lg"
                aria-label="Anterior"
              >
                <span className="material-symbols-outlined text-[20px]">chevron_left</span>
              </button>
              <button
                onClick={scrollNext}
                disabled={!canScrollNext}
                className="w-10 h-10 flex items-center justify-center border border-outline-variant text-text-main hover:border-primary hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors rounded-lg"
                aria-label="Siguiente"
              >
                <span className="material-symbols-outlined text-[20px]">chevron_right</span>
              </button>
            </div>
          </div>
        </motion.div>

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

        {verTodosLink && (
          <div className="mt-10 text-center sm:hidden">
            <Link
              to={verTodosLink}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-container text-on-primary-container font-label-caps text-label-caps rounded-lg hover:bg-primary hover:text-on-primary transition-colors"
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
