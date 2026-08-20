import React from 'react';
import { FaMapMarkerAlt, FaEnvelope, FaPhone } from 'react-icons/fa';

const ContactoPage = () => {
  return (
    <div className="bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-extrabold text-gray-800 tracking-tight">Ponte en Contacto</h1>
          <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
            Nos encantaría saber de ti. Si tienes preguntas, comentarios o simplemente quieres saludar, no dudes en escribirnos.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 bg-white p-8 rounded-2xl shadow-xl">
          {/* Columna de Información */}
          <div className="flex flex-col justify-between">
            <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Información de Contacto</h2>
                <div className="space-y-6">
                    <div className="flex items-start space-x-4">
                        <div className="bg-pink-200 p-3 rounded-full text-pink-700">
                            <FaMapMarkerAlt size={24} />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800">Nuestra Tienda</h3>
                            <p className="text-gray-600">Av. Siempre Viva 742, Springfield</p>
                            <a href="#" className="text-pink-600 hover:text-pink-800 transition-colors mt-1 inline-block">Ver en el mapa</a>
                        </div>
                    </div>
                    <div className="flex items-start space-x-4">
                        <div className="bg-pink-200 p-3 rounded-full text-pink-700">
                            <FaEnvelope size={24} />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800">Correo Electrónico</h3>
                            <p className="text-gray-600">hola@adiestilos.com</p>
                        </div>
                    </div>
                    <div className="flex items-start space-x-4">
                        <div className="bg-pink-200 p-3 rounded-full text-pink-700">
                            <FaPhone size={24} />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800">Teléfono</h3>
                            <p className="text-gray-600">(+51) 987 654 321</p>
                        </div>
                    </div>
                </div>
            </div>
            {/* Placeholder para mapa o imagen */}
            <div className="mt-8 h-64 bg-pink-100 rounded-lg flex items-center justify-center text-pink-400">
                {/* Aquí podrías insertar un mapa de Google Maps */}
                <FaMapMarkerAlt size={60} />
                <p className='ml-4 font-semibold'>Mapa de ubicación</p>
            </div>
          </div>

          {/* Columna del Formulario */}
          <div className="bg-gray-50 p-8 rounded-xl shadow-inner">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Envíanos un Mensaje</h2>
            <form action="#" method="POST" className="space-y-6">
              <div>
                <label htmlFor="name" className="text-sm font-semibold text-gray-700">Nombre Completo</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="mt-2 block w-full px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition"
                  placeholder="Tu nombre"
                />
              </div>
              <div>
                <label htmlFor="email" className="text-sm font-semibold text-gray-700">Correo Electrónico</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="mt-2 block w-full px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition"
                  placeholder="tu@email.com"
                />
              </div>
              <div>
                <label htmlFor="message" className="text-sm font-semibold text-gray-700">Mensaje</label>
                <textarea
                  id="message"
                  name="message"
                  rows="5"
                  className="mt-2 block w-full px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition"
                  placeholder="Escribe tu mensaje aquí..."
                ></textarea>
              </div>
              <div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-lg font-semibold text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 transition-transform transform hover:scale-105"
                >
                  Enviar Mensaje
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactoPage;
