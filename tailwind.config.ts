import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        folha: {
          DEFAULT: '#1A5C3A',
          light: '#2D8A58',
          muted: '#A8C9B5',
        },
        ipe: {
          DEFAULT: '#E8B84A',
          soft: '#F5D98A',
        },
        laterita: {
          DEFAULT: '#B54A2A',
          soft: '#D4785C',
        },
        rio: {
          DEFAULT: '#2A6B7C',
          soft: '#7BA8B5',
        },
        tinta: {
          DEFAULT: '#1C2B22',
          muted: '#4A5C52',
          faint: '#7A8B82',
        },
        sol: {
          DEFAULT: '#F3F6F1',
          card: '#FFFFFF',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 8px 30px rgba(28, 43, 34, 0.08)',
      },
    },
  },
  plugins: [],
};

export default config;
