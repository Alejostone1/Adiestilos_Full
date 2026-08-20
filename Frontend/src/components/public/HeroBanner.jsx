import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import PropTypes from 'prop-types';

const HeroBanner = ({
  titulo,
  subtitulo,
  ctaTexto,
  ctaLink,
  imagenFondo
}) => {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 150]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden bg-neutral-950">
      {/* Fondo con efecto parallax */}
      <motion.div 
        className="absolute inset-0"
        style={{ y }}
      >
        {imagenFondo ? (
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-110"
            style={{ backgroundImage: `url(${imagenFondo})` }}
          />
        ) : (
          <>
            {/* Fondo elegante con textura sutil */}
            <div className="absolute inset-0 bg-neutral-950" />
            
            {/* Patrón de líneas sutiles */}
            <div 
              className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage: `repeating-linear-gradient(
                  90deg,
                  transparent,
                  transparent 100px,
                  rgba(255,255,255,0.5) 100px,
                  rgba(255,255,255,0.5) 101px
                )`
              }}
            />
            
            {/* Gradiente sutil en esquinas */}
            <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-gradient-to-br from-amber-900/10 to-transparent" />
            <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-gradient-to-tl from-stone-800/20 to-transparent" />
          </>
        )}
        
        {/* Overlay oscuro */}
        <div className="absolute inset-0 bg-black/40" />
      </motion.div>

      {/* Contenido principal */}
      <motion.div 
        className="relative z-10 text-center px-6 max-w-5xl mx-auto"
        style={{ opacity }}
      >
        {/* Línea decorativa superior */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="w-16 h-px bg-amber-600/60 mx-auto mb-8"
        />

        {/* Título principal */}
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="font-light tracking-[0.3em] text-white"
        >
          <span className="block text-sm md:text-base uppercase text-stone-400 tracking-[0.4em] mb-4">
            Colección 2026
          </span>
          <span className="block text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extralight">
            {titulo}
          </span>
        </motion.h1>

        {/* Subtítulo */}
        {subtitulo && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="mt-8 text-base md:text-lg text-stone-400 font-light tracking-wide max-w-xl mx-auto leading-relaxed"
          >
            {subtitulo}
          </motion.p>
        )}

        {/* Botón CTA */}
        {ctaTexto && ctaLink && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="mt-12"
          >
            <Link
              to={ctaLink}
              className="group relative inline-flex items-center gap-3 px-8 py-4 text-sm uppercase tracking-[0.2em] text-white border border-white/30 hover:border-white/60 transition-all duration-500"
            >
              <span className="relative z-10">{ctaTexto}</span>
              <svg 
                className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
              
              {/* Efecto hover */}
              <span className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors duration-500" />
            </Link>
          </motion.div>
        )}

        {/* Línea decorativa inferior */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1, delay: 1.1 }}
          className="w-16 h-px bg-amber-600/60 mx-auto mt-12"
        />
      </motion.div>

      {/* Indicador de scroll */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-[10px] uppercase tracking-[0.3em] text-stone-500">Scroll</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="w-px h-12 bg-gradient-to-b from-stone-500 to-transparent"
        />
      </motion.div>

      {/* Decoración lateral izquierda */}
      <div className="absolute left-8 top-1/2 -translate-y-1/2 hidden lg:flex flex-col items-center gap-4">
        <div className="w-px h-20 bg-gradient-to-b from-transparent via-stone-600 to-transparent" />
        <span className="text-[10px] uppercase tracking-[0.2em] text-stone-500 [writing-mode:vertical-lr] rotate-180">
          Est. 2025
        </span>
        <div className="w-px h-20 bg-gradient-to-b from-transparent via-stone-600 to-transparent" />
      </div>

      {/* Decoración lateral derecha */}
      <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden lg:flex flex-col items-center gap-4">
        <div className="w-px h-20 bg-gradient-to-b from-transparent via-stone-600 to-transparent" />
        <span className="text-[10px] uppercase tracking-[0.2em] text-stone-500 [writing-mode:vertical-lr]">
          Premium
        </span>
        <div className="w-px h-20 bg-gradient-to-b from-transparent via-stone-600 to-transparent" />
      </div>
    </section>
  );
};

HeroBanner.propTypes = {
  titulo: PropTypes.string.isRequired,
  subtitulo: PropTypes.string,
  ctaTexto: PropTypes.string,
  ctaLink: PropTypes.string,
  imagenFondo: PropTypes.string
};

export default HeroBanner;
