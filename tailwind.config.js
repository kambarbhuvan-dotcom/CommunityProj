/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Sky-Inspired White & Blue Theme Palette
        'pure-white': '#FFFFFF',
        'sky-blue': '#87CEEB',
        'primary-blue': '#2563EB',
        'deep-sky': '#0EA5E9',
        'pale-blue': '#EAF6FF',
        'ice-blue': '#F4FAFF',
        'navy-blue': '#153B65',
        'slate-grey': '#64748B',
        'border-blue': '#DCEBFA',
        'soft-green': '#22C55E',

        // Primary Blue family
        primary: {
          DEFAULT: '#2563EB',
          50: '#F4FAFF',
          100: '#EAF6FF',
          200: '#DCEBFA',
          300: '#87CEEB',
          400: '#38BDF8',
          500: '#2563EB',
          600: '#1D4ED8',
          700: '#153B65',
          800: '#0F2B48',
          900: '#0A1C30',
        },

        // Sky & Deep Sky
        sky: {
          DEFAULT: '#87CEEB',
          50: '#F4FAFF',
          100: '#EAF6FF',
          200: '#DCEBFA',
          300: '#BAE6FD',
          400: '#87CEEB',
          500: '#0EA5E9',
          600: '#0284C7',
          700: '#0369A1',
          800: '#075985',
          900: '#0C4A6E',
        },

        // Navy Blue
        navy: {
          DEFAULT: '#153B65',
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#153B65',
        },

        // Slate Grey
        slate: {
          DEFAULT: '#64748B',
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
        },

        // Themed mappings for backward-compatible classes
        forest: {
          DEFAULT: '#2563EB',
          50: '#EAF6FF',
          100: '#DCEBFA',
          200: '#BAE6FD',
          300: '#87CEEB',
          400: '#38BDF8',
          500: '#2563EB',
          600: '#1D4ED8',
          700: '#153B65',
          800: '#0F2B48',
          900: '#0A1C30',
        },
        solar: {
          DEFAULT: '#0EA5E9',
          50: '#F0F9FF',
          100: '#E0F2FE',
          200: '#BAE6FD',
          300: '#87CEEB',
          400: '#38BDF8',
          500: '#0EA5E9',
          600: '#0284C7',
          700: '#0369A1',
          800: '#075985',
          900: '#0C4A6E',
        },
        charcoal: {
          DEFAULT: '#153B65',
          500: '#153B65',
          400: '#334155',
          300: '#64748B',
          200: '#94A3B8',
          100: '#DCEBFA',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        card: '0 2px 10px -2px rgba(21, 59, 101, 0.05), 0 1px 4px -1px rgba(21, 59, 101, 0.03)',
        'card-hover': '0 10px 25px -4px rgba(37, 99, 235, 0.12), 0 4px 10px -2px rgba(21, 59, 101, 0.05)',
        sidebar: '1px 0 0 0 #DCEBFA',
      },
      borderRadius: {
        xl: '12px',
        '2xl': '16px',
        '3xl': '20px',
      },
    },
  },
  plugins: [],
}
