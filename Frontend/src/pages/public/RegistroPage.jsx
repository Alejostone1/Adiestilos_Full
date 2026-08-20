import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registrarUsuario } from '../../api/authApi'; // Asegúrate que la ruta es correcta
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import Swal from 'sweetalert2';

const RegistroPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    usuario: '',
    correoElectronico: '',
    contrasena: '',
    confirmarContrasena: '',
    telefono: '',
    direccion: '',
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);


  const validateField = (name, value) => {
    let error = '';
    switch (name) {
      case 'nombres':
        if (!value) error = 'El nombre es obligatorio.';
        break;
      case 'apellidos':
        if (!value) error = 'El apellido es obligatorio.';
        break;
      case 'usuario':
        if (!value) error = 'El usuario es obligatorio.';
        break;
      case 'correoElectronico':
        if (!value) {
          error = 'El correo electrónico es obligatorio.';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = 'El formato del correo electrónico no es válido.';
        }
        break;
      case 'contrasena':
        if (!value) {
          error = 'La contraseña es obligatoria.';
        } else if (value.length < 6) {
          error = 'La contraseña debe tener al menos 6 caracteres.';
        }
        break;
      case 'confirmarContrasena':
        if (value !== formData.contrasena) {
          error = 'Las contraseñas no coinciden.';
        }
        break;
      default:
        break;
    }
    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    if (errors[name]) {
      const error = validateField(name, value);
      setErrors({
        ...errors,
        [name]: error,
      });
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    setErrors({
      ...errors,
      [name]: error,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    const newErrors = {};
    for (const key in formData) {
      if (key === 'telefono' || key === 'direccion') continue; // No validar campos opcionales
      const error = validateField(key, formData[key]);
      if (error) {
        newErrors[key] = error;
      }
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setIsLoading(true);
      try {
        // Excluir confirmarContrasena y campos opcionales vacíos del envío
        const { confirmarContrasena, ...datosParaApi } = formData;
        if (!datosParaApi.telefono) delete datosParaApi.telefono;
        if (!datosParaApi.direccion) delete datosParaApi.direccion;

        await registrarUsuario(datosParaApi);
        Swal.fire({
          title: '¡Registro Exitoso!',
          text: 'Serás redirigido a la página de inicio de sesión.',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false,
        }).then(() => {
          navigate('/login');
        });
      } catch (error) {
        const errorMessage = error?.error || 'Ocurrió un error inesperado al registrar el usuario.';
        Swal.fire({
          title: 'Error en el Registro',
          text: errorMessage,
          icon: 'error',
          confirmButtonText: 'Entendido'
        });
        // Mantenemos el apiError por si se quiere mostrar también en el formulario
        setApiError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    }
  };


  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Crea tu cuenta en <span className="text-adi-red">Adi Estilos</span>
          </h2>
        </div>
        <form className="mt-8 space-y-6 bg-white p-8 shadow-2xl rounded-lg" onSubmit={handleSubmit} noValidate>
          {apiError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{apiError}</span>
            </div>
          )}
          <div className="rounded-md shadow-sm -space-y-px">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="nombres" className="sr-only">Nombres</label>
                <input
                  id="nombres"
                  name="nombres"
                  type="text"
                  required
                  className={`appearance-none rounded-md relative block w-full px-3 py-2 border ${errors.nombres ? 'border-red-500' : 'border-gray-300'} placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-adi-red focus:border-adi-red focus:z-10 sm:text-sm`}
                  placeholder="Nombres"
                  value={formData.nombres}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={isLoading}
                />
                {errors.nombres && <p className="text-red-500 text-xs mt-1">{errors.nombres}</p>}
              </div>
              <div>
                <label htmlFor="apellidos" className="sr-only">Apellidos</label>
                <input
                  id="apellidos"
                  name="apellidos"
                  type="text"
                  required
                  className={`appearance-none rounded-md relative block w-full px-3 py-2 border ${errors.apellidos ? 'border-red-500' : 'border-gray-300'} placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-adi-red focus:border-adi-red focus:z-10 sm:text-sm`}
                  placeholder="Apellidos"
                  value={formData.apellidos}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={isLoading}
                />
                {errors.apellidos && <p className="text-red-500 text-xs mt-1">{errors.apellidos}</p>}
              </div>
            </div>
            <div className="pt-4">
              <label htmlFor="usuario" className="sr-only">Usuario</label>
              <input
                id="usuario"
                name="usuario"
                type="text"
                required
                className={`appearance-none rounded-md relative block w-full px-3 py-2 border ${errors.usuario ? 'border-red-500' : 'border-gray-300'} placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-adi-red focus:border-adi-red focus:z-10 sm:text-sm`}
                placeholder="Nombre de usuario"
                value={formData.usuario}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={isLoading}
              />
              {errors.usuario && <p className="text-red-500 text-xs mt-1">{errors.usuario}</p>}
            </div>
            <div className="pt-4">
              <label htmlFor="correoElectronico" className="sr-only">Correo Electrónico</label>
              <input
                id="correoElectronico"
                name="correoElectronico"
                type="email"
                autoComplete="email"
                required
                className={`appearance-none rounded-md relative block w-full px-3 py-2 border ${errors.correoElectronico ? 'border-red-500' : 'border-gray-300'} placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-adi-red focus:border-adi-red focus:z-10 sm:text-sm`}
                placeholder="Correo electrónico"
                value={formData.correoElectronico}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={isLoading}
              />
              {errors.correoElectronico && <p className="text-red-500 text-xs mt-1">{errors.correoElectronico}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="relative">
                <label htmlFor="contrasena" className="sr-only">Contraseña</label>
                <input
                  id="contrasena"
                  name="contrasena"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  className={`appearance-none rounded-md relative block w-full px-3 py-2 border ${errors.contrasena ? 'border-red-500' : 'border-gray-300'} placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-adi-red focus:border-adi-red focus:z-10 sm:text-sm`}
                  placeholder="Contraseña"
                  value={formData.contrasena}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={isLoading}
                />
                <div
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </div>
                {errors.contrasena && <p className="text-red-500 text-xs mt-1">{errors.contrasena}</p>}
              </div>
              <div className="relative">
                <label htmlFor="confirmarContrasena" className="sr-only">Confirmar Contraseña</label>
                <input
                  id="confirmarContrasena"
                  name="confirmarContrasena"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  className={`appearance-none rounded-md relative block w-full px-3 py-2 border ${errors.confirmarContrasena ? 'border-red-500' : 'border-gray-300'} placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-adi-red focus:border-adi-red focus:z-10 sm:text-sm`}
                  placeholder="Confirmar contraseña"
                  value={formData.confirmarContrasena}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={isLoading}
                />
                <div
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 cursor-pointer"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </div>
                {errors.confirmarContrasena && <p className="text-red-500 text-xs mt-1">{errors.confirmarContrasena}</p>}
              </div>
            </div>
            <div className="pt-4">
              <label htmlFor="telefono" className="sr-only">Teléfono</label>
              <input
                id="telefono"
                name="telefono"
                type="tel"
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-adi-red focus:border-adi-red focus:z-10 sm:text-sm"
                placeholder="Teléfono (Opcional)"
                value={formData.telefono}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>
            <div className="pt-4">
              <label htmlFor="direccion" className="sr-only">Dirección</label>
              <textarea
                id="direccion"
                name="direccion"
                rows="2"
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-adi-red focus:border-adi-red focus:z-10 sm:text-sm"
                placeholder="Dirección (Opcional)"
                value={formData.direccion}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-adi-red hover:bg-adi-red-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-adi-red-dark disabled:bg-gray-400"
              disabled={isLoading}
            >
              {isLoading ? 'Creando cuenta...' : 'Crear cuenta'}
            </button>
          </div>
          <div className="text-sm text-center">
            <Link to="/login" className="font-medium text-adi-red hover:text-adi-red-dark">
              ¿Ya tienes una cuenta? Inicia sesión
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegistroPage;