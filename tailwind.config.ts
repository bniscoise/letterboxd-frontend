import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        monokai: {
          background: '#272822',
          surface: '#1e1f1c',
          surfaceHighlight: '#2d2e2a',
          accent: '#fd971f',
          yellow: '#e6db74',
          green: '#a6e22e',
          cyan: '#66d9ef',
          pink: '#f92672',
          purple: '#ae81ff',
          text: '#f8f8f2',
          muted: '#75715e',
          border: '#3e3d32'
        }
      },
      boxShadow: {
        monokai: '0 10px 25px -15px rgba(253, 151, 31, 0.45)'
      }
    }
  },
  plugins: []
};

export default config;
