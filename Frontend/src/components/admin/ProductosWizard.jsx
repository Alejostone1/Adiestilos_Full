import React, { useState, useEffect } from 'react';
import {
  ChevronRight,
  ChevronLeft,
  Check,
  Package,
  Tag,
  DollarSign,
  Image as ImageIcon,
  X,
  AlertCircle,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import WizardStep1 from './wizard-steps/WizardStep1';
import WizardStep2 from './wizard-steps/WizardStep2';
import WizardStep3 from './wizard-steps/WizardStep3';
import WizardStep4 from './wizard-steps/WizardStep4';
import WizardStep5 from './wizard-steps/WizardStep5';
import { productosApi } from '../../api/productosApi';

const ProductosWizard = ({ isOpen, onClose, producto = null, onSuccess }) => {
  const [pasoActual, setPasoActual] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    nombreProducto: '',
    codigoReferencia: '',
    descripcion: '',
    idCategoria: '',
    idProveedor: '',
    unidadMedida: 'unidades',
    precioCompra: '',
    precioVenta: '',
    porcentajeGanancia: '',
    tieneColores: false,
    tieneTallas: false,
    imagenPrincipal: null,
    imagenes: [],
    variantes: []
  });

  const pasos = [
    {
      id: 1,
      titulo: 'Información Básica',
      descripcion: 'Nombre, código y categoría del producto',
      icono: Package
    },
    {
      id: 2,
      titulo: 'Detalles y Proveedor',
      descripcion: 'Descripción, proveedor y unidad de medida',
      icono: Tag
    },
    {
      id: 3,
      titulo: 'Precios',
      descripcion: 'Precio de compra, venta y margen',
      icono: DollarSign
    },
    {
      id: 4,
      titulo: 'Imágenes',
      descripcion: 'Sube foto principal e imágenes adicionales',
      icono: ImageIcon
    },
    {
      id: 5,
      titulo: 'Resumen',
      descripcion: 'Revisa y confirma los datos',
      icono: Check
    }
  ];

  // Cargar producto si está editando
  useEffect(() => {
    if (producto && isOpen) {
      setFormData({
        nombreProducto: producto.nombreProducto || '',
        codigoReferencia: producto.codigoReferencia || '',
        descripcion: producto.descripcion || '',
        idCategoria: producto.idCategoria || '',
        idProveedor: producto.idProveedor || '',
        unidadMedida: producto.unidadMedida || 'unidades',
        precioCompra: producto.precioCompra || '',
        precioVenta: producto.precioVenta || '',
        porcentajeGanancia: producto.porcentajeGanancia || '',
        tieneColores: producto.tieneColores || false,
        tieneTallas: producto.tieneTallas || false,
        imagenPrincipal: producto.imagenPrincipal || null,
        imagenes: producto.imagenes || [],
        variantes: producto.variantes || []
      });
      setPasoActual(1);
    } else if (isOpen) {
      setFormData({
        nombreProducto: '',
        codigoReferencia: '',
        descripcion: '',
        idCategoria: '',
        idProveedor: '',
        unidadMedida: 'unidades',
        precioCompra: '',
        precioVenta: '',
        porcentajeGanancia: '',
        tieneColores: false,
        tieneTallas: false,
        imagenPrincipal: null,
        imagenes: [],
        variantes: []
      });
      setPasoActual(1);
    }
    setError(null);
  }, [isOpen, producto]);

  const handleUpdateFormData = (updates) => {
    setFormData(prev => ({
      ...prev,
      ...updates
    }));
  };

  const validateStep = (paso) => {
    switch (paso) {
      case 1:
        if (!formData.nombreProducto.trim()) {
          setError('El nombre del producto es requerido');
          return false;
        }
        if (!formData.codigoReferencia.trim()) {
          setError('El código de referencia es requerido');
          return false;
        }
        if (!formData.idCategoria) {
          setError('La categoría es requerida');
          return false;
        }
        break;

      case 2:
        if (!formData.descripcion.trim()) {
          setError('La descripción es requerida');
          return false;
        }
        break;

      case 3:
        if (!formData.precioCompra || parseFloat(formData.precioCompra) <= 0) {
          setError('El precio de compra es requerido y debe ser mayor a 0');
          return false;
        }
        if (!formData.precioVenta || parseFloat(formData.precioVenta) <= 0) {
          setError('El precio de venta es requerido y debe ser mayor a 0');
          return false;
        }
        break;

      case 4:
        if (!formData.imagenPrincipal) {
          setError('Debe subir al menos una imagen principal');
          return false;
        }
        break;

      default:
        break;
    }

    setError(null);
    return true;
  };

  const handleNext = () => {
    if (validateStep(pasoActual)) {
      setPasoActual(prev => Math.min(prev + 1, 5));
      setError(null);
    }
  };

  const handlePrev = () => {
    setPasoActual(prev => Math.max(prev - 1, 1));
    setError(null);
  };

  const handleSubmit = async () => {
    if (!validateStep(5)) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let imagenPrincipalRuta = null;

      // Si la imagen principal es un File object, subirlo primero
      if (formData.imagenPrincipal instanceof File) {
        const formDataImg = new FormData();
        formDataImg.append('imagen', formData.imagenPrincipal);
        
        const responseImg = await productosApi.uploadImagenProducto(formDataImg);
        imagenPrincipalRuta = responseImg.url || responseImg.data?.url || responseImg.ruta || responseImg.data?.ruta;
      } else if (typeof formData.imagenPrincipal === 'string') {
        imagenPrincipalRuta = formData.imagenPrincipal;
      }

      const dataToSubmit = {
        nombreProducto: formData.nombreProducto,
        codigoReferencia: formData.codigoReferencia,
        descripcion: formData.descripcion,
        idCategoria: parseInt(formData.idCategoria),
        idProveedor: formData.idProveedor ? parseInt(formData.idProveedor) : null,
        unidadMedida: formData.unidadMedida,
        precioVentaSugerido: parseInt(formData.precioVenta),
        tieneColores: !!formData.tieneColores,
        tieneTallas: !!formData.tieneTallas,
        imagenPrincipal: imagenPrincipalRuta,
        estado: 'activo'
      };

      if (producto) {
        await productosApi.updateProducto(producto.idProducto, dataToSubmit);
      } else {
        await productosApi.createProducto(dataToSubmit);
      }

      setPasoActual(1);
      setFormData({
        nombreProducto: '',
        codigoReferencia: '',
        descripcion: '',
        idCategoria: '',
        idProveedor: '',
        unidadMedida: 'unidades',
        precioCompra: '',
        precioVenta: '',
        porcentajeGanancia: '',
        tieneColores: false,
        tieneTallas: false,
        imagenPrincipal: null,
        imagenes: [],
        variantes: []
      });

      onClose();
      onSuccess?.();
    } catch (err) {
      setError(err.mensaje || err.message || 'Error al guardar el producto');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const renderStep = () => {
    switch (pasoActual) {
      case 1:
        return (
          <WizardStep1
            formData={formData}
            onUpdateFormData={handleUpdateFormData}
          />
        );
      case 2:
        return (
          <WizardStep2
            formData={formData}
            onUpdateFormData={handleUpdateFormData}
          />
        );
      case 3:
        return (
          <WizardStep3
            formData={formData}
            onUpdateFormData={handleUpdateFormData}
          />
        );
      case 4:
        return (
          <WizardStep4
            formData={formData}
            onUpdateFormData={handleUpdateFormData}
          />
        );
      case 5:
        return (
          <WizardStep5
            formData={formData}
            producto={producto}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-900 dark:to-blue-800 px-8 py-6 relative">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-white">
                  {producto ? 'Editar Producto' : 'Crear Nuevo Producto'}
                </h2>
                <p className="text-blue-100 text-sm mt-1">Paso {pasoActual} de 5</p>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Indicador de pasos */}
          <div className="px-8 py-6 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 md:gap-4">
              {pasos.map((paso, idx) => {
                const IconoStep = paso.icono;
                const esActivo = paso.id === pasoActual;
                const esCompletado = paso.id < pasoActual;

                return (
                  <div key={paso.id} className="flex items-center flex-1">
                    <div
                      className={`
                        flex items-center justify-center w-10 h-10 rounded-lg font-semibold text-sm
                        transition-all duration-300
                        ${esActivo
                          ? 'bg-blue-600 text-white ring-2 ring-blue-300 dark:ring-blue-400'
                          : esCompletado
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                        }
                      `}
                    >
                      {esCompletado ? (
                        <Check className="w-6 h-6" />
                      ) : (
                        <IconoStep className="w-5 h-5" />
                      )}
                    </div>

                    {/* Línea conectora */}
                    {idx < pasos.length - 1 && (
                      <div
                        className={`
                          flex-1 h-1 mx-2 rounded-full transition-all duration-300
                          ${esCompletado ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'}
                        `}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Información del paso actual */}
            <div className="mt-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {pasos[pasoActual - 1].titulo}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {pasos[pasoActual - 1].descripcion}
              </p>
            </div>
          </div>

          {/* Contenido del paso */}
          <div className="px-8 py-8 min-h-[400px]">
            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
              </div>
            )}

            {renderStep()}
          </div>

          {/* Botones de navegación */}
          <div className="bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 px-8 py-6 flex items-center justify-between gap-4">
            <button
              onClick={handlePrev}
              disabled={pasoActual === 1}
              className={`
                flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-all duration-300
                ${pasoActual === 1
                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
                }
              `}
            >
              <ChevronLeft className="w-4 h-4" />
              Anterior
            </button>

            <div className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400">
              <span className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                {pasoActual}
              </span>
              /
              <span>{pasos.length}</span>
            </div>

            {pasoActual === pasos.length ? (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-green-400 disabled:to-emerald-400 text-white rounded-lg font-medium transition-all duration-300"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Guardar Producto
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-medium transition-all duration-300"
              >
                Siguiente
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductosWizard;
