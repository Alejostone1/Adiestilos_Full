/**
 * @file Header.jsx
 * @brief Header premium minimalista para e-commerce de moda
 */

import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useCarrito } from '../../context/CarritoContext';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { usuario, logout } = useAuth();
  const { toggleCarrito, obtenerCantidadTotal } = useCarrito();
  
  const cantidadCarrito = obtenerCantidadTotal();
  
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Detectar scroll para cambiar estilo del header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Cerrar menú móvil al cambiar de ruta
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsSearchOpen(false);
  }, [location]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/tienda?buscar=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setIsSearchOpen(false);
    }
  };

  // Determinar si estamos en el home para header transparente
  const isHome = location.pathname === '/';
  const headerBg = isHome && !isScrolled && !isMobileMenuOpen
    ? 'bg-transparent'
    : 'bg-white border-b border-neutral-200';
  const textColor = isHome && !isScrolled && !isMobileMenuOpen
    ? 'text-white'
    : 'text-neutral-900';
  const textColorMuted = isHome && !isScrolled && !isMobileMenuOpen
    ? 'text-white/70'
    : 'text-neutral-600';

  const navLinks = [
    { to: '/', label: 'Inicio' },
    { to: '/tienda', label: 'Tienda' },
    { to: '/nosotros', label: 'Nosotros' },
    { to: '/contacto', label: 'Contacto' },
  ];

  // Determinar si el usuario es administrador
  const esAdministrador = usuario?.rol?.nombreRol === 'Administrador';

  // Determinar la ruta del perfil según el rol
  const rutaPerfil = esAdministrador ? '/admin' : '/perfil';

  return (
    <>
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${headerBg}`}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-20">
            
            {/* Logo */}
            <Link 
              to="/" 
              className={`text-xl font-light tracking-[0.15em] uppercase transition-colors ${textColor}`}
            >
              Adi Estilos
            </Link>

            {/* Navegación Desktop */}
            <nav className="hidden lg:flex items-center gap-10">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) => `
                    text-xs uppercase tracking-[0.2em] transition-all duration-300
                    ${isActive 
                      ? textColor 
                      : `${textColorMuted} hover:${textColor}`
                    }
                  `}
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>

            {/* Acciones */}
            <div className="flex items-center gap-4">
              {/* Búsqueda */}
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className={`p-2 transition-colors ${textColorMuted} hover:${textColor}`}
                aria-label="Buscar"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>

              {/* Usuario */}
              {usuario ? (
                <div className="hidden sm:flex items-center gap-3">
                  <Link
                    to={rutaPerfil}
                    className={`text-xs uppercase tracking-wider transition-colors ${textColorMuted} hover:${textColor}`}
                  >
                    {usuario.nombres}
                  </Link>
                  <button
                    onClick={logout}
                    className={`text-xs uppercase tracking-wider transition-colors ${textColorMuted} hover:${textColor}`}
                  >
                    Salir
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className={`hidden sm:block text-xs uppercase tracking-[0.15em] transition-colors ${textColorMuted} hover:${textColor}`}
                >
                  Ingresar
                </Link>
              )}

              {/* Carrito */}
              <button
                onClick={toggleCarrito}
                className={`p-2 relative transition-colors ${textColorMuted} hover:${textColor}`}
                aria-label="Carrito"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                {cantidadCarrito > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-orange-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                    {cantidadCarrito > 99 ? '99+' : cantidadCarrito}
                  </span>
                )}
              </button>

              {/* Menú Móvil Toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className={`lg:hidden p-2 transition-colors ${textColor}`}
                aria-label="Menú"
              >
                <div className="w-5 h-4 flex flex-col justify-between">
                  <span className={`block h-px bg-current transition-transform duration-300 ${isMobileMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
                  <span className={`block h-px bg-current transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-0' : ''}`} />
                  <span className={`block h-px bg-current transition-transform duration-300 ${isMobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Barra de búsqueda */}
        <AnimatePresence>
          {isSearchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="border-t border-neutral-200 bg-white overflow-hidden"
            >
              <form onSubmit={handleSearch} className="max-w-2xl mx-auto px-6 py-4">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar productos..."
                    className="w-full px-4 py-3 bg-neutral-100 border-0 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-900"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Menú Móvil */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 lg:hidden"
          >
            {/* Overlay */}
            <div 
              className="absolute inset-0 bg-black/50"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            
            {/* Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="absolute right-0 top-0 bottom-0 w-80 max-w-full bg-white"
            >
              <div className="p-6 pt-24">
                <nav className="space-y-1">
                  {navLinks.map((link) => (
                    <NavLink
                      key={link.to}
                      to={link.to}
                      className={({ isActive }) => `
                        block py-4 text-sm uppercase tracking-[0.2em] border-b border-neutral-100 transition-colors
                        ${isActive ? 'text-neutral-900' : 'text-neutral-500 hover:text-neutral-900'}
                      `}
                    >
                      {link.label}
                    </NavLink>
                  ))}
                </nav>

                <div className="mt-8 pt-8 border-t border-neutral-200">
                  {usuario ? (
                    <div className="space-y-4">
                      <Link
                        to={rutaPerfil}
                        className="block text-sm text-neutral-600 hover:text-neutral-900"
                      >
                        {esAdministrador ? 'Panel Admin' : 'Mi cuenta'}
                      </Link>
                      <button
                        onClick={logout}
                        className="text-sm text-neutral-600 hover:text-neutral-900"
                      >
                        Cerrar sesión
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Link
                        to="/login"
                        className="block w-full py-3 text-center border border-neutral-900 text-sm uppercase tracking-wider hover:bg-neutral-900 hover:text-white transition-colors"
                      >
                        Ingresar
                      </Link>
                      <Link
                        to="/registro"
                        className="block w-full py-3 text-center bg-neutral-900 text-white text-sm uppercase tracking-wider hover:bg-neutral-800 transition-colors"
                      >
                        Crear cuenta
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spacer para contenido cuando header es fijo */}
      {!isHome && <div className="h-20" />}
    </>
  );
};

export default Header;
