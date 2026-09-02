/**
 * @file ContactoPage.jsx
 * @brief Contacto — Editorial pink branding, same functional logic.
 */

import React from 'react';
import { motion } from 'framer-motion';

const ContactoPage = () => {
  const infoItems = [
    {
      icono: 'location_on',
      titulo: 'Nuestra Tienda',
      lineas: ['Centro Comercial Victoria Plaza', 'Local 205, Pereira, Risaralda']
    },
    {
      icono: 'mail',
      titulo: 'Correo Electrónico',
      lineas: ['hola@adiestilos.com']
    },
    {
      icono: 'call',
      titulo: 'Teléfono',
      lineas: ['+57 (606) 333 4567']
    },
    {
      icono: 'schedule',
      titulo: 'Horarios',
      lineas: ['Lunes a Sábado: 10:00 AM - 8:00 PM', 'Domingos: 11:00 AM - 6:00 PM']
    }
  ];

  const redesSociales = [
    { icono: 'Instagram', url: '#', label: 'Instagram' },
    { icono: 'Facebook', url: '#', label: 'Facebook' },
    { icono: 'TikTok', url: '#', label: 'TikTok' }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Page Header */}
      <section className="py-16 md:py-20 text-center">
        <div className="max-w-4xl mx-auto px-5 md:px-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-xs uppercase tracking-[0.3em] text-primary mb-4 block font-label-caps">
              Escríbenos
            </span>
            <h1 className="font-display-lg text-display-lg md:text-primary mb-4">
              Ponte en Contacto
            </h1>
            <p className="font-body-lg text-body-lg text-text-main max-w-2xl mx-auto">
              Nos encantaría saber de ti. Si tienes preguntas, comentarios o simplemente
              quieres saludar, no dudes en escribirnos.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-5 md:px-16 pb-24">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Formulario */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-pure-white rounded-lg p-8 shadow-card border border-outline-variant/20"
          >
            <h2 className="font-headline-sm text-headline-sm text-on-surface mb-6">
              Envíanos un mensaje
            </h2>

            <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block font-body-sm text-body-sm text-text-main mb-2 font-medium">Nombre</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 bg-surface rounded-lg border border-outline-variant text-on-surface placeholder-outline focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-body-sm"
                    placeholder="Tu nombre"
                  />
                </div>
                <div>
                  <label className="block font-body-sm text-body-sm text-text-main mb-2 font-medium">Email</label>
                  <input
                    type="email"
                    required
                    className="w-full px-4 py-3 bg-surface rounded-lg border border-outline-variant text-on-surface placeholder-outline focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-body-sm"
                    placeholder="tu@email.com"
                  />
                </div>
              </div>

              <div>
                <label className="block font-body-sm text-body-sm text-text-main mb-2 font-medium">Asunto</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 bg-surface rounded-lg border border-outline-variant text-on-surface placeholder-outline focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-body-sm"
                  placeholder="¿En qué podemos ayudarte?"
                />
              </div>

              <div>
                <label className="block font-body-sm text-body-sm text-text-main mb-2 font-medium">Mensaje</label>
                <textarea
                  rows={5}
                  required
                  className="w-full px-4 py-3 bg-surface rounded-lg border border-outline-variant text-on-surface placeholder-outline focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-none font-body-sm"
                  placeholder="Escribe tu mensaje aquí..."
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-primary text-on-primary font-label-caps text-label-caps rounded-lg hover:bg-tertiary transition-colors shadow-sm"
              >
                ENVIAR MENSAJE
              </button>
            </form>
          </motion.div>

          {/* Info column */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col gap-10"
          >
            {/* Info items */}
            <div className="space-y-6">
              {infoItems.map((item, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-primary text-[22px]">{item.icono}</span>
                  </div>
                  <div>
                    <h3 className="font-body-md text-body-md text-on-surface font-semibold mb-1">{item.titulo}</h3>
                    {item.lineas.map((linea, i) => (
                      <p key={i} className="font-body-sm text-body-sm text-text-main">{linea}</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Mapa */}
            <div className="rounded-lg overflow-hidden border border-outline-variant/20 aspect-[16/10]">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d63635.33!2d-75.7!3d4.81!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e38876f90f3e8f7%3A0x67f9a36d1b0a5d67!2sPereira%2C%20Risaralda%2C%20Colombia!5e0!3m2!1ses!2sco!4v1699999999999!5m2!1ses!2sco"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Ubicación Adi Estilos"
              />
            </div>

            {/* Social links */}
            <div className="text-center">
              <p className="font-body-sm text-body-sm text-outline mb-4">Síguenos</p>
              <div className="flex items-center justify-center gap-4">
                {redesSociales.map((red) => (
                  <a
                    key={red.label}
                    href={red.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full border border-outline-variant text-outline flex items-center justify-center hover:border-primary hover:text-primary hover:bg-primary/5 transition-all"
                    aria-label={red.label}
                  >
                    <span className="font-body-sm text-body-sm font-semibold">{red.icono[0]}</span>
                  </a>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ContactoPage;
