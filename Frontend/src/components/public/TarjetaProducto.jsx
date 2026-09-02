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
      className="group relative flex flex-col bg-pure-white rounded-lg overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link to={linkDestino} className="block relative">
        {/* Image container */}
        <div className="relative aspect-[3/4] bg-surface-container-low overflow-hidden rounded-lg">
          {/* Primary image */}
          <img
            src={imagenPrimaria}
            alt={nombre}
            onError={handleImageError}
            className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-[cubic-bezier(0.25,0.1,0.25,1)] ${
              isHovered && imagenSecundaria ? 'opacity-0 scale-105' : 'opacity-100 scale-100'
            }`}
            loading="lazy"
          />

          {/* Secondary image */}
          {imagenSecundaria && (
            <img
              src={imagenSecundaria}
              alt={`${nombre} - vista alternativa`}
              onError={handleImageError}
              className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-[cubic-bezier(0.25,0.1,0.25,1)] ${
                isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
              }`}
              loading="lazy"
            />
          )}

          {/* Badge NEW */}
          {esNuevo && (
            <div className="absolute top-2 left-2 z-20">
              <span className="bg-tertiary-container text-on-tertiary-container font-label-caps text-label-caps px-2 py-1 rounded-full">
                Nuevo
              </span>
            </div>
          )}

          {/* Badge SALE */}
          {descuento && (
            <div className="absolute top-2 left-2 z-20">
              <span className="bg-tertiary text-on-tertiary font-label-caps text-label-caps px-2 py-1 rounded-full">
                -{descuento}%
              </span>
            </div>
          )}

          {/* Favorite button */}
          <button
            className="absolute top-2 right-2 text-text-main hover:text-primary transition-colors bg-pure-white/80 p-1.5 rounded-full backdrop-blur-sm z-10"
            onClick={(e) => { e.preventDefault(); }}
            aria-label="Agregar a favoritos"
          >
            <span className="material-symbols-outlined text-[20px]">favorite_border</span>
          </button>

          {/* Hover Add to Cart */}
          <div className={`absolute bottom-0 left-0 w-full p-4 transition-transform duration-300 ${
            isHovered ? 'translate-y-0' : 'translate-y-full'
          }`}>
            <span className="w-full flex items-center justify-center gap-2 bg-primary text-on-primary font-body-sm text-body-sm font-medium py-3 rounded-lg">
              <span className="material-symbols-outlined text-[18px]">shopping_bag</span>
              Agregar al carrito
            </span>
          </div>
        </div>

        {/* Product info */}
        <div className="p-4 flex flex-col items-center text-center">
          <h4 className="font-body-md text-body-md text-text-main mb-1 line-clamp-2">
            {nombre}
          </h4>
          <div className="flex items-baseline gap-2">
            <p className="font-headline-sm text-[18px] text-primary font-semibold">
              {formatearPrecio(precio)}
            </p>
            {descuento && (
              <p className="text-sm text-outline line-through font-medium">
                {formatearPrecio(precio * (1 + descuento / 100))}
              </p>
            )}
          </div>

          {/* Color swatches */}
          {coloresDisponibles.length > 0 && (
            <div className="flex items-center justify-center gap-1.5 mt-2">
              {coloresDisponibles.slice(0, 5).map((color) => (
                <span
                  key={color.idColor}
                  title={color.nombreColor}
                  className="w-3 h-3 rounded-full border border-outline-variant/30 shadow-sm cursor-pointer"
                  style={{ backgroundColor: color.codigoHex || '#ccc' }}
                />
              ))}
              {coloresDisponibles.length > 5 && (
                <span className="text-[10px] text-outline ml-1">
                  +{coloresDisponibles.length - 5}
                </span>
              )}
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
