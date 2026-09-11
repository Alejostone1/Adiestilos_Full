/**
 * @file LoginPage.jsx
 * @brief Página de inicio de sesión — editorial, animada y responsive.
 */

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Swal from "sweetalert2";
import { useAuth } from "../../context/AuthContext";
import { loginUsuario } from "../../api/authApi";
import Logo from "../../components/common/Logo";

const LoginPage = () => {
  const [credenciales, setCredenciales] = useState({
    identificador: "",
    contrasena: "",
  });
  const [cargando, setCargando] = useState(false);
  const [mostrarContrasena, setMostrarContrasena] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredenciales({
      ...credenciales,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);

    if (!credenciales.identificador || !credenciales.contrasena) {
      Swal.fire({
        icon: "warning",
        title: "Campos incompletos",
        text: "Por favor, complete todos los campos.",
        confirmButtonColor: "#a73162",
      });
      setCargando(false);
      return;
    }

    try {
      const data = await loginUsuario(credenciales);

      if (!data || !data.datos || !data.datos.usuario || !data.datos.tokenAcceso) {
        throw new Error("Respuesta inesperada del servidor.");
      }

      const { tokenAcceso, usuario } = data.datos;
      login({ tokenAcceso, usuario });

      const nombreRol = usuario?.rol?.nombreRol || '';

      if (nombreRol === 'Administrador' || nombreRol === 'Vendedor') {
        navigate("/admin/dashboard");
      } else {
        navigate('/cliente/dashboard');
      }

      Swal.fire({
        icon: "success",
        title: "Bienvenido",
        text: "Inicio de sesión exitoso",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error al iniciar sesión",
        text: err?.mensaje || "Verifique su correo electrónico y contraseña.",
        confirmButtonColor: "#a73162",
      });
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-surface px-4 py-16">
      {/* Blobs decorativos de marca */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-24 -left-16 w-72 h-72 rounded-full bg-primary-container/40 blur-3xl"
          animate={{ y: [0, 20, 0], x: [0, 10, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-24 -right-16 w-80 h-80 rounded-full bg-primary/20 blur-3xl"
          animate={{ y: [0, -20, 0], x: [0, -10, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-md bg-pure-white rounded-[2rem] shadow-card-hover border border-primary/10 overflow-hidden"
      >
        {/* Cabecera */}
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
            Bienvenida de nuevo
          </h1>
          <p className="mt-2 font-body-sm text-body-sm text-text-main">
            Inicia sesión para continuar en Adi Estilos
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="px-8 py-6 space-y-5">
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <label
              htmlFor="identificador"
              className="block font-body-sm text-body-sm text-text-main mb-1.5 font-medium"
            >
              Usuario o correo electrónico
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-[20px]">
                person
              </span>
              <input
                type="text"
                id="identificador"
                name="identificador"
                placeholder="usuario o tu@correo.com"
                value={credenciales.identificador}
                onChange={handleChange}
                className="w-full rounded-xl border border-outline-variant pl-11 pr-4 py-3 text-sm text-on-surface placeholder-outline focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                required
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.28 }}
          >
            <label
              htmlFor="contrasena"
              className="block font-body-sm text-body-sm text-text-main mb-1.5 font-medium"
            >
              Contraseña
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-[20px]">
                lock
              </span>
              <input
                type={mostrarContrasena ? "text" : "password"}
                id="contrasena"
                name="contrasena"
                placeholder="••••••••"
                value={credenciales.contrasena}
                onChange={handleChange}
                className="w-full rounded-xl border border-outline-variant pl-11 pr-11 py-3 text-sm text-on-surface placeholder-outline focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setMostrarContrasena((v) => !v)}
                aria-label={mostrarContrasena ? "Ocultar contraseña" : "Mostrar contraseña"}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-outline hover:text-primary transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">
                  {mostrarContrasena ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>
          </motion.div>

          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.36 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={cargando}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary text-on-primary py-3.5 text-sm font-semibold tracking-wide hover:bg-tertiary transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {cargando && (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            {cargando ? "Iniciando sesión..." : "Iniciar sesión"}
          </motion.button>
        </form>

        {/* Pie */}
        <div className="px-8 pb-9 text-center font-body-sm text-body-sm text-text-main">
          ¿No tienes una cuenta?{" "}
          <Link to="/registro" className="font-semibold text-primary hover:text-tertiary transition-colors">
            Regístrate aquí
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
