import { useState, useEffect } from 'react';
import { X, Save, Upload, AlertCircle, RefreshCw, Package, Tag, DollarSign, Layers, Image as ImageIcon } from 'lucide-react';
import ColorSelector from './ColorSelector';
import SizeSelector from './SizeSelector';

const VariantFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  colores = [],
  tallas = [],
  producto = {},
  isSubmitting = false
}) => {
  if (!isOpen) return null;

  // Estado del formulario
  const [formData, setFormData] = useState({
    codigoSku: '',
    idColor: null,
    idTalla: null,
    precioCosto: 0,
    precioVenta: 0,
    cantidadStock: 0,
    stockMinimo: 5,
    stockMaximo: 100,
    estado: 'activo'
  });

  // Estados para manejo de imágenes
  const [imagenesParaSubir, setImagenesParaSubir] = useState([]);
  const [error, setError] = useState(null);

  // Inicializar formulario cuando se abre o cambian los datos
  useEffect(() => {
    if (initialData) {
      setFormData({
        codigoSku: initialData.codigoSku || '',
        idColor: initialData.idColor || null,
        idTalla: initialData.idTalla || null,
        precioCosto: initialData.precioCosto || 0,
        precioVenta: initialData.precioVenta || 0,
        cantidadStock: initialData.cantidadStock || 0,
        stockMinimo: initialData.stockMinimo || 5,
        stockMaximo: initialData.stockMaximo || 100,
        estado: initialData.estado || 'activo'
      });
    } else {
      // Valores por defecto para nueva variante
      setFormData({
        codigoSku: '',
        idColor: null,
        idTalla: null,
        precioCosto: producto?.precioVentaSugerido || 0, // Usar precio sugerido como base
        precioVenta: producto?.precioVentaSugerido || 0,
        cantidadStock: 0,
        stockMinimo: 5,
        stockMaximo: 100,
        estado: 'activo'
      });
    }
    setImagenesParaSubir([]);
    setError(null);
  }, [initialData, producto, isOpen]);

  // Generación automática de SKU si es nuevo
  useEffect(() => {
    if (!initialData && formData.idColor && formData.idTalla && producto?.codigoReferencia) {
        const color = colores.find(c => c.idColor === formData.idColor);
        const talla = tallas.find(t => t.idTalla === formData.idTalla);
        
        if (color && talla) {
            // Formato sugerido: PROD-COL-TAL
            const suggestedSku = `${producto.codigoReferencia}-${color.nombreColor.substring(0,3).toUpperCase()}-${talla.nombreTalla.toUpperCase()}`;
            // Solo actualizar si el usuario no ha escrito algo manualmente muy diferente (opcional, aquí lo forzamos suavemente)
             if (!formData.codigoSku || formData.codigoSku.startsWith(producto.codigoReferencia)) {
                setFormData(prev => ({ ...prev, codigoSku: suggestedSku }));
             }
        }
    }
  }, [formData.idColor, formData.idTalla, producto, colores, tallas, initialData]);


  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value
    }));
  };

  const handleColorChange = (colorId) => {
    setFormData(prev => ({ ...prev, idColor: colorId }));
  };

  const handleSizeChange = (tallaId) => {
    setFormData(prev => ({ ...prev, idTalla: tallaId }));
  };

  const handleImagenesUpload = (e) => {
    if (e.target.files) {
      setImagenesParaSubir(prev => [...prev, ...Array.from(e.target.files)]);
    }
  };

  const removeImagenParaSubir = (index) => {
    setImagenesParaSubir(prev => prev.filter((_, i) => i !== index));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validaciones básicas
    if (!formData.codigoSku) return setError('El código SKU es obligatorio');
    if (producto.tieneColores && !formData.idColor) return setError('Debes seleccionar un color');
    if (producto.tieneTallas && !formData.idTalla) return setError('Debes seleccionar una talla');

    try {
      await onSubmit(formData, imagenesParaSubir);
    } catch (err) {
        console.error("Error en submit modal:", err);
      setError(err.message || 'Error al guardar la variante');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop con blur */}
      <div 
        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Package className="w-5 h-5 text-purple-600" />
              {initialData ? 'Editar Variante' : 'Nueva Variante'}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {producto?.nombreProducto}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500 dark:text-gray-400 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/50 rounded-xl flex items-start gap-3 text-red-600 dark:text-red-400">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          <form id="variant-form" onSubmit={handleSubmit} className="space-y-8">
            
            {/* Sección: Atributos (Visual) */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-slate-800">
                <Tag className="w-4 h-4 text-purple-600" />
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider">Atributos</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {producto.tieneColores && (
                  <ColorSelector 
                    colors={colores} 
                    selectedColorId={formData.idColor} 
                    onChange={handleColorChange} 
                  />
                )}
                
                {producto.tieneTallas && (
                  <SizeSelector 
                    sizes={tallas} 
                    selectedSizeId={formData.idTalla} 
                    onChange={handleSizeChange} 
                  />
                )}

                 {/* Fallback si no tiene atributos activados en producto padre (aunque raro para variantes) */}
                 {!producto.tieneColores && !producto.tieneTallas && (
                     <div className="col-span-2 p-4 bg-gray-50 dark:bg-slate-800/50 rounded-lg text-sm text-gray-500 dark:text-gray-400 text-center">
                         Este producto base no tiene configurados colores ni tallas.
                     </div>
                 )}
              </div>
            </div>

            {/* Sección: Información General */}
            <div className="space-y-6">
               <div className="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-slate-800">
                <Layers className="w-4 h-4 text-purple-600" />
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider">Detalles Generales</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">SKU <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <input
                        type="text"
                        name="codigoSku"
                        value={formData.codigoSku}
                        onChange={handleChange}
                        className="w-full pl-4 pr-10 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all font-mono text-sm"
                        placeholder="ej. PROD-ROJ-L"
                    />
                    <div className="absolute right-3 top-2.5 text-gray-400 pointer-events-none">
                        <Tag className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Identificador único para inventario.</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Estado</label>
                  <select
                    name="estado"
                    value={formData.estado}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all"
                  >
                    <option value="activo">Activo</option>
                    <option value="inactivo">Inactivo</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Sección: Precios e Inventario */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-slate-800">
                <DollarSign className="w-4 h-4 text-purple-600" />
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider">Precio e Inventario</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                 {/* Precios */}
                 <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Costo</label>
                    <div className="relative">
                        <span className="absolute left-3 top-2.5 text-gray-400">$</span>
                        <input
                            type="number"
                            name="precioCosto"
                            value={formData.precioCosto}
                            onChange={handleChange}
                            min="0"
                            step="0.01"
                            className="w-full pl-7 pr-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all"
                        />
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Precio Venta <span className="text-red-500">*</span></label>
                    <div className="relative">
                         <span className="absolute left-3 top-2.5 text-gray-400">$</span>
                        <input
                            type="number"
                            name="precioVenta"
                            value={formData.precioVenta}
                            onChange={handleChange}
                            min="0"
                             step="0.01"
                            className="w-full pl-7 pr-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all font-semibold"
                        />
                    </div>
                 </div>

                 {/* Stock */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Stock Inicial</label>
                     <input
                        type="number"
                        name="cantidadStock"
                        value={formData.cantidadStock}
                        onChange={handleChange}
                        min="0"
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all"
                    />
                 </div>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Stock Mínimo</label>
                     <input
                        type="number"
                        name="stockMinimo"
                        value={formData.stockMinimo}
                        onChange={handleChange}
                        min="0"
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all"
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Stock Máximo</label>
                     <input
                        type="number"
                        name="stockMaximo"
                        value={formData.stockMaximo}
                        onChange={handleChange}
                        min="0"
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all"
                    />
                 </div>
              </div>
            </div>

            {/* Sección: Imágenes */}
             <div className="space-y-6">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-slate-800">
                <ImageIcon className="w-4 h-4 text-purple-600" />
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider">Imágenes</h3>
              </div>
              
              <div className="border-2 border-dashed border-gray-300 dark:border-slate-700 rounded-xl p-8 bg-gray-50 dark:bg-slate-800/30 hover:bg-gray-100 dark:hover:bg-slate-800/50 transition-colors text-center group">
                 <input
                    type="file"
                    id="variant-images"
                    multiple
                    accept="image/*"
                    onChange={handleImagenesUpload}
                    className="hidden"
                 />
                 <label htmlFor="variant-images" className="cursor-pointer flex flex-col items-center gap-3">
                    <div className="p-3 bg-white dark:bg-slate-700 rounded-full shadow-sm group-hover:scale-110 transition-transform">
                        <Upload className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                        <span className="text-purple-600 font-medium hover:underline">Sube imágenes</span>
                        <span className="text-gray-500 dark:text-gray-400"> o arrástralas aquí</span>
                    </div>
                    <p className="text-xs text-gray-400 dark:text-gray-500">PNG, JPG, GIF hasta 5MB</p>
                 </label>
              </div>

               {/* Preview de imágenes nuevas */}
               {imagenesParaSubir.length > 0 && (
                <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-4 animate-fade-in">
                  {imagenesParaSubir.map((file, idx) => (
                    <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 dark:border-slate-700 shadow-sm group">
                      <img 
                        src={URL.createObjectURL(file)} 
                        alt="preview" 
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImagenParaSubir(idx)}
                        className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity transform hover:scale-110"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </form>
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 border-t border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-900/50 flex justify-end gap-3 sticky bottom-0 z-10">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="variant-form"
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-medium shadow-lg shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all active:scale-95"
          >
            {isSubmitting ? (
                <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Guardando...
                </>
            ) : (
                <>
                    <Save className="w-4 h-4" />
                    Guardar Variante
                </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VariantFormModal;
