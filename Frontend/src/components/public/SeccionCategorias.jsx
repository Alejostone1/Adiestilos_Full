import { motion } from 'framer-motion';
import PropTypes from 'prop-types';
import TarjetaCategoria from './TarjetaCategoria';

const SeccionCategorias = ({
  categorias = [],
  titulo
}) => {
  if (!categorias.length) return null;

  return (
    <section className="py-16 md:py-20 bg-surface-bright">
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <h2 className="font-headline-md text-headline-md text-primary text-center">
            {titulo}
          </h2>
        </motion.div>

        {/* Mobile: horizontal scroll */}
        <div className="flex overflow-x-auto hide-scrollbar md:grid md:grid-cols-3 gap-4 md:gap-6 pb-4 md:pb-0">
          {categorias.map((categoria, index) => (
            <motion.div
              key={categoria.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex-none w-64 md:w-auto"
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
