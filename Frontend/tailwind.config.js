/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // ADI ESTILOS Design System
        'primary': '#a73162',
        'on-primary': '#ffffff',
        'primary-container': '#ff76a8',
        'on-primary-container': '#76013d',
        'primary-fixed': '#ffd9e2',
        'primary-fixed-dim': '#ffb1c8',
        'inverse-primary': '#ffb1c8',

        'secondary': '#814f64',
        'on-secondary': '#ffffff',
        'secondary-container': '#fdbdd5',
        'on-secondary-container': '#7a495e',
        'secondary-fixed': '#ffd8e5',
        'secondary-fixed-dim': '#f4b5cd',

        'tertiary': '#ab2a63',
        'on-tertiary': '#ffffff',
        'tertiary-container': '#ff76a8',
        'on-tertiary-container': '#76003d',

        'surface': '#fff7fa',
        'surface-dim': '#dfd8db',
        'surface-bright': '#fff7fa',
        'surface-container-lowest': '#ffffff',
        'surface-container-low': '#f9f2f5',
        'surface-container': '#f4ecef',
        'surface-container-high': '#eee6e9',
        'surface-container-highest': '#e8e0e3',
        'surface-soft': '#FFDAE8',
        'surface-variant': '#e8e0e3',
        'surface-tint': '#a73162',

        'on-surface': '#1e1b1d',
        'on-surface-variant': '#564147',
        'on-background': '#1e1b1d',

        'background': '#fff7fa',
        'text-main': '#5A4650',

        'outline': '#897177',
        'outline-variant': '#dcbfc6',

        'inverse-surface': '#332f32',
        'inverse-on-surface': '#f7eff2',

        'error': '#ba1a1a',
        'error-container': '#ffdad6',
        'on-error': '#ffffff',
        'on-error-container': '#93000a',

        'pure-white': '#FFFFFF',
      },

      borderRadius: {
        'sm': '0.25rem',
        'DEFAULT': '0.5rem',
        'md': '0.75rem',
        'lg': '1rem',
        'xl': '1.5rem',
        'full': '9999px',
      },

      spacing: {
        'unit': '4px',
        'gutter': '24px',
        'margin-desktop': '64px',
        'margin-mobile': '20px',
        'container-max': '1280px',
      },

      fontFamily: {
        'display-lg': ['Playfair Display'],
        'display-lg-mobile': ['Playfair Display'],
        'headline-md': ['Playfair Display'],
        'headline-sm': ['Playfair Display'],
        'body-lg': ['Montserrat'],
        'body-md': ['Montserrat'],
        'body-sm': ['Montserrat'],
        'label-caps': ['Montserrat'],
      },

      fontSize: {
        'display-lg': ['48px', { lineHeight: '56px', letterSpacing: '-0.02em', fontWeight: '700' }],
        'display-lg-mobile': ['32px', { lineHeight: '40px', fontWeight: '700' }],
        'headline-md': ['32px', { lineHeight: '40px', fontWeight: '600' }],
        'headline-sm': ['24px', { lineHeight: '32px', fontWeight: '600' }],
        'body-lg': ['18px', { lineHeight: '28px', fontWeight: '400' }],
        'body-md': ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'body-sm': ['14px', { lineHeight: '20px', fontWeight: '400' }],
        'label-caps': ['12px', { lineHeight: '16px', letterSpacing: '0.1em', fontWeight: '600' }],
      },

      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },

      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },

      boxShadow: {
        'soft-primary': '0 20px 50px rgba(255, 118, 168, 0.05)',
        'card': '0 20px 50px rgba(255, 118, 168, 0.03)',
        'card-hover': '0 20px 50px rgba(255, 118, 168, 0.08)',
        'elevated': '0 30px 60px rgba(255, 118, 168, 0.08)',
        'nav': '0 15px 30px rgba(255, 118, 168, 0.06)',
        'button': '0 10px 30px rgba(255, 118, 168, 0.2)',
        'button-hover': '0 15px 40px rgba(255, 118, 168, 0.4)',
      },
    },
  },
  plugins: [],
}
