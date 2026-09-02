import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import PropTypes from 'prop-types';

const HeroBanner = ({
  titulo,
  subtitulo,
  ctaTexto,
  ctaLink,
  imagenesFondo = [],
  intervalo = 6000
}) => {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 150]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  const [indice, setIndice] = useState(0);
  const [pausado, setPausado] = useState(false);
  const timerRef = useRef(null);

  const total = imagenesFondo.length;

  const siguiente = () => {
    setIndice((prev) => (prev + 1) % total);
  };
  const anterior = () => {
    setIndice((prev) => (prev - 1 + total) % total);
  };

  useEffect(() => {
    if (total <= 1 || pausado) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }
    timerRef.current = setInterval(siguiente, intervalo);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [total, pausado, intervalo]);

  const hayImagenes = total > 0;

  return (
    <section
      className="relative h-screen min-h-[600px] md:min-h-[700px] flex items-center justify-center overflow-hidden hero-clip"
      onMouseEnter={() => setPausado(true)}
      onMouseLeave={() => setPausado(false)}
    >
      {/* Fondo: carrusel con crossfade */}
      <motion.div className="absolute inset-0 z-0" style={{ y }}>
        {hayImagenes ? (
          <AnimatePresence initial={false}>
            <motion.div
              key={indice}
              initial={{ opacity: 0, scale: 1.08 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.4, ease: 'easeInOut' }}
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: `url(${imagenesFondo[indice]})` }}
            />
          </AnimatePresence>
        ) : (
          <div className="w-full h-full bg-surface-soft" />
        )}

      {/* Overlays para legibilidad y estética */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-primary/10 to-background/40" />
      <div className="absolute inset-0 bg-on-surface/25" />
      </motion.div>

      {/* Indicators / controles del carrusel */}
      {hayImagenes && total > 1 && (
        <div className="absolute z-10 bottom-24 left-1/2 -translate-x-1/2 flex items-center gap-3">
          {imagenesFondo.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndice(i)}
              aria-label={`Ir a imagen ${i + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === indice ? 'w-6 bg-primary' : 'w-1.5 bg-on-surface/40 hover:bg-on-surface/70'
              }`}
            />
          ))}
        </div>
      )}

      {/* Content */}
      <motion.div
        className="relative z-10 text-center px-4 py-12 max-w-4xl mx-auto flex flex-col items-center"
        style={{ opacity }}
      >
        <div className="w-full bg-surface/45 backdrop-blur-md border border-white/40 rounded-3xl px-6 py-10 md:px-16 md:py-14 shadow-elevated">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="font-label-caps text-label-caps text-primary tracking-[0.2em] mb-4 uppercase block"
          >
            Nueva Colección
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="font-display-lg text-on-surface mb-6 drop-shadow-sm"
          >
            <span className="hidden md:block text-display-lg">{titulo}</span>
            <span className="md:hidden text-display-lg-mobile">{titulo}</span>
          </motion.h1>

          {subtitulo && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.6 }}
              className="font-body-lg text-body-lg text-text-main mb-10 max-w-2xl mx-auto"
            >
              {subtitulo}
            </motion.p>
          )}

          {ctaTexto && ctaLink && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.9 }}
            >
              <Link
                to={ctaLink}
                className="inline-flex items-center justify-center bg-primary-container text-on-primary-container font-label-caps text-label-caps px-10 py-4 rounded-lg hover:bg-primary hover:text-white transition-all duration-300 shadow-button hover:shadow-button-hover hover:-translate-y-1"
              >
                {ctaTexto.toUpperCase()}
              </Link>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Flechas del carrusel (escritorio) */}
      {hayImagenes && total > 1 && (
        <div className="absolute z-10 inset-x-6 top-1/2 -translate-y-1/2 hidden md:flex justify-between pointer-events-none">
          <button
            onClick={anterior}
            aria-label="Imagen anterior"
            className="pointer-events-auto w-11 h-11 flex items-center justify-center rounded-full border border-on-surface/30 text-on-surface hover:bg-on-surface hover:text-background transition-colors backdrop-blur-sm"
          >
            <span className="material-symbols-outlined text-[22px]">chevron_left</span>
          </button>
          <button
            onClick={siguiente}
            aria-label="Imagen siguiente"
            className="pointer-events-auto w-11 h-11 flex items-center justify-center rounded-full border border-on-surface/30 text-on-surface hover:bg-on-surface hover:text-background transition-colors backdrop-blur-sm"
          >
            <span className="material-symbols-outlined text-[22px]">chevron_right</span>
          </button>
        </div>
      )}

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="w-px h-10 bg-gradient-to-b from-primary/40 to-transparent"
        />
      </motion.div>
    </section>
  );
};

HeroBanner.propTypes = {
  titulo: PropTypes.string.isRequired,
  subtitulo: PropTypes.string,
  ctaTexto: PropTypes.string,
  ctaLink: PropTypes.string,
  imagenesFondo: PropTypes.arrayOf(PropTypes.string),
  intervalo: PropTypes.number
};

export default HeroBanner;
