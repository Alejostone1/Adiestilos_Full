import { motion } from 'framer-motion';
import PropTypes from 'prop-types';
import TarjetaCategoria from './TarjetaCategoria';

const SeccionCategorias = ({
  categorias = [],
  titulo
}) => {
  if (!categorias.length) return null;

  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header de sección */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <div className="w-12 h-px bg-neutral-300 mx-auto mb-6" />
          <h2 className="text-xl md:text-2xl font-light text-neutral-900 tracking-[0.2em] uppercase">
            {titulo}
          </h2>
        </motion.div>

        {/* Grid de categorías */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {categorias.map((categoria, index) => (
            <motion.div
              key={categoria.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <TarjetaCategoria {...categoria} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

SeccionCategorias.propTypes = {
  categorias: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      nombre: PropTypes.string.isRequired,
      imagen: PropTypes.string.isRequired,
      cantidadProductos: PropTypes.number
    })
  ).isRequired,
  titulo: PropTypes.string.isRequired
};

export default SeccionCategorias;
