import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Loader2, AlertCircle } from 'lucide-react';

const WizardStep4 = ({ formData, onUpdateFormData }) => {
  const [previewPrincipal, setPreviewPrincipal] = useState(
    formData.imagenPrincipal instanceof File
      ? URL.createObjectURL(formData.imagenPrincipal)
      : null
  );
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [errorImagen, setErrorImagen] = useState(null);
  const inputRefPrincipal = useRef(null);
  const inputRefAdicionales = useRef(null);

  const handleImagenPrincipalChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrorImagen('La imagen no debe superar 5MB');
      return;
    }

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      setErrorImagen('El archivo debe ser una imagen');
      return;
    }

    setIsLoadingPreview(true);
    setErrorImagen(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewPrincipal(e.target?.result);
      onUpdateFormData({ imagenPrincipal: file });
      setIsLoadingPreview(false);
    };
    reader.onerror = () => {
      setErrorImagen('Error al cargar la imagen');
      setIsLoadingPreview(false);
    };
    reader.readAsDataURL(file);
  };

  const handleImagenesAdicionalesChange = (event) => {
    const files = event.target.files;
    if (!files) return;

    const nuevasImagenes = [...(formData.imagenes || [])];
    let errores = [];

    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        errores.push(`${file.name} supera 5MB`);
        continue;
      }

      if (!file.type.startsWith('image/')) {
        errores.push(`${file.name} no es una imagen`);
        continue;
      }

      nuevasImagenes.push(file);
    }

    if (errores.length > 0) {
      setErrorImagen(errores.join(', '));
    } else {
      setErrorImagen(null);
    }

    onUpdateFormData({ imagenes: nuevasImagenes });
  };

  const removeAdicionalImage = (index) => {
    const nuevasImagenes = formData.imagenes.filter((_, i) => i !== index);
    onUpdateFormData({ imagenes: nuevasImagenes });
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex items-start gap-3">
        <div className="text-blue-600 dark:text-blue-400 text-sm">
          ℹ️ Carga una imagen principal (requerida) e imágenes adicionales para mejorar la presentación del producto.
        </div>
      </div>

      {errorImagen && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800 dark:text-red-300">{errorImagen}</p>
        </div>
      )}

      {/* Imagen Principal */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
          Imagen Principal *
        </label>

        <div
          onClick={() => inputRefPrincipal.current?.click()}
          className={`
            relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
            transition-all duration-300 bg-gradient-to-br
            ${previewPrincipal
              ? 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/10'
              : 'border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/10 hover:border-blue-500 dark:hover:border-blue-500'
            }
          `}
        >
          {isLoadingPreview ? (
            <div className="flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin" />
              <p className="text-sm text-gray-600 dark:text-gray-400">Procesando imagen...</p>
            </div>
          ) : previewPrincipal ? (
            <>
              <img
                src={previewPrincipal}
                alt="Preview"
                className="w-full h-56 object-cover rounded-lg mb-3"
              />
              <div className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400">
                <ImageIcon className="w-4 h-4" />
                <p className="text-sm font-medium">Click para cambiar imagen</p>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center gap-2">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Upload className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  Arrastra tu imagen aquí
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  o haz click para seleccionar
                </p>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                PNG, JPG o GIF (máximo 5MB)
              </p>
            </div>
          )}

          <input
            ref={inputRefPrincipal}
            type="file"
            accept="image/*"
            onChange={handleImagenPrincipalChange}
            className="hidden"
          />
        </div>
      </div>

      {/* Imágenes Adicionales */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
          Imágenes Adicionales (Opcional)
        </label>

        <div
          onClick={() => inputRefAdicionales.current?.click()}
          className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center cursor-pointer transition-all duration-300 hover:border-blue-400 dark:hover:border-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800/30"
        >
          <div className="flex flex-col items-center justify-center gap-2">
            <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <Upload className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                Agrega más imágenes
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Selecciona múltiples archivos
              </p>
            </div>
          </div>

          <input
            ref={inputRefAdicionales}
            type="file"
            multiple
            accept="image/*"
            onChange={handleImagenesAdicionalesChange}
            className="hidden"
          />
        </div>
      </div>

      {/* Lista de Imágenes Adicionales */}
      {formData.imagenes && formData.imagenes.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            Imágenes Agregadas ({formData.imagenes.length})
          </h4>

          <div className="grid grid-cols-3 gap-3">
            {formData.imagenes.map((imagen, index) => (
              <div key={index} className="relative group">
                <img
                  src={
                    imagen instanceof File
                      ? URL.createObjectURL(imagen)
                      : typeof imagen === 'string'
                      ? imagen
                      : imagen.imagenUrl
                  }
                  alt={`Adicional ${index + 1}`}
                  className="w-full h-24 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                />

                <button
                  onClick={() => removeAdicionalImage(index)}
                  className="absolute top-1 right-1 p-1 bg-red-500 hover:bg-red-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>

                <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 truncate">
                  {imagen instanceof File ? imagen.name : `Imagen ${index + 1}`}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Información sobre imágenes */}
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 space-y-2">
        <p className="text-sm font-semibold text-gray-900 dark:text-white">
          📸 Consejos para mejores imágenes
        </p>
        <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
          <li>✓ Usa imágenes de buena calidad (mínimo 800x600px)</li>
          <li>✓ Fondo limpio y uniforme</li>
          <li>✓ Iluminación adecuada</li>
          <li>✓ Muestra el producto desde diferentes ángulos</li>
        </ul>
      </div>
    </div>
  );
};

export default WizardStep4;
