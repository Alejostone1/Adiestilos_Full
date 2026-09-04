import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

/**
 * Lista de categorías con soporte para subcategorías (acordeón).
 * Seleccionar una categoría padre filtra también sus hijas (lo resuelve el backend).
 */
const FiltroCategoriasJerarquico = ({ categorias, categoriaActivaId, onSelect }) => {
  const [expandidas, setExpandidas] = useState(() => new Set());

  useEffect(() => {
    if (!categoriaActivaId) return;
    const padre = categorias.find(
      (cat) =>
        cat.idCategoria === categoriaActivaId ||
        cat.subcategorias?.some((sub) => sub.idCategoria === categoriaActivaId)
    );
    if (padre) {
      setExpandidas((prev) => new Set(prev).add(padre.idCategoria));
    }
  }, [categoriaActivaId, categorias]);

  const toggleExpandida = (idCategoria) => {
    setExpandidas((prev) => {
      const next = new Set(prev);
      if (next.has(idCategoria)) next.delete(idCategoria);
      else next.add(idCategoria);
      return next;
    });
  };

  return (
    <ul className="space-y-1 font-body-md text-body-md text-text-main">
      <li>
        <button
          onClick={() => onSelect(null)}
          className={`w-full text-left py-1.5 transition-colors ${
            !categoriaActivaId ? 'text-primary font-semibold' : 'hover:text-primary'
          }`}
        >
          Todas
        </button>
      </li>
      {categorias.map((cat) => {
        const esActivaPadre = categoriaActivaId === cat.idCategoria;
        const tieneSubcategorias = cat.subcategorias?.length > 0;
        const expandida = expandidas.has(cat.idCategoria);

        return (
          <li key={cat.idCategoria}>
            <div className="flex items-center gap-1">
              <button
                onClick={() => onSelect(cat.idCategoria)}
                className={`flex-1 text-left py-1.5 transition-colors ${
                  esActivaPadre ? 'text-primary font-semibold' : 'hover:text-primary'
                }`}
              >
                {cat.nombreCategoria}
                {typeof cat.cantidadProductos === 'number' && (
                  <span className="ml-1.5 text-outline text-[12px]">({cat.cantidadProductos})</span>
                )}
              </button>
              {tieneSubcategorias && (
                <button
                  onClick={() => toggleExpandida(cat.idCategoria)}
                  aria-label={expandida ? 'Contraer subcategorías' : 'Expandir subcategorías'}
                  className="shrink-0 p-1 text-outline hover:text-primary"
                >
                  <span
                    className="material-symbols-outlined text-[18px] block transition-transform duration-200"
                    style={{ transform: expandida ? 'rotate(180deg)' : 'rotate(0deg)' }}
                  >
                    expand_more
                  </span>
                </button>
              )}
            </div>

            {tieneSubcategorias && expandida && (
              <ul className="ml-2 pl-3 border-l border-outline-variant/40 space-y-0.5 mb-1">
                {cat.subcategorias.map((sub) => {
                  const esActivaSub = categoriaActivaId === sub.idCategoria;
                  return (
                    <li key={sub.idCategoria}>
                      <button
                        onClick={() => onSelect(sub.idCategoria)}
                        className={`w-full text-left py-1 text-[13.5px] transition-colors ${
                          esActivaSub ? 'text-primary font-semibold' : 'text-text-main/75 hover:text-primary'
                        }`}
                      >
                        {sub.nombreCategoria}
                        {typeof sub.cantidadProductos === 'number' && (
                          <span className="ml-1.5 text-outline text-[11px]">({sub.cantidadProductos})</span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </li>
        );
      })}
    </ul>
  );
};

FiltroCategoriasJerarquico.propTypes = {
  categorias: PropTypes.arrayOf(
    PropTypes.shape({
      idCategoria: PropTypes.number.isRequired,
      nombreCategoria: PropTypes.string.isRequired,
      cantidadProductos: PropTypes.number,
      subcategorias: PropTypes.array,
    })
  ).isRequired,
  categoriaActivaId: PropTypes.number,
  onSelect: PropTypes.func.isRequired,
};

export default FiltroCategoriasJerarquico;
