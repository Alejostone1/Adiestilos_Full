import { useEffect } from 'react';

const BASE_URL = 'https://www.adiestilos.top';

/**
 * Actualiza title, meta description y canonical según la ruta actual.
 * Necesario porque la SPA sirve el mismo index.html para todas las rutas
 * (ver rewrite en vercel.json), así que sin esto Google vería el mismo
 * canonical/title en todas las páginas.
 */
export default function useSeo({ title, description, path }) {
  useEffect(() => {
    if (title) document.title = title;

    if (description) {
      let meta = document.querySelector('meta[name="description"]');
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', 'description');
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', description);
    }

    if (path) {
      let canonical = document.querySelector('link[rel="canonical"]');
      if (!canonical) {
        canonical = document.createElement('link');
        canonical.setAttribute('rel', 'canonical');
        document.head.appendChild(canonical);
      }
      canonical.setAttribute('href', `${BASE_URL}${path}`);
    }
  }, [title, description, path]);
}
