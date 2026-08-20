import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

const TarjetaProducto = ({
  id,
  nombre,
  precio,
  imagenPrincipal,
  imagenes = [],
  coloresDisponibles = [],
  esNuevo = false,
  descuento = null,
  slug
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const formatearPrecio = (valor) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(valor);
  };

  const handleImageError = (e) => {
    e.target.src = 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=400&h=600&fit=crop';
  };

  const linkDestino = slug ? `/producto/${slug}` : `/producto/${id}`;

  const imagenPrimaria = imagenPrincipal;
  const imagenSecundaria = imagenes.length > 0 
    ? (imagenes.find(img => !img.esPrincipal)?.rutaImagen || imagenes[0]?.rutaImagen)
    : null;

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
      className="group relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Sombra difusa exterior */}
      <div className="absolute -inset-1 bg-gradient-to-r from-neutral-200 via-neutral-100 to-neutral-200 rounded-lg blur opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <Link to={linkDestino} className="block relative">
        {/* Contenedor principal con borde contrastante */}
        <div className="relative overflow-hidden bg-white border border-neutral-200 group-hover:border-neutral-800 transition-colors duration-300 aspect-[3/4] mb-4 shadow-sm group-hover:shadow-xl transition-shadow duration-500">
          
          {/* Badge NUEVO - Estilo premium */}
          {esNuevo && (
            <motion.div 
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 100 }}
              className="absolute top-4 left-4 z-20"
            >
              <span className="block px-3 py-1.5 bg-neutral-900 text-white text-[10px] font-semibold uppercase tracking-[0.2em] shadow-lg">
                Nuevo
              </span>
              {/* Decoración de borde */}
              <div className="absolute inset-0 border border-white/20 translate-x-0.5 translate-y-0.5" />
            </motion.div>
          )}

          {/* Badge DESCUENTO */}
          {descuento && (
            <motion.div 
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 100 }}
              className="absolute top-4 right-4 z-20"
            >
              <span className="block px-3 py-1.5 bg-red-600 text-white text-[10px] font-bold uppercase tracking-wider shadow-lg">
                -{descuento}%
              </span>
            </motion.div>
          )}

          {/* Contenedor de imágenes con efecto de profundidad */}
          <div className="relative w-full h-full overflow-hidden bg-neutral-50">
            {/* Imagen primaria */}
            <img
              src={imagenPrimaria}
              alt={nombre}
              onError={handleImageError}
              className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-[cubic-bezier(0.25,0.1,0.25,1)] ${
                isHovered && imagenSecundaria ? 'opacity-0 scale-110' : 'opacity-100 scale-100'
              }`}
              loading="lazy"
            />
            
            {/* Imagen secundaria con zoom sutil */}
            {imagenSecundaria && (
              <img
                src={imagenSecundaria}
                alt={`${nombre} - vista alternativa`}
                onError={handleImageError}
                className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-[cubic-bezier(0.25,0.1,0.25,1)] ${
                  isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
                }`}
                loading="lazy"
              />
            )}

            {/* Overlay con gradiente sutil */}
            <div className={`absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent transition-opacity duration-500 ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`} />
          </div>
          
          {/* Línea decorativa inferior que aparece en hover */}
          <motion.div 
            className="absolute bottom-0 left-0 right-0 h-1 bg-neutral-900"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: isHovered ? 1 : 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            style={{ originX: 0 }}
          />
          
          {/* Botón flotante "Ver detalles" - Estilo premium */}
          <motion.div 
            initial={{ y: '100%', opacity: 0 }}
            animate={{ 
              y: isHovered ? 0 : '100%', 
              opacity: isHovered ? 1 : 0 
            }}
            transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
            className="absolute bottom-6 left-4 right-4 z-10"
          >
            <span className="flex items-center justify-center gap-2 w-full py-3.5 bg-white/95 backdrop-blur-md text-center text-[11px] font-medium uppercase tracking-[0.15em] text-neutral-900 border border-neutral-200 shadow-lg hover:bg-neutral-900 hover:text-white hover:border-neutral-900 transition-all duration-300 group/btn">
              <span>Ver detalles</span>
              <svg 
                className="w-3 h-3 transition-transform duration-300 group-hover/btn:translate-x-1" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </span>
          </motion.div>

          {/* Indicadores de imagen con estilo minimalista */}
          {imagenes.length > 1 && (
            <div className={`absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 transition-all duration-300 ${
              isHovered ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'
            }`}>
              {imagenes.slice(0, 4).map((_, idx) => (
                <span 
                  key={idx}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    idx === 0 
                      ? 'bg-neutral-800 w-4' 
                      : 'bg-neutral-400 hover:bg-neutral-600'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Información del producto - Layout mejorado */}
        <div className="space-y-3 px-1">
          {/* Nombre con efecto de underline en hover */}
          <h3 className="text-sm text-neutral-800 font-medium tracking-wide line-clamp-2 leading-relaxed group-hover:text-neutral-600 transition-colors duration-300 relative inline">
            {nombre}
            <span className="absolute bottom-0 left-0 w-0 h-px bg-neutral-800 group-hover:w-full transition-all duration-300" />
          </h3>
          
          {/* Precio con estilo destacado */}
          <div className="flex items-baseline gap-2">
            <p className="text-base text-neutral-900 font-semibold tracking-tight">
              {formatearPrecio(precio)}
            </p>
            {descuento && (
              <p className="text-sm text-neutral-400 line-through font-medium">
                {formatearPrecio(precio * (1 + descuento/100))}
              </p>
            )}
          </div>

          {/* Colores disponibles - Diseño mejorado */}
          {coloresDisponibles.length > 0 && (
            <div className="flex items-center gap-2 pt-2 border-t border-neutral-100">
              <span className="text-[10px] text-neutral-400 uppercase tracking-wider font-medium">
                Colores:
              </span>
              <div className="flex items-center gap-1.5">
                {coloresDisponibles.slice(0, 4).map((color, idx) => (
                  <motion.span
                    key={color.idColor}
                    title={color.nombreColor}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    whileHover={{ scale: 1.3, y: -2 }}
                    className="w-4 h-4 rounded-full border-2 border-white shadow-md cursor-pointer ring-1 ring-neutral-200 hover:ring-neutral-400 transition-all duration-200"
                    style={{ backgroundColor: color.codigoHex || '#ccc' }}
                  />
                ))}
                {coloresDisponibles.length > 4 && (
                  <motion.span 
                    className="text-[10px] text-neutral-500 font-medium ml-1 bg-neutral-100 px-1.5 py-0.5 rounded"
                    whileHover={{ scale: 1.05 }}
                  >
                    +{coloresDisponibles.length - 4}
                  </motion.span>
                )}
              </div>
            </div>
          )}
        </div>
      </Link>
    </motion.article>
  );
};

TarjetaProducto.propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  nombre: PropTypes.string.isRequired,
  precio: PropTypes.number.isRequired,
  imagenPrincipal: PropTypes.string.isRequired,
  imagenes: PropTypes.arrayOf(
    PropTypes.shape({
      idImagen: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      rutaImagen: PropTypes.string,
      esPrincipal: PropTypes.bool
    })
  ),
  coloresDisponibles: PropTypes.arrayOf(
    PropTypes.shape({
      idColor: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      nombreColor: PropTypes.string,
      codigoHex: PropTypes.string
    })
  ),
  esNuevo: PropTypes.bool,
  descuento: PropTypes.number,
  slug: PropTypes.string
};

export default TarjetaProducto;