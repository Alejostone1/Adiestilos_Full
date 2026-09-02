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
    <section className="relative h-screen min-h-[600px] md:min-h-[700px] flex items-center justify-center overflow-hidden hero-clip">
      {/* Background */}
      <motion.div className="absolute inset-0 z-0" style={{ y }}>
        {imagenFondo ? (
          <div
            className="w-full h-full bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${imagenFondo})` }}
          />
        ) : (
          <div className="w-full h-full bg-surface-soft" />
        )}
        <div className="absolute inset-0 bg-surface/20 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-80" />
      </motion.div>

      {/* Content */}
      <motion.div
        className="relative z-10 text-center px-6 max-w-4xl mx-auto flex flex-col items-center"
        style={{ opacity }}
      >
        <motion.span
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="font-label-caps text-label-caps text-primary tracking-[0.2em] mb-4 uppercase"
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
            className="font-body-lg text-body-lg text-text-main mb-10 max-w-2xl"
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
      </motion.div>

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
  imagenFondo: PropTypes.string
};

export default HeroBanner;
