/**
 * @file RegistroPage.jsx
 * @brief Página de registro — editorial, animada y responsive.
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { registrarUsuario } from '../../api/authApi';
import Swal from 'sweetalert2';
import Logo from '../../components/common/Logo';

const campoBase =
  'w-full rounded-xl border pl-11 pr-4 py-3 text-sm text-on-surface placeholder-outline focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all';

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
      if (key === 'telefono' || key === 'direccion') continue;
      const error = validateField(key, formData[key]);
      if (error) {
        newErrors[key] = error;
      }
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setIsLoading(true);
      try {
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
          confirmButtonText: 'Entendido',
          confirmButtonColor: '#a73162',
        });
        setApiError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const campoConError = (name) => (errors[name] ? 'border-error' : 'border-outline-variant');

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-surface px-4 py-16">
      {/* Blobs decorativos de marca */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-24 -right-16 w-72 h-72 rounded-full bg-primary-container/40 blur-3xl"
          animate={{ y: [0, 20, 0], x: [0, -10, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -bottom-24 -left-16 w-80 h-80 rounded-full bg-primary/20 blur-3xl"
          animate={{ y: [0, -20, 0], x: [0, 10, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-lg bg-pure-white rounded-[2rem] shadow-card-hover border border-primary/10 overflow-hidden"
      >
        <div className="px-8 pt-10 pb-2 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="flex justify-center mb-4"
          >
            <Logo size="xl" ring />
          </motion.div>
          <h1 className="font-headline-md text-headline-md text-on-surface">
            Crea tu cuenta
          </h1>
          <p className="mt-2 font-body-sm text-body-sm text-text-main">
            Únete a Adi Estilos y descubre tu estilo
          </p>
        </div>

        <form className="px-8 py-6 space-y-5" onSubmit={handleSubmit} noValidate>
          {apiError && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-error-container border border-error/30 text-on-error-container px-4 py-3 rounded-xl text-sm"
              role="alert"
            >
              <strong className="font-semibold">Error: </strong>
              {apiError}
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.18 }}
            className="grid grid-cols-2 gap-4"
          >
            <div>
              <label htmlFor="nombres" className="block font-body-sm text-body-sm text-text-main mb-1.5 font-medium">Nombres</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-[20px]">badge</span>
                <input
                  id="nombres"
                  name="nombres"
                  type="text"
                  required
                  className={`${campoBase} ${campoConError('nombres')}`}
                  placeholder="Nombres"
                  value={formData.nombres}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={isLoading}
                />
              </div>
              {errors.nombres && <p className="text-error text-xs mt-1">{errors.nombres}</p>}
            </div>
            <div>
              <label htmlFor="apellidos" className="block font-body-sm text-body-sm text-text-main mb-1.5 font-medium">Apellidos</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-[20px]">badge</span>
                <input
                  id="apellidos"
                  name="apellidos"
                  type="text"
                  required
                  className={`${campoBase} ${campoConError('apellidos')}`}
                  placeholder="Apellidos"
                  value={formData.apellidos}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={isLoading}
                />
              </div>
              {errors.apellidos && <p className="text-error text-xs mt-1">{errors.apellidos}</p>}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.22 }}>
            <label htmlFor="usuario" className="block font-body-sm text-body-sm text-text-main mb-1.5 font-medium">Usuario</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-[20px]">person</span>
              <input
                id="usuario"
                name="usuario"
                type="text"
                required
                className={`${campoBase} ${campoConError('usuario')}`}
                placeholder="Nombre de usuario"
                value={formData.usuario}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={isLoading}
              />
            </div>
            {errors.usuario && <p className="text-error text-xs mt-1">{errors.usuario}</p>}
          </motion.div>

          <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.26 }}>
            <label htmlFor="correoElectronico" className="block font-body-sm text-body-sm text-text-main mb-1.5 font-medium">Correo electrónico</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-[20px]">mail</span>
              <input
                id="correoElectronico"
                name="correoElectronico"
                type="email"
                autoComplete="email"
                required
                className={`${campoBase} ${campoConError('correoElectronico')}`}
                placeholder="tu@correo.com"
                value={formData.correoElectronico}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={isLoading}
              />
            </div>
            {errors.correoElectronico && <p className="text-error text-xs mt-1">{errors.correoElectronico}</p>}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="grid grid-cols-2 gap-4"
          >
            <div>
              <label htmlFor="contrasena" className="block font-body-sm text-body-sm text-text-main mb-1.5 font-medium">Contraseña</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-[20px]">lock</span>
                <input
                  id="contrasena"
                  name="contrasena"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  className={`${campoBase} pr-11 ${campoConError('contrasena')}`}
                  placeholder="Contraseña"
                  value={formData.contrasena}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-outline hover:text-primary transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
              {errors.contrasena && <p className="text-error text-xs mt-1">{errors.contrasena}</p>}
            </div>
            <div>
              <label htmlFor="confirmarContrasena" className="block font-body-sm text-body-sm text-text-main mb-1.5 font-medium">Confirmar</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-[20px]">lock_reset</span>
                <input
                  id="confirmarContrasena"
                  name="confirmarContrasena"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  className={`${campoBase} pr-11 ${campoConError('confirmarContrasena')}`}
                  placeholder="Confirmar"
                  value={formData.confirmarContrasena}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  aria-label={showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-outline hover:text-primary transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showConfirmPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
              {errors.confirmarContrasena && <p className="text-error text-xs mt-1">{errors.confirmarContrasena}</p>}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.34 }}>
            <label htmlFor="telefono" className="block font-body-sm text-body-sm text-text-main mb-1.5 font-medium">Teléfono <span className="text-outline font-normal">(opcional)</span></label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-[20px]">call</span>
              <input
                id="telefono"
                name="telefono"
                type="tel"
                className={campoBase}
                placeholder="Teléfono"
                value={formData.telefono}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.38 }}>
            <label htmlFor="direccion" className="block font-body-sm text-body-sm text-text-main mb-1.5 font-medium">Dirección <span className="text-outline font-normal">(opcional)</span></label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3.5 top-3 text-outline text-[20px]">home_pin</span>
              <textarea
                id="direccion"
                name="direccion"
                rows="2"
                className={`${campoBase} pt-3 resize-none`}
                placeholder="Dirección"
                value={formData.direccion}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>
          </motion.div>

          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.44 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary text-on-primary py-3.5 text-sm font-semibold tracking-wide hover:bg-tertiary transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading && (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            {isLoading ? 'Creando cuenta...' : 'Crear cuenta'}
          </motion.button>

          <div className="text-center font-body-sm text-body-sm text-text-main">
            ¿Ya tienes una cuenta?{' '}
            <Link to="/login" className="font-semibold text-primary hover:text-tertiary transition-colors">
              Inicia sesión
            </Link>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default RegistroPage;
