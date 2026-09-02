import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

const TarjetaCategoria = ({
  id,
  nombre,
  imagen,
  cantidadProductos
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleImageError = (e) => {
    if (e.target.src !== 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=800&h=1000&fit=crop') {
      e.target.src = 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=800&h=1000&fit=crop';
    }
  };

  const formatCount = (count) => {
    if (count === undefined || count === null) return 'Colección';
    if (count === 1) return '1 artículo';
    return `${count.toLocaleString()} artículos`;
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
      className="group relative w-full max-w-[320px] mx-auto"
    >
      <Link
        to={`/categoria/${id}`}
        className="block relative bg-pure-white rounded-2xl overflow-hidden border border-primary/15 hover:border-primary/50 shadow-card hover:shadow-card-hover transition-all duration-300 group-hover:-translate-y-1"
      >
        {/* Imagen */}
        <div className="relative aspect-[4/5] overflow-hidden m-2.5 rounded-xl bg-background">
          {/* Skeleton */}
          {!imageLoaded && (
            <div className="absolute inset-0 bg-background animate-pulse" />
          )}

          <img
            src={imagen}
            alt={nombre}
            onError={handleImageError}
            onLoad={() => setImageLoaded(true)}
            className={`absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.25,0.1,0.25,1)] group-hover:scale-105 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            loading="lazy"
          />

          {/* Gradiente inferior de marca */}
          <div className="absolute inset-0 bg-gradient-to-t from-primary/70 via-transparent to-transparent opacity-90" />

          {/* Badge contador */}
          <div className="absolute top-0 left-0 bg-primary-container/90 text-on-primary-container text-[10px] uppercase tracking-[0.15em] px-3 py-1.5 rounded-bl-xl font-label-caps">
            {formatCount(cantidadProductos)}
          </div>
        </div>

        {/* Contenido */}
        <div className="px-5 pb-5 pt-3 text-center">
          <h3 className="font-headline-md text-headline-md text-on-surface leading-tight">
            {nombre}
          </h3>
          <div className="mt-3 inline-flex items-center gap-2 font-label-caps text-label-caps text-primary">
            Explorar
            <span className="material-symbols-outlined text-[16px] transition-transform duration-300 group-hover:translate-x-1">
              arrow_forward
            </span>
          </div>
        </div>
      </Link>
    </motion.article>
  );
};

TarjetaCategoria.propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  nombre: PropTypes.string.isRequired,
  imagen: PropTypes.string.isRequired,
  cantidadProductos: PropTypes.number
};

export default TarjetaCategoria;
