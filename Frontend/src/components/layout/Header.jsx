/**
 * @file Header.jsx
 * @brief Header editorial premium para ADI ESTILOS - Glassmorphism, femenino, responsive
 */

import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useCarrito } from '../../context/CarritoContext';
import { useFavoritos } from '../../context/FavoritosContext';
import Logo from '../common/Logo';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { usuario, logout } = useAuth();
  const { toggleCarrito, obtenerCantidadTotal } = useCarrito();
  const { toggleFavoritos, favoritos } = useFavoritos();

  const cantidadCarrito = obtenerCantidadTotal();
  const cantidadFavoritos = favoritos.length;

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsSearchOpen(false);
  }, [location]);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isMobileMenuOpen]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/tienda?buscar=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setIsSearchOpen(false);
    }
  };

  const navLinks = [
    { to: '/', label: 'Inicio' },
    { to: '/tienda', label: 'Tienda' },
    { to: '/nosotros', label: 'Nosotros' },
    { to: '/contacto', label: 'Contacto' },
  ];

  const esAdministrador = usuario?.rol?.nombreRol === 'Administrador';
  const rutaPerfil = esAdministrador ? '/admin' : '/perfil';

  return (
    <>
      {/* Announcement Bar - Mobile */}
      <div className="bg-primary-container text-on-primary-container text-center py-2 px-5 md:hidden">
        <span className="font-label-caps text-label-caps">
          Envíos a todo el país en compras superiores a $50.000
        </span>
      </div>

      {/* Desktop Header */}
      <header
        className={`hidden md:block fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'glass-nav shadow-soft-primary'
            : 'bg-surface/80 backdrop-blur-md shadow-soft-primary'
        }`}
      >
        <div className="flex justify-between items-center px-margin-desktop py-5 max-w-container-max mx-auto">
          {/* Logo - Left */}
          <Logo size="lg" />

          {/* Navigation - Center */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `font-body-md text-body-md transition-colors duration-300 ${
                    isActive
                      ? 'text-primary border-b-2 border-primary pb-1'
                      : 'text-text-main hover:text-primary'
                  }`
                }
                end={link.to === '/'}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Actions - Right */}
          <div className="flex items-center gap-5 text-primary">
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="hover:text-primary-container transition-all duration-300 hover:scale-95"
              aria-label="Buscar"
            >
              <span className="material-symbols-outlined">search</span>
            </button>

            <button
              onClick={toggleFavoritos}
              className="relative hover:text-primary-container transition-all duration-300 hover:scale-95"
              aria-label="Favoritos"
            >
              <span className="material-symbols-outlined">favorite</span>
              {cantidadFavoritos > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 bg-primary text-on-primary text-[10px] font-bold rounded-full flex items-center justify-center">
                  {cantidadFavoritos > 99 ? '99+' : cantidadFavoritos}
                </span>
              )}
            </button>

            {usuario ? (
              <Link
                to={rutaPerfil}
                className="hover:text-primary-container transition-all duration-300 hover:scale-95"
                aria-label="Mi cuenta"
              >
                <span className="material-symbols-outlined">person</span>
              </Link>
            ) : (
              <Link
                to="/login"
                className="hover:text-primary-container transition-all duration-300 hover:scale-95"
                aria-label="Iniciar sesión"
              >
                <span className="material-symbols-outlined">person</span>
              </Link>
            )}

            <button
              onClick={toggleCarrito}
              className="relative hover:text-primary-container transition-all duration-300 hover:scale-95"
              aria-label="Carrito"
            >
              <span className="material-symbols-outlined">shopping_bag</span>
              {cantidadCarrito > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 bg-primary text-on-primary text-[10px] font-bold rounded-full flex items-center justify-center">
                  {cantidadCarrito > 99 ? '99+' : cantidadCarrito}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <AnimatePresence>
          {isSearchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="border-t border-outline-variant/30 overflow-hidden"
            >
              <form onSubmit={handleSearch} className="max-w-2xl mx-auto px-6 py-4">
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">
                    search
                  </span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar productos..."
                    className="w-full bg-surface-bright border border-secondary-fixed-dim rounded-full py-3 pl-12 pr-4 font-body-sm text-body-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                    autoFocus
                  />
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Mobile Header */}
      <header
        className={`md:hidden fixed w-full z-50 transition-all duration-300 ${
          isScrolled
            ? 'glass-nav shadow-nav'
            : 'bg-surface/80 backdrop-blur-md shadow-nav'
        }`}
        style={{ top: '32px' }}
      >
        <div className="flex justify-between items-center px-margin-mobile h-16">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="text-primary hover:text-primary-container active:scale-95 transition-transform"
            aria-label="Menú"
          >
            <span className="material-symbols-outlined">menu</span>
          </button>

          <div className="flex-1 flex justify-center">
            <Logo size="sm" />
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleFavoritos}
              className="relative text-primary hover:text-primary-container active:scale-95 transition-transform"
              aria-label="Favoritos"
            >
              <span className="material-symbols-outlined">favorite</span>
              {cantidadFavoritos > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] px-1 bg-primary text-on-primary text-[9px] font-bold rounded-full flex items-center justify-center">
                  {cantidadFavoritos > 99 ? '99+' : cantidadFavoritos}
                </span>
              )}
            </button>
            <button
              onClick={toggleCarrito}
              className="relative text-primary hover:text-primary-container active:scale-95 transition-transform"
              aria-label="Carrito"
            >
              <span className="material-symbols-outlined">shopping_bag</span>
              {cantidadCarrito > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] px-1 bg-primary text-on-primary text-[9px] font-bold rounded-full flex items-center justify-center">
                  {cantidadCarrito > 99 ? '99+' : cantidadCarrito}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-[55] bg-inverse-surface/40 md:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.4, ease: 'easeInOut' }}
              className="fixed inset-0 z-[60] w-64 h-full bg-background md:hidden flex flex-col"
            >
              <div className="flex flex-col p-margin-mobile h-full">
                <div className="flex justify-between items-center mb-8">
                  <Logo size="md" onClick={() => setIsMobileMenuOpen(false)} />
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-primary hover:text-primary-container"
                    aria-label="Cerrar menú"
                  >
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>

                <nav className="flex flex-col space-y-2">
                  {navLinks.map((link) => (
                    <NavLink
                      key={link.to}
                      to={link.to}
                      className={({ isActive }) =>
                        `flex items-center gap-4 py-3 font-body-lg text-body-lg transition-all duration-300 hover:pl-4 ${
                          isActive
                            ? 'text-primary font-bold border-b border-primary-container'
                            : 'text-text-main hover:text-primary-container'
                        }`
                      }
                      end={link.to === '/'}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <span className="material-symbols-outlined">
                        {link.to === '/' ? 'home' : link.to === '/tienda' ? 'storefront' : link.to === '/nosotros' ? 'auto_awesome' : 'mail'}
                      </span>
                      {link.label}
                    </NavLink>
                  ))}
                </nav>

                <div className="mt-auto pt-8 border-t border-outline-variant/30">
                  {usuario ? (
                    <div className="space-y-4">
                      <Link
                        to={rutaPerfil}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-4 text-text-main hover:text-primary font-body-md text-body-md"
                      >
                        <span className="material-symbols-outlined">person</span>
                        {esAdministrador ? 'Panel Admin' : 'Mi cuenta'}
                      </Link>
                      <button
                        onClick={() => { logout(); setIsMobileMenuOpen(false); }}
                        className="flex items-center gap-4 text-text-main hover:text-primary font-body-md text-body-md"
                      >
                        <span className="material-symbols-outlined">logout</span>
                        Cerrar sesión
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Link
                        to="/login"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block w-full py-3 text-center border border-primary text-primary font-body-sm text-body-sm rounded-lg hover:bg-primary hover:text-on-primary transition-colors"
                      >
                        Iniciar Sesión
                      </Link>
                      <Link
                        to="/registro"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block w-full py-3 text-center bg-primary-container text-on-primary-container font-body-sm text-body-sm rounded-lg hover:bg-primary hover:text-on-primary transition-colors"
                      >
                        Crear Cuenta
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Spacer for fixed header - Desktop */}
      <div className="hidden md:block h-20" />
      {/* Spacer for fixed header + announcement bar - Mobile */}
      <div className="md:hidden h-[112px]" />
    </>
  );
};

export default Header;
