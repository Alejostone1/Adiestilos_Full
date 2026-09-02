import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import PropTypes from 'prop-types';

const TarjetaCategoria = ({
  id,
  nombre,
  imagen,
  cantidadProductos,
  descripcion,
  colorDestacado = '#1a1a1a'
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleImageError = (e) => {
    e.target.src = `https://images.unsplash.com/photo-1558171813-4c088753af8f?w=800&h=1000&fit=crop`;
  };

  const formatCount = (count) => {
    if (count === undefined || count === null) return null;
    if (count === 0) return 'Colección exclusiva';
    if (count === 1) return '1 artículo';
    return `${count.toLocaleString()} artículos`;
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ 
        duration: 0.8, 
        ease: [0.25, 0.1, 0.25, 1] 
      }}
      className={`group relative w-full max-w-[320px] mx-auto cursor-pointer transition-all duration-300 ${
        isHovered ? '-translate-y-1' : ''
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link 
        to={`/categoria/${id}`} 
        className={`block relative overflow-hidden rounded-sm transition-all duration-300 ${
          isHovered
            ? 'border border-primary/60 shadow-card-hover'
            : 'border border-outline-variant shadow-card'
        } bg-neutral-900`}
      >
        {/* Container con aspect ratio y profundidad */}
        <div className="relative aspect-[4/5] overflow-hidden">
          
          {/* Placeholder de carga elegante */}
          <AnimatePresence>
            {!imageLoaded && (
              <motion.div
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 bg-neutral-200 animate-pulse"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Imagen principal con efectos cinematográficos */}
          <motion.div
            className="absolute inset-0"
            animate={{ 
              scale: isHovered ? 1.12 : 1,
            }}
            transition={{ duration: 1.2, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <img
              src={imagen}
              alt={nombre}
              onError={handleImageError}
              onLoad={() => setImageLoaded(true)}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </motion.div>

          {/* Múltiples capas de overlay para profundidad */}
          <motion.div 
            className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"
            animate={{
              opacity: isHovered ? 1 : 0.8
            }}
            transition={{ duration: 0.6 }}
          />
          
          {/* Overlay de color temático sutil */}
          <motion.div 
            className="absolute inset-0 mix-blend-multiply"
            style={{ backgroundColor: colorDestacado }}
            animate={{
              opacity: isHovered ? 0.3 : 0.15
            }}
            transition={{ duration: 0.6 }}
          />

          {/* Efecto de viñeta */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]" />

          {/* Marco animado con doble borde */}
          <motion.div
            className="absolute border border-white/30"
            animate={{
              inset: isHovered ? 16 : 24,
              borderColor: isHovered ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.2)',
              borderWidth: isHovered ? 1 : 1
            }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
          
          {/* Marco interior decorativo */}
          <motion.div
            className="absolute border border-white/10"
            animate={{
              inset: isHovered ? 20 : 28,
              opacity: isHovered ? 1 : 0
            }}
            transition={{ duration: 0.5, delay: 0.1 }}
          />

          {/* Líneas decorativas esquinas */}
          <motion.div 
            className="absolute top-6 left-6 w-8 h-8 border-t-2 border-l-2 border-white/40"
            animate={{ 
              opacity: isHovered ? 1 : 0,
              scale: isHovered ? 1 : 0.5 
            }}
            transition={{ duration: 0.4 }}
          />
          <motion.div 
            className="absolute bottom-6 right-6 w-8 h-8 border-b-2 border-r-2 border-white/40"
            animate={{ 
              opacity: isHovered ? 1 : 0,
              scale: isHovered ? 1 : 0.5 
            }}
            transition={{ duration: 0.4 }}
          />

          {/* Contenido principal */}
          <div className="absolute inset-0 flex flex-col items-center justify-end pb-6 px-4 text-center">
            
            {/* Indicador de categoría superior */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ 
                opacity: isHovered ? 1 : 0,
                y: isHovered ? 0 : -20
              }}
              transition={{ duration: 0.4 }}
              className="absolute top-8 left-1/2 -translate-x-1/2"
            >
              <span className="text-[10px] uppercase tracking-[0.3em] text-white/60 font-light">
                Categoría
              </span>
            </motion.div>

            {/* Línea decorativa superior animada */}
            <motion.div
              className="h-px bg-gradient-to-r from-transparent via-white/80 to-transparent mb-6"
              animate={{ 
                width: isHovered ? 100 : 40,
                opacity: isHovered ? 1 : 0.5
              }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />

            {/* Nombre de categoría con efecto de revelado */}
            <div className="overflow-hidden mb-2">
              <motion.h3 
                animate={{ 
                  y: isHovered ? 0 : 10,
                  opacity: isHovered ? 1 : 0.9
                }}
                transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
                className="text-white font-light text-lg md:text-xl lg:text-2xl tracking-[0.2em] uppercase leading-tight"
              >
                {nombre}
              </motion.h3>
            </div>

            {/* Descripción opcional */}
            <AnimatePresence>
              {descripcion && isHovered && (
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                  className="text-white/60 text-xs md:text-sm font-light tracking-wide max-w-[80%] mb-4 line-clamp-2"
                >
                  {descripcion}
                </motion.p>
              )}
            </AnimatePresence>

            {/* Contador de productos con badge */}
            <motion.div
              animate={{ 
                opacity: isHovered ? 1 : 0.7,
                y: isHovered ? 0 : 5,
                scale: isHovered ? 1.05 : 1
              }}
              transition={{ duration: 0.4, delay: 0.05 }}
              className="flex items-center gap-2"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-white/80" />
              <span className="text-white/80 font-light text-xs md:text-sm tracking-[0.15em] uppercase">
                {formatCount(cantidadProductos)}
              </span>
            </motion.div>

            {/* Línea inferior con animación de pulso */}
            <motion.div
              className="mt-6 h-px bg-gradient-to-r from-transparent via-white to-transparent"
              animate={{ 
                width: isHovered ? 120 : 50,
                opacity: isHovered ? [0.4, 1, 0.4] : 0.3
              }}
              transition={{ 
                width: { duration: 0.6 },
                opacity: { duration: 2, repeat: isHovered ? Infinity : 0 }
              }}
            />

            {/* Botón CTA premium */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ 
                opacity: isHovered ? 1 : 0, 
                y: isHovered ? 0 : 20 
              }}
              transition={{ duration: 0.4, delay: 0.15, ease: 'easeOut' }}
              className="mt-4"
            >
              <span className="group/btn relative inline-flex items-center gap-2 px-4 py-2 text-[10px] uppercase tracking-[0.2em] text-white border border-white/50 overflow-hidden transition-all duration-300 hover:border-white">
                {/* Fondo animado del botón */}
                <motion.span 
                  className="absolute inset-0 bg-white"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: 0 }}
                  transition={{ duration: 0.3 }}
                />
                <span className="relative z-10 group-hover/btn:text-neutral-900 transition-colors duration-300">
                  Explorar
                </span>
                <svg 
                  className="relative z-10 w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-1 group-hover/btn:text-neutral-900" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </span>
            </motion.div>
          </div>

          {/* Icono de flecha flotante */}
          <motion.div
            className="absolute top-6 right-6"
            animate={{
              opacity: isHovered ? 1 : 0,
              x: isHovered ? 0 : -15,
              rotate: isHovered ? 0 : -45
            }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            <div className="p-2 border border-white/30 rounded-full backdrop-blur-sm bg-white/10">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 17L17 7M17 7H7M17 7v10" />
              </svg>
            </div>
          </motion.div>

          {/* Efecto de brillo cinemático (sheen) */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            animate={{
              background: isHovered 
                ? 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.1) 45%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 55%, transparent 60%)'
                : 'linear-gradient(105deg, transparent 0%, transparent 100%)'
            }}
            style={{
              backgroundSize: '200% 100%',
            }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              animate={{
                backgroundPosition: isHovered ? ['200% 0%', '-200% 0%'] : '200% 0%'
              }}
              transition={{ duration: 1.5, ease: 'easeInOut' }}
              className="absolute inset-0"
              style={{
                background: 'inherit',
                backgroundSize: 'inherit'
              }}
            />
          </motion.div>

          {/* Número de categoría grande (watermark) */}
          <motion.div
            className="absolute -bottom-2 -right-2 text-[60px] md:text-[80px] font-bold text-white/5 select-none pointer-events-none leading-none"
            animate={{
              opacity: isHovered ? 0.1 : 0.05,
              scale: isHovered ? 1.1 : 1,
              rotate: isHovered ? -5 : 0
            }}
            transition={{ duration: 0.6 }}
          >
            {String(id).padStart(2, '0')}
          </motion.div>
        </div>

        {/* Sombra exterior dinámica */}
        <motion.div
          className="absolute -inset-2 rounded-lg -z-10"
          animate={{
            boxShadow: isHovered 
              ? '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255,255,255,0.1)' 
              : '0 10px 30px -10px rgba(0, 0, 0, 0.3)'
          }}
          transition={{ duration: 0.4 }}
        />
      </Link>
    </motion.article>
  );
};

TarjetaCategoria.propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  nombre: PropTypes.string.isRequired,
  imagen: PropTypes.string.isRequired,
  cantidadProductos: PropTypes.number,
  descripcion: PropTypes.string,
  colorDestacado: PropTypes.string
};

export default TarjetaCategoria;
