/**
 * AuthContext.jsx
 * Manejo centralizado de autenticación
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { setAuthToken } from '../api/axiosConfig';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [estaAutenticado, setEstaAutenticado] = useState(false);
  const [cargando, setCargando] = useState(true);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setUsuario(null);
    setToken(null);
    setAuthToken(null);
    setEstaAutenticado(false);
    setCargando(false);
  };

  useEffect(() => {

    if (!token) {
      setUsuario(null);
      setEstaAutenticado(false);
      setCargando(false);
      return;
    }

    try {

      const decoded = jwtDecode(token);
      const ahora = Date.now() / 1000;

      if (decoded.exp < ahora) {
        // Token expirado - limpiar sin llamar a logout para evitar loops
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        setUsuario(null);
        setAuthToken(null);
        setEstaAutenticado(false);
      } else {

        const usuarioGuardado = JSON.parse(localStorage.getItem('usuario'));

        setUsuario(usuarioGuardado);
        setAuthToken(token);
        setEstaAutenticado(true);
 
      }
    } catch (error) {
      // Error en decodificación - limpiar
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      setUsuario(null);
      setAuthToken(null);
      setEstaAutenticado(false);
    } finally {

      setCargando(false);
    }
  }, [token]);

  const login = ({ tokenAcceso, usuario }) => {

    localStorage.setItem('token', tokenAcceso);
    localStorage.setItem('usuario', JSON.stringify(usuario));

    setToken(tokenAcceso);
    setUsuario(usuario);
    setAuthToken(tokenAcceso);
    setEstaAutenticado(true);

  };

  return (
    <AuthContext.Provider
      value={{
        usuario,
        token,
        estaAutenticado,
        cargando,
        login,
        logout,
      }}
    >
      {!cargando && children}
    </AuthContext.Provider>
  );
};
