import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const FiltroPrecio = ({ precioMin, precioMax, onAplicar }) => {
  const [min, setMin] = useState(precioMin || '');
  const [max, setMax] = useState(precioMax || '');

  useEffect(() => {
    setMin(precioMin || '');
    setMax(precioMax || '');
  }, [precioMin, precioMax]);

  const aplicar = (e) => {
    e.preventDefault();
    onAplicar({ precioMin: min || null, precioMax: max || null });
  };

  return (
    <form onSubmit={aplicar} className="space-y-3">
      <div className="flex items-center gap-2">
        <input
          type="number"
          min="0"
          inputMode="numeric"
          placeholder="Mín"
          value={min}
          onChange={(e) => setMin(e.target.value)}
          className="w-full bg-surface-container-low border border-outline-variant rounded-lg py-2 px-3 text-body-sm font-body-sm text-text-main focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
        />
        <span className="text-outline shrink-0">–</span>
        <input
          type="number"
          min="0"
          inputMode="numeric"
          placeholder="Máx"
          value={max}
          onChange={(e) => setMax(e.target.value)}
          className="w-full bg-surface-container-low border border-outline-variant rounded-lg py-2 px-3 text-body-sm font-body-sm text-text-main focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
        />
      </div>
      <button
        type="submit"
        className="w-full py-2 border border-primary text-primary font-label-caps text-label-caps rounded-lg hover:bg-primary hover:text-on-primary transition-colors"
      >
        Aplicar precio
      </button>
    </form>
  );
};

FiltroPrecio.propTypes = {
  precioMin: PropTypes.string,
  precioMax: PropTypes.string,
  onAplicar: PropTypes.func.isRequired,
};

export default FiltroPrecio;
