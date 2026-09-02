/**
 * @file Footer.jsx
 * @brief Footer editorial premium para ADI ESTILOS
 */

import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const anioActual = new Date().getFullYear();

  const footerLinks = {
    tienda: [
      { label: 'Novedades', to: '/tienda?orden=recientes' },
      { label: 'Ofertas', to: '/tienda?ofertas=true' },
      { label: 'Todas las categorías', to: '/tienda' },
    ],
    ayuda: [
      { label: 'Envíos y entregas', to: '/envios' },
      { label: 'Devoluciones', to: '/devoluciones' },
      { label: 'Guía de tallas', to: '/guia-tallas' },
      { label: 'Preguntas frecuentes', to: '/faq' },
    ],
    empresa: [
      { label: 'Nuestra historia', to: '/nosotros' },
      { label: 'Contacto', to: '/contacto' },
    ],
  };

  const socialLinks = [
    {
      label: 'Instagram',
      href: 'https://instagram.com',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
      ),
    },
    {
      label: 'Facebook',
      href: 'https://facebook.com',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      ),
    },
  ];

  return (
    <footer className="w-full bg-surface-container border-t border-outline-variant">
      {/* Desktop Footer */}
      <div className="hidden md:block pt-20 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter px-margin-desktop max-w-container-max mx-auto mb-16">
          {/* Brand */}
          <div className="col-span-1">
            <span className="font-display-lg text-display-lg text-primary block mb-6">
              Adi Estilos
            </span>
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-6 max-w-xs">
              Elevando la moda con elegancia sutil y diseño consciente para la mujer moderna.
            </p>
            <div className="flex gap-4 text-primary">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-tertiary transition-colors duration-300"
                  aria-label={social.label}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Tienda */}
          <div>
            <h4 className="font-headline-sm text-headline-sm text-on-surface mb-6">Explorar</h4>
            <ul className="space-y-4">
              {footerLinks.tienda.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary hover:translate-x-1 transition-all duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Ayuda */}
          <div>
            <h4 className="font-headline-sm text-headline-sm text-on-surface mb-6">Ayuda</h4>
            <ul className="space-y-4">
              {footerLinks.ayuda.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary hover:translate-x-1 transition-all duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Empresa */}
          <div>
            <h4 className="font-headline-sm text-headline-sm text-on-surface mb-6">Empresa</h4>
            <ul className="space-y-4">
              {footerLinks.empresa.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary hover:translate-x-1 transition-all duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-outline-variant/30 pt-8 px-margin-desktop text-center">
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            &copy; {anioActual} Adi Estilos. Todos los derechos reservados.
          </p>
        </div>
      </div>

      {/* Mobile Footer */}
      <div className="md:hidden rounded-t-xl bg-surface-container-low flex flex-col items-center py-12 px-margin-mobile space-y-8">
        <span className="font-display-lg text-headline-sm text-primary">ADI ESTILOS</span>
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-4">
          <Link className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors underline-offset-4 hover:underline" to="/tienda">
            Tienda
          </Link>
          <Link className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors underline-offset-4 hover:underline" to="/nosotros">
            Adi Estilos
          </Link>
          <Link className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors underline-offset-4 hover:underline" to="/contacto">
            Contacto
          </Link>
        </div>
        <p className="font-body-sm text-body-sm text-on-surface-variant text-center opacity-80">
          &copy; {anioActual} Adi Estilos. Editorial Elegance.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
