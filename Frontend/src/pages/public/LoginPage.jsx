/**
 * @file LoginPage.jsx
 * @brief Página de inicio de sesión.
 *
 * Login moderno y minimalista para la tienda
 * de ropa y accesorios "Adi Estilos".
 * Diseñado completamente con Tailwind CSS
 * y alertas con SweetAlert2.
 */

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { useAuth } from "../../context/AuthContext";
import { loginUsuario } from "../../api/authApi";

const LoginPage = () => {
  const [credenciales, setCredenciales] = useState({
    identificador: "",
    contrasena: "",
  });
  const [cargando, setCargando] = useState(false);

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

    // Validación
    if (!credenciales.identificador || !credenciales.contrasena) {
      Swal.fire({
        icon: "warning",
        title: "Campos incompletos",
        text: "Por favor, complete todos los campos.",
        confirmButtonColor: "#111827",
      });
      setCargando(false);
      return;
    }

    try {

      const data = await loginUsuario(credenciales);
      console.log("LOGIN: Respuesta recibida de la API:", data);

      // Verificación de la estructura de datos
      if (!data || !data.datos || !data.datos.usuario || !data.datos.tokenAcceso) {
        console.error("LOGIN_ERROR: La respuesta de la API no tiene la estructura esperada (tokenAcceso o data.datos.usuario).");
        throw new Error("Respuesta inesperada del servidor.");
      }

      const { tokenAcceso, usuario } = data.datos;
      console.log("LOGIN: Llamando a context.login con token y usuario extraídos.");
      login({ tokenAcceso, usuario });

      const nombreRol = usuario?.rol?.nombreRol || '';
      console.log(`LOGIN: Rol del usuario detectado: ${nombreRol}`);

      // Redirección por rol (por nombre, los IDs de rol no son estables)
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
      console.error("LOGIN_ERROR: Error en el bloque catch de handleSubmit", err);
      Swal.fire({
        icon: "error",
        title: "Error al iniciar sesión",
        text:
          err?.mensaje ||
          "Verifique su correo electrónico y contraseña.",
        confirmButtonColor: "#111827",
      });
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100">

        {/* =============================
            CABECERA
        ============================== */}
        <div className="px-8 pt-8 text-center">
          <h1 className="text-2xl font-semibold tracking-wide text-gray-900">
            Adi Estilos
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Inicia sesión para continuar
          </p>
        </div>

        {/* =============================
            FORMULARIO
        ============================== */}
        <form onSubmit={handleSubmit} className="px-8 py-6 space-y-5">

          {/* Identificador */}
          <div>
            <label
              htmlFor="identificador"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Usuario o Correo electrónico
            </label>
            <input
              type="text"
              id="identificador"
              name="identificador"
              placeholder="usuario o tu@correo.com"
              value={credenciales.identificador}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition"
              required
            />
          </div>

          {/* Contraseña */}
          <div>
            <label
              htmlFor="contrasena"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Contraseña
            </label>
            <input
              type="password"
              id="contrasena"
              name="contrasena"
              placeholder="••••••••"
              value={credenciales.contrasena}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition"
              required
            />
          </div>

          {/* Botón */}
          <button
            type="submit"
            disabled={cargando}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-gray-900 text-white py-2.5 text-sm font-medium hover:bg-gray-800 transition disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {cargando && (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            )}
            {cargando ? "Iniciando sesión..." : "Iniciar sesión"}
          </button>
        </form>

        {/* =============================
            PIE
        ============================== */}
        <div className="px-8 pb-8 text-center text-sm text-gray-500">
          ¿No tienes una cuenta?{" "}
          <Link
            to="/registro"
            className="font-medium text-gray-900 hover:underline"
          >
            Regístrate aquí
          </Link>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;
